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

  const po = get("charge_account");
  md += `## Charge Account
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
