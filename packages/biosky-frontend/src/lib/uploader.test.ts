import { describe, it, expect, vi, beforeEach } from 'vitest'
import { OccurrenceUploader } from './uploader.js'
import type { AtpAgent } from '@atproto/api'

// Mock File class for Node.js environment
class MockFile {
  name: string
  type: string
  size: number
  lastModified: number

  constructor(
    parts: BlobPart[],
    name: string,
    options: { type?: string; lastModified?: number } = {}
  ) {
    this.name = name
    this.type = options.type || ''
    this.lastModified = options.lastModified || Date.now()
    // Calculate size from parts
    this.size = parts.reduce((acc, part) => {
      if (typeof part === 'string') return acc + part.length
      if (part instanceof ArrayBuffer) return acc + part.byteLength
      return acc
    }, 0)
  }

  async arrayBuffer(): Promise<ArrayBuffer> {
    return new ArrayBuffer(this.size)
  }
}

// Helper to create mock files
function createMockFile(
  name: string,
  type: string,
  sizeInBytes: number
): File {
  const file = new MockFile(['x'.repeat(sizeInBytes)], name, { type }) as unknown as File
  return file
}

// Helper to create valid occurrence data
function createValidOccurrence(overrides: Partial<Parameters<OccurrenceUploader['upload']>[0]> = {}) {
  return {
    eventDate: '2024-06-15',
    location: {
      decimalLatitude: 40.7128,
      decimalLongitude: -74.006
    },
    images: [createMockFile('photo.jpg', 'image/jpeg', 1000)],
    ...overrides
  }
}

