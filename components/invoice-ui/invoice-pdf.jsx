"use client";

import {
  forwardRef,
  memo,
  useImperativeHandle,
  useState,
  useEffect,
} from "react";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import { zoomPlugin } from "@react-pdf-viewer/zoom";

import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import "@react-pdf-viewer/zoom/lib/styles/index.css";
import "@/app/pdf-viewer-dark.css";
import { cn } from "@/lib/utils";

const InvoicePdf = forwardRef(({ fileUrl, className }, ref) => {
  const [numPages, setNumPages] = useState(0);

  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    sidebarTabs: () => [],
  });
  const zoomPluginInstance = zoomPlugin();

  useImperativeHandle(ref, () => ({
    getNumPages: () => numPages,
    setNumPages: (n) => setNumPages(n),
  }));

  const handleDocumentLoad = (e) => {
    setNumPages(e.doc.numPages);
  };
  return (
    <div className={cn("h-full w-full p-4 bg-accent", className)}>
      <Worker workerUrl="/pdf.worker.min.js">
        <div className="h-full">
          <Viewer
            fileUrl={fileUrl}
            plugins={[defaultLayoutPluginInstance, zoomPluginInstance]}
            onDocumentLoad={handleDocumentLoad}
            theme="auto"
            defaultScale={1}
          />
        </div>
      </Worker>
    </div>
  );
});

InvoicePdf.displayName = "InvoicePdf";

export default memo(InvoicePdf);
