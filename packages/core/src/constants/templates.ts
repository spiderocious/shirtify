import type { Scene, Layer, TextLayer, ShapeLayer, Gradient } from '../schemas/scene.js';

/**
 * Ready-made design templates — hand-authored Scenes a customer can drop onto
 * the shirt and use end-to-end (or tweak). All vector/text/shape/gradient, so
 * they render instantly everywhere (browser + export) with no hosted assets.
 *
 * Each template is named + tagged for search. `apply()` (frontend) merges a
 * template's layers onto the current scene.
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

// ---- compact layer builders ----
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

const shape = (s: Partial<ShapeLayer> & { shape: ShapeLayer['shape'] }): ShapeLayer => ({
  id: lid(),
  kind: 'shape',
  x: 0.5,
  y: 0.5,
  scale: 1,
  rotation: 0,
  opacity: 1,
  fill: '#1F6BFF',
  size: 0.3,
  ...s,
});

const grad = (a: string, b: string, angle = 90): Gradient => ({
  type: 'linear',
  stops: [
    { offset: 0, color: a },
    { offset: 1, color: b },
  ],
  angle,
});

const grad3 = (a: string, b: string, c: string, angle = 0): Gradient => ({
  type: 'linear',
  stops: [
    { offset: 0, color: a },
    { offset: 0.5, color: b },
    { offset: 1, color: c },
  ],
  angle,
});

const tpl = (name: string, tags: string[], layers: Layer[]): DesignTemplate => ({
  id: lid(),
  name,
  tags,
  layers,
});

export const TEMPLATES: ReadonlyArray<DesignTemplate> = [
  // — Typographic / statement —
  tpl('Owambe Energy', ['party', 'nigeria', 'bold', 'gold'], [
    shape({ shape: 'burst', y: 0.42, size: 0.5, fill: grad('#FFD24A', '#E08A00', 45), opacity: 0.9 }),
    text({ text: 'OWAMBE', y: 0.4, scale: 1.3, color: '#16140F' }),
    text({ text: 'season', y: 0.58, scale: 0.9, font: 'pacifico', color: '#E08A00' }),
  ]),
  tpl('Lagos Nights', ['city', 'neon', 'cool', 'street'], [
    text({ text: 'LAGOS', y: 0.42, scale: 1.5, color: grad('#00F5D4', '#1F6BFF', 90) }),
    text({ text: 'after dark', y: 0.6, scale: 0.8, font: 'space-grotesk', color: '#E5EEFF' }),
  ]),
  tpl('Sunset Ombré', ['gradient', 'warm', 'minimal'], [
    text({ text: 'GOOD', y: 0.4, scale: 1.4, color: grad3('#FF5252', '#FF9A3D', '#FFD24A', 0) }),
    text({ text: 'VIBES', y: 0.58, scale: 1.4, color: grad3('#FFD24A', '#FF9A3D', '#FF5252', 0) }),
  ]),
  tpl('Retro Pop', ['retro', '80s', 'fun', 'colorful'], [
    shape({ shape: 'circle', x: 0.5, y: 0.45, size: 0.55, fill: '#FF5252' }),
    shape({ shape: 'circle', x: 0.5, y: 0.45, size: 0.42, fill: '#FFD24A' }),
    text({ text: 'RAD', y: 0.45, scale: 1.4, font: 'titan-one', color: '#16140F' }),
  ]),
  tpl('Minimal Mark', ['minimal', 'clean', 'mono'], [
    shape({ shape: 'circle', y: 0.42, size: 0.18, fill: '#16140F' }),
    text({ text: 'less is more', y: 0.6, scale: 0.7, font: 'jetbrains-mono', color: '#16140F' }),
  ]),
  tpl('Champion', ['sport', 'bold', 'team'], [
    shape({ shape: 'star', y: 0.34, size: 0.22, fill: '#FFD24A' }),
    text({ text: 'CHAMPION', y: 0.52, scale: 1.1, font: 'anton', color: '#16140F' }),
    shape({ shape: 'line', y: 0.62, size: 0.5, fill: '#FF5252' }),
  ]),
  tpl('Wavy Dreams', ['gradient', 'soft', 'dream'], [
    text({ text: 'dream', y: 0.4, scale: 1.6, font: 'lobster', color: grad('#9333ea', '#1F6BFF', 60) }),
    text({ text: 'BIG', y: 0.6, scale: 1.2, font: 'archivo-black', color: '#9333ea' }),
  ]),
  tpl('Heart Burst', ['love', 'cute', 'valentine'], [
    shape({ shape: 'heart', y: 0.42, size: 0.4, fill: grad('#FF5252', '#D11A1A', 90) }),
    text({ text: 'all love', y: 0.62, scale: 0.8, font: 'caveat', color: '#D11A1A' }),
  ]),
  tpl('Electric', ['neon', 'bold', 'gradient'], [
    text({ text: 'ELECTRIC', y: 0.5, scale: 1.2, color: grad3('#00F5D4', '#1F6BFF', '#9333ea', 0) }),
  ]),
  tpl('Sunshine', ['summer', 'warm', 'happy'], [
    shape({ shape: 'star', y: 0.4, size: 0.4, sides: 12, fill: grad('#FFD24A', '#FF9A3D', 90) }),
    text({ text: 'SUNNY', y: 0.62, scale: 1, font: 'fredoka', color: '#E08A00' }),
  ]),

  // — Shape-led / graphic —
  tpl('Bold Circle', ['graphic', 'minimal', 'mono'], [
    shape({ shape: 'circle', size: 0.55, fill: '#16140F' }),
    text({ text: 'EST. 2026', scale: 0.6, color: '#FBF7EC' }),
  ]),
  tpl('Diamond Lux', ['luxury', 'gold', 'gradient'], [
    shape({ shape: 'diamond', size: 0.45, fill: grad('#FFD24A', '#B8860B', 45) }),
    text({ text: 'LUX', scale: 0.8, color: '#16140F' }),
  ]),
  tpl('Triangle Stack', ['geometric', 'modern'], [
    shape({ shape: 'triangle', y: 0.4, size: 0.4, fill: '#FF5252' }),
    shape({ shape: 'triangle', y: 0.52, size: 0.4, fill: '#1F6BFF', opacity: 0.85 }),
  ]),
  tpl('Hex Grid', ['geometric', 'tech', 'cool'], [
    shape({ shape: 'hexagon', x: 0.38, y: 0.44, size: 0.26, fill: '#1F6BFF' }),
    shape({ shape: 'hexagon', x: 0.62, y: 0.44, size: 0.26, fill: '#00F5D4' }),
    shape({ shape: 'hexagon', x: 0.5, y: 0.6, size: 0.26, fill: '#9333ea' }),
  ]),
  tpl('Star Power', ['sport', 'bold', 'star'], [
    shape({ shape: 'star', size: 0.5, fill: grad('#FFD24A', '#FF9A3D', 90) }),
    text({ text: 'STAR', scale: 0.8, color: '#16140F' }),
  ]),
  tpl('Cross Roads', ['graphic', 'bold'], [
    shape({ shape: 'cross', size: 0.45, fill: '#16140F' }),
  ]),
  tpl('Arrow Up', ['motivation', 'minimal'], [
    shape({ shape: 'arrow', y: 0.4, rotation: -90, size: 0.35, fill: '#0d9488' }),
    text({ text: 'RISE', y: 0.64, scale: 1, color: '#0d9488' }),
  ]),
  tpl('Burst Badge', ['retro', 'badge', 'sale'], [
    shape({ shape: 'burst', size: 0.55, fill: '#FF5252' }),
    text({ text: 'NEW', scale: 0.9, color: '#FBF7EC' }),
  ]),
  tpl('Pentagon Crest', ['crest', 'team', 'classic'], [
    shape({ shape: 'pentagon', size: 0.48, fill: grad('#1F6BFF', '#1657DB', 90) }),
    text({ text: 'A', scale: 1.2, color: '#FBF7EC' }),
  ]),
  tpl('Ellipse Echo', ['modern', 'soft'], [
    shape({ shape: 'ellipse', y: 0.45, size: 0.6, fill: grad('#E5EEFF', '#1F6BFF', 90) }),
    text({ text: 'echo', y: 0.45, scale: 0.9, font: 'dm-sans', color: '#16140F' }),
  ]),

  // — Script / playful —
  tpl('Coffee First', ['cafe', 'cute', 'script'], [
    text({ text: 'but first,', y: 0.42, scale: 0.7, font: 'caveat', color: '#7A5230' }),
    text({ text: 'coffee', y: 0.56, scale: 1.4, font: 'pacifico', color: '#3B2414' }),
  ]),
  tpl('Stay Wild', ['nature', 'script', 'adventure'], [
    text({ text: 'stay', y: 0.42, scale: 1.2, font: 'satisfy', color: '#1f3d2b' }),
    text({ text: 'WILD', y: 0.58, scale: 1.2, font: 'bebas-neue', color: '#1f3d2b' }),
  ]),
  tpl('Hello Sunshine', ['summer', 'script', 'happy'], [
    text({ text: 'hello', y: 0.42, scale: 1.3, font: 'dancing-script', color: '#FF9A3D' }),
    text({ text: 'sunshine', y: 0.58, scale: 0.9, font: 'dancing-script', color: '#E08A00' }),
  ]),
  tpl('Good Days', ['positive', 'script'], [
    text({ text: 'good days', scale: 1.2, font: 'lobster', color: grad('#0d9488', '#00F5D4', 0) }),
  ]),
  tpl('Be Kind', ['kindness', 'minimal', 'script'], [
    text({ text: 'be kind', scale: 1.3, font: 'satisfy', color: '#9333ea' }),
  ]),
  tpl('Wanderlust', ['travel', 'script', 'adventure'], [
    shape({ shape: 'circle', size: 0.5, fill: 'none', stroke: { color: '#16140F', width: 6 } }),
    text({ text: 'wander', scale: 0.9, font: 'caveat', color: '#16140F' }),
  ]),

  // — Birthday / occasion —
  tpl('Birthday Queen', ['birthday', 'party', 'gold'], [
    shape({ shape: 'star', y: 0.32, size: 0.16, fill: '#FFD24A' }),
    text({ text: 'BIRTHDAY', y: 0.5, scale: 0.9, font: 'anton', color: '#9333ea' }),
    text({ text: 'queen', y: 0.62, scale: 1, font: 'pacifico', color: '#FFD24A' }),
  ]),
  tpl('Squad Goals', ['friends', 'fun', 'group'], [
    text({ text: 'SQUAD', y: 0.42, scale: 1.2, font: 'titan-one', color: '#FF5252' }),
    text({ text: 'goals', y: 0.6, scale: 1, font: 'fredoka', color: '#1F6BFF' }),
  ]),
  tpl('Team Bride', ['wedding', 'bride', 'party'], [
    shape({ shape: 'heart', y: 0.34, size: 0.18, fill: '#FF5252' }),
    text({ text: 'TEAM', y: 0.5, scale: 1, font: 'archivo-black', color: '#16140F' }),
    text({ text: 'bride', y: 0.62, scale: 1.1, font: 'dancing-script', color: '#FF5252' }),
  ]),
  tpl('Class of 2026', ['graduation', 'school', 'bold'], [
    text({ text: 'CLASS OF', y: 0.42, scale: 0.7, font: 'oswald', color: '#16140F' }),
    text({ text: '2026', y: 0.56, scale: 1.6, font: 'archivo-black', color: grad('#1F6BFF', '#9333ea', 90) }),
  ]),
  tpl('Church Anniversary', ['church', 'faith', 'classic'], [
    shape({ shape: 'cross', y: 0.36, size: 0.18, fill: '#B8860B' }),
    text({ text: 'GRACE', y: 0.54, scale: 1, font: 'playfair', color: '#16140F' }),
    text({ text: '25 years', y: 0.66, scale: 0.7, font: 'merriweather', color: '#7A7263' }),
  ]),

  // — Streetwear / edgy —
  tpl('Off Grid', ['street', 'edgy', 'mono'], [
    shape({ shape: 'rect', size: 0.6, fill: '#16140F' }),
    text({ text: 'OFF—GRID', scale: 0.8, font: 'space-mono', color: '#C6F24E' }),
  ]),
  tpl('Hype Beast', ['street', 'bold', 'hype'], [
    shape({ shape: 'rounded-rect', y: 0.45, size: 0.7, fill: '#FF5252' }),
    text({ text: 'HYPE', y: 0.45, scale: 1.3, font: 'archivo-black', color: '#FBF7EC' }),
  ]),
  tpl('Vapor', ['vaporwave', 'retro', 'gradient'], [
    text({ text: 'V A P O R', scale: 1, font: 'bebas-neue', color: grad3('#FF71CE', '#B967FF', '#01CDFE', 0) }),
  ]),
  tpl('Glitch', ['tech', 'edgy', 'mono'], [
    text({ text: 'GLITCH', y: 0.47, scale: 1.1, font: 'space-mono', color: '#FF5252' }),
    text({ text: 'GLITCH', y: 0.5, scale: 1.1, font: 'space-mono', color: '#00F5D4', opacity: 0.6 }),
  ]),
  tpl('Bold Statement', ['bold', 'statement'], [
    shape({ shape: 'rect', y: 0.5, size: 0.85, fill: '#C6F24E' }),
    text({ text: 'NO RULES', y: 0.5, scale: 0.9, font: 'anton', color: '#16140F' }),
  ]),

  // — Nature / calm —
  tpl('Mountain Air', ['nature', 'outdoor', 'calm'], [
    shape({ shape: 'triangle', x: 0.42, y: 0.46, size: 0.34, fill: '#1f3d2b' }),
    shape({ shape: 'triangle', x: 0.58, y: 0.48, size: 0.3, fill: '#2d5a3d' }),
    text({ text: 'EXPLORE', y: 0.66, scale: 0.7, font: 'oswald', color: '#1f3d2b' }),
  ]),
  tpl('Ocean Calm', ['nature', 'water', 'cool'], [
    shape({ shape: 'ellipse', y: 0.5, size: 0.7, fill: grad('#00F5D4', '#1F6BFF', 90) }),
    text({ text: 'calm', y: 0.5, scale: 1, font: 'dm-sans', color: '#FBF7EC' }),
  ]),
  tpl('Palm Days', ['summer', 'tropical', 'fun'], [
    text({ text: 'PALM', y: 0.42, scale: 1.2, font: 'titan-one', color: '#0d9488' }),
    text({ text: 'days', y: 0.6, scale: 1, font: 'pacifico', color: '#FF9A3D' }),
  ]),
  tpl('Bloom', ['floral', 'soft', 'spring'], [
    shape({ shape: 'burst', y: 0.42, size: 0.3, sides: 8, fill: '#FF71CE' }),
    text({ text: 'bloom', y: 0.62, scale: 1, font: 'satisfy', color: '#9333ea' }),
  ]),

  // — Quote / motivational —
  tpl('Hustle', ['motivation', 'bold', 'mono'], [
    text({ text: 'HUSTLE', y: 0.44, scale: 1.2, font: 'bebas-neue', color: '#16140F' }),
    shape({ shape: 'line', y: 0.56, size: 0.4, fill: '#C6F24E' }),
    text({ text: 'every day', y: 0.64, scale: 0.6, font: 'jetbrains-mono', color: '#7A7263' }),
  ]),
  tpl('Dream Big', ['motivation', 'gradient'], [
    text({ text: 'DREAM', y: 0.42, scale: 1.2, color: grad('#9333ea', '#FF71CE', 45) }),
    text({ text: 'BIG', y: 0.6, scale: 1.4, color: '#9333ea' }),
  ]),
  tpl('Good Energy', ['positive', 'fun', 'colorful'], [
    shape({ shape: 'star', x: 0.3, y: 0.36, size: 0.12, fill: '#FFD24A' }),
    shape({ shape: 'star', x: 0.7, y: 0.4, size: 0.1, fill: '#FF5252' }),
    text({ text: 'GOOD', y: 0.52, scale: 1, font: 'fredoka', color: '#1F6BFF' }),
    text({ text: 'ENERGY', y: 0.64, scale: 0.9, font: 'fredoka', color: '#0d9488' }),
  ]),
  tpl('Self Made', ['motivation', 'gold', 'bold'], [
    text({ text: 'SELF', y: 0.42, scale: 1.3, font: 'anton', color: grad('#FFD24A', '#B8860B', 90) }),
    text({ text: 'MADE', y: 0.6, scale: 1.3, font: 'anton', color: '#16140F' }),
  ]),
];

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
