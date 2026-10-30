// frontend/app/ticket-portal/queries/useIssueTypeQueries.ts
import { API_ENDPOINTS } from "@repo/constants";
import { apiFetcher } from "../utils/fetcher";
import { IIssueType } from "@repo/types";
import { QUERY_KEYS } from "./queryKeys";
import { useQuery } from "@tanstack/react-query";

// GET /issue-types
export function useIssueTypes() {
  return useQuery({
    queryKey: QUERY_KEYS.issueTypes.all,
    queryFn: () => apiFetcher<IIssueType[]>(API_ENDPOINTS.PROXY.ISSUE_TYPES.BASE),
  });
}
