import { type Scene, type SceneSide } from '@shirtify/core';
import { Image as KonvaImage } from 'react-konva';

import { ShirtBackdrop } from './shirt-backdrop.tsx';
import { useAssetImage } from './use-asset-image.ts';

/**
 * The shirt backdrop. If the scene references a custom material image, show that
 * uploaded photo; otherwise fall back to the built-in vector silhouette tinted
 * by the chosen colour.
 */
export function MaterialBackdrop({
  shirt,
  side,
  size,
  resolveAssetUrl,
}: {
  shirt: Scene['shirt'];
  side: SceneSide;
  size: number;
  resolveAssetUrl: (key: string) => Promise<string>;
}) {
  const key = shirt.materialImageKey ?? '';
  const bitmap = useAssetImage(key, resolveAssetUrl);

  if (shirt.materialImageKey && bitmap) {
    return <KonvaImage image={bitmap} x={0} y={0} width={size} height={size} listening={false} />;
  }
  // No custom material (or still loading) → vector silhouette.
  return <ShirtBackdrop type={shirt.type} color={shirt.color} side={side} size={size} />;
}
