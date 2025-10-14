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
import { ChevronRightIcon, CircleIcon, LinkIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { ProcessMessage } from "@/components/invoice-ui/process-message";
import { useProcessingStream } from "@/services/hooks/useBatchProcessInvoice";
import Link from "next/link";
import { CopyToClipboard } from "@/components/ui/copy-to-clipboard";
import { Skeleton } from "@/components/ui/skeleton";

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

  const [documentNumber, setDocumentNumber] = useState("");
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

  const isMainProcessCompleted = [
    PROCESS_STATUS.COMPLETED,
    PROCESS_STATUS.FAILED,
  ].includes(processTraceStatus?.status);

  return (
    <>
      <PageContainers>
        <div className="space-y-2 md:space-y-0 md:space-x-4 flex flex-col gap-4 md:flex-row items-center text-sm">
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
              <span>{humanizeDateTime(processTraceStatus?.completedAt)}</span>
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
            label={isProcessing ? "Running Steps" : "Steps"}
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
          {documentNumber && (
            <DataItem
              label="Collabration Workspace"
              value={(() => {
                const href = `https://cw.otsiaistudio.com/invoice/${documentNumber}`;
                return (
                  <span className="flex items-center gap-1">
                    <Link
                      href={href}
                      target="_blank"
                      className="text-primary underline hover:no-underline"
                    >
                      {documentNumber}
                    </Link>
                    <CopyToClipboard value={documentNumber} />
                  </span>
                );
              })()}
              isLoading={isLoading}
            />
          )}
        </div>
      </PageContainers>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <Card
          className={
            "p-0 gap-0 overflow-hidden sticky top-0 rounded-none border-x-0 "
          }
        >
          <CardContent className={"p-0"}>
            <div className="flex w-full">
              <div
                className={cn(
                  "w-1/3 shrink-0 border-r dark:bg-muted/50 overflow-y-auto h-screen",
                  isLoading && "overflow-y-hidden"
                )}
              >
                <TabsList className={"flex-col gap-0 p-3"}>
                  {isLoading && (
                    <div className="space-y-3">
                      {Array.from({ length: 8 }).map((_, index) => (
                        <Skeleton key={index} className="w-full h-14" />
                      ))}
                    </div>
                  )}

                  {traceMessages.map((message, index) => {
                    const messageStatus = message.status?.toLowerCase();
                    const Icon =
                      ProcessIcons[
                        isMainProcessCompleted &&
                        messageStatus === PROCESS_STATUS.PROCESSING
                          ? PROCESS_STATUS.COMPLETED
                          : messageStatus
                      ];

                    return (
                      <TabsTrigger
                        key={message.id}
                        value={index + 1}
                        asChild
                        className="group/tab data-[state=active]:bg-primary/10 data-[state=active]:text-primary hover:bg-muted/70 data-[state=active]:hover:bg-primary/15 mb-3 last:mb-0 rounded-lg border border-border/50 data-[state=active]:border-primary/30 data-[state=active]:shadow-sm transition-all"
                      >
                        <Collapsible>
                          <div className="w-full text-left cursor-pointer px-3 py-3 text-sm">
                            <div className="flex items-center gap-1.5">
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
                                      "text-green-500 group-data-[state=active]/tab:text-green-600",
                                    message.status === PROCESS_STATUS.FAILED &&
                                      "text-destructive"
                                  )}
                                />
                              </div>
                              <div className="flex-1 text-sm leading-tight">
                                {message.name}
                              </div>
                              <div className="min-w-10 text-xs text-center opacity-70 group-data-[state=active]/tab:opacity-100">
                                <div>Step {message.stepNum}</div>
                                {message.processingTimeSeconds &&
                                  formatFractionalHoursAuto(
                                    message.processingTimeSeconds,
                                    "seconds"
                                  )}
                              </div>
                            </div>
                          </div>
                          <CollapsibleContent>
                            <div className="px-3 pb-3 pt-2 text-xs bg-muted/30 text-muted-foreground border-t border-border/30 mx-0.5 rounded-b-md group-data-[state=active]/tab:bg-primary/5 group-data-[state=active]/tab:text-foreground group-data-[state=active]/tab:border-primary/20">
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
                      <ProcessMessage
                        message={message}
                        onJsonLoad={(json = {}) => {
                          if (
                            json.document_kind === "yes" &&
                            json.DocumentNumber
                          ) {
                            setDocumentNumber(json.DocumentNumber);
                          }
                        }}
                      />
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
