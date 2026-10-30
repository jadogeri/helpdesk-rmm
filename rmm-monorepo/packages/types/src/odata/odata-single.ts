// packages/types/src/odata/odata-single.interface.ts

/**
 * Intersects your raw object fields directly with the OData context string.
 */
export type IMspODataSingle<T> = T & {
  '@odata.context'?: string;
};
