import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { isNullish } from "remeda";
import {
  intervalToDuration,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subDays,
  subMonths,
  format,
} from "date-fns";
import { formatInTimeZone } from "date-fns-tz";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function humanizeDateTime(date) {
  if (!date) return null;

  // Check if the date string already has timezone info (Z, +XX:XX, or -XX:XX)
  const hasTimezone = /[Z\+\-]\d{2}:\d{2}$|Z$/.test(date);

  // Only append 'Z' if there's no timezone info
  const dateString = hasTimezone ? date : date + "Z";
  const utcDate = new Date(dateString);
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return formatInTimeZone(utcDate, tz, "dd MMM yy, h:mm a");
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

  if (totalSeconds < 1) {
    const ms = Math.round(totalSeconds * 1000);
    return `${ms}ms`;
  }

  const duration = intervalToDuration({
    start: 0,
    end: totalSeconds * 1000,
  });

  const h = duration.hours ?? 0;
  const m = duration.minutes ?? 0;
  const s = duration.seconds ?? 0;

  if (h === 0 && m === 0 && totalSeconds < 60) {
    return `${totalSeconds.toFixed(3)}s`;
  }

  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  if (m > 0 && s > 0) return `${m}m ${s}s`;
  if (m > 0) return `${m}m`;

  return `${s}s`;
}

export function getDateRange(type = "last-7-days") {
  const now = new Date();
  let from, to;

  switch (type) {
    case "last-7-days":
      from = subDays(now, 7);
      to = now;
      break;
    case "last-30-days":
      from = subDays(now, 30);
      to = now;
      break;
    case "this-month":
      from = startOfMonth(now);
      to = endOfMonth(now);
      break;
    case "this-year":
      from = startOfYear(now);
      to = endOfYear(now);
      break;
    case "last-6-months":
      from = subMonths(now, 6);
      to = now;
      break;
    default:
      from = subDays(now, 7);
      to = now;
  }

  return {
    from: formatDate(from),
    to: formatDate(to),
  };
}

export function formatDate(date) {
  return format(date, "yyyy-MM-dd'T'HH:mm");
}

export function alwaysArray(value) {
  if (typeof value === "string") {
    value = value.split(",");
  }

  if (!Array.isArray(value)) {
    return [];
  }

  return value.reduce((acc, curr) => {
    return [...acc, ...(curr || "").split(",")].filter(Boolean);
  }, []);
}
