"use client";

import { PROCESS_STATUS } from "@/app/constants";
import { APP_ROUTES } from "@/app/constants/app-routes";
import { RowCell, RowRenderLink } from "@/components/invoice-ui/data-table";
import {
  ProcessIcons,
  ProcessStatusBadge,
  statusTextVariants,
} from "@/components/invoice-ui/process-status-badge";
import { usePersistentResize } from "@/hooks/use-persistent-resize";
import { useSetBreadcrumbs } from "@/hooks/use-set-breadcrumbs";
import { cn, formatTimeDifference } from "@/lib/utils";
import { useProcessTraceStatus } from "@/services/hooks/useInvoice";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { useParams } from "next/navigation";

import { ProcessMessage } from "@/components/invoice-ui/process-message";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { CopyToClipboard } from "@/components/ui/copy-to-clipboard";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useSidebar } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import {
  useFetchS3Json,
  useProcessingStream,
} from "@/services/hooks/useBatchProcessInvoice";
import {
  BadgeCheckIcon,
  BanIcon,
  ChevronDownIcon,
  CircleXIcon,
  ClockIcon,
  FileIcon,
  FileQuestionMarkIcon,
  HashIcon,
  LinkIcon,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
const InvoicePdf = dynamic(
  () => import("@/components/invoice-ui/invoice-pdf"),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 justify-center items-center h-full flex flex-col">
        <Spinner />
      </div>
    ),
  }
);

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
  const { setOpen } = useSidebar();
  const { processID } = useParams();
  const { leftSize, savePanelSize } = usePersistentResize(
    "invoice-trace-panel-size",
    processID
  );

  useEffect(() => {
    setOpen(false);
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

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

  const [activeTab, setActiveTab] = useState("step-1");
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

  const traceMessages = useMemo(() => {
    return (
      (isProcessing ||
      (messages.length && !processTraceStatus?.messages?.length)
        ? messages
        : processTraceStatus?.messages) || []
    );
  }, [messages, processTraceStatus?.messages, isProcessing]);

  const groupedTraceMessages = useMemo(() => {
    const grouped = {
      "step-1": traceMessages?.[0] ? traceMessages[0] : null,
      "step-2": traceMessages?.[1] ? traceMessages[1] : null,
      "step-3": traceMessages.slice(2, traceMessages.length),
    };

    return grouped;
  }, [traceMessages]);

  const isMainProcessCompleted = [
    PROCESS_STATUS.COMPLETED,
    PROCESS_STATUS.FAILED,
  ].includes(processTraceStatus?.status);

  const s3PdfUrl = useMemo(() => {
    return (
      processTraceStatus?.sessionMetadata?.s3_pdf_url ||
      groupedTraceMessages["step-1"]?.extraMetadata?.s3PdfUrl
    );
  }, [
    groupedTraceMessages["step-1"],
    processTraceStatus?.sessionMetadata?.s3_pdf_url,
  ]);

  const s3JsonUrl = useMemo(() => {
    return (
      processTraceStatus?.sessionMetadata?.s3_json_url ||
      groupedTraceMessages["step-1"]?.extraMetadata?.s3JsonUrl
    );
  }, [
    groupedTraceMessages["step-1"],
    processTraceStatus?.sessionMetadata?.s3_json_url,
  ]);

  const { data: jsonData } = useFetchS3Json(s3JsonUrl, !!s3JsonUrl);

  const cwWorkFlowUrl = useMemo(() => {
    if (processTraceStatus?.sessionMetadata?.cw_url) {
      return processTraceStatus?.sessionMetadata?.cw_url;
    }
    if (jsonData?.DocumentNumber) {
      return `https://cw.otsiaistudio.com/invoice/${jsonData?.DocumentNumber}`;
    }

    return null;
  }, [jsonData?.DocumentNumber, processTraceStatus?.sessionMetadata?.cw_url]);

  const containerHeight =
    "h-[calc(100vh-6rem)] group-has-data-[collapsible=icon]/sidebar-wrapper:h-[calc(100vh-5.5rem)] transition-all duration-200 ease-linear";

  const stepStatus = useMemo(() => {
    const step1 = groupedTraceMessages["step-1"];
    const step2 = groupedTraceMessages["step-2"];
    const step3 = groupedTraceMessages["step-3"];

    return {
      isStep1Processing: step1?.status === PROCESS_STATUS.PROCESSING,
      isStep2Processing: step2?.status === PROCESS_STATUS.PROCESSING,
      isStep3Processing: step3?.some(
        (message) => message.status === PROCESS_STATUS.PROCESSING
      ),
      isStep1Completed: step1?.status === PROCESS_STATUS.COMPLETED,
      isStep2Completed: step2?.status === PROCESS_STATUS.COMPLETED,
      isStep3Completed: step3?.some(
        (message) => message.status === PROCESS_STATUS.COMPLETED
      ),
      isStep1Failed: step1?.status === PROCESS_STATUS.FAILED,
      isStep2Failed: step2?.status === PROCESS_STATUS.FAILED,
      isStep3Failed: step3?.some(
        (message) => message.status === PROCESS_STATUS.FAILED
      ),
      isStep1Cancelled: step1?.status === PROCESS_STATUS.CANCELLED,
      isStep2Cancelled: step2?.status === PROCESS_STATUS.CANCELLED,
      isStep3Cancelled: step3?.some(
        (message) => message.status === PROCESS_STATUS.CANCELLED
      ),
    };
  }, [groupedTraceMessages]);

  const [view, setView] = useState("markdown");

  const containerRef = useRef(null);

  return (
    <div className="overflow-hidden flex flex-col" ref={containerRef}>
      <div className="flex items-center text-sm gap-3 flex-wrap transition-all p-4 py-2 border-b flex-shrink-0">
        <InfoItem
          Icon={HashIcon}
          label="Process ID:"
          value={processTraceStatus?.processId}
          allowCopy
          isLoading={isLoading}
        />
        <InfoItem
          Icon={FileIcon}
          label="File Name:"
          value={processTraceStatus?.filename}
          allowCopy
          isLoading={isLoading}
        />

        <ProcessStatusBadge
          status={processTraceStatus?.status}
          isLoading={isLoading}
          className="px-2"
        />

        {cwWorkFlowUrl && (
          <InfoItem
            Icon={LinkIcon}
            label="Document Number:"
            value={jsonData?.DocumentNumber}
            href={cwWorkFlowUrl}
            allowCopy
            urlText="Collabration Workspace"
            isLoading={isLoading}
          />
        )}
        {isMainProcessCompleted && (
          <InfoItem
            Icon={ClockIcon}
            label="Completed in:"
            value={formatTimeDifference(
              processTraceStatus?.startTime,
              processTraceStatus?.completedAt
            )}
            isLoading={isLoading}
          />
        )}
      </div>
      <div className={cn("@container overflow-hidden", containerHeight)}>
        {
          <ResizablePanelGroup
            direction="horizontal"
            className="h-full"
            onLayout={savePanelSize}
          >
            <ResizablePanel
              defaultSize={leftSize}
              className={cn(containerHeight)}
            >
              <div
                className={cn(
                  "bg-accent border-r h-full flex flex-col",
                  (isLoading || (isLoadingProcessingStream && !s3PdfUrl)) &&
                    "animate-pulse bg-accent/30"
                )}
              >
                {s3PdfUrl && (
                  <div className="h-full overflow-hidden">
                    <div className="h-full overflow-y-auto overflow-x-hidden">
                      <InvoicePdf key={s3PdfUrl} fileUrl={s3PdfUrl} />
                    </div>
                  </div>
                )}
                {!s3PdfUrl && (
                  <Empty className="h-full">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        {(isLoading || isLoadingProcessingStream) &&
                        !s3PdfUrl ? (
                          <Spinner />
                        ) : (
                          <FileQuestionMarkIcon />
                        )}
                      </EmptyMedia>
                      <EmptyTitle>
                        {(isLoading || isLoadingProcessingStream) && !s3PdfUrl
                          ? "Loading Invoice..."
                          : "Nothing to Preview Yet"}
                      </EmptyTitle>
                      <EmptyDescription>
                        {(isLoading || isLoadingProcessingStream) && !s3PdfUrl
                          ? "Please wait while we load the invoice..."
                          : "The invoice is not available for preview."}
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                )}
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel className={cn(containerHeight)}>
              <div className="h-full flex flex-col">
                <Tabs
                  value={activeTab}
                  onValueChange={(value) => {
                    setActiveTab(value);
                    setView("markdown");
                  }}
                  className="flex flex-col h-full"
                >
                  <div className="py-3 px-6 space-y-3 border-b flex-shrink-0">
                    <div className="flex items-center w-full justify-between">
                      <div className="flex-1">
                        <TabsList className="flex items-center gap-y-2">
                          <StepTabTrigger
                            value="step-1"
                            key="step-1"
                            isProcessing={stepStatus.isStep1Processing}
                            isLoading={isLoading}
                            isCompleted={stepStatus.isStep1Completed}
                            isFailed={stepStatus.isStep1Failed}
                            isCancelled={stepStatus.isStep1Cancelled}
                            isPreviousStepCompleted={true}
                          >
                            <span>AI Invoice Extraction</span>
                          </StepTabTrigger>
                          <div
                            className={cn(
                              "w-6 h-px bg-foreground inline-block",
                              isLoading && "animate-pulse bg-accent"
                            )}
                          />
                          <StepTabTrigger
                            value="step-2"
                            key="step-2"
                            isProcessing={stepStatus.isStep2Processing}
                            isLoading={isLoading}
                            isCompleted={stepStatus.isStep2Completed}
                            isFailed={
                              stepStatus.isStep2Failed ||
                              stepStatus.isStep1Failed
                            }
                            isCancelled={stepStatus.isStep2Cancelled}
                            isPreviousStepCompleted={
                              stepStatus.isStep1Completed
                            }
                          >
                            <span>Validate CW Invoice</span>
                          </StepTabTrigger>
                          <div
                            className={cn(
                              "w-6 h-px bg-foreground inline-block",
                              isLoading && "animate-pulse bg-accent"
                            )}
                          />
                          <StepTabTrigger
                            value="step-3"
                            key="step-3"
                            isProcessing={stepStatus.isStep3Processing}
                            isLoading={isLoading}
                            isCompleted={stepStatus.isStep3Completed}
                            isFailed={
                              stepStatus.isStep3Failed ||
                              stepStatus.isStep2Failed ||
                              stepStatus.isStep1Failed
                            }
                            isCancelled={stepStatus.isStep3Cancelled}
                            isPreviousStepCompleted={
                              stepStatus.isStep2Completed
                            }
                          >
                            <span>Process Steps</span>
                          </StepTabTrigger>
                        </TabsList>
                      </div>
                    </div>
                  </div>
                  {jsonData && activeTab === "step-1" && (
                    <div className="flex items-center gap-1 py-2 px-6 border-b justify-end">
                      <Switch
                        checked={view === "json"}
                        onCheckedChange={(checked) => {
                          setView(checked ? "json" : "markdown");
                          setActiveTab("step-1");
                        }}
                      />
                      <FieldLabel className="text-xs">Preview Json</FieldLabel>
                    </div>
                  )}

                  <div className="flex-1 min-h-0 overflow-hidden ">
                    <div className="h-full overflow-y-auto overflow-x-hidden dark:text-foreground/90 px-6 py-4">
                      <TabsContent value="step-1" className="h-full relative">
                        <ProcessMessage
                          message={groupedTraceMessages["step-1"]}
                          isLoading={isLoading || isLoadingProcessingStream}
                          jsonData={jsonData}
                          view={view}
                        />
                      </TabsContent>
                      <TabsContent value="step-2" className="h-full">
                        <ProcessMessage
                          message={groupedTraceMessages["step-2"]}
                          isLoading={isLoading}
                        />
                      </TabsContent>
                      <TabsContent value="step-3" className="space-y-4 h-full">
                        {groupedTraceMessages["step-3"].map((message) => {
                          const messageStatus = message.status?.toLowerCase();
                          const Icon =
                            ProcessIcons[
                              isMainProcessCompleted &&
                              messageStatus === PROCESS_STATUS.PROCESSING
                                ? PROCESS_STATUS.COMPLETED
                                : messageStatus
                            ];

                          return (
                            <div key={message.id}>
                              <Collapsible
                                defaultOpen={true}
                                className="group/collapsible"
                              >
                                <Item
                                  variant="muted"
                                  className={cn(
                                    "bg-accent group-data-[state=open]/collapsible:rounded-b-none"
                                  )}
                                >
                                  <ItemMedia>
                                    <Icon
                                      className={cn(
                                        "size-4",
                                        statusTextVariants({
                                          variant: messageStatus,
                                        })
                                      )}
                                    />
                                  </ItemMedia>
                                  <ItemContent>
                                    <ItemTitle>{message.name}</ItemTitle>
                                    <ItemDescription className="break-words">
                                      {message.description}
                                    </ItemDescription>
                                  </ItemContent>
                                  <ItemActions className="self-start">
                                    <CollapsibleTrigger className="group/collapsible-trigger">
                                      <ChevronDownIcon className="size-4 group-data-[state=open]/collapsible-trigger:rotate-180 transition-transform duration-200" />
                                    </CollapsibleTrigger>
                                  </ItemActions>
                                </Item>

                                <CollapsibleContent className="px-4 border-t-0 py-2 border border-accent rounded-b-md transition-[height] duration-200 ease-linear">
                                  <ProcessMessage
                                    message={message}
                                    isLoading={isLoading}
                                  />
                                </CollapsibleContent>
                              </Collapsible>
                            </div>
                          );
                        })}
                      </TabsContent>
                    </div>
                  </div>
                </Tabs>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        }
      </div>
    </div>
  );
}

function InfoItem({
  Icon,
  label,
  value,
  allowCopy = false,
  href = null,
  copyValue,
  showLabel = true,
  urlText,
  isLoading = false,
}) {
  if (isLoading) {
    return <Skeleton className="w-30 h-4" />;
  }
  return (
    <div className="flex items-center gap-1 text-foreground/80 ">
      {Icon && <Icon className="size-3" />}
      {label && showLabel && <span>{label}</span>}
      <span className="font-medium text-foreground flex items-center gap-1">
        {href ? (
          <RowRenderLink
            href={href}
            value={value}
            header={label}
            allowCopy={false}
            target="_blank"
            urlText={urlText}
          />
        ) : (
          <RowCell value={value} header={label} />
        )}
      </span>
      {allowCopy && (
        <CopyToClipboard value={copyValue || value} iconSize={"size-3"} />
      )}
    </div>
  );
}

function StepTabTrigger({
  children,
  className,
  isProcessing,
  isLoading,
  isCompleted,
  isFailed,
  isCancelled,
  isPreviousStepCompleted = false,
  ...props
}) {
  return (
    <TabsTrigger
      className={cn(
        "group/tab line-clamp-1 shadow-md shadow-accent",
        "rounded-md",
        "text-sm px-4 py-1",
        "transition-all bg-primary/10",
        "hover:bg-foreground/20 hover:text-foreground",
        "data-[state=active]:bg-primary data-[state=active]:[&_svg]:text-primary-foreground data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm",
        className,
        isLoading &&
          "pointer-events-none animate-pulse !bg-accent !text-accent select-none",
        "[&:disabled]:pointer-events-none [&:disabled]:opacity-50 [&:disabled]:cursor-not-allowed"
      )}
      disabled={isLoading || !isPreviousStepCompleted}
      {...props}
    >
      <span className={cn("flex gap-2 items-center ")}>
        {!isProcessing &&
          !isCompleted &&
          !isFailed &&
          !isCancelled &&
          !isLoading && (
            <ClockIcon
              className={cn(
                "size-4 -ml-2",
                statusTextVariants({ variant: "pending" })
              )}
            />
          )}
        {isProcessing && (
          <Spinner
            className={cn(
              "size-4 -ml-2",
              statusTextVariants({ variant: "processing" })
            )}
          />
        )}
        {isCompleted && (
          <BadgeCheckIcon
            className={cn(
              "size-4 -ml-2",
              statusTextVariants({ variant: "completed" })
            )}
          />
        )}
        {isFailed && (
          <CircleXIcon
            className={cn(
              "size-4 -ml-2",
              statusTextVariants({ variant: "failed" })
            )}
          />
        )}
        {isCancelled && (
          <BanIcon
            className={cn(
              "size-4 -ml-2",
              statusTextVariants({ variant: "cancelled" })
            )}
          />
        )}
        <span className="truncate max-w-40">{children}</span>
      </span>
    </TabsTrigger>
  );
}
