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
      <BaseNodeHeaderTitle className="break-all">
        {data.label || data.name}
      </BaseNodeHeaderTitle>
      <ProcessStatusBadge
        status={data.status}
        appearance="filled"
        className="text-sm"
      />
    </BaseNodeHeader>

    {data.description && <BaseNodeContent>{data.description}</BaseNodeContent>}
  </BaseNode>
));

NodeContent.displayName = "NodeContent";

export default NodeContent;
