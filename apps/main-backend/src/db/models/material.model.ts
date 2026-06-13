import { Schema, model, type HydratedDocument, type InferSchemaType } from 'mongoose';

const materialSchema = new Schema(
  {
    scope: { type: String, enum: ['platform', 'seller'], required: true, index: true },
    seller_id: { type: Schema.Types.ObjectId, ref: 'Seller', default: null, index: true },
    slug: { type: String, required: true },
    label: { type: String, required: true },
    // Seller-uploaded photo key; null for built-in vector materials.
    image_key: { type: String, default: null },
    // Built-in silhouette key (tee/hoodie/polo/oversized) when image_key is null.
    builtin_shape: { type: String, default: null },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);

materialSchema.index({ seller_id: 1, slug: 1 }, { unique: true });

export type MaterialDoc = HydratedDocument<InferSchemaType<typeof materialSchema>>;
export const MaterialModel = model('Material', materialSchema);
