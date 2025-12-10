import {
  BaseNode,
  BaseNodeHeader,
  BaseNodeHeaderTitle,
  BaseNodeContent,
} from "@/components/base-node";
import { ProcessStatusBadge } from "../process-status-badge";
import { forwardRef } from "react";

export const NodeContent = forwardRef(({ data, ...props }, ref) => (
  <BaseNode ref={ref} {...props}>
    <BaseNodeHeader>
      <BaseNodeHeaderTitle className="break-words font-medium">
        {String(data.label || data.name).replaceAll("_", " ")}
      </BaseNodeHeaderTitle>
      <ProcessStatusBadge
        status={data.status}
        appearance="filled"
        className="text-sm"
      />
    </BaseNodeHeader>

    {data.description && (
      <BaseNodeContent className="text-sm">{data.description}</BaseNodeContent>
    )}
  </BaseNode>
));

NodeContent.displayName = "NodeContent";

export default NodeContent;
