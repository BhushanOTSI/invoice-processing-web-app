import { BaseEdge, EdgeLabelRenderer } from "@xyflow/react";
import {
  generateEdgePath,
  getPolylineMidpoint,
  getPolylinePoints,
} from "./flow-utils";

export const CustomEdges = ({ id, data }) => {
  const { sections = [], labels = [] } = data;
  const path = generateEdgePath(sections);

  const points = getPolylinePoints(sections);
  const mid = getPolylineMidpoint(points);
  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        style={{
          stroke: "var(--color-muted-foreground)",
          strokeWidth: 2,
        }}
      />
      {labels.map((label, index) => {
        const transform = `translate(${mid.x}px,${label.y}px) translate(-50%, -50%)`;

        return (
          <EdgeLabelRenderer key={`${id}-label-${index}`}>
            <div
              className="absolute border bg-foreground text-background p-2 rounded-md"
              style={{ transform, pointerEvents: "none" }}
            >
              <pre className="text-xs">{label.text}</pre>
            </div>
          </EdgeLabelRenderer>
        );
      })}
    </>
  );
};
