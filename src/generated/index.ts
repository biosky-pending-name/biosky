/**
 * GENERATED CODE - DO NOT MODIFY
 */
import {
  XrpcClient,
  type FetchHandler,
  type FetchHandlerOptions,
} from '@atproto/xrpc'
import { schemas } from './lexicons.js'
import { CID } from 'multiformats/cid'
import { type OmitKey, type Un$Typed } from './util.js'
import * as OrgRwellTestIdentification from './types/org/rwell/test/identification.js'
import * as OrgRwellTestOccurrence from './types/org/rwell/test/occurrence.js'

export * as OrgRwellTestIdentification from './types/org/rwell/test/identification.js'
export * as OrgRwellTestOccurrence from './types/org/rwell/test/occurrence.js'

export class AtpBaseClient extends XrpcClient {
  org: OrgNS

  constructor(options: FetchHandler | FetchHandlerOptions) {
    super(options, schemas)
    this.org = new OrgNS(this)
  }

  /** @deprecated use `this` instead */
  get xrpc(): XrpcClient {
    return this
  }
}

export class OrgNS {
  _client: XrpcClient
  rwell: OrgRwellNS

  constructor(client: XrpcClient) {
    this._client = client
    this.rwell = new OrgRwellNS(client)
  }
}

export class OrgRwellNS {
  _client: XrpcClient
  test: OrgRwellTestNS

  constructor(client: XrpcClient) {
    this._client = client
    this.test = new OrgRwellTestNS(client)
  }
}

export class OrgRwellTestNS {
  _client: XrpcClient
  identification: OrgRwellTestIdentificationRecord
  occurrence: OrgRwellTestOccurrenceRecord

  constructor(client: XrpcClient) {
    this._client = client
    this.identification = new OrgRwellTestIdentificationRecord(client)
    this.occurrence = new OrgRwellTestOccurrenceRecord(client)
  }
}

export class OrgRwellTestIdentificationRecord {
  _client: XrpcClient

  constructor(client: XrpcClient) {
    this._client = client
  }

  async list(
    params: OmitKey<ComAtprotoRepoListRecords.QueryParams, 'collection'>,
  ): Promise<{
    cursor?: string
    records: { uri: string; value: OrgRwellTestIdentification.Record }[]
  }> {
    const res = await this._client.call('com.atproto.repo.listRecords', {
      collection: 'org.rwell.test.identification',
      ...params,
    })
    return res.data
  }

  async get(
    params: OmitKey<ComAtprotoRepoGetRecord.QueryParams, 'collection'>,
  ): Promise<{
    uri: string
    cid: string
    value: OrgRwellTestIdentification.Record
  }> {
    const res = await this._client.call('com.atproto.repo.getRecord', {
      collection: 'org.rwell.test.identification',
      ...params,
    })
    return res.data
  }

  async create(
    params: OmitKey<
      ComAtprotoRepoCreateRecord.InputSchema,
      'collection' | 'record'
    >,
    record: Un$Typed<OrgRwellTestIdentification.Record>,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    const collection = 'org.rwell.test.identification'
    const res = await this._client.call(
      'com.atproto.repo.createRecord',
      undefined,
      { collection, ...params, record: { ...record, $type: collection } },
      { encoding: 'application/json', headers },
    )
    return res.data
  }

  async put(
    params: OmitKey<
      ComAtprotoRepoPutRecord.InputSchema,
      'collection' | 'record'
    >,
    record: Un$Typed<OrgRwellTestIdentification.Record>,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    const collection = 'org.rwell.test.identification'
    const res = await this._client.call(
      'com.atproto.repo.putRecord',
      undefined,
      { collection, ...params, record: { ...record, $type: collection } },
      { encoding: 'application/json', headers },
    )
    return res.data
  }

  async delete(
    params: OmitKey<ComAtprotoRepoDeleteRecord.InputSchema, 'collection'>,
    headers?: Record<string, string>,
  ): Promise<void> {
    await this._client.call(
      'com.atproto.repo.deleteRecord',
      undefined,
      { collection: 'org.rwell.test.identification', ...params },
      { headers },
    )
  }
}

export class OrgRwellTestOccurrenceRecord {
  _client: XrpcClient

  constructor(client: XrpcClient) {
    this._client = client
  }

  async list(
    params: OmitKey<ComAtprotoRepoListRecords.QueryParams, 'collection'>,
  ): Promise<{
    cursor?: string
    records: { uri: string; value: OrgRwellTestOccurrence.Record }[]
  }> {
    const res = await this._client.call('com.atproto.repo.listRecords', {
      collection: 'org.rwell.test.occurrence',
      ...params,
    })
    return res.data
  }

  async get(
    params: OmitKey<ComAtprotoRepoGetRecord.QueryParams, 'collection'>,
  ): Promise<{
    uri: string
    cid: string
    value: OrgRwellTestOccurrence.Record
  }> {
    const res = await this._client.call('com.atproto.repo.getRecord', {
      collection: 'org.rwell.test.occurrence',
      ...params,
    })
    return res.data
  }

  async create(
    params: OmitKey<
      ComAtprotoRepoCreateRecord.InputSchema,
      'collection' | 'record'
    >,
    record: Un$Typed<OrgRwellTestOccurrence.Record>,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    const collection = 'org.rwell.test.occurrence'
    const res = await this._client.call(
      'com.atproto.repo.createRecord',
      undefined,
      { collection, ...params, record: { ...record, $type: collection } },
      { encoding: 'application/json', headers },
    )
    return res.data
  }

  async put(
    params: OmitKey<
      ComAtprotoRepoPutRecord.InputSchema,
      'collection' | 'record'
    >,
    record: Un$Typed<OrgRwellTestOccurrence.Record>,
    headers?: Record<string, string>,
  ): Promise<{ uri: string; cid: string }> {
    const collection = 'org.rwell.test.occurrence'
    const res = await this._client.call(
      'com.atproto.repo.putRecord',
      undefined,
      { collection, ...params, record: { ...record, $type: collection } },
      { encoding: 'application/json', headers },
    )
    return res.data
  }

  async delete(
    params: OmitKey<ComAtprotoRepoDeleteRecord.InputSchema, 'collection'>,
    headers?: Record<string, string>,
  ): Promise<void> {
    await this._client.call(
      'com.atproto.repo.deleteRecord',
      undefined,
      { collection: 'org.rwell.test.occurrence', ...params },
      { headers },
    )
  }
}
