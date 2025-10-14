"use client";

import { useSetSearchParams } from "@/hooks/use-set-search-params";
import { createContext, useCallback, useContext, useState } from "react";

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

  const filterCount = Object.values(filters).filter(Boolean).length;
  return (
    <Context.Provider
      value={{
        filters,
        handleSetFilters,
        handleResetFilters,
        open,
        setOpen,
        onApply: useCallback(() => {
          updateParams(filters);
          setOpen(false);
        }, [filters]),
        onClose,
        hasFilters: filterCount > 0,
        filterCount,
      }}
    >
      {children}
    </Context.Provider>
  );
}
