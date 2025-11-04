import { useQuery } from "@tanstack/react-query";
import { InvoiceAPI } from "../api/invoiceAPI";
import { PROCESS_STATUS } from "@/app/constants";
import { isCompletedProcessing } from "@/lib/utils";

export const useInvoiceTrace = (filters = {}) => {
  return useQuery({
    queryKey: [...["trace", "invoices"], filters],
    queryFn: () => InvoiceAPI.getAllInvoices(filters),
  });
};

export const useInvoiceDetails = (id) => {
  return useQuery({
    queryKey: ["trace", "invoice", id],
    queryFn: () => InvoiceAPI.getInvoiceDetails(id),
    enabled: !!id,
  });
};

export const useProcessTraceStatus = (processID) => {
  return useQuery({
    queryKey: ["trace", "process", processID],
    queryFn: () => InvoiceAPI.getProcessTraceStatus(processID),
    enabled: !!processID,
    staleTime: 0,
    refetchInterval: ({ state }) => {
      if (
        state?.status === PROCESS_STATUS.FAILED ||
        isCompletedProcessing(state.data?.status, true)
      ) {
        return false;
      }

      return 5000;
    },
  });
};

export const useProcessTraceDag = (processID, enabled = true) => {
  return useQuery({
    queryKey: ["trace", "process", processID, "dag"],
    queryFn: () => InvoiceAPI.getProcessTraceDag(processID),
    enabled: !!processID && enabled,
    refetchInterval: ({ state }) => {
      const status = state?.data?.data?.dag_metadata?.status;
      if (isCompletedProcessing(status, true)) return false;

      return 5000;
    },
    retry: false,
  });
};
