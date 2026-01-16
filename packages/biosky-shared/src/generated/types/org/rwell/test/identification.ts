/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { type BlobRef } from '@atproto/lexicon'
import { validate as _validate } from '../../../../lexicons.js'
import {
  is$typed as _is$typed,
} from '../../../../util.js'

/** A reference to a specific version of a record (AT Protocol strong ref). */
interface StrongRef {
  uri: string
  cid: string
}


const is$typed = _is$typed,
  validate = _validate
const id = 'org.rwell.test.identification'

export interface Main {
  $type: 'org.rwell.test.identification'
  subject: StrongRef
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
