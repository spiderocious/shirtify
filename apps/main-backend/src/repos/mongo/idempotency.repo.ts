import { Types } from 'mongoose';

import { IdempotencyModel } from '@db/models/idempotency.model.js';
import type { IdempotencyRepo } from '@repos/ports.js';

export const createMongoIdempotencyRepo = (): IdempotencyRepo => ({
  async lookup(sellerId: string, operation: string, key: string): Promise<string | null> {
    const doc = await IdempotencyModel.findOne({
      seller_id: new Types.ObjectId(sellerId),
      operation,
      key,
    });
    return doc ? doc.result_id.toString() : null;
  },

  async record(
    sellerId: string,
    operation: string,
    key: string,
    resultId: string,
  ): Promise<boolean> {
    try {
      await IdempotencyModel.create({
        seller_id: new Types.ObjectId(sellerId),
        operation,
        key,
        result_id: new Types.ObjectId(resultId),
      });
      return true;
    } catch (err) {
      // Unique-index violation = another request already recorded this key.
      if ((err as { code?: number }).code === 11000) return false;
      throw err;
    }
  },
});
