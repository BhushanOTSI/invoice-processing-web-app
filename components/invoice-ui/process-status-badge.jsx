import { Badge } from "../ui/badge";
import { cva } from "class-variance-authority";
import { Spinner } from "../ui/spinner";
import {
  CheckIcon,
  Clock1Icon,
  XIcon,
  BanIcon,
  BadgeCheckIcon,
} from "lucide-react";
import { cn, humanizeDateTime } from "@/lib/utils";
import { PROCESS_STATUS } from "@/app/constants";
import { Skeleton } from "../ui/skeleton";

export const ProcessIcons = {
  processing: Spinner,
  pending: Clock1Icon,
  completed: BadgeCheckIcon,
  failed: XIcon,
  cancelled: BanIcon,
  scheduled: Clock1Icon,
  partially_completed: CheckIcon,
};

export const statusBackgroundVariants = cva("", {
  variants: {
    variant: {
      processing: "bg-blue-50",
      pending: "bg-yellow-50",
      completed: "bg-green-50",
      failed: "bg-red-50",
      cancelled: "bg-gray-50",
      scheduled: "bg-purple-50",
      partially_completed: "bg-orange-50",
      default: "bg-accent",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export const statusTextVariants = cva("", {
  variants: {
    variant: {
      processing: "text-blue-600",
      pending: "text-yellow-600",
      completed: "text-green-600",
      failed: "text-red-600",
      cancelled: "text-gray-600",
      scheduled: "text-purple-600",
      partially_completed: "text-orange-600",
      default: "text-accent-foreground",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export const statusBorderVariants = cva("", {
  variants: {
    variant: {
      processing: "border dark:border-none border-blue-300",
      pending: "border dark:border-none border-yellow-300",
      completed: "border dark:border-none border-green-300",
      failed: "border dark:border-none border-red-300",
      cancelled: "border dark:border-none border-gray-300",
      scheduled: "border dark:border-none border-purple-300",
      partially_completed: "border dark:border-none border-orange-300",
      default: "border dark:border-none border-accent",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const variants = cva("rounded-lg capitalize text-xs", {
  variants: {
    variant: {
      processing: cn(
        statusBackgroundVariants({ variant: "processing" }),
        statusTextVariants({ variant: "processing" }),
        statusBorderVariants({ variant: "processing" })
      ),
      pending: cn(
        statusBackgroundVariants({ variant: "pending" }),
        statusTextVariants({ variant: "pending" }),
        statusBorderVariants({ variant: "pending" })
      ),
      completed: cn(
        statusBackgroundVariants({ variant: "completed" }),
        statusTextVariants({ variant: "completed" }),
        statusBorderVariants({ variant: "completed" })
      ),
      failed: cn(
        statusBackgroundVariants({ variant: "failed" }),
        statusTextVariants({ variant: "failed" }),
        statusBorderVariants({ variant: "failed" })
      ),
      cancelled: cn(
        statusBackgroundVariants({ variant: "cancelled" }),
        statusTextVariants({ variant: "cancelled" }),
        statusBorderVariants({ variant: "cancelled" })
      ),
      scheduled: cn(
        statusBackgroundVariants({ variant: "scheduled" }),
        statusTextVariants({ variant: "scheduled" }),
        statusBorderVariants({ variant: "scheduled" })
      ),
      partially_completed: cn(
        statusBackgroundVariants({ variant: "partially_completed" }),
        statusTextVariants({ variant: "partially_completed" }),
        statusBorderVariants({ variant: "partially_completed" })
      ),
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
  className,
}) {
  const isScheduled = status === PROCESS_STATUS.SCHEDULED;
  if (isLoading) {
    return <Skeleton className="w-20 h-4" />;
  }

  if (!status) {
    return <Badge variant="outline">Unknown</Badge>;
  }

  const type = status.toLowerCase();
  const Icon = ProcessIcons[type];

  return (
    <Badge
      variant="outline"
      className={cn("font-semibold", variants({ variant: type }), className)}
    >
      {Icon && <Icon />}{" "}
      <span>
        {type}
        {isScheduled && (
          <span className="text-xs">{humanizeDateTime(scheduledTime)}</span>
        )}
      </span>
    </Badge>
  );
}
