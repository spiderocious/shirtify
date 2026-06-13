import { PublicBrandSchema, type PublicBrand } from '@shirtify/core';

import type { SellerRecord } from '@repos/ports.js';

/** Map a seller record → the public brand subset exposed on customer pages. */
export const toPublicBrand = (seller: SellerRecord): PublicBrand =>
  PublicBrandSchema.parse({
    business_name: seller.business_name,
    public_slug: seller.public_slug,
    brand_logo_key: seller.brand_logo_key,
    brand_colors: seller.brand_colors,
    welcome_voice: seller.welcome_voice,
    description: seller.description,
    storefront_color: seller.storefront_color,
    storefront_font: seller.storefront_font,
  });
