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

import Tesseract from "tesseract.js";

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
    const { theme } = useTheme();
    const isDarkMode = theme === "dark";

    // ✅ Selection & Capture State
    const [snipBox, setSnipBox] = useState(null);
    const [isSnipping, setIsSnipping] = useState(false);
    const [captured, setCaptured] = useState(null);
    const containerRef = useRef(null);

    useImperativeHandle(
      ref,
      () => ({
        getNumPages: () => numPages,
      }),
      [numPages]
    );

    const handleDocumentLoad = useCallback((e) => {
      setNumPages(e.doc.numPages);
      setIsPdfLoaded(true);
    }, []);

    useEffect(() => {
      setIsPdfLoaded(false);
      setNumPages(0);
    }, [fileUrl]);

    // Normalize citation
    const normalizedCitation = useMemo(
      () => normalizeCitation(citation),
      [citation]
    );

    const normalizedCitations = useMemo(
      () => normalizeCitations(citations),
      [citations]
    );

    const citationsByPage = useMemo(
      () => groupCitationsByPage(normalizedCitations),
      [normalizedCitations]
    );

    const defaultLayoutPluginInstance = defaultLayoutPlugin({
      sidebarTabs: () => [],
    });
    const pageNavigationPluginInstance = pageNavigationPlugin();
    const zoomPluginInstance = zoomPlugin();

    // Clear citation click outside
    useEffect(() => {
      if (!isPdfLoaded || !normalizedCitation) return;

      const onDocPointerDown = (e) => {
        const target = e.target;
        if (
          target?.closest?.('[data-citation-overlay="true"]') ||
          target?.closest?.('[data-slot="hover-card-content"]')
        ) return;

        onClearCitation?.();
      };

      document.addEventListener("pointerdown", onDocPointerDown, true);
      return () => {
        document.removeEventListener("pointerdown", onDocPointerDown, true);
      };
    }, [isPdfLoaded, normalizedCitation, onClearCitation]);

    // Citation scroll
    useEffect(() => {
      if (!normalizedCitation || !isPdfLoaded) return;

      try {
        pageNavigationPluginInstance.jumpToPage?.(
          normalizedCitation.pageIndex
        );
      } catch {}

      setTimeout(() => {
        document
          .getElementById("invoice-citation-highlight")
          ?.scrollIntoView({ block: "center", behavior: "smooth" });
      }, 120);
    }, [isPdfLoaded, normalizedCitation, pageNavigationPluginInstance]);

    // 🖱️ START SELECTION
    const startSnip = (e) => {
      const rect = containerRef.current.getBoundingClientRect();
      setIsSnipping(true);

      setSnipBox({
        startX: e.clientX - rect.left,
        startY: e.clientY - rect.top,
        endX: e.clientX - rect.left,
        endY: e.clientY - rect.top,
      });
    };

    // 🖱️ MOVE SELECTION
    const moveSnip = (e) => {
      if (!isSnipping || !snipBox) return;

      const rect = containerRef.current.getBoundingClientRect();

      setSnipBox((prev) => ({
        ...prev,
        endX: e.clientX - rect.left,
        endY: e.clientY - rect.top,
      }));
    };

    // 🖱️ END → SAFE SCREENSHOT + OCR
    const endSnip = async () => {
      try {
        if (!snipBox) return;
        setIsSnipping(false);

        const container = containerRef.current;
        if (!container) return;

        const x = Math.min(snipBox.startX, snipBox.endX);
        const y = Math.min(snipBox.startY, snipBox.endY);
        const w = Math.abs(snipBox.endX - snipBox.startX);
        const h = Math.abs(snipBox.endY - snipBox.startY);

        if (w < 10 || h < 10) {
          setSnipBox(null);
          return;
        }

        // Find real PDF canvas safely
        const pdfCanvas = container.querySelector(
          ".rpv-core__canvas-layer canvas"
        );

        if (!pdfCanvas) {
          console.warn("PDF canvas not ready yet");
          setSnipBox(null);
          return;
        }

        const canvasRect = pdfCanvas.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        const scaleX = pdfCanvas.width / canvasRect.width;
        const scaleY = pdfCanvas.height / canvasRect.height;

        const cropX = (x + containerRect.left - canvasRect.left) * scaleX;
        const cropY = (y + containerRect.top - canvasRect.top) * scaleY;
        const cropW = w * scaleX;
        const cropH = h * scaleY;

        if (cropW <= 0 || cropH <= 0) {
          console.warn("Invalid crop area");
          setSnipBox(null);
          return;
        }

        const crop = document.createElement("canvas");
        crop.width = cropW;
        crop.height = cropH;

        const ctx = crop.getContext("2d");

        ctx.drawImage(
          pdfCanvas,
          cropX,
          cropY,
          cropW,
          cropH,
          0,
          0,
          cropW,
          cropH
        );

        const image = crop.toDataURL("image/png");

        console.log("✅ Screenshot captured");

        let extractedText = "";
        try {
          // const result = await Tesseract.recognize(image, "eng");
          
          console.log(result,'resuly')
          extractedText = result.data.text;
          console.log("✅ OCR extracted");
        } catch {
          console.warn("OCR failed but image captured");
        }

        setCaptured({
          image,
          text: extractedText,
        });

        setSnipBox(null);
      } catch (err) {
        console.error("❌ Snipping error:", err);
        setSnipBox(null);
      }
    };

    // Render PDF page
    const renderPage = useCallback(
      (props) => {
        const pageCitations = citationsByPage.get(props.pageIndex) || [];

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
      <div
        ref={containerRef}
        className={cn(
          "h-full w-full invoice-pdf-container relative",
          className
        )}
        onPointerDown={startSnip}
        onPointerMove={moveSnip}
        onPointerUp={endSnip}
        style={{ touchAction: "none" }}
      >
        {/* Selection Box */}
        {snipBox && (
          <div
            style={{
              position: "absolute",
              left: Math.min(snipBox.startX, snipBox.endX),
              top: Math.min(snipBox.startY, snipBox.endY),
              width: Math.abs(snipBox.endX - snipBox.startX),
              height: Math.abs(snipBox.endY - snipBox.startY),
              border: "2px solid #22c55e",
              background: "rgba(34,197,94,0.15)",
              zIndex: 9999,
              pointerEvents: "none",
            }}
          />
        )}

        <Worker workerUrl="/pdf.worker.min.js">
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
        </Worker>

        {/* Preview Image + OCR Text */}
        {captured && (
          <div className="fixed bottom-4 right-4 bg-white dark:bg-black shadow-xl rounded-lg p-3 z-[99999] max-w-xs">
            <img src={captured.image} className="rounded mb-2" />
            <pre className="text-xs max-h-32 overflow-auto whitespace-pre-wrap">
              {captured.text}
            </pre>
          </div>
        )}
      </div>
    );
  }
);

InvoicePdf.displayName = "InvoicePdf";

export default memo(InvoicePdf);
