// Design tokens — the single source of truth for Shirtify's palette.
// Stance: #28 Neobrutalist pop — "a screenprinted flyer that learned to be a
// webpage." Mirrors design-system/projects/shirtify/preview/_foundation.css.
//
// Four loud flats, each with ONE job, never overlapping:
//   lime   = GO / primary / submit / on-track
//   blue   = the AI / "make magic" tool only
//   tomato = warn / attention (system state)
//   crit   = the one irreversible action (colder than tomato, ghost by default)
// Black (`ink`) does the structural work — every object wears a fat outline.
export const COLORS = {
  // Paper & ink
  paper: '#FBF7EC', // bone — the canvas
  paperWarm: '#FFFDF7', // a bright sheet / input well
  paperDeep: '#F2ECDD', // recessed ground
  ink: '#16140F', // the outline + text
  ink2: '#403B31',
  ink3: '#7A7263',
  ink4: '#A79E8C',

  // The four loud flats
  lime: '#C6F24E',
  limeDeep: '#AEDC34',
  limeInk: '#2E3A06', // text on lime
  blue: '#1F6BFF',
  blueDeep: '#1657DB',
  blueTint: '#E5EEFF',
  tomato: '#FF5252',
  tomatoTint: '#FFE7E3',
  crit: '#D11A1A', // irreversible action only
  critTint: '#FBE3E0',
  goTint: '#EEF9CF',
} as const;

export type ColorName = keyof typeof COLORS;

export const FONTS = {
  // Archivo Black shouts (display, big numbers); Space Grotesk works (chrome,
  // body); JetBrains Mono keeps the record (IDs, naira, coords, DPI).
  display: '"Archivo Black", "Archivo", system-ui, sans-serif',
  heavy: '"Archivo", "Space Grotesk", sans-serif',
  body: '"Space Grotesk", system-ui, sans-serif',
  mono: '"JetBrains Mono", ui-monospace, monospace',
} as const;

// Geometry & the signature collapse-shadow (offset, no blur).
export const GEOMETRY = {
  borderWidth: '3px',
  borderWidthThin: '2.5px',
  radius: '0px', // this is a flyer — hard squares
  radiusSm: '2px', // avatars / chips only
  shadowOffset: '4px',
  shadowOffsetSm: '3px',
  shadowOffsetLg: '6px',
} as const;
