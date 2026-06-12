import { Types } from 'mongoose';

import { PushSubscriptionModel } from '@db/models/push-subscription.model.js';
import type { PushSubscriptionRepo, PushSubscriptionRecord } from '@repos/ports.js';

const toRecord = (doc: {
  _id: Types.ObjectId;
  seller_id: Types.ObjectId;
  endpoint: string;
  p256dh: string;
  auth: string;
}): PushSubscriptionRecord => ({
  id: doc._id.toString(),
  seller_id: doc.seller_id.toString(),
  endpoint: doc.endpoint,
  p256dh: doc.p256dh,
  auth: doc.auth,
});

export const createMongoPushSubscriptionRepo = (): PushSubscriptionRepo => ({
  async upsert(input: Omit<PushSubscriptionRecord, 'id'>): Promise<PushSubscriptionRecord> {
    const doc = await PushSubscriptionModel.findOneAndUpdate(
      { endpoint: input.endpoint },
      {
        seller_id: new Types.ObjectId(input.seller_id),
        endpoint: input.endpoint,
        p256dh: input.p256dh,
        auth: input.auth,
      },
      { new: true, upsert: true },
    );
    return toRecord(doc);
  },

  async listBySeller(sellerId: string): Promise<PushSubscriptionRecord[]> {
    const docs = await PushSubscriptionModel.find({ seller_id: new Types.ObjectId(sellerId) });
    return docs.map(toRecord);
  },

  async removeByEndpoint(endpoint: string): Promise<void> {
    await PushSubscriptionModel.deleteOne({ endpoint });
  },
});
