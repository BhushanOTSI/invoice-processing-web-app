import { BaseEdge, EdgeLabelRenderer } from "@xyflow/react";
import {
  generateEdgePath,
  getPolylineMidpoint,
  getPolylinePoints,
} from "./flow-utils";
import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";
import { PROCESS_STATUS } from "@/app/constants";

const colorVariant = cva("", {
  variants: {
    variant: {
      [PROCESS_STATUS.SUCCESS]: "var(--color-green-600)",
      [PROCESS_STATUS.FAILED]: "var(--color-red-600)",
      [PROCESS_STATUS.CANCELLED]: "var(--color-slate-600)",
      [PROCESS_STATUS.PENDING]: "var(--color-amber-500)",
      [PROCESS_STATUS.PARTIALLY_COMPLETED]: "var(--color-amber-600)",
      [PROCESS_STATUS.UP_FOR_RETRY]: "var(--color-amber-600)",
      [PROCESS_STATUS.DEFERRED]: "var(--color-purple-600)",
      [PROCESS_STATUS.RUNNING]: "var(--color-blue-600)",
      [PROCESS_STATUS.SKIPPED]: "var(--color-slate-500)",
      [PROCESS_STATUS.SCHEDULED]: "var(--color-purple-600)",
      [PROCESS_STATUS.UPSTREAM_FAILED]: "var(--color-red-600)",
    },
  },
  defaultVariants: {
    variant: "var(--color-muted-foreground)",
  },
});

export const CustomEdges = ({ id, data }) => {
  const { sections = [], labels = [], executionEdge } = data;
  const path = generateEdgePath(sections);

  // Calculate the true midpoint of the edge path
  const points = getPolylinePoints(sections);
  const mid = getPolylineMidpoint(points);

  const color = colorVariant({ variant: executionEdge });

  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        style={{
          stroke: color,
          strokeWidth: 2,
        }}
      />
      {labels.map((label, index) => {
        // Use calculated midpoint for both x and y to center on the edge
        const transform = `translate(${mid.x}px,${mid.y}px) translate(-50%, -50%)`;

        return (
          <EdgeLabelRenderer key={`${id}-label-${index}`}>
            <div
              className={cn(
                "absolute border bg-foreground text-background p-2 rounded-md",
                executionEdge && "font-bold"
              )}
              style={{
                transform,
                pointerEvents: "none",
                borderColor: color,
              }}
            >
              <pre className="text-xs">{label.text}</pre>
            </div>
          </EdgeLabelRenderer>
        );
      })}
    </>
  );
};
