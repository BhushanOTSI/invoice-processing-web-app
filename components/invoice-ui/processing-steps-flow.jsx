"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  useLayoutEffect,
} from "react";
import ELK from "elkjs/lib/elk.bundled.js";
import {
  cn,
  isFailedProcessing,
  isProcessing,
  isSkippedProcessing,
  isSuccessProcessing,
} from "@/lib/utils";
import { statusTextVariants } from "./process-status-badge";

import "@xyflow/react/dist/style.css";
import {
  Background,
  Position,
  ReactFlow,
  useEdgesState,
  useNodesState,
  ReactFlowProvider,
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
import { forwardRef } from "react";

const getBorderColor = (status) => {
  return `var(--${statusTextVariants({ variant: status })
    .replace("text", "color")
    .replace("900", "500")})`;
};

const NodeHandles = ({
  edgeCount,
  handleType,
  position,
  shouldRender,
  keyPrefix,
}) => {
  if (!shouldRender || edgeCount === 0) return null;
  const getHandleStyle = (index, total) => {
    if (total <= 1) return {};

    const padding = 20;
    const availablePercent = 100 - padding * 2;
    const percentPerHandle = total > 1 ? availablePercent / (total - 1) : 0;
    const leftPercent = padding + percentPerHandle * index;

    return { left: `${Math.max(0, Math.min(100, leftPercent))}%` };
  };

  return Array.from({ length: edgeCount }).map((_, index) => (
    <BaseHandle
      key={`${keyPrefix}-${index}`}
      id={`${keyPrefix}-${index}`}
      type={handleType}
      position={position}
      isConnectable={false}
      style={getHandleStyle(index, edgeCount)}
    />
  ));
};

const NodeContent = forwardRef(({ data, ...props }, ref) => (
  <BaseNode ref={ref} {...props}>
    <BaseNodeHeader>
      <BaseNodeHeaderTitle>{data.name}</BaseNodeHeaderTitle>
      <ProcessStatusBadge
        status={data.status}
        iconClassName={"size-6!"}
        className="text-sm"
      >
        {data.status}
      </ProcessStatusBadge>
    </BaseNodeHeader>
    {data.description && (
      <BaseNodeContent className="border-t dark:border-white/80">
        {data.description}
      </BaseNodeContent>
    )}
  </BaseNode>
));
NodeContent.displayName = "NodeContent";

const nodeTypes = {
  step: ({ data, width, height }) => {
    const { outgoingEdgesCount = 0, incomingEdgesCount = 0 } = data;
    const { activeNodeIndex, setActiveNodeIndex } = useProcessingStepsFlow();
    const isActive = activeNodeIndex === data.index;

    const isSkippedStatus = isSkippedProcessing(data.status);
    const isSuccessStatus = isSuccessProcessing(data.status);

    const hasIncoming = incomingEdgesCount > 0;
    const hasOutgoing = outgoingEdgesCount > 0;

    const Content = (
      <NodeContent
        data={data}
        className={cn(
          isActive && "node-active-gradient",
          !isActive && isProcessing(data.status) && "node-processing-border",
          isSkippedStatus && "node-skipped",
          !isActive && isFailedProcessing(data.status) && "node-failed",
          !isActive && isSuccessStatus && "node-success"
        )}
        onClick={() => !isSkippedStatus && setActiveNodeIndex(data.index)}
        style={{ width, height }}
      />
    );

    return (
      <>
        <NodeHandles
          edgeCount={incomingEdgesCount}
          handleType="target"
          position={Position.Top}
          shouldRender={hasIncoming}
          keyPrefix="target"
        />
        {isSkippedStatus ? (
          Content
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>{Content}</TooltipTrigger>
            <TooltipContent>Click to view logs</TooltipContent>
          </Tooltip>
        )}
        <NodeHandles
          edgeCount={outgoingEdgesCount}
          handleType="source"
          position={Position.Bottom}
          shouldRender={hasOutgoing}
          keyPrefix="source"
        />
      </>
    );
  },
};

const edgeTypes = {
  processEdge: ({ data, ...props }) => {
    return <DataEdge {...props} data={data} style={{ strokeWidth: 4 }} />;
  },
};

const ProcessingStepsFlowInner = () => {
  const { nodes, edges, onNodeClick, onNodesChange, onEdgesChange } =
    useProcessingStepsFlow();
  const reactFlowInstanceRef = useRef(null);
  const containerRef = useRef(null);
  const [minZoom, setMinZoom] = useState(0.8);
  const [isReactFlowReady, setIsReactFlowReady] = useState(false);

  const calculateMinZoom = useCallback(() => {
    if (!containerRef.current || nodes.length === 0) {
      return 0.8;
    }

    const container = containerRef.current;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    if (containerWidth === 0 || containerHeight === 0) {
      return 0.8;
    }

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    nodes.forEach((node) => {
      const nodeWidth = node.measured?.width;
      const nodeHeight = node.measured?.height;
      const x = node.position.x;
      const y = node.position.y;

      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x + nodeWidth);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y + nodeHeight);
    });

    const padding = 0.1;
    const paddingX = (maxX - minX) * padding;
    const paddingY = (maxY - minY) * padding;

    const contentWidth = maxX - minX + paddingX * 2;
    const contentHeight = maxY - minY + paddingY * 2;

    const zoomX = containerWidth / contentWidth;
    const zoomY = containerHeight / contentHeight;

    const calculatedZoom = Math.min(zoomX, zoomY);

    return Math.max(0.1, Math.min(1.0, calculatedZoom));
  }, [nodes]);

  useEffect(() => {
    if (!containerRef.current) return;

    let timeoutId;
    const resizeObserver = new ResizeObserver(() => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (reactFlowInstanceRef.current) {
          reactFlowInstanceRef.current.fitView({ duration: 200, padding: 0.1 });
        }
      }, 150);
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    if (nodes.length > 0) {
      const newMinZoom = calculateMinZoom();
      setMinZoom(newMinZoom);
    }
  }, [nodes, calculateMinZoom]);

  useEffect(() => {
    if (isReactFlowReady && nodes.length > 0) {
      const timeoutId = setTimeout(() => {
        reactFlowInstanceRef.current?.fitView({ duration: 0, padding: 0.1 });
      }, 1);
      return () => clearTimeout(timeoutId);
    }
  }, [nodes.length, isReactFlowReady]);

  const onInit = useCallback((reactFlowInstance) => {
    reactFlowInstanceRef.current = reactFlowInstance;
    setIsReactFlowReady(true);
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn("w-full h-full react-flow-container")}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeClick={onNodeClick}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onInit={onInit}
        minZoom={minZoom}
        maxZoom={1.5}
        fitView
        fitViewOptions={{ duration: 300, padding: 0.1 }}
      >
        <Background variant="dots" />
      </ReactFlow>
    </div>
  );
};

