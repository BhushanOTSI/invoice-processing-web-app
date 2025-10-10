import { humanizeDateTime } from "@/lib/utils";
import { DataTable } from "../invoice-ui/data-table";
import { APP_ROUTES } from "@/app/constants/app-routes";
import { ProcessStatusBadge } from "../invoice-ui/process-status-badge";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { EyeIcon } from "lucide-react";

export function InvoiceTable({
  data,
  isLoading,
  totalItems = 0,
  pageSize = 50,
  page = 0,
  onPageChange,
  enablePagination = false,
}) {
  const router = useRouter();

  const columns = useMemo(
    () => [
      {
        header: "S.No",
        accessorKey: "id",
      },
      {
        header: "Invoice Number",
        accessorKey: "invoiceNumber",
        filterFn: "includesString",
      },
      {
        header: "Document Name",
        accessorKey: "documentName",
        filterFn: "includesString",
      },
      {
        header: "Start Time",
        accessorKey: "startTime",
        filterFn: "includesString",
        cell: ({ row }) => {
          return <span>{humanizeDateTime(row.original.startTime)}</span>;
        },
      },
      {
        header: "End Time",
        accessorKey: "endTime",
        cell: ({ row }) => {
          return <span>{humanizeDateTime(row.original.endTime)}</span>;
        },
      },
      {
        header: "Time Taken",
        accessorKey: "timeTaken",
      },
      {
        header: "Status",
        accessorKey: "status",
        cell: ({ row }) => {
          return <ProcessStatusBadge status={row.original.status} />;
        },
      },
      {
        header: "Action",
        accessorKey: "processId",
        cell: ({ row }) => {
          return (
            <Button
              size={"sm"}
              className={"h-7"}
              onClick={() => {
                router.push(
                  APP_ROUTES.getRoute(APP_ROUTES.PROCESSING.TRACE, {
                    processId: row.original.processId,
                  })
                );
              }}
            >
              <EyeIcon />
              View
            </Button>
          );
        },
      },
    ],
    []
  );

  return (
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
  );
}
