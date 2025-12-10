"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";
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

const KeyValuePair = ({ keyName, children }) => {
  return (
    <div className="flex items-center gap-3 mb-2">
      <div className="font-semibold text-xs text-muted-foreground w-48 shrink-0">
        {keyName}:
      </div>
      <div className="flex-1 flex items-center justify-between gap-3 py-2.5 px-3 bg-muted/40 border border-border rounded-md hover:bg-muted/50 transition-colors group text-sm text-foreground">
        {children}
      </div>
    </div>
  );
};

const Section = ({ title, children }) => {
  return (
    <div className="not-first:pt-2 last:border-b-0">
      <div className="text-base font-semibold text-foreground mb-3 ">
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

export function Markdown({ children, className }) {
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

  // Helper function to escape HTML
  const escapeHtml = React.useCallback((text) => {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }, []);

  // Process markdown content before rendering
  const processedContent = React.useMemo(() => {
    if (typeof children !== "string") return children;

    let content = children;

    // Step 1: Normalize line breaks (handle escaped newlines)
    content = content.replace(/\\n/g, "\n");

    // Step 2: Convert markdown key-value pairs to HTML structure
    // Pattern: **Key:** Value (on its own line or after other content)
    // Only convert if not inside a heading or list
    content = content.replace(
      /^(?!#+\s)(?![-*]\s)\*\*([^*\n:]+):\*\*\s*(.+?)(?=\n|$)/gm,
      (match, key, value) => {
        const trimmedKey = key.trim();
        const trimmedValue = value.trim();
        // Skip if value is empty or just punctuation
        if (!trimmedValue || trimmedValue.length < 2) {
          return match;
        }
        return `<div class="kv-pair-wrapper" data-key="${escapeHtml(
          trimmedKey
        )}">${trimmedValue}</div>`;
      }
    );

    // Step 3: Process confidence markers
    content = content.replace(/\{\{conf~([\d.]+)\}\}/g, (match, score) => {
      const numScore = parseFloat(score);
      let badgeColor =
        "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-800";

      if (numScore < 0.5) {
        badgeColor =
          "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800";
      } else if (numScore < 0.8) {
        badgeColor =
          "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800";
      }

      return `<span class="confidence-badge inline-flex items-center text-[9px] leading-none font-semibold border ${badgeColor} rounded-full px-2 py-0.5 ml-2 whitespace-nowrap shadow-sm transition-all duration-200 hover:scale-105 hover:shadow-md shrink-0" title="Confidence Score: ${(
        numScore * 100
      ).toFixed(0)}%">${(numScore * 100).toFixed(0)}%</span>`;
    });

    return content;
  }, [children, escapeHtml]);

  return (
    <div
      className={cn("prose prose-sm dark:prose-invert max-w-none", className)}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeHighlight]}
        components={{
          div: ({
            node,
            className,
            "data-key": dataKey,
            "data-title": dataTitle,
            ...props
          }) => {
            if (className === "kv-pair-wrapper") {
              return <KeyValuePair keyName={dataKey} {...props} />;
            }
            if (className === "section-wrapper") {
              return <Section title={dataTitle} {...props} />;
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
          h1: (props) => <MarkdownHeading level={1} {...props} />,
          h2: (props) => <MarkdownHeading level={2} {...props} />,
          h3: (props) => <MarkdownHeading level={3} {...props} />,
          h4: (props) => <MarkdownHeading level={4} {...props} />,
          h5: (props) => <MarkdownHeading level={5} {...props} />,
          h6: (props) => <MarkdownHeading level={6} {...props} />,
          p: ({ node, ...props }) => (
            <p className="text-sm leading-6 mb-2 text-foreground" {...props} />
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
            <ul className="list-disc pl-6 mb-3 space-y-1.5" {...props} />
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
            <div className="my-6 overflow-x-auto rounded-lg border border-border shadow-sm bg-card">
              <Table {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <TableHeader
              className="bg-muted/60 border-b-2 border-border"
              {...props}
            />
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
              className="font-semibold text-xs py-4 px-4 whitespace-nowrap text-left"
              {...props}
            />
          ),

          td: ({ node, ...props }) => (
            <TableCell className="text-sm py-4 px-4 align-middle" {...props} />
          ),

          hr: ({ node, ...props }) => (
            <hr className="border-border my-4" {...props} />
          ),
          img: ({ node, ...props }) => (
            <img
              className="rounded-lg border border-border max-w-full h-auto"
              {...props}
            />
          ),
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
}
