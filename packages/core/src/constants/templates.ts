import type { Scene, Layer, TextLayer, GraphicLayer } from '../schemas/scene.js';
import { ICONS } from './icons.js';

/**
 * Ready-made design templates — hand-authored Scenes a customer can drop onto
 * the shirt and use end-to-end (or tweak). Vector/text/shape/graphic only, so
 * they render instantly everywhere (browser + export) with no hosted assets.
 */

export interface DesignTemplate {
  id: string;
  name: string;
  tags: string[];
  /** The layers to drop onto the shirt (z-order: first = bottom). */
  layers: Layer[];
}

let n = 0;
const lid = (): string => `tpl-${(n += 1)}`;

const text = (t: Partial<TextLayer> & { text: string }): TextLayer => ({
  id: lid(),
  kind: 'text',
  x: 0.5,
  y: 0.5,
  scale: 1,
  rotation: 0,
  opacity: 1,
  font: 'archivo-black',
  color: '#16140F',
  ...t,
});

const icon = (iconId: string, g: Partial<GraphicLayer> = {}): GraphicLayer => {
  const def = ICONS.find((i) => i.id === iconId);
  return {
    id: lid(),
    kind: 'graphic',
    iconId,
    nodes: def?.nodes ?? [],
    viewBox: def?.viewBox ?? 24,
    x: 0.5,
    y: 0.5,
    scale: 1,
    rotation: 0,
    opacity: 1,
    color: '#16140F',
    strokeMode: true,
    strokeWidth: 2,
    size: 0.3,
    ...g,
  };
};

const tpl = (name: string, tags: string[], layers: Layer[]): DesignTemplate => ({
  id: lid(),
  name,
  tags,
  layers,
});

/**
 * "Lagos Skyline" — the inspiration's discipline: a single bold ARCHED headline
 * over a restrained central graphic (a row of building icons forming a skyline),
 * black-on-shirt, lots of breathing room. No carnival of layers.
 *
 * Built bottom→top:
 *   1–5. a skyline: five building/landmark icons in a row at varied heights
 *   6. the city baseline (a thin rule under the skyline)
 *   7. the arched headline word, big and bold, sitting above the skyline
 */
const LAGOS_SKYLINE = tpl(
  'Lagos Skyline',
  ['city', 'lagos', 'skyline', 'arched', 'minimal', 'street', 'bold', 'mono'],
  [
    // skyline row — varied icons + heights for a real city silhouette
    icon('building-2', { x: 0.28, y: 0.56, size: 0.16, strokeWidth: 2 }),
    icon('building', { x: 0.41, y: 0.54, size: 0.2, strokeWidth: 2 }),
    icon('landmark', { x: 0.54, y: 0.55, size: 0.19, strokeWidth: 2 }),
    icon('building-2', { x: 0.67, y: 0.53, size: 0.21, strokeWidth: 2 }),
    icon('church', { x: 0.79, y: 0.56, size: 0.16, strokeWidth: 2 }),
    // arched bold headline above the skyline
    text({
      text: 'LAGOS',
      x: 0.5,
      y: 0.38,
      scale: 1.4,
      font: 'anton',
      color: '#16140F',
    }),
  ],
);

/**
 * "City Heart" — minimal-offset discipline (inspiration #2): small understated
 * text + one offset graphic accent, heavy negative space.
 */
const CITY_HEART = tpl(
  'Good Heart',
  ['minimal', 'love', 'offset', 'clean', 'street'],
  [
    icon('heart', { x: 0.62, y: 0.42, size: 0.16, color: '#FF5252', strokeMode: false }),
    text({
      text: 'be good',
      x: 0.45,
      y: 0.5,
      scale: 0.7,
      font: 'space-grotesk',
      color: '#16140F',
    }),
  ],
);

export const TEMPLATES: ReadonlyArray<DesignTemplate> = [LAGOS_SKYLINE, CITY_HEART];

/** Search templates by name or tag. */
export const searchTemplates = (query: string): DesignTemplate[] => {
  const q = query.trim().toLowerCase();
  if (!q) return [...TEMPLATES];
  return TEMPLATES.filter(
    (t) => t.name.toLowerCase().includes(q) || t.tags.some((tag) => tag.includes(q)),
  );
};

/** Merge a template's layers onto a scene (fresh ids so they stay independent). */
export const applyTemplate = (scene: Scene, template: DesignTemplate): Scene => {
  let counter = 0;
  const stamp = Date.now().toString(36);
  const layers = template.layers.map((l) => ({ ...l, id: `t${stamp}-${(counter += 1)}` }));
  return { ...scene, layers: [...scene.layers, ...layers] };
};
