import {
  generateToken,
  type Scene,
  type TextLayer,
  type ImageLayer,
  type ShapeLayer,
  type ShapeKind,
  type GraphicLayer,
  type GraphicNode,
  type Layer,
} from '@shirtify/core';

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

export const addShapeLayer = (
  scene: Scene,
  shape: ShapeKind,
  fill = '#1F6BFF',
): { scene: Scene; layerId: string } => {
  const layer: ShapeLayer = {
    ...baseLayer(),
    kind: 'shape',
    shape,
    fill,
    size: 0.25,
  };
  return { scene: { ...scene, layers: [...scene.layers, layer] }, layerId: layer.id };
};

/** Add a lucide icon as a graphic layer. */
export const addGraphicLayer = (
  scene: Scene,
  icon: { iconId: string; nodes: GraphicNode[]; viewBox: number },
  color = '#16140F',
): { scene: Scene; layerId: string } => {
  const layer: GraphicLayer = {
    ...baseLayer(),
    kind: 'graphic',
    iconId: icon.iconId,
    nodes: icon.nodes,
    viewBox: icon.viewBox,
    color,
    strokeMode: true,
    strokeWidth: 2,
    size: 0.3,
  };
  return { scene: { ...scene, layers: [...scene.layers, layer] }, layerId: layer.id };
};

/** Add an emoji as a text layer (native glyph). */
export const addEmojiLayer = (scene: Scene, emoji: string): { scene: Scene; layerId: string } => {
  const layer: TextLayer = {
    ...baseLayer(),
    kind: 'text',
    text: emoji,
    font: 'inter',
    color: '#16140F',
    scale: 2,
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

/** Move a layer to an absolute z-index (drag-to-reorder). */
export const moveLayerToIndex = (scene: Scene, layerId: string, index: number): Scene => {
  const from = scene.layers.findIndex((l) => l.id === layerId);
  if (from < 0) return scene;
  const layers: Layer[] = [...scene.layers];
  const [moved] = layers.splice(from, 1);
  if (!moved) return scene;
  const clamped = Math.max(0, Math.min(index, layers.length));
  layers.splice(clamped, 0, moved);
  return { ...scene, layers };
};
