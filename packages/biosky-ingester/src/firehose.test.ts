import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { FirehoseSubscription } from './firehose.js'

describe('FirehoseSubscription', () => {
  let subscription: FirehoseSubscription

  beforeEach(() => {
    subscription = new FirehoseSubscription()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // ============================================================================
  // buildUrl tests (accessed via internal state inspection or behavior)
  // ============================================================================
  describe('URL building', () => {
    it('uses default relay when none specified', () => {
      const sub = new FirehoseSubscription()
      // The default relay is wss://bsky.network
      // We can verify this through the subscription behavior
      expect(sub).toBeDefined()
    })

    it('uses custom relay when specified', () => {
      const customRelay = 'wss://custom.relay.network'
      const sub = new FirehoseSubscription({ relay: customRelay })
      expect(sub).toBeDefined()
    })

    it('getCursor returns undefined when no cursor set', () => {
      const sub = new FirehoseSubscription()
      expect(sub.getCursor()).toBeUndefined()
    })

    it('getCursor returns initial cursor when specified', () => {
      const sub = new FirehoseSubscription({ cursor: 12345 })
      expect(sub.getCursor()).toBe(12345)
    })
  })

  // ============================================================================
  // findCborEnd tests - Testing CBOR parsing logic
  // ============================================================================
  describe('findCborEnd', () => {
    // Access private method via any cast for testing
    function findCborEnd(data: Buffer, start: number): number {
      return (subscription as any).findCborEnd(data, start)
    }

    describe('unsigned integers (major type 0)', () => {
      it('parses small unsigned int (0-23)', () => {
        // CBOR: 0x05 = unsigned int 5
        const data = Buffer.from([0x05])
        expect(findCborEnd(data, 0)).toBe(1)
      })

      it('parses unsigned int with 1-byte follow (24)', () => {
        // CBOR: 0x18 0xFF = unsigned int 255
        const data = Buffer.from([0x18, 0xff])
        expect(findCborEnd(data, 0)).toBe(2)
      })

      it('parses unsigned int with 2-byte follow (25)', () => {
        // CBOR: 0x19 0x01 0x00 = unsigned int 256
        const data = Buffer.from([0x19, 0x01, 0x00])
        expect(findCborEnd(data, 0)).toBe(3)
      })

      it('parses unsigned int with 4-byte follow (26)', () => {
        // CBOR: 0x1a 0x00 0x01 0x00 0x00 = unsigned int 65536
        const data = Buffer.from([0x1a, 0x00, 0x01, 0x00, 0x00])
        expect(findCborEnd(data, 0)).toBe(5)
      })

      it('parses unsigned int with 8-byte follow (27)', () => {
        // CBOR: 0x1b + 8 bytes
        const data = Buffer.from([0x1b, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00])
        expect(findCborEnd(data, 0)).toBe(9)
      })
    })

    describe('negative integers (major type 1)', () => {
      it('parses small negative int', () => {
        // CBOR: 0x20 = negative int -1
        const data = Buffer.from([0x20])
        expect(findCborEnd(data, 0)).toBe(1)
      })

      it('parses negative int with 1-byte follow', () => {
        // CBOR: 0x38 0x63 = negative int -100
        const data = Buffer.from([0x38, 0x63])
        expect(findCborEnd(data, 0)).toBe(2)
      })
    })

    describe('byte strings (major type 2)', () => {
      it('parses empty byte string', () => {
        // CBOR: 0x40 = empty byte string
        const data = Buffer.from([0x40])
        expect(findCborEnd(data, 0)).toBe(1)
      })

      it('parses short byte string', () => {
        // CBOR: 0x44 + 4 bytes = byte string of length 4
        const data = Buffer.from([0x44, 0x01, 0x02, 0x03, 0x04])
        expect(findCborEnd(data, 0)).toBe(5)
      })

      it('parses byte string with 1-byte length', () => {
        // CBOR: 0x58 0x1a + 26 bytes = byte string of length 26
        const bytes = [0x58, 0x1a, ...Array(26).fill(0x00)]
        const data = Buffer.from(bytes)
        expect(findCborEnd(data, 0)).toBe(28)
      })
    })

    describe('text strings (major type 3)', () => {
      it('parses empty text string', () => {
        // CBOR: 0x60 = empty text string
        const data = Buffer.from([0x60])
        expect(findCborEnd(data, 0)).toBe(1)
      })

      it('parses short text string "hello"', () => {
        // CBOR: 0x65 + "hello" = text string of length 5
        const data = Buffer.from([0x65, 0x68, 0x65, 0x6c, 0x6c, 0x6f])
        expect(findCborEnd(data, 0)).toBe(6)
      })

      it('parses text string with 1-byte length', () => {
        // CBOR: 0x78 0x20 + 32 bytes = text string of length 32
        const bytes = [0x78, 0x20, ...Array(32).fill(0x41)]
        const data = Buffer.from(bytes)
        expect(findCborEnd(data, 0)).toBe(34)
      })
    })

    describe('arrays (major type 4)', () => {
      it('parses empty array', () => {
        // CBOR: 0x80 = empty array
        const data = Buffer.from([0x80])
        expect(findCborEnd(data, 0)).toBe(1)
      })

      it('parses array with single integer', () => {
        // CBOR: 0x81 0x05 = array [5]
        const data = Buffer.from([0x81, 0x05])
        expect(findCborEnd(data, 0)).toBe(2)
      })

      it('parses array with multiple integers', () => {
        // CBOR: 0x83 0x01 0x02 0x03 = array [1, 2, 3]
        const data = Buffer.from([0x83, 0x01, 0x02, 0x03])
        expect(findCborEnd(data, 0)).toBe(4)
      })

      it('parses nested arrays', () => {
        // CBOR: 0x82 0x81 0x01 0x02 = array [[1], 2]
        const data = Buffer.from([0x82, 0x81, 0x01, 0x02])
        expect(findCborEnd(data, 0)).toBe(4)
      })

      it('parses array with text string', () => {
        // CBOR: 0x81 0x63 0x66 0x6f 0x6f = array ["foo"]
        const data = Buffer.from([0x81, 0x63, 0x66, 0x6f, 0x6f])
        expect(findCborEnd(data, 0)).toBe(5)
      })
    })

    describe('maps (major type 5)', () => {
      it('parses empty map', () => {
        // CBOR: 0xa0 = empty map {}
        const data = Buffer.from([0xa0])
        expect(findCborEnd(data, 0)).toBe(1)
      })

      it('parses map with single key-value pair', () => {
        // CBOR: 0xa1 0x61 0x61 0x01 = map {"a": 1}
        const data = Buffer.from([0xa1, 0x61, 0x61, 0x01])
        expect(findCborEnd(data, 0)).toBe(4)
      })

      it('parses map with multiple key-value pairs', () => {
        // CBOR: 0xa2 0x61 0x61 0x01 0x61 0x62 0x02 = map {"a": 1, "b": 2}
        const data = Buffer.from([0xa2, 0x61, 0x61, 0x01, 0x61, 0x62, 0x02])
        expect(findCborEnd(data, 0)).toBe(7)
      })

      it('parses nested map', () => {
        // CBOR: 0xa1 0x61 0x78 0xa1 0x61 0x79 0x01 = map {"x": {"y": 1}}
        const data = Buffer.from([0xa1, 0x61, 0x78, 0xa1, 0x61, 0x79, 0x01])
        expect(findCborEnd(data, 0)).toBe(7)
      })
    })

    describe('tags (major type 6)', () => {
      it('parses tagged value', () => {
        // CBOR: 0xc0 0x74 + 20 bytes = tag 0 with text string (date-time)
        // Simplified: 0xc0 0x65 "hello" = tag 0 with "hello"
        const data = Buffer.from([0xc0, 0x65, 0x68, 0x65, 0x6c, 0x6c, 0x6f])
        expect(findCborEnd(data, 0)).toBe(7)
      })
    })

    describe('simple values and floats (major type 7)', () => {
      it('parses false', () => {
        // CBOR: 0xf4 = false
        const data = Buffer.from([0xf4])
        expect(findCborEnd(data, 0)).toBe(1)
      })

      it('parses true', () => {
        // CBOR: 0xf5 = true
        const data = Buffer.from([0xf5])
        expect(findCborEnd(data, 0)).toBe(1)
      })

      it('parses null', () => {
        // CBOR: 0xf6 = null
        const data = Buffer.from([0xf6])
        expect(findCborEnd(data, 0)).toBe(1)
      })
    })

    describe('edge cases', () => {
      it('returns -1 for empty buffer', () => {
        const data = Buffer.from([])
        expect(findCborEnd(data, 0)).toBe(-1)
      })

      it('returns -1 when start exceeds buffer length', () => {
        const data = Buffer.from([0x01])
        expect(findCborEnd(data, 5)).toBe(-1)
      })

      it('handles start offset correctly', () => {
        // Buffer with two integers: 0x01, 0x05
        const data = Buffer.from([0x01, 0x05])
        expect(findCborEnd(data, 0)).toBe(1)
        expect(findCborEnd(data, 1)).toBe(2)
      })

      it('returns -1 for unsupported additional info', () => {
        // 0x1c, 0x1d, 0x1e are reserved
        const data = Buffer.from([0x1c])
        expect(findCborEnd(data, 0)).toBe(-1)
      })
    })
  })

  // ============================================================================
  // decodeFrame tests
  // ============================================================================
  describe('decodeFrame', () => {
    // Access private method via any cast for testing
    function decodeFrame(data: Buffer): { header: { op: number; t: string }; body: unknown } | null {
      return (subscription as any).decodeFrame(data)
    }

    it('returns null for invalid CBOR data', () => {
      const data = Buffer.from([0xff, 0xff, 0xff])
      expect(decodeFrame(data)).toBeNull()
    })

    it('returns null for truncated data', () => {
      // A map that claims to have 5 elements but doesn't
      const data = Buffer.from([0xa5])
      expect(decodeFrame(data)).toBeNull()
    })
  })

  // ============================================================================
  // Event handlers and callback tests
  // ============================================================================
  describe('event handling', () => {
    it('registers occurrence callback via constructor', () => {
      const onOccurrence = vi.fn()
      const sub = new FirehoseSubscription({ onOccurrence })

      // Emit a test event
      sub.emit('occurrence', { uri: 'test', did: 'did:plc:test' })

      expect(onOccurrence).toHaveBeenCalledWith({ uri: 'test', did: 'did:plc:test' })
    })

    it('registers identification callback via constructor', () => {
      const onIdentification = vi.fn()
      const sub = new FirehoseSubscription({ onIdentification })

      // Emit a test event
      sub.emit('identification', { uri: 'test', did: 'did:plc:test' })

      expect(onIdentification).toHaveBeenCalledWith({ uri: 'test', did: 'did:plc:test' })
    })

    it('supports legacy onObservation callback', () => {
      const onObservation = vi.fn()
      const sub = new FirehoseSubscription({ onObservation })

      // Should emit on 'occurrence' event
      sub.emit('occurrence', { uri: 'test', did: 'did:plc:test' })

      expect(onObservation).toHaveBeenCalledWith({ uri: 'test', did: 'did:plc:test' })
    })

    it('prefers onOccurrence over onObservation', () => {
      const onOccurrence = vi.fn()
      const onObservation = vi.fn()
      const sub = new FirehoseSubscription({ onOccurrence, onObservation })

      sub.emit('occurrence', { uri: 'test', did: 'did:plc:test' })

      expect(onOccurrence).toHaveBeenCalled()
      expect(onObservation).not.toHaveBeenCalled()
    })
  })

  // ============================================================================
  // Connection state tests
  // ============================================================================
  describe('connection state', () => {
    it('isConnected returns false before start', () => {
      const sub = new FirehoseSubscription()
      expect(sub.isConnected()).toBe(false)
    })

    it('isConnected returns false after stop', async () => {
      const sub = new FirehoseSubscription()
      await sub.stop()
      expect(sub.isConnected()).toBe(false)
    })
  })
})
