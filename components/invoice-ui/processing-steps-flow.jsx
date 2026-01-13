"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";

import "@xyflow/react/dist/style.css";
import {
  Background,
  Position,
  ReactFlow,
  useEdgesState,
  useNodesState,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react";

import { ProcessMessage } from "./process-message";
import { cn, isProcessing } from "@/lib/utils";
import { useTheme } from "next-themes";
import { CustomNode, FakeNode } from "./react-flow/CustomNode";
import { CustomNodeHandles } from "./react-flow/CustomNodeHandles";
import { CustomEdges } from "./react-flow/CustomEdges";
import { layoutGraph } from "./react-flow";
import {
  Empty,
  EmptyMedia,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
} from "../ui/empty";
import {
  FileQuestionMarkIcon,
  PlayIcon,
  PauseIcon,
  SquareIcon,
  RotateCcwIcon,
  PlusIcon,
  MinusIcon,
  MaximizeIcon,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const FlowContext = createContext(null);
export const useProcessingStepsFlow = () => useContext(FlowContext);

const nodeTypes = {
  step: ({ data, id, width, height }) => {
    const { activeNodeId, setActiveNodeId } = useProcessingStepsFlow();
    const isActive = activeNodeId === id;

    return (
      <>
        <CustomNodeHandles type="target" position={Position.Top} node={data} />

        <CustomNode
          data={data}
          onClick={() => setActiveNodeId(id)}
          isActive={isActive}
          style={{ width, height }}
        />

        <CustomNodeHandles
          type="source"
          position={Position.Bottom}
          node={data}
        />
      </>
    );
  },
};

const edgeTypes = {
  processEdge: CustomEdges,
};

export const ProcessingStepsFlowProvider = ({
  children,
  dag_nodes = [],
  dag_edges = [],
}) => {
  const [nodeSizes, setNodeSizes] = useState(new Map());
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [activeNodeId, setActiveNodeId] = useState(null);
  const [executionEdges, setExecutionEdges] = useState(new Map());
  const [isPlaybackActive, setIsPlaybackActive] = useState(false);

  const registerSize = (id, size) => {
    setNodeSizes((prev) => {
      const m = new Map(prev);
      m.set(id, size);
      return m;
    });
  };

  const drawGraph = useCallback((builtNodes, builtEdges) => {
    layoutGraph(builtNodes, builtEdges).then(
      ({ nodes, edges, executionEdges }) => {
        setNodes(nodes);
        setEdges(edges);
        setActiveNodeId(nodes[0]?.id || null);
        setExecutionEdges(executionEdges);
      }
    );
  }, []);

  useEffect(() => {
    if (!dag_nodes.length) return;
    if (nodeSizes.size !== dag_nodes.length) return;

    const ioCount = new Map();

    const builtEdges = dag_edges.map((e) => {
      const incomingCount = ioCount.get(e.target + "_in") || 0;
      const outgoingCount = ioCount.get(e.source + "_out") || 0;

      ioCount.set(e.target + "_in", incomingCount + 1);
      ioCount.set(e.source + "_out", outgoingCount + 1);

      return {
        id: e.id,
        type: "processEdge",
        source: e.source,
        target: e.target,
        data: {
          path: "smoothstep",
          label: e.label,
        },
      };
    });

    const builtNodes = dag_nodes.map((n) => ({
      id: n.id,
      type: "step",
      position: { x: 0, y: 0 },
      data: {
        ...n.data,
        name: (n.data?.label || "").replace(/_/g, " "),
        incomingEdgesCount: ioCount.get(n.id + "_in") || 0,
        outgoingEdgesCount: ioCount.get(n.id + "_out") || 0,
      },
      measured: nodeSizes.get(n.id),
    }));

    drawGraph(builtNodes, builtEdges);
  }, [nodeSizes, dag_nodes, dag_edges]);

  return (
    <FlowContext.Provider
      value={{
        nodes,
        edges,
        activeNodeId,
        setActiveNodeId,
        registerSize,
        onNodesChange,
        onEdgesChange,
        drawGraph,
        executionEdges,
        isPlaybackActive,
        setIsPlaybackActive,
      }}
    >
      {children}

      {dag_nodes.map((n) => (
        <FakeNode
          registerSize={registerSize}
          key={n.id}
          id={n.id}
          data={n.data}
        />
      ))}
    </FlowContext.Provider>
  );
};

const FlowInner = () => {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    activeNodeId,
    isPlaybackActive,
  } = useProcessingStepsFlow();
  const containerRef = useRef(null);
  const flowRef = useRef(null);
  const instanceRef = useRef(null);

  const adjustViewport = useCallback(() => {
    if (!instanceRef.current) return;
    if (!nodes.length) return;

    let targetNode = [...nodes].sort((a, b) => a.position.y - b.position.y)[0];
    const processingNode = nodes.find((n) => isProcessing(n.data.status));
    const activeNode = nodes.find((n) => n.id === activeNodeId);
    let zoom = 0.5;

    if (processingNode) {
      targetNode = processingNode;
      zoom = 0.8;
    } else if (activeNode) {
      targetNode = activeNode;
      zoom = 0.8;
    }

    if (!targetNode) return;
    const paddingTop = 40;

    const viewportWidth = flowRef.current.clientWidth;
    const x = targetNode.position.x;
    const y = targetNode.position.y;
    const nodeCenterX = x + targetNode.measured?.width / 2;
    const translateX = viewportWidth / 2 - nodeCenterX * zoom;

    const translateY = paddingTop - y * zoom;

    instanceRef.current.setViewport(
      {
        x: translateX,
        y: translateY,
        zoom,
      },
      { duration: 300 }
    );
  }, [nodes, activeNodeId]);

  useEffect(() => {
    adjustViewport();
  }, [nodes, adjustViewport]);

  const onInit = (instance) => {
    instanceRef.current = instance;
    adjustViewport();
  };

  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <div className="w-full h-full relative" ref={containerRef}>
      <ReactFlow
        ref={flowRef}
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.1 }}
        onInit={onInit}
        className={cn(isDark && "dark")}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        minZoom={0.1}
        nodesDraggable={false}
        nodesConnectable={false}
        zoomOnScroll={!isPlaybackActive}
        zoomOnPinch={!isPlaybackActive}
        zoomOnDoubleClick={!isPlaybackActive}
        panOnDrag={!isPlaybackActive}
        panOnScroll={!isPlaybackActive}
      >
        <Background variant="dots" />
        <CustomControlPanel />
      </ReactFlow>
    </div>
  );
};

