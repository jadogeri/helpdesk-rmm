import { useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@repo/constants";
import { QUERY_KEYS } from "./queryKeys";
import { apiFetcher } from "../utils/fetcher";

export function useTicketCustomStatuses() {
  return useQuery({
    queryKey: QUERY_KEYS.ticketCustomStatus.all,
    queryFn: () => apiFetcher<any[]>(API_ENDPOINTS.PROXY.TICKET_CUSTOM_STATUSES.BASE),
  });
}
