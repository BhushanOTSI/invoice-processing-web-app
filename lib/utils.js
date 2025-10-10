import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";

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
