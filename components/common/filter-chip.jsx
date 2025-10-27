"use client";

import { X, Edit3 } from "lucide-react";

export default function FilterChip({ title, value, moreLabel, onClear, onEdit }) {
    return (
        <div

            className={`min-w-0 max-w-[10rem] rounded-md border px-2 py-1 text-xs flex items-center justify-between gap-2 overflow-hidden cursor-pointer`}
        >
            <div className="flex-1 min-w-0">
                <div className="text-xxs text-muted-foreground">{title}</div>
                <div className="truncate text-xs">{value}{moreLabel && ` ${moreLabel}`}</div>
            </div>
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                {onClear && <button onClick={(e) => { e.stopPropagation(); onClear(); }} className="p-1 text-muted-foreground hover:text-foreground"><X className="size-4" /></button>}
                {onEdit && <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-1 text-muted-foreground hover:text-foreground"><Edit3 className="size-4" /></button>}
            </div>
        </div>
    );
}
