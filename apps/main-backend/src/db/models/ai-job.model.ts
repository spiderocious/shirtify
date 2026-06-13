import { Schema, model, type HydratedDocument, type InferSchemaType } from 'mongoose';

const resultSchema = new Schema(
  {
    storage_key: { type: String, required: true },
    width: { type: Number, default: null },
    height: { type: Number, default: null },
  },
  { _id: false },
);

const aiJobSchema = new Schema(
  {
    session_id: { type: Schema.Types.ObjectId, ref: 'Session', required: true, index: true },
    seller_id: { type: Schema.Types.ObjectId, ref: 'Seller', default: null, index: true },
    kind: { type: String, enum: ['generate', 'edit', 'tryon'], required: true },
    status: {
      type: String,
      enum: ['pending', 'running', 'done', 'failed'],
      default: 'pending',
      index: true,
    },
    prompt: { type: String, default: '' },
    layer_id: { type: String, default: null },
    results: { type: [resultSchema], default: [] },
    error: { type: String, default: null },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);

export type AiJobDoc = HydratedDocument<InferSchemaType<typeof aiJobSchema>>;
export const AiJobModel = model('AiJob', aiJobSchema);
