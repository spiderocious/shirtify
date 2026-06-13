import { Schema, model, type InferSchemaType, type HydratedDocument } from 'mongoose';

const brandColorsSchema = new Schema(
  {
    primary: { type: String, required: true },
    accent: { type: String, required: true },
    ink: { type: String, required: true },
    surface: { type: String, required: true },
  },
  { _id: false },
);

const sellerSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password_hash: { type: String, required: true },
    business_name: { type: String, required: true },
    public_slug: { type: String, required: true, unique: true },
    brand_logo_key: { type: String, default: null },
    brand_colors: { type: brandColorsSchema, default: null },
    welcome_voice: { type: String, default: null },
    description: { type: String, default: null },
    storefront_color: { type: String, default: null },
    storefront_font: { type: String, default: null },
    storefront_theme: { type: Schema.Types.Mixed, default: null },
    visible_materials: { type: [String], default: null },
    registration_status: {
      type: String,
      enum: ['AWAITING_BUSINESS_SUBMISSION', 'BUSINESS_SUBMITTED'],
      default: 'AWAITING_BUSINESS_SUBMISSION',
    },
    role: { type: String, enum: ['seller', 'admin'], default: 'seller' },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);

export type SellerDoc = HydratedDocument<InferSchemaType<typeof sellerSchema>>;
export const SellerModel = model('Seller', sellerSchema);
