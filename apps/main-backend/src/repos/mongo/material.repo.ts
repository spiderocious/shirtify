import type { Material } from '@shirtify/core';
import { Types } from 'mongoose';

import { MaterialModel } from '@db/models/material.model.js';
import type { MaterialRepo, NewMaterial } from '@repos/ports.js';

import { toMaterial } from './mappers.js';

export const createMongoMaterialRepo = (): MaterialRepo => ({
  async listForSeller(sellerId: string): Promise<Material[]> {
    const docs = await MaterialModel.find({
      $or: [{ scope: 'platform' }, { seller_id: new Types.ObjectId(sellerId) }],
    }).sort({ scope: 1, label: 1 });
    return docs.map(toMaterial);
  },

  async listPlatform(): Promise<Material[]> {
    const docs = await MaterialModel.find({ scope: 'platform' }).sort({ label: 1 });
    return docs.map(toMaterial);
  },

  async create(input: NewMaterial): Promise<Material> {
    const doc = await MaterialModel.create({
      scope: input.scope,
      seller_id: input.seller_id ? new Types.ObjectId(input.seller_id) : null,
      slug: input.slug,
      label: input.label,
      image_key: input.image_key ?? null,
      builtin_shape: input.builtin_shape ?? null,
    });
    return toMaterial(doc);
  },

  async bySellerAndId(sellerId: string, id: string): Promise<Material | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await MaterialModel.findOne({
      _id: new Types.ObjectId(id),
      seller_id: new Types.ObjectId(sellerId),
    });
    return doc ? toMaterial(doc) : null;
  },

  async remove(id: string): Promise<void> {
    await MaterialModel.deleteOne({ _id: new Types.ObjectId(id) });
  },

  async ensurePlatform(input: {
    slug: string;
    label: string;
    image_key?: string;
    builtin_shape?: string;
  }): Promise<void> {
    await MaterialModel.updateOne(
      { scope: 'platform', seller_id: null, slug: input.slug },
      {
        $setOnInsert: {
          label: input.label,
          image_key: input.image_key ?? null,
          builtin_shape: input.builtin_shape ?? null,
        },
      },
      { upsert: true },
    );
  },
});
