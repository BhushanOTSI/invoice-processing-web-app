import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
  CardAction,
} from "../ui/card";

export function KpiCard({
  title,
  value,
  icon,
  className,
  description,
  isLoading,
}) {
  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle>
          {isLoading && <Skeleton className="w-1/2 h-4" />}
          {!isLoading && title}
        </CardTitle>
        <CardDescription>
          {isLoading && <Skeleton className="w-full h-4" />}
          {!isLoading && description}
        </CardDescription>
        <CardAction>
          {isLoading && <Skeleton className="w-full rounded-full h-6" />}
          {!isLoading && icon}
        </CardAction>
      </CardHeader>
      <CardContent className={cn("text-2xl font-bold")}>
        {isLoading && <Skeleton className="w-full h-6" />}
        {!isLoading && value}
      </CardContent>
    </Card>
  );
}
