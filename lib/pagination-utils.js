/**
 * Pagination utility functions for generating smart pagination items
 */

/**
 * Generate pagination items with maximum 3 visible pages and ellipsis
 * @param {number} currentPage - Current page (1-based)
 * @param {number} totalPages - Total number of pages
 * @returns {Array} Array of pagination items with type and page properties
 */
export function generatePaginationItems(currentPage, totalPages) {
  const items = [];
  const maxVisiblePages = 3;

  if (totalPages <= maxVisiblePages) {
    // Show all pages if total is 3 or less
    for (let i = 1; i <= totalPages; i++) {
      items.push({
        type: "page",
        page: i,
        isActive: i === currentPage,
      });
    }
  } else {
    // Show first page
    items.push({
      type: "page",
      page: 1,
      isActive: 1 === currentPage,
    });

    if (currentPage <= 3) {
      // Show pages 1, 2, 3, ..., last
      for (let i = 2; i <= 3; i++) {
        items.push({
          type: "page",
          page: i,
          isActive: i === currentPage,
        });
      }
      if (totalPages > 3) {
        items.push({ type: "ellipsis" });
      }
    } else if (currentPage >= totalPages - 2) {
      // Show first, ..., last-2, last-1, last
      if (totalPages > 3) {
        items.push({ type: "ellipsis" });
      }
      for (let i = totalPages - 2; i <= totalPages; i++) {
        items.push({
          type: "page",
          page: i,
          isActive: i === currentPage,
        });
      }
    } else {
      // Show first, ..., current-1, current, current+1, ..., last
      items.push({ type: "ellipsis" });
      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        items.push({
          type: "page",
          page: i,
          isActive: i === currentPage,
        });
      }
      items.push({ type: "ellipsis" });
    }
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
