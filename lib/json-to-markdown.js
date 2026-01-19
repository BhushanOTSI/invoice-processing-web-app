import { toTitleCase } from "remeda";
import { autoDetectAndNormalize } from "@/lib/utils";

export function jsonToMarkdown(data, indent = 0, path = "") {
  let md = "";

  if (Array.isArray(data)) {
    if (data.length === 0) {
      return `<div class="empty-value-wrapper">N/A</div>\n\n`;
    }

    if (
      data.every(
        (item) =>
          typeof item === "object" && item !== null && !Array.isArray(item)
      )
    ) {
      const keys = Array.from(new Set(data.flatMap((obj) => Object.keys(obj))))
        // Requirement: ignore metadata fields in preview (both old and new format)
        .filter((k) => k !== "source" && k !== "grounding" && k !== "sources" && k !== "sourceKeyList");
      const header = `| ${keys.map((k) => toTitleCase(k)).join(" | ")} |`;
      const divider = `| ${keys.map(() => "---").join(" | ")} |`;
      const rows = data.map((obj) => {
        const rowCitation = extractCitationFromRow(obj);
        return `| ${keys
          .map((k) =>
            // Requirement: for table-like data (e.g. lineItems), hover any cell -> cite the row
            formatValue(obj[k], {
              inTable: true,
              citationOverride: rowCitation,
            })
          )
          .join(" | ")} |`;
      });
      md += `\n${header}\n${divider}\n${rows.join("\n")}\n\n`;
    } else {
      md += `<div class="list-container-wrapper">\n`;
      for (let i = 0; i < data.length; i++) {
        const item = data[i];
        if (typeof item === "object" && item !== null) {
          const nestedContent = jsonToMarkdown(
            item,
            indent + 1,
            `${path}[${i}]`
          ).trim();
          md += `<div class="list-item-wrapper">\n\n${nestedContent}\n\n</div>\n`;
        } else {
          md += `<div class="list-item-wrapper">${formatValue(item)}</div>\n`;
        }
      }
      md += `</div>\n\n`;
    }
  } else if (typeof data === "object" && data !== null) {
    for (const [key, value] of Object.entries(data)) {
      // Skip metadata fields from both old format (grounding) and new format (sources)
      if (key === "source" || key === "grounding" || key === "sources" || key === "sourceKeyList") continue;
      const nextPath = path ? `${path}.${key}` : key;
      if (Array.isArray(value)) {
        const nestedContent = jsonToMarkdown(
          value,
          indent + 1,
          nextPath
        ).trim();
        const escapedTitle = escapeHtml(toTitleCase(key));
        md += `<div class="section-wrapper" data-title="${escapedTitle}" data-path="${escapeHtml(
          nextPath
        )}">\n\n${nestedContent}\n\n</div>\n\n`;
      } else if (typeof value === "object" && value !== null) {
        const hasValueStructure =
          "value" in value ||
          "formattedValue" in value ||
          "formattedDate" in value ||
          "valueFromDocument" in value;

        if (hasValueStructure && "confidenceScore" in value) {
          const escapedKey = escapeHtml(toTitleCase(key));
          md += `<div class="kv-pair-wrapper" data-key="${escapedKey}" data-path="${escapeHtml(
            nextPath
          )}">${formatValue(value)}</div>\n\n`;
        } else {
          const nestedContent = jsonToMarkdown(
            value,
            indent + 1,
            nextPath
          ).trim();
          if (nestedContent) {
            const escapedTitle = escapeHtml(toTitleCase(key));
            md += `<div class="section-wrapper" data-title="${escapedTitle}" data-path="${escapeHtml(
              nextPath
            )}">\n\n${nestedContent}\n\n</div>\n\n`;
          }
        }
      } else {
        const escapedKey = escapeHtml(toTitleCase(key));
        md += `<div class="kv-pair-wrapper" data-key="${escapedKey}" data-path="${escapeHtml(
          nextPath
        )}">${formatValue(value)}</div>\n\n`;
      }
    }
  } else {
    md += `<div class="simple-value-wrapper">${formatValue(data)}</div>\n\n`;
  }

  return md;
}

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatValue(value, opts = {}) {
  const { inTable = false, citationOverride = null } = opts;

  if (value === null || value === undefined) return "N/A";
  if (Array.isArray(value) && value.length === 0) return "N/A";

  if (typeof value === "string") {
    const safe = escapeHtml(value).replace(/\n+/g, "<br/>").trim();
    return inTable ? safe.replace(/\|/g, "\\|") : safe;
  }

  if (Array.isArray(value)) {
    if (value.some((item) => typeof item === "object" && item !== null)) {
      return `[${value.length} items]`;
    }

    const safe = escapeHtml(value.join(", "));
    return inTable ? safe.replace(/\|/g, "\\|") : safe;
  }

  if (typeof value === "object" && value !== null) {
    if ("formattedDate" in value) {
      return formatWithConfidence(value.formattedDate, value.confidenceScore, {
        citation: citationOverride || extractCitation(value),
        inTable,
      });
    }

    if ("value" in value) {
      return formatWithConfidence(value.value, value.confidenceScore, {
        citation: citationOverride || extractCitation(value),
        inTable,
      });
    }

    if ("valueFromDocument" in value) {
      return formatWithConfidence(
        value.valueFromDocument,
        value.confidenceScore,
        { citation: citationOverride || extractCitation(value), inTable }
      );
    }

    if ("formattedValue" in value) {
      return formatWithConfidence(value.formattedValue, value.confidenceScore, {
        citation: citationOverride || extractCitation(value),
        inTable,
      });
    }

    return "[Complex Object]";
  }

  return String(value);
}

