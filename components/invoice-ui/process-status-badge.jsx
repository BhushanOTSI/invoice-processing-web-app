import { Badge } from "../ui/badge";
import { cva } from "class-variance-authority";
import { Spinner } from "../ui/spinner";
import {
  CheckIcon,
  Clock1Icon,
  XIcon,
  BanIcon,
  CheckCircle2Icon,
} from "lucide-react";

export const ProcessIcons = {
  processing: Spinner,
  pending: Clock1Icon,
  completed: CheckIcon,
  failed: XIcon,
  cancelled: BanIcon,
  scheduled: Clock1Icon,
  partially_completed: CheckCircle2Icon,
};

const variants = cva("rounded-lg capitalize", {
  variants: {
    variant: {
      processing: "bg-blue-500 text-white",
      pending: "bg-yellow-500 text-white",
      completed: "bg-green-500 text-white",
      failed: "bg-red-500 text-white",
      cancelled: "bg-gray-500 text-white",
      scheduled: "bg-purple-500 text-white",
      partially_completed: "bg-orange-500 text-white",
    },
  },
  defaultVariants: {
    variant: "processing",
  },
});

export function ProcessStatusBadge({ status, isLoading = false }) {
  if (isLoading) {
    return <Skeleton className="w-8 h-8" />;
  }

  if (!status) {
    return <Badge variant="outline">Unknown</Badge>;
  }

  const type = status.toLowerCase();
  const Icon = ProcessIcons[type];

  return (
    <Badge variant="outline" className={variants({ variant: type })}>
      {type} {Icon && <Icon />}
    </Badge>
  );
}
