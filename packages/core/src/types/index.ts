// Domain types are inferred from the Zod schemas (single source of truth).
// Re-exported here so consumers can `import type { Session } from '@shirtify/core'`.

export type {
  Seller,
  SellerRole,
  RegistrationStatus,
  BrandColors,
  PublicBrand,
  StorefrontConfig,
  Session,
  SessionKind,
  SessionStatus,
  SessionVisibility,
  PublicSession,
  Design,
  Asset,
  AssetKind,
  Color,
  ColorScope,
  Material,
  MaterialScope,
  StorefrontItem,
  StorefrontTheme,
  HeroStyle,
  StorefrontLayout,
} from '../schemas/domain.js';

export type {
  Scene,
  SceneSide,
  Layer,
  TextLayer,
  ImageLayer,
  ShapeLayer,
  GraphicLayer,
  GraphicNode,
  ShapeKind,
  Gradient,
  Fill,
  FilterKind,
  ShirtType,
} from '../schemas/scene.js';

/** Cursor-paginated result shape, shared across list endpoints. */
export interface PaginatedResult<T> {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
}
