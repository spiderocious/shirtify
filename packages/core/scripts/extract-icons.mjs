// Build-time: extract a curated set of lucide icon node arrays into
// src/constants/icons.ts so the app ships them as path data (no runtime dep on
// lucide internals). Run from packages/core: `node scripts/extract-icons.mjs`.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../..');

// Curated set: id (lucide kebab filename) → { label, tags }
const CURATED = {
  // buildings / city
  'building-2': { label: 'Building', tags: ['city', 'building', 'skyline', 'lagos'] },
  building: { label: 'Tower', tags: ['city', 'building', 'skyline'] },
  landmark: { label: 'Landmark', tags: ['city', 'monument', 'building'] },
  factory: { label: 'Factory', tags: ['city', 'industry'] },
  store: { label: 'Store', tags: ['city', 'shop'] },
  home: { label: 'Home', tags: ['house', 'building'] },
  church: { label: 'Church', tags: ['faith', 'building'] },
  castle: { label: 'Castle', tags: ['building', 'royal'] },
  // nature
  sun: { label: 'Sun', tags: ['nature', 'summer', 'weather'] },
  moon: { label: 'Moon', tags: ['nature', 'night', 'weather'] },
  cloud: { label: 'Cloud', tags: ['nature', 'weather', 'sky'] },
  star: { label: 'Star', tags: ['star', 'favorite', 'night'] },
  sparkles: { label: 'Sparkles', tags: ['sparkle', 'magic', 'shine'] },
  flame: { label: 'Flame', tags: ['fire', 'hot', 'energy'] },
  zap: { label: 'Bolt', tags: ['lightning', 'energy', 'power'] },
  droplet: { label: 'Droplet', tags: ['water', 'nature'] },
  snowflake: { label: 'Snowflake', tags: ['winter', 'cold', 'nature'] },
  leaf: { label: 'Leaf', tags: ['nature', 'plant', 'eco'] },
  trees: { label: 'Trees', tags: ['nature', 'forest', 'plant'] },
  flower: { label: 'Flower', tags: ['nature', 'floral', 'spring'] },
  mountain: { label: 'Mountain', tags: ['nature', 'outdoor', 'adventure'] },
  waves: { label: 'Waves', tags: ['water', 'ocean', 'sea'] },
  rainbow: { label: 'Rainbow', tags: ['nature', 'colorful', 'pride'] },
  // love / faces
  heart: { label: 'Heart', tags: ['love', 'valentine', 'like'] },
  'heart-handshake': { label: 'Care', tags: ['love', 'care', 'kindness'] },
  smile: { label: 'Smile', tags: ['face', 'happy', 'emoji'] },
  laugh: { label: 'Laugh', tags: ['face', 'happy', 'fun'] },
  // music
  music: { label: 'Music note', tags: ['music', 'song', 'sound'] },
  'music-2': { label: 'Note', tags: ['music', 'song'] },
  headphones: { label: 'Headphones', tags: ['music', 'audio', 'dj'] },
  guitar: { label: 'Guitar', tags: ['music', 'instrument', 'rock'] },
  mic: { label: 'Mic', tags: ['music', 'sing', 'sound'] },
  disc: { label: 'Disc', tags: ['music', 'vinyl', 'dj'] },
  radio: { label: 'Radio', tags: ['music', 'sound'] },
  // sport / activity
  trophy: { label: 'Trophy', tags: ['sport', 'win', 'champion'] },
  medal: { label: 'Medal', tags: ['sport', 'win', 'award'] },
  dumbbell: { label: 'Dumbbell', tags: ['sport', 'gym', 'fitness'] },
  bike: { label: 'Bike', tags: ['sport', 'cycle'] },
  footprints: { label: 'Footprints', tags: ['walk', 'run', 'sport'] },
  target: { label: 'Target', tags: ['aim', 'goal', 'sport'] },
  // food / drink
  coffee: { label: 'Coffee', tags: ['food', 'drink', 'cafe'] },
  pizza: { label: 'Pizza', tags: ['food', 'fun'] },
  'ice-cream-cone': { label: 'Ice cream', tags: ['food', 'summer'] },
  cake: { label: 'Cake', tags: ['food', 'birthday', 'party'] },
  beer: { label: 'Beer', tags: ['drink', 'party'] },
  'cup-soda': { label: 'Soda', tags: ['drink', 'food'] },
  cherry: { label: 'Cherry', tags: ['food', 'fruit'] },
  // symbols
  crown: { label: 'Crown', tags: ['royal', 'king', 'queen', 'luxury'] },
  gem: { label: 'Gem', tags: ['luxury', 'diamond', 'shine'] },
  rocket: { label: 'Rocket', tags: ['space', 'launch', 'startup'] },
  anchor: { label: 'Anchor', tags: ['sea', 'nautical'] },
  skull: { label: 'Skull', tags: ['edgy', 'street', 'danger'] },
  ghost: { label: 'Ghost', tags: ['spooky', 'fun', 'halloween'] },
  bot: { label: 'Robot', tags: ['tech', 'ai', 'fun'] },
  cpu: { label: 'Chip', tags: ['tech', 'circuit'] },
  globe: { label: 'Globe', tags: ['world', 'travel', 'earth'] },
  'map-pin': { label: 'Pin', tags: ['location', 'travel', 'map'] },
  plane: { label: 'Plane', tags: ['travel', 'fly'] },
  car: { label: 'Car', tags: ['drive', 'auto'] },
  camera: { label: 'Camera', tags: ['photo', 'media'] },
  gamepad: { label: 'Gamepad', tags: ['game', 'play'] },
  'paw-print': { label: 'Paw', tags: ['animal', 'pet'] },
  cat: { label: 'Cat', tags: ['animal', 'pet'] },
  dog: { label: 'Dog', tags: ['animal', 'pet'] },
  bird: { label: 'Bird', tags: ['animal', 'nature'] },
  fish: { label: 'Fish', tags: ['animal', 'sea'] },
  feather: { label: 'Feather', tags: ['light', 'nature', 'write'] },
  crosshair: { label: 'Crosshair', tags: ['aim', 'target'] },
  hexagon: { label: 'Hexagon', tags: ['shape', 'geometric'] },
  triangle: { label: 'Triangle', tags: ['shape', 'geometric'] },
  diamond: { label: 'Diamond', tags: ['shape', 'geometric'] },
  hash: { label: 'Hash', tags: ['symbol', 'tag'] },
  'at-sign': { label: 'At', tags: ['symbol', 'social'] },
  asterisk: { label: 'Asterisk', tags: ['symbol', 'star'] },
  infinity: { label: 'Infinity', tags: ['symbol', 'forever'] },
  award: { label: 'Award', tags: ['win', 'badge'] },
  shield: { label: 'Shield', tags: ['protect', 'crest', 'badge'] },
  swords: { label: 'Swords', tags: ['battle', 'crest', 'edgy'] },
  hand: { label: 'Hand', tags: ['wave', 'hello'] },
  'thumbs-up': { label: 'Thumbs up', tags: ['like', 'approve'] },
  eye: { label: 'Eye', tags: ['see', 'watch'] },
  glasses: { label: 'Glasses', tags: ['cool', 'style'] },
  scissors: { label: 'Scissors', tags: ['cut', 'craft'] },
  palette: { label: 'Palette', tags: ['art', 'paint', 'design'] },
  brush: { label: 'Brush', tags: ['art', 'paint', 'design'] },
  wand: { label: 'Wand', tags: ['magic', 'sparkle'] },
  key: { label: 'Key', tags: ['unlock', 'symbol'] },
  lock: { label: 'Lock', tags: ['secure', 'symbol'] },
  bell: { label: 'Bell', tags: ['alert', 'notify'] },
  gift: { label: 'Gift', tags: ['present', 'birthday', 'party'] },
  'party-popper': { label: 'Party', tags: ['party', 'celebrate', 'owambe'] },
  cross: { label: 'Cross', tags: ['faith', 'plus'] },
  'venetian-mask': { label: 'Mask', tags: ['party', 'carnival', 'fun'] },
};