export const ProcessingStepsFlow = () => {
  return (
    <ReactFlowProvider>
      <ProcessingStepsFlowInner />
    </ReactFlowProvider>
  );
};

export const Context = createContext();

export const useProcessingStepsFlow = () => {
  return useContext(Context);
};

const elk = new ELK();

export const getLayoutedElements = async (nodes, edges, options) => {
  const directionMap = {
    TB: "DOWN",
    BT: "UP",
    LR: "RIGHT",
    RL: "LEFT",
  };
  const elkDirection = directionMap[options.direction] || "DOWN";

  const elkGraph = {
    id: "root",
    layoutOptions: {
      "elk.algorithm": "layered",
      "elk.direction": elkDirection,

      // SPACING - the real fix
      "elk.spacing.nodeNode": 100,
      "elk.spacing.edgeNode": 40,
      "elk.spacing.edgeEdge": 20,
      "elk.layered.spacing.nodeNodeBetweenLayers": 100,

      // ROUTING
      "elk.edgeRouting": "POLYLINE",
      "elk.layered.edgeRouting.useNodeShape": true,

      // LAYER & ALIGNMENT
      "elk.layered.considerModelOrder": true,
      "elk.layered.nodePlacement.strategy": "BRANDES_KOEPF",
      "elk.layered.nodePlacement.bk.fixedAlignment": "BALANCED",
      "elk.layered.nodePlacement.favorStraightEdges": true,

      // PORTS
      "elk.portConstraints": "FIXED_ORDER",
      "elk.portAlignment.default": "CENTER",

      // CROSSING REDUCTION
      "elk.layered.crossingMinimization.semiInteractive": true,
      "elk.layered.cycleBreaking.strategy": "DEPTH_FIRST",

      // COMPACTION
      "elk.layered.compaction.connectedComponents": true,
      "elk.layered.compaction.postCompaction.strategy": "SQUEEZE",

      // DETERMINISTIC RESULTS
      "elk.randomSeed": 1,
      "elk.layered.randomization.seed": 1,

      // aesthetics
      "elk.rounding": 8,
    },
    children: nodes.map((node) => ({
      id: String(node.id),
      width: Number(node.measured?.width),
      height: Number(node.measured?.height),
    })),
    edges: edges.map((edge) => ({
      id: String(edge.id),
      sources: [String(edge.source)],
      targets: [String(edge.target)],
      layoutOptions: {
        priority: isSkippedProcessing(edge.data?.status) ? 1 : 100,
      },
    })),
  };

  const layoutedGraph = await elk.layout(elkGraph);

  const layoutedNodes = layoutedGraph.children
    .map((elkNode) => {
      const originalNode = nodes.find((n) => n.id === elkNode.id);
      if (!originalNode) return null;

      return {
        ...originalNode,
        ...elkNode,
        position: {
          x: elkNode.x || 0,
          y: elkNode.y || 0,
        },
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.position.y - b.position.y)
    .map((node, index) => {
      return {
        ...node,
        data: {
          ...node.data,
          index,
        },
      };
    });

  return {
    nodes: layoutedNodes,
    edges,
  };
};

const DefaultMeasured = {
  width: 450,
  height: 60,
};

export const ProcessingStepsFlowProvider = ({
  children,
  dag_nodes = [],
  dag_edges = [],
}) => {
  const [nodeRegistry, setNodeRegistry] = useState(new Map());
  const [activeNodeIndex, setActiveNodeIndex] = useState(0);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    if (
      !dag_nodes.length ||
      !dag_nodes.every((node) => nodeRegistry.get(node.id)?.width)
    )
      return;

    const newNodes = [];
    const newEdges = [];

    // Calculate edge counts per node for handle distribution
    const sourceEdgeCounts = new Map();
    const targetEdgeCounts = new Map();

    // Group edges by source and target to assign handle indices
    const edgesBySource = new Map();
    const edgesByTarget = new Map();

    dag_edges.forEach((edge) => {
      // Count outgoing edges per source
      const sourceCount = sourceEdgeCounts.get(edge.source) || 0;
      sourceEdgeCounts.set(edge.source, sourceCount + 1);

      // Count incoming edges per target
      const targetCount = targetEdgeCounts.get(edge.target) || 0;
      targetEdgeCounts.set(edge.target, targetCount + 1);

      if (!edgesBySource.has(edge.source)) {
        edgesBySource.set(edge.source, []);
      }
      edgesBySource.get(edge.source).push(edge);

      if (!edgesByTarget.has(edge.target)) {
        edgesByTarget.set(edge.target, []);
      }
      edgesByTarget.get(edge.target).push(edge);
    });

    const dagSet = new Map();
    dag_nodes.forEach((node) => {
      dagSet.set(node.id, node);

      newNodes.push({
        id: node.id,
        position: { x: 0, y: 0 },
        type: "step",
        data: {
          ...(node.data || {}),
          name: (node.data?.label || "").replace(/_/g, " "),
        },
        measured: {
          width: nodeRegistry.get(node.id).width,
          height: nodeRegistry.get(node.id).height,
        },
      });
    });

    // Assign handle indices to edges
    dag_edges.forEach((edge) => {
      // Get source handle index (position in the array of edges from this source)
      const sourceEdges = edgesBySource.get(edge.source) || [];
      const sourceIndex = sourceEdges.findIndex((e) => e.id === edge.id);

      // Get target handle index (position in the array of edges to this target)
      const targetEdges = edgesByTarget.get(edge.target) || [];
      const targetIndex = targetEdges.findIndex((e) => e.id === edge.id);

      const sourceStatus = dagSet.get(edge.source)?.data?.status;
      const targetStatus = dagSet.get(edge.target)?.data?.status;

      const isSelectedStatus =
        sourceStatus &&
        targetStatus &&
        !isSkippedProcessing(sourceStatus) &&
        !isSkippedProcessing(targetStatus);

      const sourceCount = sourceEdgeCounts.get(edge.source) || 1;
      const targetCount = targetEdgeCounts.get(edge.target) || 1;

      // Always assign handles when there are multiple edges, even if count is 1
      // This ensures consistent behavior
      newEdges.push({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: sourceCount > 1 ? `source-${sourceIndex}` : undefined,
        targetHandle: targetCount > 1 ? `target-${targetIndex}` : undefined,
        type: "processEdge",
        data: {
          status: isSelectedStatus ? sourceStatus : PROCESS_STATUS.SKIPPED,
          targetStatus,
          path: "smoothstep",
          label: edge?.label,
        },
      });
    });

    // Update node data with edge counts
    newNodes.forEach((node) => {
      node.data.outgoingEdgesCount = sourceEdgeCounts.get(node.id) || 0;
      node.data.incomingEdgesCount = targetEdgeCounts.get(node.id) || 0;
    });

    getLayoutedElements(newNodes, newEdges, { direction: "TB" }).then(
      ({ nodes: layoutedNodes, edges: layoutedEdges }) => {
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
      }
    );
  }, [setNodes, setEdges, dag_nodes, dag_edges, nodeRegistry]);

  const rerunLayout = useCallback(() => {
    getLayoutedElements(nodes, edges, { direction: "TB" }).then(
      ({ nodes: newNodes, edges: newEdges }) => {
        setNodes(newNodes);
        setEdges(newEdges);
      }
    );
  }, [nodes, edges, setNodes, setEdges]);

  return (
    <Context.Provider
      value={{
        nodes,
        edges,
        activeNode: nodes?.[activeNodeIndex] || null,
        setActiveNodeIndex,
        activeNodeIndex,
        onNodesChange,
        onEdgesChange,
        rerunLayout,
        setNodes,
        setEdges,
        setNodeRegistry,
        nodeRegistry,
      }}
    >
      {children}
      {dag_nodes.map((node) => (
        <FakeNode
          key={node.id}
          data={{
            ...node.data,
            name: (node.data?.label || "").replace(/_/g, " "),
          }}
          id={node.id}
        />
      ))}
    </Context.Provider>
  );
};

export const FakeNode = ({ data, id }) => {
  const nodeRef = useRef(null);
  const { setNodeRegistry } = useProcessingStepsFlow();

  useLayoutEffect(() => {
    if (!nodeRef.current) return;

    const width = nodeRef.current.clientWidth;
    const height = nodeRef.current.clientHeight;

    setNodeRegistry((prevRegistry) => {
      prevRegistry.set(id, { width, height });
      return new Map(prevRegistry);
    });
  }, [id, setNodeRegistry]);

  return (
    <div
      style={{
        visibility: "hidden",
        position: "absolute",
        left: -9999,
        top: 0,
        pointerEvents: "none",
      }}
      className="fake-node"
    >
      <NodeContent
        data={data}
        ref={nodeRef}
        style={{ width: DefaultMeasured.width }}
      />
    </div>
  );
};

export const ActiveProcessMessage = ({ isLoading = false }) => {
  const { activeNode } = useProcessingStepsFlow();
  const extraMetadata = activeNode?.data?.extraMetadata || {
    markdown: activeNode?.data?.log || "No data logs available",
  };
  return (
    <ProcessMessage
      message={{
        extraMetadata,
      }}
      isLoading={isLoading}
    />
  );
};
