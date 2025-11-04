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
  queued: Clock1Icon,
  running: Spinner,
  skipped: XIcon,
  deferred: Clock1Icon,
  up_for_retry: Clock1Icon,
  upstream_failed: XIcon,
  success: BadgeCheckIcon,
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
      queued: "bg-blue-50",
      running: "bg-green-50",
      skipped: "bg-gray-50",
      deferred: "bg-purple-50",
      up_for_retry: "bg-orange-50",
      upstream_failed: "bg-red-50",
      success: "bg-green-50",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export const statusTextVariants = cva("", {
  variants: {
    variant: {
      processing: "text-blue-700",
      pending: "text-yellow-700",
      completed: "text-green-700",
      failed: "text-red-700",
      cancelled: "text-gray-600",
      scheduled: "text-purple-700",
      partially_completed: "text-orange-700",
      default: "text-accent-foreground",
      queued: "text-blue-700",
      running: "text-green-700",
      skipped: "text-gray-600",
      deferred: "text-purple-700",
      up_for_retry: "text-orange-700",
      upstream_failed: "text-red-700",
      success: "text-green-700",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export const statusBorderVariants = cva("", {
  variants: {
    variant: {
      processing: "border border-blue-300",
      pending: "border border-yellow-300",
      completed: "border border-green-300",
      failed: "border border-red-300",
      cancelled: "border border-gray-300",
      scheduled: "border border-purple-300",
      partially_completed: "border border-orange-300",
      default: "border border-accent",
      queued: "border border-blue-300",
      running: "border border-green-300",
      skipped: "border border-gray-300",
      deferred: "border border-purple-300",
      up_for_retry: "border border-orange-300",
      upstream_failed: "border border-red-300",
      success: "border border-green-300",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const variants = cva("rounded-full capitalize text-xs", {
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
      queued: cn(
        statusBackgroundVariants({ variant: "queued" }),
        statusTextVariants({ variant: "queued" }),
        statusBorderVariants({ variant: "queued" })
      ),
      running: cn(
        statusBackgroundVariants({ variant: "running" }),
        statusTextVariants({ variant: "running" }),
        statusBorderVariants({ variant: "running" })
      ),
      skipped: cn(
        statusBackgroundVariants({ variant: "skipped" }),
        statusTextVariants({ variant: "skipped" }),
        statusBorderVariants({ variant: "skipped" })
      ),
      deferred: cn(
        statusBackgroundVariants({ variant: "deferred" }),
        statusTextVariants({ variant: "deferred" }),
        statusBorderVariants({ variant: "deferred" })
      ),
      up_for_retry: cn(
        statusBackgroundVariants({ variant: "up_for_retry" }),
        statusTextVariants({ variant: "up_for_retry" }),
        statusBorderVariants({ variant: "up_for_retry" })
      ),
      upstream_failed: cn(
        statusBackgroundVariants({ variant: "upstream_failed" }),
        statusTextVariants({ variant: "upstream_failed" }),
        statusBorderVariants({ variant: "upstream_failed" })
      ),
      success: cn(
        statusBackgroundVariants({ variant: "success" }),
        statusTextVariants({ variant: "success" }),
        statusBorderVariants({ variant: "success" })
      ),
      default: cn(
        statusBackgroundVariants({ variant: "default" }),
        statusTextVariants({ variant: "default" }),
        statusBorderVariants({ variant: "default" })
      ),
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export function ProcessStatusBadge({
  isLoading = false,
  scheduledTime,
  className,
  status,
}) {
  const isScheduled = status === PROCESS_STATUS.SCHEDULED;
  if (isLoading) {
    return <Skeleton className="w-20 h-4" />;
  }

  if (!status) {
    return (
      <Badge variant="outline" className={variants({ variant: "default" })}>
        Unknown
      </Badge>
    );
  }

  const type = status.toLowerCase();
  const Icon = ProcessIcons[type];

  return (
    <Badge
      variant="outline"
      className={cn("font-semibold", variants({ variant: type }), className)}
    >
      {Icon && <Icon />}
      <span>
        {type}
        {isScheduled && (
          <span className="text-xs">{humanizeDateTime(scheduledTime)}</span>
        )}
      </span>
    </Badge>
  );
}
