// invoice-pdf.jsx
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
import dynamic from "next/dynamic";
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
  Search,
  MoreHorizontal
} from "lucide-react";

const InvoicePdf = forwardRef(({ fileUrl, className }, ref) => {
  const containerRef = useRef(null);
  const transformRef = useRef(null);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageWidths, setPageWidths] = useState(600);
  const [visiblePages, setVisiblePages] = useState(new Set());
  const pageRefs = useRef(new Map());
  const [zoomScale, setZoomScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageInput, setPageInput] = useState("1");

  // pdf.worker setup
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

  // Observe container width to set PDF page width
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

  // Zoom control handlers
  const handleZoomIn = useCallback(() => {
    if (transformRef.current && zoomScale < 5) {
      transformRef.current.zoomIn(0.25);
    }
  }, [zoomScale]);

  const handleZoomOut = useCallback(() => {
    if (transformRef.current && zoomScale > 0.5) {
      transformRef.current.zoomOut(0.25);
    }
  }, [zoomScale]);

  const handleResetZoom = useCallback(() => {
    if (transformRef.current) {
      transformRef.current.resetTransform();
    }
  }, []);

  // Rotation handler
  const handleRotate = useCallback(() => {
    setRotation(prev => (prev + 90) % 360);
  }, []);

  // Page navigation handlers
  const handlePreviousPage = useCallback(() => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      setPageInput(newPage.toString());
      // Scroll to page
      const pageElement = pageRefs.current.get(newPage);
      if (pageElement) {
        pageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [currentPage]);

  const handleNextPage = useCallback(() => {
    if (currentPage < numPages) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      setPageInput(newPage.toString());
      // Scroll to page
      const pageElement = pageRefs.current.get(newPage);
      if (pageElement) {
        pageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [currentPage, numPages]);

  const handlePageInputChange = useCallback((e) => {
    setPageInput(e.target.value);
  }, []);

  const handlePageInputSubmit = useCallback((e) => {
    e.preventDefault();
    const pageNum = parseInt(pageInput, 10);
    if (pageNum >= 1 && pageNum <= numPages) {
      setCurrentPage(pageNum);
      const pageElement = pageRefs.current.get(pageNum);
      if (pageElement) {
        pageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      setPageInput(currentPage.toString());
    }
  }, [pageInput, numPages, currentPage]);

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

  // IntersectionObserver to lazy-render visible pages
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        let mostVisiblePage = currentPage;
        let maxIntersectionRatio = 0;

        entries.forEach((entry) => {
          const pageNum = Number(entry.target.getAttribute("data-page"));
          if (entry.isIntersecting) {
            setVisiblePages((prev) => {
              const next = new Set(prev);
              next.add(pageNum);
              return next;
            });

            // Track the most visible page
            if (entry.intersectionRatio > maxIntersectionRatio) {
              maxIntersectionRatio = entry.intersectionRatio;
              mostVisiblePage = pageNum;
            }
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

    pageRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [numPages, currentPage]);

  // === KEY IDEA ===
  // When zoomScale === 1:
  //   - let outer container handle vertical scroll
  //   - disable TransformWrapper's wheel and panning (so it doesn't intercept)
  // When zoomScale > 1:
  //   - enable wheel/panning so user can pan/zoom the page

  // PDF Viewer Header Component
  const PdfViewerHeader = () => (
    <div className="sticky top-0 z-50 flex items-center justify-between p-3 border-b bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/60 shadow-sm">
      {/* Left side - Page Navigation */}
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

        <form onSubmit={handlePageInputSubmit} className="flex items-center gap-1">
          <Input
            type="text"
            value={pageInput}
            onChange={handlePageInputChange}
            className="h-8 w-14 text-center text-sm border focus:ring-2 focus:ring-primary/20"
            onBlur={handlePageInputSubmit}
            title="Enter page number"
          />
          <span className="text-sm text-muted-foreground font-medium">/ {numPages}</span>
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

      {/* Center - Zoom Controls */}
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
        </Button>        <Separator orientation="vertical" className="h-6" />

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

      {/* Right side - Search */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search in PDF..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-8 w-44 pl-7 text-sm border focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>
    </div>
  );

  // Note: we set touchAction on the outer container so browser knows vertical pan is allowed when unzoomed
  return (
    <div
      className={cn("h-full w-full flex flex-col", className)}
      style={{
        overflow: 'hidden',
        height: '100%',
        maxHeight: '100%'
      }}
    >
      {/* PDF Viewer Header */}
      <PdfViewerHeader />

      {/* PDF Content */}
      <div
        className="flex-1 w-full flex flex-row"
        style={{
          overflow: 'hidden',
          flex: 1,
          minHeight: 0 // This is crucial for flex children with overflow
        }}
      >
        <div
          className="flex-1"
          style={{
            overflow: 'hidden',
            position: 'relative',
            height: '100%'
          }}
        >
          <ScrollArea
            className="h-full w-full"
            ref={containerRef}
            style={{
              height: '100%',
              width: '100%',
              // allow vertical scrolling by default when unzoomed; block when zoomed
              touchAction: zoomScale === 1 ? "pan-y" : "none",
              WebkitUserSelect: "none",
              MozUserSelect: "none",
              msUserSelect: "none",
              userSelect: "none",
            }}
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

                // Conditionally disable wheel & panning when scale == 1
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
                        ref={transformRef}
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
                          const currentScale = payload?.state?.scale ?? 1;
                          setZoomScale(currentScale);
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

export const PdfPreview = dynamic(() => import("./invoice-pdf"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 justify-center items-center h-full flex flex-col">
      <Spinner />
    </div>
  ),
});
