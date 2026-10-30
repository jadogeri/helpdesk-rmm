// frontend/app/ticket-portal/queries/queryKeys.ts
import { API_ENDPOINTS } from "@repo/constants";

/**
 * Centralized TanStack Query cache keys built from your existing single source of truth.
 * Using constants here ensures your caching keys never go out of sync with your proxy endpoints.
 */
export const QUERY_KEYS = {
  tickets: {
    all: [API_ENDPOINTS.PROXY.TICKETS.BASE] as const,
    detail: (id: string) => [API_ENDPOINTS.PROXY.TICKETS.BASE, id] as const,
  },
  customers: {
    all: [API_ENDPOINTS.PROXY.CUSTOMERS.BASE] as const,
  },
  locations: {
    all: [API_ENDPOINTS.PROXY.LOCATIONS.BASE] as const,
    byCustomer: [API_ENDPOINTS.PROXY.LOCATIONS.CUSTOMER] as const,
  },
  users: {
    all: [API_ENDPOINTS.PROXY.USERS.BASE] as const,
    search: (email: string) => [API_ENDPOINTS.PROXY.USERS.SEARCH, email] as const,
  },
  issueTypes: {
    all: [API_ENDPOINTS.PROXY.ISSUE_TYPES.BASE] as const,
  },
  serviceItems: {
    all: [API_ENDPOINTS.PROXY.SERVICE_ITEMS.BASE] as const,
  },
  ticketCustomStatus: {
    all: [API_ENDPOINTS.PROXY.TICKET_CUSTOM_STATUSES.BASE] as const,
  },
  contacts: {
    all: [API_ENDPOINTS.PROXY.CONTACTS.BASE] as const,
  }
} as const;
