"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import ELK from "elkjs/lib/elk.bundled.js";
import { cn, isProcessing, isSkippedProcessing } from "@/lib/utils";
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
import { BaseNode, BaseNodeHeader, BaseNodeHeaderTitle } from "../base-node";
import { ProcessStatusBadge } from "./process-status-badge";
import { PROCESS_STATUS } from "@/app/constants";
import { DataEdge } from "../data-edge";
import { BaseHandle } from "../base-handle";
import { ProcessMessage } from "./process-message";

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
  getHandleStyle,
}) => {
  if (!shouldRender || edgeCount === 0) return null;

  const hasMultipleEdges = edgeCount > 1;

  return (
    <>
      {hasMultipleEdges ? (
        Array.from({ length: edgeCount }).map((_, index) => (
          <BaseHandle
            key={`${keyPrefix}-${index}`}
            id={`${keyPrefix}-${index}`}
            type={handleType}
            position={position}
            isConnectable={false}
            style={getHandleStyle(index, edgeCount)}
          />
        ))
      ) : edgeCount === 1 ? (
        <BaseHandle
          type={handleType}
          position={position}
          isConnectable={false}
        />
      ) : null}
    </>
  );
};

const nodeTypes = {
  step: ({ data }) => {
    const {
      isFirstNode,
      outgoingEdgesCount = 0,
      incomingEdgesCount = 0,
    } = data;
    const { activeNodeIndex, setActiveNodeIndex } = useProcessingStepsFlow();
    const isActive = activeNodeIndex === data.index;
    const isSkippedStatus = isSkippedProcessing(data.status);

    const getHandleStyle = (index, total) => {
      if (total <= 1) return {};
      const padding = 10;
      const availablePercent = 100 - padding * 2;
      const percentPerHandle = total > 1 ? availablePercent / (total - 1) : 0;
      const leftPercent = padding + percentPerHandle * index;

      return { left: `${Math.max(0, Math.min(100, leftPercent))}%` };
    };

    const hasIncoming = incomingEdgesCount > 0;
    const hasOutgoing = outgoingEdgesCount > 0;

    return (
      <>
        <NodeHandles
          edgeCount={incomingEdgesCount}
          handleType="target"
          position={Position.Top}
          shouldRender={hasIncoming && !isFirstNode}
          keyPrefix="target"
          getHandleStyle={getHandleStyle}
        />
        <BaseNode
          className={cn(
            isActive && "border-2 border-accent-foreground",
            isSkippedStatus && "opacity-50",
            isProcessing(data.status) && "border-2 border-primary"
          )}
          onClick={() => !isSkippedStatus && setActiveNodeIndex(data.index)}
        >
          <BaseNodeHeader>
            <BaseNodeHeaderTitle className="uppercase">
              {data.name}
            </BaseNodeHeaderTitle>

            <ProcessStatusBadge
              status={data.status}
              className={"text-sm"}
              iconClassName={"size-4!"}
            >
              {data.status}
            </ProcessStatusBadge>
          </BaseNodeHeader>
        </BaseNode>
        <NodeHandles
          edgeCount={outgoingEdgesCount}
          handleType="source"
          position={Position.Bottom}
          shouldRender={hasOutgoing}
          keyPrefix="source"
          getHandleStyle={getHandleStyle}
        />
      </>
    );
  },
};

const edgeTypes = {
  processEdge: ({ data, ...props }) => {
    return (
      <DataEdge
        {...props}
        data={data}
        style={{
          strokeWidth: 2,
          stroke: getBorderColor(data.status),
        }}
      />
    );
  },
};

