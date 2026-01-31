/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { type ValidationResult, BlobRef } from '@atproto/lexicon'
import { CID } from 'multiformats/cid'
import { validate as _validate } from '../../../../lexicons'
import {
  type $Typed,
  is$typed as _is$typed,
  type OmitKey,
} from '../../../../util'
import type * as ComAtprotoRepoStrongRef from '../../../com/atproto/repo/strongRef.js'

const is$typed = _is$typed,
  validate = _validate
const id = 'org.rwell.test.interaction'

export interface Main {
  $type: 'org.rwell.test.interaction'
  subjectA: InteractionSubject
  subjectB: InteractionSubject
  /** Type of ecological interaction between the subjects. */
  interactionType:
    | 'predation'
    | 'pollination'
    | 'parasitism'
    | 'herbivory'
    | 'symbiosis'
    | 'mutualism'
    | 'competition'
    | 'shelter'
    | 'transportation'
    | 'oviposition'
    | 'seed_dispersal'
    | (string & {})
  /** Direction of the interaction: AtoB means A acts on B, BtoA means B acts on A, bidirectional means mutual. */
  direction: 'AtoB' | 'BtoA' | 'bidirectional'
  /** Confidence level in the interaction observation. */
  confidence: 'low' | 'medium' | 'high'
  /** Additional notes about the interaction. */
  comment?: string
  /** Timestamp when this record was created. */
  createdAt: string
  [k: string]: unknown
}

const hashMain = 'main'

export function isMain<V>(v: V) {
  return is$typed(v, id, hashMain)
}

export function validateMain<V>(v: V) {
  return validate<Main & V>(v, id, hashMain, true)
}

export {
  type Main as Record,
  isMain as isRecord,
  validateMain as validateRecord,
}

/** A subject in an interaction - can reference an existing occurrence or just specify a taxon name. */
export interface InteractionSubject {
  $type?: 'org.rwell.test.interaction#interactionSubject'
  occurrence?: ComAtprotoRepoStrongRef.Main
  /** Index of the subject within the occurrence (for multi-subject observations). */
  subjectIndex: number
  /** Scientific name of the organism (for unobserved subjects or to override occurrence ID). */
  taxonName?: string
  /** Taxonomic kingdom to disambiguate homonyms. */
  kingdom?: string
}

const hashInteractionSubject = 'interactionSubject'

export function isInteractionSubject<V>(v: V) {
  return is$typed(v, id, hashInteractionSubject)
}

export function validateInteractionSubject<V>(v: V) {
  return validate<InteractionSubject & V>(v, id, hashInteractionSubject)
}
