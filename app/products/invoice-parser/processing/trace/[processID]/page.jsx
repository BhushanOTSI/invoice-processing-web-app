"use client";

import { CASE_TYPES, PROCESS_STATUS } from "@/app/constants";
import { APP_ROUTES } from "@/app/constants/app-routes";
import { RowCell, RowRenderLink } from "@/components/invoice-ui/data-table";
import {
  ProcessStatusBadge,
  statusTextVariants,
} from "@/components/invoice-ui/process-status-badge";
import { usePersistentResize } from "@/hooks/use-persistent-resize";
import { useSetBreadcrumbs } from "@/hooks/use-set-breadcrumbs";
import {
  cn,
  formatTimeDifference,
  isCancelledProcessing,
  isCompletedProcessing,
  isDeferredProcessing,
  isFailedProcessing,
  isProcessing,
} from "@/lib/utils";
import {
  useProcessTraceDag,
  useProcessTraceStatus,
} from "@/services/hooks/useInvoice";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { useParams, useRouter } from "next/navigation";
import { ProcessMessage } from "@/components/invoice-ui/process-message";
import { CopyToClipboard } from "@/components/ui/copy-to-clipboard";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { FieldLabel } from "@/components/ui/field";
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
  ArrowLeftIcon,
  BadgeCheckIcon,
  BanIcon,
  CircleXIcon,
  ClockIcon,
  FileIcon,
  FileQuestionMarkIcon,
  HashIcon,
  LinkIcon,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActiveProcessMessage,
  ProcessingStepsFlow,
  ProcessingStepsFlowProvider,
} from "@/components/invoice-ui/processing-steps-flow";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { useSetSearchParams } from "@/hooks/use-set-search-params";