describe('OccurrenceUploader', () => {
  let mockAgent: Partial<AtpAgent>
  let uploader: OccurrenceUploader

  beforeEach(() => {
    mockAgent = {
      session: { did: 'did:plc:test', handle: 'test.bsky.social' } as AtpAgent['session'],
      uploadBlob: vi.fn().mockResolvedValue({
        data: { blob: { ref: { $link: 'blobref' }, mimeType: 'image/jpeg', size: 1000 } }
      }),
      com: {
        atproto: {
          repo: {
            createRecord: vi.fn().mockResolvedValue({
              data: { uri: 'at://did:plc:test/org.rwell.test.occurrence/1', cid: 'test-cid' }
            })
          }
        }
      } as unknown as AtpAgent['com']
    }
    uploader = new OccurrenceUploader(mockAgent as AtpAgent)
  })

  describe('validateOccurrence', () => {
    describe('eventDate validation', () => {
      it('throws if eventDate is missing', async () => {
        const data = createValidOccurrence({ eventDate: '' })

        await expect(uploader.upload(data)).rejects.toThrow('Event date is required')
      })

      it('throws if eventDate is invalid format', async () => {
        const data = createValidOccurrence({ eventDate: 'not-a-date' })

        await expect(uploader.upload(data)).rejects.toThrow('Invalid event date format')
      })

      it('throws if eventDate is in the future', async () => {
        const futureDate = new Date()
        futureDate.setFullYear(futureDate.getFullYear() + 1)
        const data = createValidOccurrence({ eventDate: futureDate.toISOString() })

        await expect(uploader.upload(data)).rejects.toThrow('Event date cannot be in the future')
      })

      it('accepts valid past date', async () => {
        const data = createValidOccurrence({ eventDate: '2020-01-15' })

        await uploader.upload(data)

        expect(mockAgent.com!.atproto.repo.createRecord).toHaveBeenCalled()
      })

      it('accepts today\'s date', async () => {
        const today = new Date().toISOString().split('T')[0]
        const data = createValidOccurrence({ eventDate: today })

        await uploader.upload(data)

        expect(mockAgent.com!.atproto.repo.createRecord).toHaveBeenCalled()
      })
    })

    describe('location validation', () => {
      it('throws if location is missing', async () => {
        const data = createValidOccurrence()
        // @ts-expect-error - intentionally setting to undefined for test
        data.location = undefined

        await expect(uploader.upload(data)).rejects.toThrow('Location is required')
      })

      it('throws if latitude is below -90', async () => {
        const data = createValidOccurrence({
          location: { decimalLatitude: -91, decimalLongitude: 0 }
        })

        await expect(uploader.upload(data)).rejects.toThrow('Latitude must be between -90 and 90')
      })

      it('throws if latitude is above 90', async () => {
        const data = createValidOccurrence({
          location: { decimalLatitude: 91, decimalLongitude: 0 }
        })

        await expect(uploader.upload(data)).rejects.toThrow('Latitude must be between -90 and 90')
      })

      it('throws if longitude is below -180', async () => {
        const data = createValidOccurrence({
          location: { decimalLatitude: 0, decimalLongitude: -181 }
        })

        await expect(uploader.upload(data)).rejects.toThrow('Longitude must be between -180 and 180')
      })

      it('throws if longitude is above 180', async () => {
        const data = createValidOccurrence({
          location: { decimalLatitude: 0, decimalLongitude: 181 }
        })

        await expect(uploader.upload(data)).rejects.toThrow('Longitude must be between -180 and 180')
      })

      it('accepts latitude at boundary -90', async () => {
        const data = createValidOccurrence({
          location: { decimalLatitude: -90, decimalLongitude: 0 }
        })

        await uploader.upload(data)

        expect(mockAgent.com!.atproto.repo.createRecord).toHaveBeenCalled()
      })

      it('accepts latitude at boundary 90', async () => {
        const data = createValidOccurrence({
          location: { decimalLatitude: 90, decimalLongitude: 0 }
        })

        await uploader.upload(data)

        expect(mockAgent.com!.atproto.repo.createRecord).toHaveBeenCalled()
      })

      it('accepts longitude at boundary -180', async () => {
        const data = createValidOccurrence({
          location: { decimalLatitude: 0, decimalLongitude: -180 }
        })

        await uploader.upload(data)

        expect(mockAgent.com!.atproto.repo.createRecord).toHaveBeenCalled()
      })

      it('accepts longitude at boundary 180', async () => {
        const data = createValidOccurrence({
          location: { decimalLatitude: 0, decimalLongitude: 180 }
        })

        await uploader.upload(data)

        expect(mockAgent.com!.atproto.repo.createRecord).toHaveBeenCalled()
      })
    })

    describe('images validation', () => {
      it('throws if no images provided', async () => {
        const data = createValidOccurrence({ images: [] })

        await expect(uploader.upload(data)).rejects.toThrow('At least one photo is required')
      })

      it('throws if image type is invalid', async () => {
        const data = createValidOccurrence({
          images: [createMockFile('document.pdf', 'application/pdf', 1000)]
        })

        await expect(uploader.upload(data)).rejects.toThrow('Invalid image type: application/pdf')
      })

      it('throws if image type is gif (not allowed)', async () => {
        const data = createValidOccurrence({
          images: [createMockFile('animation.gif', 'image/gif', 1000)]
        })

        await expect(uploader.upload(data)).rejects.toThrow('Invalid image type: image/gif')
      })

      it('throws if image is too large (>10MB)', async () => {
        const largeSize = 11 * 1024 * 1024 // 11MB
        const data = createValidOccurrence({
          images: [createMockFile('huge.jpg', 'image/jpeg', largeSize)]
        })

        await expect(uploader.upload(data)).rejects.toThrow('Image file too large (max 10MB)')
      })

      it('accepts jpeg images', async () => {
        const data = createValidOccurrence({
          images: [createMockFile('photo.jpg', 'image/jpeg', 1000)]
        })

        await uploader.upload(data)

        expect(mockAgent.com!.atproto.repo.createRecord).toHaveBeenCalled()
      })

      it('accepts png images', async () => {
        const data = createValidOccurrence({
          images: [createMockFile('photo.png', 'image/png', 1000)]
        })

        await uploader.upload(data)

        expect(mockAgent.com!.atproto.repo.createRecord).toHaveBeenCalled()
      })

      it('accepts webp images', async () => {
        const data = createValidOccurrence({
          images: [createMockFile('photo.webp', 'image/webp', 1000)]
        })

        await uploader.upload(data)

        expect(mockAgent.com!.atproto.repo.createRecord).toHaveBeenCalled()
      })

      it('accepts image at exactly 10MB', async () => {
        const exactSize = 10 * 1024 * 1024 // exactly 10MB
        const data = createValidOccurrence({
          images: [createMockFile('maxsize.jpg', 'image/jpeg', exactSize)]
        })

        await uploader.upload(data)

        expect(mockAgent.com!.atproto.repo.createRecord).toHaveBeenCalled()
      })

      it('accepts multiple valid images', async () => {
        const data = createValidOccurrence({
          images: [
            createMockFile('photo1.jpg', 'image/jpeg', 1000),
            createMockFile('photo2.png', 'image/png', 2000),
            createMockFile('photo3.webp', 'image/webp', 3000)
          ]
        })

        await uploader.upload(data)

        expect(mockAgent.uploadBlob).toHaveBeenCalledTimes(3)
      })

      it('throws if any image in array is invalid type', async () => {
        const data = createValidOccurrence({
          images: [
            createMockFile('photo1.jpg', 'image/jpeg', 1000),
            createMockFile('document.pdf', 'application/pdf', 1000)
          ]
        })

        await expect(uploader.upload(data)).rejects.toThrow('Invalid image type: application/pdf')
      })

      it('throws if any image in array is too large', async () => {
        const data = createValidOccurrence({
          images: [
            createMockFile('small.jpg', 'image/jpeg', 1000),
            createMockFile('huge.jpg', 'image/jpeg', 11 * 1024 * 1024)
          ]
        })

        await expect(uploader.upload(data)).rejects.toThrow('Image file too large (max 10MB)')
      })
    })

    describe('successful upload', () => {
      it('returns uri and cid on successful upload', async () => {
        const data = createValidOccurrence()

        const result = await uploader.upload(data)

        expect(result).toEqual({
          uri: 'at://did:plc:test/org.rwell.test.occurrence/1',
          cid: 'test-cid'
        })
      })

      it('includes optional fields in record', async () => {
        const data = createValidOccurrence({
          scientificName: 'Quercus alba',
          basisOfRecord: 'HumanObservation',
          verbatimLocality: 'Central Park, NYC',
          habitat: 'Urban forest',
          occurrenceRemarks: 'Large mature tree'
        })

        await uploader.upload(data)

        expect(mockAgent.com!.atproto.repo.createRecord).toHaveBeenCalledWith(
          expect.objectContaining({
            record: expect.objectContaining({
              scientificName: 'Quercus alba',
              basisOfRecord: 'HumanObservation',
              verbatimLocality: 'Central Park, NYC',
              habitat: 'Urban forest',
              occurrenceRemarks: 'Large mature tree'
            })
          })
        )
      })
    })
  })
})
