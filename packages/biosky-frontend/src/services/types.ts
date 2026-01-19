export interface Observation {
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

export interface TaxaResult {
  scientificName: string;
  commonName?: string;
}

export interface FeedResponse {
  occurrences: Observation[];
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
