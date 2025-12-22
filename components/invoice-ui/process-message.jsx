"use client";

import { memo } from "react";
import { Markdown } from "./markdown";
import JsonView from "@uiw/react-json-view";
import { jsonToMarkdown } from "@/lib/json-to-markdown";
import { PdfScanningLoader } from "../pdf-scanning-loader";
import { Spinner } from "../ui/spinner";
import { FileQuestionMarkIcon } from "lucide-react";
import {
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  Empty,
  EmptyMedia,
} from "../ui/empty";

export function ProcessMessage({
  message,
  isLoading = false,
  view = "markdown",
  jsonData,
  isProcessing = false,
  isMainProcessFailed = false,
  onCitationChange,
}) {
  const markdown = message?.extraMetadata?.markdown;
  const hasMarkdown = !!markdown;
  const hasJson = !!jsonData;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner />
      </div>
    );
  }

  if (isProcessing) {
    return <PdfScanningLoader />;
  }

  if (view === "markdown") {
    return hasMarkdown ? (
      <div className="space-y-4 pb-6">
        <Markdown onCitationChange={onCitationChange}>{markdown}</Markdown>
        {jsonData && (
          <Markdown onCitationChange={onCitationChange}>
            {jsonToMarkdown(jsonData)}
          </Markdown>
        )}
      </div>
    ) : message?.message ? (
      message?.message
    ) : isMainProcessFailed ? (
      <Empty>
        <EmptyMedia variant="icon">
          <FileQuestionMarkIcon />
        </EmptyMedia>
        <EmptyHeader>
          <EmptyTitle>Failed to parse the invoice</EmptyTitle>
          <EmptyDescription>
            The invoice parsing process failed.No message available.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    ) : (
      <Empty>
        <EmptyMedia variant="icon">
          <FileQuestionMarkIcon />
        </EmptyMedia>
        <EmptyHeader>
          <EmptyTitle>No message available</EmptyTitle>
          <EmptyDescription>No message available.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    hasJson &&
    (jsonData ? (
      <JsonView
        value={jsonData}
        displayDataTypes={false}
        displayObjectSize={true}
        className="dark:[&_.w-rjv-object-key]:text-white! dark:[&_.w-rjv-object-size]:text-blue-500!
                  dark:[&_.w-rjv-copied]:text-yellow-500!"
      />
    ) : (
      <div className="p-4 text-muted-foreground">Loading JSON...</div>
    ))
  );
}

export const ProcessMessageMemo = memo(ProcessMessage);
ProcessMessageMemo.displayName = "ProcessMessageMemo";
