"use client";

import { Markdown } from "./markdown";
import JsonView from "@uiw/react-json-view";
import { jsonToMarkdown } from "@/lib/json-to-markdown";
import { PdfScanningLoader } from "../pdf-scanning-loader";
import { Spinner } from "../ui/spinner";

export function ProcessMessage({
  message,
  isLoading = false,
  view = "markdown",
  jsonData,
  isProcessing = false,
}) {
  const markdown = message?.extraMetadata?.markdown;
  const hasMarkdown = !!markdown;
  const hasJson = !!jsonData;

  if (isLoading) {
    return <Spinner />;
  }

  if (isProcessing) {
    return <PdfScanningLoader />;
  }

  if (view === "markdown") {
    return hasMarkdown ? (
      <div className="space-y-4 pb-6">
        <Markdown>{markdown}</Markdown>
        {jsonData && <Markdown>{jsonToMarkdown(jsonData)}</Markdown>}
      </div>
    ) : (
      message?.message
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
