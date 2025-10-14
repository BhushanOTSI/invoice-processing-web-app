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

        if (Array.isArray(value)) {
          value = value.join(",");
        }

        if (value == null && hasParam) {
          current.delete(key);
          updated = true;
        } else if (
          (value != null && !hasParam) ||
          (type === "update" && `${currentValue}` !== `${value}`)
        ) {
          current.set(key, value);
          updated = true;
        }
      });

      if (updated) {
        router.replace(`?${current.toString()}`, { scroll: false });
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
    updateParams: (params, rest = false) =>
      setParamsIfMissing(params, "update", rest),
    searchParams,
    resetParams,
    params: Object.fromEntries(searchParams.entries()),
  };
};
