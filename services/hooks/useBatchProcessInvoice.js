import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BatchProcessInvoiceAPI } from "../api/batch-process-invoice";
import { toast } from "sonner";

export const useBatchProcessInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params) => BatchProcessInvoiceAPI?.batchProcessInvoice(params),
    onSuccess: (data) => {
      queryClient?.setQueryData(
        ["batchProcessInvoice", "status", data?.batchNo],
        data
      );
    },
    onError: (error) => {
      toast.error(
        <div>
          <div>Batch processing failed</div>
          <div>{error?.message}</div>
        </div>
      );
    },
    retry: () => {
      return false;
    },
  });
};

export const useBatchDetails = (batchID) => {
  return useQuery({
    queryKey: ["batch", "details", batchID],
    queryFn: () => BatchProcessInvoiceAPI?.getBatchDetails(batchID),
    enabled: !!batchID,
    refetchInterval: ({ state }) => {
      if (state?.status === "failed" || state.data?.status === "completed") {
        return false;
      }

      return 10000;
    },
  });
};

export const useTraces = (filters = {}) => {
  return useQuery({
    queryKey: ["batch", "traces", ...Object.values(filters)],
    queryFn: () => BatchProcessInvoiceAPI?.getTraces(filters),
  });
};

export const useProcessingStream = (
  processId,
  enabled = false,
  options = {}
) => {
  return useQuery({
    queryKey: ["processInvoice", "stream", processId],
    queryFn: async () => {
      return await BatchProcessInvoiceAPI?.getProcessingStream(
        processId,
        options
      );
    },
    enabled: enabled && !!processId,
    refetchInterval: false,
  });
};
