"use client";

import React from "react";
import { X, Edit3 } from "lucide-react";
export default function FilterSummaryBlock({
    title,
    value,
    moreLabel,
    onClear,
    onEdit,
    onClick,
    ariaClearLabel = "Clear filter",
    ariaEditLabel = "Edit filter",
    classNames = {},
}) {
    const cls = {
        container: classNames.container || "min-w-0 max-w-[10rem] inline-block",
        wrapper: classNames.wrapper || "rounded-md border px-2 py-1 text-xs flex items-center justify-between gap-2 overflow-hidden",
        clickable: classNames.clickable || "cursor-pointer",
        title: classNames.title || "text-xxs text-muted-foreground",
        value: classNames.value || "truncate text-xs",
        iconsWrapper: classNames.iconsWrapper || "flex items-center gap-1",
        iconButton: classNames.iconButton || "p-1 text-muted-foreground hover:text-foreground",
        iconSize: classNames.iconSize || "size-4",
    };

    return (
        <div className={cls.container}>
            <div
                role={onClick ? "button" : undefined}
                tabIndex={onClick ? 0 : undefined}
                onClick={onClick}
                onKeyDown={(e) => {
                    if (onClick && (e.key === "Enter" || e.key === " ")) {
                        onClick();
                    }
                }}
                className={`${cls.wrapper} ${onClick ? cls.clickable : ""}`}
            >
                <div className="flex-1 min-w-0">
                    <div className={cls.title}>{title}</div>
                    <div className={`${cls.value} whitespace-nowrap truncate`}>{value}{moreLabel ? ` ${moreLabel}` : ""}</div>
                </div>
                <div className={cls.iconsWrapper} onClick={(e) => e.stopPropagation()}>
                    <button type="button" onClick={(e) => { e.stopPropagation(); onClear && onClear(); }} className={cls.iconButton} aria-label={ariaClearLabel}>
                        <X className={cls.iconSize} />
                    </button>
                    <button type="button" onClick={(e) => { e.stopPropagation(); onEdit && onEdit(); }} className={cls.iconButton} aria-label={ariaEditLabel}>
                        <Edit3 className={cls.iconSize} />
                    </button>
                </div>
            </div>
        </div>
    );
}
