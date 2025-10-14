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
    queryFn: () => BatchProcessInvoiceAPI.getBatchDetails(batchID),
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
  console.log(["batch", "traces", ...Object.values(filters)]);
  return useQuery({
    queryKey: ["batch", "traces", ...Object.values(filters)],
    queryFn: () => BatchProcessInvoiceAPI.getTraces(filters),
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
      return await BatchProcessInvoiceAPI.getProcessingStream(
        processId,
        options
      );
    },
    enabled: enabled && !!processId,
    refetchInterval: false,
  });
};

export const useFetchS3Json = (s3Url, enabled = false, onJsonLoad) => {
  return useQuery({
    queryKey: ["s3Json", s3Url],
    queryFn: async () => {
      const response = await fetch(s3Url);
      if (!response.ok) {
        throw new Error(`Failed to fetch JSON from S3: ${response.statusText}`);
      }
      const json = await response.json();
      onJsonLoad?.(json);
      return json;
    },
    enabled: enabled && !!s3Url,
    retry: 2,
    staleTime: 5 * 60 * 1000,
    refetchInterval: false,
  });
};

export const useCancelBatch = (batchID) => {
  return useMutation({
    mutationFn: () => BatchProcessInvoiceAPI.cancelBatch(batchID),
    onSuccess: () => {
      toast.success("Batch cancelled successfully");
    },
    onError: (error) => {
      toast.error(error?.message);
    },
  });
};
