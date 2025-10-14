"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { BaseAPI } from "@/services/api/baseAPI";
import { isValidValue } from "@/lib/utils";
import { APP_ROUTES } from "@/app/constants/app-routes";

export default function ProtectedRoutes({ children }) {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = BaseAPI.getAuthToken();
    if (!isValidValue(token)) {
      router.replace(APP_ROUTES.LOGIN);
    }
  }, []);

  return <>{children}</>;
}
