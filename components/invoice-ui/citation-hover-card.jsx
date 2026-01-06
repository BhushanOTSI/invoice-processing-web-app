"use client";

import { memo, useEffect, useMemo, useRef, useState } from "react";
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
  ({ citation, isActive, filterPath, onCitationClick }) => {
    const [side, setSide] = useState("top");
    const triggerRef = useRef(null);
    const [isHoveringCard, setIsHoveringCard] = useState(false);
    const hoverCardKey = `${citation.id}-${isActive ? "active" : "passive"}`;

    // Filter citation text when path is provided (right panel hover)
    const displayText = useMemo(() => {
      // Only filter when actively hovered from right panel (isActive) and path is provided
      if (!isActive || !filterPath || !citation._rawData) {
        return citation.text;
      }

      const { kvPairs = [], tables = [] } = citation._rawData;

      const escapeMd = (s) =>
        String(s ?? "")
          .replace(/\|/g, "\\|")
          .replace(/\r?\n/g, "<br/>");

      const toMarkdownTable = (columns, rows) => {
        if (!columns || columns.length === 0) return "";
        const header = `| ${columns.map(escapeMd).join(" | ")} |`;
        const divider = `| ${columns.map(() => "---").join(" | ")} |`;
        const body = rows
          .map(
            (r) =>
              `| ${columns.map((c) => escapeMd(r?.[c] ?? "N/A")).join(" | ")} |`
          )
          .join("\n");
        return `${header}\n${divider}\n${body}`;
      };

      // Extract row index from path (e.g., "lineItems[0]" -> 0, "lineItems[1]" -> 1)
      const pathMatch = filterPath.match(/\[(\d+)\]/);
      const rowIndex = pathMatch ? parseInt(pathMatch[1], 10) : null;

      // Filter kvPairs by exact path match
      const filteredKvPairs = kvPairs.filter((kv) => kv.path === filterPath);
      const kvLines = filteredKvPairs
        .filter((x) => x?.key)
        .map((x) => `**${escapeMd(x.key)}**: ${escapeMd(x.value)}`);

      // Filter tables: find tables that contain the row matching the path
      // Each table entry has title like "Line Items #1" (for row 0), "Line Items #2" (for row 1), etc.
      const filteredTables = tables.filter((t) => {
        if (rowIndex === null) return false;

        // Extract row number from title (e.g., "Line Items #1" -> 1, then subtract 1 to get index 0)
        const titleMatch = t.title?.match(/#(\d+)/);
        if (!titleMatch) return false;

        const titleRowNumber = parseInt(titleMatch[1], 10);
        const titleRowIndex = titleRowNumber - 1; // Convert to 0-based index

        // Match if the row index from path matches the row index from title
        return titleRowIndex === rowIndex;
      });

      const tableBlocks = filteredTables.map((t) => {
        const title = t.title ? `\n\n**${escapeMd(t.title)}**\n\n` : "\n\n";
        return `${title}${toMarkdownTable(t.columns, t.rows)}`;
      });

      const kvBlock = kvLines.length > 0 ? kvLines.join("<br/>") : "";
      const filteredText = [kvBlock, ...tableBlocks]
        .filter(Boolean)
        .join("\n\n");

      // If filtering resulted in empty content, fall back to original text
      // Use filtered text only if it has actual content
      return filteredText.trim().length > 0 ? filteredText : citation.text;
    }, [citation.text, citation._rawData, isActive, filterPath]);

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

            {displayText && (
              <div className="text-muted-foreground">
                <MarkdownWrapper className={"space-y-4"}>
                  {displayText}
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
      prevProps.filterPath === nextProps.filterPath &&
      prevProps.onCitationClick === nextProps.onCitationClick
    );
  }
);

CitationHoverCard.displayName = "CitationHoverCard";

export default CitationHoverCard;
