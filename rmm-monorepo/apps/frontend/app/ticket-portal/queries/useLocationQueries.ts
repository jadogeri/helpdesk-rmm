// frontend/app/ticket-portal/queries/useCustomerQueries.ts
import { useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@repo/constants";
import type { ILocation } from "@repo/types";
import { QUERY_KEYS } from "./queryKeys";
import { apiFetcher } from "../utils/fetcher";

// GET /locations
export function useLocations() {
  return useQuery({
    queryKey: QUERY_KEYS.locations.all,
    queryFn: () => apiFetcher<ILocation[]>(API_ENDPOINTS.PROXY.LOCATIONS.BASE),
  });
}

// GET /locations/customer
export function useLocationsByCustomer() {
  return useQuery({
    queryKey: QUERY_KEYS.locations.byCustomer,
    queryFn: () => apiFetcher<ILocation[]>(API_ENDPOINTS.PROXY.LOCATIONS.CUSTOMER),
  });
}
