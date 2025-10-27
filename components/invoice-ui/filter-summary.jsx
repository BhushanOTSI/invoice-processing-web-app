"use client";

import { useMemo } from "react";
import { useFilter } from "@/app/providers/filter-provider";
import { useSetSearchParams } from "@/hooks/use-set-search-params";
import { alwaysArray, humanizeDateTime } from "@/lib/utils";
import FilterChip from "@/components/common/filter-chip";

export default function FilterSummary({ className = "flex gap-2 items-start" }) {
    const { handleSetFilters, setOpen, setActiveTab } = useFilter();
    const { params = {}, updateParams } = useSetSearchParams();
    const filters = useMemo(() => {
        const status = alwaysArray(params?.status || []);
        const others = [params?.batchNo, ...alwaysArray(params?.filename || [])].filter(Boolean);
        return [
            params?.from && params?.to && { title: "Date", value: `${humanizeDateTime(params.from)} - ${humanizeDateTime(params.to)}`, tab: "date-range", clear: () => { handleSetFilters("from", null); handleSetFilters("to", null); updateParams({ from: null, to: null }); } },
            status.length > 0 && { title: "Status", value: status[0], moreLabel: status.length > 1 ? `+${status.length - 1}` : null, tab: "status", clear: () => { handleSetFilters("status", null); updateParams({ status: null }); } },
            others.length > 0 && { title: "Others", value: others[0], moreLabel: others.length > 1 ? `+${others.length - 1}` : null, tab: "other", clear: () => { handleSetFilters("batchNo", null); handleSetFilters("filename", null); updateParams({ batchNo: null, filename: null }); } }
        ].filter(Boolean);
    }, [params, handleSetFilters, updateParams]);

    return filters.length > 0 && (
        <div className={className}>
            {filters.map(({ title, value, moreLabel, tab, clear }) => (
                <FilterChip
                    key={title}
                    title={title}
                    value={value}
                    moreLabel={moreLabel}
                    onClear={clear}
                    onEdit={() => { setActiveTab(tab); setOpen(true); }}
                />
            ))}
        </div>
    );
}
