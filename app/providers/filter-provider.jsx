"use client";

import { useSetSearchParams } from "@/hooks/use-set-search-params";
import { createContext, useCallback, useContext, useState, useEffect } from "react";

const Context = createContext();

export function useFilter() {
  const context = useContext(Context);

  if (!context) {
    throw new Error("useFilter must be used within a FilterProvider");
  }

  return context;
}

export function FilterProvider({ children }) {
  const { params, resetParams, updateParams } = useSetSearchParams();
  const [filters, setFilters] = useState(params);
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("status");

  // keep filters in sync with URL params when not editing (popover closed)
  // this ensures clearing params via updateParams reflects in filterCount
  useEffect(() => {
    if (!open) {
      try {
        const paramsStr = JSON.stringify(params || {});
        const filtersStr = JSON.stringify(filters || {});
        if (paramsStr !== filtersStr) {
          setFilters(params);
        }
      } catch (e) {
        // fallback: set directly if serialization fails
        setFilters(params);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, open]);

  const handleSetFilters = useCallback((filterKey, filterValue) => {
    setFilters((prevFilters) => {
      let newFilters = { ...prevFilters };

      if (typeof filterKey === "object") {
        Object.keys(filterKey).forEach((key) => {
          newFilters[key] = filterKey[key] || null;
        });
      } else {
        newFilters[filterKey] = filterValue || null;
      }

      return newFilters;
    });
  }, []);

  const handleResetFilters = useCallback(() => {
    resetParams();
    setFilters({});
  }, []);

  const onClose = useCallback(() => {
    setOpen(false);
    setFilters(params);
  }, [params]);

  const applyFilters = useCallback(
    (newFilters) => {
      updateParams(newFilters);
    },
    [updateParams]
  );

  const filterCount = Object.values(filters).filter(Boolean).length;
  return (
    <Context.Provider
      value={{
        filters,
        handleSetFilters,
        handleResetFilters,
        open,
        setOpen,
        activeTab,
        setActiveTab,
        onApply: useCallback(() => {
          updateParams(filters);
          setOpen(false);
        }, [filters]),
        applyFilters,
        onClose,
        hasFilters: filterCount > 0,
        filterCount,
      }}
    >
      {children}
    </Context.Provider>
  );
}
