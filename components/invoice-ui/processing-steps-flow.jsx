"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
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
import { ProcessMessage } from "./process-message";

const nodeTypes = {
  step: ({ data, width }) => {
    const { isFirstNode, isLastNode } = data;
    const { activeNodeIndex, setActiveNodeIndex } = useProcessingStepsFlow();
    const isActive = activeNodeIndex === data.index;
    const isSkippedStatus = isSkippedProcessing(data.status);

    return (
      <>
        {!isFirstNode && (
          <LabeledHandle
            type="target"
            position={Position.Top}
            handleClassName={cn(statusTextVariants({ variant: data.status }))}
            isConnectable={false}
          />
        )}
        <BaseNode
          className={cn(
            isActive && "bg-accent-foreground text-accent",
            isSkippedStatus && "opacity-50",
            isProcessing(data.status) && "bg-primary text-primary-foreground"
          )}
          style={{
            width,
          }}
          onClick={() => !isSkippedStatus && setActiveNodeIndex(data.index)}
        >
          <BaseNodeHeader>
            <BaseNodeHeaderTitle>{data.name}</BaseNodeHeaderTitle>
          </BaseNodeHeader>
          <BaseNodeFooter className="flex flex-row items-center justify-between gap-x-4 pt-3">
            <div>
              <ProcessStatusBadge status={data.status}>
                {data.status}
              </ProcessStatusBadge>
            </div>

            <div className="text-xs">{data.processingTime}</div>
          </BaseNodeFooter>
        </BaseNode>
        {!isLastNode && (
          <LabeledHandle
            type="source"
            position={Position.Bottom}
            handleClassName={cn(statusTextVariants({ variant: data.status }))}
            isConnectable={false}
          />
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
          stroke: `var(--${statusTextVariants({ variant: data.status }).replace(
            "text",
            "color"
          )})`,
        }}
      />
    );
  },
};

export const ProcessingStepsFlow = () => {
  const { nodes, edges, onNodeClick, onNodesChange, onEdgesChange } =
    useProcessingStepsFlow();

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      onNodeClick={onNodeClick}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      fitView
    >
      <Background variant="dots" />
    </ReactFlow>
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
  nodes.forEach((node) =>
    g.setNode(node.id, {
      ...node,
      width: node.measured?.width ?? 0,
      height: node.measured?.height ?? 0,
    })
  );

  Dagre.layout(g);

  return {
    nodes: nodes.map((node) => {
      const position = g.node(node.id);
      const x = position.x - (node.measured?.width ?? 0) / 2;
      const y = position.y - (node.measured?.height ?? 0) / 2;

      return { ...node, position: { x, y } };
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
    const hasDag = dag_nodes.length > 0 && dag_edges.length > 0;
    const nodes = [];
    const edges = [];
    const nodesLength = messages.length - 1;

    if (!hasDag) {
      messages.forEach((message, index) => {
        nodes.push({
          id: message.stepId,
          position: { x: 0, y: 0 },
          type: "step",
          data: {
            ...message,
            processingTime: formatFractionalHoursAuto(
              message.processingTimeSeconds,
              "seconds"
            ),
            isFirstNode: index === 0,
            isLastNode: index === nodesLength,
            index,
          },
          measured: {
            width: 350,
            height: 100,
          },
        });

        const next = messages[index + 1];

        if (next) {
          edges.push({
            id: `${message.stepId}->${next.stepId}`,
            source: message.stepId,
            target: next.stepId,
            type: "processEdge",
            data: { status: message.status, path: "smoothstep" },
            animated: true,
          });
        }
      });
    } else {
      const dagNodesLength = dag_nodes.length;
      const dagSet = new Map();
      dag_nodes.forEach((node, index) => {
        dagSet.set(node.id, node);
        nodes.push({
          id: node.id,
          position: { x: 0, y: 0 },
          type: "step",
          data: {
            ...(node.data || {}),
            isFirstNode: false,
            isLastNode: index === dagNodesLength - 1,
            index,
            name: (node.data?.label || "").replace(/_/g, " "),
          },
          measured: {
            width: 350,
            height: 100,
          },
        });
      });

      dag_edges.forEach((edge) => {
        const sourceStatus = dagSet.get(edge.source)?.data?.status;
        const targetStatus = dagSet.get(edge.target)?.data?.status;

        const isSelectedStatus =
          sourceStatus &&
          targetStatus &&
          !isSkippedProcessing(sourceStatus) &&
          !isSkippedProcessing(targetStatus);

        edges.push({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          type: "processEdge",
          data: {
            status: isSelectedStatus ? sourceStatus : PROCESS_STATUS.SKIPPED,
            targetStatus,
            path: "smoothstep",
          },
          animated: isSelectedStatus,
        });
      });
    }

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
