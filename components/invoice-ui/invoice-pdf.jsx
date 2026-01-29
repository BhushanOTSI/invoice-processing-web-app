"use client";

import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
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

import { cn } from "@/lib/utils";
import { Spinner } from "../ui/spinner";
import { useTheme } from "next-themes";

const InvoicePdf = forwardRef(({ fileUrl, className }, ref) => {
  const [numPages, setNumPages] = useState(0);
  const [isPdfLoaded, setIsPdfLoaded] = useState(false);

  const pdfContainerRef = useRef(null);

  const [editMode, setEditMode] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [selection, setSelection] = useState(null);

  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    sidebarTabs: () => [],
  });
  const pageNavigationPluginInstance = pageNavigationPlugin();
  const zoomPluginInstance = zoomPlugin();

  useImperativeHandle(ref, () => ({
    getNumPages: () => numPages,
  }));

  const handleDocumentLoad = useCallback((e) => {
    setNumPages(e.doc.numPages);
    setIsPdfLoaded(true);
  }, []);

  useEffect(() => {
    setIsPdfLoaded(false);
    setNumPages(0);
  }, [fileUrl]);

  // -----------------------------
  // Selection logic
  // -----------------------------

  const onPointerDown = (e) => {
    if (!editMode) return;

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

  const onPointerUp = async () => {
    if (!editMode || !selection) {
      setDragStart(null);
      return;
    }

    await captureSelection();
    setDragStart(null);
  };

  const captureSelection = async () => {
    if (!pdfContainerRef.current || !selection) return;

    const canvas = await htmlToImage.toCanvas(pdfContainerRef.current);

    const cropped = document.createElement("canvas");
    cropped.width = selection.width;
    cropped.height = selection.height;

    const ctx = cropped.getContext("2d");

    ctx.drawImage(
      canvas,
      selection.x,
      selection.y,
      selection.width,
      selection.height,
      0,
      0,
      selection.width,
      selection.height
    );

    const img = cropped.toDataURL("image/png");

    console.log("SNIPPED IMAGE:", img);

    // Send img to backend / OCR / save here
  };

  return (
    <div
      ref={pdfContainerRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      className={cn(
        "relative h-full w-full invoice-pdf-container select-none",
        className
      )}
    >
      {/* Edit toggle */}
      <button
        onClick={() => {
          setEditMode((v) => !v);
          setSelection(null);
        }}
        className="absolute right-3 top-3 z-50 rounded bg-black/70 px-3 py-1 text-sm text-white"
      >
        {editMode ? "Done" : "Edit"}
      </button>

      {/* Selection rectangle */}
      {editMode && selection && (
        <div
          style={{
            left: selection.x,
            top: selection.y,
            width: selection.width,
            height: selection.height,
          }}
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
          defaultScale="PageWidth"
          renderLoader={() => <Spinner />}
          pageLayout="single"
        />
      </Worker>
    </div>
  );
});

InvoicePdf.displayName = "InvoicePdf";

export default memo(InvoicePdf);
