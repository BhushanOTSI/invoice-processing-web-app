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
        "prose-headings:font-bold prose-headings:tracking-tight",
        "prose-h1:text-lg prose-h1:mb-3 prose-h1:mt-4",
        "prose-h2:text-base prose-h2:mb-3 prose-h2:mt-4",
        "prose-h3:text-base prose-h3:mb-2 prose-h3:mt-3",
        "prose-h4:text-sm prose-h4:mb-2 prose-h4:mt-3",
        "prose-p:leading-7 prose-p:mb-4",
        "prose-a:text-primary prose-a:underline hover:prose-a:no-underline",
        "prose-strong:font-semibold prose-strong:text-foreground",
        "prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-code:before:content-[''] prose-code:after:content-['']",
        "prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-pre:rounded-lg prose-pre:p-4 prose-pre:overflow-x-auto",
        "prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-4",
        "prose-ol:list-decimal prose-ol:pl-6 prose-ol:mb-4",
        "prose-li:mb-1",
        "prose-img:rounded-lg prose-img:border prose-img:border-border",
        "prose-hr:border-border prose-hr:my-6",
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          h1: ({ node, ...props }) => (
            <h1 className="text-lg font-bold mb-3 mt-4" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-base font-bold mb-3 mt-4" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-base font-semibold mb-2 mt-3" {...props} />
          ),
          h4: ({ node, ...props }) => (
            <h4 className="text-sm font-semibold mb-2 mt-3" {...props} />
          ),
          h5: ({ node, ...props }) => (
            <h5 className="text-sm font-medium mb-2 mt-2" {...props} />
          ),
          h6: ({ node, ...props }) => (
            <h6 className="text-xs font-medium mb-2 mt-2" {...props} />
          ),

          p: ({ node, ...props }) => (
            <p className="leading-7 mb-4 text-foreground" {...props} />
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
            <ul className="list-disc pl-6 mb-4 space-y-1" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal pl-6 mb-4 space-y-1" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="text-foreground leading-7" {...props} />
          ),

          blockquote: ({ node, ...props }) => <Blockquote {...props} />,

          pre: ({ node, ...props }) => (
            <pre
              className="bg-muted border border-border rounded-lg p-4 overflow-x-auto mb-4"
              {...props}
            />
          ),
          code: ({ node, inline, className, children, ...props }) => {
            if (inline) {
              return (
                <code
                  className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-foreground"
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
            <div className="mb-4 overflow-x-auto rounded-lg border border-border">
              <Table {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => <TableHeader {...props} />,
          tbody: ({ node, ...props }) => <TableBody {...props} />,
          tr: ({ node, ...props }) => <TableRow {...props} />,
          th: ({ node, ...props }) => (
            <TableHead className="font-semibold" {...props} />
          ),
          td: ({ node, ...props }) => <TableCell {...props} />,
          hr: ({ node, ...props }) => (
            <hr className="border-border my-6" {...props} />
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
