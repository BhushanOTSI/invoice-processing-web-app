import {
  cn,
  isFailedProcessing,
  isProcessing,
  isSkippedProcessing,
  isSuccessProcessing,
} from "@/lib/utils";
import { NodeContent } from "./NodeContent";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useLayoutEffect, useRef } from "react";

export const CustomNode = ({ id, data, onClick, isActive, ...props }) => {
  const isSkipped = isSkippedProcessing(data.status);

  const Content = (
    <NodeContent
      data={data}
      className={cn(
        isActive && "node-active-gradient",
        !isActive && isProcessing(data.status) && "node-processing-border",
        isFailedProcessing(data.status) && !isActive && "node-failed",
        isSkipped && "node-skipped",
        isSuccessProcessing(data.status) && !isActive && "node-success"
      )}
      onClick={onClick}
      {...props}
    />
  );

  return !isSkipped ? (
    <Tooltip>
      <TooltipTrigger asChild>{Content}</TooltipTrigger>
      <TooltipContent>Click to view logs</TooltipContent>
    </Tooltip>
  ) : (
    Content
  );
};

export const FakeNode = ({ id, data, registerSize }) => {
  const ref = useRef(null);

  useLayoutEffect(() => {
    requestAnimationFrame(() => {
      if (!ref.current) return;

      registerSize(id, {
        width: ref.current.offsetWidth + 8,
        height: ref.current.offsetHeight,
      });
    });
  }, [id, data]);

  return (
    <div
      style={{
        visibility: "hidden",
        position: "absolute",
        left: -9999,
        top: 0,
      }}
      ref={ref}
    >
      <CustomNode
        id={id}
        data={data}
        style={{ maxWidth: 400, minWidth: 250 }}
      />
    </div>
  );
};
