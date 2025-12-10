import { toTitleCase } from "remeda";

export function jsonToMarkdown(data, indent = 0) {
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
      const keys = Array.from(new Set(data.flatMap((obj) => Object.keys(obj))));
      const header = `| ${keys.map((k) => toTitleCase(k)).join(" | ")} |`;
      const divider = `| ${keys.map(() => "---").join(" | ")} |`;
      const rows = data.map(
        (obj) => `| ${keys.map((k) => formatValue(obj[k])).join(" | ")} |`
      );
      md += `\n${header}\n${divider}\n${rows.join("\n")}\n\n`;
    } else {
      md += `<div class="list-container-wrapper">\n`;
      for (const item of data) {
        if (typeof item === "object" && item !== null) {
          const nestedContent = jsonToMarkdown(item, indent + 1).trim();
          md += `<div class="list-item-wrapper">\n\n${nestedContent}\n\n</div>\n`;
        } else {
          md += `<div class="list-item-wrapper">${formatValue(item)}</div>\n`;
        }
      }
      md += `</div>\n\n`;
    }
  } else if (typeof data === "object" && data !== null) {
    for (const [key, value] of Object.entries(data)) {
      if (Array.isArray(value)) {
        const nestedContent = jsonToMarkdown(value, indent + 1).trim();
        const escapedTitle = escapeHtml(toTitleCase(key));
        md += `<div class="section-wrapper" data-title="${escapedTitle}">\n\n${nestedContent}\n\n</div>\n\n`;
      } else if (typeof value === "object" && value !== null) {
        const hasValueStructure =
          "value" in value ||
          "formattedValue" in value ||
          "formattedDate" in value ||
          "valueFromDocument" in value;

        if (hasValueStructure && "confidenceScore" in value) {
          const escapedKey = escapeHtml(toTitleCase(key));
          md += `<div class="kv-pair-wrapper" data-key="${escapedKey}">${formatValue(
            value
          )}</div>\n\n`;
        } else {
          const nestedContent = jsonToMarkdown(value, indent + 1).trim();
          if (nestedContent) {
            const escapedTitle = escapeHtml(toTitleCase(key));
            md += `<div class="section-wrapper" data-title="${escapedTitle}">\n\n${nestedContent}\n\n</div>\n\n`;
          }
        }
      } else {
        const escapedKey = escapeHtml(toTitleCase(key));
        md += `<div class="kv-pair-wrapper" data-key="${escapedKey}">${formatValue(
          value
        )}</div>\n\n`;
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

function formatValue(value) {
  if (value === null || value === undefined) return "N/A";
  if (Array.isArray(value) && value.length === 0) return "N/A";

  if (typeof value === "string") {
    return value.replace(/\n+/g, "<br/>").trim();
  }

  if (Array.isArray(value)) {
    if (value.some((item) => typeof item === "object" && item !== null)) {
      return `[${value.length} items]`;
    }

    return value.join(", ");
  }

  if (typeof value === "object" && value !== null) {
    if ("formattedDate" in value) {
      return formatWithConfidence(value.formattedDate, value.confidenceScore);
    }

    if ("value" in value) {
      return formatWithConfidence(value.value, value.confidenceScore);
    }

    if ("valueFromDocument" in value) {
      return formatWithConfidence(
        value.valueFromDocument,
        value.confidenceScore
      );
    }

    if ("formattedValue" in value) {
      return formatWithConfidence(value.formattedValue, value.confidenceScore);
    }

    return "[Complex Object]";
  }

  return String(value);
}

function formatWithConfidence(value, confidenceScore) {
  let displayValue = String(value).replace(/\n+/g, " ").trim();

  if (value === null || value === undefined || !displayValue) return "N/A";

  if (confidenceScore === null || confidenceScore === undefined) {
    return displayValue;
  }

  // Use a special marker with tilde to avoid markdown table pipe conflicts
  return `${displayValue} {{conf~${confidenceScore}}}`;
}
