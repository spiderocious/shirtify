import type { SceneContext } from '@shirtify/core';

/**
 * Build the wrapped vendor prompt. The PRD specifies design output must be
 * print-ready: "Design for a [shirt type] in [shirt colour], print-ready,
 * transparent background, bold and clear." We extend that with the structured
 * scene context so the model knows what's already on the shirt.
 *
 * Provider-agnostic — every adapter reuses this so wording stays consistent if
 * we swap vendors.
 */

const shirtClause = (scene?: SceneContext): string =>
  scene ? `for a ${scene.shirt_type} in ${scene.shirt_color}` : 'for a t-shirt';

const layersClause = (scene?: SceneContext): string =>
  scene && scene.layers.length > 0
    ? ` The shirt already has: ${scene.layers.join('; ')}.`
    : '';

/** generate: text prompt → a print-ready graphic. */
export const wrapGenerate = (prompt: string, scene?: SceneContext): string =>
  `Design ${shirtClause(scene)}, print-ready, transparent background, bold and clear. ` +
  `${prompt}.${layersClause(scene)}`;

/** edit: instruction applied to an existing graphic (regenerate, not pixel-edit). */
export const wrapEdit = (instruction: string, scene?: SceneContext): string =>
  `Revise this design ${shirtClause(scene)}, print-ready, transparent background, bold and clear. ` +
  `Apply this change: ${instruction}.${layersClause(scene)}`;

/** try-on: composite the designed shirt onto the person in the photo. */
export const wrapTryOn = (scene?: SceneContext, note?: string): string =>
  `Show the person in the first image realistically wearing a ${scene?.shirt_type ?? 't-shirt'} ` +
  `in ${scene?.shirt_color ?? 'the shown colour'} that displays the exact design from the second image. ` +
  `Keep the person's face, body and pose unchanged; fit the shirt naturally with correct folds and lighting.` +
  (note ? ` ${note}.` : '') +
  layersClause(scene);
