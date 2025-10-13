import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { isNullish } from "remeda";
import { intervalToDuration } from "date-fns";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function humanizeDateTime(date) {
  if (!date) return null;

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

export function formatFractionalHoursAuto(hours) {
  const totalSeconds = Math.round(hours * 3600);
  const duration = intervalToDuration({ start: 0, end: totalSeconds * 1000 });

  const h = duration.hours ?? 0;
  const m = duration.minutes ?? 0;
  const s = duration.seconds ?? 0;

  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  if (m > 0 && s > 0) return `${m}m ${s}s`;
  if (m > 0) return `${m}m`;
  return `${s}s`;
}
