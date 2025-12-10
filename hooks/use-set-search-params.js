"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useCallback } from "react";

/**
 * Sets one or more search params if missing, or removes them if value is null/undefined.
 * @example
 * setParamsIfMissing({ batch: '123', section: 'overview' });
 * setParamsIfMissing({ batch: null }); // removes 'batch' param
 */
export const useSetSearchParams = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const setParamsIfMissing = useCallback(
    (paramsToSet, type = "keymissing") => {
      const current = new URLSearchParams(searchParams.toString());
      let updated = false;

      Object.entries(paramsToSet).forEach(([key, value]) => {
        const hasParam = current.has(key);
        const currentValue = current.get(key);

        // Convert array values to comma-separated string
        let finalValue = value;
        if (Array.isArray(finalValue)) {
          finalValue = finalValue.join(",");
        }

        // Convert to string for comparison
        const valueStr = finalValue != null ? String(finalValue) : null;
        const currentStr = currentValue != null ? String(currentValue) : null;

        if (valueStr == null && hasParam) {
          // Remove parameter if value is null/undefined
          current.delete(key);
          updated = true;
        } else if (valueStr != null && !hasParam) {
          // Add parameter if it doesn't exist
          current.set(key, valueStr);
          updated = true;
        } else if (
          type === "update" &&
          valueStr != null &&
          currentStr !== valueStr
        ) {
          // Update parameter if in update mode and value is different
          current.set(key, valueStr);
          updated = true;
        }
      });

      if (updated) {
        const newUrl = current.toString()
          ? `?${current.toString()}`
          : window.location.pathname;
        router.replace(newUrl, { scroll: false });
      }
    },
    [searchParams, router]
  );

  const resetParams = useCallback(
    (newParams = {}) => {
      const updated = new URLSearchParams();

      Object.entries(newParams).forEach(([key, value]) => {
        if (value != null) {
          updated.set(key, value);
        }
      });

      router.replace(`?${updated.toString()}`, { scroll: false });
    },
    [router]
  );

  return {
    setParams: setParamsIfMissing,
    updateParams: (params) => setParamsIfMissing(params, "update"),
    searchParams,
    resetParams,
    params: Object.fromEntries(searchParams.entries()),
  };
};
