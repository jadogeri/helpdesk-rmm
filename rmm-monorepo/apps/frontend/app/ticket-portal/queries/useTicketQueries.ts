// frontend/app/ticket-portal/queries/useTicketQueries.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newTicket: any) =>
      apiFetcher<any>(API_ENDPOINTS.PROXY.TICKETS.BASE, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(newTicket),
      }),
    onSuccess: () => {
      // 🔄 Target cache invalidation safely using queryKey config mapping
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tickets.all });
    },
  });
}

// PATCH /tickets/{id}
export function useUpdateTicket(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updateData: any) =>
      apiFetcher<any>(API_ENDPOINTS.PROXY.TICKETS.BY_ID(id), {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(updateData),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tickets.detail(id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tickets.all });
    },
  });
}

// DELETE /tickets/{id}
export function useDeleteTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiFetcher<any>(API_ENDPOINTS.PROXY.TICKETS.BY_ID(id), { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tickets.all });
    },
  });
}