// Custom Control Panel with integrated play button
const CustomControlPanel = () => {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const { isPlaybackActive, executionEdges } = useProcessingStepsFlow();

  const hasSteps = executionEdges && executionEdges.size > 0;

  // Control button base styles matching React Flow Controls
  const controlBtnClass = cn(
    "react-flow__controls-button",
    "flex items-center justify-center w-[26px] h-[26px]",
    "bg-background border-b border-border/50",
    "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
    "transition-colors disabled:opacity-40 disabled:pointer-events-none",
    "[&_svg]:size-3 [&_svg]:fill-current"
  );

  return (
    <div className="absolute bottom-0 left-0 z-10 flex items-end m-[10px] gap-0">
      {/* Controls Panel */}
      <div
        className={cn(
          "flex flex-col rounded-md overflow-hidden border border-border/50 shadow-sm",
          "[&>button:last-child]:border-b-0"
        )}
      >
        {/* Zoom In */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => zoomIn({ duration: 300 })}
              disabled={isPlaybackActive}
              className={controlBtnClass}
            >
              <PlusIcon />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">Zoom in</TooltipContent>
        </Tooltip>

        {/* Zoom Out */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => zoomOut({ duration: 300 })}
              disabled={isPlaybackActive}
              className={controlBtnClass}
            >
              <MinusIcon />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">Zoom out</TooltipContent>
        </Tooltip>

        {/* Fit View */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => fitView({ duration: 300 })}
              disabled={isPlaybackActive}
              className={controlBtnClass}
            >
              <MaximizeIcon />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">Fit view</TooltipContent>
        </Tooltip>

        {/* Play Button - Only if has steps */}
        {hasSteps && <PlayButton controlBtnClass={controlBtnClass} />}
      </div>

      {/* Player Expansion Panel */}
      {hasSteps && <PlayerExpansionPanel />}
    </div>
  );
};