const { readdirSync } = await import('node:fs');
const pnpmDir = path.join(ROOT, 'node_modules/.pnpm');
const lucideDirName = readdirSync(pnpmDir).find((d) => d.startsWith('lucide-react@'));
if (!lucideDirName) throw new Error('lucide-react not found in node_modules/.pnpm');
const ICON_DIR = path.join(pnpmDir, lucideDirName, 'node_modules/lucide-react/dist/esm/icons');

const parseNodes = (id) => {
  const src = readFileSync(path.join(ICON_DIR, `${id}.js`), 'utf8');
  // Grab the array literal passed to createLucideIcon("Name", [ ... ]).
  const start = src.indexOf('[', src.indexOf('createLucideIcon'));
  // find matching bracket
  let depth = 0;
  let end = -1;
  for (let i = start; i < src.length; i++) {
    if (src[i] === '[') depth++;
    else if (src[i] === ']') {
      depth--;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }
  let literal = src.slice(start, end + 1);
  // Convert JS object literal → JSON: quote keys, drop the `key` prop.
  literal = literal
    .replace(/([{,]\s*)([a-zA-Z_][\w-]*)\s*:/g, '$1"$2":')
    .replace(/,\s*"key":\s*"[^"]*"/g, '')
    .replace(/"key":\s*"[^"]*",?/g, '');
  const nodes = JSON.parse(literal);
  // Drop the leading key field if it became the only thing; keep [tag, attrs].
  return nodes;
};

const icons = [];
for (const [id, meta] of Object.entries(CURATED)) {
  try {
    const nodes = parseNodes(id);
    icons.push({ id, label: meta.label, tags: meta.tags, nodes });
  } catch (e) {
    console.warn(`skip ${id}: ${e.message}`);
  }
}

const out = `// AUTO-GENERATED by scripts/extract-icons.mjs — do not edit by hand.
// Curated lucide icons as raw SVG node data, shipped for the design canvas.
import type { GraphicNode } from '../schemas/scene.js';

export interface IconDef {
  id: string;
  label: string;
  tags: string[];
  viewBox: number;
  nodes: GraphicNode[];
}

export const ICONS: ReadonlyArray<IconDef> = ${JSON.stringify(
  icons.map((i) => ({ ...i, viewBox: 24 })),
  null,
  2,
)} as const as unknown as ReadonlyArray<IconDef>;

export const searchIcons = (query: string): IconDef[] => {
  const q = query.trim().toLowerCase();
  if (!q) return [...ICONS];
  return ICONS.filter(
    (i) => i.label.toLowerCase().includes(q) || i.id.includes(q) || i.tags.some((t) => t.includes(q)),
  );
};
`;

writeFileSync(path.join(__dirname, '../src/constants/icons.ts'), out);
console.log(`wrote ${icons.length} icons → src/constants/icons.ts`);
