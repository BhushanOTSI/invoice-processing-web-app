import { cn } from "@/lib/utils";
import { CopyToClipboard } from "../ui/copy-to-clipboard";
import { Skeleton } from "../ui/skeleton";

export function PageTitle({ title }) {
  return <h1 className="text-2xl font-semibold">{title}</h1>;
}

export function PageDescription({ description }) {
  return <p className="text-sm text-muted-foreground">{description}</p>;
}

export function PageSubtitle({ subtitle }) {
  return <h2 className="text-lg font-semibold">{subtitle}</h2>;
}

export function PageSubdescription({ subdescription }) {
  return <p className="text-sm text-muted-foreground">{subdescription}</p>;
}

export function PageDescriptiveSection({ children }) {
  return <div className="[&_*]:leading-relaxed">{children}</div>;
}

export function DataItem({
  label,
  value,
  allowCopy = false,
  className,
  isLoading = false,
}) {
  return (
    <div className={cn(className, isLoading && "min-w-36 space-y-2")}>
      <div className="text-muted-foreground">
        {isLoading ? <Skeleton className="w-1/2 h-4" /> : label}
      </div>
      <div className="flex gap-2">
        {isLoading ? <Skeleton className="w-full h-4" /> : <div>{value}</div>}

        {allowCopy && <CopyToClipboard value={value} isLoading={isLoading} />}
      </div>
    </div>
  );
}
