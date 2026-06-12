import { Schema, model, type HydratedDocument, type InferSchemaType } from 'mongoose';

const assetSchema = new Schema(
  {
    seller_id: { type: Schema.Types.ObjectId, ref: 'Seller', default: null, index: true },
    session_id: { type: Schema.Types.ObjectId, ref: 'Session', default: null, index: true },
    kind: { type: String, enum: ['upload', 'export', 'logo', 'ai'], required: true },
    storage_key: { type: String, required: true },
    mime: { type: String, required: true },
    width: { type: Number, default: null },
    height: { type: Number, default: null },
    bytes: { type: Number, default: null },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);

export type AssetDoc = HydratedDocument<InferSchemaType<typeof assetSchema>>;
export const AssetModel = model('Asset', assetSchema);
