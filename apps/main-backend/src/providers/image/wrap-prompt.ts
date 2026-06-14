import type { SceneContext } from '@shirtify/core';

/**
 * Build the wrapped vendor prompt. Two hard goals the model keeps violating
 * without firm instruction:
 *   1. Output the ARTWORK ONLY — never a shirt, mockup, hanger, or person.
 *   2. Be excellent and bold, not basic — this is expert graphic design.
 * Provider-agnostic — every adapter reuses this so wording stays consistent.
 */

/** The non-negotiable rules, repeated on every generate/edit call. */
const ARTWORK_ONLY =
  'Output ONLY the standalone design artwork on a fully transparent background. ' +
  'Do NOT draw a t-shirt, garment, hanger, mockup, fabric, person, frame, border, ' +
  'background scene, or product photo — just the isolated graphic itself, ready to ' +
  'print directly onto apparel.';

const EXCELLENCE =
  'You are a world-class apparel graphic designer. Make it bold, striking, and ' +
  'professional — the kind of design people actually want to wear. Go wild and ' +
  'creative: rich, intentional colour, strong composition, confident shapes and ' +
  'typography. Be expressive and original, never plain, generic, or clip-art. ' +
  'High contrast, crisp edges, print-ready quality.';

const colourClause = (scene?: SceneContext): string =>
  scene
    ? `It will be printed on a ${scene.shirt_color} ${scene.shirt_type}, so choose colours ` +
      `that pop against ${scene.shirt_color}.`
    : 'Use a vivid, well-chosen colour palette.';

const layersClause = (scene?: SceneContext): string =>
  scene && scene.layers.length > 0
    ? ` The shirt already has these elements, complement them: ${scene.layers.join('; ')}.`
    : '';

/** generate: text prompt → a print-ready graphic. */
export const wrapGenerate = (prompt: string, scene?: SceneContext): string =>
  `${EXCELLENCE} Create a design about: ${prompt}. ${colourClause(scene)} ` +
  `${ARTWORK_ONLY}${layersClause(scene)}`;

/** edit: instruction applied to an existing graphic (regenerate, not pixel-edit). */
export const wrapEdit = (instruction: string, scene?: SceneContext): string =>
  `${EXCELLENCE} Revise the provided design artwork — apply this change: ${instruction}. ` +
  `Keep what works, push the quality higher. ${colourClause(scene)} ` +
  `${ARTWORK_ONLY}${layersClause(scene)}`;

/**
 * try-on: this one DOES want a realistic worn result (person + design images).
 * Different intent from generate/edit — here we keep the person and render the
 * shirt onto them.
 */
export const wrapTryOn = (scene?: SceneContext, note?: string): string =>
  `Photorealistic result: show the person in the FIRST image wearing a ` +
  `${scene?.shirt_color ?? ''} ${scene?.shirt_type ?? 't-shirt'} that displays the EXACT ` +
  `design from the SECOND image printed on the front, centred and correctly scaled. ` +
  `Keep the person's face, body, pose, and background unchanged. Fit the shirt ` +
  `naturally with realistic folds, shadows, and lighting that match the photo.` +
  (note ? ` ${note}.` : '') +
  layersClause(scene);
