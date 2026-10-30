// packages/constants/src/cache-keys.ts

export type CacheKeyStore = {
  tickets: {
    all: 'tickets:all';
    portal: 'tickets:portal';
    byId: (id: string) => string;
  };
  customers: {
    all: 'customers:all';
    byId: (id: string) => string;
  };
  locations: {
    all: 'locations:all';
    byCustomerId: (customerId: string) => string;
    byId: (id: string) => string;
  };
  issueTypes: {
    all: 'issue-types:all';
    byId: (id: string) => string;
  };
  ticketCustomStatuses: {
    all: 'ticket-custom-statuses:all';
    byId: (id: string) => string;
  };
  contacts: {
    all: 'contacts:all';
    byId: (id: string) => string;
    byEmail: (email: string) => string;
    byUserId: (userId: string) => string;
  };
  users: {
    all: 'users:all';
    byId: (id: string) => string;
  };
  serviceItems: {
    all: 'service-items:all';
    byId: (id: string) => string;
  };
};

export const CacheKeys: CacheKeyStore = {
  tickets: {
    all: 'tickets:all',
    portal: 'tickets:portal',
    byId: (id) => `tickets:${id}`,
  },
  customers: {
    all: 'customers:all',
    byId: (id) => `customers:${id}`,
  },
  locations: {
    all: 'locations:all',
    byCustomerId: (customerId) => `locations:customer:${customerId}`,
    byId: (id) => `locations:${id}`,
  },
  issueTypes: {
    all: 'issue-types:all',
    byId: (id) => `issue-types:${id}`,
  },
  ticketCustomStatuses: {
    all: 'ticket-custom-statuses:all',
    byId: (id) => `ticket-custom-statuses:${id}`,
  },
  contacts: {
    all: 'contacts:all',
    byId: (id) => `contacts:${id}`,
    byEmail: (email) => `contacts:email:${email.trim().toLowerCase()}`,
    byUserId: (userId) => `contacts:user:${userId}`,
  },
  users: {
    all: 'users:all',
    byId: (id) => `users:${id}`,
  },
  serviceItems: {
    all: 'service-items:all',
    byId: (id) => `service-items:${id}`,
  },  
} as const;
