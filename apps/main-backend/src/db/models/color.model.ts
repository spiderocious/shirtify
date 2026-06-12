import { Schema, model, type HydratedDocument, type InferSchemaType } from 'mongoose';

const colorSchema = new Schema(
  {
    scope: { type: String, enum: ['platform', 'seller'], required: true, index: true },
    // null for platform colours; set for seller-owned colours.
    seller_id: { type: Schema.Types.ObjectId, ref: 'Seller', default: null, index: true },
    slug: { type: String, required: true },
    label: { type: String, required: true },
    hex: { type: String, required: true },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);

// A slug is unique within its owner scope: platform-wide, or per-seller.
colorSchema.index({ seller_id: 1, slug: 1 }, { unique: true });

export type ColorDoc = HydratedDocument<InferSchemaType<typeof colorSchema>>;
export const ColorModel = model('Color', colorSchema);
