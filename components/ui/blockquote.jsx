"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const Blockquote = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <blockquote
      ref={ref}
      className={cn(
        "mt-6 border-l-4 border-primary pl-6 italic text-muted-foreground",
        className
      )}
      {...props}
    />
  );
});

Blockquote.displayName = "Blockquote";

export { Blockquote };
