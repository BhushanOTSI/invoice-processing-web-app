"use client";

import { memo, useEffect, useRef, useState } from "react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card";
import { MarkdownWrapper } from "./markdown";
import { calculateBboxStyle } from "./citation-utils";

/**
 * CitationHoverCard - A hover card component for displaying citation information
 * Optimized with memo to prevent unnecessary re-renders
 */
const CitationHoverCard = memo(
  ({ citation, isActive, onCitationClick }) => {
    const [side, setSide] = useState("top");
    const triggerRef = useRef(null);
    const [isHoveringCard, setIsHoveringCard] = useState(false);
    const hoverCardKey = `${citation.id}-${isActive ? "active" : "passive"}`;

    useEffect(() => {
      const updateSide = () => {
        if (!triggerRef.current) return;
        const rect = triggerRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;

        // Check available space
        const spaceAbove = rect.top;
        const spaceBelow = viewportHeight - rect.bottom;
        const spaceRight = viewportWidth - rect.right;
        const spaceLeft = rect.left;

        // For value-hover on right panel: only top/bottom based on available space
        if (isActive) {
          const estimatedCardHeight = 320; // safer height for vertical fit
          if (spaceAbove >= estimatedCardHeight) {
            setSide("top");
            return;
          }
          if (spaceBelow >= estimatedCardHeight) {
            setSide("bottom");
            return;
          }
          // If tight, pick the side with more vertical room
          setSide(spaceAbove >= spaceBelow ? "top" : "bottom");
          return;
        }

        // Normal hover on PDF overlays: allow all sides with minimum space guard
        const minSpace = 400; // approx card height
        if (spaceAbove >= minSpace) {
          setSide("top");
        } else if (spaceBelow >= minSpace) {
          setSide("bottom");
        } else if (spaceRight >= 300) {
          setSide("right");
        } else if (spaceLeft >= 300) {
          setSide("left");
        } else {
          // fallback to the side with more room vertically
          setSide(spaceBelow > spaceAbove ? "bottom" : "top");
        }
      };

      updateSide();

      // Update on scroll and resize
      window.addEventListener("scroll", updateSide, true);
      window.addEventListener("resize", updateSide);

      return () => {
        window.removeEventListener("scroll", updateSide, true);
        window.removeEventListener("resize", updateSide);
      };
    }, [isActive]);

    const { left, top, width, height } = calculateBboxStyle(citation.bbox);

    const boxStyle = {
      position: "absolute",
      left: `${left}%`,
      top: `${top}%`,
      width: `${width}%`,
      height: `${height}%`,
      background: "rgba(255, 255, 0, 0.12)",
      border: "1px solid rgba(234, 179, 8, 0.55)",
      borderRadius: "4px",
      boxSizing: "border-box",
      zIndex: 3,
      cursor: "pointer",
    };

    return (
      <HoverCard
        key={hoverCardKey}
        {...(isActive
          ? { open: true, openDelay: 0, closeDelay: 0 }
          : { openDelay: 120, closeDelay: 60 })}
      >
        <HoverCardTrigger asChild>
          <div
            ref={triggerRef}
            style={boxStyle}
            data-citation-overlay="true"
            onClick={(e) => {
              e.stopPropagation();
              onCitationClick?.(citation);
            }}
            aria-label={citation.title || "Citation"}
          />
        </HoverCardTrigger>
        <HoverCardContent
          side={side}
          align="start"
          sideOffset={isActive ? 24 : 8}
          collisionPadding={isActive ? 24 : 16}
          avoidCollisions={isActive ? false : true}
          className={`w-auto max-w-160 p-4 text-xs leading-5 **:text-xs rounded-lg bg-popover/95 text-popover-foreground dark:bg-popover/90 border border-border shadow-2xl ring-1 ring-black/10 dark:ring-white/10 backdrop-blur-md max-h-[min(24rem,calc(100vh-4rem))] overflow-auto ${
            isActive && !isHoveringCard ? "pointer-events-none" : ""
          }`}
          onPointerEnter={() => {
            // Allow pointer events when user intentionally hovers over the card
            setIsHoveringCard(true);
          }}
          onPointerLeave={() => {
            // Disable pointer events when leaving to avoid blocking interactions
            setIsHoveringCard(false);
          }}
        >
          <div className="space-y-3">
            {citation.title && (
              <div className="flex items-start justify-between gap-3">
                <div className="text-sm font-semibold leading-5 text-foreground">
                  {citation.title}
                </div>
                <div className="shrink-0 rounded-full border border-yellow-500/25 bg-yellow-500/15 px-2 py-0.5 text-[10px] font-medium text-yellow-800 dark:text-yellow-200">
                  Citation
                </div>
              </div>
            )}

            {citation.text && (
              <div className="text-muted-foreground">
                <MarkdownWrapper className={"space-y-4"}>
                  {citation.text}
                </MarkdownWrapper>
              </div>
            )}
          </div>
        </HoverCardContent>
      </HoverCard>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison function for memo
    return (
      prevProps.citation.id === nextProps.citation.id &&
      prevProps.isActive === nextProps.isActive &&
      prevProps.onCitationClick === nextProps.onCitationClick
    );
  }
);

CitationHoverCard.displayName = "CitationHoverCard";

export default CitationHoverCard;
