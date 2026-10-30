// packages/constants/src/endpoints.ts

export namespace API_ENDPOINTS {
  const TICKETS_BASE = 'tickets';
  const CUSTOMERS_BASE = 'customers';
  const ISSUE_TYPES_BASE = 'issue-types';
  const LOCATIONS_BASE = 'locations';
  const TICKET_CUSTOM_STATUSES_BASE = 'ticket-custom-statuses';
  const CONTACTS_BASE = 'contacts';
  const USERS_BASE = 'users';
  const SERVICE_ITEMS_BASE = 'service-items';

  /**
   * 🌐 BACKEND (UPSTREAM) ROUTES
   * Matches 1:1 with your naked NestJS root routes.
   */
  export const UPSTREAM = {
    APP: { BASE: '/' },
    COMPANY: { BASE: 'company' },
    TICKETS: {
      BASE: TICKETS_BASE,
      PORTAL: `${TICKETS_BASE}/portal`,
      TEST: `${TICKETS_BASE}/test`,
      BY_ID: (id: string) => `${TICKETS_BASE}/${id}`,
      ALL_FILTERED: `${TICKETS_BASE}?%24top=5&%24orderby=CreatedDate+desc`,
    },
    CUSTOMERS: {
      BASE: CUSTOMERS_BASE,
    },
    LOCATIONS: {
      BASE: LOCATIONS_BASE,
      CUSTOMER: `${LOCATIONS_BASE}/customer`,
    },
    ISSUE_TYPES: {
      BASE: ISSUE_TYPES_BASE,
    },
    TICKET_CUSTOM_STATUSES: {
      BASE: TICKET_CUSTOM_STATUSES_BASE,
    },
    CONTACTS: {
      BASE: CONTACTS_BASE,
      SEARCH: `${CONTACTS_BASE}/search`
    },
    USERS: {
      BASE: USERS_BASE,
      SEARCH: `${USERS_BASE}/search`,
    },
    SERVICE_ITEMS: {
      BASE: SERVICE_ITEMS_BASE,
    },
  } as const;

  /**
   * 🖥️ FRONTEND CLIENT PROXY ROUTES
   * The routes called inside React client hooks using Vercel/Next.js convention.
   */
  export const PROXY = {
    APP: { BASE: '/api/' },
    COMPANY: { BASE: '/api/company' },
    TICKETS: {
      BASE: `/api/${TICKETS_BASE}`,
      PORTAL: `/api/${TICKETS_BASE}/portal`,
      TEST: `/api/${TICKETS_BASE}/test`,
      BY_ID: (id: string) => `/api/${TICKETS_BASE}/${id}`,
      ALL_FILTERED: `/api/${TICKETS_BASE}?%24top=5&%24orderby=CreatedDate+desc`,
    },
    CUSTOMERS: {
      BASE: `/api/${CUSTOMERS_BASE}`,
    },
    LOCATIONS: {
      BASE: `/api/${LOCATIONS_BASE}`,
      CUSTOMER: `/api/${LOCATIONS_BASE}/customer`,
    },
    ISSUE_TYPES: {
      BASE: `/api/${ISSUE_TYPES_BASE}`,
    },
    TICKET_CUSTOM_STATUSES: {
      BASE: `/api/${TICKET_CUSTOM_STATUSES_BASE}`,
    },
    CONTACTS: {
      BASE: `/api/${CONTACTS_BASE}`,
      SEARCH: `/api/${CONTACTS_BASE}/search`
    },
    USERS: {
      BASE: `/api/${USERS_BASE}`,
      SEARCH: `/api/${USERS_BASE}/search`,
    },
    SERVICE_ITEMS: {
      BASE: `/api/${SERVICE_ITEMS_BASE}`,
    },
  } as const;

  /**
   * Whitelist array containing permitted collection path keys.
   * Centralizing this allows your Next.js dynamic routing proxy validation
   * to automatically recognize and authorize new data routes without manual updates.
   */
  export const PROXY_COLLECTION_ROUTES = [
    ISSUE_TYPES_BASE,
    CUSTOMERS_BASE,
    LOCATIONS_BASE,
    TICKET_CUSTOM_STATUSES_BASE,
    CONTACTS_BASE,
    USERS_BASE,
    SERVICE_ITEMS_BASE,
    TICKETS_BASE, // 👈 UNBLOCKS GET /api/tickets FROM RETURNING 404
  ] as const;
}