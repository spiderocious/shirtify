import { type Fill } from '@shirtify/core';

/**
 * Map our Fill (solid string or linear gradient) onto Konva fill props. Konva
 * uses `fill` for solids and `fillLinearGradient*` for gradients over the node's
 * local box (0..w, 0..h). We approximate the angle within that box.
 */
export interface KonvaFillProps {
  fill?: string;
  fillLinearGradientStartPoint?: { x: number; y: number };
  fillLinearGradientEndPoint?: { x: number; y: number };
  fillLinearGradientColorStops?: Array<number | string>;
}

export const toKonvaFill = (fill: Fill, w: number, h: number): KonvaFillProps => {
  if (typeof fill === 'string') return { fill };
  const rad = (fill.angle * Math.PI) / 180;
  const cx = Math.cos(rad);
  const cy = Math.sin(rad);
  const stops: Array<number | string> = [];
  for (const s of fill.stops) {
    stops.push(s.offset, s.color);
  }
  return {
    fillLinearGradientStartPoint: { x: (w / 2) * (1 - cx), y: (h / 2) * (1 - cy) },
    fillLinearGradientEndPoint: { x: (w / 2) * (1 + cx), y: (h / 2) * (1 + cy) },
    fillLinearGradientColorStops: stops,
  };
};
