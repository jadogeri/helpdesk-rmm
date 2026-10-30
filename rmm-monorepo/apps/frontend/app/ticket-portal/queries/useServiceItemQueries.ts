// frontend/app/ticket-portal/queries/useServiceItemQueries.ts
import { API_ENDPOINTS } from "@repo/constants";
import { apiFetcher } from "../utils/fetcher";
import { IServiceItem } from "@repo/types";
import { QUERY_KEYS } from "./queryKeys";
import { useQuery } from "@tanstack/react-query";

// GET /service-items 
export function useServiceItems() {
  return useQuery({
    queryKey: QUERY_KEYS.serviceItems.all,
    queryFn: () => apiFetcher<IServiceItem[]>(API_ENDPOINTS.PROXY.SERVICE_ITEMS.BASE),
  });
}
