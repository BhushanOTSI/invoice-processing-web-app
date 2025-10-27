"use client";

import { alwaysArray } from "@/lib/utils";
import { X, Edit3 } from "lucide-react";
import { capitalize } from "remeda";

export default function FilterChip({ title, value, onClear, onEdit }) {
  const dataValue = alwaysArray(value);
  if (dataValue.length === 0) return null;

  return (
    <div
      className={`max-w-54 rounded-md border px-2 py-1 text-xs flex items-center justify-between gap-2 overflow-hidden`}
    >
      <div className="flex-1 min-w-0 ">
        <div className="text-xxs text-muted-foreground">{title}</div>
        <div className="truncate text-xs flex items-center gap-1">
          {capitalize(dataValue?.[0])}
          {dataValue.length > 1 && <strong>+{dataValue.length - 1}</strong>}
        </div>
      </div>
      <div className="flex items-center ">
        {onClear && (
          <button
            onClick={() => {
              onClear();
            }}
            className="p-1 text-muted-foreground hover:text-foreground"
            type="button"
          >
            <X className="size-3" />
          </button>
        )}
        {onEdit && (
          <button
            onClick={() => {
              onEdit();
            }}
            className="p-1 text-muted-foreground hover:text-foreground"
            type="button"
          >
            <Edit3 className="size-3" />
          </button>
        )}
      </div>
    </div>
  );
}
