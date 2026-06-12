import type { Seller } from '@shirtify/core';

import { SellerModel } from '@db/models/seller.model.js';
import type { SellerRepo, SellerRecord, NewSeller } from '@repos/ports.js';

import { toSellerRecord } from './mappers.js';

export const createMongoSellerRepo = (): SellerRepo => ({
  async create(input: NewSeller): Promise<SellerRecord> {
    const doc = await SellerModel.create(input);
    return toSellerRecord(doc);
  },

  async byId(id: string): Promise<SellerRecord | null> {
    const doc = await SellerModel.findById(id);
    return doc ? toSellerRecord(doc) : null;
  },

  async byEmail(email: string): Promise<SellerRecord | null> {
    const doc = await SellerModel.findOne({ email: email.toLowerCase() });
    return doc ? toSellerRecord(doc) : null;
  },

  async bySlug(slug: string): Promise<SellerRecord | null> {
    const doc = await SellerModel.findOne({ public_slug: slug });
    return doc ? toSellerRecord(doc) : null;
  },

  async slugExists(slug: string): Promise<boolean> {
    const count = await SellerModel.countDocuments({ public_slug: slug }).limit(1);
    return count > 0;
  },

  async patchBrand(
    id: string,
    patch: Partial<
      Pick<Seller, 'brand_logo_key' | 'brand_colors' | 'welcome_voice' | 'business_name'>
    >,
  ): Promise<SellerRecord | null> {
    const doc = await SellerModel.findByIdAndUpdate(id, patch, { new: true });
    return doc ? toSellerRecord(doc) : null;
  },
});
