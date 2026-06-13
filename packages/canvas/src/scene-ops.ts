import { generateToken, type Scene, type TextLayer, type ImageLayer, type Layer } from '@shirtify/core';

/**
 * Pure scene mutations the host editor uses to add/remove/reorder layers. Keeps
 * layer construction in one place so the host never hand-builds layer objects.
 */

export interface NewTextLayerInput {
  text?: string;
  font?: string;
  color?: string;
}

const baseLayer = () => ({
  id: generateToken(10),
  x: 0.5,
  y: 0.45,
  scale: 1,
  rotation: 0,
  opacity: 1,
});

export const addTextLayer = (scene: Scene, input: NewTextLayerInput = {}): { scene: Scene; layerId: string } => {
  const layer: TextLayer = {
    ...baseLayer(),
    kind: 'text',
    text: input.text ?? 'Your text',
    font: input.font ?? 'archivo-black',
    color: input.color ?? '#16140F',
  };
  return { scene: { ...scene, layers: [...scene.layers, layer] }, layerId: layer.id };
};

export const addImageLayer = (scene: Scene, assetKey: string): { scene: Scene; layerId: string } => {
  const layer: ImageLayer = {
    ...baseLayer(),
    kind: 'image',
    assetKey,
    source: 'upload',
  };
  return { scene: { ...scene, layers: [...scene.layers, layer] }, layerId: layer.id };
};

export const removeLayer = (scene: Scene, layerId: string): Scene => ({
  ...scene,
  layers: scene.layers.filter((l) => l.id !== layerId),
});

/** Move a layer up (+1, toward top) or down (-1) in z-order. */
export const reorderLayer = (scene: Scene, layerId: string, direction: 1 | -1): Scene => {
  const idx = scene.layers.findIndex((l) => l.id === layerId);
  if (idx < 0) return scene;
  const target = idx + direction;
  if (target < 0 || target >= scene.layers.length) return scene;
  const layers: Layer[] = [...scene.layers];
  const [moved] = layers.splice(idx, 1);
  if (moved) layers.splice(target, 0, moved);
  return { ...scene, layers };
};
