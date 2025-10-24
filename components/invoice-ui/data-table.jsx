import {
  Fragment,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
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
import { Input } from "../ui/input";
import { CopyToClipboard } from "../ui/copy-to-clipboard";
import Link from "next/link";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card";
import { LinkIcon } from "lucide-react";

export function DataTable({
  data,
  columns,
  isLoading,
  enablePagination,
  pageSize,
  totalItems,
  page,
  onPageChange,
  manualFiltering = true,
  onFilterChange,
  onRowSelectionChange,
  rowSelection = {},
}) {
  const tableContainerRef = useRef(null);
  const [columnFilters, setColumnFilters] = useState([]);

  const table = useReactTable({
    data,
    columns,
    defaultColumn: {
      enableColumnFilter: false,
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: enablePagination
      ? getPaginationRowModel()
      : undefined,
    manualPagination: true,
    manualFiltering: manualFiltering,
    enableColumnFilter: true,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: (filters) => {
      setColumnFilters(filters);
    },

    onRowSelectionChange: onRowSelectionChange,
    state: {
      columnFilters,
      rowSelection,
    },
  });

  useEffect(() => {
    onFilterChange?.(columnFilters);
  }, [columnFilters]);

  return (
    <div ref={tableContainerRef}>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => {
            const isFilterable = headerGroup.headers.some((header) =>
              header.column.getCanFilter()
            );

            return (
              <Fragment key={headerGroup.id}>
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        className={cn(
                          "p-4",
                          header.column.columnDef.rowClassName
                        )}
                      >
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
                {isFilterable && (
                  <TableRow>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead
                          key={header.id}
                          className={cn(
                            "px-4 py-2",
                            header.column.columnDef.rowClassName
                          )}
                        >
                          {header.column.getCanFilter() && (
                            <Filter
                              filter={header.column.getFilterValue()}
                              onChange={header.column.setFilterValue}
                              type={header.column.columnDef.filterFn}
                              header={header.column.columnDef.header}
                            />
                          )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                )}
              </Fragment>
            );
          })}
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 10 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell
                  colSpan={columns.length}
                  className={"text-center px-4 py-3"}
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
                className={cn("odd:bg-muted", row.original.rowClassName)}
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
        className="justify-end"
      />
    </div>
  );
}

function Filter({ filter, onChange, type, header }) {
  return (
    <Input
      type={type === "includesDate" ? "date" : "text"}
      value={filter || ""}
      placeholder={`Filter ${header}`}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export function RowRenderLink({
  showLink = true,
  href,
  value,
  header,
  allowCopy = true,
  target = "_self",
  urlText = "Click to view  ",
}) {
  return (
    <div className="flex items-center gap-0.5">
      <div className="max-w-24 truncate">
        {showLink ? (
          <Link href={href} className="underline" target={target}>
            <RowCell
              value={value}
              href={href}
              header={header}
              urlText={urlText}
              target={target}
            />
          </Link>
        ) : (
          <RowCell value={value} header={header} urlText={urlText} />
        )}
      </div>
      {allowCopy && <CopyToClipboard value={value} />}
    </div>
  );
}

export function RowCell({
  value,
  className,
  header,
  href,
  urlText = "View logs",
  target = "_self",
}) {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div className={cn("max-w-32 truncate", className)}>{value}</div>
      </HoverCardTrigger>
      <HoverCardContent className={"space-y-2 p-0"}>
        <div className="p-4">
          {header && <h3 className="text-base">{header}</h3>}
          <div className="text-sm">{value}</div>
        </div>

        {href && (
          <Link
            href={href}
            target={target}
            className="text-sm bg-accent-foreground/10 p-2 flex gap-1 items-center"
          >
            <LinkIcon className="size-3" />
            {urlText}
          </Link>
        )}
      </HoverCardContent>
    </HoverCard>
  );
}