const ProcessingStepsFlowInner = () => {
  const {
    nodes,
    edges,
    onNodeClick,
    onNodesChange,
    onEdgesChange,
    rerunLayout,
  } = useProcessingStepsFlow();
  const reactFlowInstanceRef = useRef(null);
  const containerRef = useRef(null);
  const [minZoom, setMinZoom] = useState(0.3);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [isReactFlowReady, setIsReactFlowReady] = useState(false);

  const calculateMinZoom = useCallback(() => {
    if (!containerRef.current || nodes.length === 0) {
      return 0.3;
    }

    const container = containerRef.current;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    if (containerWidth === 0 || containerHeight === 0) {
      return 0.3;
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

    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    let timeoutId;
    const resizeObserver = new ResizeObserver(() => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        updateSize();
        if (reactFlowInstanceRef.current) {
          reactFlowInstanceRef.current.fitView({ duration: 200, padding: 0.1 });
        }
      }, 150);
    });

    resizeObserver.observe(containerRef.current);
    updateSize();

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
  }, [nodes, containerSize, calculateMinZoom]);

  useEffect(() => {
    if (isReactFlowReady && nodes.length > 0) {
      const timeoutId = setTimeout(() => {
        reactFlowInstanceRef.current?.fitView({ duration: 0, padding: 0.1 });
      }, 1);
      return () => clearTimeout(timeoutId);
    }
  }, [nodes.length, isReactFlowReady]);

  const onInit = useCallback(
    (reactFlowInstance) => {
      reactFlowInstanceRef.current = reactFlowInstance;
      setIsReactFlowReady(true);
      rerunLayout();
      reactFlowInstance.fitView({ duration: 0, padding: 0.1 });
    },
    [rerunLayout]
  );

  return (
    <div ref={containerRef} className="w-full h-full react-flow-container">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeClick={onNodeClick}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onInit={onInit}
        fitView
        minZoom={minZoom}
        maxZoom={1.5}
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

  // Create clean ELK graph structure - only pass essential properties
  const elkGraph = {
    id: "root",
    layoutOptions: {
      "elk.algorithm": "layered",
      "elk.direction": elkDirection,
      "elk.spacing.nodeNode": 50,
      "elk.layered.spacing.nodeNodeBetweenLayers": 60,
      // edges
      "elk.edgeRouting": "ORTHOGONAL",
      // "elk.layered.mergeEdges": true,
      // reduce ugly crossings
      "elk.layered.nodePlacement.strategy": "BRANDES_KOEPF",
      "elk.layered.cycleBreaking.strategy": "DEPTH_FIRST",
    },
    children: nodes.map((node) => ({
      id: String(node.id),
      width: Number(node.measured?.width || 350),
      height: Number(node.measured?.height || 50),
    })),
    edges: edges.map((edge) => ({
      id: String(edge.id),
      sources: [String(edge.source)],
      targets: [String(edge.target)],
    })),
  };

  // Run ELK layout
  const layoutedGraph = await elk.layout(elkGraph);

  const nodesLength = nodes.length;

  // Map ELK positions back to React Flow nodes
  const layoutedNodes = layoutedGraph.children
    .map((elkNode) => {
      const originalNode = nodes.find((n) => n.id === elkNode.id);
      if (!originalNode) return null;

      // React Flow expects a position property on the node instead of `x` and `y` fields
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
          isFirstNode: index === 0,
          isLastNode: index === nodesLength - 1,
        },
      };
    });

  return {
    nodes: layoutedNodes,
    edges,
  };
};

export const ProcessingStepsFlowProvider = ({
  children,
  messages = [],
  dag_nodes = [],
  dag_edges = [],
}) => {
  const [activeNodeIndex, setActiveNodeIndex] = useState(0);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    const newNodes = [];
    const newEdges = [];

    const dagSet = new Map();
    dag_nodes.forEach((node) => {
      dagSet.set(node.id, node);

      // Try to preserve measured dimensions from existing nodes state
      const existingNode = nodes.find((n) => n.id === node.id);
      const existingMeasured = existingNode?.measured;

      newNodes.push({
        id: node.id,
        position: { x: 0, y: 0 },
        type: "step",
        data: {
          ...(node.data || {}),
          name: (node.data?.label || "").replace(/_/g, " "),
        },
        measured: existingMeasured || {
          width: 350,
          height: 50,
        },
      });
    });

    // Calculate edge counts per node for handle distribution
    const sourceEdgeCounts = new Map();
    const targetEdgeCounts = new Map();

    dag_edges.forEach((edge) => {
      // Count outgoing edges per source
      const sourceCount = sourceEdgeCounts.get(edge.source) || 0;
      sourceEdgeCounts.set(edge.source, sourceCount + 1);

      // Count incoming edges per target
      const targetCount = targetEdgeCounts.get(edge.target) || 0;
      targetEdgeCounts.set(edge.target, targetCount + 1);
    });

    // Group edges by source and target to assign handle indices
    const edgesBySource = new Map();
    const edgesByTarget = new Map();

    dag_edges.forEach((edge) => {
      if (!edgesBySource.has(edge.source)) {
        edgesBySource.set(edge.source, []);
      }
      edgesBySource.get(edge.source).push(edge);

      if (!edgesByTarget.has(edge.target)) {
        edgesByTarget.set(edge.target, []);
      }
      edgesByTarget.get(edge.target).push(edge);
    });

    // Sort edges for consistent handle assignment
    edgesBySource.forEach((edgeList) => {
      edgeList.sort((a, b) => a.id.localeCompare(b.id));
    });
    edgesByTarget.forEach((edgeList) => {
      edgeList.sort((a, b) => a.id.localeCompare(b.id));
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
          label: edge.data?.label,
        },
        animated: isSelectedStatus,
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
  }, [messages, setNodes, setEdges, dag_nodes, dag_edges]);

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
      }}
    >
      {children}
    </Context.Provider>
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
