import { useRef } from "react";
import {
  flexRender,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { getCoreRowModel, getPaginationRowModel } from "@tanstack/react-table";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../ui/table";
import { Skeleton } from "../ui/skeleton";
import { cn } from "@/lib/utils";
import { PaginationComponent } from "./pagination-component";

export function DataTable({
  data,
  columns,
  isLoading,
  enablePagination,
  pageSize,
  totalItems,
  page,
  onPageChange,
}) {
  const tableContainerRef = useRef(null);
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: enablePagination
      ? getPaginationRowModel()
      : undefined,
    manualPagination: true,
    manualFiltering: true,
  });

  return (
    <div ref={tableContainerRef}>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id} className="p-4">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 10 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell
                  colSpan={columns.length}
                  className="text-center px-4 py-3"
                  key={index}
                >
                  <Skeleton className="w-full h-8" />
                </TableCell>
              </TableRow>
            ))
          ) : table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className={cn("odd:bg-muted")}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="px-4 py-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <PaginationComponent
        currentPage={page}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={(page) => {
          onPageChange(page);
          tableContainerRef.current.scrollIntoView({ behavior: "smooth" });
        }}
        enablePagination={enablePagination}
      />
    </div>
  );
}
