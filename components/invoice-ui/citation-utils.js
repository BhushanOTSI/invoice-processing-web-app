/**
 * Utility functions for citation normalization and comparison
 */

/**
 * Normalizes a single citation object
 * @param {Object} citation - The citation object to normalize
 * @returns {Object|null} - Normalized citation or null if invalid
 */
export function normalizeCitation(citation) {
  if (!citation) return null;
  const pageIndex = Number.isFinite(Number(citation.pageIndex))
    ? Number(citation.pageIndex)
    : null;
  const bbox = Array.isArray(citation.bbox)
    ? citation.bbox.map((n) => Number(n))
    : null;
  if (pageIndex === null || !bbox || bbox.length !== 4) return null;
  return { pageIndex, bbox };
}

/**
 * Normalizes an array of citations
 * @param {Array} citations - Array of citation objects
 * @returns {Array} - Array of normalized citations
 */
export function normalizeCitations(citations) {
  if (!Array.isArray(citations)) return [];
  return citations
    .map((c, idx) => {
      const pageIndex = Number.isFinite(Number(c?.pageIndex))
        ? Number(c.pageIndex)
        : null;
      const bbox = Array.isArray(c?.bbox)
        ? c.bbox.map((n) => Number(n))
        : null;
      if (pageIndex === null || !bbox || bbox.length !== 4) return null;
      return {
        id: c?.id ?? `${pageIndex}:${bbox.join(",")}:${idx}`,
        pageIndex,
        bbox,
        title: c?.title ?? "",
        text: c?.text ?? "",
        path: c?.path ?? "",
      };
    })
    .filter(Boolean);
}

/**
 * Groups citations by page index
 * @param {Array} normalizedCitations - Array of normalized citations
 * @returns {Map} - Map of pageIndex to array of citations
 */
export function groupCitationsByPage(normalizedCitations) {
  const map = new Map();
  for (const c of normalizedCitations) {
    const arr = map.get(c.pageIndex) || [];
    arr.push(c);
    map.set(c.pageIndex, arr);
  }
  return map;
}

/**
 * Checks if two bbox arrays are the same (within tolerance)
 * @param {Array} a - First bbox array
 * @param {Array} b - Second bbox array
 * @returns {boolean} - True if bboxes are the same
 */
export function isSameBbox(a, b) {
  if (!a || !b || a.length !== 4 || b.length !== 4) return false;
  for (let i = 0; i < 4; i++) {
    if (Math.abs(Number(a[i]) - Number(b[i])) > 1e-6) return false;
  }
  return true;
}

/**
 * Calculates style properties for a citation bbox
 * @param {Array} bbox - Bounding box array [x0, y0, x1, y1]
 * @returns {Object} - Style object with left, top, width, height percentages
 */
export function calculateBboxStyle(bbox) {
  const [x0, y0, x1, y1] = bbox;
  return {
    left: Math.min(x0, x1) * 100,
    top: Math.min(y0, y1) * 100,
    width: Math.abs(x1 - x0) * 100,
    height: Math.abs(y1 - y0) * 100,
  };
}

