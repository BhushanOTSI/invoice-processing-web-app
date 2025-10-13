import { useQuery } from "@tanstack/react-query";
import { BaseAPI } from "../api/baseAPI";

export const useLoadJsonFromUrl = (url) => {
  return useQuery({
    queryKey: ["loadJsonFromUrl", url],
    queryFn: () => BaseAPI?.get(url),
    enabled: !!url,
  });
};
