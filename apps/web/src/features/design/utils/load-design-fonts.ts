/**
 * Loads ALL design fonts so the canvas actually renders each one (fixing the
 * "only 4 fonts reflect" bug — previously only the 4 UI fonts were imported).
 *
 * Vite needs statically-analysable dynamic imports, so each font maps to an
 * explicit `() => import('@fontsource/...')`. Called once when the design screen
 * mounts; `whenFontsReady()` resolves after the browser has applied them.
 */
const LOADERS: Record<string, () => Promise<unknown>> = {
  inter: () => import('@fontsource/inter'),
  'space-grotesk': () => import('@fontsource/space-grotesk'),
  montserrat: () => import('@fontsource/montserrat'),
  poppins: () => import('@fontsource/poppins'),
  'work-sans': () => import('@fontsource/work-sans'),
  'dm-sans': () => import('@fontsource/dm-sans'),
  'archivo-black': () => import('@fontsource/archivo-black'),
  anton: () => import('@fontsource/anton'),
  'bebas-neue': () => import('@fontsource/bebas-neue'),
  oswald: () => import('@fontsource/oswald'),
  righteous: () => import('@fontsource/righteous'),
  bungee: () => import('@fontsource/bungee'),
  'titan-one': () => import('@fontsource/titan-one'),
  fredoka: () => import('@fontsource/fredoka'),
  'alfa-slab': () => import('@fontsource/alfa-slab-one'),
  playfair: () => import('@fontsource/playfair-display'),
  merriweather: () => import('@fontsource/merriweather'),
  'abril-fatface': () => import('@fontsource/abril-fatface'),
  lobster: () => import('@fontsource/lobster'),
  pacifico: () => import('@fontsource/pacifico'),
  'dancing-script': () => import('@fontsource/dancing-script'),
  caveat: () => import('@fontsource/caveat'),
  'permanent-marker': () => import('@fontsource/permanent-marker'),
  satisfy: () => import('@fontsource/satisfy'),
  'jetbrains-mono': () => import('@fontsource/jetbrains-mono'),
  'space-mono': () => import('@fontsource/space-mono'),
};

let started = false;

/** Kick off loading every design font (idempotent). */
export const loadDesignFonts = (): void => {
  if (started) return;
  started = true;
  for (const load of Object.values(LOADERS)) void load().catch(() => undefined);
};

/** Resolves once the browser reports fonts ready (best-effort). */
export const whenFontsReady = async (): Promise<void> => {
  try {
    await (document as Document & { fonts?: { ready: Promise<unknown> } }).fonts?.ready;
  } catch {
    // ignore
  }
};
