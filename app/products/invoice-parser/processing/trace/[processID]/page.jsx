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
  autoDetectAndNormalize,
} from "@/lib/utils";
import {
  useProcessTraceDag,
  useProcessTraceStatus,
} from "@/services/hooks/useInvoice";
import { Tabs, TabsContent } from "@radix-ui/react-tabs";
import { useParams, useRouter } from "next/navigation";
import { ProcessMessageMemo as ProcessMessage } from "@/components/invoice-ui/process-message";
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
import { toTitleCase } from "remeda";

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
  const [activeCitation, setActiveCitation] = useState(null);
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

  const { data: processTraceStatus, isLoading } =
    useProcessTraceStatus(processID);

  const breadcrumbs = useMemo(() => {
    return [
      { title: "Home", url: APP_ROUTES.DASHBOARD },
      {
        title: "Monitor Batch",
        url: APP_ROUTES.PROCESSING.BATCH.replace(
          "[batchID]",
          processTraceStatus?.sessionMetadata?.batch_id
        ),
      },
      { title: "Monitor Traces", url: APP_ROUTES.PROCESSING.TRACE },
      {
        title: "Process Trace",
        url: APP_ROUTES.PROCESSING.TRACE_PROCESS.replace(
          "[processID]",
          processID
        ),
      },
      {
        title: processID,
      },
    ];
  }, [processID, processTraceStatus?.sessionMetadata?.batch_id]);

  useSetBreadcrumbs(breadcrumbs);

  const [activeTab, setCurrentActiveTab] = useState(params.tab || "step-1");

  const setActiveTab = useCallback(
    (tab) => {
      setCurrentActiveTab(tab);
      updateParams({ tab });
    },
    [updateParams]
  );

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

  const { s3PdfUrl, s3JsonUrl, cwWorkFlowUrl } = useMemo(() => {
    const stepExtraMetadata =
      groupedTraceMessages?.["step-1"]?.extraMetadata || {};
    const sessionMetadata = processTraceStatus?.sessionMetadata || {};

    return {
      s3PdfUrl:
        sessionMetadata?.s3_pdf_unmasked_url ||
        sessionMetadata?.s3_pdf_url ||
        stepExtraMetadata?.s3PdfUrl,
      s3JsonUrl:
        sessionMetadata?.s3_raw_json_url ||
        sessionMetadata?.s3_json_url ||
        stepExtraMetadata?.s3JsonUrl,
      cwWorkFlowUrl: sessionMetadata?.cw_url,
    };
  }, [processTraceStatus, groupedTraceMessages]);

  const { data: jsonData } = useFetchS3Json(s3JsonUrl, !!s3JsonUrl);

  const documentNumber = useMemo(() => {
    return (
      jsonData?.combined_parsed_json?.invoiceNumber?.value ||
      jsonData?.DocumentNumber
    );
  }, [jsonData]);

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
  const rightPaneRef = useRef(null);

  const step1PreviewData = useMemo(() => {
    return jsonData?.combined_parsed_json || jsonData || null;
  }, [jsonData]);

  const step1PdfCitations = useMemo(() => {
    if (activeTab !== "step-1" || !step1PreviewData) return [];

    const byBox = new Map();

    const hasValueStructure = (v) =>
      v &&
      typeof v === "object" &&
      ("value" in v ||
        "formattedValue" in v ||
        "formattedDate" in v ||
        "valueFromDocument" in v);

    const getDisplayValue = (v, keyName) => {
      if (v === null || v === undefined) return "";
      if (
        typeof v === "string" ||
        typeof v === "number" ||
        typeof v === "boolean"
      ) {
        return String(v);
      }

      if (typeof v === "object") {
        // Prefer the raw extracted value (per requirement)
        const raw = "value" in v ? v.value : undefined;
        if (raw !== null && raw !== undefined && String(raw).trim() !== "") {
          return String(raw);
        }

        // Helpful fallbacks for fields that don't set `value`
        if ("formattedValue" in v && v.formattedValue)
          return String(v.formattedValue);
        if ("formattedDate" in v && v.formattedDate)
          return String(v.formattedDate);
        if ("valueFromDocument" in v && v.valueFromDocument)
          return String(v.valueFromDocument);

        // Common compound case: quantity + unit
        if (
          keyName === "quantity" &&
          "formattedValue" in v &&
          v.formattedValue &&
          "unitOfMeasure" in v &&
          v.unitOfMeasure
        ) {
          return `${v.formattedValue} ${v.unitOfMeasure}`;
        }
      }

      return "";
    };

    /**
     * Normalize citation source data to handle both old and new formats:
     * Old format: { grounding: { text_bbox, page_no, image_width, image_height } }
     * New format: { sources: { bbox, image_width, image_height } } or sources as array
     */
    const normalizeSourceData = (sourceObj) => {
      if (!sourceObj) return null;

      // Old format: grounding object with text_bbox and page_no
      if (sourceObj.grounding && typeof sourceObj.grounding === "object") {
        const g = sourceObj.grounding;
        if (g.text_bbox && Array.isArray(g.text_bbox) && g.text_bbox.length === 4) {
          return {
            bbox: g.text_bbox,
            pageNo: g.page_no || 1,
            imageWidth: g.image_width,
            imageHeight: g.image_height,
          };
        }
      }

      // New format: sources object (or array of sources)
      if (sourceObj.sources) {
        const src = Array.isArray(sourceObj.sources)
          ? sourceObj.sources[0] // Take first source from array
          : sourceObj.sources;

        if (src && src.bbox && Array.isArray(src.bbox) && src.bbox.length === 4) {
          return {
            bbox: src.bbox,
            // New format has no page_no, default to 1
            pageNo: src.page_no || 1,
            imageWidth: src.image_width,
            imageHeight: src.image_height,
          };
        }
      }

      // Direct grounding check (for nested objects like lineItems)
      if (sourceObj.text_bbox && Array.isArray(sourceObj.text_bbox)) {
        return {
          bbox: sourceObj.text_bbox,
          pageNo: sourceObj.page_no || 1,
          imageWidth: sourceObj.image_width,
          imageHeight: sourceObj.image_height,
        };
      }

      // Direct bbox check (new format without wrapper)
      if (sourceObj.bbox && Array.isArray(sourceObj.bbox) && sourceObj.bbox.length === 4) {
        return {
          bbox: sourceObj.bbox,
          pageNo: sourceObj.page_no || 1,
          imageWidth: sourceObj.image_width,
          imageHeight: sourceObj.image_height,
        };
      }

      return null;
    };

    /**
     * Get normalized source data from an object - handles both formats
     */
    const getSourceData = (obj) => {
      if (!obj) return null;
      return normalizeSourceData(obj);
    };

    const ensureEntry = (sourceData) => {
      if (!sourceData || !Array.isArray(sourceData.bbox) || sourceData.bbox.length !== 4) {
        return null;
      }

      const pageIndex = Math.max(0, Number(sourceData.pageNo || 1) - 1);
      const normBbox =
        autoDetectAndNormalize(
          sourceData.bbox,
          sourceData.imageWidth,
          sourceData.imageHeight
        ) || sourceData.bbox.map((n) => Number(n));

      const key = `${pageIndex}:${normBbox.join(",")}`;
      let entry = byBox.get(key);

      if (!entry) {
        entry = {
          id: key,
          pageIndex,
          bbox: normBbox,
          path: "",
          kvPairs: [],
          tables: [],
        };

        byBox.set(key, entry);
      }
      return entry;
    };

    const walk = (node, path = "", labelKey = "") => {
      if (!node) return;

      if (Array.isArray(node)) {
        // If it looks like a table (array of objects), show in table format in the popover
        const isObjArray = node.every(
          (x) => typeof x === "object" && x !== null && !Array.isArray(x)
        );

        if (isObjArray) {
          // If each row has grounding/sources, create a citation per row (so overlays don't collapse)
          const rowsWithSource = node
            .map((row, idx) => ({
              row,
              idx,
              sourceData: getSourceData(row),
            }))
            .filter((x) => x.sourceData !== null);

          if (rowsWithSource.length > 0) {
            rowsWithSource.forEach(({ row, idx, sourceData }) => {
              const entry = ensureEntry(sourceData);
              if (!entry) return;
              if (!entry.path) entry.path = `${path}[${idx}]`;

              const flat = {};
              for (const [k, v] of Object.entries(row || {})) {
                if (k === "source" || k === "grounding" || k === "sources" || k === "sourceKeyList") continue;
                if (v && typeof v === "object" && hasValueStructure(v)) {
                  flat[toTitleCase(k)] = getDisplayValue(v, k) || "N/A";
                } else if (
                  typeof v === "string" ||
                  typeof v === "number" ||
                  typeof v === "boolean"
                ) {
                  flat[toTitleCase(k)] = String(v);
                }
              }

              const columns = Object.keys(flat);
              entry.tables.push({
                title: labelKey
                  ? `${toTitleCase(labelKey)} #${idx + 1}`
                  : `Row #${idx + 1}`,
                columns,
                rows: [flat],
              });
            });

            return;
          }

          // Otherwise, use the first available grounding/sources (covers whole table in some payloads)
          const anySourceData = node
            .map((r) => getSourceData(r))
            .find((s) => s !== null);
          const entry = ensureEntry(anySourceData);
          if (entry) {
            if (!entry.path) entry.path = path || labelKey || "";

            const rows = node.map((row) => {
              const flat = {};
              for (const [k, v] of Object.entries(row || {})) {
                if (k === "source" || k === "grounding" || k === "sources" || k === "sourceKeyList") continue;
                if (v && typeof v === "object" && hasValueStructure(v)) {
                  flat[toTitleCase(k)] = getDisplayValue(v, k) || "N/A";
                } else if (
                  typeof v === "string" ||
                  typeof v === "number" ||
                  typeof v === "boolean"
                ) {
                  flat[toTitleCase(k)] = String(v);
                }
              }
              return flat;
            });

            const columns = Array.from(
              new Set(rows.flatMap((r) => Object.keys(r)))
            );

            entry.tables.push({
              title: labelKey ? toTitleCase(labelKey) : "Items",
              columns,
              rows,
            });
          }
          return;
        }

        node.forEach((item, idx) => walk(item, `${path}[${idx}]`, labelKey));
        return;
      }

      if (typeof node !== "object") return;

      for (const [k, v] of Object.entries(node)) {
        if (k === "source" || k === "grounding" || k === "sources" || k === "sourceKeyList") continue;
        const nextPath = path ? `${path}.${k}` : k;

        if (v && typeof v === "object" && !Array.isArray(v)) {
          // Check for both old format (grounding) and new format (sources)
          const sourceData = getSourceData(v);
          if (hasValueStructure(v) && sourceData) {
            const entry = ensureEntry(sourceData);
            if (entry) {
              if (!entry.path) entry.path = nextPath;
              entry.kvPairs.push({
                key: toTitleCase(k),
                value: getDisplayValue(v, k) || "N/A",
                path: nextPath,
              });
            }
          } else {
            walk(v, nextPath, k);
          }
        } else if (Array.isArray(v)) {
          walk(v, nextPath, k);
        }
      }
    };

    walk(step1PreviewData, "", "");

    // Convert grouped entries into citations that the PDF overlay understands.
    // `text` is markdown rendered by `MarkdownWrapper` in the HoverCard.
    const escapeMd = (s) =>
      String(s ?? "")
        .replace(/\|/g, "\\|")
        .replace(/\r?\n/g, "<br/>");

    const toMarkdownTable = (columns, rows) => {
      if (!columns || columns.length === 0) return "";
      const header = `| ${columns.map(escapeMd).join(" | ")} |`;
      const divider = `| ${columns.map(() => "---").join(" | ")} |`;
      const body = rows
        .map(
          (r) =>
            `| ${columns.map((c) => escapeMd(r?.[c] ?? "N/A")).join(" | ")} |`
        )
        .join("\n");
      return `${header}\n${divider}\n${body}`;
    };

    return Array.from(byBox.values()).map((entry) => {
      const kvLines = entry.kvPairs
        .filter((x) => x?.key)
        .map((x) => `**${escapeMd(x.key)}**: ${escapeMd(x.value)}`);

      const tableBlocks = entry.tables.map((t) => {
        const title = t.title ? `\n\n**${escapeMd(t.title)}**\n\n` : "\n\n";
        return `${title}${toMarkdownTable(t.columns, t.rows)}`;
      });

      // Ensure each KV pair renders on its own line inside MarkdownWrapper
      const kvBlock = kvLines.length > 0 ? kvLines.join("<br/>") : "";

      return {
        id: entry.id,
        path: entry.path,
        title: "",
        text: [kvBlock, ...tableBlocks].filter(Boolean).join("\n\n"),
        pageIndex: entry.pageIndex,
        bbox: entry.bbox,
        // Store raw data for filtering when path is provided
        _rawData: {
          kvPairs: entry.kvPairs,
          tables: entry.tables,
        },
      };
    });
  }, [activeTab, step1PreviewData]);

  const handlePdfCitationClick = useCallback(
    (c) => {
      if (!c) return;
      setActiveCitation({ pageIndex: c.pageIndex, bbox: c.bbox });

      const container = rightPaneRef.current;
      if (!container) return;

      const cssEscape =
        typeof CSS !== "undefined" && CSS.escape
          ? CSS.escape
          : (s) => String(s).replace(/"/g, '\\"');

      const tryPaths = [];
      if (c.path) tryPaths.push(c.path);
      if (c.path && c.path.includes("[")) tryPaths.push(c.path.split("[")[0]);

      for (const p of tryPaths) {
        const sel = `[data-field-path="${cssEscape(
          p
        )}"],[data-section-path="${cssEscape(p)}"]`;
        const target = container.querySelector(sel);
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "center" });
          return;
        }
      }
    },
    [setActiveCitation]
  );

  const clearPdfActiveCitation = useCallback(() => {
    setActiveCitation(null);
  }, []);

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
      <ProcessingStepsFlowProvider dag_nodes={dagNodes} dag_edges={dagEdges}>
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
                      <PdfPreview
                        key={s3PdfUrl}
                        fileUrl={s3PdfUrl}
                        citation={activeCitation}
                        citations={
                          activeTab === "step-1" ? step1PdfCitations : []
                        }
                        onCitationClick={handlePdfCitationClick}
                        onClearCitation={clearPdfActiveCitation}
                      />
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
                      // {
                      //   value: "step-2",
                      //   label: "Validate CW Invoice",
                      //   stepNumber: 2,
                      //   isProcessing: stepStatus.isStep2Processing,
                      //   isLoading: isLoading,
                      //   isCompleted: stepStatus.isStep2Completed,
                      //   isFailed:
                      //     stepStatus.isStep2Failed || stepStatus.isStep1Failed,
                      //   isCancelled: stepStatus.isStep2Cancelled,
                      //   isPreviousStepCompleted: stepStatus.isStep1Completed,
                      // },
                      {
                        value: "step-3",
                        label: "CW Integration",
                        stepNumber: 2,
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
                    <div
                      ref={rightPaneRef}
                      className="h-full overflow-y-auto overflow-x-hidden dark:text-foreground/90 px-6 py-4"
                    >
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
                          onCitationChange={setActiveCitation}
                        />
                      </TabsContent>
                      {/* <TabsContent value="step-2" className="h-full">
                        <ProcessMessage
                          message={groupedTraceMessages["step-2"]}
                          isLoading={isLoading}
                          isMainProcessFailed={isMainProcessFailed}
                        />
                      </TabsContent> */}
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
