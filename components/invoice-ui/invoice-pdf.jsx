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


const InvoicePdf = forwardRef(({ fileUrl, className }, ref) => {
  const containerRef = useRef(null);
  const pdfViewerRef = useRef(null);
  const scaleRef = useRef(1);
  const pageRefsMap = useRef(new Map());
  const scrollTimeoutRef = useRef(null);
  const isDraggingRef = useRef(false);
  const lastMousePositionRef = useRef({ x: 0, y: 0 });

  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInputValue, setPageInputValue] = useState('1');
  const [pageWidth, setPageWidth] = useState(600);
  const [rotation, setRotation] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!pdfjs.GlobalWorkerOptions.workerSrc) {
      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url
      ).toString();
    }
  }, []);

  // Reset loading state when fileUrl changes
  useEffect(() => {
    if (fileUrl) {
      setIsLoading(true);
      setError(null);
      setNumPages(0);
      setCurrentPage(1);
      setPageInputValue('1');
    }
  }, [fileUrl]);

  // Fast resize handler
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

  // Document load success - no re-renders
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

  // Instant zoom functions - target the content wrapper, not scroll container
  const handleZoomIn = useCallback(() => {
    scaleRef.current = Math.min(scaleRef.current + 0.25, 3);
    const contentWrapper = pdfViewerRef.current?.querySelector('[data-pdf-content]');
    if (contentWrapper) {
      contentWrapper.style.transform = `scale(${scaleRef.current})`;
    }
    // Update cursor based on zoom level
    if (pdfViewerRef.current) {
      pdfViewerRef.current.style.cursor = scaleRef.current > 1 ? 'grab' : 'default';
    }
    // Update UI only
    const zoomDisplay = document.querySelector('[data-zoom-display]');
    if (zoomDisplay) {
      zoomDisplay.textContent = `${Math.round(scaleRef.current * 100)}%`;
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    scaleRef.current = Math.max(scaleRef.current - 0.25, 0.5);
    const contentWrapper = pdfViewerRef.current?.querySelector('[data-pdf-content]');
    if (contentWrapper) {
      contentWrapper.style.transform = `scale(${scaleRef.current})`;
    }
    // Update cursor based on zoom level
    if (pdfViewerRef.current) {
      pdfViewerRef.current.style.cursor = scaleRef.current > 1 ? 'grab' : 'default';
    }
    // Update UI only
    const zoomDisplay = document.querySelector('[data-zoom-display]');
    if (zoomDisplay) {
      zoomDisplay.textContent = `${Math.round(scaleRef.current * 100)}%`;
    }
  }, []);

  const handleRotate = useCallback(() => {
    setRotation(prev => (prev + 90) % 360);
  }, []);

  // Fast page navigation
  const goToPage = useCallback((pageNumber) => {
    const pageElement = pageRefsMap.current.get(pageNumber);
    if (pageElement && pdfViewerRef.current) {
      pdfViewerRef.current.scrollTop = pageElement.offsetTop - 20;
      setCurrentPage(pageNumber);
    }
  }, []);

  const handlePageInputChange = useCallback((e) => {
    const value = e.target.value;

    // Allow only numbers and empty string
    if (value === '' || /^\d+$/.test(value)) {
      setPageInputValue(value);
    }
  }, []);

  const handlePageInputKeyDown = useCallback((e) => {
    // Prevent up/down arrow keys
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      return;
    }

    // Allow only numbers, backspace, delete, enter, tab
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
        // Reset to current page if invalid
        setPageInputValue(currentPage.toString());
      }
    }
  }, [pageInputValue, numPages, goToPage, currentPage]);

  const handlePageInputBlur = useCallback((e) => {
    const page = parseInt(pageInputValue);
    if (page >= 1 && page <= numPages) {
      goToPage(page);
    } else {
      // Reset to current page if invalid
      setPageInputValue(currentPage.toString());
    }
  }, [numPages, goToPage, currentPage]);

  // Fast page ref registration
  const registerPageRef = useCallback((pageNumber) => (node) => {
    if (node) {
      pageRefsMap.current.set(pageNumber, node);
    }
  }, []);

  // Throttled scroll handler for better performance
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

  // Fast mouse wheel zoom
  useEffect(() => {
    if (!containerRef.current) return;

    const handleWheel = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        if (e.deltaY < 0) {
          handleZoomIn();
        } else {
          handleZoomOut();
        }
      }
    };

    const container = containerRef.current;
    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => container?.removeEventListener('wheel', handleWheel);
  }, [handleZoomIn, handleZoomOut]);

  // Mouse dragging when zoomed
  useEffect(() => {
    if (!pdfViewerRef.current) return;

    const handleMouseDown = (e) => {
      if (scaleRef.current > 1) {
        isDraggingRef.current = true;
        lastMousePositionRef.current = { x: e.clientX, y: e.clientY };
        pdfViewerRef.current.style.cursor = 'grabbing';
        e.preventDefault();
      }
    };

    const handleMouseMove = (e) => {
      if (!isDraggingRef.current || scaleRef.current <= 1) return;

      e.preventDefault();
      const deltaX = e.clientX - lastMousePositionRef.current.x;
      const deltaY = e.clientY - lastMousePositionRef.current.y;

      pdfViewerRef.current.scrollLeft -= deltaX;
      pdfViewerRef.current.scrollTop -= deltaY;

      lastMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      if (pdfViewerRef.current) {
        pdfViewerRef.current.style.cursor = scaleRef.current > 1 ? 'grab' : 'default';
      }
    };

    const viewer = pdfViewerRef.current;
    viewer.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      viewer?.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []); return (
    <div className={cn("h-full w-full flex flex-col", className)}
    >
      {/* PDF Controls Toolbar */}
      <div className="flex items-center justify-between p-3 border-b bg-background/95 backdrop-blur flex-shrink-0">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomOut}
            title="Zoom Out (Ctrl + Mouse Wheel)"
          >
            <ZoomOutIcon className="h-4 w-4" />
          </Button>
          <span
            data-zoom-display
            className="text-sm font-medium min-w-[60px] text-center"
          >
            100%
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomIn}
            title="Zoom In (Ctrl + Mouse Wheel)"
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
          <SearchIcon className="h-4 w-4 text-muted-foreground" />
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

        <div
          ref={pdfViewerRef}
          className="h-full overflow-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
          style={{
            opacity: isLoading || error ? 0.3 : 1,
            transition: 'opacity 0.2s ease'
          }}
        >
          <div
            data-pdf-content
            className="flex flex-col items-center py-4 px-4"
            style={{
              minHeight: '100%',
              transformOrigin: 'top center',
              willChange: 'transform',
              backfaceVisibility: 'hidden'
            }}
          >
            <Document
              file={fileUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={null}
              error={null}
            >
              {Array.from({ length: numPages }, (_, index) => {
                const pageNumber = index + 1;
                return (
                  <div
                    key={`page-${pageNumber}`}
                    ref={registerPageRef(pageNumber)}
                    data-page={pageNumber}
                    className="mb-4 shadow-md rounded-sm border bg-white"
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
                );
              })}
            </Document>
          </div>
        </div>
      </div>
    </div>
  );
});

InvoicePdf.displayName = "InvoicePdf";

export default memo(InvoicePdf);
