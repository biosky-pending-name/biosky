import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { TaxonomyResolver } from './taxonomy.js'

describe('TaxonomyResolver', () => {
  let resolver: TaxonomyResolver
  let originalFetch: typeof global.fetch

  beforeEach(() => {
    resolver = new TaxonomyResolver()
    originalFetch = global.fetch
    vi.useFakeTimers()
  })

  afterEach(() => {
    global.fetch = originalFetch
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  // Helper to create mock fetch responses
  function mockFetch(gbifData: unknown[], inatData: { results: unknown[] }) {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(gbifData)
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(inatData)
      })
  }

  // ============================================================================
  // gbifToTaxon tests
  // ============================================================================
  describe('gbifToTaxon transformation', () => {
    it('maps all GBIF fields correctly', async () => {
      const gbifResponse = [
        {
          key: 12345,
          usageKey: 12345,
          scientificName: 'Quercus alba L.',
          canonicalName: 'Quercus alba',
          vernacularName: 'White Oak',
          rank: 'SPECIES',
          kingdom: 'Plantae',
          phylum: 'Tracheophyta',
          class: 'Magnoliopsida',
          order: 'Fagales',
          family: 'Fagaceae',
          genus: 'Quercus',
          species: 'Quercus alba'
        }
      ]

      mockFetch(gbifResponse, { results: [] })

      const results = await resolver.search('unique-gbif-1', 10)

      const gbifResult = results.find(r => r.source === 'gbif')
      expect(gbifResult).toBeDefined()
      expect(gbifResult).toMatchObject({
        id: 'gbif:12345',
        scientificName: 'Quercus alba L.',
        commonName: 'White Oak',
        rank: 'species',
        kingdom: 'Plantae',
        phylum: 'Tracheophyta',
        class: 'Magnoliopsida',
        order: 'Fagales',
        family: 'Fagaceae',
        genus: 'Quercus',
        species: 'Quercus alba',
        source: 'gbif'
      })
    })

    it('handles missing optional fields', async () => {
      const gbifResponse = [
        {
          key: 99999,
          canonicalName: 'Unknown species'
          // no vernacularName, rank, or taxonomy fields
        }
      ]

      mockFetch(gbifResponse, { results: [] })

      const results = await resolver.search('unique-gbif-2', 10)

      const gbifResult = results.find(r => r.source === 'gbif')
      expect(gbifResult).toBeDefined()
      expect(gbifResult!.scientificName).toBe('Unknown species')
      expect(gbifResult!.commonName).toBeUndefined()
      expect(gbifResult!.rank).toBe('unknown')
    })

    it('uses usageKey when key is not present', async () => {
      const gbifResponse = [
        {
          usageKey: 54321,
          scientificName: 'Test species usageKey'
        }
      ]

      mockFetch(gbifResponse, { results: [] })

      const results = await resolver.search('unique-gbif-3', 10)

      const gbifResult = results.find(r => r.source === 'gbif')
      expect(gbifResult).toBeDefined()
      expect(gbifResult!.id).toBe('gbif:54321')
    })

    it('lowercases rank from GBIF', async () => {
      const gbifResponse = [
        {
          key: 1,
          scientificName: 'Test Genus',
          rank: 'GENUS'
        }
      ]

      mockFetch(gbifResponse, { results: [] })

      const results = await resolver.search('unique-gbif-4', 10)

      const gbifResult = results.find(r => r.source === 'gbif')
      expect(gbifResult).toBeDefined()
      expect(gbifResult!.rank).toBe('genus')
    })
  })

  // ============================================================================
  // inatToTaxon tests
  // ============================================================================
  describe('inatToTaxon transformation', () => {
    it('maps iNaturalist fields correctly', async () => {
      const inatResponse = {
        results: [
          {
            id: 67890,
            name: 'Cardinalis cardinalis',
            rank: 'species',
            preferred_common_name: 'Northern Cardinal',
            iconic_taxon_name: 'Aves',
            default_photo: {
              square_url: 'https://inaturalist.org/photos/1/square.jpg',
              medium_url: 'https://inaturalist.org/photos/1/medium.jpg'
            }
          }
        ]
      }

      mockFetch([], inatResponse)

      const results = await resolver.search('unique-inat-1', 10)

      expect(results).toContainEqual(expect.objectContaining({
        id: 'inat:67890',
        scientificName: 'Cardinalis cardinalis',
        commonName: 'Northern Cardinal',
        rank: 'species',
        iconicTaxon: 'Aves',
        photoUrl: 'https://inaturalist.org/photos/1/square.jpg',
        source: 'inaturalist'
      }))
    })

    it('handles missing photo', async () => {
      const inatResponse = {
        results: [
          {
            id: 11111,
            name: 'Rare species nophoto',
            rank: 'species'
            // no default_photo
          }
        ]
      }

      mockFetch([], inatResponse)

      const results = await resolver.search('unique-inat-2', 10)

      const inatResult = results.find(r => r.source === 'inaturalist')
      expect(inatResult).toBeDefined()
      expect(inatResult!.photoUrl).toBeUndefined()
    })

    it('handles missing optional fields', async () => {
      const inatResponse = {
        results: [
          {
            id: 22222,
            name: 'Mystery organism inat'
            // no rank, preferred_common_name, iconic_taxon_name
          }
        ]
      }

      mockFetch([], inatResponse)

      const results = await resolver.search('unique-inat-3', 10)

      const inatResult = results.find(r => r.source === 'inaturalist')
      expect(inatResult).toBeDefined()
      expect(inatResult!.commonName).toBeUndefined()
      expect(inatResult!.rank).toBe('unknown')
      expect(inatResult!.iconicTaxon).toBeUndefined()
    })
  })

  // ============================================================================
  // mergeResults tests
  // ============================================================================
  describe('mergeResults', () => {
    it('interleaves results from both sources with iNat first', async () => {
      const gbifResponse = [
        { key: 1, scientificName: 'GBIF Merge Species 1' },
        { key: 2, scientificName: 'GBIF Merge Species 2' }
      ]
      const inatResponse = {
        results: [
          { id: 101, name: 'iNat Merge Species 1' },
          { id: 102, name: 'iNat Merge Species 2' }
        ]
      }

      mockFetch(gbifResponse, inatResponse)

      const results = await resolver.search('unique-merge-1', 10)

      // Should interleave with iNaturalist first
      expect(results[0].source).toBe('inaturalist')
      expect(results[1].source).toBe('gbif')
      expect(results[2].source).toBe('inaturalist')
      expect(results[3].source).toBe('gbif')
    })

    it('deduplicates by scientific name (case-insensitive)', async () => {
      const gbifResponse = [
        { key: 1, scientificName: 'Quercus alba dedup' }
      ]
      const inatResponse = {
        results: [
          { id: 101, name: 'Quercus alba dedup' }, // same species
          { id: 102, name: 'Quercus rubra dedup' } // different species
        ]
      }

      mockFetch(gbifResponse, inatResponse)

      const results = await resolver.search('unique-merge-2', 10)

      // Should have only 2 results (Quercus alba deduplicated)
      expect(results.length).toBe(2)
      const names = results.map(r => r.scientificName.toLowerCase())
      expect(names).toContain('quercus alba dedup')
      expect(names).toContain('quercus rubra dedup')
    })

    it('respects limit parameter', async () => {
      const gbifResponse = [
        { key: 1, scientificName: 'GBIF Limit 1' },
        { key: 2, scientificName: 'GBIF Limit 2' },
        { key: 3, scientificName: 'GBIF Limit 3' }
      ]
      const inatResponse = {
        results: [
          { id: 101, name: 'iNat Limit 1' },
          { id: 102, name: 'iNat Limit 2' },
          { id: 103, name: 'iNat Limit 3' }
        ]
      }

      mockFetch(gbifResponse, inatResponse)

      const results = await resolver.search('unique-merge-3', 3)

      expect(results.length).toBe(3)
    })

    it('handles empty GBIF results gracefully', async () => {
      const inatResponse = {
        results: [
          { id: 101, name: 'iNat Only Species 1' },
          { id: 102, name: 'iNat Only Species 2' }
        ]
      }

      mockFetch([], inatResponse)

      const results = await resolver.search('unique-merge-4', 10)

      expect(results.length).toBe(2)
      expect(results.every(r => r.source === 'inaturalist')).toBe(true)
    })

    it('handles empty iNaturalist results gracefully', async () => {
      const gbifResponse = [
        { key: 1, scientificName: 'GBIF Only Species 1' },
        { key: 2, scientificName: 'GBIF Only Species 2' }
      ]

      mockFetch(gbifResponse, { results: [] })

      const results = await resolver.search('unique-merge-5', 10)

      expect(results.length).toBe(2)
      expect(results.every(r => r.source === 'gbif')).toBe(true)
    })

    it('handles both sources empty', async () => {
      mockFetch([], { results: [] })

      const results = await resolver.search('unique-merge-6', 10)

      expect(results).toEqual([])
    })
  })

  // ============================================================================
  // validate tests
  // ============================================================================
  describe('validate', () => {
    it('returns valid=true for exact GBIF match', async () => {
      const gbifMatch = {
        usageKey: 12345,
        scientificName: 'Quercus alba validate',
        matchType: 'EXACT',
        rank: 'SPECIES'
      }

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(gbifMatch)
      })

      const result = await resolver.validate('Quercus alba validate')

      expect(result.valid).toBe(true)
      expect(result.matchedName).toBe('Quercus alba validate')
      expect(result.taxon?.source).toBe('gbif')
    })

    it('returns valid=true for exact iNaturalist match when GBIF fuzzy', async () => {
      const gbifMatch = {
        usageKey: 12345,
        scientificName: 'Quercus alba fuzzy',
        matchType: 'FUZZY' // not exact
      }
      const inatResponse = {
        results: [
          { id: 101, name: 'Quercus alba fuzzy' } // exact match
        ]
      }

      global.fetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(gbifMatch)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(inatResponse)
        })

      const result = await resolver.validate('Quercus alba fuzzy')

      expect(result.valid).toBe(true)
      expect(result.matchedName).toBe('Quercus alba fuzzy')
      expect(result.taxon?.source).toBe('inaturalist')
    })

    it('returns valid=false with suggestions for fuzzy match only', async () => {
      const gbifMatch = {
        usageKey: 12345,
        scientificName: 'Quercus alba suggest',
        matchType: 'FUZZY'
      }
      const inatResponse = {
        results: [
          { id: 101, name: 'Quercus rubra suggest' } // different name
        ]
      }

      global.fetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(gbifMatch)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(inatResponse)
        })

      const result = await resolver.validate('Quercus alb suggest') // typo

      expect(result.valid).toBe(false)
      expect(result.suggestions).toBeDefined()
      expect(result.suggestions!.length).toBeGreaterThan(0)
    })

    it('returns NONE match as invalid', async () => {
      const gbifMatch = {
        matchType: 'NONE'
      }
      const inatResponse = { results: [] }

      global.fetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(gbifMatch)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(inatResponse)
        })

      const result = await resolver.validate('Nonexistent species xyz')

      expect(result.valid).toBe(false)
      expect(result.suggestions).toEqual([])
    })
  })

  // ============================================================================
  // Error handling tests
  // ============================================================================
  describe('error handling', () => {
    it('returns iNaturalist results when GBIF fails', async () => {
      global.fetch = vi.fn()
        .mockResolvedValueOnce({
          ok: false,
          status: 500
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ results: [{ id: 1, name: 'iNat Error Test' }] })
        })

      const results = await resolver.search('unique-error-1', 10)

      expect(results.length).toBe(1)
      expect(results[0].source).toBe('inaturalist')
    })

    it('returns GBIF results when iNaturalist fails', async () => {
      global.fetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve([{ key: 1, scientificName: 'GBIF Error Test' }])
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500
        })

      const results = await resolver.search('unique-error-2', 10)

      expect(results.length).toBe(1)
      expect(results[0].source).toBe('gbif')
    })

    it('returns empty array when both requests throw', async () => {
      global.fetch = vi.fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))

      const results = await resolver.search('unique-error-3', 10)

      expect(results).toEqual([])
    })
  })

  // ============================================================================
  // Caching tests
  // ============================================================================
  describe('caching', () => {
    it('returns cached results for same query within TTL', async () => {
      mockFetch(
        [{ key: 1, scientificName: 'Cached Species Test' }],
        { results: [] }
      )

      // First call
      const results1 = await resolver.search('unique-cache-1', 10)

      // Second call should use cache
      const results2 = await resolver.search('unique-cache-1', 10)

      // Should only have made 2 fetch calls total (for first search)
      expect(global.fetch).toHaveBeenCalledTimes(2)
      expect(results1).toEqual(results2)
    })

    it('makes new request after TTL expires', async () => {
      mockFetch(
        [{ key: 1, scientificName: 'TTL Test Species' }],
        { results: [] }
      )

      // First call
      await resolver.search('unique-cache-2', 10)

      // Advance time past TTL (30 minutes)
      vi.advanceTimersByTime(31 * 60 * 1000)

      // Setup new mock for second call
      global.fetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve([{ key: 2, scientificName: 'New Species' }])
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ results: [] })
        })

      // Second call after TTL should make new requests
      await resolver.search('unique-cache-2', 10)

      expect(global.fetch).toHaveBeenCalledTimes(2)
    })
  })
})
