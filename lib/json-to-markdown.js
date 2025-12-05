import { toTitleCase } from "remeda";

export function jsonToMarkdown(data, indent = 0) {
  const space = "  ".repeat(indent);
  let md = "";

  if (Array.isArray(data)) {
    if (data.length === 0) return `${space}- N/A\n`;

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
      md += `\n${space}${header}\n${space}${divider}\n${rows
        .map((r) => space + r)
        .join("\n")}\n\n`;
    } else {
      for (const item of data) {
        if (typeof item === "object" && item !== null) {
          md += `${space}-\n${jsonToMarkdown(item, indent + 1)}`;
        } else {
          md += `${space}- ${formatValue(item)}\n`;
        }
      }
    }
  } else if (typeof data === "object" && data !== null) {
    for (const [key, value] of Object.entries(data)) {
      if (Array.isArray(value)) {
        md += `${space}- **${toTitleCase(key)}:**\n${jsonToMarkdown(
          value,
          indent + 1
        )}`;
      } else if (typeof value === "object" && value !== null) {
        const hasValueStructure =
          "value" in value ||
          "formattedValue" in value ||
          "formattedDate" in value ||
          "valueFromDocument" in value;

        if (hasValueStructure && "confidenceScore" in value) {
          md += `${space}- **${toTitleCase(key)}:** ${formatValue(value)}\n`;
        } else {
          md += `${space}- **${toTitleCase(key)}:**\n${jsonToMarkdown(
            value,
            indent + 1
          )}`;
        }
      } else {
        md += `${space}- **${toTitleCase(key)}:** ${formatValue(value)}\n`;
      }
    }
  } else {
    md += `${space}- ${formatValue(data)}\n`;
  }

  return md;
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
  if (value === null || value === undefined) return "N/A";

  const displayValue = String(value).replace(/\n+/g, "<br/>").trim();

  if (confidenceScore === null || confidenceScore === undefined) {
    return displayValue;
  }

  return `${displayValue} <span class="text-xs border bg-green-50 text-green-900 border-green-300 rounded-sm p-px px-1" title="Confidence Score">${confidenceScore}</span>`;
}
