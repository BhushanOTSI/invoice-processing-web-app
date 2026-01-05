"use client";

import {
  forwardRef,
  memo,
  useCallback,
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
import PDFPageRenderer from "./pdf-page-renderer";
import {
  normalizeCitation,
  normalizeCitations,
  groupCitationsByPage,
} from "./citation-utils";
import { useTheme } from "next-themes";

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
    const pluginsRef = useRef(null);
    const { theme } = useTheme();
    const isDarkMode = theme === "dark";

    useImperativeHandle(
      ref,
      () => ({
        getNumPages: () => numPages,
        setNumPages: (n) => setNumPages(n),
      }),
      [numPages]
    );

    const handleDocumentLoad = useCallback((e) => {
      setNumPages(e.doc.numPages);
      setIsPdfLoaded(true);
    }, []);

    // Reset load state when switching PDFs
    useEffect(() => {
      setIsPdfLoaded(false);
      setNumPages(0);
    }, [fileUrl]);

    // Normalize citation
    const normalizedCitation = useMemo(
      () => normalizeCitation(citation),
      [citation]
    );

    // Normalize citations array
    const normalizedCitations = useMemo(
      () => normalizeCitations(citations),
      [citations]
    );

    // Group citations by page
    const citationsByPage = useMemo(
      () => groupCitationsByPage(normalizedCitations),
      [normalizedCitations]
    );

    const lastCitationKeyRef = useRef(null);
    const lastCitationPageRef = useRef(null);

    // Create plugins after all other hooks to maintain consistent hook order
    // Plugins may use hooks internally, so they must be created unconditionally on every render
    // We still store them in ref, but create fresh instances to maintain hook order
    const defaultLayoutPluginInstance = defaultLayoutPlugin({
      sidebarTabs: () => [],
    });
    const pageNavigationPluginInstance = pageNavigationPlugin();
    const zoomPluginInstance = zoomPlugin();

    // Store in ref for reference, but plugins are created fresh each render
    // This is necessary if plugins use hooks internally
    pluginsRef.current = {
      defaultLayoutPluginInstance,
      pageNavigationPluginInstance,
      zoomPluginInstance,
    };

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

    // Handle citation navigation and scrolling
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
    }, [isPdfLoaded, normalizedCitation, pageNavigationPluginInstance]);

    // Memoize the page renderer function
    const renderPage = useCallback(
      (props) => {
        const pageCitations = isPdfLoaded
          ? citationsByPage.get(props.pageIndex) || []
          : [];

        return (
          <PDFPageRenderer
            pageIndex={props.pageIndex}
            canvasLayer={props.canvasLayer}
            textLayer={props.textLayer}
            normalizedCitation={normalizedCitation}
            pageCitations={pageCitations}
            isPdfLoaded={isPdfLoaded}
            onCitationClick={onCitationClick}
          />
        );
      },
      [citationsByPage, isPdfLoaded, normalizedCitation, onCitationClick]
    );

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
              theme={isDarkMode ? "dark" : "light"}
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
