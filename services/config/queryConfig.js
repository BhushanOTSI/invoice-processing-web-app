export const QUERY_CONFIG = {
  retry: (failureCount, error) => {
    if (error?.status >= 400 && error?.status < 500) {
      return false;
    }

    return failureCount < 2;
  },
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  staleTime: 5 * 60 * 1000,
  gcTime: 10 * 60 * 1000,
  refetchOnWindowFocus: true,
  refetchOnMount: true,
  refetchOnReconnect: true,
};
