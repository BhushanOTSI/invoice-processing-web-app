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

const InvoicePdf = forwardRef(({ fileUrl, className, citation }, ref) => {
  const [numPages, setNumPages] = useState(0);
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
  };

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

  const lastCitationKeyRef = useRef(null);
  const lastCitationPageRef = useRef(null);

  useEffect(() => {
    if (!normalizedCitation) return;

    const key = `${normalizedCitation.pageIndex}:${normalizedCitation.bbox.join(
      ","
    )}`;
    if (key === lastCitationKeyRef.current) return;
    lastCitationKeyRef.current = key;

    // Robust page jump (works even when pages are virtualized)
    if (lastCitationPageRef.current !== normalizedCitation.pageIndex) {
      lastCitationPageRef.current = normalizedCitation.pageIndex;
      try {
        pageNavigationPluginInstance.jumpToPage?.(normalizedCitation.pageIndex);
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
  }, [normalizedCitation]);

  const renderPage = useMemo(() => {
    return (props) => {
      const show =
        normalizedCitation && props.pageIndex === normalizedCitation.pageIndex;

      let style = null;
      if (show) {
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

      return (
        <div
          id={`invoice-pdf-page-${props.pageIndex}`}
          style={{ position: "relative", width: "100%", height: "100%" }}
        >
          {props.canvasLayer.children}
          {show && <div id="invoice-citation-highlight" style={style} />}
          {props.textLayer.children}
          {props.annotationLayer.children}
        </div>
      );
    };
  }, [normalizedCitation]);

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
            defaultScale={1}
            renderLoader={() => <Spinner />}
            pageLayout="single"
            renderPage={renderPage}
          />
        </div>
      </Worker>
    </div>
  );
});

InvoicePdf.displayName = "InvoicePdf";

export default memo(InvoicePdf);
