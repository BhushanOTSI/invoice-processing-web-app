"use client";

import { useParams } from "next/navigation";
import { useSetBreadcrumbs } from "@/hooks/use-set-breadcrumbs";
import { APP_ROUTES } from "@/app/constants/app-routes";
import { useProcessTraceStatus } from "@/services/hooks/useInvoice";
import { PageContainers } from "@/components/invoice-ui/page-containers";
import { Card, CardContent } from "@/components/ui/card";
import { DataItem } from "@/components/invoice-ui/typography";
import { cn, formatFractionalHoursAuto, humanizeDateTime } from "@/lib/utils";
import {
  ProcessIcons,
  ProcessStatusBadge,
} from "@/components/invoice-ui/process-status-badge";
import { RowCell } from "@/components/invoice-ui/data-table";
import { PROCESS_STATUS } from "@/app/constants";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@radix-ui/react-collapsible";
import { ChevronRightIcon, CircleIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { ProcessMessage } from "@/components/invoice-ui/process-message";
import { useProcessingStream } from "@/services/hooks/useBatchProcessInvoice";

const convertToMessage = (data) => {
  return {
    ...data,
    name: data.stepName,
    id: data.stepId,
    extraMetadata: data.metadata,
    processingTimeSeconds: data.processingTimeMs,
  };
};

const addOrUpdateMessage = (messages, data) => {
  if (data.stepName === "Connected") return messages;

  const index = messages.findIndex((message) => message.stepId === data.stepId);
  const convertedMessage = convertToMessage(data);

  if (index !== -1) {
    messages[index] = convertedMessage;
  } else {
    messages.push(convertedMessage);
  }

  return [...messages];
};

export default function ProcessTracePage() {
  const { processID } = useParams();
  useSetBreadcrumbs([
    { title: "Home", url: APP_ROUTES.DASHBOARD },
    { title: "Monitor Traces", url: APP_ROUTES.PROCESSING.TRACE },
    {
      title: "Process Trace",
      url: APP_ROUTES.PROCESSING.TRACE_PROCESS.replace(
        "[processID]",
        processID
      ),
    },
  ]);

  const { data: processTraceStatus, isLoading } =
    useProcessTraceStatus(processID);

  const [activeTab, setActiveTab] = useState(1);
  const [messages, setMessages] = useState([]);
  const isProcessing = useMemo(
    () => processTraceStatus?.status === PROCESS_STATUS.PROCESSING,
    [processTraceStatus?.status]
  );

  const { isLoading: isLoadingProcessingStream } = useProcessingStream(
    processID,
    processID && !isLoading && isProcessing,
    {
      onData: (data) => {
        setMessages((prev) => addOrUpdateMessage(prev || [], data));
      },
    }
  );

  let traceMessages =
    (isProcessing || (messages.length && !processTraceStatus?.messages?.length)
      ? messages
      : processTraceStatus?.messages) || [];

  return (
    <>
      <PageContainers>
        <Card>
          <CardContent>
            <div className="space-x-4 flex flex-col gap-4 md:flex-row items-center text-sm">
              <DataItem
                label="Process ID"
                value={
                  <RowCell
                    value={processTraceStatus?.processId}
                    header="Process ID"
                  />
                }
                allowCopy
                isLoading={isLoading}
              />

              <DataItem
                label="File Name"
                value={
                  <RowCell
                    value={processTraceStatus?.filename || "-"}
                    header="File Name"
                  />
                }
                isLoading={isLoading}
              />

              <DataItem
                label="Start Time"
                value={
                  <span>{humanizeDateTime(processTraceStatus?.startTime)}</span>
                }
                isLoading={isLoading}
              />
              <DataItem
                label="End Time"
                value={
                  <span>
                    {humanizeDateTime(processTraceStatus?.completedAt)}
                  </span>
                }
                isLoading={isLoading}
              />
              <DataItem
                label="Status"
                value={
                  <ProcessStatusBadge
                    status={processTraceStatus?.status}
                    isLoading={isLoading}
                  />
                }
                isLoading={isLoading}
              />
              <DataItem
                label={
                  processTraceStatus?.status === PROCESS_STATUS.PROCESSING
                    ? "Running Steps"
                    : "Steps"
                }
                value={`${processTraceStatus?.currentStep || "-"} / ${
                  processTraceStatus?.totalSteps || "-"
                }`}
                isLoading={isLoading}
              />
              {isLoadingProcessingStream && (
                <div className="flex items-center gap-1 text-xs text-green-500 flex-1 justify-end">
                  Streaming Live
                  <CircleIcon className="size-2 fill-current animate-pulse" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </PageContainers>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <Card className={"p-0 gap-0 overflow-hidden sticky top-0 rounded-none"}>
          <CardContent className={"p-0"}>
            <div className="flex w-full">
              <div className="w-1/3 shrink-0 border-r dark:bg-muted/50 overflow-y-auto h-screen">
                <TabsList className={"flex-col"}>
                  {traceMessages.map((message, index) => {
                    const Icon = ProcessIcons[message.status?.toLowerCase()];

                    return (
                      <TabsTrigger
                        key={message.id}
                        value={index + 1}
                        asChild
                        className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                      >
                        <Collapsible>
                          <div className="w-full text-left cursor-pointer px-2 py-3 border-b last:border-b-0 text-sm">
                            <div className="flex items-center gap-3">
                              <div className="w-4">
                                <CollapsibleTrigger
                                  className="hover:bg-transparent p-0 flex items-center justify-center group/step"
                                  disabled={
                                    ![
                                      PROCESS_STATUS.COMPLETED,
                                      PROCESS_STATUS.FAILED,
                                    ].includes(message.status)
                                  }
                                >
                                  <ChevronRightIcon className="size-4 group-data-[state=open]/step:rotate-90 transition-transform duration-200" />
                                </CollapsibleTrigger>
                              </div>
                              <div className="w-6">
                                <Icon
                                  className={cn(
                                    "size-4",
                                    message.status ===
                                      PROCESS_STATUS.COMPLETED &&
                                      "text-green-500",
                                    message.status === PROCESS_STATUS.FAILED &&
                                      "text-destructive"
                                  )}
                                />
                              </div>
                              <div className="flex-1">{message.name}</div>
                              <div className="min-w-10 text-xs text-center">
                                {message.processingTimeSeconds &&
                                  formatFractionalHoursAuto(
                                    message.processingTimeSeconds,
                                    "seconds"
                                  )}
                                <div>Step {message.stepNum}</div>
                              </div>
                            </div>
                          </div>
                          <CollapsibleContent>
                            <div className="px-4 py-3 text-xs border-b bg-accent text-accent-foreground">
                              {message.description}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </div>
              <div className="flex-1 h-screen min-w-0">
                {isLoading ? (
                  <ProcessMessage message={{}} isLoading={isLoading} />
                ) : (
                  traceMessages.map((message, index) => (
                    <TabsContent
                      key={message.id}
                      value={index + 1}
                      className="h-screen"
                    >
                      <ProcessMessage message={message} />
                    </TabsContent>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </Tabs>
    </>
  );
}
