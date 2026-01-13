import {
  cn,
  isFailedProcessing,
  isProcessing,
  isSkippedProcessing,
  isSuccessProcessing,
  isCancelledProcessing,
} from "@/lib/utils";
import { PROCESS_STATUS } from "@/app/constants";
import { NodeContent } from "./NodeContent";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useLayoutEffect, useRef } from "react";
import { CircleIcon, PlayIcon } from "lucide-react";

const getNodeClassName = (status, isActive) => {
  const statusLower = (status || "").toLowerCase();

  // Active/Selected nodes

  if (isActive) {
    if (isProcessing(status)) {
      return "node-processing-border";
    }

    return "node-active-gradient";
  }

  // Non-active nodes - solid colors based on status
  if (isFailedProcessing(status)) {
    return "node-failed";
  }

  if (isSuccessProcessing(status)) {
    return "node-success";
  }

  if (isSkippedProcessing(status)) {
    return "node-skipped";
  }

  if (isCancelledProcessing(status)) {
    return "node-cancelled";
  }

  // Handle pending, scheduled, and other specific statuses
  if (
    statusLower === PROCESS_STATUS.PENDING ||
    statusLower === PROCESS_STATUS.PARTIALLY_COMPLETED ||
    statusLower === PROCESS_STATUS.UP_FOR_RETRY
  ) {
    return "node-pending";
  }

  if (
    statusLower === PROCESS_STATUS.SCHEDULED ||
    statusLower === PROCESS_STATUS.DEFERRED
  ) {
    return "node-scheduled";
  }

  if (isProcessing(status)) {
    return "node-processing-border";
  }

  // Default
  return "";
};

export const CustomNode = ({
  id,
  data,
  onClick,
  isActive,
  isPlaybackActive,
  ...props
}) => {
  const isSkipped = isSkippedProcessing(data.status);

  const Content = (
    <NodeContent
      data={data}
      className={cn("rounded-2xl p-4", getNodeClassName(data.status, isActive))}
      onClick={(node) => !isSkipped && onClick(node)}
      {...props}
    />
  );

  if (isPlaybackActive && isActive) {
    return (
      <>
        {Content}
        <div className="absolute top-2.5 right-2.5 flex items-center justify-center animate-pulse text-green-600 dark:text-green-400 border border-green-600 rounded-full p-0.5">
          <CircleIcon className="size-3 fill-current animate-pulse" />
        </div>
      </>
    );
  }

  return !isSkipped && !isPlaybackActive ? (
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
