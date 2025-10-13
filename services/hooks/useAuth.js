"use client";

import { useMutation } from "@tanstack/react-query";
import { AuthAPI } from "../api/auth";
import { BaseAPI } from "../api/baseAPI";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { APP_ROUTES } from "@/app/constants/app-routes";

export const useAuth = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: ({ username, password }) => AuthAPI.login(username, password),
    onSuccess: (data) => {
      BaseAPI.setAuthToken(data.access_token);
      router.push(APP_ROUTES.DASHBOARD);
    },
    onError: () => {
      toast.error("Invalid username or password");
    },
    retry: false,
  });
};
