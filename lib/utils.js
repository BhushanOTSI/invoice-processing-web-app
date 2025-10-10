import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { isNullish } from "remeda";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function humanizeDateTime(date) {
  return format(new Date(date), "dd MMM yyyy HH:mm", {
    dateStyle: "medium",
    timeStyle: "short",
    locale: enUS,
  });
}

export function isValidValue(value) {
  if (isNullish(value)) return false;

  const invalidStrings = [
    "",
    "undefined",
    "null",
    "NaN",
    "Infinity",
    "-Infinity",
  ];
  return !invalidStrings.includes(String(value).trim());
}

export function humanizeFileSize(size) {
  if (size < 1024) {
    return `${size} B`;
  }
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(2)} KB`;
  }
  return `${(size / 1024 / 1024).toFixed(2)} MB`;
}
