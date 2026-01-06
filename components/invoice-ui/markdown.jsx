"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";
import { visit } from "unist-util-visit";
import { cn } from "@/lib/utils";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../ui/table";
import { Blockquote } from "../ui/blockquote";
import "highlight.js/styles/github-dark.css";

const MarkdownHeading = ({ level, children }) => {
  const sizes = [
    "text-base",
    "text-base",
    "text-sm",
    "text-xs",
    "text-xs",
    "text-xs",
  ];

  const margins = [
    "mb-2 mt-3",
    "mb-2 mt-3",
    "mb-1.5 mt-2",
    "mb-1.5 mt-2",
    "mb-1 mt-2",
    "mb-1 mt-1.5",
  ];

  return React.createElement(
    `h${level}`,
    {
      className: `${sizes[level - 1]} font-medium leading-snug ${
        margins[level - 1]
      }`,
    },
    children
  );
};

const KeyValuePair = ({ keyName, children, dataPath }) => {
  return (
    <div
      className="flex items-center gap-3 mb-2"
      data-field-path={dataPath}
      data-path={dataPath}
    >
      <div className="font-semibold text-xs text-muted-foreground min-w-36 max-w-36 shrink-0">
        {keyName}:
      </div>
      <div className="flex-1 relative py-2.5 px-3 bg-muted/40 border border-border rounded-md hover:bg-muted/50 transition-colors group text-sm text-foreground [&_.confidence-badge]:absolute [&_.confidence-badge]:top-3 [&_.confidence-badge]:right-2 [&>br]:first:hidden has-[.confidence-badge]:pr-14 wrap-break-words">
        {children}
      </div>
    </div>
  );
};

const Section = ({ title, children, dataPath }) => {
  return (
    <div
      className="mb-6 pb-4 border-b border-border/40 last:border-b-0"
      data-section-path={dataPath}
    >
      <div className="text-sm font-semibold text-foreground mb-3 px-1">
        {title}
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  );
};

const ListContainer = ({ children }) => {
  return <div className="space-y-2 mb-4">{children}</div>;
};

const ListItem = ({ children }) => {
  return (
    <div className="flex items-start gap-2 py-1.5 px-3 bg-muted/30 border border-border/50 rounded text-sm text-foreground">
      <span className="text-muted-foreground mt-0.5">•</span>
      <div className="flex-1">{children}</div>
    </div>
  );
};

const EmptyValue = ({ children }) => {
  return (
    <div className="py-1.5 px-3 bg-muted/20 border border-dashed border-border rounded text-sm text-muted-foreground italic">
      {children}
    </div>
  );
};

const SimpleValue = ({ children }) => {
  return <div className="py-1.5 px-3 text-sm text-foreground">{children}</div>;
};

export const HtmlComponents = {
  h1: (props) => <MarkdownHeading level={1} {...props} />,
  h2: (props) => <MarkdownHeading level={2} {...props} />,
  h3: (props) => <MarkdownHeading level={3} {...props} />,
  h4: (props) => <MarkdownHeading level={4} {...props} />,
  h5: (props) => <MarkdownHeading level={5} {...props} />,
  h6: (props) => <MarkdownHeading level={6} {...props} />,
  p: ({ node, ...props }) => (
    <p className="text-sm leading-6 text-foreground" {...props} />
  ),

  strong: ({ node, ...props }) => (
    <strong className="text-foreground font-semibold" {...props} />
  ),

  em: ({ node, ...props }) => (
    <em className="italic text-foreground font-semibold" {...props} />
  ),

  a: ({ node, ...props }) => (
    <a
      className="text-primary underline hover:no-underline"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    />
  ),

  ul: ({ node, ...props }) => (
    <ul className="[&_ul]:pl-6 mb-3 space-y-1.5" {...props} />
  ),
  ol: ({ node, ...props }) => (
    <ol className="list-decimal pl-6 mb-3 space-y-1.5" {...props} />
  ),
  li: ({ node, ...props }) => (
    <li className="text-sm leading-7 text-foreground ml-1" {...props} />
  ),

  blockquote: ({ node, ...props }) => <Blockquote {...props} />,

  pre: ({ node, ...props }) => (
    <pre
      className="bg-muted border border-border rounded-lg p-3 overflow-x-auto mb-2 text-xs"
      {...props}
    />
  ),

  code: ({ node, inline, className, children, ...props }) =>
    inline ? (
      <code
        className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono text-foreground"
        {...props}
      >
        {children}
      </code>
    ) : (
      <code className={className} {...props}>
        {children}
      </code>
    ),

  table: ({ node, ...props }) => (
    <div className="overflow-x-auto rounded-lg border border-border shadow-sm bg-card">
      <Table {...props} containerClassName={"max-h-96"} />
    </div>
  ),
  thead: ({ node, ...props }) => (
    <TableHeader className="bg-muted/60 border-b-2 border-border" {...props} />
  ),
  tbody: ({ node, ...props }) => <TableBody {...props} />,
  tr: ({ node, ...props }) => (
    <TableRow
      className="hover:bg-muted/30 transition-colors border-b border-border last:border-b-0"
      {...props}
    />
  ),
  th: ({ node, ...props }) => (
    <TableHead
      className="font-semibold text-xs py-4 px-4 text-left "
      {...props}
    />
  ),

  td: ({ node, ...props }) => (
    <TableCell className="text-sm py-4 px-4 align-middle " {...props} />
  ),

  hr: ({ node, ...props }) => <hr className="border-border my-4" {...props} />,
  img: ({ node, ...props }) => (
    <img
      className="rounded-lg border border-border max-w-full h-auto"
      {...props}
    />
  ),
};

