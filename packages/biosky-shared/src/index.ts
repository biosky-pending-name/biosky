/**
 * BioSky Shared - Common code for BioSky services
 */

// Types
export * from "./types.js";

// Database
export { Database, type OccurrenceRow, type IdentificationRow, type CommentRow, type ObservationRow } from "./database/index.js";

// Services
export { TaxonomyResolver, type TaxonResult, type TaxonDetail, type TaxonAncestor, type TaxonDescription, type TaxonReference, type TaxonMedia, type ValidationResult, type ConservationStatus, type IUCNCategory } from "./services/taxonomy.js";
export { GeocodingService, type GeocodedLocation } from "./services/geocoding.js";
export { CommunityIdCalculator, TaxonomicHierarchy, type CommunityIdResult, type TaxonCount } from "./services/community-id.js";
export { IdentityResolver, getIdentityResolver, type DidDocument, type Profile, type ResolveResult } from "./services/identity.js";

// Generated types
export * from "./generated/index.js";
