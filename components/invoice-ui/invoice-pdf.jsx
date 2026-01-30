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
import * as htmlToImage from "html-to-image";

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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Check, Copy } from "lucide-react";

const InvoicePdf = forwardRef(
  (
    {
      fileUrl,
      className,
      citation,
      citations = [],
      editMode = false,
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

    const pdfContainerRef = useRef(null);
    const [dragStart, setDragStart] = useState(null);
    const [selection, setSelection] = useState(null);
    const [capturedImage, setCapturedImage] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

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
    const defaultLayoutPluginInstance = defaultLayoutPlugin({
      sidebarTabs: () => [],
    });
    const pageNavigationPluginInstance = pageNavigationPlugin();
    const zoomPluginInstance = zoomPlugin();

    pluginsRef.current = {
      defaultLayoutPluginInstance,
      pageNavigationPluginInstance,
      zoomPluginInstance,
    };

    // Click outside: clear the active citation
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

      const key = `${normalizedCitation.pageIndex
        }:${normalizedCitation.bbox.join(",")}`;
      if (key === lastCitationKeyRef.current) return;
      lastCitationKeyRef.current = key;

      // Robust page jump
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
        const isPdfReady =
          isPdfLoaded || !props.canvasLayerRendered || !props.textLayerRendered;
        const pageCitations = isPdfReady
          ? citationsByPage.get(props.pageIndex) || []
          : [];

        return (
          <PDFPageRenderer
            pageIndex={props.pageIndex}
            canvasLayer={props.canvasLayer}
            textLayer={props.textLayer}
            normalizedCitation={normalizedCitation}
            pageCitations={pageCitations}
            isPdfLoaded={isPdfReady}
            onCitationClick={onCitationClick}
          />
        );
      },
      [citationsByPage, isPdfLoaded, normalizedCitation, onCitationClick]
    );

    // -----------------------------
    // Selection logic
    // -----------------------------

    const onPointerDown = (e) => {
      if (!editMode) return;

      e.target.setPointerCapture(e.pointerId);

      const rect = pdfContainerRef.current.getBoundingClientRect();

      setDragStart({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });

      setSelection(null);
    };

    const onPointerMove = (e) => {
      if (!editMode || !dragStart) return;

      const rect = pdfContainerRef.current.getBoundingClientRect();

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setSelection({
        x: Math.min(dragStart.x, x),
        y: Math.min(dragStart.y, y),
        width: Math.abs(x - dragStart.x),
        height: Math.abs(y - dragStart.y),
      });
    };

    const onPointerUp = async (e) => {
      if (!editMode) {
        setDragStart(null);
        return;
      }

      if (editMode && dragStart) {
        e.target.releasePointerCapture(e.pointerId);
      }

      if (!selection) {
        setDragStart(null);
        return;
      }

      await captureSelection();
      setDragStart(null);
    };

    const captureSelection = async () => {
      if (!pdfContainerRef.current || !selection) return;

      try {
        // Filter out the selection box itself
        const filter = (node) => {
          return node.id !== "selection-overlay";
        };

        const pixelRatio = window.devicePixelRatio || 1;

        const canvas = await htmlToImage.toCanvas(pdfContainerRef.current, {
          filter,
          pixelRatio,
          skipAutoScale: true,
        });

        const cropped = document.createElement("canvas");
        cropped.width = selection.width * pixelRatio;
        cropped.height = selection.height * pixelRatio;

        const ctx = cropped.getContext("2d");

        ctx.drawImage(
          canvas,
          selection.x * pixelRatio,
          selection.y * pixelRatio,
          selection.width * pixelRatio,
          selection.height * pixelRatio,
          0,
          0,
          selection.width * pixelRatio,
          selection.height * pixelRatio
        );

        const img = cropped.toDataURL("image/png");
        setCapturedImage(img);
        setIsDialogOpen(true);
      } catch (error) {
        console.error("Failed to capture selection:", error);
      }
    };

    const copyToClipboard = async () => {
      if (!capturedImage) return;
      try {
        const response = await fetch(capturedImage);
        const blob = await response.blob();
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy:", err);
      }
    };

    return (
      <div
        ref={pdfContainerRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        data-edit-mode={editMode}
        className={cn(
          "relative h-full w-full invoice-pdf-container select-none",
          editMode ? "touch-none cursor-crosshair" : "",
          className
        )}
      >
        <style jsx global>{`
          .invoice-pdf-container[data-edit-mode="true"] [data-citation-overlay="true"] {
             pointer-events: none !important;
          }
        `}</style>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Captured Image</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center gap-4">
              {capturedImage && (
                <div className="border rounded bg-muted/50 p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={capturedImage}
                    alt="Snippet"
                    className="max-h-[60vh] w-auto object-contain"
                  />
                </div>
              )}
              <div className="flex justify-end w-full">
                <Button onClick={copyToClipboard} className="gap-2">
                  {isCopied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  {isCopied ? "Copied" : "Copy to Clipboard"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Selection rectangle */}
        {editMode && selection && (
          <div
            style={{
              left: selection.x,
              top: selection.y,
              width: selection.width,
              height: selection.height,
            }}
            id="selection-overlay"
            className="absolute z-40 border-2 border-blue-500 bg-blue-400/20"
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
      </div>
    );
  }
);

InvoicePdf.displayName = "InvoicePdf";

export default memo(InvoicePdf);
