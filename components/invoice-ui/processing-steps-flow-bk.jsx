"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useLayoutEffect,
  useCallback,
} from "react";
import ELK from "elkjs/lib/elk.bundled.js";

import "@xyflow/react/dist/style.css";
import {
  Background,
  Position,
  ReactFlow,
  useEdgesState,
  useNodesState,
  ReactFlowProvider,
  Controls,
} from "@xyflow/react";

import {
  BaseNode,
  BaseNodeContent,
  BaseNodeHeader,
  BaseNodeHeaderTitle,
} from "../base-node";
import { ProcessStatusBadge } from "./process-status-badge";
import { PROCESS_STATUS } from "@/app/constants";
import { DataEdge } from "../data-edge";
import { BaseHandle } from "../base-handle";
import { ProcessMessage } from "./process-message";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import {
  cn,
  isFailedProcessing,
  isProcessing,
  isSkippedProcessing,
  isSuccessProcessing,
} from "@/lib/utils";
import { forwardRef } from "react";
import { useTheme } from "next-themes";

const FlowContext = createContext(null);
export const useProcessingStepsFlow = () => useContext(FlowContext);

const NodeContent = forwardRef(({ data, ...props }, ref) => (
  <BaseNode ref={ref} {...props}>
    <BaseNodeHeader>
      <BaseNodeHeaderTitle>{data.name}</BaseNodeHeaderTitle>
    </BaseNodeHeader>

    <BaseNodeContent className="border-t dark:border-white/80">
      {data.description}

      <ProcessStatusBadge status={data.status} className="text-sm" />
    </BaseNodeContent>
  </BaseNode>
));
NodeContent.displayName = "NodeContent";

const NodeHandles = ({ count, type, position }) => {
  if (count === 0) return null;

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <BaseHandle
          key={index}
          id={`${type}-${index}`}
          type={type}
          position={position}
          isConnectable={false}
          style={{ visibility: "hidden" }}
        />
      ))}
    </>
  );
};

const nodeTypes = {
  step: ({ data, id, width }) => {
    const { activeNodeId, setActiveNodeId } = useProcessingStepsFlow();
    const isActive = activeNodeId === id;
    const isSkipped = isSkippedProcessing(data.status);

    const Content = (
      <NodeContent
        data={data}
        style={{ width }}
        className={cn(
          isActive && "node-active-gradient",
          !isActive && isProcessing(data.status) && "node-processing-border",
          isFailedProcessing(data.status) && !isActive && "node-failed",
          isSkipped && "node-skipped",
          isSuccessProcessing(data.status) && !isActive && "node-success"
        )}
        onClick={() => !isSkipped && setActiveNodeId(id)}
      />
    );

    return (
      <>
        <NodeHandles
          count={data.incomingEdgesCount}
          type="target"
          position={Position.Top}
        />
        {!isSkipped ? (
          <Tooltip>
            <TooltipTrigger asChild>{Content}</TooltipTrigger>
            <TooltipContent>Click to view logs</TooltipContent>
          </Tooltip>
        ) : (
          Content
        )}

        <NodeHandles
          count={data.outgoingEdgesCount}
          type="source"
          position={Position.Bottom}
        />
      </>
    );
  },
};

const ElkEdge = ({ id, data, style, sourceX, sourceY, targetX, targetY }) => {
  const { elkRouting } = data || {};
  const strokeColor = style?.stroke || "var(--color-muted-foreground)";
  const strokeWidth = style?.strokeWidth || 4;

  if (!elkRouting || !elkRouting.sections || elkRouting.sections.length === 0) {
    return (
      <DataEdge
        id={id}
        data={data}
        style={style}
        sourceX={sourceX}
        sourceY={sourceY}
        targetX={targetX}
        targetY={targetY}
      />
    );
  }

  const generatePath = (section) => {
    if (!section.startPoint || !section.endPoint) return "";

    const { startPoint, bendPoints = [], endPoint } = section;
    const points = [startPoint, ...bendPoints, endPoint];

    if (points.length === 0) return "";

    let path = `M ${startPoint.x} ${startPoint.y}`;

    points.slice(1).forEach((point) => {
      path += ` L ${point.x} ${point.y}`;
    });

    return path;
  };

  return (
    <>
      <g>
        {elkRouting.sections.map((section, index) => {
          const path = generatePath(section);
          if (!path) return null;

          return (
            <path
              key={`${id}-section-${index}`}
              d={path}
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          );
        })}
      </g>
      {elkRouting.labels && elkRouting.labels.length > 0 && (
        <g>
          {elkRouting.labels.map((label, index) => {
            if (label.x === undefined || label.y === undefined || !label.text)
              return null;

            const labelHeight = (label.height ?? 16) + 2;
            const labelWidth = label.width || 100;

            return (
              <foreignObject
                key={`${id}-label-${index}`}
                x={label.x - labelWidth / 2}
                y={label.y - labelHeight / 2}
                width={labelWidth}
                height={labelHeight}
                style={{ overflow: "visible", pointerEvents: "none" }}
              >
                <div className="border bg-foreground text-background px-2 py-1 rounded-md text-xs whitespace-nowrap">
                  {label.text}
                </div>
              </foreignObject>
            );
          })}
        </g>
      )}
    </>
  );
};

