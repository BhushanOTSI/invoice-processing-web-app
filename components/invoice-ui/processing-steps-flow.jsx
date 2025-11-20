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
import dagre from "dagre";

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

/* ----------------------------------------------------------
   HANDLES
---------------------------------------------------------- */

const NodeHandles = ({ count, type, position }) => {
  if (!count) return null;

  return Array.from({ length: count }).map((_, i) => {
    const left = count === 1 ? "50%" : `${((i + 1) / (count + 1)) * 100}%`;

    return (
      <BaseHandle
        key={`${type}-${i}`}
        id={`${type}-${i}`}
        type={type}
        position={position}
        isConnectable={false}
        style={{ left }}
      />
    );
  });
};

/* ----------------------------------------------------------
   NODE TYPE
---------------------------------------------------------- */

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

/* ----------------------------------------------------------
   EDGE TYPES
---------------------------------------------------------- */

const edgeTypes = {
  processEdge: (props) => {
    const { theme } = useTheme();

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

/* ----------------------------------------------------------
   FAKE NODE (SIZE MEASUREMENT)
---------------------------------------------------------- */

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

/* ----------------------------------------------------------
   LAYOUT ENGINE (ELK)
---------------------------------------------------------- */
const elk = new ELK();

const layoutGraph = async (nodes, edges) => {
  const graph = {
    id: "root",
    layoutOptions: {
      "elk.algorithm": "layered",
      "elk.direction": "DOWN",

      // ALIGNMENT & SYMMETRY (CRITICAL)
      "elk.layered.nodePlacement.strategy": "BRANDES_KOEPF",
      "elk.layered.nodePlacement.bk.fixedAlignment": "BALANCED",
      "elk.layered.considerModelOrder": true,
      "elk.layered.nodePlacement.favorStraightEdges": true,
      "elk.aspectRatio": 1.6,

      // LAYERING LIKE AIRFLOW
      "elk.layered.layering.strategy": "NETWORK_SIMPLEX",
      "elk.layered.compaction.connectedComponents": true,
      "elk.layered.cycleBreaking.strategy": "GREEDY",
      "elk.layered.crossingMinimization.strategy": "LAYER_SWEEP",

      // PORT ALIGNMENT LIKE AIRFLOW
      "elk.portAlignment.default": "JUSTIFIED",

      // SPACING (TIGHT & CLEAN)
      "elk.spacing.nodeNode": 200,
      "elk.layered.spacing.nodeNodeBetweenLayers": 100,
      "elk.spacing.edgeNode": 15,
      "elk.spacing.edgeEdge": 10,

      // EDGE ROUTING (SAME AS AIRFLOW)
      "elk.edgeRouting": "ORTHOGONAL",
      "elk.layered.edgeRouting.useNodeShape": true,
      "elk.edgeSpacing": 10,
      "elk.edgeLabels.inline": false,
      "elk.edgeLabels.placement": "CENTER",

      // PREVENT NODES FROM DRIFTING SIDEWAYS
      "elk.layered.mergeEdges": true,
      "elk.longEdgeOrdering.strategy": "DUMMY_NODE_OVER",
      "elk.layered.randomization.seed": 1,
      "elk.randomSeed": 1,

      // LABEL BEHAVIOR
      "elk.spacing.labelNode": 5,
      "elk.nodeLabels.padding": "[5,5,5,5]",

      // NO WRAPPING
      "elk.graphWrapping.strategy": "OFF",
    },
    children: nodes.map((n) => ({
      id: n.id,
      width: n.measured.width,
      height: n.measured.height,
    })),
    edges: edges.map((e) => {
      return {
        id: e.id,
        sources: [e.source],
        targets: [e.target],
      };
    }),
  };

  const out = await elk.layout(graph);

  return out.children;
};

/* ----------------------------------------------------------
   LAYOUT ENGINE (DAGRE)
---------------------------------------------------------- */

const layoutGraphDagre = async (nodes, edges) => {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({
    rankdir: "TB", // Top to Bottom
    nodesep: 200, // Horizontal spacing between nodes
    ranksep: 100, // Vertical spacing between ranks
    marginx: 50,
    marginy: 50,
  });

  // Add nodes to dagre graph
  nodes.forEach((node) => {
    g.setNode(node.id, {
      width: node.measured.width,
      height: node.measured.height,
    });
  });

  // Add edges to dagre graph
  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  // Run dagre layout
  dagre.layout(g);

  // Extract positions from dagre graph
  // Dagre returns center positions, so we convert to top-left for React Flow
  return nodes.map((node) => {
    const nodeWithPosition = g.node(node.id);
    return {
      id: node.id,
      x: nodeWithPosition.x - node.measured.width / 2,
      y: nodeWithPosition.y - node.measured.height / 2,
    };
  });
};

/* ----------------------------------------------------------
   FLOW PROVIDER
---------------------------------------------------------- */

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
    layoutGraphDagre(builtNodes, builtEdges).then((layout) => {
      const finalNodes = builtNodes.map((n) => {
        const pos = layout.find((p) => p.id === n.id);
        return {
          ...n,
          position: { x: pos.x, y: pos.y },
        };
      });

      setNodes(finalNodes);
      setEdges(builtEdges);

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

    // Track handle indices for each node to assign correct handles to edges
    const sourceHandleCounts = new Map();
    const targetHandleCounts = new Map();

    const builtEdges = dag_edges.map((e) => {
      // Get the current handle index for source and target nodes
      const sourceHandleIndex = sourceHandleCounts.get(e.source) || 0;
      const targetHandleIndex = targetHandleCounts.get(e.target) || 0;

      // Increment counters for next edge
      sourceHandleCounts.set(e.source, sourceHandleIndex + 1);
      targetHandleCounts.set(e.target, targetHandleIndex + 1);

      return {
        id: e.id,
        type: "processEdge",
        source: e.source,
        target: e.target,
        sourceHandle: `source-${sourceHandleIndex}`,
        targetHandle: `target-${targetHandleIndex}`,
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
