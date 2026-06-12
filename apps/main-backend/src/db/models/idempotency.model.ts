import { Schema, model, type HydratedDocument, type InferSchemaType } from 'mongoose';

/**
 * Records the result of an idempotent write so a retried request (same
 * Idempotency-Key) returns the original result instead of creating a duplicate.
 * Scoped per seller + operation. TTL-expired after 24h.
 */
const idempotencySchema = new Schema(
  {
    seller_id: { type: Schema.Types.ObjectId, ref: 'Seller', required: true },
    operation: { type: String, required: true },
    key: { type: String, required: true },
    result_id: { type: Schema.Types.ObjectId, required: true },
    created_at: { type: Date, default: Date.now },
  },
);

idempotencySchema.index({ seller_id: 1, operation: 1, key: 1 }, { unique: true });
idempotencySchema.index({ created_at: 1 }, { expireAfterSeconds: 24 * 60 * 60 });

export type IdempotencyDoc = HydratedDocument<InferSchemaType<typeof idempotencySchema>>;
export const IdempotencyModel = model('Idempotency', idempotencySchema);
