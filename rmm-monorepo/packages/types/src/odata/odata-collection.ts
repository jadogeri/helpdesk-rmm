// packages/types/src/odata/odata-collection.interface.ts

export interface IMspODataCollection<T> {
  '@odata.context'?: string;
  /** Always an array of objects */
  value: T[];
}
