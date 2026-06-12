import { Schema, model, Types, type HydratedDocument, type InferSchemaType } from 'mongoose';

const sessionSchema = new Schema(
  {
    seller_id: { type: Schema.Types.ObjectId, ref: 'Seller', required: true, index: true },
    kind: { type: String, enum: ['custom', 'public'], required: true },
    token: { type: String, required: true, unique: true, index: true },
    customer_name: { type: String, default: null },
    shirt_type: { type: String, enum: ['tee', 'hoodie', 'polo', 'oversized'], required: true },
    shirt_color: { type: String, required: true },
    allowed_colors: { type: [String], default: null },
    price_quoted: { type: Number, default: null },
    notes: { type: String, default: null },
    status: {
      type: String,
      enum: ['in_progress', 'submitted', 'archived'],
      default: 'in_progress',
      index: true,
    },
    last_activity_at: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);

// Cursor pagination index: newest-first within a seller.
sessionSchema.index({ seller_id: 1, _id: -1 });

export type SessionDoc = HydratedDocument<InferSchemaType<typeof sessionSchema>>;
export const SessionModel = model('Session', sessionSchema);
export { Types as MongoTypes };