// Play button component
const PlayButton = ({ controlBtnClass }) => {
  const { playbackStatus, handlePlay, handlePause, handleResume } =
    usePlaybackControls();

  const isPlaying = playbackStatus === "playing";
  const isPaused = playbackStatus === "paused";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={
            isPlaying ? handlePause : isPaused ? handleResume : handlePlay
          }
          className={controlBtnClass}
        >
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </button>
      </TooltipTrigger>
      <TooltipContent side="right">
        {isPlaying ? "Pause" : isPaused ? "Resume" : "Play steps"}
      </TooltipContent>
    </Tooltip>
  );
};

// Player expansion panel with stop, restart, progress
const PlayerExpansionPanel = () => {
  const {
    playbackStatus,
    currentStep,
    totalSteps,
    progress,
    remainingTime,
    handleStop,
    handlePlay,
  } = usePlaybackControls();

  const isPlaying = playbackStatus === "playing";
  const isPaused = playbackStatus === "paused";
  const showDetails = isPlaying || isPaused;

  const panelBtnClass = cn(
    "flex items-center justify-center w-[26px] h-[26px]",
    "bg-secondary border-l border-border/50",
    "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
    "transition-colors",
    "[&_svg]:size-3 [&_svg]:fill-current"
  );

  return (
    <div
      className={cn(
        "-ml-0.5 flex items-end overflow-hidden transition-all duration-200 ease-out",
        showDetails ? "opacity-100" : "w-0 opacity-0"
      )}
    >
      <div className="flex items-center h-[28px] bg-secondary border border-l-0 border-border/50 rounded-r-md overflow-hidden shadow-sm">
        {/* Stop Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleStop}
              className={panelBtnClass}
              tabIndex={showDetails ? 0 : -1}
            >
              <SquareIcon className="size-2.5!" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">Stop</TooltipContent>
        </Tooltip>

        {/* Restart Button - Only when paused */}
        <div
          className={cn(
            "transition-all duration-200 ease-out overflow-hidden",
            isPaused ? "w-[26px] opacity-100" : "w-0 opacity-0"
          )}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handlePlay}
                className={cn(panelBtnClass, "border-l-0")}
                tabIndex={isPaused ? 0 : -1}
              >
                <RotateCcwIcon />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">Restart</TooltipContent>
          </Tooltip>
        </div>

        {/* Progress Section */}
        <div className="flex items-center gap-1.5 h-full px-2 border-l border-border/50">
          <span className="text-[10px] text-muted-foreground font-medium tabular-nums whitespace-nowrap">
            {currentStep + 1}/{totalSteps}
          </span>
          <div className="relative w-10 h-1 bg-accent/40 rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-muted-foreground/60 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-[10px] text-muted-foreground tabular-nums">
            {Math.ceil(remainingTime / 1000)}s
          </span>
        </div>
      </div>
    </div>
  );
};

// Hook for playback controls (to share state between PlayButton and PlayerExpansionPanel)
const PlaybackContext = createContext(null);

