"use client";

import {
  forwardRef,
  memo,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import { pageNavigationPlugin } from "@react-pdf-viewer/page-navigation";
import { zoomPlugin } from "@react-pdf-viewer/zoom";

import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import "@react-pdf-viewer/zoom/lib/styles/index.css";
import "@/app/pdf-viewer-dark.css";
import { cn } from "@/lib/utils";
import { Spinner } from "../ui/spinner";
import { MarkdownWrapper } from "./markdown";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card";

const InvoicePdf = forwardRef(
  (
    {
      fileUrl,
      className,
      citation,
      citations = [],
      onCitationClick,
      onClearCitation,
    },
    ref
  ) => {
    const [numPages, setNumPages] = useState(0);
    const [isPdfLoaded, setIsPdfLoaded] = useState(false);
    const defaultLayoutPluginInstance = defaultLayoutPlugin({
      sidebarTabs: () => [],
    });
    const pageNavigationPluginInstance = pageNavigationPlugin();
    const zoomPluginInstance = zoomPlugin();

    useImperativeHandle(ref, () => ({
      getNumPages: () => numPages,
      setNumPages: (n) => setNumPages(n),
    }));

    const handleDocumentLoad = (e) => {
      setNumPages(e.doc.numPages);
      setIsPdfLoaded(true);
    };

    // Reset load state when switching PDFs
    useEffect(() => {
      setIsPdfLoaded(false);
      setNumPages(0);
    }, [fileUrl]);

    const normalizedCitation = useMemo(() => {
      if (!citation) return null;
      const pageIndex = Number.isFinite(Number(citation.pageIndex))
        ? Number(citation.pageIndex)
        : null;
      const bbox = Array.isArray(citation.bbox)
        ? citation.bbox.map((n) => Number(n))
        : null;
      if (pageIndex === null || !bbox || bbox.length !== 4) return null;
      return { pageIndex, bbox };
    }, [citation]);

    const normalizedCitations = useMemo(() => {
      if (!Array.isArray(citations)) return [];
      return citations
        .map((c, idx) => {
          const pageIndex = Number.isFinite(Number(c?.pageIndex))
            ? Number(c.pageIndex)
            : null;
          const bbox = Array.isArray(c?.bbox)
            ? c.bbox.map((n) => Number(n))
            : null;
          if (pageIndex === null || !bbox || bbox.length !== 4) return null;
          return {
            id: c?.id ?? `${pageIndex}:${bbox.join(",")}:${idx}`,
            pageIndex,
            bbox,
            title: c?.title ?? "",
            text: c?.text ?? "",
            path: c?.path ?? "",
          };
        })
        .filter(Boolean);
    }, [citations]);

    const citationsByPage = useMemo(() => {
      const map = new Map();
      for (const c of normalizedCitations) {
        const arr = map.get(c.pageIndex) || [];
        arr.push(c);
        map.set(c.pageIndex, arr);
      }
      return map;
    }, [normalizedCitations]);

    const lastCitationKeyRef = useRef(null);
    const lastCitationPageRef = useRef(null);

    // Click outside: clear the active citation (closes the always-open HoverCard)
    useEffect(() => {
      if (!isPdfLoaded) return;
      if (!normalizedCitation) return;

      const onDocPointerDown = (e) => {
        const target = e.target;
        // Don't clear when clicking the citation overlays or the hovercard content
        if (
          target?.closest?.('[data-citation-overlay="true"]') ||
          target?.closest?.('[data-slot="hover-card-content"]')
        ) {
          return;
        }

        onClearCitation?.();
      };

      document.addEventListener("pointerdown", onDocPointerDown, true);
      return () => {
        document.removeEventListener("pointerdown", onDocPointerDown, true);
      };
    }, [isPdfLoaded, normalizedCitation, onClearCitation]);

    useEffect(() => {
      if (!normalizedCitation) return;
      if (!isPdfLoaded) return;

      const key = `${
        normalizedCitation.pageIndex
      }:${normalizedCitation.bbox.join(",")}`;
      if (key === lastCitationKeyRef.current) return;
      lastCitationKeyRef.current = key;

      // Robust page jump (works even when pages are virtualized)
      if (lastCitationPageRef.current !== normalizedCitation.pageIndex) {
        lastCitationPageRef.current = normalizedCitation.pageIndex;
        try {
          pageNavigationPluginInstance.jumpToPage?.(
            normalizedCitation.pageIndex
          );
        } catch {
          // no-op
        }
      }

      // Scroll the highlight into view once it exists
      const t = window.setTimeout(() => {
        const hl = document.getElementById("invoice-citation-highlight");
        if (hl) {
          hl.scrollIntoView({ block: "center", behavior: "smooth" });
        }
      }, 120);
      return () => window.clearTimeout(t);
    }, [isPdfLoaded, normalizedCitation]);

    const renderPage = useMemo(() => {
      return (props) => {
        const show =
          normalizedCitation &&
          props.pageIndex === normalizedCitation.pageIndex;

        const isSameBbox = (a, b) => {
          if (!a || !b || a.length !== 4 || b.length !== 4) return false;
          for (let i = 0; i < 4; i++) {
            if (Math.abs(Number(a[i]) - Number(b[i])) > 1e-6) return false;
          }
          return true;
        };

        let style = null;
        if (isPdfLoaded && show) {
          const [x0, y0, x1, y1] = normalizedCitation.bbox;
          const left = Math.min(x0, x1) * 100;
          const top = Math.min(y0, y1) * 100;
          const width = Math.abs(x1 - x0) * 100;
          const height = Math.abs(y1 - y0) * 100;
          style = {
            position: "absolute",
            left: `${left}%`,
            top: `${top}%`,
            width: `${width}%`,
            height: `${height}%`,
            background: "rgba(255, 255, 0, 0.25)",
            border: "2px solid rgba(234, 179, 8, 0.9)",
            borderRadius: "4px",
            pointerEvents: "none",
            boxSizing: "border-box",
            zIndex: 5,
          };
        }

        const pageCitations = isPdfLoaded
          ? citationsByPage.get(props.pageIndex) || []
          : [];

        return (
          <div
            id={`invoice-pdf-page-${props.pageIndex}`}
            style={{ position: "relative", width: "100%", height: "100%" }}
          >
            {props.canvasLayer.children}

            {/* All citations overlay (step-1) */}
            {pageCitations.map((c) => {
              const isActive =
                !!normalizedCitation &&
                c.pageIndex === normalizedCitation.pageIndex &&
                isSameBbox(c.bbox, normalizedCitation.bbox);

              const [x0, y0, x1, y1] = c.bbox;
              const left = Math.min(x0, x1) * 100;
              const top = Math.min(y0, y1) * 100;
              const width = Math.abs(x1 - x0) * 100;
              const height = Math.abs(y1 - y0) * 100;

              const boxStyle = {
                position: "absolute",
                left: `${left}%`,
                top: `${top}%`,
                width: `${width}%`,
                height: `${height}%`,
                background: "rgba(255, 255, 0, 0.12)",
                border: "1px solid rgba(234, 179, 8, 0.55)",
                borderRadius: "4px",
                boxSizing: "border-box",
                zIndex: 3,
                cursor: "pointer",
              };

              return (
                <HoverCard
                  key={c.id}
                  {...(isActive
                    ? { open: true }
                    : { openDelay: 120, closeDelay: 60 })}
                >
                  <HoverCardTrigger asChild>
                    <div
                      style={boxStyle}
                      data-citation-overlay="true"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCitationClick?.(c);
                      }}
                      aria-label={c.title || "Citation"}
                    />
                  </HoverCardTrigger>
                  <HoverCardContent
                    side="top"
                    align="start"
                    sideOffset={8}
                    className="min-w-104 w-auto max-w-130 p-3 text-xs leading-5 *:text-xs bg-background/95 dark:bg-background/90 border border-border/70 shadow-2xl ring-1 ring-black/10 dark:ring-white/10 backdrop-blur-md max-h-80 overflow-auto"
                  >
                    {c.title && (
                      <div className="font-semibold text-foreground mb-1">
                        {c.title}
                      </div>
                    )}
                    {c.text && <MarkdownWrapper>{c.text}</MarkdownWrapper>}
                  </HoverCardContent>
                </HoverCard>
              );
            })}

            {isPdfLoaded && show && (
              <div id="invoice-citation-highlight" style={style} />
            )}
            {props.textLayer.children}
            {props.annotationLayer.children}
          </div>
        );
      };
    }, [citationsByPage, isPdfLoaded, normalizedCitation, onCitationClick]);

    return (
      <div className={cn("h-full w-full invoice-pdf-container", className)}>
        <Worker workerUrl="/pdf.worker.min.js">
          <div className="h-full">
            <Viewer
              fileUrl={fileUrl}
              plugins={[
                defaultLayoutPluginInstance,
                pageNavigationPluginInstance,
                zoomPluginInstance,
              ]}
              onDocumentLoad={handleDocumentLoad}
              theme="auto"
              defaultScale={"PageWidth"}
              renderLoader={() => <Spinner />}
              pageLayout="single"
              renderPage={renderPage}
            />
          </div>
        </Worker>
      </div>
    );
  }
);

InvoicePdf.displayName = "InvoicePdf";

export default memo(InvoicePdf);
