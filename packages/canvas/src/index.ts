export type { CanvasOptions, CanvasHandle, ToPNGOptions } from './types.ts';
export { DesignCanvas, type DesignCanvasProps } from './design-canvas.tsx';
export { mount } from './mount.tsx';

// Scene helpers a host editor needs to mutate layers (kept here so the host
// never has to reach into Konva).
export {
  addTextLayer,
  addImageLayer,
  removeLayer,
  reorderLayer,
  type NewTextLayerInput,
} from './scene-ops.ts';
