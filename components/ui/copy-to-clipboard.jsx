"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "./button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function CopyToClipboard({
  value,
  className,
  isLoading = false,
  iconSize = "size-4",
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      const valueToCopy = value?.props?.value || value;
      await navigator.clipboard.writeText(valueToCopy);
      setCopied(true);
      toast.success("Copied to clipboard");

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      toast.error("Failed to copy to clipboard");
    }
  };

  if (isLoading || !value) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleCopy}
      className={cn(`p-0`, className, iconSize)}
      title="Copy to clipboard"
    >
      {copied ? (
        <Check className={cn("text-green-600", iconSize)} />
      ) : (
        <Copy className={cn(iconSize)} />
      )}
    </Button>
  );
}
