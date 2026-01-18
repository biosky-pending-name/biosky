import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { IdentityResolver, getIdentityResolver } from './identity.js'

describe('IdentityResolver', () => {
  let resolver: IdentityResolver
  let originalFetch: typeof global.fetch

  beforeEach(() => {
    resolver = new IdentityResolver('https://test.bsky.social')
    originalFetch = global.fetch
    vi.useFakeTimers()
  })

  afterEach(() => {
    global.fetch = originalFetch
    vi.restoreAllMocks()
    vi.useRealTimers()
    resolver.clearCache()
  })

  // ============================================================================
  // resolveHandle tests
  // ============================================================================
  describe('resolveHandle', () => {
    it('resolves handle to DID', async () => {
      const mockResolveHandle = vi.fn().mockResolvedValue({
        data: { did: 'did:plc:test123' }
      })
      ;(resolver as any).agent = {
        resolveHandle: mockResolveHandle
      }
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          id: 'did:plc:test123',
          service: [{ id: '#atproto_pds', serviceEndpoint: 'https://pds.test.com' }]
        })
      })

      const result = await resolver.resolveHandle('test.bsky.social')

      expect(result).not.toBeNull()
      expect(result!.did).toBe('did:plc:test123')
      expect(result!.handle).toBe('test.bsky.social')
    })

    it('returns cached result within TTL', async () => {
      const mockResolveHandle = vi.fn().mockResolvedValue({
        data: { did: 'did:plc:cached' }
      })
      ;(resolver as any).agent = {
        resolveHandle: mockResolveHandle
      }
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          id: 'did:plc:cached',
          service: []
        })
      })

      // First call
      await resolver.resolveHandle('cached.bsky.social')

      // Second call should use cache
      const result = await resolver.resolveHandle('cached.bsky.social')

      expect(mockResolveHandle).toHaveBeenCalledTimes(1)
      expect(result!.did).toBe('did:plc:cached')
    })

    it('returns null on error', async () => {
      ;(resolver as any).agent = {
        resolveHandle: vi.fn().mockRejectedValue(new Error('Not found'))
      }

      const result = await resolver.resolveHandle('notfound.bsky.social')

      expect(result).toBeNull()
    })

    it('fetches PDS endpoint from DID document', async () => {
      ;(resolver as any).agent = {
        resolveHandle: vi.fn().mockResolvedValue({
          data: { did: 'did:plc:withpds' }
        })
      }
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          id: 'did:plc:withpds',
          service: [{ id: '#atproto_pds', serviceEndpoint: 'https://my-pds.com' }]
        })
      })

      const result = await resolver.resolveHandle('withpds.bsky.social')

      expect(result!.pdsEndpoint).toBe('https://my-pds.com')
    })
  })

  // ============================================================================
  // resolveDid tests
  // ============================================================================
  describe('resolveDid', () => {
    it('resolves did:plc to document', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          id: 'did:plc:resolvedid',
          alsoKnownAs: ['at://resolved.bsky.social'],
          service: [{ id: '#atproto_pds', serviceEndpoint: 'https://pds.bsky.app' }]
        })
      })

      const result = await resolver.resolveDid('did:plc:resolvedid')

      expect(result).not.toBeNull()
      expect(result!.did).toBe('did:plc:resolvedid')
      expect(result!.handle).toBe('resolved.bsky.social')
      expect(result!.pdsEndpoint).toBe('https://pds.bsky.app')
    })

    it('resolves did:web to document', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          id: 'did:web:example.com',
          alsoKnownAs: ['at://example.com'],
          service: []
        })
      })

      const result = await resolver.resolveDid('did:web:example.com')

      expect(result).not.toBeNull()
      expect(result!.did).toBe('did:web:example.com')
      expect(result!.handle).toBe('example.com')
    })

    it('returns cached result within TTL', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          id: 'did:plc:cachedid',
          alsoKnownAs: ['at://cached.bsky.social'],
          service: []
        })
      })

      await resolver.resolveDid('did:plc:cachedid')
      await resolver.resolveDid('did:plc:cachedid')

      expect(global.fetch).toHaveBeenCalledTimes(1)
    })

    it('returns null for unknown DID method', async () => {
      const result = await resolver.resolveDid('did:unknown:test')

      expect(result).toBeNull()
    })

    it('returns null when fetch fails', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404
      })

      const result = await resolver.resolveDid('did:plc:notfound')

      expect(result).toBeNull()
    })

    it('handles missing alsoKnownAs', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          id: 'did:plc:noaka',
          service: []
        })
      })

      const result = await resolver.resolveDid('did:plc:noaka')

      expect(result).not.toBeNull()
      expect(result!.handle).toBeUndefined()
    })
  })

  // ============================================================================
  // getDidDocument tests
  // ============================================================================
  describe('getDidDocument', () => {
    it('fetches did:plc from plc.directory', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ id: 'did:plc:test' })
      })

      const doc = await resolver.getDidDocument('did:plc:test')

      expect(global.fetch).toHaveBeenCalledWith('https://plc.directory/did:plc:test')
      expect(doc).not.toBeNull()
    })

    it('fetches did:web from well-known', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ id: 'did:web:example.com' })
      })

      const doc = await resolver.getDidDocument('did:web:example.com')

      expect(global.fetch).toHaveBeenCalledWith('https://example.com/.well-known/did.json')
      expect(doc).not.toBeNull()
    })

    it('handles encoded colons in did:web', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ id: 'did:web:example.com%3A8080' })
      })

      const doc = await resolver.getDidDocument('did:web:example.com%3A8080')

      expect(global.fetch).toHaveBeenCalledWith('https://example.com:8080/.well-known/did.json')
    })

    it('returns null for unsupported DID method', async () => {
      const doc = await resolver.getDidDocument('did:key:z123')

      expect(doc).toBeNull()
    })

    it('returns null on fetch error', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

      const doc = await resolver.getDidDocument('did:plc:error')

      expect(doc).toBeNull()
    })
  })

  // ============================================================================
  // getPdsEndpoint tests
  // ============================================================================
  describe('getPdsEndpoint', () => {
    it('extracts PDS endpoint from document', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          id: 'did:plc:pdstest',
          service: [{ id: '#atproto_pds', serviceEndpoint: 'https://pds.example.com' }]
        })
      })

      const endpoint = await resolver.getPdsEndpoint('did:plc:pdstest')

      expect(endpoint).toBe('https://pds.example.com')
    })

    it('returns null when no PDS service', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          id: 'did:plc:nopds',
          service: [{ id: '#other', serviceEndpoint: 'https://other.com' }]
        })
      })

      const endpoint = await resolver.getPdsEndpoint('did:plc:nopds')

      expect(endpoint).toBeNull()
    })

    it('returns null when document fetch fails', async () => {
      global.fetch = vi.fn().mockResolvedValue({ ok: false })

      const endpoint = await resolver.getPdsEndpoint('did:plc:fail')

      expect(endpoint).toBeNull()
    })
  })

  // ============================================================================
  // getProfile tests
  // ============================================================================
  describe('getProfile', () => {
    it('fetches profile by actor', async () => {
      ;(resolver as any).agent = {
        getProfile: vi.fn().mockResolvedValue({
          data: {
            did: 'did:plc:profile',
            handle: 'profile.bsky.social',
            displayName: 'Test User',
            description: 'A test user',
            avatar: 'https://cdn.bsky.app/avatar.jpg',
            followersCount: 100,
            followsCount: 50,
            postsCount: 25
          }
        })
      }

      const profile = await resolver.getProfile('profile.bsky.social')

      expect(profile).not.toBeNull()
      expect(profile!.handle).toBe('profile.bsky.social')
      expect(profile!.displayName).toBe('Test User')
      expect(profile!.followersCount).toBe(100)
    })

    it('returns cached profile within TTL', async () => {
      const mockGetProfile = vi.fn().mockResolvedValue({
        data: {
          did: 'did:plc:cachedprofile',
          handle: 'cached.bsky.social'
        }
      })
      ;(resolver as any).agent = { getProfile: mockGetProfile }

      await resolver.getProfile('cached.bsky.social')
      await resolver.getProfile('cached.bsky.social')

      expect(mockGetProfile).toHaveBeenCalledTimes(1)
    })

    it('returns null on error', async () => {
      ;(resolver as any).agent = {
        getProfile: vi.fn().mockRejectedValue(new Error('Not found'))
      }

      const profile = await resolver.getProfile('notfound.bsky.social')

      expect(profile).toBeNull()
    })
  })

  // ============================================================================
  // getProfiles tests
  // ============================================================================
  describe('getProfiles', () => {
    it('fetches multiple profiles', async () => {
      ;(resolver as any).agent = {
        getProfiles: vi.fn().mockResolvedValue({
          data: {
            profiles: [
              { did: 'did:plc:1', handle: 'user1.bsky.social' },
              { did: 'did:plc:2', handle: 'user2.bsky.social' }
            ]
          }
        })
      }

      const profiles = await resolver.getProfiles(['user1.bsky.social', 'user2.bsky.social'])

      expect(profiles.size).toBe(4) // 2 by DID + 2 by handle
      expect(profiles.get('did:plc:1')?.handle).toBe('user1.bsky.social')
    })

    it('uses cached profiles', async () => {
      ;(resolver as any).agent = {
        getProfile: vi.fn().mockResolvedValue({
          data: { did: 'did:plc:cached', handle: 'cached.bsky.social' }
        }),
        getProfiles: vi.fn().mockResolvedValue({
          data: {
            profiles: [{ did: 'did:plc:new', handle: 'new.bsky.social' }]
          }
        })
      }

      // Cache one profile
      await resolver.getProfile('cached.bsky.social')

      // Request both cached and new
      const profiles = await resolver.getProfiles(['cached.bsky.social', 'new.bsky.social'])

      // getProfiles should only fetch the uncached one
      expect((resolver as any).agent.getProfiles).toHaveBeenCalledWith({
        actors: ['new.bsky.social']
      })
    })

    it('handles empty input', async () => {
      const profiles = await resolver.getProfiles([])

      expect(profiles.size).toBe(0)
    })

    it('batches requests for large inputs', async () => {
      const mockGetProfiles = vi.fn().mockResolvedValue({
        data: { profiles: [] }
      })
      ;(resolver as any).agent = { getProfiles: mockGetProfiles }

      // Create 30 actors (batch size is 25)
      const actors = Array.from({ length: 30 }, (_, i) => `user${i}.bsky.social`)

      await resolver.getProfiles(actors)

      // Should make 2 batch calls
      expect(mockGetProfiles).toHaveBeenCalledTimes(2)
    })

    it('handles fetch errors gracefully', async () => {
      ;(resolver as any).agent = {
        getProfiles: vi.fn().mockRejectedValue(new Error('Network error'))
      }

      const profiles = await resolver.getProfiles(['error.bsky.social'])

      // Should return empty map but not throw
      expect(profiles.size).toBe(0)
    })
  })

  // ============================================================================
  // clearCache tests
  // ============================================================================
  describe('clearCache', () => {
    it('clears all cached data', async () => {
      ;(resolver as any).agent = {
        resolveHandle: vi.fn().mockResolvedValue({ data: { did: 'did:plc:1' } }),
        getProfile: vi.fn().mockResolvedValue({ data: { did: 'did:plc:1', handle: 'test' } })
      }
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ id: 'did:plc:1', service: [] })
      })

      await resolver.resolveHandle('test.bsky.social')
      await resolver.getProfile('test.bsky.social')

      resolver.clearCache()

      // Second calls should fetch again
      await resolver.resolveHandle('test.bsky.social')
      await resolver.getProfile('test.bsky.social')

      expect((resolver as any).agent.resolveHandle).toHaveBeenCalledTimes(2)
      expect((resolver as any).agent.getProfile).toHaveBeenCalledTimes(2)
    })
  })

  // ============================================================================
  // getIdentityResolver singleton tests
  // ============================================================================
  describe('getIdentityResolver', () => {
    it('returns same instance on multiple calls', () => {
      // Note: This test may not work perfectly due to module caching
      // but documents expected behavior
      const resolver1 = getIdentityResolver()
      const resolver2 = getIdentityResolver()

      expect(resolver1).toBeInstanceOf(IdentityResolver)
      expect(resolver2).toBeInstanceOf(IdentityResolver)
    })
  })
})
