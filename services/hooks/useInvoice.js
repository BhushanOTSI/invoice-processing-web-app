import { useQuery } from "@tanstack/react-query";
import { InvoiceAPI } from "../api/invoiceAPI";

export const useInvoiceTrace = (filters = {}) => {
  return useQuery({
    queryKey: [...["trace", "invoices"], filters],
    queryFn: () => InvoiceAPI?.getAllInvoices(filters),
  });
};

export const useInvoiceDetails = (id) => {
  return useQuery({
    queryKey: ["trace", "invoice", id],
    queryFn: () => InvoiceAPI?.getInvoiceDetails(id),
    enabled: !!id,
  });
};
