import { useMemo } from "react";
import {
  DataTable,
  RowCell,
  RowRenderLink,
} from "@/components/invoice-ui/data-table";
import { humanizeDateTime } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { ProcessStatusBadge } from "@/components/invoice-ui/process-status-badge";
import { APP_ROUTES } from "@/app/constants/app-routes";
import { CASE_TYPES, PROCESS_STATUS } from "@/app/constants";
import { Button } from "@/components/ui/button";
import { useCancelBatch } from "@/services/hooks/useBatchProcessInvoice";
import { toast } from "sonner";
import { Check, X } from "lucide-react";

export function BatchProcessingTable({
  data,
  isLoading,
  page,
  totalItems,
  pageSize,
  onPageChange,
  enablePagination = false,
}) {
  const cancelBatchMutation = useCancelBatch();

  const handleCancelBatch = async (batchNo) => {
    try {
      await cancelBatchMutation.mutateAsync(batchNo);
      toast.success("Batch cancelled successfully");
    } catch (error) {
      toast.error("Failed to cancel batch");
    }
  };

  const columns = useMemo(() => {
    return [
      {
        header: "Batch ID",
        accessorKey: "batchNo",
        cell: ({ row }) => {
          return (
            <RowRenderLink
              href={APP_ROUTES.getRoute(APP_ROUTES.PROCESSING.BATCH, {
                batchID: row.original.batchNo,
              })}
              value={row.original.batchNo}
              header="Batch ID"
            />
          );
        },
      },
      {
        header: "Status",
        accessorKey: "status",
        cell: ({ row }) => {
          return <ProcessStatusBadge status={row.original.status} />;
        },
      },
      {
        header: "Number of Files",
        accessorKey: "numberOfFiles",
        cell: ({ row }) => {
          return (
            <RowCell
              value={row.original.numberOfFiles}
              header="Number of Files"
            />
          );
        },
      },
      {
        header: "Case Type",
        accessorKey: "headerInputJson.caseType",
        cell: ({ row }) => {
          return (
            <RowCell
              value={
                CASE_TYPES[row.original.headerInputJson?.caseType] ||
                row.original.headerInputJson?.caseType ||
                "-"
              }
              header="Case Type"
            />
          );
        },
      },
      {
        header: "Use Cache",
        accessorKey: "headerInputJson.useCache",
        cell: ({ row }) => {
          const useCache = row.original.headerInputJson?.useCache;
          const isTrue = useCache === "True" || useCache === true;
          const isFalse = useCache === "False" || useCache === false;

          return (
            <div className="flex items-center justify-center">
              {isTrue ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : isFalse ? (
                <X className="h-4 w-4 text-red-600" />
              ) : (
                <span className="text-gray-400">-</span>
              )}
            </div>
          );
        },
      },
      {
        header: "Trigger",
        accessorKey: "trigger",
        cell: ({ row }) => {
          const triggerType = row.original.triggerType;
          const triggerDate = row.original.triggerDateTime
            ? humanizeDateTime(row.original.triggerDateTime)
            : null;

          const isNow = triggerType === "now";
          const displayTriggerType = isNow ? "Immediately" : triggerType;

          return (
            <div className="space-y-1">
              {isNow && <div className="font-medium">{displayTriggerType}</div>}
              {triggerDate && <div className="text-sm">{triggerDate}</div>}
            </div>
          );
        },
      },
      {
        header: "Created Date",
        accessorKey: "createdDate",
        cell: ({ row }) => {
          return (
            <RowCell
              value={humanizeDateTime(row.original.createdDate)}
              header="Created Date"
            />
          );
        },
      },
      {
        header: "Actions",
        accessorKey: "actions",
        cell: ({ row }) => {
          const canCancel = row.original.status === PROCESS_STATUS.SCHEDULED;

          return (
            <div className="flex gap-2">
              {canCancel ? (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleCancelBatch(row.original.batchNo)}
                  disabled={cancelBatchMutation.isPending}
                >
                  {cancelBatchMutation.isPending ? "Cancelling..." : "Cancel"}
                </Button>
              ) : (
                <span className="text-gray-400">-</span>
              )}
            </div>
          );
        },
        enableColumnFilter: false,
      },
    ];
  }, [cancelBatchMutation]);

  return (
    <Card className="p-0 overflow-hidden">
      <CardContent className="p-0">
        <DataTable
          data={data || []}
          columns={columns}
          isLoading={isLoading}
          enablePagination={enablePagination}
          pageSize={pageSize}
          totalItems={totalItems}
          page={page}
          onPageChange={onPageChange}
        />
      </CardContent>
    </Card>
  );
}