const PlaybackProvider = ({ children }) => {
  const INTERVAL_DURATION = 5000;

  const [status, setStatus] = useState("stopped");
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [remainingTime, setRemainingTime] = useState(INTERVAL_DURATION);

  const { executionEdges, setActiveNodeId, setIsPlaybackActive } =
    useProcessingStepsFlow();

  const intervalRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const pausedTimeRef = useRef(null);
  const pausedProgressRef = useRef(0);

  const nodeIds = useMemo(() => {
    if (!executionEdges || executionEdges.size === 0) return [];
    const ids = [];
    const keys = Array.from(executionEdges.keys());
    keys.forEach((key) => {
      const [source] = key.split("-->");
      if (!ids.includes(source)) ids.push(source);
    });
    if (keys.length > 0) {
      const lastKey = keys[keys.length - 1];
      const [, target] = lastKey.split("-->");
      if (target && target !== "finish" && !ids.includes(target))
        ids.push(target);
    }
    return ids;
  }, [executionEdges]);

  const totalSteps = nodeIds.length;

  const clearAllIntervals = useCallback(() => {
    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
      intervalRef.current = null;
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  const startProgressTimer = useCallback((duration, initialProgress = 0) => {
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    const startTime = Date.now();
    const endTime = startTime + duration;
    const totalDuration = INTERVAL_DURATION;
    progressIntervalRef.current = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, endTime - now);
      const elapsed = duration - remaining;
      const currentProgress = Math.min(
        100,
        initialProgress + (elapsed / totalDuration) * 100
      );
      setProgress(currentProgress);
      setRemainingTime(remaining);
      if (remaining <= 0) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    }, 50);
  }, []);

  const scheduleNextStep = useCallback(
    (stepIndex, duration = INTERVAL_DURATION) => {
      clearAllIntervals();
      if (stepIndex >= totalSteps) {
        setStatus("stopped");
        setIsPlaybackActive(false);
        setCurrentStep(0);
        setProgress(0);
        setRemainingTime(INTERVAL_DURATION);
        pausedTimeRef.current = null;
        pausedProgressRef.current = 0;
        if (nodeIds[0]) setActiveNodeId(nodeIds[0]);
        return;
      }
      if (nodeIds[stepIndex]) setActiveNodeId(nodeIds[stepIndex]);
      setCurrentStep(stepIndex);
      setProgress(0);
      setRemainingTime(duration);
      startProgressTimer(duration, 0);
      intervalRef.current = setTimeout(() => {
        scheduleNextStep(stepIndex + 1);
      }, duration);
    },
    [
      totalSteps,
      nodeIds,
      setActiveNodeId,
      setIsPlaybackActive,
      clearAllIntervals,
      startProgressTimer,
    ]
  );

  const handlePlay = useCallback(() => {
    if (totalSteps === 0) return;
    clearAllIntervals();
    setStatus("playing");
    setIsPlaybackActive(true);
    pausedTimeRef.current = null;
    pausedProgressRef.current = 0;
    scheduleNextStep(0);
  }, [totalSteps, clearAllIntervals, setIsPlaybackActive, scheduleNextStep]);

  const handleResume = useCallback(() => {
    if (totalSteps === 0) return;
    const remaining = pausedTimeRef.current || INTERVAL_DURATION;
    const savedProgress = pausedProgressRef.current || 0;
    clearAllIntervals();
    setStatus("playing");
    setIsPlaybackActive(true);
    startProgressTimer(remaining, savedProgress);
    intervalRef.current = setTimeout(() => {
      scheduleNextStep(currentStep + 1);
    }, remaining);
  }, [
    totalSteps,
    currentStep,
    clearAllIntervals,
    setIsPlaybackActive,
    scheduleNextStep,
    startProgressTimer,
  ]);

  const handlePause = useCallback(() => {
    pausedTimeRef.current = remainingTime;
    pausedProgressRef.current = progress;
    clearAllIntervals();
    setStatus("paused");
    setIsPlaybackActive(false);
  }, [clearAllIntervals, remainingTime, progress, setIsPlaybackActive]);

  const handleStop = useCallback(() => {
    clearAllIntervals();
    setStatus("stopped");
    setIsPlaybackActive(false);
    setCurrentStep(0);
    setProgress(0);
    setRemainingTime(INTERVAL_DURATION);
    pausedTimeRef.current = null;
    pausedProgressRef.current = 0;
    if (nodeIds[0]) setActiveNodeId(nodeIds[0]);
  }, [clearAllIntervals, nodeIds, setActiveNodeId, setIsPlaybackActive]);

  useEffect(() => {
    return () => {
      clearAllIntervals();
      setIsPlaybackActive(false);
    };
  }, [clearAllIntervals, setIsPlaybackActive]);

  return (
    <PlaybackContext.Provider
      value={{
        playbackStatus: status,
        currentStep,
        totalSteps,
        progress,
        remainingTime,
        handlePlay,
        handleResume,
        handlePause,
        handleStop,
      }}
    >
      {children}
    </PlaybackContext.Provider>
  );
};

const usePlaybackControls = () => useContext(PlaybackContext);

export const ProcessingStepsFlow = () => (
  <ReactFlowProvider>
    <PlaybackProvider>
      <FlowInner />
    </PlaybackProvider>
  </ReactFlowProvider>
);

export const ActiveProcessMessage = () => {
  const { nodes, activeNodeId } = useProcessingStepsFlow();
  const node = nodes.find((n) => n.id === activeNodeId);

  const log = node?.data?.extraMetadata || {
    markdown: node?.data?.log || "No logs",
  };

  if (!node?.data?.log) {
    return (
      <Empty className="h-full text-sm">
        <EmptyMedia variant="icon">
          <FileQuestionMarkIcon />
        </EmptyMedia>
        <EmptyHeader>
          <EmptyTitle>No logs available</EmptyTitle>
          <EmptyDescription>No logs available.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return <ProcessMessage message={{ extraMetadata: log }} />;
};
