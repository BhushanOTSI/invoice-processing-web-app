"use client";

import { PROCESS_STATUS } from "@/app/constants";
import { APP_ROUTES } from "@/app/constants/app-routes";
import { RowCell, RowRenderLink } from "@/components/invoice-ui/data-table";
import { ProcessStatusBadge } from "@/components/invoice-ui/process-status-badge";
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
import { Tabs, TabsContent } from "@radix-ui/react-tabs";
import { useParams, useRouter } from "next/navigation";
import { ProcessMessage } from "@/components/invoice-ui/process-message";
import { StepTabsList } from "@/components/invoice-ui/step-tabs-list";
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
import { useFetchS3Json } from "@/services/hooks/useBatchProcessInvoice";
import {
  ArrowLeftIcon,
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

  const setActiveTab = useCallback((tab) => {
    setCurrentActiveTab(tab);
    updateParams({ tab });
  }, []);

  const traceMessages = useMemo(() => {
    return processTraceStatus?.messages || [];
  }, [processTraceStatus?.messages]);

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
                  (isLoading || !s3PdfUrl) && "animate-pulse bg-accent/30"
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
                        {isLoading && !s3PdfUrl ? (
                          <Spinner />
                        ) : (
                          <FileQuestionMarkIcon />
                        )}
                      </EmptyMedia>
                      <EmptyTitle>
                        {isLoading && !s3PdfUrl
                          ? "Loading Invoice..."
                          : "Nothing to Preview Yet"}
                      </EmptyTitle>
                      <EmptyDescription>
                        {isLoading && !s3PdfUrl
                          ? "Please wait while we load the invoice..."
                          : "The invoice is not available for preview."}
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                )}
              </div>
            </ResizablePanel>
            <ResizableHandle />
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
                  <StepTabsList
                    tabs={[
                      {
                        value: "step-1",
                        label: "AI Invoice Extraction",
                        stepNumber: 1,
                        isProcessing:
                          (stepStatus.isStep1Processing ||
                            (!groupedTraceMessages["step-1"] && !isLoading)) &&
                          !isMainProcessCompleted,
                        isLoading: isLoading,
                        isCompleted: stepStatus.isStep1Completed,
                        isFailed:
                          stepStatus.isStep1Failed || isMainProcessFailed,
                        isCancelled: stepStatus.isStep1Cancelled,
                        isPreviousStepCompleted: true,
                      },
                      {
                        value: "step-2",
                        label: "Validate CW Invoice",
                        stepNumber: 2,
                        isProcessing: stepStatus.isStep2Processing,
                        isLoading: isLoading,
                        isCompleted: stepStatus.isStep2Completed,
                        isFailed:
                          stepStatus.isStep2Failed || stepStatus.isStep1Failed,
                        isCancelled: stepStatus.isStep2Cancelled,
                        isPreviousStepCompleted: stepStatus.isStep1Completed,
                      },
                      {
                        value: "step-3",
                        label: "Process Steps",
                        stepNumber: 3,
                        isProcessing: stepStatus.isStep3Processing,
                        isLoading: isLoading,
                        isCompleted: stepStatus.isStep3Completed,
                        isFailed:
                          stepStatus.isStep3Failed ||
                          stepStatus.isStep2Failed ||
                          stepStatus.isStep1Failed,
                        isCancelled: stepStatus.isStep3Cancelled,
                        isPreviousStepCompleted: stepStatus.isStep2Completed,
                      },
                    ]}
                  />
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
