"use client";

import { TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import { BadgeCheckIcon, BanIcon, CircleXIcon } from "lucide-react";

function StepConnector({ isCompleted, isLoading }) {
  return (
    <div className="flex items-center px-1.5 min-w-[20px] shrink-0">
      <div
        className={cn(
          "h-[2px] w-full rounded-full",
          "transition-colors duration-300 ease-in-out",
          isCompleted && "bg-emerald-500",
          !isCompleted && !isLoading && "bg-border",
          isLoading && "bg-muted-foreground/20"
        )}
      />
    </div>
  );
}

function StepTabTrigger({
  children,
  className,
  stepNumber,
  isProcessing,
  isLoading,
  isCompleted,
  isFailed,
  isCancelled,
  isPreviousStepCompleted = false,
  ...props
}) {
  const isDisabled = isLoading || !isPreviousStepCompleted;

  return (
    <TabsTrigger
      className={cn(
        "group/tab relative flex items-center gap-2",
        "px-2 py-3",
        "min-w-0 ",
        "justify-center",
        // Prevent layout shift
        "will-change-auto",
        // Hover
        !isDisabled && "cursor-pointer",
        // Disabled
        isDisabled && "opacity-50 cursor-not-allowed pointer-events-none",
        className
      )}
      disabled={isDisabled}
      {...props}
    >
      {/* Step Badge */}
      <div
        className={cn(
          "relative flex items-center justify-center shrink-0",
          "size-6 rounded-full",
          "font-semibold text-[10px] leading-none",
          "border-2",
          // Smooth color transitions
          "transition-[background-color,border-color,color,transform] duration-300 ease-in-out",
          // Isolate transform to prevent layout shift
          "transform-gpu will-change-transform",
          // Status colors - solid fills for status
          isCompleted &&
            !isFailed &&
            !isCancelled && ["bg-emerald-500 border-emerald-500 text-white"],
          isProcessing && ["bg-blue-500 border-blue-500 text-white"],
          isFailed && ["bg-red-500 border-red-500 text-white"],
          isCancelled && ["bg-gray-500 border-gray-500 text-white"],
          // Pending state - outline style
          !isCompleted &&
            !isProcessing &&
            !isFailed &&
            !isCancelled &&
            !isLoading && [
              "bg-transparent border-border text-muted-foreground",
              "group-data-[state=active]/tab:border-primary group-data-[state=active]/tab:text-primary",
            ],
          isLoading && ["bg-transparent border-border text-muted-foreground"]
        )}
      >
        {isLoading || isProcessing ? (
          <Spinner className="size-3.5" />
        ) : isCompleted && !isFailed && !isCancelled ? (
          <BadgeCheckIcon className="size-3.5 stroke-[2.5]" />
        ) : isFailed ? (
          <CircleXIcon className="size-3.5 stroke-[2.5]" />
        ) : isCancelled ? (
          <BanIcon className="size-3.5 stroke-[2.5]" />
        ) : (
          <span className="mt-px">{stepNumber}</span>
        )}
      </div>

      {/* Label - use consistent font-weight to prevent width flicker */}
      <span
        className={cn(
          "text-sm font-medium tracking-tight",
          "transition-[color] duration-200 ease-out",
          // Keep font-medium consistent to prevent width change
          // Active state uses full opacity, inactive uses reduced
          "group-data-[state=active]/tab:text-foreground",
          !isDisabled && "text-foreground/70",
          isDisabled && "text-muted-foreground/60",
          "whitespace-nowrap truncate min-w-0"
        )}
      >
        {children}
      </span>

      {/* Processing pulse indicator */}
      {isProcessing && (
        <div className="absolute top-1.5 right-1.5 z-10">
          <span className="relative flex size-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-60" />
            <span className="relative inline-flex rounded-full size-2 bg-blue-600" />
          </span>
        </div>
      )}

      {/* Animated sliding underline - attached to border */}
      <div
        className={cn(
          "absolute -bottom-px left-0 right-0 h-1 bg-primary",
          "transition-all duration-300 ease-out",
          "scale-x-0 origin-center",
          "group-data-[state=active]/tab:scale-x-100"
        )}
      />
    </TabsTrigger>
  );
}

/**
 * StepTabsList - A reusable component for displaying step-based tabs with status indicators
 *
 * @param {Object} props
 * @param {Array} props.tabs - Array of tab objects with the following structure:
 *   - value: string - Unique identifier for the tab
 *   - label: string - Display text for the tab
 *   - stepNumber: number - Step number to display in badge
 *   - isProcessing: boolean - Whether the step is currently processing
 *   - isLoading: boolean - Whether the step is loading
 *   - isCompleted: boolean - Whether the step is completed
 *   - isFailed: boolean - Whether the step has failed
 *   - isCancelled: boolean - Whether the step was cancelled
 *   - isPreviousStepCompleted: boolean - Whether the previous step is completed (for enabling/disabling)
 * @param {string} props.className - Optional additional className for the container
 */
export function StepTabsList({ tabs = [], className }) {
  return (
    <div
      className={cn(
        "pb-0 border-b border-border/50 shrink-0 overflow-hidden relative",
        className
      )}
    >
      <TabsList className="flex items-center gap-0 w-full bg-transparent p-0 h-auto">
        {tabs.map((tab, index) => (
          <div key={tab.value} className="contents">
            <StepTabTrigger
              value={tab.value}
              stepNumber={tab.stepNumber}
              isProcessing={tab.isProcessing}
              isLoading={tab.isLoading}
              isCompleted={tab.isCompleted}
              isFailed={tab.isFailed}
              isCancelled={tab.isCancelled}
              isPreviousStepCompleted={tab.isPreviousStepCompleted}
            >
              {tab.label}
            </StepTabTrigger>
            {/* Add connector between tabs, but not after the last one */}
            {index < tabs.length - 1 && (
              <StepConnector
                isCompleted={tab.isCompleted}
                isLoading={tab.isLoading}
              />
            )}
          </div>
        ))}
      </TabsList>
    </div>
  );
}
