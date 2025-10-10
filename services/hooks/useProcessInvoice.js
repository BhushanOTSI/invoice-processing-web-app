import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ProcessInvoiceAPI } from "../api/processInvoiceAPI";

export const useProcessInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, options }) =>
      ProcessInvoiceAPI?.processInvoice(file, options),
    onSuccess: (data) => {
      queryClient?.setQueryData(
        ["processInvoice", "status", data?.processId],
        data
      );
    },
    onError: (error) => {
      console.error("Processing failed:", error);
    },
    retry: () => {
      return false;
    },
  });
};

export const useProcessingStatus = (processId, options = {}) => {
  const { enabled = true, refetchInterval = 2000 } = options;

  return useQuery({
    queryKey: ["processInvoice", "status", processId],
    queryFn: () => ProcessInvoiceAPI?.getProcessingStatus(processId),
    enabled: enabled && !!processId,
    refetchInterval: ({ state }) => {
      if (
        state?.data?.status === "completed" ||
        state?.data?.status === "failed" ||
        state?.data?.status === "cancelled" ||
        state.error
      ) {
        return false;
      }

      return refetchInterval;
    },
  });
};

export const useCancelProcessing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (processId) => ProcessInvoiceAPI?.cancelProcessing(processId),
    onSuccess: (data, processId) => {
      queryClient?.setQueryData(
        ["processInvoice", "status", processId],
        (oldData) => ({
          ...oldData,
          status: "cancelled",
        })
      );
    },
    onError: (error) => {
      console.error("Cancel processing failed:", error);
    },
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
      return await ProcessInvoiceAPI?.getProcessingStream(
        processId,
        enabled,
        options
      );
    },
    enabled: enabled && !!processId,
    refetchInterval: false,
  });
};

export const useJsonToMarkdown = (json = {}, enabled = false) => {
  return useQuery({
    queryKey: ["jsonToMarkdown", json?.DocumentNumber],
    queryFn: () => ProcessInvoiceAPI?.jsonToMarkdown(json),
    enabled: enabled && !!json?.DocumentNumber,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};

export const useLoadJsonFromUrl = (url) => {
  return useQuery({
    queryKey: ["loadJsonFromUrl", url],
    queryFn: () => ProcessInvoiceAPI?.loadJsonFromUrl(url),
    enabled: !!url,
  });
};
