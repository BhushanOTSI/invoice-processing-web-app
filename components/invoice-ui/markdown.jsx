"use client";

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

export function Markdown({ children, className }) {
  return (
    <div
      className={cn(
        "prose prose-sm dark:prose-invert max-w-none",
        "prose-headings:font-semibold prose-headings:tracking-tight",
        "prose-h1:text-base prose-h1:mb-2 prose-h1:mt-3",
        "prose-h2:text-sm prose-h2:mb-2 prose-h2:mt-3",
        "prose-h3:text-sm prose-h3:mb-1.5 prose-h3:mt-2",
        "prose-h4:text-xs prose-h4:mb-1.5 prose-h4:mt-2",
        "prose-p:leading-6 prose-p:mb-2 prose-p:text-sm",
        "prose-a:text-primary prose-a:underline hover:prose-a:no-underline",
        "prose-strong:font-semibold prose-strong:text-foreground",
        "prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:font-mono prose-code:before:content-[''] prose-code:after:content-['']",
        "prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-pre:rounded-lg prose-pre:p-3 prose-pre:overflow-x-auto",
        "prose-ul:list-disc prose-ul:pl-5 prose-ul:mb-2",
        "prose-ol:list-decimal prose-ol:pl-5 prose-ol:mb-2",
        "prose-li:mb-0.5 prose-li:text-sm",
        "prose-img:rounded-lg prose-img:border prose-img:border-border",
        "prose-hr:border-border prose-hr:my-4",
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          h1: ({ node, ...props }) => (
            <h1 className="text-base font-semibold mb-2 mt-3" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-sm font-semibold mb-2 mt-3" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-sm font-semibold mb-1.5 mt-2" {...props} />
          ),
          h4: ({ node, ...props }) => (
            <h4 className="text-xs font-semibold mb-1.5 mt-2" {...props} />
          ),
          h5: ({ node, ...props }) => (
            <h5 className="text-xs font-medium mb-1 mt-2" {...props} />
          ),
          h6: ({ node, ...props }) => (
            <h6 className="text-xs font-medium mb-1 mt-1.5" {...props} />
          ),

          p: ({ node, ...props }) => (
            <p className="leading-6 mb-2 text-sm text-foreground" {...props} />
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
            <li className="text-foreground text-sm leading-6" {...props} />
          ),

          blockquote: ({ node, ...props }) => <Blockquote {...props} />,

          pre: ({ node, ...props }) => (
            <pre
              className="bg-muted border border-border rounded-lg p-3 overflow-x-auto mb-2 text-xs"
              {...props}
            />
          ),
          code: ({ node, inline, className, children, ...props }) => {
            if (inline) {
              return (
                <code
                  className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono text-foreground"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
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
