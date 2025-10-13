import { useQuery } from "@tanstack/react-query";
import { DashboardAPI } from "../api/dashboardAPI";

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: DashboardAPI?.getDashboardStats,
  });
};

export const useRecentInvoices = () => {
  return useQuery({
    queryKey: ["dashboard", "recentInvoices"],
    queryFn: DashboardAPI?.getRecentInvoices,
    refetchInterval: 10 * 1000,
  });
};

export const useInvoiceById = (id) => {
  return useQuery({
    queryKey: ["invoices", id],
    queryFn: () => DashboardAPI?.getInvoiceById(id),
    enabled: !!id,
  });
};
