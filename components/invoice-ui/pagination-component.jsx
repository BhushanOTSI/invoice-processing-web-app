import { ButtonGroupText } from "../ui/button-group";
import { Input } from "../ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../ui/input-group";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "../ui/pagination";
import {
  generatePaginationItems,
  calculateTotalPages,
  isValidPageChange,
  getPageNumber,
} from "@/lib/pagination-utils";

export function PaginationComponent({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  className,
  enablePagination = true,
}) {
  const totalPages = calculateTotalPages(totalItems, pageSize);
  const currentPageNumber = getPageNumber(currentPage);

  if (totalPages <= 1 || !enablePagination) {
    return null;
  }

  const handlePageChange = (newPage) => {
    if (onPageChange && isValidPageChange(newPage, totalPages)) {
      onPageChange(newPage);
    }
  };

  return (
    <div className="border-t px-4 py-2 bg-muted rounded-b-lg">
      <div className="flex items-center gap-2">
        <div className="text-sm text-muted-foreground ">
          <span>
            Showing {currentPage * pageSize + 1} to{" "}
            {Math.min(currentPage * pageSize + pageSize, totalItems)} of{" "}
            {totalItems} results
          </span>
        </div>
        <div className="flex-1">
          <Pagination className={className}>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(currentPage - 1)}
                  className={
                    currentPage === 0
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>

              {generatePaginationItems(currentPageNumber, totalPages).map(
                (item, index) => (
                  <PaginationItem key={index}>
                    {item.type === "page" ? (
                      <PaginationLink
                        onClick={() => handlePageChange(item.page - 1)}
                        isActive={item.isActive}
                        className="cursor-pointer"
                      >
                        {item.page}
                      </PaginationLink>
                    ) : item.type === "ellipsis" ? (
                      <PaginationEllipsis />
                    ) : null}
                  </PaginationItem>
                )
              )}
              <InputGroup>
                <InputGroupInput
                  type="number"
                  aria-label="Go to page"
                  placeholder={`Go to page`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const page = parseInt(e.target.value);

                      if (isNaN(page) || page < 1 || page > totalPages) {
                        return;
                      }

                      handlePageChange(page - 1);
                    }
                  }}
                  className="w-26 text-center"
                />
                <InputGroupAddon align="inline-end">
                  Total pages {totalPages}
                </InputGroupAddon>
              </InputGroup>

              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(currentPage + 1)}
                  className={
                    currentPage >= totalPages - 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
}
