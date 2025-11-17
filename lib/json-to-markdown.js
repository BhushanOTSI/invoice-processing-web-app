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
      // Handle arrays specially
      if (Array.isArray(value)) {
        md += `${space}- **${toTitleCase(key)}:**\n${jsonToMarkdown(
          value,
          indent + 1
        )}`;
      }
      // Check if value is an object with value/confidenceScore structure
      else if (typeof value === "object" && value !== null) {
        const hasValueStructure =
          "value" in value ||
          "formattedValue" in value ||
          "formattedDate" in value ||
          "valueFromDocument" in value;

        if (hasValueStructure && "confidenceScore" in value) {
          // This is a value/confidence object, format it directly
          md += `${space}- **${toTitleCase(key)}:** ${formatValue(value)}\n`;
        } else {
          // This is a nested object, recurse into it
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
    return value.replace(/\n+/g, " ").trim();
  }

  // Handle arrays - check if they contain objects
  if (Array.isArray(value)) {
    // If array contains objects, don't try to join them
    if (value.some((item) => typeof item === "object" && item !== null)) {
      return `[${value.length} items]`;
    }
    return value.join(", ");
  }

  // Handle objects with value and confidenceScore structure
  if (typeof value === "object" && value !== null) {
    // Check for various value formats

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

    // If it's a plain object without these properties, return descriptive text
    return "[Complex Object]";
  }

  return String(value);
}

function formatWithConfidence(value, confidenceScore) {
  if (value === null || value === undefined) return "N/A";

  const displayValue = String(value).replace(/\n+/g, " ").trim();

  // If no confidence score provided, return value as-is
  if (confidenceScore === null || confidenceScore === undefined) {
    return displayValue;
  }

  const percentage = Math.round(confidenceScore * 100);

  // Determine styling based on confidence level
  let badgeClass = "";
  let icon = "";

  if (percentage >= 95) {
    badgeClass = "confidence-high";
    icon = "✓";
  } else if (percentage >= 80) {
    badgeClass = "confidence-medium";
    icon = "⚠";
  } else {
    badgeClass = "confidence-low";
    icon = "⚠⚠";
  }

  const styles = {
    high: {
      lightBg: "#d1fae5",
      lightColor: "#059669",
      darkBg: "#065f46",
      darkColor: "#34d399",
    },
    medium: {
      lightBg: "#fef3c7",
      lightColor: "#d97706",
      darkBg: "#78350f",
      darkColor: "#fbbf24",
    },
    low: {
      lightBg: "#fee2e2",
      lightColor: "#dc2626",
      darkBg: "#7f1d1d",
      darkColor: "#f87171",
    },
  };

  const styleKey =
    percentage >= 95 ? "high" : percentage >= 80 ? "medium" : "low";
  const style = styles[styleKey];

  return `${displayValue} <span class="${badgeClass}" style="display: inline-block; margin-left: 6px; padding: 2px 8px; background-color: ${style.lightBg}; color: ${style.lightColor}; border-radius: 4px; font-size: 0.75em; font-weight: 600; white-space: nowrap; line-height: 1.5;">${icon} Confidence: ${confidenceScore}</span>`;
}
