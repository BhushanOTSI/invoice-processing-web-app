import { useQuery } from "@tanstack/react-query";
import { InvoiceAPI } from "../api/invoiceAPI";
import { PROCESS_STATUS } from "@/app/constants";

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

export const useProcessTraceStatus = (processID) => {
  return useQuery({
    queryKey: ["trace", "process", processID],
    queryFn: () => InvoiceAPI?.getProcessTraceStatus(processID),
    enabled: !!processID,
    refetchInterval: ({ state }) => {
      if (
        state?.status === PROCESS_STATUS.FAILED ||
        state.data?.status === PROCESS_STATUS.COMPLETED ||
        state.data?.status === PROCESS_STATUS.CANCELLED ||
        state.data?.status === PROCESS_STATUS.FAILED ||
        state.data?.status === PROCESS_STATUS.PENDING
      ) {
        return false;
      }

      return 5000;
    },
  });
};
