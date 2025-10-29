"use client";

import {
  forwardRef,
  useRef,
  useState,
  useEffect,
  useImperativeHandle,
  useCallback,
  memo,
} from "react";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import { Document, Page, pdfjs } from "react-pdf";
import { ScrollArea } from "../ui/scroll-area";

const InvoicePdf = forwardRef(({ fileUrl, className }, ref) => {
  const containerRef = useRef(null);
  const [numPages, setNumPages] = useState(1);
  const [pageWidths, setPageWidths] = useState(600);
  const [visiblePages, setVisiblePages] = useState(new Set());
  const pageRefs = useRef(new Map());

  useEffect(() => {
    if (!pdfjs.GlobalWorkerOptions.workerSrc) {
      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url
      ).toString();
    }
  }, []);

  const resetPages = useCallback(() => {
    pageRefs.current.clear();
    setVisiblePages(new Set());
  }, []);

  useEffect(() => {
    resetPages();
    setNumPages(0);
  }, [fileUrl, resetPages]);

  useImperativeHandle(ref, () => ({
    getNumPages: () => numPages,
    setNumPages: (n) => setNumPages(n),
  }));

  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) setPageWidths(entry.contentRect.width);
    });

    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  const onDocumentLoadSuccess = useCallback(({ numPages: totalPages }) => {
    setNumPages(totalPages);
  }, []);

  const onDocumentLoadError = useCallback(() => {
    resetPages();
    setNumPages(0);
  }, [resetPages]);

  const registerPageRef = useCallback(
    (pageNumber) => (node) => {
      if (!node) {
        pageRefs.current.delete(pageNumber);
        return;
      }

      pageRefs.current.set(pageNumber, node);
    },
    []
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const pageNum = Number(entry.target.getAttribute("data-page"));
          if (entry.isIntersecting) {
            setVisiblePages((prev) => {
              const next = new Set(prev);
              next.add(pageNum);
              return next;
            });
          }
        });
      },
      { root: containerRef.current, rootMargin: "10%" }
    );

    pageRefs.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [numPages]);

  return (
    <div
      ref={containerRef}
      className={cn("h-full w-full overflow-y-auto flex flex-row", className)}
    >
      <div className="flex-1">
        <ScrollArea className="h-full">
          <Document
            file={fileUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            className={"h-full [&>div]:h-full"}
            loading={
              <div className="flex-1 justify-center items-center h-full min-h-[calc(100vh-4rem)] flex flex-col">
                <Spinner />
              </div>
            }
            error={
              <div className="flex-1 justify-center items-center text-sm text-red-500 h-full flex flex-col">
                Unable to load this PDF document.
              </div>
            }
          >
            {Array.from({ length: numPages }, (_, index) => {
              const pageNumber = index + 1;

              return (
                <div
                  key={pageNumber}
                  ref={registerPageRef(pageNumber)}
                  data-page={pageNumber}
                  className="px-4 first:pt-4 pb-4"
                >
                  {visiblePages.has(pageNumber) && (
                    <Page
                      pageNumber={pageNumber}
                      width={pageWidths - 40}
                      renderAnnotationLayer={true}
                      renderTextLayer={true}
                      loading={null}
                    />
                  )}
                </div>
              );
            })}
          </Document>
        </ScrollArea>
      </div>
    </div>
  );
});

InvoicePdf.displayName = "InvoicePdf";

export default memo(InvoicePdf);
