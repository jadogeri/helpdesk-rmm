// frontend/app/ticket-portal/queries/useContactQueries.ts
import { useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@repo/constants";
import { apiFetcher } from "../utils/fetcher";
import type { IContact } from "@repo/types";
import { QUERY_KEYS } from "./queryKeys";

// GET /api/contacts
export function useContacts() {
  return useQuery({
    queryKey: QUERY_KEYS.contacts.all,
    queryFn: () => apiFetcher<IContact[]>(API_ENDPOINTS.PROXY.CONTACTS.BASE),
  });
}

/**
 * GET /api/contacts/search?email=...
 * If your backend has a filter or search step for contacts, use this.
 * Otherwise, we can load all contacts and filter them inside the hook.
 */
export function useSearchContactByEmail(email: string) {
  const cleanEmail = email.trim().toLowerCase();
  
  return useQuery({
    queryKey: [...QUERY_KEYS.contacts.all, "search", cleanEmail],
    queryFn: async () => {
      // Option A: If your NestJS app has an explicit endpoint setup:
      // return await apiFetcher<IContact>(`${API_ENDPOINTS.PROXY.CONTACTS.BASE}/search?email=${encodeURIComponent(cleanEmail)}`);
      
      // Option B: Fallback (Fetches full list and filters inline for absolute reliability):
      const allContacts = await apiFetcher<IContact[]>(API_ENDPOINTS.PROXY.CONTACTS.BASE);
      console.log("All contacts fetched:", JSON.stringify(allContacts));
      return allContacts.find((c: IContact) => c.emailAddress?.toLowerCase() === cleanEmail || c.emailAddress?.toLowerCase() === cleanEmail) || null;
    },
    enabled: !!cleanEmail && cleanEmail.includes("@") && cleanEmail.length > 5,
    retry: false,
  });
}
