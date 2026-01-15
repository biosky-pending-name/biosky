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
const id = 'org.rwell.test.identification'

export interface Main {
  $type: 'org.rwell.test.identification'
  subject: ComAtprotoRepoStrongRef.Main
  /** The scientific name being proposed for the observation. */
  taxonName: string
  /** The taxonomic rank of the identification (e.g., species, genus, family). */
  taxonRank:
    | 'kingdom'
    | 'phylum'
    | 'class'
    | 'order'
    | 'family'
    | 'genus'
    | 'species'
    | 'subspecies'
    | 'variety'
  /** Explanation or reasoning for this identification. */
  comment?: string
  /** If true, this identification agrees with the current community ID rather than proposing a new one. */
  isAgreement: boolean
  /** The identifier's confidence level in this identification. */
  confidence: 'low' | 'medium' | 'high'
  /** Timestamp when this identification was created. */
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
