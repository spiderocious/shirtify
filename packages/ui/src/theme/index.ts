// Design tokens — the single source of truth for the template's palette.
// Re-theme a new project by editing these values (and the matching entries in
// each app's tailwind.config.ts). Names are intentionally semantic, not
// brand-specific, so they survive a rebrand: `brand` for the primary action
// colour, `accent` for highlights/CTAs, `surface`/`ink` for neutrals.
export const COLORS = {
  brand: {
    700: '#1d4ed8',
    900: '#1e3a8a',
  },
  surface: {
    50: '#f8fafc',
  },
  accent: {
    600: '#ea580c',
  },
  ink: {
    900: '#0f172a',
    700: '#334155',
  },
} as const;

export type ColorScale = keyof typeof COLORS;

export const FONTS = {
  display: '"Inter", system-ui, sans-serif',
  body: '"Inter", system-ui, sans-serif',
} as const;
