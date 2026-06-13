/**
 * Curated, print-safe design constants. Single source of truth for shirt types,
 * the base-colour palette, the font set the canvas + exporter share, and the
 * export size presets.
 */

export const SHIRT_TYPES = ['tee', 'hoodie', 'polo', 'oversized'] as const;
export type ShirtTypeName = (typeof SHIRT_TYPES)[number];

export const SHIRT_TYPE_LABELS: Record<ShirtTypeName, string> = {
  tee: 'T-shirt',
  hoodie: 'Hoodie',
  polo: 'Polo',
  oversized: 'Oversized',
};

/** Curated base-colour set a seller can offer for the shirt itself. */
export const SHIRT_COLORS: ReadonlyArray<{ id: string; label: string; hex: string }> = [
  { id: 'white', label: 'White', hex: '#ffffff' },
  { id: 'black', label: 'Black', hex: '#0f0f0f' },
  { id: 'sand', label: 'Sand', hex: '#e8dcc4' },
  { id: 'navy', label: 'Navy', hex: '#1e2a44' },
  { id: 'forest', label: 'Forest', hex: '#1f3d2b' },
  { id: 'maroon', label: 'Maroon', hex: '#5a1f25' },
  { id: 'grey', label: 'Heather Grey', hex: '#9aa0a6' },
  { id: 'lime', label: 'Lime', hex: '#c6f135' },
];

/**
 * The fonts the text tool offers. The canvas renders by `family` (the CSS
 * font-family / Konva fontFamily), so every font here MUST be loaded for it to
 * reflect — the web app dynamically imports `pkg` (its @fontsource package) and
 * the exporter registers the same families server-side. `id` is what's stored on
 * a layer; `family` is the contract between editor + exporter.
 */
export interface FontDef {
  id: string;
  label: string;
  family: string;
  /** @fontsource package to load in the browser. */
  pkg: string;
  category: 'sans' | 'display' | 'serif' | 'script' | 'mono' | 'handwriting';
}

export const FONTS: ReadonlyArray<FontDef> = [
  // Sans
  { id: 'inter', label: 'Inter', family: 'Inter', pkg: '@fontsource/inter', category: 'sans' },
  { id: 'space-grotesk', label: 'Space Grotesk', family: 'Space Grotesk', pkg: '@fontsource/space-grotesk', category: 'sans' },
  { id: 'montserrat', label: 'Montserrat', family: 'Montserrat', pkg: '@fontsource/montserrat', category: 'sans' },
  { id: 'poppins', label: 'Poppins', family: 'Poppins', pkg: '@fontsource/poppins', category: 'sans' },
  { id: 'work-sans', label: 'Work Sans', family: 'Work Sans', pkg: '@fontsource/work-sans', category: 'sans' },
  { id: 'dm-sans', label: 'DM Sans', family: 'DM Sans', pkg: '@fontsource/dm-sans', category: 'sans' },
  // Display / heavy
  { id: 'archivo-black', label: 'Archivo Black', family: 'Archivo Black', pkg: '@fontsource/archivo-black', category: 'display' },
  { id: 'anton', label: 'Anton', family: 'Anton', pkg: '@fontsource/anton', category: 'display' },
  { id: 'bebas-neue', label: 'Bebas Neue', family: 'Bebas Neue', pkg: '@fontsource/bebas-neue', category: 'display' },
  { id: 'oswald', label: 'Oswald', family: 'Oswald', pkg: '@fontsource/oswald', category: 'display' },
  { id: 'righteous', label: 'Righteous', family: 'Righteous', pkg: '@fontsource/righteous', category: 'display' },
  { id: 'bungee', label: 'Bungee', family: 'Bungee', pkg: '@fontsource/bungee', category: 'display' },
  { id: 'titan-one', label: 'Titan One', family: 'Titan One', pkg: '@fontsource/titan-one', category: 'display' },
  { id: 'fredoka', label: 'Fredoka', family: 'Fredoka', pkg: '@fontsource/fredoka', category: 'display' },
  { id: 'alfa-slab', label: 'Alfa Slab One', family: 'Alfa Slab One', pkg: '@fontsource/alfa-slab-one', category: 'display' },
  // Serif
  { id: 'playfair', label: 'Playfair Display', family: 'Playfair Display', pkg: '@fontsource/playfair-display', category: 'serif' },
  { id: 'merriweather', label: 'Merriweather', family: 'Merriweather', pkg: '@fontsource/merriweather', category: 'serif' },
  { id: 'abril-fatface', label: 'Abril Fatface', family: 'Abril Fatface', pkg: '@fontsource/abril-fatface', category: 'serif' },
  // Script / handwriting
  { id: 'lobster', label: 'Lobster', family: 'Lobster', pkg: '@fontsource/lobster', category: 'script' },
  { id: 'pacifico', label: 'Pacifico', family: 'Pacifico', pkg: '@fontsource/pacifico', category: 'script' },
  { id: 'dancing-script', label: 'Dancing Script', family: 'Dancing Script', pkg: '@fontsource/dancing-script', category: 'script' },
  { id: 'caveat', label: 'Caveat', family: 'Caveat', pkg: '@fontsource/caveat', category: 'handwriting' },
  { id: 'permanent-marker', label: 'Permanent Marker', family: 'Permanent Marker', pkg: '@fontsource/permanent-marker', category: 'handwriting' },
  { id: 'satisfy', label: 'Satisfy', family: 'Satisfy', pkg: '@fontsource/satisfy', category: 'script' },
  // Mono
  { id: 'jetbrains-mono', label: 'JetBrains Mono', family: 'JetBrains Mono', pkg: '@fontsource/jetbrains-mono', category: 'mono' },
  { id: 'space-mono', label: 'Space Mono', family: 'Space Mono', pkg: '@fontsource/space-mono', category: 'mono' },
];

export const FONT_IDS = FONTS.map((f) => f.id);

/** Resolve a font id → its CSS family (fallback to a generic sans). */
export const fontFamilyById = (id: string): string =>
  FONTS.find((f) => f.id === id)?.family ?? 'Inter, system-ui, sans-serif';

/**
 * Export size presets. Users pick one of these or a custom { w, h, dpi }.
 * We don't own the print relationship — these are just render targets.
 */
export const EXPORT_PRESETS: ReadonlyArray<{
  id: string;
  label: string;
  width: number;
  height: number;
  dpi: number;
}> = [
  { id: 'web', label: 'Web (1024×1024)', width: 1024, height: 1024, dpi: 72 },
  { id: 'standard', label: 'Standard (2400×3200)', width: 2400, height: 3200, dpi: 150 },
  { id: 'shirt-us', label: 'US shirt (4500×5400 @300)', width: 4500, height: 5400, dpi: 300 },
  { id: 'a4', label: 'A4 (2480×3508 @300)', width: 2480, height: 3508, dpi: 300 },
  { id: 'a3', label: 'A3 (3508×4961 @300)', width: 3508, height: 4961, dpi: 300 },
];

export const EXPORT_PRESET_IDS = EXPORT_PRESETS.map((p) => p.id);

/** Max upload size for customer image uploads (bytes). */
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
