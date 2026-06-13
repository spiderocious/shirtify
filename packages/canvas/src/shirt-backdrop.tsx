import { type ShirtType, type SceneSide } from '@shirtify/core';
import { Path, Group } from 'react-konva';

/**
 * A stylised garment silhouette drawn behind the design, filled with the chosen
 * base colour. Each type has a distinct, recognisable shape (tee vs hoodie vs
 * polo vs oversized) so the seller's choice reads at a glance. Paths are authored
 * in a 100×100 box and scaled to the stage. The print area is the centre.
 */
export interface ShirtBackdropProps {
  type: ShirtType;
  color: string;
  side: SceneSide;
  size: number;
}

const INK = '#16140F';

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

interface PartsProps {
  fill: string;
  side: SceneSide;
}

// — T-shirt: short set-in sleeves, crew neckline —
function Tee({ fill, side }: PartsProps) {
  return (
    <>
      <Path
        data="M36 14 L30 10 L14 20 L8 36 L20 44 L26 38 L26 90 L74 90 L74 38 L80 44 L92 36 L86 20 L70 10 L64 14 Q50 24 36 14 Z"
        fill={fill}
        stroke={INK}
        strokeWidth={1.4}
      />
      {side === 'front' ? (
        <Path data="M36 14 Q50 24 64 14" fill={undefined} stroke={INK} strokeWidth={1.2} />
      ) : (
        <Path data="M38 12 Q50 18 62 12" fill={undefined} stroke={INK} strokeWidth={1.2} />
      )}
    </>
  );
}

// — Hoodie: hood, kangaroo pocket, ribbed cuffs/hem —
function Hoodie({ fill, side }: PartsProps) {
  return (
    <>
      {/* body + raglan sleeves */}
      <Path
        data="M34 18 L26 12 L10 22 L4 40 L16 48 L24 42 L24 88 L76 88 L76 42 L84 48 L96 40 L90 22 L74 12 L66 18 Z"
        fill={fill}
        stroke={INK}
        strokeWidth={1.4}
      />
      {/* hood */}
      <Path
        data="M34 18 Q50 34 66 18 Q60 6 50 6 Q40 6 34 18 Z"
        fill={shade(fill, 14)}
        stroke={INK}
        strokeWidth={1.3}
      />
      {/* drawstrings */}
      <Path data="M46 18 L45 30 M54 18 L55 30" fill={undefined} stroke={INK} strokeWidth={1} />
      {side === 'front' ? (
        // kangaroo pocket
        <Path data="M34 60 L66 60 L62 78 L38 78 Z" fill={undefined} stroke={INK} strokeWidth={1.2} />
      ) : null}
      {/* cuffs + hem ribs */}
      <Path data="M16 44 L24 48 M84 44 L76 48 M24 84 L76 84" fill={undefined} stroke={INK} strokeWidth={1} />
    </>
  );
}

// — Polo: flat collar, button placket —
function Polo({ fill, side }: PartsProps) {
  return (
    <>
      <Path
        data="M38 16 L30 10 L14 20 L9 35 L20 42 L26 37 L26 90 L74 90 L74 37 L80 42 L91 35 L86 20 L70 10 L62 16 Z"
        fill={fill}
        stroke={INK}
        strokeWidth={1.4}
      />
      {/* collar */}
      <Path data="M38 16 L44 26 L50 18 L56 26 L62 16 Q50 22 38 16 Z" fill={shade(fill, 10)} stroke={INK} strokeWidth={1.2} />
      {side === 'front' ? (
        <>
          {/* placket + buttons */}
          <Path data="M50 18 L50 40" fill={undefined} stroke={INK} strokeWidth={1} />
          <Path data="M48 26 L52 26 M48 33 L52 33" fill={undefined} stroke={INK} strokeWidth={1.4} />
        </>
      ) : null}
    </>
  );
}

// — Oversized: boxy, dropped wide sleeves, wide neck —
function Oversized({ fill, side }: PartsProps) {
  return (
    <>
      <Path
        data="M32 16 L24 12 L6 26 L12 46 L24 44 L24 92 L76 92 L76 44 L88 46 L94 26 L76 12 L68 16 Q50 26 32 16 Z"
        fill={fill}
        stroke={INK}
        strokeWidth={1.4}
      />
      <Path
        data={side === 'front' ? 'M34 16 Q50 28 66 16' : 'M36 14 Q50 20 64 14'}
        fill={undefined}
        stroke={INK}
        strokeWidth={1.2}
      />
      {/* dropped-sleeve seams */}
      <Path data="M24 44 L30 40 M76 44 L70 40" fill={undefined} stroke={INK} strokeWidth={1} />
    </>
  );
}

export function ShirtBackdrop({ type, color, side, size }: ShirtBackdropProps) {
  const scale = size / 100;
  const fill = side === 'back' ? shade(color, 8) : color;
  return (
    <Group scaleX={scale} scaleY={scale} listening={false}>
      {type === 'hoodie' ? (
        <Hoodie fill={fill} side={side} />
      ) : type === 'polo' ? (
        <Polo fill={fill} side={side} />
      ) : type === 'oversized' ? (
        <Oversized fill={fill} side={side} />
      ) : (
        <Tee fill={fill} side={side} />
      )}
    </Group>
  );
}