function formatWithConfidence(value, confidenceScore, opts = {}) {
  const { citation = null, inTable = false } = opts;
  let displayValue = String(value).replace(/\n+/g, " ").trim();

  if (value === null || value === undefined || !displayValue) return "N/A";

  const safeDisplayValue = escapeHtml(displayValue);
  const shownValue = inTable
    ? safeDisplayValue.replace(/\|/g, "\\|")
    : safeDisplayValue;

  if (confidenceScore === null || confidenceScore === undefined) {
    return citation ? wrapWithCitationSpan(shownValue, citation) : shownValue;
  }

  // Keep the confidence marker INSIDE the citation span so hover on the badge
  // doesn't clear the citation highlight.
  const withConfidence = `${shownValue} {{conf~${confidenceScore}}}`;
  return citation
    ? wrapWithCitationSpan(withConfidence, citation)
    : withConfidence;
}

/**
 * Extract normalized source data from various formats:
 * - Old format: { text_bbox, page_no, image_width, image_height }
 * - New format: { bbox, image_width, image_height } (no page_no, defaults to 1)
 * - Or sources as array of the above
 */
function normalizeSourceData(sourceObj) {
  if (!sourceObj) return null;

  // Check if it's old format with text_bbox
  if (sourceObj.text_bbox && Array.isArray(sourceObj.text_bbox) && sourceObj.text_bbox.length === 4) {
    return {
      bbox: sourceObj.text_bbox,
      pageNo: sourceObj.page_no || 1,
      imageWidth: sourceObj.image_width,
      imageHeight: sourceObj.image_height,
    };
  }

  // Check if it's new format with bbox directly
  if (sourceObj.bbox && Array.isArray(sourceObj.bbox) && sourceObj.bbox.length === 4) {
    return {
      bbox: sourceObj.bbox,
      pageNo: sourceObj.page_no || 1,
      imageWidth: sourceObj.image_width,
      imageHeight: sourceObj.image_height,
    };
  }

  return null;
}

function extractCitationFromSource(sourceData) {
  const normalized = normalizeSourceData(sourceData);
  if (!normalized) return null;

  return {
    pageIndex: Math.max(0, Number(normalized.pageNo) - 1),
    bbox: autoDetectAndNormalize(
      normalized.bbox,
      normalized.imageWidth,
      normalized.imageHeight
    ),
  };
}

function extractCitation(valueObj) {
  if (!valueObj) return null;

  // Try old format: grounding object
  if (valueObj.grounding && typeof valueObj.grounding === "object") {
    const citation = extractCitationFromSource(valueObj.grounding);
    if (citation) return citation;
  }

  // Try new format: sources (can be object or array)
  if (valueObj.sources) {
    const src = Array.isArray(valueObj.sources)
      ? valueObj.sources[0]
      : valueObj.sources;
    const citation = extractCitationFromSource(src);
    if (citation) return citation;
  }

  return null;
}

function extractCitationFromRow(rowObj) {
  if (!rowObj) return null;

  // Try old format: grounding object on the row itself
  if (rowObj.grounding && typeof rowObj.grounding === "object") {
    const citation = extractCitationFromSource(rowObj.grounding);
    if (citation) return citation;
  }

  // Try new format: sources array/object on the row
  if (rowObj.sources) {
    const src = Array.isArray(rowObj.sources)
      ? rowObj.sources[0]
      : rowObj.sources;
    const citation = extractCitationFromSource(src);
    if (citation) return citation;
  }

  return null;
}

function wrapWithCitationSpan(htmlSafeText, citation) {
  const payload = encodeURIComponent(
    JSON.stringify({
      pageIndex: citation.pageIndex,
      bbox: citation.bbox,
    })
  );
  const title = "View citation";
  // NOTE: Tailwind classes are inlined here so we don't rely on custom CSS injection.
  // Keep `citation-value` for event delegation (hover handling).
  const tw =
    "citation-value inline-block box-decoration-clone underline decoration-dashed underline-offset-4 " +
    "decoration-slate-400/70 dark:decoration-slate-500/70 hover:decoration-slate-600 dark:hover:decoration-slate-300 " +
    "cursor-pointer rounded px-0.5 -mx-0.5 transition-colors duration-150 ease-out";

  return `<span class="${tw}" data-citation="${payload}" title="${escapeHtml(
    title
  )}">${htmlSafeText}</span>`;
}
