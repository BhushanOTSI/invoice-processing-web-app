import { useMemo } from "react";
import {
  DataTable,
  RowCell,
  RowRenderLink,
} from "@/components/invoice-ui/data-table";
import { humanizeDateTime } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { CASE_TYPES, PROCESS_STATUS } from "@/app/constants";
import { ProcessStatusBadge } from "@/components/invoice-ui/process-status-badge";
import { APP_ROUTES } from "@/app/constants/app-routes";

export function InvoiceProcessingTable({
  data,
  isLoading,
  showBatchId = false,
  page,
  totalItems,
  pageSize,
  onPageChange,
  enablePagination = false,
}) {
  const columns = useMemo(() => {
    return [
      ...(showBatchId
        ? [
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
                  />
                );
              },
            },
          ]
        : []),
      {
        header: "Process ID",
        accessorKey: "processId",
        cell: ({ row }) => {
          return (
            <RowRenderLink
              showLink={row.original.status !== PROCESS_STATUS.PENDING}
              href={APP_ROUTES.getRoute(APP_ROUTES.PROCESSING.TRACE_PROCESS, {
                processID: row.original.processId,
              })}
              value={row.original.processId}
            />
          );
        },
      },
      {
        header: "File Name",
        accessorKey: "filename",
        cell: ({ row }) => {
          return <RowCell value={row.original.filename} header="File Name" />;
        },
      },
      {
        header: "Process Status",
        accessorKey: "status",
        cell: ({ row }) => {
          return <ProcessStatusBadge status={row.original.status} />;
        },
      },
      ...(showBatchId
        ? [
            {
              header: "Batch Status",
              accessorKey: "batchStatus",
              cell: ({ row }) => {
                return <ProcessStatusBadge status={row.original.batchStatus} />;
              },
            },
          ]
        : []),
      {
        header: "Case Type",
        accessorKey: "detailsInputJson.caseType",
        cell: ({ row }) => {
          return (
            <RowCell
              value={
                CASE_TYPES[row.original.detailsInputJson.caseType] || "N/A"
              }
              header="Case Type"
            />
          );
        },
      },

      {
        header: "Created Date",
        accessorKey: "createdDate",
        cell: ({ row }) => {
          return <span>{humanizeDateTime(row.original.createdDate)}</span>;
        },
        enableColumnFilter: false,
      },
    ];
  }, [showBatchId]);

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
