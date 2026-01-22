/**
 * Taxonomy Resolver
 *
 * Integrates with GBIF API to validate and search for taxonomic names.
 */

/**
 * IUCN Red List conservation status categories
 * @see https://www.iucnredlist.org/resources/categories-and-criteria
 */
type IUCNCategory =
  | "EX" // Extinct
  | "EW" // Extinct in the Wild
  | "CR" // Critically Endangered
  | "EN" // Endangered
  | "VU" // Vulnerable
  | "NT" // Near Threatened
  | "LC" // Least Concern
  | "DD" // Data Deficient
  | "NE"; // Not Evaluated

interface ConservationStatus {
  category: IUCNCategory;
  source: string;
}

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
  conservationStatus?: ConservationStatus;
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
  private gbifV1BaseUrl = "https://api.gbif.org/v1";
  private gbifV2BaseUrl = "https://api.gbif.org/v2";

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
    if (!gbifMatch || !gbifMatch.usage) {
      return { valid: false, suggestions: [] };
    }

    const matchType = gbifMatch.diagnostics?.matchType;
    const taxon = this.gbifV2ToTaxon(gbifMatch.usage, gbifMatch.additionalStatus);

    if (matchType === "EXACT") {
      return {
        valid: true,
        matchedName: gbifMatch.usage.canonicalName || gbifMatch.usage.name,
        taxon,
      };
    }

    // If we have a fuzzy or higher rank match, return it as a suggestion
    return {
      valid: false,
      suggestions: [taxon],
    };
  }

  /**
   * Search GBIF species API and enrich with conservation status
   */
  private async searchGbif(query: string, limit: number): Promise<TaxonResult[]> {
    try {
      // Filter to accepted names only to avoid synonyms cluttering results
      const url = `${this.gbifV1BaseUrl}/species/suggest?q=${encodeURIComponent(query)}&limit=${limit}&status=ACCEPTED`;
      const response = await fetch(url);
      if (!response.ok) return [];

      const data = (await response.json()) as GbifSuggestResult[];
      const basicResults = data.map((item) => this.gbifToTaxon(item));

      // Enrich with conservation status from v2 API (in parallel)
      const enrichedResults = await Promise.all(
        basicResults.map(async (result) => {
          const match = await this.matchGbif(result.scientificName);
          if (match?.additionalStatus) {
            const iucnStatus = match.additionalStatus.find((s) => s.datasetAlias === "IUCN");
            if (iucnStatus?.statusCode) {
              return {
                ...result,
                conservationStatus: {
                  category: iucnStatus.statusCode as IUCNCategory,
                  source: "IUCN",
                },
              };
            }
          }
          return result;
        }),
      );

      return enrichedResults;
    } catch (error) {
      console.error("GBIF search error:", error);
      return [];
    }
  }

  /**
   * Match a name against GBIF backbone taxonomy (v2 API)
   */
  private async matchGbif(name: string): Promise<GbifV2MatchResult | null> {
    try {
      const url = `${this.gbifV2BaseUrl}/species/match?scientificName=${encodeURIComponent(name)}`;
      const response = await fetch(url);
      if (!response.ok) return null;

      const data = (await response.json()) as GbifV2MatchResult;
      if (!data.usage) return null;
      return data;
    } catch (error) {
      console.error("GBIF match error:", error);
      return null;
    }
  }

  /**
   * Convert GBIF v1 result to TaxonResult
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

  /**
   * Convert GBIF v2 result to TaxonResult
   */
  private gbifV2ToTaxon(
    usage: GbifV2NameUsage,
    additionalStatus?: GbifV2AdditionalStatus[],
  ): TaxonResult {
    // Extract IUCN conservation status if available
    const iucnStatus = additionalStatus?.find((s) => s.datasetAlias === "IUCN");
    const conservationStatus: ConservationStatus | undefined = iucnStatus?.statusCode
      ? {
          category: iucnStatus.statusCode as IUCNCategory,
          source: "IUCN",
        }
      : undefined;

    return {
      id: `gbif:${usage.key}`,
      scientificName: usage.canonicalName || usage.name || "",
      rank: usage.rank?.toLowerCase() || "unknown",
      kingdom: usage.kingdom,
      phylum: usage.phylum,
      class: usage.class,
      order: usage.order,
      family: usage.family,
      genus: usage.genus,
      species: usage.species,
      source: "gbif",
      conservationStatus,
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

// GBIF v2 API types
interface GbifV2NameUsage {
  key?: number;
  name?: string;
  canonicalName?: string;
  rank?: string;
  kingdom?: string;
  phylum?: string;
  class?: string;
  order?: string;
  family?: string;
  genus?: string;
  species?: string;
}

interface GbifV2AdditionalStatus {
  status?: string;
  statusCode?: string;
  datasetAlias?: string;
}

interface GbifV2MatchResult {
  synonym: boolean;
  usage?: GbifV2NameUsage;
  classification?: GbifV2NameUsage[];
  additionalStatus?: GbifV2AdditionalStatus[];
  diagnostics?: {
    matchType?: "EXACT" | "FUZZY" | "HIGHERRANK" | "NONE";
    confidence?: number;
  };
}

export type { TaxonResult, ValidationResult, ConservationStatus, IUCNCategory };
