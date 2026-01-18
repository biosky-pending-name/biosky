import { describe, it, expect } from 'vitest'
import type {
  OccurrenceEvent,
  ObservationEvent,
  IdentificationEvent,
  OccurrenceRow,
  IdentificationRow,
  ObservationRow
} from './types.js'

describe('types', () => {
  // ============================================================================
  // OccurrenceEvent type tests
  // ============================================================================
  describe('OccurrenceEvent', () => {
    it('accepts valid occurrence event', () => {
      const event: OccurrenceEvent = {
        did: 'did:plc:test123',
        uri: 'at://did:plc:test123/org.rwell.test.occurrence/abc',
        cid: 'bafyrei123',
        action: 'create',
        record: { scientificName: 'Quercus alba' },
        seq: 12345,
        time: '2024-01-15T10:00:00Z'
      }

      expect(event.did).toBe('did:plc:test123')
      expect(event.action).toBe('create')
    })

    it('accepts all action types', () => {
      const createEvent: OccurrenceEvent = {
        did: 'did:plc:test',
        uri: 'at://test',
        cid: 'cid',
        action: 'create',
        seq: 1,
        time: '2024-01-01'
      }

      const updateEvent: OccurrenceEvent = {
        ...createEvent,
        action: 'update'
      }

      const deleteEvent: OccurrenceEvent = {
        ...createEvent,
        action: 'delete'
      }

      expect(createEvent.action).toBe('create')
      expect(updateEvent.action).toBe('update')
      expect(deleteEvent.action).toBe('delete')
    })

    it('allows optional record field', () => {
      const eventWithRecord: OccurrenceEvent = {
        did: 'did:plc:test',
        uri: 'at://test',
        cid: 'cid',
        action: 'create',
        record: { data: 'test' },
        seq: 1,
        time: '2024-01-01'
      }

      const eventWithoutRecord: OccurrenceEvent = {
        did: 'did:plc:test',
        uri: 'at://test',
        cid: 'cid',
        action: 'delete',
        seq: 1,
        time: '2024-01-01'
      }

      expect(eventWithRecord.record).toBeDefined()
      expect(eventWithoutRecord.record).toBeUndefined()
    })
  })

  // ============================================================================
  // ObservationEvent alias tests
  // ============================================================================
  describe('ObservationEvent (legacy alias)', () => {
    it('is equivalent to OccurrenceEvent', () => {
      const event: ObservationEvent = {
        did: 'did:plc:test',
        uri: 'at://test',
        cid: 'cid',
        action: 'create',
        seq: 1,
        time: '2024-01-01'
      }

      // Can be assigned to OccurrenceEvent
      const occurrence: OccurrenceEvent = event

      expect(occurrence.did).toBe(event.did)
    })
  })

  // ============================================================================
  // IdentificationEvent type tests
  // ============================================================================
  describe('IdentificationEvent', () => {
    it('accepts valid identification event', () => {
      const event: IdentificationEvent = {
        did: 'did:plc:identifier',
        uri: 'at://did:plc:identifier/org.rwell.test.identification/xyz',
        cid: 'bafyrei456',
        action: 'create',
        record: {
          subject: { uri: 'at://test', cid: 'cid' },
          taxonName: 'Quercus alba'
        },
        seq: 67890,
        time: '2024-01-15T11:00:00Z'
      }

      expect(event.did).toBe('did:plc:identifier')
      expect(event.action).toBe('create')
    })
  })

  // ============================================================================
  // OccurrenceRow type tests
  // ============================================================================
  describe('OccurrenceRow', () => {
    it('represents database row with all fields', () => {
      const row: OccurrenceRow = {
        uri: 'at://did:plc:test/org.rwell.test.occurrence/abc',
        cid: 'bafyrei123',
        did: 'did:plc:test',
        basis_of_record: 'HumanObservation',
        scientific_name: 'Quercus alba',
        event_date: new Date('2024-01-15'),
        latitude: 40.7128,
        longitude: -74.006,
        coordinate_uncertainty_meters: 50,
        verbatim_locality: 'Central Park, NYC',
        habitat: 'Urban forest',
        occurrence_status: 'present',
        occurrence_remarks: 'Large mature tree',
        individual_count: 1,
        sex: null,
        life_stage: 'adult',
        reproductive_condition: null,
        behavior: 'stationary',
        establishment_means: 'native',
        associated_media: [{ image: { ref: 'blob123' }, alt: 'Photo' }],
        recorded_by: 'did:plc:observer',
        created_at: new Date('2024-01-15T10:00:00Z')
      }

      expect(row.latitude).toBe(40.7128)
      expect(row.scientific_name).toBe('Quercus alba')
    })

    it('allows null for optional fields', () => {
      const minimalRow: OccurrenceRow = {
        uri: 'at://test',
        cid: 'cid',
        did: 'did:plc:test',
        basis_of_record: 'HumanObservation',
        scientific_name: null,
        event_date: new Date(),
        latitude: 0,
        longitude: 0,
        coordinate_uncertainty_meters: null,
        verbatim_locality: null,
        habitat: null,
        occurrence_status: 'present',
        occurrence_remarks: null,
        individual_count: null,
        sex: null,
        life_stage: null,
        reproductive_condition: null,
        behavior: null,
        establishment_means: null,
        associated_media: [],
        recorded_by: null,
        created_at: new Date()
      }

      expect(minimalRow.scientific_name).toBeNull()
      expect(minimalRow.coordinate_uncertainty_meters).toBeNull()
    })

    it('has optional distance_meters for nearby queries', () => {
      const rowWithDistance: OccurrenceRow = {
        uri: 'at://test',
        cid: 'cid',
        did: 'did:plc:test',
        basis_of_record: 'HumanObservation',
        scientific_name: 'Quercus alba',
        event_date: new Date(),
        latitude: 40.7128,
        longitude: -74.006,
        coordinate_uncertainty_meters: null,
        verbatim_locality: null,
        habitat: null,
        occurrence_status: 'present',
        occurrence_remarks: null,
        individual_count: null,
        sex: null,
        life_stage: null,
        reproductive_condition: null,
        behavior: null,
        establishment_means: null,
        associated_media: [],
        recorded_by: null,
        created_at: new Date(),
        distance_meters: 1500
      }

      expect(rowWithDistance.distance_meters).toBe(1500)
    })
  })

  // ============================================================================
  // IdentificationRow type tests
  // ============================================================================
  describe('IdentificationRow', () => {
    it('represents database row with all fields', () => {
      const row: IdentificationRow = {
        uri: 'at://did:plc:test/org.rwell.test.identification/xyz',
        cid: 'bafyrei456',
        did: 'did:plc:identifier',
        subject_uri: 'at://did:plc:test/org.rwell.test.occurrence/abc',
        subject_cid: 'bafyrei123',
        scientific_name: 'Quercus alba',
        taxon_rank: 'species',
        identification_qualifier: null,
        taxon_id: 'gbif:12345',
        identification_remarks: 'Identified by bark pattern',
        identification_verification_status: 'verified',
        type_status: null,
        is_agreement: true,
        date_identified: new Date('2024-01-15T11:00:00Z')
      }

      expect(row.scientific_name).toBe('Quercus alba')
      expect(row.is_agreement).toBe(true)
    })

    it('allows null for optional fields', () => {
      const minimalRow: IdentificationRow = {
        uri: 'at://test',
        cid: 'cid',
        did: 'did:plc:test',
        subject_uri: 'at://subject',
        subject_cid: 'subject-cid',
        scientific_name: 'Unknown',
        taxon_rank: null,
        identification_qualifier: null,
        taxon_id: null,
        identification_remarks: null,
        identification_verification_status: null,
        type_status: null,
        is_agreement: false,
        date_identified: new Date()
      }

      expect(minimalRow.taxon_rank).toBeNull()
    })
  })

  // ============================================================================
  // ObservationRow alias tests
  // ============================================================================
  describe('ObservationRow (legacy alias)', () => {
    it('is equivalent to OccurrenceRow', () => {
      const row: ObservationRow = {
        uri: 'at://test',
        cid: 'cid',
        did: 'did:plc:test',
        basis_of_record: 'HumanObservation',
        scientific_name: null,
        event_date: new Date(),
        latitude: 0,
        longitude: 0,
        coordinate_uncertainty_meters: null,
        verbatim_locality: null,
        habitat: null,
        occurrence_status: 'present',
        occurrence_remarks: null,
        individual_count: null,
        sex: null,
        life_stage: null,
        reproductive_condition: null,
        behavior: null,
        establishment_means: null,
        associated_media: [],
        recorded_by: null,
        created_at: new Date()
      }

      // Can be assigned to OccurrenceRow
      const occurrence: OccurrenceRow = row

      expect(occurrence.uri).toBe(row.uri)
    })
  })
})
