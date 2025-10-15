"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
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
    "text-sm",
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
    { className: `${sizes[level - 1]} font-semibold ${margins[level - 1]}` },
    children
  );
};

export function Markdown({ children, className }) {
  return (
    <div
      className={cn("prose prose-sm dark:prose-invert max-w-none", className)}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
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
            <strong className="font-semibold text-foreground" {...props} />
          ),

          em: ({ node, ...props }) => (
            <em className="italic text-foreground" {...props} />
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
            <ul className="list-disc pl-5 mb-2 space-y-0.5" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal pl-5 mb-2 space-y-0.5" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="text-sm leading-6 text-foreground" {...props} />
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
            <div className="mb-2 overflow-x-auto rounded-lg border border-border">
              <Table {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => <TableHeader {...props} />,
          tbody: ({ node, ...props }) => <TableBody {...props} />,
          tr: ({ node, ...props }) => <TableRow {...props} />,
          th: ({ node, ...props }) => (
            <TableHead className="font-semibold text-xs" {...props} />
          ),

          td: ({ node, ...props }) => (
            <TableCell className="text-sm" {...props} />
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
        {children}
      </ReactMarkdown>
    </div>
  );
}
