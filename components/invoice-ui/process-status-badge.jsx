import { Badge } from "../ui/badge";
import { cva } from "class-variance-authority";
import { Spinner } from "../ui/spinner";

const variants = cva("rounded-lg capitalize", {
  variants: {
    variant: {
      processing: "bg-blue-500 text-white",
      pending: "bg-yellow-500 text-white",
      completed: "bg-green-500 text-white",
      failed: "bg-red-500 text-white",
      cancelled: "bg-gray-500 text-white",
    },
  },
  defaultVariants: {
    variant: "processing",
  },
});

export function ProcessStatusBadge({ status }) {
  const type = status.toLowerCase();
  return (
    <Badge variant="outline" className={variants({ variant: type })}>
      {type}
      {type === "processing" && <Spinner />}
    </Badge>
  );
}
