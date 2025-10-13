import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { isNullish } from "remeda";
import { intervalToDuration } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function humanizeDateTime(date) {
  if (!date) return null;

  const utcDate = new Date(date + "Z");
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return formatInTimeZone(utcDate, tz, "dd MMM yyyy hh:mm a");
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

export function formatFractionalHoursAuto(value, unit = "hours") {
  let totalSeconds = 0;
  switch (unit) {
    case "hours":
      totalSeconds = value * 3600;
      break;
    case "minutes":
      totalSeconds = value * 60;
      break;
    case "seconds":
      totalSeconds = value;
      break;
    case "milliseconds":
      totalSeconds = value / 1000;
      break;
  }

  const duration = intervalToDuration({
    start: 0,
    end: totalSeconds * 1000,
  });

  const h = duration.hours ?? 0;
  const m = duration.minutes ?? 0;
  const s = duration.seconds ?? 0;

  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  if (m > 0 && s > 0) return `${m}m ${s}s`;
  if (m > 0) return `${m}m`;
  return `${s}s`;
}
