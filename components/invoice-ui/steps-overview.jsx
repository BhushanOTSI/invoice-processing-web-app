"use client";

import { AlertCircleIcon, FootprintsIcon } from "lucide-react";
import { Button } from "../ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";
import {
  formatDate,
  formatFractionalHoursAuto,
  isCompletedProcessing,
} from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { ProcessStatusBadge } from "./process-status-badge";
import { Timeline } from "../timeline";
import { Alert, AlertDescription } from "../ui/alert";
import { APP_ROUTES } from "@/app/constants/app-routes";
import { useRouter } from "next/navigation";

export default function StepsOverview({ process = {} }) {
  const router = useRouter();
  const { status } = process;
  const isCompleted = isCompletedProcessing(status);

  if (!isCompleted) return null;

  return (
    <Drawer direction="right">
      <DrawerTrigger>
        <Tooltip>
          <TooltipTrigger asChild>
            <FootprintsIcon className="size-4" />
          </TooltipTrigger>
          <TooltipContent className="space-y-2 max-w-60">
            <p className="text-xs font-semibold">Click to view Overview</p>
            <div className="line-clamp-6">
              {process?.detailsResponseJson?.error ||
                process?.detailsResponseJson?.message}
            </div>
          </TooltipContent>
        </Tooltip>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className={"truncate"}>
            {process?.detailsResponseJson?.message}
          </DrawerTitle>
          <DrawerDescription>
            <ProcessStatusBadge status={process?.status} />
          </DrawerDescription>
        </DrawerHeader>
        <StepsOverviewContent process={process} />
        <DrawerFooter>
          <Button
            variant="outline"
            onClick={() => {
              const url = APP_ROUTES.getRoute(
                APP_ROUTES.PROCESSING.TRACE_PROCESS,
                {
                  processID: process.processId,
                }
              );

              router.push(url);
            }}
          >
            View Logs
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

export function StepsOverviewContent({ process }) {
  const {
    processSession: { messages = [] },
    error,
  } = process?.detailsResponseJson || { processSession: { messages: [] } };

  return (
    <div className="px-4 flex-1 text-sm space-y-6 overflow-auto">
      {error && (
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertDescription className="line-clamp-6 break-all">
            {error}
          </AlertDescription>
        </Alert>
      )}
      <Timeline
        items={messages.map((message) => ({
          id: message.id,
          title: message.name,
          status: message.status,
          header: (
            <div>
              Step {message.stepNum} -{" "}
              {formatFractionalHoursAuto(
                message.processingTimeSeconds,
                "seconds"
              )}
            </div>
          ),
          description: message.message,
        }))}
      />
    </div>
  );
}
