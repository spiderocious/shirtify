import type { Color } from '@shirtify/core';
import { Types } from 'mongoose';

import { ColorModel } from '@db/models/color.model.js';
import type { ColorRepo, NewColor } from '@repos/ports.js';

import { toColor } from './mappers.js';

export const createMongoColorRepo = (): ColorRepo => ({
  async listForSeller(sellerId: string): Promise<Color[]> {
    const docs = await ColorModel.find({
      $or: [{ scope: 'platform' }, { seller_id: new Types.ObjectId(sellerId) }],
    }).sort({ scope: 1, label: 1 });
    return docs.map(toColor);
  },

  async listPlatform(): Promise<Color[]> {
    const docs = await ColorModel.find({ scope: 'platform' }).sort({ label: 1 });
    return docs.map(toColor);
  },

  async create(input: NewColor): Promise<Color> {
    const doc = await ColorModel.create({
      scope: input.scope,
      seller_id: input.seller_id ? new Types.ObjectId(input.seller_id) : null,
      slug: input.slug,
      label: input.label,
      hex: input.hex,
    });
    return toColor(doc);
  },

  async bySellerAndId(sellerId: string, id: string): Promise<Color | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await ColorModel.findOne({
      _id: new Types.ObjectId(id),
      seller_id: new Types.ObjectId(sellerId),
    });
    return doc ? toColor(doc) : null;
  },

  async remove(id: string): Promise<void> {
    await ColorModel.deleteOne({ _id: new Types.ObjectId(id) });
  },

  async ensurePlatform(input: { slug: string; label: string; hex: string }): Promise<void> {
    await ColorModel.updateOne(
      { scope: 'platform', seller_id: null, slug: input.slug },
      { $setOnInsert: { label: input.label, hex: input.hex } },
      { upsert: true },
    );
  },
});
