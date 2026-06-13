import Konva from 'konva';

import { type FilterKind } from '@shirtify/core';

/**
 * Map our FilterKind → Konva filter functions + the params they need. Image
 * layers (and the whole stage, via a group cache) apply these. `none` clears.
 */
export interface KonvaFilterSpec {
  filters: Array<typeof Konva.Filters.Grayscale>;
  // Numeric params applied to the node alongside the filters.
  params?: Record<string, number>;
}

export const toKonvaFilters = (kind: FilterKind): KonvaFilterSpec => {
  switch (kind) {
    case 'grayscale':
      return { filters: [Konva.Filters.Grayscale] };
    case 'noir':
      return { filters: [Konva.Filters.Grayscale, Konva.Filters.Contrast], params: { contrast: 40 } };
    case 'sepia':
      return { filters: [Konva.Filters.Sepia] };
    case 'vintage':
      return { filters: [Konva.Filters.Sepia, Konva.Filters.Brighten], params: { brightness: -0.05 } };
    case 'invert':
      return { filters: [Konva.Filters.Invert] };
    case 'cool':
      return { filters: [Konva.Filters.HSL], params: { hue: 200, saturation: 0.1, luminance: 0 } };
    case 'warm':
      return { filters: [Konva.Filters.HSL], params: { hue: 30, saturation: 0.15, luminance: 0 } };
    case 'none':
    default:
      return { filters: [] };
  }
};
