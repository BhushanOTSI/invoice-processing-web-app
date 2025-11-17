"use client";
import {
  Empty,
  EmptyMedia,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
} from "./ui/empty";
import { WifiOffIcon } from "lucide-react";
import { useOffline } from "@/hooks/use-offline";

export function OfflineMessage({ children }) {
  const { isOffline } = useOffline();
  if (!isOffline) return children;

  return (
    <Empty>
      <EmptyMedia variant="icon">
        <WifiOffIcon />
      </EmptyMedia>
      <EmptyHeader>
        <EmptyTitle>You are offline</EmptyTitle>
        <EmptyDescription>
          Please check your internet connection and try again.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
