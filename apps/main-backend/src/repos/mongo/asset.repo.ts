import type { Asset } from '@shirtify/core';
import { Types } from 'mongoose';

import { AssetModel } from '@db/models/asset.model.js';
import type { AssetRepo, NewAsset } from '@repos/ports.js';

import { toAsset } from './mappers.js';

const oid = (id?: string): Types.ObjectId | null =>
  id && Types.ObjectId.isValid(id) ? new Types.ObjectId(id) : null;

export const createMongoAssetRepo = (): AssetRepo => ({
  async create(input: NewAsset): Promise<Asset> {
    const doc = await AssetModel.create({
      seller_id: oid(input.seller_id),
      session_id: oid(input.session_id),
      kind: input.kind,
      storage_key: input.storage_key,
      mime: input.mime,
      width: input.width ?? null,
      height: input.height ?? null,
      bytes: input.bytes ?? null,
    });
    return toAsset(doc);
  },

  async byId(id: string): Promise<Asset | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await AssetModel.findById(id);
    return doc ? toAsset(doc) : null;
  },

  async byStorageKey(key: string): Promise<Asset | null> {
    const doc = await AssetModel.findOne({ storage_key: key });
    return doc ? toAsset(doc) : null;
  },
});
