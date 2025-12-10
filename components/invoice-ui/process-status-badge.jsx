import { Badge } from "../ui/badge";
import { cva } from "class-variance-authority";
import { Spinner } from "../ui/spinner";
import {
  CheckIcon,
  Clock1Icon,
  BanIcon,
  CircleXIcon,
  CircleMinusIcon,
} from "lucide-react";
import { cn, humanizeDateTime } from "@/lib/utils";
import { PROCESS_STATUS } from "@/app/constants";
import { Skeleton } from "../ui/skeleton";

export const ProcessIcons = {
  processing: Spinner,
  pending: Clock1Icon,
  completed: CheckIcon,
  failed: CircleXIcon,
  cancelled: BanIcon,
  scheduled: Clock1Icon,
  partially_completed: CheckIcon,
  queued: Clock1Icon,
  running: Spinner,
  skipped: CircleMinusIcon,
  deferred: Clock1Icon,
  up_for_retry: Clock1Icon,
  upstream_failed: Clock1Icon,
  success: CheckIcon,
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

export const statusBackgroundFilledVariants = cva("", {
  variants: {
    variant: {
      processing: "bg-blue-600",
      pending: "bg-amber-500",
      completed: "bg-green-600",
      failed: "bg-red-600",
      cancelled: "bg-slate-600",
      scheduled: "bg-purple-600",
      partially_completed: "bg-amber-500",
      default: "bg-accent",
      queued: "bg-blue-600",
      running: "bg-blue-600",
      skipped: "bg-slate-600",
      deferred: "bg-purple-600",
      up_for_retry: "bg-amber-500",
      upstream_failed: "bg-red-600",
      success: "bg-green-600",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export const statusTextVariants = cva("", {
  variants: {
    variant: {
      processing: "text-blue-900",
      pending: "text-yellow-900",
      completed: "text-green-900",
      failed: "text-red-900",
      cancelled: "text-gray-900",
      scheduled: "text-purple-900",
      partially_completed: "text-orange-900",
      default: "text-accent-foreground",
      queued: "text-blue-900",
      running: "text-green-900",
      skipped: "text-gray-900",
      deferred: "text-purple-900",
      up_for_retry: "text-orange-900",
      upstream_failed: "text-red-900",
      success: "text-green-900",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export const statusTextFilledVariants = cva("", {
  variants: {
    variant: {
      processing: "!text-white",
      pending: "!text-white",
      completed: "!text-white",
      failed: "!text-white",
      cancelled: "!text-white",
      scheduled: "!text-white",
      partially_completed: "!text-white",
      default: "text-accent-foreground",
      queued: "!text-white",
      running: "!text-white",
      skipped: "!text-white",
      deferred: "!text-white",
      up_for_retry: "!text-white",
      upstream_failed: "!text-white",
      success: "!text-white",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export const statusBorderVariants = cva("", {
  variants: {
    variant: {
      processing: "border-blue-300",
      pending: "border-yellow-300",
      completed: "border-green-300",
      failed: "border-red-300",
      cancelled: "border-gray-300",
      scheduled: "border-purple-300",
      partially_completed: "border-orange-300",
      default: "border border-accent",
      queued: "border-blue-300",
      running: "border-green-300",
      skipped: "border-gray-300",
      deferred: "border-purple-300",
      up_for_retry: "border-orange-300",
      upstream_failed: "border-red-300",
      success: "border-green-300",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export const statusBorderFilledVariants = cva("", {
  variants: {
    variant: {
      processing: "border-blue-600",
      pending: "border-amber-500",
      completed: "border-green-600",
      failed: "border-red-600",
      cancelled: "border-slate-600",
      scheduled: "border-purple-600",
      partially_completed: "border-amber-500",
      default: "border border-accent",
      queued: "border-blue-600",
      running: "border-blue-600",
      skipped: "border-slate-600",
      deferred: "border-purple-600",
      up_for_retry: "border-amber-500",
      upstream_failed: "border-red-600",
      success: "border-green-600",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const variants = cva("rounded-full capitalize text-xs border", {
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
  iconClassName,
  iconOnly = false,
  appearance = "outlined", // "outlined" or "filled"
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

  if (iconOnly) {
    return <Icon className={cn("size-4", iconClassName)} />;
  }

  // Choose the appropriate variant classes based on appearance
  const badgeClasses =
    appearance === "filled"
      ? cn(
          statusBackgroundFilledVariants({ variant: type }),
          statusTextFilledVariants({ variant: type }),
          statusBorderFilledVariants({ variant: type })
        )
      : cn(
          statusBackgroundVariants({ variant: type }),
          statusTextVariants({ variant: type }),
          statusBorderVariants({ variant: type })
        );

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-semibold",
        badgeClasses,
        appearance === "filled" && "badge-filled",
        className
      )}
    >
      {Icon && <Icon className={iconClassName} />}
      <span>
        {type}
        {isScheduled && (
          <span className="text-xs">{humanizeDateTime(scheduledTime)}</span>
        )}
      </span>
    </Badge>
  );
}
