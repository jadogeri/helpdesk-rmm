// packages/types/src/index.ts
/// <reference path="./global.d.ts" />

// Define your core shared types here
export type NodeEnvironment = 'development' | 'production' | 'test';

export * from './customers/customer';
export * from './locations/location';
export * from './issue-types/issue-type';
export * from './companies/company';
export * from './ticket-custom-statuses/ticket-custom-status';
export * from './service-items/service-item';
export * from './contacts/contact';
export * from './users/user';
export * from './tickets/ticket';

// msp mapping types
export * from './companies/msp-company';
export * from './contacts/msp-contact';
export * from './customers/msp-customer';
export * from './issue-types/msp-issue-type';
export * from './locations/msp-location';
export * from './service-items/msp-service-item';
export * from './ticket-custom-statuses/msp-ticket-custom-status';
export * from './users/msp-user';
export * from './tickets/ticket-odata';
