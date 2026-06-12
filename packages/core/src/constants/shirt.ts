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
 * The 12 print-safe fonts the text tool offers. The canvas renders these in the
 * browser and the exporter must register the same families server-side, so this
 * list is the contract between both.
 */
export const FONTS: ReadonlyArray<{ id: string; label: string; stack: string }> = [
  { id: 'archivo-black', label: 'Archivo Black', stack: '"Archivo Black", sans-serif' },
  { id: 'space-grotesk', label: 'Space Grotesk', stack: '"Space Grotesk", sans-serif' },
  { id: 'inter', label: 'Inter', stack: 'Inter, system-ui, sans-serif' },
  { id: 'anton', label: 'Anton', stack: 'Anton, sans-serif' },
  { id: 'bebas-neue', label: 'Bebas Neue', stack: '"Bebas Neue", sans-serif' },
  { id: 'oswald', label: 'Oswald', stack: 'Oswald, sans-serif' },
  { id: 'playfair', label: 'Playfair Display', stack: '"Playfair Display", serif' },
  { id: 'lobster', label: 'Lobster', stack: 'Lobster, cursive' },
  { id: 'pacifico', label: 'Pacifico', stack: 'Pacifico, cursive' },
  { id: 'permanent-marker', label: 'Permanent Marker', stack: '"Permanent Marker", cursive' },
  { id: 'righteous', label: 'Righteous', stack: 'Righteous, sans-serif' },
  { id: 'jetbrains-mono', label: 'JetBrains Mono', stack: '"JetBrains Mono", monospace' },
];

export const FONT_IDS = FONTS.map((f) => f.id);

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
