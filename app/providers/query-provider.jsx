"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { QUERY_CONFIG } from "@/services/config/queryConfig";

export default function QueryProvider({ children }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient} options={QUERY_CONFIG}>
      {children}
    </QueryClientProvider>
  );
}