export function Markdown({ children, className, onCitationChange }) {
  React.useEffect(() => {
    const styleId = "table-confidence-styles";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        /* Hide confidence badges in table cells by default */
        td .confidence-badge {
          opacity: 0;
          transform: translateX(-4px);
          transition: opacity 0.2s ease, transform 0.2s ease;
        }
        
        /* Show confidence badges on table row hover */
        tr:hover td .confidence-badge {
          opacity: 1;
          transform: translateX(0);
        }
        
        /* Always use ml-auto for key-value pairs */
        .kv-pair-wrapper .confidence-badge {
          margin-left: auto !important;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  const lastCitationKeyRef = React.useRef(null);
  const activeCitationElRef = React.useRef(null);
  // No hover/clear delay (instant highlight + instant clear)

  // Tailwind-only active styling (no custom CSS)
  const CITATION_ACTIVE_CLASSES = React.useMemo(
    () =>
      [
        "citation-active",
        // Layout-neutral styling to avoid table scroll resetting (no border/padding/margins)
        "bg-yellow-300/30",
        "dark:bg-yellow-300/20",
        "ring-1",
        "ring-inset",
        "ring-yellow-500/50",
        "dark:ring-yellow-400/40",
        "shadow-[0_0_0_1px_rgba(0,0,0,0.02)]",
        "transition-colors",
        "duration-200",
        "ease-out",
        "motion-reduce:transition-none",
      ].join(" "),
    []
  );

  const setActiveCitationEl = React.useCallback(
    (el) => {
      if (activeCitationElRef.current && activeCitationElRef.current !== el) {
        activeCitationElRef.current.classList.remove(
          ...CITATION_ACTIVE_CLASSES.split(" ")
        );
      }
      activeCitationElRef.current = el;
      if (el) el.classList.add(...CITATION_ACTIVE_CLASSES.split(" "));
    },
    [CITATION_ACTIVE_CLASSES]
  );

  const emitCitation = React.useCallback((citationEl) => {
    const encoded = citationEl?.dataset?.citation;
    if (!encoded) return null;
    try {
      const decoded = decodeURIComponent(encoded);
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  }, []);

  const handlePointerOver = React.useCallback(
    (e) => {
      const target = e.target;
      const citationEl =
        target?.closest?.(".citation-value") ||
        (target?.classList?.contains?.("citation-value") ? target : null);

      if (!citationEl) return;

      const citation = emitCitation(citationEl);
      const key = citationEl.dataset.citation || null;
      if (!citation || !key) return;

      // Extract path from DOM to identify specific value/row being hovered
      let path = null;
      
      // First, try to find the most specific path (kv-pair-wrapper has the exact field path)
      const kvPairWrapper = citationEl.closest?.(".kv-pair-wrapper[data-path]");
      if (kvPairWrapper?.dataset?.path) {
        path = kvPairWrapper.dataset.path;
      } else {
        // Fallback to section-wrapper or any element with data-path
        const pathWrapper = citationEl.closest?.("[data-path], [data-section-path]");
        if (pathWrapper) {
          path = pathWrapper.dataset.path || pathWrapper.dataset.sectionPath;
        }
      }
      
      // For table cells, find the row index
      if (path) {
        const table = citationEl.closest?.("table");
        if (table) {
          // Find all rows in the table (including header)
          const allRows = Array.from(table.querySelectorAll("tr"));
          const thead = table.querySelector("thead");
          const tbody = table.querySelector("tbody");
          
          // Determine if there's a header row
          const hasHeader = !!thead;
          const dataRows = tbody ? Array.from(tbody.querySelectorAll("tr")) : allRows.slice(hasHeader ? 1 : 0);
          
          // Find which data row contains the citation element
          const rowIndex = dataRows.findIndex((row) => row.contains(citationEl));
          
          if (rowIndex >= 0) {
            // Use the row index directly (0-based)
            path = `${path}[${rowIndex}]`;
          }
        }
      }

      if (key === lastCitationKeyRef.current) {
        setActiveCitationEl(citationEl);
        return;
      }

      lastCitationKeyRef.current = key;
      setActiveCitationEl(citationEl);
      // Pass citation with path to filter content when showing hover card
      if (typeof onCitationChange === "function") {
        onCitationChange(path ? { ...citation, path } : citation);
      }
    },
    [emitCitation, onCitationChange, setActiveCitationEl]
  );

  const handlePointerOut = React.useCallback(
    (e) => {
      const target = e.target;
      const fromCitationEl =
        target?.closest?.(".citation-value") ||
        (target?.classList?.contains?.("citation-value") ? target : null);
      if (!fromCitationEl) return;

      const related = e.relatedTarget;
      const toCitationEl =
        related?.closest?.(".citation-value") ||
        (related?.classList?.contains?.("citation-value") ? related : null);

      // Still within same citation (moving between nested nodes)
      if (toCitationEl && toCitationEl === fromCitationEl) return;

      // Reset visual state immediately
      setActiveCitationEl(null);
      lastCitationKeyRef.current = null;
      if (typeof onCitationChange === "function") onCitationChange(null);
    },
    [onCitationChange, setActiveCitationEl]
  );

  const rehypeCustomProcessor = React.useMemo(() => {
    return () => (tree) => {
      visit(tree, "text", (node, index, parent) => {
        if (!node.value || !node.value.includes("{{conf~")) return;

        const parts = [];
        const regex = /\{\{conf~([\d.]+)\}\}/g;
        let lastIndex = 0;
        let match;

        while ((match = regex.exec(node.value)) !== null) {
          if (match.index > lastIndex) {
            parts.push({
              type: "text",
              value: node.value.slice(lastIndex, match.index),
            });
          }

          const score = parseFloat(match[1]);
          let badgeColor =
            "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-800";

          if (score < 0.5) {
            badgeColor =
              "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800";
          } else if (score < 0.8) {
            badgeColor =
              "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800";
          }

          parts.push({
            type: "element",
            tagName: "span",
            properties: {
              className: [
                "confidence-badge",
                // Ensure badge doesn't inherit citation underline/interactive affordances
                "no-underline",
                "decoration-transparent",
                "cursor-default",
                "select-none",
                "inline-flex",
                "items-center",
                "text-[9px]",
                "leading-none",
                "font-semibold",
                "border",
                ...badgeColor.split(" "),
                "rounded-full",
                "px-2",
                "py-0.5",
                "ml-2",
                "whitespace-nowrap",
                "shadow-sm",
                "transition-all",
                "duration-200",
                "hover:scale-105",
                "hover:shadow-md",
                "shrink-0",
              ],
              title: `Confidence Score: ${(score * 100).toFixed(0)}%`,
            },
            children: [{ type: "text", value: `${(score * 100).toFixed(0)}%` }],
          });

          lastIndex = match.index + match[0].length;
        }

        if (lastIndex < node.value.length) {
          parts.push({
            type: "text",
            value: node.value.slice(lastIndex),
          });
        }

        if (parts.length > 1 && parent && typeof index === "number") {
          parent.children.splice(index, 1, ...parts);
          return index + parts.length;
        }
      });

      visit(tree, "element", (node, index, parent) => {
        if (
          node.tagName !== "p" ||
          !node.children ||
          node.children.length === 0
        )
          return;

        const firstChild = node.children[0];

        // Pattern 3: Plain Key: Value (no bold, starts with capital)
        if (firstChild && firstChild.type === "text") {
          const textMatch = firstChild.value.match(
            /^([A-Z][A-Za-z\s]{2,50}):\s*(.+)$/
          );
          if (textMatch) {
            const [, key, valueStart] = textMatch;

            // Skip if key has special characters
            if (/[()=<>[\]{}]/.test(key)) return;

            // Skip common descriptive phrases that aren't key-value pairs
            if (
              key.toLowerCase().includes("found") ||
              key.toLowerCase().includes("allocated") ||
              key.toLowerCase().includes("candidate items") ||
              key.toLowerCase().includes("checking for") ||
              key.toLowerCase() === "description"
            )
              return;

            // Create value nodes (remaining text + rest of paragraph)
            const valueNodes = [
              { type: "text", value: valueStart },
              ...node.children.slice(1),
            ];

            const kvWrapper = {
              type: "element",
              tagName: "div",
              properties: {
                className: ["kv-pair-wrapper"],
                "data-key": key.trim(),
              },
              children: valueNodes,
            };

            if (parent && typeof index === "number") {
              parent.children[index] = kvWrapper;
              return;
            }
          }
        }

        // Pattern 1: **Key:** Value (colon inside bold)
        if (
          firstChild &&
          firstChild.type === "element" &&
          firstChild.tagName === "strong"
        ) {
          const strongText = firstChild.children?.[0]?.value;
          if (strongText && strongText.endsWith(":")) {
            const key = strongText.slice(0, -1).trim();

            // Skip if key has special characters (likely not a simple KV pair)
            if (/[()=<>[\]{}]/.test(key)) return;

            // Skip Description as it's usually a section header
            if (key.toLowerCase() === "description") return;

            // Get the value (everything after the strong element)
            let valueNodes = node.children.slice(1);

            // Skip leading whitespace text node
            if (
              valueNodes[0] &&
              valueNodes[0].type === "text" &&
              valueNodes[0].value.trim() === ""
            ) {
              valueNodes = valueNodes.slice(1);
            }

            if (valueNodes.length > 0) {
              // Create key-value wrapper
              const kvWrapper = {
                type: "element",
                tagName: "div",
                properties: {
                  className: ["kv-pair-wrapper"],
                  "data-key": key,
                },
                children: valueNodes,
              };

              // Replace paragraph with wrapper
              if (parent && typeof index === "number") {
                parent.children[index] = kvWrapper;
              }
            }
          }
        }

        // Pattern 2: **Key**: Value (colon outside bold)
        if (
          firstChild &&
          firstChild.type === "element" &&
          firstChild.tagName === "strong" &&
          node.children[1] &&
          node.children[1].type === "text"
        ) {
          const strongText = firstChild.children?.[0]?.value;
          const colonText = node.children[1].value;

          if (strongText && colonText && colonText.trim().startsWith(":")) {
            const key = strongText.trim();

            // Skip if key has special characters
            if (/[()=<>[\]{}]/.test(key)) return;

            // Skip Description
            if (key.toLowerCase() === "description") return;

            // The value might be in the same text node as the colon (": value")
            // or in subsequent nodes
            let valueNodes = [];

            // Extract value from the colon text node
            const valueInColonNode = colonText.replace(/^:\s*/, "").trim();
            if (valueInColonNode) {
              // Value is in the same node as colon - create new text node with just the value
              valueNodes.push({
                type: "text",
                value: valueInColonNode,
              });
            }

            // Add any remaining children nodes
            if (node.children.length > 2) {
              valueNodes.push(...node.children.slice(2));
            }

            if (valueNodes.length > 0) {
              const kvWrapper = {
                type: "element",
                tagName: "div",
                properties: {
                  className: ["kv-pair-wrapper"],
                  "data-key": key,
                },
                children: valueNodes,
              };

              if (parent && typeof index === "number") {
                parent.children[index] = kvWrapper;
              }
            }
          }
        }
      });
    };
  }, []);

  // Minimal preprocessing - normalize line breaks and convert <br> to paragraph breaks
  const processedContent = React.useMemo(() => {
    if (typeof children !== "string") return children;

    return (
      children
        // Convert <br> tags to paragraph breaks (double newline)
        // This makes each line a separate paragraph for better pattern detection
        .replace(/<br\s*\/?>/gi, "\n\n")
        // Normalize line breaks
        .replace(/\\n/g, "\n")
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        // Clean up excessive newlines (3+ becomes 2)
        .replace(/\n{3,}/g, "\n\n")
    );
  }, [children]);

  return (
    <div
      className={cn("prose prose-sm dark:prose-invert max-w-none", className)}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      <MarkdownWrapper
        rehypePlugins={[rehypeCustomProcessor]}
        components={{
          div: ({
            node,
            className,
            "data-key": dataKey,
            "data-path": dataPath,
            "data-title": dataTitle,
            ...props
          }) => {
            if (className === "kv-pair-wrapper") {
              return (
                <KeyValuePair
                  keyName={dataKey}
                  dataPath={dataPath}
                  {...props}
                />
              );
            }
            if (className === "section-wrapper") {
              return (
                <Section title={dataTitle} dataPath={dataPath} {...props} />
              );
            }
            if (className === "list-container-wrapper") {
              return <ListContainer {...props} />;
            }
            if (className === "list-item-wrapper") {
              return <ListItem {...props} />;
            }
            if (className === "empty-value-wrapper") {
              return <EmptyValue {...props} />;
            }
            if (className === "simple-value-wrapper") {
              return <SimpleValue {...props} />;
            }
            return <div className={className} {...props} />;
          },
          ...HtmlComponents,
        }}
      >
        {processedContent}
      </MarkdownWrapper>
    </div>
  );
}

export const MarkdownWrapper = ({
  children,
  components = [],
  rehypePlugins = [],
  className,
}) => {
  return (
    <div
      className={cn("prose prose-sm dark:prose-invert max-w-none", className)}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeHighlight, ...rehypePlugins]}
        components={{ ...HtmlComponents, ...components }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
};
