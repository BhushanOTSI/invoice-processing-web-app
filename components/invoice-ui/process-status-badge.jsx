import { Badge } from "../ui/badge";
import { cva } from "class-variance-authority";
import { Spinner } from "../ui/spinner";
import {
  CheckIcon,
  Clock1Icon,
  XIcon,
  BanIcon,
  CheckCheckIcon,
} from "lucide-react";
import { cn, humanizeDateTime } from "@/lib/utils";
import { PROCESS_STATUS } from "@/app/constants";

export const ProcessIcons = {
  processing: Spinner,
  pending: Clock1Icon,
  completed: CheckCheckIcon,
  failed: XIcon,
  cancelled: BanIcon,
  scheduled: Clock1Icon,
  partially_completed: CheckIcon,
};

const variants = cva("rounded-lg capitalize text-xs", {
  variants: {
    variant: {
      processing: "bg-blue-100 text-blue-800 border-blue-300",
      pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
      completed: "bg-green-100 text-green-800 border-green-300",
      failed: "bg-red-100 text-red-800 border-red-300",
      cancelled: "bg-gray-100 text-gray-800 border-gray-300",
      scheduled: "bg-purple-100 text-purple-800 border-purple-300",
      partially_completed: "bg-orange-100 text-orange-800 border-orange-300",
    },
  },
  defaultVariants: {
    variant: "processing",
  },
});

export function ProcessStatusBadge({
  status,
  isLoading = false,
  scheduledTime,
}) {
  const isScheduled = status === PROCESS_STATUS.SCHEDULED;
  if (isLoading) {
    return <Skeleton className="w-8 h-8" />;
  }

  if (!status) {
    return <Badge variant="outline">Unknown</Badge>;
  }

  const type = status.toLowerCase();
  const Icon = ProcessIcons[type];

  return (
    <Badge
      variant="outline"
      className={cn("font-semibold", variants({ variant: type }))}
    >
      {Icon && <Icon />} {type}
      {isScheduled && (
        <span className="text-xs">{humanizeDateTime(scheduledTime)}</span>
      )}
    </Badge>
  );
}
