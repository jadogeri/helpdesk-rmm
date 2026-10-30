// frontend/app/ticket-portal/queries/useUserQueries.ts
import { useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@repo/constants";
import { apiFetcher } from "../utils/fetcher";
import type { IUser } from "@repo/types";
import { QUERY_KEYS } from "./queryKeys";

// GET /users
export function useUsers() {
  return useQuery({
    queryKey: QUERY_KEYS.users.all,
    queryFn: () => apiFetcher<IUser[]>(API_ENDPOINTS.PROXY.USERS.BASE),
  });
}

// GET /users/search?email=...
export function useSearchUser(email: string) {
  return useQuery({
    queryKey: QUERY_KEYS.users.search(email),
    queryFn: () => apiFetcher<any>(`${API_ENDPOINTS.PROXY.USERS.SEARCH}?email=${encodeURIComponent(email)}`),
    enabled: !!email && email.includes("@"), // Run evaluation exclusively when format validation passes
  });
}

