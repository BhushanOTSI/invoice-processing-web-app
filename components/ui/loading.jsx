import { cn } from "@/lib/utils";
import { Spinner } from "./spinner";
import { Skeleton } from "./skeleton";
import { Card, CardContent, CardHeader } from "./card";
import { FileText, Clock, CheckCircle, AlertCircle } from "lucide-react";

/**
 * Business-themed loading component for invoice processing
 */
function LoadingSpinner({ 
  size = "default", 
  className,
  ...props 
}) {
  const sizeClasses = {
    sm: "size-4",
    default: "size-6", 
    lg: "size-8",
    xl: "size-12"
  };

  return (
    <div className={cn("flex items-center justify-center", className)} {...props}>
      <Spinner className={sizeClasses[size]} />
    </div>
  );
}

/**
 * Loading component with business context
 */
function BusinessLoading({ 
  message = "Processing invoices...",
  submessage = "Please wait while we load your data",
  showProgress = false,
  className,
  ...props 
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 space-y-4", className)} {...props}>
      <div className="relative">
        <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center">
          <FileText className="size-8 text-primary animate-pulse" />
        </div>
        <div className="absolute -top-1 -right-1">
          <Spinner className="size-6 text-primary" />
        </div>
      </div>
      
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-foreground">{message}</h3>
        <p className="text-sm text-muted-foreground">{submessage}</p>
      </div>

      {showProgress && (
        <div className="w-full max-w-xs">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full animate-pulse" style={{ width: "60%" }} />
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Table loading skeleton for invoice processing tables
 */
function TableLoadingSkeleton({ 
  rows = 5, 
  columns = 6,
  showHeader = true,
  className,
  ...props 
}) {
  return (
    <div className={cn("space-y-4", className)} {...props}>
      {showHeader && (
        <div className="flex space-x-4">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-8 flex-1" />
          ))}
        </div>
      )}
      
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex space-x-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton 
                key={colIndex} 
                className={cn(
                  "h-6 flex-1",
                  colIndex === 0 && "w-12", // First column (status/icon)
                  colIndex === columns - 1 && "w-20" // Last column (actions)
                )} 
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Page loading skeleton that matches the invoice processing layout
 */
function PageLoadingSkeleton({ className, ...props }) {
  return (
    <div className={cn("p-6 space-y-6", className)} {...props}>
      {/* Header section */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Filter section */}
      <div className="flex space-x-4">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-24" />
      </div>

      {/* Table skeleton */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-8 w-24" />
          </div>
        </CardHeader>
        <CardContent>
          <TableLoadingSkeleton rows={8} columns={6} showHeader={true} />
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Processing status loading with animated icons
 */
function ProcessingStatusLoading({ 
  status = "processing",
  className,
  ...props 
}) {
  const statusConfig = {
    processing: {
      icon: Clock,
      message: "Processing invoices...",
      color: "text-blue-600"
    },
    validating: {
      icon: CheckCircle,
      message: "Validating data...",
      color: "text-green-600"
    },
    error: {
      icon: AlertCircle,
      message: "Checking for errors...",
      color: "text-red-600"
    }
  };

  const config = statusConfig[status] || statusConfig.processing;
  const Icon = config.icon;

  return (
    <div className={cn("flex items-center space-x-3 p-4", className)} {...props}>
      <Icon className={cn("size-5 animate-pulse", config.color)} />
      <span className="text-sm font-medium">{config.message}</span>
      <Spinner className="size-4" />
    </div>
  );
}

/**
 * Compact loading for inline use
 */
function InlineLoading({ 
  message = "Loading...",
  size = "sm",
  className,
  ...props 
}) {
  return (
    <div className={cn("flex items-center space-x-2", className)} {...props}>
      <Spinner size={size} />
      <span className="text-sm text-muted-foreground">{message}</span>
    </div>
  );
}

export {
  LoadingSpinner,
  BusinessLoading,
  TableLoadingSkeleton,
  PageLoadingSkeleton,
  ProcessingStatusLoading,
  InlineLoading
};
