"use client";

import { useBreadcrumb } from "@/app/providers/breadcrumb-provider";
import { useEffect } from "react";

export function useSetBreadcrumbs(items = []) {
  const breadcrumbs = useBreadcrumb();

  useEffect(() => {
    breadcrumbs.dispatch({ type: "SET_BREADCRUMB", payload: items });
  }, []);

  return breadcrumbs;
}
