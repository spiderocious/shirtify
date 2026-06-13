import { type ShirtType, type SceneSide } from '@shirtify/core';
import { Path, Group } from 'react-konva';

/**
 * A stylised shirt silhouette drawn behind the design, filled with the chosen
 * base colour. Not a photoreal mockup — a clean, neutral canvas so the design
 * reads clearly. The print area is the centre square (the stage's 0..1 space).
 */
export interface ShirtBackdropProps {
  type: ShirtType;
  color: string;
  side: SceneSide;
  size: number;
}

// A simple tee/hoodie outline path, normalised to a 100×100 box then scaled.
const TEE_PATH =
  'M30 12 L42 8 Q50 14 58 8 L70 12 L86 26 L78 40 L70 34 L70 92 L30 92 L30 34 L22 40 L14 26 Z';
const HOODIE_PATH =
  'M30 14 L42 8 Q50 16 58 8 L70 14 L88 30 L79 44 L70 38 L70 92 L30 92 L30 38 L21 44 L12 30 Z';

const pathFor = (type: ShirtType): string => (type === 'hoodie' || type === 'oversized' ? HOODIE_PATH : TEE_PATH);

// Slightly darken the fill for the back side so front/back read differently.
const shade = (hex: string, amount: number): string => {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m || m[1] === undefined) return hex;
  const n = parseInt(m[1], 16);
  const r = Math.max(0, ((n >> 16) & 255) - amount);
  const g = Math.max(0, ((n >> 8) & 255) - amount);
  const b = Math.max(0, (n & 255) - amount);
  return `rgb(${r}, ${g}, ${b})`;
};

export function ShirtBackdrop({ type, color, side, size }: ShirtBackdropProps) {
  const scale = size / 100;
  const fill = side === 'back' ? shade(color, 10) : color;
  return (
    <Group scaleX={scale} scaleY={scale} listening={false}>
      <Path data={pathFor(type)} fill={fill} stroke="#16140F" strokeWidth={1.4} />
    </Group>
  );
}
