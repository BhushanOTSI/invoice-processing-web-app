"use client";

import React, {
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
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const InvoicePdf = forwardRef(({ fileUrl, className }, ref) => {
  const containerRef = useRef(null);
  const transformRefs = useRef(new Map());
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageWidths, setPageWidths] = useState(600);
  const [visiblePages, setVisiblePages] = useState(new Set());
  const pageRefs = useRef(new Map());
  const [zoomScale, setZoomScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [pageInput, setPageInput] = useState("1");

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
    transformRefs.current.clear();
    setVisiblePages(new Set());
  }, []);

  useEffect(() => {
    resetPages();
    setNumPages(0);
  }, [fileUrl, resetPages]);

  // Sync zoom scale when current page changes
  useEffect(() => {
    const transformRef = transformRefs.current.get(currentPage);
    if (transformRef && transformRef.instance) {
      const currentScale = transformRef.instance.transformState.scale;
      if (currentScale !== zoomScale) {
        setZoomScale(currentScale);
      }
    }
  }, [currentPage, zoomScale]);

  useImperativeHandle(ref, () => ({
    getNumPages: () => numPages,
    setNumPages: (n) => setNumPages(n),
  }));

  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setPageWidths(entry.contentRect.width);
      }
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

  const handleZoomIn = useCallback(() => {
    const transformRef = transformRefs.current.get(currentPage);
    if (transformRef && zoomScale < 5) {
      transformRef.zoomIn(0.25);
    }
  }, [zoomScale, currentPage]);

  const handleZoomOut = useCallback(() => {
    const transformRef = transformRefs.current.get(currentPage);
    if (transformRef && zoomScale > 0.5) {
      transformRef.zoomOut(0.25);
    }
  }, [zoomScale, currentPage]);

  const handleResetZoom = useCallback(() => {
    const transformRef = transformRefs.current.get(currentPage);
    if (transformRef) {
      transformRef.resetTransform();
    }
  }, [currentPage]);

  const handleRotate = useCallback(() => {
    setRotation((prev) => (prev + 90) % 360);
  }, []);

  const setPage = useCallback((pageNumber) => {
    setCurrentPage(pageNumber);
    setPageInput(pageNumber.toString());
    const pageElement = pageRefs.current.get(pageNumber);

    if (pageElement) {
      pageElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const handlePreviousPage = useCallback(() => {
    if (currentPage > 1) {
      setPage(currentPage - 1);
    }
  }, [currentPage, setPage]);

  const handleNextPage = useCallback(() => {
    if (currentPage < numPages) {
      setPage(currentPage + 1);
    }
  }, [currentPage, numPages, setPage]);

  const handlePageInputChange = useCallback((e) => {
    setPageInput(e.target.value);
  }, []);

  const handlePageInputSubmit = useCallback(
    (e) => {
      e.preventDefault();
      const pageNum = parseInt(pageInput, 10);
      if (pageNum >= 1 && pageNum <= numPages) {
        setPage(pageNum);
      } else {
        setPageInput(currentPage.toString());
      }
    },
    [pageInput, numPages, currentPage, setPage]
  );

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

  const registerTransformRef = useCallback(
    (pageNumber) => (ref) => {
      if (!ref) {
        transformRefs.current.delete(pageNumber);
        return;
      }
      transformRefs.current.set(pageNumber, ref);
    },
    []
  );

  useEffect(() => {
    if (!containerRef.current || numPages === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        let mostVisiblePage = currentPage;
        let maxIntersectionRatio = 0;

        entries.forEach((entry) => {
          const pageNum = Number(entry.target.getAttribute("data-page"));

          setVisiblePages((prev) => {
            const next = new Set(prev);
            if (entry.isIntersecting) {
              next.add(pageNum);
            } else {
              next.delete(pageNum);
            }
            return next;
          });

          // Track the most visible page only for intersecting entries
          if (entry.isIntersecting && entry.intersectionRatio > maxIntersectionRatio) {
            maxIntersectionRatio = entry.intersectionRatio;
            mostVisiblePage = pageNum;
          }
        });

        // Update current page if a different page is most visible
        if (mostVisiblePage !== currentPage && maxIntersectionRatio > 0.5) {
          setCurrentPage(mostVisiblePage);
          setPageInput(mostVisiblePage.toString());
        }
      },
      {
        root: containerRef.current,
        rootMargin: "10%",
        threshold: [0, 0.25, 0.5, 0.75, 1],
      }
    );

    // Observe all existing page elements
    pageRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [numPages]); // Removed currentPage dependency to prevent recreation

  const PdfViewerHeader = () => (
    <div className="sticky top-0 z-50 flex items-center justify-between p-3 border-b bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePreviousPage}
          disabled={currentPage <= 1}
          className="h-8 w-8 p-0 hover:bg-accent hover:text-accent-foreground"
          title="Previous Page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <form
          onSubmit={handlePageInputSubmit}
          className="flex items-center gap-1"
        >
          <Input
            type="text"
            value={pageInput}
            onChange={handlePageInputChange}
            className="h-8 w-14 text-center text-sm border focus:ring-2 focus:ring-primary/20"
            onBlur={handlePageInputSubmit}
            title="Enter page number"
          />
          <span className="text-sm text-muted-foreground font-medium">
            / {numPages}
          </span>
        </form>

        <Button
          variant="outline"
          size="sm"
          onClick={handleNextPage}
          disabled={currentPage >= numPages}
          className="h-8 w-8 p-0 hover:bg-accent hover:text-accent-foreground"
          title="Next Page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleZoomOut}
          disabled={zoomScale <= 0.5}
          className="h-8 w-8 p-0 hover:bg-accent hover:text-accent-foreground"
          title="Zoom Out (25%)"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Badge
          variant="secondary"
          className="px-3 py-1 text-xs font-mono cursor-pointer hover:bg-secondary/80 transition-colors min-w-[65px] text-center border"
          onClick={handleResetZoom}
          title="Click to reset zoom to 100%"
        >
          {(zoomScale * 100).toFixed(0)}%
        </Badge>
        <Button
          variant="outline"
          size="sm"
          onClick={handleZoomIn}
          disabled={zoomScale >= 5}
          className="h-8 w-8 p-0 hover:bg-accent hover:text-accent-foreground"
          title="Zoom In (25%)"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>{" "}
        <Separator orientation="vertical" className="h-6" />
        <Button
          variant="outline"
          size="sm"
          onClick={handleRotate}
          className="h-8 w-8 p-0 hover:bg-accent hover:text-accent-foreground"
          title={`Rotate 90° (currently ${rotation}°)`}
        >
          <RotateCw className="h-4 w-4" />
        </Button>
      </div>


    </div>
  );

  return (
    <div
      className={cn("h-full w-full flex flex-col overflow-hidden", className)}
    >
      <PdfViewerHeader />

      <div className="flex-1 w-full flex flex-row overflow-hidden min-h-0">
        <div className="flex-1 overflow-hidden min-h-0 h-full">
          <ScrollArea
            className={cn(
              "h-full w-full select-none touch-none",
              zoomScale === 1 && "touch-pan-y"
            )}
            ref={containerRef}
          >
            <Document
              file={fileUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              className={"w-full"}
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

                const isAtDefaultZoom = zoomScale === 1;

                return (
                  <div
                    key={pageNumber}
                    ref={registerPageRef(pageNumber)}
                    data-page={pageNumber}
                    className="px-8 first:pt-8 pb-8"
                  >
                    {visiblePages.has(pageNumber) && (
                      <TransformWrapper
                        ref={registerTransformRef(pageNumber)}
                        wheel={{
                          wheelDisabled: isAtDefaultZoom,
                          touchPadDisabled: false,
                          activationKeys: [],
                          step: 0.05,
                        }}
                        pinch={{
                          disabled: false,
                          step: 0.05,
                        }}
                        panning={{
                          disabled: isAtDefaultZoom,
                          velocityDisabled: true,
                          lockAxisX: false,
                          lockAxisY: false,
                          activationKeys: [],
                          wheelPanning: false,
                        }}
                        minScale={0.5}
                        maxScale={5}
                        doubleClick={{
                          disabled: false,
                          step: 0.7,
                          mode: "zoomIn",
                        }}
                        limitToBounds={true}
                        centerOnInit={true}
                        centerZoomedOut={true}
                        smooth={true}
                        onZoomChange={(payload) => {
                          // Only update zoom scale if this is the current page
                          if (pageNumber === currentPage) {
                            const currentScale = payload?.state?.scale ?? 1;
                            setZoomScale(currentScale);
                          }
                        }}
                      >
                        <TransformComponent
                          wrapperStyle={{
                            width: "100%",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            touchAction: isAtDefaultZoom ? "auto" : "none",
                          }}
                          contentStyle={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            touchAction: isAtDefaultZoom ? "auto" : "none",
                          }}
                        >
                          <Page
                            pageNumber={pageNumber}
                            width={Math.max(200, pageWidths - 80)}
                            rotate={rotation}
                            renderAnnotationLayer={true}
                            renderTextLayer={true}
                            loading={null}
                          />
                        </TransformComponent>
                      </TransformWrapper>
                    )}
                  </div>
                );
              })}
            </Document>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
});

InvoicePdf.displayName = "InvoicePdf";
export default memo(InvoicePdf);
