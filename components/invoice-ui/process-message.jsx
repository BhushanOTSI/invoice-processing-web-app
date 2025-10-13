"use client";

import { Markdown } from "./markdown";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import JsonView from "@uiw/react-json-view";
import { Skeleton } from "../ui/skeleton";
import { FileText, FileJson, FileImage } from "lucide-react";
import { useFetchS3Json } from "@/services/hooks/useBatchProcessInvoice";
import { invoiceJsonToMarkdown } from "@/lib/json-to-markdown";

export function ProcessMessage({ message, isLoading = false }) {
  const markdown = message.extraMetadata?.markdown;
  const s3PdfUrl = message.extraMetadata?.s3PdfUrl;
  const s3JsonUrl = message.extraMetadata?.s3JsonUrl;

  const { data: jsonData } = useFetchS3Json(s3JsonUrl, !!s3JsonUrl);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center flex-wrap py-4 px-6 border-b">
          <div className="flex-1 space-y-2">
            <Skeleton className="w-1/2 h-4" />
            <Skeleton className="w-1/3 h-4" />
          </div>
          <div className="flex gap-2 w-1/3">
            <Skeleton className="w-1/2 h-4" />
            <Skeleton className="w-1/2 h-4" />
            <Skeleton className="w-1/2 h-4" />
          </div>
        </div>
        <div className="p-4">
          <Skeleton className="w-full h-96" />
        </div>
      </div>
    );
  }

  const hasMarkdown = !!markdown;
  const hasMessage = !!message.message;
  const hasJson = !!s3JsonUrl;
  const hasPdf = !!s3PdfUrl;

  const availableTabs = [
    hasMarkdown || hasMessage ? "content" : null,
    hasJson ? "json" : null,
    hasPdf ? "pdf" : null,
  ].filter(Boolean);

  return (
    <div className="h-full">
      <Tabs defaultValue={availableTabs[0]} className="h-full gap-0">
        <div className="grid grid-cols-5 items-center py-4 px-6 border-b">
          <div className="col-span-3">
            <h6 className="text-sm font-bold">{message.name}</h6>
            <p className="text-sm text-muted-foreground">
              {message.description}
            </p>
          </div>
          <div className="col-span-2 flex justify-end">
            <TabsList className="gap-2 bg-transparent">
              {(hasMarkdown || hasMessage) && (
                <TabsTrigger
                  value="content"
                  className="text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hover:bg-primary/10 "
                >
                  <FileText className="size-3" />
                  Content
                </TabsTrigger>
              )}
              {hasJson && (
                <TabsTrigger
                  value="json"
                  className="text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hover:bg-primary/10 "
                >
                  <FileJson className="size-3" />
                  JSON
                </TabsTrigger>
              )}
              {hasPdf && (
                <TabsTrigger
                  value="pdf"
                  className="text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hover:bg-primary/10 "
                >
                  <FileImage className="size-3" />
                  PDF
                </TabsTrigger>
              )}
            </TabsList>
          </div>
        </div>

        {(hasMarkdown || hasMessage) && (
          <TabsContent
            value="content"
            className="pb-4 px-6 h-full overflow-auto"
          >
            {hasMarkdown ? (
              <>
                <Markdown>{markdown}</Markdown>
                {jsonData && (
                  <div className="border-t pb-2">
                    <Markdown>{invoiceJsonToMarkdown(jsonData)}</Markdown>
                  </div>
                )}
              </>
            ) : (
              <p>{message.message}</p>
            )}
          </TabsContent>
        )}

        {hasJson && (
          <TabsContent value="json" className="h-full overflow-auto p-4">
            {jsonData ? (
              <JsonView
                value={jsonData}
                displayDataTypes={false}
                displayObjectSize={true}
                className="dark:[&_.w-rjv-object-key]:text-white! dark:[&_.w-rjv-object-size]:text-blue-500!
                  dark:[&_.w-rjv-copied]:text-yellow-500!"
              />
            ) : (
              <div className="p-4 text-muted-foreground">Loading JSON...</div>
            )}
          </TabsContent>
        )}

        {hasPdf && (
          <TabsContent value="pdf" className="p-0 h-full">
            <object
              data={s3PdfUrl}
              type="application/pdf"
              className="w-full h-full"
            >
              <p className="p-4">
                Unable to display PDF.{" "}
                <a
                  href={s3PdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline hover:no-underline"
                >
                  Download PDF
                </a>
              </p>
            </object>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
