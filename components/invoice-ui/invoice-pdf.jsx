"use client";

import React, {
  forwardRef,
  useRef,
  useState,
  useEffect,
  useImperativeHandle,
  useCallback,
  memo,
  useMemo,
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
  const [isManualScrolling, setIsManualScrolling] = useState(false);
  const scrollTimeoutRef = useRef(null);

  useEffect(() => {
    if (!pdfjs.GlobalWorkerOptions.workerSrc) {
      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url
      ).toString();
    }

    // Suppress annotation warnings by overriding console.warn for PDF worker
    const originalWarn = console.warn;
    console.warn = (...args) => {
      const message = args.join(' ');
      if (message.includes('AnnotationBorderStyle.setWidth - ignoring width')) {
        return; // Suppress this specific warning
      }
      originalWarn.apply(console, args);
    };

    return () => {
      console.warn = originalWarn;
    };
  }, []);

  const resetPages = useCallback(() => {
    pageRefs.current.clear();
    transformRefs.current.clear();
    setVisiblePages(new Set());
  }, []);

  useEffect(() => {
    resetPages();
    setNumPages(0);
    setIsManualScrolling(false);
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
  }, [fileUrl, resetPages]);

  // Sync zoom scale when current page changes
  useEffect(() => {
    const transformRef = transformRefs.current.get(currentPage);

    if (transformRef) {
      let currentScale = 1;

      if (transformRef.state?.scale) {
        currentScale = transformRef.state.scale;
      } else if (transformRef.instance?.transformState?.scale) {
        currentScale = transformRef.instance.transformState.scale;
      } else if (transformRef.getContext && transformRef.getContext()?.transformState?.scale) {
        currentScale = transformRef.getContext().transformState.scale;
      }

      setZoomScale(currentScale);
    } else {
      setZoomScale(1);
    }
  }, [currentPage]);



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
      const newZoomLevel = Math.min(zoomScale * 1.25, 5);
      setZoomScale(newZoomLevel);
      transformRef.zoomIn(0.25);
    }
  }, [zoomScale, currentPage]);

  const handleZoomOut = useCallback(() => {
    const transformRef = transformRefs.current.get(currentPage);
    if (transformRef && zoomScale > 0.5) {
      const newZoomLevel = Math.max(zoomScale / 1.25, 0.5);
      setZoomScale(newZoomLevel);
      transformRef.zoomOut(0.25);
    }
  }, [zoomScale, currentPage]);

  const handleResetZoom = useCallback(() => {
    const transformRef = transformRefs.current.get(currentPage);
    if (transformRef) {
      setZoomScale(1);
      transformRef.resetTransform();
    }
  }, [currentPage]);

  const handleRotate = useCallback(() => {
    setRotation((prev) => (prev + 90) % 360);
  }, []);

  const setPage = useCallback((pageNumber) => {
    setIsManualScrolling(true);
    setCurrentPage(pageNumber);
    setPageInput(pageNumber.toString());

    // Clear any existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    const pageElement = pageRefs.current.get(pageNumber);
    if (pageElement) {
      pageElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    // Reset manual scrolling flag after a delay
    scrollTimeoutRef.current = setTimeout(() => {
      setIsManualScrolling(false);
    }, 1000);
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

  // Debounce function to limit frequent updates
  const debounce = useCallback((func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }, []);

  // Debounced function to update current page
  const debouncedSetCurrentPage = useMemo(
    () => debounce((pageNum) => {
      if (!isManualScrolling) {
        setCurrentPage(pageNum);
        setPageInput(pageNum.toString());
      }
    }, 100),
    [debounce, isManualScrolling]
  );

  useEffect(() => {
    if (!containerRef.current || numPages === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        let mostVisiblePage = null;
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

        // Update current page if we found a visible page and it's different from current
        // Use a lower threshold (0.25) to be more responsive, especially for the first page
        if (mostVisiblePage !== null && mostVisiblePage !== currentPage && maxIntersectionRatio > 0.25) {
          console.log("Updating current page to:", mostVisiblePage, "with ratio:", maxIntersectionRatio);
          debouncedSetCurrentPage(mostVisiblePage);
        }
      },
      {
        root: containerRef.current,
        rootMargin: "-10px 0px -10px 0px", // Reduced margin for better detection
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
      }
    );

    // Observe all existing page elements
    pageRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
      // Clear any pending timeouts
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [numPages, currentPage, debouncedSetCurrentPage]); // Added currentPage to deps

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
        </Button>

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
              "h-full w-full select-none",
              zoomScale === 1 ? "touch-pan-y" : "touch-none"
            )}
            ref={containerRef}
          // onScrollCapture={() => {
          //   // Detect scroll events to manage manual scrolling state
          //   setIsManualScrolling(true);
          //   if (scrollTimeoutRef.current) {
          //     clearTimeout(scrollTimeoutRef.current);
          //   }
          //   scrollTimeoutRef.current = setTimeout(() => {
          //     setIsManualScrolling(false);
          //   }, 300);
          // }}
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
                        // When unzoomed, disable wheel and panning so outer scroll works.
                        wheel={{
                          wheelDisabled: isAtDefaultZoom, // true when scale === 1
                          touchPadDisabled: false,
                          activationKeys: [], // no modifier required for touchpad pinch when enabled
                          step: 0.05,
                        }}
                        pinch={{
                          disabled: false,
                          step: 0.05,
                        }}
                        panning={{
                          disabled: isAtDefaultZoom, // disable panning when unzoomed
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
                          // Update zoom scale for the current page
                          if (pageNumber === currentPage) {
                            const currentScale = payload?.state?.scale ?? 1;
                            setZoomScale(currentScale);
                          }
                        }}
                        onPanning={(ref, event) => {
                          // Also update on panning as it might affect zoom
                          if (pageNumber === currentPage && ref?.state?.scale) {
                            const currentScale = ref.state.scale;
                            if (Math.abs(zoomScale - currentScale) > 0.001) {
                              setZoomScale(currentScale);
                            }
                          }
                        }}
                      >
                        <TransformComponent
                          wrapperStyle={{
                            width: "100%",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            // When unzoomed we want the transform child to allow default touch actions
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
