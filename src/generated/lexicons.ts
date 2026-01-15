/**
 * GENERATED CODE - DO NOT MODIFY
 */
import {
  type LexiconDoc,
  Lexicons,
  ValidationError,
  type ValidationResult,
} from '@atproto/lexicon'
import { type $Typed, is$typed, maybe$typed } from './util.js'

export const schemaDict = {
  OrgRwellTestIdentification: {
    lexicon: 1,
    id: 'org.rwell.test.identification',
    defs: {
      main: {
        type: 'record',
        description:
          'An identification suggestion for an existing observation. Used to propose or agree with a taxonomic identification.',
        key: 'tid',
        record: {
          type: 'object',
          required: ['subject', 'taxonName', 'createdAt'],
          properties: {
            subject: {
              type: 'ref',
              ref: 'lex:com.atproto.repo.strongRef',
              description:
                'A strong reference (CID + URI) to the observation being identified.',
            },
            taxonName: {
              type: 'string',
              description:
                'The scientific name being proposed for the observation.',
              maxLength: 256,
            },
            taxonRank: {
              type: 'string',
              description:
                'The taxonomic rank of the identification (e.g., species, genus, family).',
              enum: [
                'kingdom',
                'phylum',
                'class',
                'order',
                'family',
                'genus',
                'species',
                'subspecies',
                'variety',
              ],
              default: 'species',
            },
            comment: {
              type: 'string',
              description: 'Explanation or reasoning for this identification.',
              maxLength: 3000,
            },
            isAgreement: {
              type: 'boolean',
              description:
                'If true, this identification agrees with the current community ID rather than proposing a new one.',
              default: false,
            },
            confidence: {
              type: 'string',
              description:
                "The identifier's confidence level in this identification.",
              enum: ['low', 'medium', 'high'],
              default: 'medium',
            },
            createdAt: {
              type: 'string',
              format: 'datetime',
              description: 'Timestamp when this identification was created.',
            },
          },
        },
      },
    },
  },
} as const satisfies Record<string, LexiconDoc>
export const schemas = Object.values(schemaDict) satisfies LexiconDoc[]
export const lexicons: Lexicons = new Lexicons(schemas)

export function validate<T extends { $type: string }>(
  v: unknown,
  id: string,
  hash: string,
  requiredType: true,
): ValidationResult<T>
export function validate<T extends { $type?: string }>(
  v: unknown,
  id: string,
  hash: string,
  requiredType?: false,
): ValidationResult<T>
export function validate(
  v: unknown,
  id: string,
  hash: string,
  requiredType?: boolean,
): ValidationResult {
  return (requiredType ? is$typed : maybe$typed)(v, id, hash)
    ? lexicons.validate(`${id}#${hash}`, v)
    : {
        success: false,
        error: new ValidationError(
          `Must be an object with "${hash === 'main' ? id : `${id}#${hash}`}" $type property`,
        ),
      }
}

export const ids = {
  OrgRwellTestIdentification: 'org.rwell.test.identification',
} as const
