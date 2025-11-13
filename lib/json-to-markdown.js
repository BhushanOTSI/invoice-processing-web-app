import { capitalize, toCamelCase, toTitleCase } from "remeda";

export function invoiceJsonToMarkdown(data) {
  const safe = (v, fallback = "") =>
    v === null || v === undefined ? fallback : v;
  const yesNo = (v) => {
    if (typeof v === "boolean") return v ? "Yes" : "No";
    if (typeof v === "string")
      return v.trim().toLowerCase() === "yes" ? "Yes" : v;
    return safe(v, "");
  };
  const upper = (v) => (typeof v === "string" ? v.toUpperCase() : safe(v, ""));
  const title = (v) => (typeof v === "string" ? v.trim() : "");
  const stripEllipsis = (v) =>
    typeof v === "string" ? v.replace(/\s*\.\.\.$/, "").trim() : safe(v, "");
  const fmtMoney = (num, ccy) =>
    `${Number(num ?? 0).toFixed(2)}${ccy ? " " + ccy : ""}`;
  const escapePipes = (s) => String(s ?? "").replace(/\|/g, "\\|");
  const joinArr = (arr) =>
    Array.isArray(arr) ? arr.join(", ") : safe(arr, "");
  const currency = safe(
    data.document_currency || data.raw_invoice?.document_currency || ""
  ).toUpperCase();
  const lang = safe(
    data.document_language || data.raw_invoice?.document_language || ""
  ).toUpperCase();

  const src = data || {};
  const raw = src.raw_invoice || {};

  const get = (k) => safe(src[k], raw[k]) || "N/A";

  let md = `# Invoice Details
  
  **Document Kind:** ${yesNo(get("document_kind"))}  
  **Document Number:** ${title(get("DocumentNumber"))}  
  **Issue Date:** ${title(get("issue_date"))}  
  **Sale Date:** ${title(get("sale_date"))}  
  **Due Date:** ${title(get("due_date"))}  
  **Document Currency:** ${currency || ""}  
  **Document Language:** ${lang || ""}  
  **Charge Account:** ${title(get("charge_account"))}  
  `;

  const supplier = get("supplier") || {};
  const buyer = get("buyer") || {};
  const recipient = get("recipient") || {};

  md += `## Supplier
  - **Name:** ${title(supplier.name)}  
  - **Country:** ${upper(supplier.country)}  
  
  ## Buyer
  - **Name:** ${stripEllipsis(title(buyer.name))}  
  - **Country:** ${upper(buyer.country)}  
  
  ## Recipient
  - **Name:** ${stripEllipsis(title(recipient.name))}  
  - **Country:** ${upper(recipient.country)}  
  
  `;

  const po = get("po_number");
  md += `## PO Details
  - **PO Number:** ${title(po)}  
  `;

  // ----- totals -----
  const totalNet = get("total_net");
  const totalVat = get("total_vat");
  const totalGross = get("total_gross");

  md += `## Totals
  - **Total Net:** ${fmtMoney(totalNet, currency)}  
  - **Total VAT:** ${fmtMoney(totalVat, currency)}  
  - **Total Gross:** ${fmtMoney(totalGross, currency)}  
  
  `;

  const notes = get("notes");
  if (notes) {
    md += `## Notes
  ${title(notes)}
  
  `;
  }

  const emails = get("emails");
  if (Array.isArray(emails) && emails.length) {
    md += `## Emails
  `;
    emails.forEach((e, idx) => {
      md += `${idx + 1}. **Sender:** ${title(e.sender)}  
     **Sent At:** ${title(e.sent_at)}  
     **To:** ${joinArr(e.to)}  
     **Subject:** ${title(e.subject)}  
     **Body Preview:** ${title(e.body_preview)}
    
  `;
    });
  }

  // ----- ordinary items table -----
  const items = get("ordinary_items");
  if (Array.isArray(items) && items.length) {
    md += `## Ordinary Items
  | Line No | Description | Quantity | Unit Price Net | Value Net | Value Gross |
  |---------|-------------|----------|----------------|-----------|-------------|
  `;
    items.forEach((it) => {
      md += `| ${safe(it.line_no)} | ${escapePipes(
        title(it.description)
      )} | ${safe(it.quantity)} | ${safe(it.unit_price_net)} | ${safe(
        it.value_net
      )} | ${safe(it.value_gross)} |
  `;
    });
    md += "\n";
  }

  // ----- tax items table -----
  const taxes = get("tax_items");
  if (Array.isArray(taxes) && taxes.length) {
    md += `## Tax Items
  | Line No | Description | Tax Amount | Tax Rate (%) | Ordinary Line Item Nos |
  |---------|-------------|------------|--------------|-------------------------|
  `;
    taxes.forEach((tx) => {
      const rate =
        (tx.tax_rate && (tx.tax_rate.rate_percent ?? tx.tax_rate.rate)) ?? "";
      const ord = Array.isArray(tx.ordinary_line_item_nos)
        ? tx.ordinary_line_item_nos.join(", ")
        : "";
      md += `| ${safe(tx.line_no)} | ${escapePipes(
        title(tx.description)
      )} | ${safe(tx.tax_amount)} | ${safe(rate)} | ${ord} |
  `;
    });
    md += "\n";
  }

  return md.trim() + "\n";
}

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
    if ("formattedValue" in value) {
      return formatWithConfidence(value.formattedValue, value.confidenceScore);
    }
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

    // If it's a plain object without these properties, return descriptive text
    return "[Complex Object]";
  }

  return String(value);
}

function formatWithConfidence(value, confidenceScore) {
  if (value === null || value === undefined) return "N/A";

  const displayValue = String(value);

  // If no confidence score provided, return value as-is
  if (confidenceScore === null || confidenceScore === undefined) {
    return displayValue;
  }

  const percentage = Math.round(confidenceScore * 100);

  // Determine color, icon, and styling based on confidence level
  let colorLight = "";
  let colorDark = "";
  let bgLight = "";
  let bgDark = "";
  let icon = "";

  if (percentage >= 95) {
    colorLight = "#059669"; // Green
    colorDark = "#34d399";
    bgLight = "#d1fae5"; // Light green background
    bgDark = "#065f46";
    icon = "✓";
  } else if (percentage >= 80) {
    colorLight = "#d97706"; // Amber
    colorDark = "#fbbf24";
    bgLight = "#fef3c7"; // Light amber background
    bgDark = "#78350f";
    icon = "⚠";
  } else {
    colorLight = "#dc2626"; // Red
    colorDark = "#f87171";
    bgLight = "#fee2e2"; // Light red background
    bgDark = "#7f1d1d";
    icon = "⚠⚠";
  }

  // Return value with styled confidence badge that works in both light and dark modes
  return `${displayValue} <span class="confidence-badge" style="display: inline-block; margin-left: 6px; padding: 1px 6px; background-color: ${bgLight}; color: ${colorLight}; border-radius: 3px; font-size: 0.7em; font-weight: 600; white-space: nowrap; line-height: 1.4;">${icon}${percentage}%</span>`;
}
