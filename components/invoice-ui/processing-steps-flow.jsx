"use client";
import { createContext, useContext, useMemo, useState } from "react";
import { cn, formatFractionalHoursAuto, isProcessing } from "@/lib/utils";
import {
  statusBorderVariants,
  statusTextVariants,
} from "./process-status-badge";

import "@xyflow/react/dist/style.css";
import { Background, Position, ReactFlow } from "@xyflow/react";
import {
  BaseNode,
  BaseNodeFooter,
  BaseNodeHeader,
  BaseNodeHeaderTitle,
} from "../base-node";
import { ProcessStatusBadge } from "./process-status-badge";
import { NodeStatusIndicator } from "../node-status-indicator";
import { PROCESS_STATUS } from "@/app/constants";
import { DataEdge } from "../data-edge";
import { LabeledHandle } from "../labeled-handle";
import { ProcessMessage } from "./process-message";

const nodeTypes = {
  step: ({ data }) => {
    const { isFirstNode, isLastNode } = data;
    const { activeNodeIndex, setActiveNodeIndex } = useProcessingStepsFlow();
    const isActive = activeNodeIndex === data.index;
    const isProcessingStatus = isProcessing(data.status);

    return (
      <NodeStatusIndicator
        status={data.status === PROCESS_STATUS.PROCESSING && "loading"}
        className={cn(statusBorderVariants({ variant: data.status }))}
      >
        {!isFirstNode && (
          <LabeledHandle
            type="target"
            position={Position.Top}
            handleClassName={cn(statusTextVariants({ variant: data.status }))}
          />
        )}
        <BaseNode
          className={cn(
            statusBorderVariants({ variant: data.status }),
            "max-w-96 min-w-96",
            isActive &&
              !isProcessingStatus &&
              "bg-primary/20 border-primary border-2 transition-colors"
          )}
          onClick={() => !isProcessingStatus && setActiveNodeIndex(data.index)}
        >
          <BaseNodeHeader>
            <BaseNodeHeaderTitle>{data.name}</BaseNodeHeaderTitle>
          </BaseNodeHeader>
          <BaseNodeFooter className="flex flex-row items-center justify-between gap-x-4">
            <div>
              <ProcessStatusBadge status={data.status}>
                {data.status}
              </ProcessStatusBadge>
            </div>

            <div className="text-xs text-muted-foreground">
              {data.processingTime}
            </div>
          </BaseNodeFooter>
        </BaseNode>
        {!isLastNode && (
          <LabeledHandle
            type="source"
            position={Position.Bottom}
            handleClassName={cn(statusTextVariants({ variant: data.status }))}
          />
        )}
      </NodeStatusIndicator>
    );
  },
};

const edgeTypes = {
  processEdge: ({ data, ...props }) => {
    return (
      <DataEdge
        {...props}
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
  const { nodes, edges, onNodeClick } = useProcessingStepsFlow();

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      onNodeClick={onNodeClick}
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

export const ProcessingStepsFlowProvider = ({ children, messages }) => {
  const [activeNodeIndex, setActiveNodeIndex] = useState(0);
  const { nodes, edges } = useMemo(() => {
    const nodes = [];
    const edges = [];
    const nodesLength = messages.length - 1;

    messages.forEach((message, index) => {
      nodes.push({
        id: message.stepId,
        position: { x: 0, y: index * 160 },
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
      });

      const next = messages[index + 1];

      if (next) {
        edges.push({
          id: `${message.stepId}->${next.stepId}`,
          source: message.stepId,
          target: next.stepId,
          type: "processEdge",
          data: { status: message.status },
        });
      }
    });

    return { nodes, edges };
  }, [messages]);

  return (
    <Context.Provider
      value={{
        nodes,
        edges,
        activeNode: nodes?.[activeNodeIndex] || null,
        setActiveNodeIndex,
        activeNodeIndex,
      }}
    >
      {children}
    </Context.Provider>
  );
};

export const ActiveProcessMessage = ({ isLoading = false }) => {
  const { activeNode } = useProcessingStepsFlow();
  return <ProcessMessage message={activeNode?.data} isLoading={isLoading} />;
};
