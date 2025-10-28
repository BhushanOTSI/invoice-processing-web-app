"use client";

import * as React from "react";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";
import { cn } from "@/lib/utils";

const ResizablePanelGroup = React.forwardRef(({ className, ...props }, ref) => (
    <PanelGroup
        ref={ref}
        className={cn(
            "flex h-full w-full data-[panel-group-direction=vertical]:flex-col",
            className
        )}
        {...props}
    />
));
ResizablePanelGroup.displayName = "ResizablePanelGroup";

const ResizablePanel = Panel;

const ResizableHandle = ({
    withHandle,
    className,
    ...props
}) => {
    return (
        <PanelResizeHandle
            className={cn(
                "relative flex w-1 items-center justify-center bg-transparent hover:bg-gray-200/20 dark:hover:bg-gray-700/20 transition-all duration-200 group cursor-col-resize",
                "border-l border-r border-gray-200/40 dark:border-gray-600/40 hover:border-gray-300/60 dark:hover:border-gray-500/60",
                "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-400/50",
                "data-[panel-group-direction=vertical]:h-1 data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:cursor-row-resize data-[panel-group-direction=vertical]:border-t data-[panel-group-direction=vertical]:border-b data-[panel-group-direction=vertical]:border-l-0 data-[panel-group-direction=vertical]:border-r-0",
                className
            )}
            {...props}
        >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-80 group-hover:opacity-100 transition-all duration-300">
                <div className="flex items-center gap-0.5 py-1 px-1.5 rounded-md bg-background/90 dark:bg-gray-800/90 border border-gray-200/50 dark:border-gray-600/50 shadow-sm hover:shadow-md hover:bg-background dark:hover:bg-gray-800 transition-all duration-200">
                    <button
                        className="p-0.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"

                    >
                        <svg width="5" height="5" viewBox="0 0 8 8" fill="none" className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
                            <path d="M5 1.5L2.5 4L5 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                    <div className="w-px h-3 bg-gray-300 dark:bg-gray-600"></div>
                    <button
                        className="p-0.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"

                    >
                        <svg width="5" height="5" viewBox="0 0 8 8" fill="none" className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
                            <path d="M3 1.5L5.5 4L3 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>
            </div>
        </PanelResizeHandle>
    );
}; export { ResizablePanelGroup, ResizablePanel, ResizableHandle };