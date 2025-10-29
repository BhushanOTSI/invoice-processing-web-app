"use client";

import { APP_ROUTES } from "@/app/constants/app-routes";
import { BaseAPI } from "@/services/api/baseAPI";
import { useRouter } from "next/navigation";
import React from "react";

export function useUser() {
  const router = useRouter();
  const [isMounted, setIsMounted] = React.useState(false);
  const [username, setUsername] = React.useState("");

  React.useEffect(() => {
    const savedName = localStorage.getItem("username");
    if (savedName) setUsername(savedName);
    setIsMounted(true);
  }, []);

  return {
    user: { name: username },
    setUsername,
    isMounted,
    isLoggedIn: !!username,
    logout() {
      localStorage.removeItem("username");
      BaseAPI.clearAuthToken();
      router.push(APP_ROUTES.LOGIN);
    },
  };
}
