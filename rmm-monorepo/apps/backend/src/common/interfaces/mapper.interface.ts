export interface IMapper<Entity, Domain> {
  toDomain(entity: Entity): Domain;
  toEntity(domain: Domain): Entity;
}

// 🟢 Your new API-to-Domain mapper for OData/MSP Manager integrations
export interface IApiMapper<Dto, ApiPayload, Domain> {
  /** Map incoming client request data to the upstream API structure */
  toApiPayload(dto: Dto): ApiPayload;
  
  /** Map raw incoming upstream API contract data back down to the clean domain model */
  toDomain(apiRaw: any): Domain;
}