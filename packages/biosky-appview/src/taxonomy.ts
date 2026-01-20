/**
 * Taxonomy Resolver
 *
 * Integrates with GBIF API to validate and search for taxonomic names.
 */

interface TaxonResult {
  id: string;
  scientificName: string;
  commonName?: string;
  rank: string;
  kingdom?: string;
  phylum?: string;
  class?: string;
  order?: string;
  family?: string;
  genus?: string;
  species?: string;
  source: "gbif";
}

interface ValidationResult {
  valid: boolean;
  matchedName?: string;
  taxon?: TaxonResult;
  suggestions?: TaxonResult[];
}

// Simple in-memory cache
const searchCache = new Map<string, { results: TaxonResult[]; timestamp: number }>();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

export class TaxonomyResolver {
  private gbifBaseUrl = "https://api.gbif.org/v1";

  /**
   * Search for taxa matching a query
   */
  async search(query: string, limit = 10): Promise<TaxonResult[]> {
    const cacheKey = `search:${query.toLowerCase()}:${limit}`;
    const cached = searchCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.results;
    }

    const results = await this.searchGbif(query, limit);

    searchCache.set(cacheKey, { results, timestamp: Date.now() });
    return results;
  }

  /**
   * Validate a scientific name
   */
  async validate(name: string): Promise<ValidationResult> {
    const gbifMatch = await this.matchGbif(name);
    if (gbifMatch && gbifMatch.matchType === "EXACT") {
      return {
        valid: true,
        matchedName: gbifMatch.scientificName,
        taxon: this.gbifToTaxon(gbifMatch),
      };
    }

    // If we have a fuzzy GBIF match, return it as a suggestion
    if (gbifMatch) {
      return {
        valid: false,
        suggestions: [this.gbifToTaxon(gbifMatch)],
      };
    }

    // No match found
    return {
      valid: false,
      suggestions: [],
    };
  }

  /**
   * Search GBIF species API
   */
  private async searchGbif(query: string, limit: number): Promise<TaxonResult[]> {
    try {
      const url = `${this.gbifBaseUrl}/species/suggest?q=${encodeURIComponent(query)}&limit=${limit}`;
      const response = await fetch(url);
      if (!response.ok) return [];

      const data = (await response.json()) as GbifSuggestResult[];
      return data.map((item) => this.gbifToTaxon(item));
    } catch (error) {
      console.error("GBIF search error:", error);
      return [];
    }
  }

  /**
   * Match a name against GBIF backbone taxonomy
   */
  private async matchGbif(name: string): Promise<GbifMatchResult | null> {
    try {
      const url = `${this.gbifBaseUrl}/species/match?name=${encodeURIComponent(name)}`;
      const response = await fetch(url);
      if (!response.ok) return null;

      const data = (await response.json()) as GbifMatchResult;
      if (data.matchType === "NONE") return null;
      return data;
    } catch (error) {
      console.error("GBIF match error:", error);
      return null;
    }
  }

  /**
   * Convert GBIF result to TaxonResult
   */
  private gbifToTaxon(item: GbifSuggestResult | GbifMatchResult): TaxonResult {
    return {
      id: `gbif:${item.usageKey || item.key}`,
      scientificName: item.canonicalName || item.scientificName || "",
      commonName: item.vernacularName,
      rank: item.rank?.toLowerCase() || "unknown",
      kingdom: item.kingdom,
      phylum: item.phylum,
      class: item.class,
      order: item.order,
      family: item.family,
      genus: item.genus,
      species: item.species,
      source: "gbif",
    };
  }
}

// GBIF API types
interface GbifSuggestResult {
  key?: number;
  usageKey?: number;
  scientificName?: string;
  canonicalName?: string;
  vernacularName?: string;
  rank?: string;
  kingdom?: string;
  phylum?: string;
  class?: string;
  order?: string;
  family?: string;
  genus?: string;
  species?: string;
}

interface GbifMatchResult extends GbifSuggestResult {
  matchType: "EXACT" | "FUZZY" | "HIGHERRANK" | "NONE";
  confidence?: number;
}

export type { TaxonResult, ValidationResult };