const PdfPreview = dynamic(
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
  const { params, updateParams } = useSetSearchParams();
  const router = useRouter();
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

  const [activeTab, setCurrentActiveTab] = useState(params.tab || "step-1");
  const [messages, setMessages] = useState([]);
  const isMainProcessProcessing = useMemo(
    () => isProcessing(processTraceStatus?.status),
    [processTraceStatus?.status]
  );

  const setActiveTab = useCallback((tab) => {
    setCurrentActiveTab(tab);
    updateParams({ tab });
  }, []);

  const { isLoading: isLoadingProcessingStream } = useProcessingStream(
    processID,
    processID && !isLoading && isMainProcessProcessing,
    {
      onData: (data) => {
        setMessages((prev) => addOrUpdateMessage(prev || [], data));
      },
    }
  );

  const traceMessages = useMemo(() => {
    return (
      (isMainProcessProcessing ||
      (messages.length && !processTraceStatus?.messages?.length)
        ? messages
        : processTraceStatus?.messages) || []
    );
  }, [messages, processTraceStatus?.messages, isMainProcessProcessing]);

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
      processTraceStatus?.sessionMetadata?.s3_raw_json_url ||
      processTraceStatus?.sessionMetadata?.s3_json_url ||
      groupedTraceMessages["step-1"]?.extraMetadata?.s3JsonUrl
    );
  }, [
    processTraceStatus?.sessionMetadata?.s3_raw_json_url,
    processTraceStatus?.sessionMetadata?.s3_json_url,
    groupedTraceMessages["step-1"]?.extraMetadata?.s3JsonUrl,
  ]);

  const { data: jsonData } = useFetchS3Json(s3JsonUrl, !!s3JsonUrl);

  const documentNumber = useMemo(() => {
    return (
      jsonData?.combined_parsed_json?.invoiceNumber?.value ||
      jsonData?.DocumentNumber
    );
  }, [jsonData]);

  const cwWorkFlowUrl = useMemo(() => {
    if (processTraceStatus?.sessionMetadata?.cw_url) {
      return processTraceStatus?.sessionMetadata?.cw_url;
    }

    if (documentNumber) {
      return `https://cw.otsiaistudio.com/invoice/${documentNumber}`;
    }

    return null;
  }, [documentNumber, processTraceStatus?.sessionMetadata?.cw_url]);

  const containerHeight =
    "h-[calc(100vh-6rem)] group-has-data-[collapsible=icon]/sidebar-wrapper:h-[calc(100vh-5.5rem)] transition-all duration-200 ease-linear";

  const { data: processTraceDag } = useProcessTraceDag(
    processID,
    !isLoading &&
      isCompletedProcessing(groupedTraceMessages["step-1"]?.status, true) &&
      isCompletedProcessing(groupedTraceMessages["step-2"]?.status, true)
  );

  const { dagNodes = [], dagEdges = [] } = useMemo(() => {
    return {
      dagNodes: processTraceDag?.data?.nodes,
      dagEdges: processTraceDag?.data?.edges,
    };
  }, [processTraceDag]);

  const stepStatus = useMemo(() => {
    const step1 = groupedTraceMessages["step-1"];
    const step2 = groupedTraceMessages["step-2"];
    const step3 = dagNodes;

    const step3Status = step3?.map(
      (message) => message?.data?.status || message?.status
    );

    return {
      isStep1Processing: isProcessing(step1?.status),
      isStep1Completed: isCompletedProcessing(step1?.status),
      isStep1Failed: isFailedProcessing(step1?.status),
      isStep1Cancelled: isCancelledProcessing(step1?.status),

      isStep2Processing: isProcessing(step2?.status),
      isStep2Completed: isCompletedProcessing(step2?.status),
      isStep2Failed: isFailedProcessing(step2?.status),
      isStep2Cancelled: isCancelledProcessing(step2?.status),

      isStep3Completed:
        step3Status?.length > 0 &&
        step3Status?.every((s) => isCompletedProcessing(s, true)),
      isStep3Processing: isProcessing(step3Status),
      isStep3Failed: isFailedProcessing(step3Status),
      isStep3Cancelled: isCancelledProcessing(step3Status),
      isStep3Deferred: isDeferredProcessing(step3Status),
    };
  }, [groupedTraceMessages, dagNodes]);

  const [view, setView] = useState("markdown");

  const containerRef = useRef(null);

  const isMainProcessFailed = useMemo(() => {
    return (
      isFailedProcessing(processTraceStatus?.status) ||
      isCancelledProcessing(processTraceStatus?.status)
    );
  }, [processTraceStatus?.status]);

  return (
    <div className="overflow-hidden flex flex-col" ref={containerRef}>
      <div className="flex items-center text-sm gap-3 flex-wrap transition-all p-4 py-2 border-b shrink-0">
        <Button
          variant="ghost"
          size="sm"
          className={"rounded-full text-xs h-6"}
          onClick={() => router.back()}
        >
          <ArrowLeftIcon className="size-3" />
          Back
        </Button>
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

        {cwWorkFlowUrl && (
          <InfoItem
            Icon={LinkIcon}
            label="Document Number:"
            value={documentNumber}
            href={cwWorkFlowUrl}
            allowCopy
            urlText="Collabration Workspace"
            isLoading={isLoading}
          />
        )}

        <ProcessStatusBadge
          status={processTraceStatus?.status}
          isLoading={isLoading}
          className="px-2"
        />

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
      <ProcessingStepsFlowProvider
        messages={groupedTraceMessages["step-3"]}
        dag_nodes={dagNodes}
        dag_edges={dagEdges}
      >
        <div className={cn("@container overflow-hidden", containerHeight)}>
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
                  "bg-accent h-full flex flex-col",
                  (isLoading || (isLoadingProcessingStream && !s3PdfUrl)) &&
                    "animate-pulse bg-accent/30"
                )}
              >
                {activeTab === "step-3" && !isLoading && (
                  <div className="h-full overflow-hidden">
                    <div className="h-full overflow-y-auto overflow-x-hidden">
                      <ProcessingStepsFlow />
                    </div>
                  </div>
                )}

                {s3PdfUrl && activeTab !== "step-3" && (
                  <div className="h-full overflow-hidden">
                    <div className="h-full overflow-y-auto overflow-x-hidden">
                      <PdfPreview key={s3PdfUrl} fileUrl={s3PdfUrl} />
                    </div>
                  </div>
                )}

                {(isLoading || !s3PdfUrl) && (
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
                  <div className="px-4 py-2 border-b border-border/50 shrink-0 overflow-hidden">
                    <TabsList className="flex items-center gap-0 w-full bg-transparent p-0 h-auto">
                      <StepTabTrigger
                        value="step-1"
                        key="step-1"
                        stepNumber={1}
                        isProcessing={
                          (stepStatus.isStep1Processing ||
                            !groupedTraceMessages["step-1"]) &&
                          !isMainProcessCompleted
                        }
                        isLoading={isLoading}
                        isCompleted={stepStatus.isStep1Completed}
                        isFailed={
                          stepStatus.isStep1Failed || isMainProcessFailed
                        }
                        isCancelled={stepStatus.isStep1Cancelled}
                        isPreviousStepCompleted={true}
                      >
                        <span>AI Invoice Extraction</span>
                      </StepTabTrigger>
                      <StepConnector
                        isCompleted={stepStatus.isStep1Completed}
                        isLoading={isLoading}
                      />
                      <StepTabTrigger
                        value="step-2"
                        key="step-2"
                        stepNumber={2}
                        isProcessing={stepStatus.isStep2Processing}
                        isLoading={isLoading}
                        isCompleted={stepStatus.isStep2Completed}
                        isFailed={
                          stepStatus.isStep2Failed || stepStatus.isStep1Failed
                        }
                        isCancelled={stepStatus.isStep2Cancelled}
                        isPreviousStepCompleted={stepStatus.isStep1Completed}
                      >
                        <span>Validate CW Invoice</span>
                      </StepTabTrigger>
                      <StepConnector
                        isCompleted={stepStatus.isStep2Completed}
                        isLoading={isLoading}
                      />
                      <StepTabTrigger
                        value="step-3"
                        key="step-3"
                        stepNumber={3}
                        isProcessing={stepStatus.isStep3Processing}
                        isLoading={isLoading}
                        isCompleted={stepStatus.isStep3Completed}
                        isFailed={
                          stepStatus.isStep3Failed ||
                          stepStatus.isStep2Failed ||
                          stepStatus.isStep1Failed
                        }
                        isCancelled={stepStatus.isStep3Cancelled}
                        isPreviousStepCompleted={stepStatus.isStep2Completed}
                      >
                        <span>Process Steps</span>
                      </StepTabTrigger>
                    </TabsList>
                  </div>
                  {jsonData && activeTab === "step-1" && (
                    <div className="flex items-center gap-1 py-2 px-6 bg-accent dark:bg-accent/50 border-b border-border/50 justify-end">
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
                          isLoading={isLoading}
                          isProcessing={
                            (stepStatus.isStep1Processing ||
                              !groupedTraceMessages["step-1"]) &&
                            !isMainProcessCompleted
                          }
                          jsonData={jsonData?.combined_parsed_json || jsonData}
                          view={view}
                          isMainProcessFailed={isMainProcessFailed}
                        />
                      </TabsContent>
                      <TabsContent value="step-2" className="h-full">
                        <ProcessMessage
                          message={groupedTraceMessages["step-2"]}
                          isLoading={isLoading}
                          isMainProcessFailed={isMainProcessFailed}
                        />
                      </TabsContent>
                      <TabsContent value="step-3" className="space-y-4 h-full">
                        <ActiveProcessMessage isLoading={isLoading} />
                      </TabsContent>
                    </div>
                  </div>
                </Tabs>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </ProcessingStepsFlowProvider>
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

function StepConnector({ isCompleted, isLoading }) {
  return (
    <div className="flex items-center px-1.5 min-w-[24px] shrink-0">
      <div
        className={cn(
          "h-[2px] w-full rounded-full transition-all duration-300",
          isCompleted && "bg-emerald-500",
          !isCompleted && !isLoading && "bg-border",
          isLoading && "bg-muted-foreground/20 animate-pulse"
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
        "group/tab relative flex items-center gap-1.5",
        "px-2.5 py-1.5 rounded-lg",
        "transition-all duration-200",
        "border border-border/50",
        "min-w-0 flex-1",
        // Default state
        "bg-accent/50",
        // Hover
        !isDisabled && "hover:bg-muted/50 cursor-pointer",
        // Active state - subtle elevation with better shadow
        "data-[state=active]:bg-background/95 data-[state=active]:border-border",
        "data-[state=active]:shadow-[0_2px_8px_-2px_rgba(0,0,0,0.08),0_1px_4px_-1px_rgba(0,0,0,0.06)]",
        "dark:data-[state=active]:shadow-[0_2px_8px_-2px_rgba(0,0,0,0.4),0_1px_4px_-1px_rgba(0,0,0,0.3)]",
        "data-[state=active]:ring-1 data-[state=active]:ring-primary/10",
        // Disabled
        isDisabled && "opacity-40 cursor-not-allowed pointer-events-none",
        className
      )}
      disabled={isDisabled}
      {...props}
    >
      {/* Step Badge */}
      <div
        className={cn(
          "relative flex items-center justify-center shrink-0",
          "size-5 rounded-full",
          "font-semibold text-[9px]",
          "transition-all duration-200",
          "group-data-[state=active]/tab:scale-105",
          // Status colors
          isCompleted &&
            !isFailed &&
            !isCancelled && [
              "bg-emerald-500 border-emerald-500 text-white",
              "shadow-[0_0_6px_rgba(16,185,129,0.3)]",
            ],
          isProcessing && [
            "bg-blue-500 border-blue-500 text-white",
            "shadow-[0_0_6px_rgba(59,130,246,0.3)]",
          ],
          isFailed && [
            "bg-red-500 border-red-500 text-white",
            "shadow-[0_0_6px_rgba(239,68,68,0.3)]",
          ],
          isCancelled && "bg-gray-400 border-gray-400 text-white",
          !isCompleted &&
            !isProcessing &&
            !isFailed &&
            !isCancelled &&
            !isLoading &&
            "bg-muted border-muted-foreground/30 text-muted-foreground",
          isLoading &&
            "bg-muted border-muted-foreground/20 text-muted-foreground"
        )}
      >
        {isLoading || isProcessing ? (
          <Spinner className="size-3" />
        ) : isCompleted && !isFailed && !isCancelled ? (
          <BadgeCheckIcon className="size-4" />
        ) : isFailed ? (
          <CircleXIcon className="size-4" />
        ) : isCancelled ? (
          <BanIcon className="size-4" />
        ) : (
          <span>{stepNumber}</span>
        )}
      </div>

      {/* Label */}
      <span
        className={cn(
          "text-sm font-medium",
          "transition-all duration-200",
          "group-data-[state=active]/tab:text-foreground group-data-[state=active]/tab:font-semibold",
          !isDisabled && "text-foreground/70",
          isDisabled && "text-muted-foreground",
          "whitespace-nowrap truncate min-w-0"
        )}
      >
        {children}
      </span>

      {/* Processing pulse */}
      {isProcessing && (
        <div className="absolute -top-0.5 -right-0.5">
          <span className="relative flex size-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex rounded-full size-1.5 bg-blue-500" />
          </span>
        </div>
      )}

      {/* Active indicator */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 h-[3px] rounded-t-full",
          "transition-all duration-300 ease-out",
          "bg-gradient-to-r from-primary/60 via-primary to-primary/60",
          "shadow-[0_-1px_4px_0_rgba(var(--primary-rgb),0.3)]",
          "scale-x-0 data-[state=active]:scale-x-100",
          "origin-center"
        )}
        data-state={props.value === props.activeValue ? "active" : "inactive"}
      />
    </TabsTrigger>
  );
}
