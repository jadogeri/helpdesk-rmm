// frontend/app/ticket-portal/queries/useCustomerQueries.ts
import { useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@repo/constants";
import { apiFetcher } from "../utils/fetcher";
import { QUERY_KEYS } from "./queryKeys"; 
import { ICustomer } from "@repo/types";

// GET /customers
export function useCustomers() {
  return useQuery({
    queryKey: QUERY_KEYS.customers.all,
    queryFn: () => apiFetcher<ICustomer[]>(API_ENDPOINTS.PROXY.CUSTOMERS.BASE),
  });
}