const edgeTypes = {
  processEdge: (props) => {
    const hasElkRouting = props.data?.elkRouting?.sections?.length > 0;

    if (hasElkRouting) {
      return (
        <ElkEdge
          {...props}
          style={{
            strokeWidth: 4,
            stroke: "var(--color-muted-foreground)",
          }}
        />
      );
    }

    return (
      <DataEdge
        {...props}
        style={{
          strokeWidth: 4,
          stroke: "var(--color-muted-foreground)",
        }}
      />
    );
  },
};

const FakeNode = ({ id, data }) => {
  const ref = useRef(null);
  const { registerSize } = useProcessingStepsFlow();

  useLayoutEffect(() => {
    requestAnimationFrame(() => {
      if (!ref.current) return;

      registerSize(id, {
        width: ref.current.offsetWidth,
        height: ref.current.offsetHeight,
      });
    });
  }, []);

  return (
    <div
      style={{
        visibility: "hidden",
        position: "absolute",
        left: -9999,
        top: 0,
      }}
    >
      <NodeContent
        ref={ref}
        data={data}
        style={{ minWidth: 250, maxWidth: 400 }}
      />
    </div>
  );
};

const elk = new ELK();

const getTextWidth = (text, font) => {
  const context = document.createElement("canvas").getContext("2d");

  if (context) {
    context.font = font;
    const metrics = context.measureText(text);

    return metrics.width > 200 ? metrics.width : 200;
  }

  const length = text.length * 9;

  return length > 200 ? length : 200;
};

const formatElkEdge = (edge, font) => {
  const elkEdgeId = `${edge.source}-${edge.target}`;
  const formattedEdge = {
    id: elkEdgeId,
    sources: [edge.source],
    targets: [edge.target],
  };

  if (edge.data?.label) {
    formattedEdge.labels = [
      {
        height: 16,
        id: edge.data.label,
        text: edge.data.label,
        width: getTextWidth(edge.data.label, font),
      },
    ];
  }

  return formattedEdge;
};

const layoutGraph = async (nodes, edges) => {
  const font = `bold 16px ${
    globalThis.getComputedStyle(document.body).fontFamily
  }`;
  const graph = {
    id: "root",
    layoutOptions: {
      "elk.algorithm": "layered",
      "elk.direction": "DOWN",

      "elk.layered.nodePlacement.strategy": "BRANDES_KOEPF",
      "elk.layered.nodePlacement.bk.fixedAlignment": "BALANCED",
      "elk.layered.considerModelOrder": true,
      "elk.layered.nodePlacement.favorStraightEdges": true,
      "elk.aspectRatio": 1.6,

      "elk.layered.layering.strategy": "NETWORK_SIMPLEX",
      "elk.layered.compaction.connectedComponents": true,
      "elk.layered.cycleBreaking.strategy": "GREEDY",
      "elk.layered.crossingMinimization.strategy": "LAYER_SWEEP",

      "elk.portAlignment.default": "JUSTIFIED",

      "elk.spacing.nodeNode": 200,
      "elk.layered.spacing.nodeNodeBetweenLayers": 100,
      "elk.spacing.edgeNode": 15,
      "elk.spacing.edgeEdge": 10,

      "elk.edgeRouting": "ORTHOGONAL",
      "elk.layered.edgeRouting.useNodeShape": true,
      "elk.edgeSpacing": 10,
      "elk.edgeLabels.inline": false,
      "elk.edgeLabels.placement": "CENTER",

      "elk.layered.mergeEdges": true,
      "elk.longEdgeOrdering.strategy": "DUMMY_NODE_OVER",
      "elk.layered.randomization.seed": 1,
      "elk.randomSeed": 1,

      "elk.spacing.labelNode": 5,
      "elk.nodeLabels.padding": "[5,5,5,5]",

      "elk.graphWrapping.strategy": "OFF",
    },
    children: nodes.map((n) => ({
      id: n.id,
      width: n.measured.width,
      height: n.measured.height,
      layoutOptions: {
        "elk.portConstraints": "FIXED_SIDE",
      },
    })),
    edges: edges.map((e) => formatElkEdge(e, font)),
  };

  const out = await elk.layout(graph);

  return {
    nodes: out.children || [],
    edges: out.edges || [],
  };
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

  const registerSize = (id, size) => {
    setNodeSizes((prev) => {
      const m = new Map(prev);
      m.set(id, size);
      return m;
    });
  };

  const drawGraph = useCallback((builtNodes, builtEdges) => {
    layoutGraph(builtNodes, builtEdges).then((layout) => {
      const finalNodes = builtNodes.map((n) => {
        const pos = layout.nodes.find((p) => p.id === n.id);
        return {
          ...n,
          position: { x: pos.x, y: pos.y },
        };
      });

      const elkEdgeMap = new Map();
      layout.edges.forEach((elkEdge) => {
        elkEdgeMap.set(elkEdge.id, elkEdge);
        const sourceTargetKey = `${elkEdge.sources[0]}-${elkEdge.targets[0]}`;
        if (sourceTargetKey !== elkEdge.id) {
          elkEdgeMap.set(sourceTargetKey, elkEdge);
        }
      });

      const finalEdges = builtEdges.map((edge) => {
        let elkEdge = elkEdgeMap.get(edge.id);
        if (!elkEdge) {
          const sourceTargetKey = `${edge.source}-${edge.target}`;
          elkEdge = elkEdgeMap.get(sourceTargetKey);
        }

        if (elkEdge && elkEdge.sections && elkEdge.sections.length > 0) {
          return {
            ...edge,
            type: "processEdge",
            data: {
              ...edge.data,
              elkRouting: {
                sections: elkEdge.sections,
                labels: elkEdge.labels || [],
              },
            },
          };
        }
        return edge;
      });

      setNodes(finalNodes);
      setEdges(finalEdges);

      const sortedNodes = [...finalNodes].sort(
        (a, b) => a.position.y - b.position.y
      );
      setActiveNodeId(sortedNodes[0]?.id || null);
    });
  }, []);

  useEffect(() => {
    if (!dag_nodes.length) return;
    if (nodeSizes.size !== dag_nodes.length) return;

    const builtNodes = dag_nodes.map((n) => ({
      id: n.id,
      type: "step",
      position: { x: 0, y: 0 },
      data: {
        ...n.data,
        name: (n.data?.label || "").replace(/_/g, " "),
      },
      measured: nodeSizes.get(n.id),
    }));

    // Track handle indices for each node to ensure unique handle IDs per edge
    const sourceHandleIndices = new Map();
    const targetHandleIndices = new Map();

    const builtEdges = dag_edges.map((e, index) => {
      const elkEdgeId = `${e.source}-${e.target}`;

      // Assign unique handle indices for this edge
      // Each edge from the same source node gets a unique source handle index
      const sourceIndex = sourceHandleIndices.get(e.source) || 0;
      sourceHandleIndices.set(e.source, sourceIndex + 1);

      // Each edge to the same target node gets a unique target handle index
      const targetIndex = targetHandleIndices.get(e.target) || 0;
      targetHandleIndices.set(e.target, targetIndex + 1);

      return {
        id: `${elkEdgeId}-${index}`,
        type: "processEdge",
        source: e.source,
        target: e.target,
        sourceHandle: `source-${sourceIndex}`,
        targetHandle: `target-${targetIndex}`,
        data: {
          path: "smoothstep",
          label: e.label,
        },
      };
    });

    dag_nodes.forEach((n) => {
      builtNodes.find((x) => x.id === n.id).data.incomingEdgesCount =
        dag_edges.filter((e) => e.target === n.id).length;

      builtNodes.find((x) => x.id === n.id).data.outgoingEdgesCount =
        dag_edges.filter((e) => e.source === n.id).length;
    });

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
      }}
    >
      {children}

      {dag_nodes.map((n) => (
        <FakeNode key={n.id} id={n.id} data={n.data} />
      ))}
    </FlowContext.Provider>
  );
};

