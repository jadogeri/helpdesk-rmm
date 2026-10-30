// frontend/app/ticket-portal/queries/useTicketQueries.ts
import { useQuery, useMutation } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@repo/constants";
import { apiFetcher } from "../utils/fetcher";
import { QUERY_KEYS } from "./queryKeys"; // 👈 Import your new keys mapping

// GET /tickets
export function useTickets() {
  return useQuery({
    queryKey: QUERY_KEYS.tickets.all, // 🔄 Swapped out hardcoded string
    queryFn: () => apiFetcher<any[]>(API_ENDPOINTS.PROXY.TICKETS.BASE),
  });
}
// GET /tickets/{id}
export function useTicketDetails(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.tickets.detail(id), // 🔄 Swapped out hardcoded string
    queryFn: () => apiFetcher<any>(API_ENDPOINTS.PROXY.TICKETS.BY_ID(id)),
    enabled: !!id,
  });
}

// POST /tickets
export function useCreateTicket() {
  return useMutation({
    mutationFn: (newTicket: any) =>
      apiFetcher<any>(API_ENDPOINTS.PROXY.TICKETS.PORTAL, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(newTicket),
      }),
  });
}
