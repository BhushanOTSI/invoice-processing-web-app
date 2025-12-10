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
  differenceInMilliseconds,
} from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { PROCESS_STATUS } from "@/app/constants";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function humanizeDateTime(date, format = "dd MMM yy, h:mm a") {
  if (!date) return null;

  const hasTimezone = /[Z\+\-]\d{2}:\d{2}$|Z$/.test(date);
  const dateString = hasTimezone ? date : date + "Z";
  const utcDate = new Date(dateString);
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return formatInTimeZone(utcDate, tz, format);
}

export function humanizeDateRange(from, to, format = "dd MMM yy") {
  if (!from || !to) return null;

  return `${humanizeDateTime(from, format)} - ${humanizeDateTime(to, format)}`;
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

export function formatTimeDifference(startTime, endTime) {
  if (!startTime || !endTime) {
    return "N/A";
  }

  try {
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);

    const diffInMs = differenceInMilliseconds(endDate, startDate);

    return formatFractionalHoursAuto(diffInMs, "milliseconds");
  } catch (error) {
    return "Invalid dates";
  }
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

export function alwaysArray(value, noValue = []) {
  if (isNullish(value)) return noValue;

  if (typeof value === "string") {
    value = value.split(",");
  }

  if (!Array.isArray(value)) {
    return noValue;
  }

  return value.reduce((acc, curr) => {
    return [...acc, ...(curr || "").split(",")].filter(Boolean);
  }, []);
}

export function isCompletedProcessing(status, includeCancelled = false) {
  const CheckStatus = [
    PROCESS_STATUS.COMPLETED,
    ...(includeCancelled ? [PROCESS_STATUS.CANCELLED] : []),
    PROCESS_STATUS.FAILED,
    PROCESS_STATUS.SUCCESS,
    PROCESS_STATUS.SKIPPED,
    PROCESS_STATUS.UPSTREAM_FAILED,
  ];

  const statuses = alwaysArray(status);

  return (
    statuses.length > 0 &&
    statuses.some((s) => CheckStatus.includes((s || "").toLowerCase()))
  );
}

export function isProcessing(status) {
  if (!status) return false;

  const CheckStatus = [
    PROCESS_STATUS.PROCESSING,
    PROCESS_STATUS.DEFERRED,
    PROCESS_STATUS.RUNNING,
  ];

  const statuses = alwaysArray(status);

  return (
    statuses.length > 0 &&
    statuses.some((s) => CheckStatus.includes((s || "").toLowerCase()))
  );
}

export function isFailedProcessing(status) {
  if (!status) return false;

  const CheckStatus = [PROCESS_STATUS.FAILED, PROCESS_STATUS.UPSTREAM_FAILED];

  const statuses = alwaysArray(status);

  return (
    statuses.length > 0 &&
    statuses.some((s) => CheckStatus.includes((s || "").toLowerCase()))
  );
}

export function isCancelledProcessing(status) {
  if (!status) return false;

  const CheckStatus = [PROCESS_STATUS.CANCELLED];

  const statuses = alwaysArray(status);

  return (
    statuses.length > 0 &&
    statuses.some((s) => CheckStatus.includes((s || "").toLowerCase()))
  );
}

export function isSkippedProcessing(status) {
  if (!status) return false;

  const CheckStatus = [PROCESS_STATUS.SKIPPED];

  const statuses = alwaysArray(status);

  return (
    statuses.length > 0 &&
    statuses.some((s) => CheckStatus.includes((s || "").toLowerCase()))
  );
}

export function isSuccessProcessing(status) {
  if (!status) return false;

  const CheckStatus = [PROCESS_STATUS.COMPLETED, PROCESS_STATUS.SUCCESS];

  const statuses = alwaysArray(status);

  return (
    statuses.length > 0 &&
    statuses.some((s) => CheckStatus.includes((s || "").toLowerCase()))
  );
}

export function isDeferredProcessing(status) {
  if (!status) return false;

  const CheckStatus = [PROCESS_STATUS.DEFERRED, PROCESS_STATUS.UP_FOR_RETRY];

  const statuses = alwaysArray(status);

  return (
    statuses.length > 0 &&
    statuses.some((s) => CheckStatus.includes((s || "").toLowerCase()))
  );
}

export function isQueuedProcessing(status) {
  if (!status) return false;

  const CheckStatus = [PROCESS_STATUS.QUEUED];

  const statuses = alwaysArray(status);

  return (
    statuses.length > 0 &&
    statuses.some((s) => CheckStatus.includes((s || "").toLowerCase()))
  );
}

export function isPendingProcessing(status) {
  if (!status) return false;

  const CheckStatus = [
    PROCESS_STATUS.PENDING,
    PROCESS_STATUS.QUEUED,
    PROCESS_STATUS.SCHEDULED,
    PROCESS_STATUS.DEFERRED,
  ];

  const statuses = alwaysArray(status);

  return (
    statuses.length > 0 &&
    statuses.some((s) => CheckStatus.includes((s || "").toLowerCase()))
  );
}
