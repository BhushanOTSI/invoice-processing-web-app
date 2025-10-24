"use client";

import React, { useMemo, useCallback } from "react";
import { useFilter } from "@/app/providers/filter-provider";
import { useSetSearchParams } from "@/hooks/use-set-search-params";
import { alwaysArray, humanizeDateTime } from "@/lib/utils";
import FilterSummaryBlock from "@/components/common/filter-summary-block";

export default function FilterSummary() {
    const { filters, handleSetFilters, setOpen, setActiveTab } = useFilter();
    const { params = {}, updateParams } = useSetSearchParams();
    const statusArray = useMemo(() => alwaysArray(params?.status || []), [params?.status]);
    const fileList = useMemo(() => alwaysArray(params?.filename || []), [params?.filename]);

    const statusFirst = statusArray[0];
    const statusMore = statusArray.length > 1 ? `+${statusArray.length - 1}` : null;

    const othersArray = useMemo(() => [params?.batchNo, ...fileList].filter(Boolean), [params?.batchNo, fileList]);
    const othersFirst = othersArray[0];
    const othersMore = othersArray.length > 1 ? `+${othersArray.length - 1}` : null;

    const hasAppliedDate = Boolean(params?.from && params?.to);
    const hasAppliedStatus = statusArray.length > 0;
    const hasAppliedOthers = othersArray.length > 0;
    const hasAnyApplied = hasAppliedDate || hasAppliedStatus || hasAppliedOthers;

    // stable callbacks for clearing filters
    const clearStatus = useCallback(() => {
        handleSetFilters("status", null);
        updateParams({ status: null });
    }, [handleSetFilters, updateParams]);

    const clearDate = useCallback(() => {
        handleSetFilters("from", null);
        handleSetFilters("to", null);
        updateParams({ from: null, to: null });
    }, [handleSetFilters, updateParams]);

    const clearOthers = useCallback(() => {
        handleSetFilters("batchNo", null);
        handleSetFilters("filename", null);
        updateParams({ batchNo: null, filename: null });
    }, [handleSetFilters, updateParams]);

    const openTab = useCallback(
        (tab) => () => {
            setActiveTab(tab);
            setOpen(true);
        },
        [setActiveTab, setOpen]
    );

    if (!hasAnyApplied) return null;


    const fromText = params?.from ? humanizeDateTime(params.from) : null;
    const toText = params?.to ? humanizeDateTime(params.to) : null;

    return (
        <div className="" aria-live="polite">
            <div className="flex gap-2 items-start">
                {hasAppliedDate && fromText && toText && (
                    <FilterSummaryBlock
                        title="Date"
                        value={`${fromText} - ${toText}`}
                        onClear={clearDate}
                        onEdit={openTab("date-range")}
                        onClick={openTab("date-range")}
                        ariaClearLabel="Clear date filter"
                        ariaEditLabel="Edit date filter"
                    />
                )}

                {statusArray.length > 0 && (
                    <FilterSummaryBlock
                        title="Status"
                        value={`${statusFirst}`}
                        moreLabel={statusMore}
                        onClear={clearStatus}
                        onEdit={openTab("status")}
                        onClick={openTab("status")}
                        ariaClearLabel="Clear status filter"
                        ariaEditLabel="Edit status filter"
                    />
                )}

                {othersArray.length > 0 && (
                    <FilterSummaryBlock
                        title="Others"
                        value={`${othersFirst}`}
                        moreLabel={othersMore}
                        onClear={clearOthers}
                        onEdit={openTab("other")}
                        onClick={openTab("other")}
                        ariaClearLabel="Clear others filter"
                        ariaEditLabel="Edit others filter"
                    />
                )}
            </div>
        </div>
    );
}