/* ----------------------------------------------------------
   REACT FLOW WRAPPER
---------------------------------------------------------- */
const FlowInner = () => {
  const { nodes, edges, onNodesChange, onEdgesChange } =
    useProcessingStepsFlow();
  const containerRef = useRef(null);
  const flowRef = useRef(null);
  const instanceRef = useRef(null);
  const [isInitialAdjustViewport, setIsInitialAdjustViewport] = useState(false);

  const adjustViewport = useCallback(() => {
    if (!instanceRef.current) return;
    if (!nodes.length) return;
    setIsInitialAdjustViewport(true);

    let first = [...nodes].sort((a, b) => a.position.y - b.position.y)[0];
    const processingNode = nodes.find(
      (n) => n.data.status === PROCESS_STATUS.PROCESSING
    );

    if (processingNode) {
      first = processingNode;
    }

    if (!first) return;

    instanceRef.current.setViewport({
      x: first.position.x / 4 - 100,
      y: -first.position.y + 40,
      zoom: 0.5,
      duration: 300,
    });
  }, [nodes]);

  useEffect(() => {
    if (isInitialAdjustViewport) return;

    adjustViewport();
  }, [nodes, adjustViewport, isInitialAdjustViewport]);

  const onInit = (instance) => {
    instanceRef.current = instance;
    adjustViewport();
  };

  const { theme } = useTheme();
  const isDark = theme === "dark";

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
        maxZoom={10}
      >
        <Background variant="dots" />
        <Controls />
      </ReactFlow>
    </div>
  );
};

export const ProcessingStepsFlow = () => (
  <ReactFlowProvider>
    <FlowInner />
  </ReactFlowProvider>
);

/* ----------------------------------------------------------
   CURRENT NODE DETAIL
---------------------------------------------------------- */

export const ActiveProcessMessage = () => {
  const { nodes, activeNodeId } = useProcessingStepsFlow();
  const node = nodes.find((n) => n.id === activeNodeId);

  const log = node?.data?.extraMetadata || {
    markdown: node?.data?.log || "No logs",
  };

  return <ProcessMessage message={{ extraMetadata: log }} />;
};
