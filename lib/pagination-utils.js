/**
 * Pagination utility functions for generating smart pagination items
 */

/**
 * Generate pagination items with maximum 3 visible pages and ellipsis
 * @param {number} currentPage - Current page (1-based)
 * @param {number} totalPages - Total number of pages
 * @returns {Array} Array of pagination items with type and page properties
 */
/**
 * Generate pagination items with maximum 3 visible pages + ellipses.
 * Example pattern:
 * 1 ... 4 5 6 ... 10
 */
export function generatePaginationItems(currentPage, totalPages) {
  const items = [];
  const maxVisible = 3;

  // Always show first page
  items.push({ type: "page", page: 1, isActive: currentPage === 1 });

  // Add left ellipsis if needed
  if (currentPage > 3) {
    items.push({ type: "ellipsis" });
  }

  // Determine middle range
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  for (let i = start; i <= end; i++) {
    if (i > 1 && i < totalPages) {
      items.push({
        type: "page",
        page: i,
        isActive: i === currentPage,
      });
    }
  }

  // Add right ellipsis if needed
  if (currentPage < totalPages - 2) {
    items.push({ type: "ellipsis" });
  }

  // Always show last page
  if (totalPages > 1) {
    items.push({
      type: "page",
      page: totalPages,
      isActive: currentPage === totalPages,
    });
  }

  return items;
}

/**
 * Calculate total pages based on total items and page size
 * @param {number} totalItems - Total number of items
 * @param {number} pageSize - Number of items per page
 * @returns {number} Total number of pages
 */
export function calculateTotalPages(totalItems, pageSize) {
  return Math.ceil(totalItems / pageSize);
}

/**
 * Validate if a page change is valid
 * @param {number} newPage - New page index (0-based)
 * @param {number} totalPages - Total number of pages
 * @returns {boolean} Whether the page change is valid
 */
export function isValidPageChange(newPage, totalPages) {
  return newPage >= 0 && newPage < totalPages;
}

/**
 * Convert 0-based page index to 1-based page number
 * @param {number} pageIndex - 0-based page index
 * @returns {number} 1-based page number
 */
export function getPageNumber(pageIndex) {
  return pageIndex + 1;
}

/**
 * Convert 1-based page number to 0-based page index
 * @param {number} pageNumber - 1-based page number
 * @returns {number} 0-based page index
 */
export function getPageIndex(pageNumber) {
  return pageNumber - 1;
}
