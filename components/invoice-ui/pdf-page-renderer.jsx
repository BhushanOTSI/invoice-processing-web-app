"use client";

import { memo } from "react";
import CitationHoverCard from "./citation-hover-card";
import { isSameBbox, calculateBboxStyle } from "./citation-utils";

/**
 * PDFPageRenderer - Renders a single PDF page with citation overlays
 * Memoized to prevent unnecessary re-renders when props haven't changed
 */
const PDFPageRenderer = memo(
  ({
    pageIndex,
    canvasLayer,
    textLayer,
    normalizedCitation,
    pageCitations,
    isPdfLoaded,
    onCitationClick,
  }) => {
    const show =
      normalizedCitation && pageIndex === normalizedCitation.pageIndex;

    let highlightStyle = null;
    if (isPdfLoaded && show) {
      const { left, top, width, height } = calculateBboxStyle(
        normalizedCitation.bbox
      );
      highlightStyle = {
        position: "absolute",
        left: `${left}%`,
        top: `${top}%`,
        width: `${width}%`,
        height: `${height}%`,
        background: "rgba(255, 255, 0, 0.25)",
        border: "2px solid rgba(234, 179, 8, 0.9)",
        borderRadius: "4px",
        pointerEvents: "none",
        boxSizing: "border-box",
        zIndex: 5,
      };
    }

    return (
      <div
        id={`invoice-pdf-page-${pageIndex}`}
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          padding: "16px",
        }}
      >
        {canvasLayer.children}

        {/* All citations overlay */}
        {pageCitations.map((c) => {
          const isActive =
            !!normalizedCitation &&
            c.pageIndex === normalizedCitation.pageIndex &&
            isSameBbox(c.bbox, normalizedCitation.bbox);

          return (
            <CitationHoverCard
              key={c.id}
              citation={c}
              isActive={isActive}
              onCitationClick={onCitationClick}
            />
          );
        })}

        {isPdfLoaded && show && (
          <div id="invoice-citation-highlight" style={highlightStyle} />
        )}
        {textLayer.children}
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison for memo - only compare data props, not render props
    // canvasLayer and textLayer will be new objects on each render from PDF viewer,
    // but we only want to re-render when citation data actually changes
    const citationDataEqual =
      prevProps.pageIndex === nextProps.pageIndex &&
      prevProps.isPdfLoaded === nextProps.isPdfLoaded &&
      prevProps.normalizedCitation?.pageIndex ===
        nextProps.normalizedCitation?.pageIndex &&
      prevProps.normalizedCitation?.bbox?.join(",") ===
        nextProps.normalizedCitation?.bbox?.join(",") &&
      prevProps.pageCitations.length === nextProps.pageCitations.length &&
      prevProps.pageCitations.every(
        (c, i) => c.id === nextProps.pageCitations[i]?.id
      ) &&
      prevProps.onCitationClick === nextProps.onCitationClick;

    // Always allow re-render if citation data changed, even if canvasLayer/textLayer are the same
    // This ensures we update when needed but skip when only PDF viewer internals change
    return citationDataEqual;
  }
);

PDFPageRenderer.displayName = "PDFPageRenderer";

export default PDFPageRenderer;
