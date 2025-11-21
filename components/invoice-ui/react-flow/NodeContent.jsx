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
    </BaseNodeHeader>

    <BaseNodeContent className="border-t dark:border-white/80">
      {data.description}

      <ProcessStatusBadge status={data.status} className="text-sm" />
    </BaseNodeContent>
  </BaseNode>
));

NodeContent.displayName = "NodeContent";

export default NodeContent;
