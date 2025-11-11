"use client";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from "react";
import Dagre from "@dagrejs/dagre";
import {
  cn,
  formatFractionalHoursAuto,
  isCompletedProcessing,
  isPendingProcessing,
  isProcessing,
  isSkippedProcessing,
} from "@/lib/utils";
import {
  statusBackgroundVariants,
  statusBorderVariants,
  statusTextVariants,
} from "./process-status-badge";

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
  BaseNodeFooter,
  BaseNodeHeader,
  BaseNodeHeaderTitle,
} from "../base-node";
import { ProcessStatusBadge } from "./process-status-badge";
import { PROCESS_STATUS } from "@/app/constants";
import { DataEdge } from "../data-edge";
import { LabeledHandle } from "../labeled-handle";
import { BaseHandle } from "../base-handle";
import { ProcessMessage } from "./process-message";

const getBorderColor = (status) => {
  return `var(--${statusTextVariants({ variant: status })
    .replace("text", "color")
    .replace("900", "500")})`;
};

const nodeTypes = {
  step: ({ data, id }) => {
    const {
      isFirstNode,
      isLastNode,
      outgoingEdgesCount = 0,
      incomingEdgesCount = 0,
    } = data;
    const { activeNodeIndex, setActiveNodeIndex } = useProcessingStepsFlow();
    const isActive = activeNodeIndex === data.index;
    const isSkippedStatus = isSkippedProcessing(data.status);

    // Calculate handle positions as percentage for React Flow
    // React Flow handles use percentage-based positioning along the edge
    // The 'left' style property positions handles horizontally on Top/Bottom edges
    const getHandleStyle = (index, total) => {
      if (total <= 1) return {}; // Default center position
      // Distribute handles evenly across the node width with better spacing
      // Use 10% padding from edges for wider distribution
      const padding = 10;
      const availablePercent = 100 - padding * 2;
      const percentPerHandle = total > 1 ? availablePercent / (total - 1) : 0;
      const leftPercent = padding + percentPerHandle * index;
      // Ensure the percentage is valid and return as string
      return { left: `${Math.max(0, Math.min(100, leftPercent))}%` };
    };

    // Determine if we need multiple handles
    const hasMultipleIncoming = incomingEdgesCount > 1;
    const hasMultipleOutgoing = outgoingEdgesCount > 1;
    const hasIncoming = incomingEdgesCount > 0;
    const hasOutgoing = outgoingEdgesCount > 0;

    return (
      <>
        {/* Target handles for incoming edges */}
        {hasIncoming && !isFirstNode && (
          <>
            {hasMultipleIncoming ? (
              // Multiple handles when there are multiple incoming edges
              Array.from({ length: incomingEdgesCount }).map((_, index) => (
                <BaseHandle
                  key={`target-${index}`}
                  id={`target-${index}`}
                  type="target"
                  position={Position.Top}
                  isConnectable={false}
                  style={getHandleStyle(index, incomingEdgesCount)}
                />
              ))
            ) : incomingEdgesCount === 1 ? (
              // Single handle for one incoming edge - use BaseHandle for consistency
              <BaseHandle
                type="target"
                position={Position.Top}
                isConnectable={false}
              />
            ) : null}
          </>
        )}
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
          </BaseNodeHeader>
          <BaseNodeFooter className="flex flex-row items-center justify-between gap-x-4 pt-3">
            <div>
              <ProcessStatusBadge
                status={data.status}
                className={"text-sm"}
                iconClassName={"size-4!"}
              >
                {data.status}
              </ProcessStatusBadge>
            </div>

            <div className="text-xs">{data.processingTime}</div>
          </BaseNodeFooter>
        </BaseNode>
        {/* Source handles for outgoing edges */}
        {hasOutgoing && (
          <>
            {hasMultipleOutgoing ? (
              // Multiple handles when there are multiple outgoing edges
              Array.from({ length: outgoingEdgesCount }).map((_, index) => (
                <BaseHandle
                  key={`source-${index}`}
                  id={`source-${index}`}
                  type="source"
                  position={Position.Bottom}
                  isConnectable={false}
                  style={getHandleStyle(index, outgoingEdgesCount)}
                />
              ))
            ) : outgoingEdgesCount === 1 ? (
              // Single handle for one outgoing edge - use BaseHandle for consistency
              <BaseHandle
                type="source"
                position={Position.Bottom}
                isConnectable={false}
              />
            ) : null}
          </>
        )}
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
  const { nodes, edges, onNodeClick, onNodesChange, onEdgesChange } =
    useProcessingStepsFlow();
  const reactFlowInstanceRef = useRef(null);
  const containerRef = useRef(null);
  const [minZoom, setMinZoom] = useState(0.3);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  // Calculate minZoom based on nodes bounding box
  const calculateMinZoom = useCallback(() => {
    if (!containerRef.current || nodes.length === 0) {
      return 0.3; // Default fallback
    }

    const container = containerRef.current;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    if (containerWidth === 0 || containerHeight === 0) {
      return 0.3; // Default fallback
    }

    // Calculate bounding box of all nodes
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    nodes.forEach((node) => {
      const nodeWidth = node.measured?.width ?? 350;
      const nodeHeight = node.measured?.height ?? 100;
      const x = node.position.x;
      const y = node.position.y;

      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x + nodeWidth);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y + nodeHeight);
    });

    // Add padding (10% on each side)
    const padding = 0.1;
    const paddingX = (maxX - minX) * padding;
    const paddingY = (maxY - minY) * padding;

    const contentWidth = maxX - minX + paddingX * 2;
    const contentHeight = maxY - minY + paddingY * 2;

    // Calculate zoom needed to fit content in viewport
    const zoomX = containerWidth / contentWidth;
    const zoomY = containerHeight / contentHeight;

    // Use the smaller zoom to ensure everything fits
    const calculatedZoom = Math.min(zoomX, zoomY);

    // Clamp between reasonable bounds (0.1 to 1.0)
    return Math.max(0.1, Math.min(1.0, calculatedZoom));
  }, [nodes]);

  // Update container size and minZoom on resize
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
      // Debounce resize events for better performance
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        updateSize();
        if (reactFlowInstanceRef.current) {
          reactFlowInstanceRef.current.fitView({ duration: 200, padding: 0.1 });
        }
      }, 150);
    });

    // Observe the parent container
    resizeObserver.observe(containerRef.current);
    updateSize(); // Initial size

    return () => {
      resizeObserver.disconnect();
      clearTimeout(timeoutId);
    };
  }, []);

  // Update minZoom when nodes or container size changes
  useEffect(() => {
    if (nodes.length > 0) {
      const newMinZoom = calculateMinZoom();
      setMinZoom(newMinZoom);
    }
  }, [nodes, containerSize, calculateMinZoom]);

  // Fit view when nodes change (layout updates)
  useEffect(() => {
    if (reactFlowInstanceRef.current && nodes.length > 0) {
      // Small delay to ensure layout is complete
      const timeoutId = setTimeout(() => {
        reactFlowInstanceRef.current?.fitView({ duration: 300, padding: 0.1 });
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [nodes.length]);

  const onInit = useCallback((reactFlowInstance) => {
    reactFlowInstanceRef.current = reactFlowInstance;
    // Fit view on initial mount
    reactFlowInstance.fitView({ duration: 0, padding: 0.1 });
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full">
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

export const getLayoutedElements = (nodes, edges, options) => {
  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: options.direction });

  edges.forEach((edge) => g.setEdge(edge.source, edge.target));
  nodes.forEach((node) => {
    g.setNode(node.id, {
      ...node,
      width: node.measured?.width ?? 0,
      height: node.measured?.height ?? 0,
    });
  });

  Dagre.layout(g);
  const nodesLength = nodes.length;
  return {
    nodes: nodes
      .map((node) => {
        const position = g.node(node.id);
        const x = position.x - (node.measured?.width ?? 0) / 2;
        const y = position.y - (node.measured?.height ?? 0) / 2;

        return { ...node, position: { x, y } };
      })
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
      }),
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
    const nodes = [];
    const edges = [];

    const dagSet = new Map();
    dag_nodes.forEach((node) => {
      dagSet.set(node.id, node);
      nodes.push({
        id: node.id,
        position: { x: 0, y: 0 },
        type: "step",
        data: {
          ...(node.data || {}),
          name: (node.data?.label || "").replace(/_/g, " "),
        },
        measured: {
          width: 350,
          height: 100,
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
      edges.push({
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
    nodes.forEach((node) => {
      node.data.outgoingEdgesCount = sourceEdgeCounts.get(node.id) || 0;
      node.data.incomingEdgesCount = targetEdgeCounts.get(node.id) || 0;
    });

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      nodes,
      edges,
      { direction: "TB" }
    );
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [messages, setNodes, setEdges, dag_nodes, dag_edges]);

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
