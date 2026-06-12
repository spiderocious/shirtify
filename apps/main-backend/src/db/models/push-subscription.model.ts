import { Schema, model, type HydratedDocument, type InferSchemaType } from 'mongoose';

const pushSubscriptionSchema = new Schema(
  {
    seller_id: { type: Schema.Types.ObjectId, ref: 'Seller', required: true, index: true },
    endpoint: { type: String, required: true, unique: true },
    p256dh: { type: String, required: true },
    auth: { type: String, required: true },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);

export type PushSubscriptionDoc = HydratedDocument<InferSchemaType<typeof pushSubscriptionSchema>>;
export const PushSubscriptionModel = model('PushSubscription', pushSubscriptionSchema);
