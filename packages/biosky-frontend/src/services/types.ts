export interface Occurrence {
  uri: string;
  cid: string;
  observer: {
    did: string;
    handle?: string;
    displayName?: string;
    avatar?: string;
  };
  scientificName?: string;
  communityId?: string;
  eventDate: string;
  location: {
    latitude: number;
    longitude: number;
    uncertaintyMeters?: number;
  };
  verbatimLocality?: string;
  occurrenceRemarks?: string;
  images: string[];
  createdAt: string;
}

export interface User {
  did: string;
  handle: string;
}

export type ViewMode = "feed" | "map";
export type FeedTab = "home" | "explore";

/**
 * IUCN Red List conservation status categories
 */
export type IUCNCategory =
  | "EX" // Extinct
  | "EW" // Extinct in the Wild
  | "CR" // Critically Endangered
  | "EN" // Endangered
  | "VU" // Vulnerable
  | "NT" // Near Threatened
  | "LC" // Least Concern
  | "DD" // Data Deficient
  | "NE"; // Not Evaluated

export interface ConservationStatus {
  category: IUCNCategory;
  source: string;
}

export interface TaxaResult {
  scientificName: string;
  commonName?: string;
  photoUrl?: string;
  rank?: string;
  conservationStatus?: ConservationStatus;
}

export interface FeedResponse {
  occurrences: Occurrence[];
  cursor?: string;
}

export interface GeoJSONFeatureCollection {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    geometry: {
      type: "Point";
      coordinates: [number, number];
    };
    properties: {
      uri: string;
      scientificName?: string;
      point_count?: number;
      cluster_id?: number;
    };
  }>;
}
