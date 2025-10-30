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
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ZoomInIcon, ZoomOutIcon, RotateCwIcon, SearchIcon } from "lucide-react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

const InvoicePdf = forwardRef(({ fileUrl, className }, ref) => {
  const containerRef = useRef(null);
  const pdfViewerRef = useRef(null);
  const pinchZoomRef = useRef(null);
  const pageRefsMap = useRef(new Map());
  const scrollTimeoutRef = useRef(null);

  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInputValue, setPageInputValue] = useState('1');
  const [pageWidth, setPageWidth] = useState(600);
  const [rotation, setRotation] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    if (!pdfjs.GlobalWorkerOptions.workerSrc) {
      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url
      ).toString();
    }
  }, []);

  useEffect(() => {
    if (fileUrl) {
      setIsLoading(true);
      setError(null);
      setNumPages(0);
      setCurrentPage(1);
      setPageInputValue('1');
    }
  }, [fileUrl]);

  useEffect(() => {
    const updatePageWidth = () => {
      if (containerRef.current) {
        const width = Math.min(containerRef.current.clientWidth - 80, 800);
        setPageWidth(width);
      }
    };

    updatePageWidth();
    const resizeObserver = new ResizeObserver(updatePageWidth);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    return () => resizeObserver.disconnect();
  }, []);

  const onDocumentLoadSuccess = useCallback(({ numPages: totalPages }) => {
    setNumPages(totalPages);
    setCurrentPage(1);
    setPageInputValue('1');
    setIsLoading(false);
    setError(null);
  }, []);

  const onDocumentLoadError = useCallback((error) => {
    setIsLoading(false);
    setError("Failed to load PDF document");
    setNumPages(0);
  }, []);

  const handleZoomIn = useCallback(() => {
    if (pinchZoomRef.current) {
      pinchZoomRef.current.zoomIn(0.25);
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    if (pinchZoomRef.current) {
      pinchZoomRef.current.zoomOut(0.25);
    }
  }, []);

  const handleRotate = useCallback(() => {
    setRotation(prev => (prev + 90) % 360);
  }, []);

  const goToPage = useCallback((pageNumber) => {
    const pageElement = pageRefsMap.current.get(pageNumber);
    if (pageElement && pdfViewerRef.current) {
      pdfViewerRef.current.scrollTop = pageElement.offsetTop - 20;
      setCurrentPage(pageNumber);
    }
  }, []);

  const handlePageInputChange = useCallback((e) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      setPageInputValue(value);
    }
  }, []);

  const handlePageInputKeyDown = useCallback((e) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      return;
    }

    const allowedKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'Backspace', 'Delete', 'Enter', 'Tab', 'ArrowLeft', 'ArrowRight'];

    if (!allowedKeys.includes(e.key)) {
      e.preventDefault();
      return;
    }

    if (e.key === 'Enter') {
      const page = parseInt(pageInputValue);
      if (page >= 1 && page <= numPages) {
        goToPage(page);
      } else {
        setPageInputValue(currentPage.toString());
      }
    }
  }, [pageInputValue, numPages, goToPage, currentPage]);

  const handlePageInputBlur = useCallback((e) => {
    const page = parseInt(pageInputValue);
    if (page >= 1 && page <= numPages) {
      goToPage(page);
    } else {
      setPageInputValue(currentPage.toString());
    }
  }, [numPages, goToPage, currentPage]);

  const registerPageRef = useCallback((pageNumber) => (node) => {
    if (node) {
      pageRefsMap.current.set(pageNumber, node);
    }
  }, []);

  useEffect(() => {
    if (!pdfViewerRef.current || numPages === 0) return;

    const handleScroll = () => {
      if (scrollTimeoutRef.current) return;

      scrollTimeoutRef.current = requestAnimationFrame(() => {
        if (!pdfViewerRef.current) return;

        const scrollTop = pdfViewerRef.current.scrollTop + 100;
        let foundPage = 1;

        for (let i = 1; i <= numPages; i++) {
          const pageElement = pageRefsMap.current.get(i);
          if (pageElement && pageElement.offsetTop <= scrollTop) {
            foundPage = i;
          } else {
            break;
          }
        }

        setCurrentPage(foundPage);
        setPageInputValue(foundPage.toString());
        scrollTimeoutRef.current = null;
      });
    };

    const viewer = pdfViewerRef.current;
    viewer.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      viewer?.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        cancelAnimationFrame(scrollTimeoutRef.current);
      }
    };
  }, [numPages]);

  return (
    <div className={cn("h-full w-full flex flex-col", className)}>
      {/* PDF Controls Toolbar */}
      <div className="flex items-center justify-between p-3 border-b bg-background/95 backdrop-blur flex-shrink-0">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomOut}
            title="Zoom Out"
          >
            <ZoomOutIcon className="h-4 w-4" />
          </Button>
          <span
            data-zoom-display
            className="text-sm font-medium min-w-[60px] text-center"
          >
            {Math.round(zoomLevel * 100)}%
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomIn}
            title="Zoom In"
          >
            <ZoomInIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRotate}
            title="Rotate 90°"
          >
            <RotateCwIcon className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={pageInputValue}
            onChange={handlePageInputChange}
            onKeyDown={handlePageInputKeyDown}
            onBlur={handlePageInputBlur}
            className="w-16 h-8 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            placeholder="1"
            title={`Enter page number (1-${numPages})`}
            autoComplete="off"
            spellCheck="false"
          />
          <span className="text-sm text-muted-foreground">
            of {numPages}
          </span>
        </div>
      </div>

      {/* PDF Viewer */}
      <div
        ref={containerRef}
        className="flex-1 relative overflow-hidden"
      >
        {/* Loading State */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
            <div className="flex flex-col items-center gap-3">
              <Spinner className="h-8 w-8" />
              <p className="text-sm text-muted-foreground">Loading PDF...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-red-900">Failed to load PDF</p>
                <p className="text-xs text-red-600 mt-1">The PDF document could not be loaded</p>
              </div>
            </div>
          </div>
        )}

        {/* PDF Content with Individual Page Zoom */}
        <div
          ref={pdfViewerRef}
          className="h-full overflow-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
          style={{
            opacity: isLoading || error ? 0.3 : 1,
            transition: 'opacity 0.2s ease',
            touchAction: 'pan-y' // Allow vertical scrolling
          }}
        >
          <div className="flex flex-col items-center py-4 px-4 w-full">
            <Document
              file={fileUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={null}
              error={null}
            >
              <div className="w-full flex flex-col items-center gap-4">
                {Array.from({ length: numPages }, (_, index) => {
                  const pageNumber = index + 1;
                  return (
                    <div
                      key={`page-container-${pageNumber}`}
                      className="relative w-fit"
                      style={{
                        touchAction: 'none',
                        userSelect: 'none'
                      }}
                    >
                      <TransformWrapper
                        ref={pageNumber === 1 ? pinchZoomRef : null}
                        minScale={0.5}
                        maxScale={3}
                        initialScale={1}
                        wheel={{
                          step: 0.1,
                          wheelDisabled: false,
                          touchPadDisabled: false,
                        }}
                        pinch={{
                          step: 5,
                          disabled: false
                        }}
                        pan={{
                          disabled: false,
                          lockAxisX: false,
                          lockAxisY: false,
                          velocityDisabled: false
                        }}
                        doubleClick={{
                          step: 0.7,
                          disabled: false,
                          mode: "toggle"
                        }}
                        limitToBounds={false}
                        centerOnInit={false}
                        centerZoomedOut={false}
                        alignmentAnimation={{ disabled: true }}
                        velocityAnimation={{ disabled: true }}
                        smooth={false}
                        onTransformed={(ref, state) => {
                          if (pageNumber === 1) {
                            setZoomLevel(state.scale);
                            const zoomDisplay = document.querySelector('[data-zoom-display]');
                            if (zoomDisplay) {
                              zoomDisplay.textContent = `${Math.round(state.scale * 100)}%`;
                            }
                          }
                        }}
                        onPinchingStart={(ref, event) => {
                          console.log('Pinch start detected, touches:', event.touches?.length);
                          // Only allow pinch with exactly 2 fingers
                          if (event.touches && event.touches.length === 2) {
                            return true;
                          }
                          return false;
                        }}
                        onDoubleClick={(ref, event) => {
                          console.log('Double click detected on page:', pageNumber);
                          return true;
                        }}
                        onInit={(ref) => {
                          console.log(`TransformWrapper initialized for page ${pageNumber}`, ref);
                        }}
                        wrapperStyle={{
                          width: 'fit-content',
                          height: 'auto',
                        }}
                        contentStyle={{
                          width: 'fit-content',
                          height: 'auto',
                        }}
                      >
                        <TransformComponent
                          wrapperStyle={{
                            width: 'fit-content',
                            height: 'auto',
                          }}
                          contentStyle={{
                            width: 'fit-content',
                            height: 'auto',
                          }}
                        >
                          <div
                            ref={registerPageRef(pageNumber)}
                            data-page={pageNumber}
                            className="shadow-md rounded-sm border bg-white"
                          >
                            <Page
                              pageNumber={pageNumber}
                              width={pageWidth}
                              renderAnnotationLayer={false}
                              renderTextLayer={false}
                              rotate={rotation}
                              loading={
                                <div className="flex justify-center items-center h-40 bg-gray-50 border rounded">
                                  <div className="animate-pulse bg-gray-200 h-32 w-full rounded"></div>
                                </div>
                              }
                            />
                          </div>
                        </TransformComponent>
                      </TransformWrapper>
                    </div>
                  );
                })}
              </div>
            </Document>
          </div>
        </div>
      </div>
    </div>
  );
});

InvoicePdf.displayName = "InvoicePdf";

export default memo(InvoicePdf);