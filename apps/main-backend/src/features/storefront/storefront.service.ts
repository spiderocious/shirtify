import {
  generateToken,
  StorefrontItemSchema,
  type Material,
  type PublicBrand,
  type ShirtType,
  type StorefrontItem,
} from '@shirtify/core';

import { assertColorAvailable } from '@features/colors/colors.service.js';
import { assertMaterialAvailable } from '@features/materials/materials.service.js';
import { NotFoundError } from '@lib/errors.js';
import { getRepos } from '@repos/index.js';
import { toPublicBrand } from '@shared/brand.js';
import { buildInitialScene } from '@shared/design-scene.js';

export const getStorefront = async (
  slug: string,
): Promise<{
  brand: PublicBrand;
  shirt_colors: string[];
  materials: Material[];
  items: StorefrontItem[];
}> => {
  const repos = getRepos();
  const seller = await repos.sellers.bySlug(slug);
  if (!seller) throw new NotFoundError('Storefront');

  const [colors, allMaterials, publicSessions] = await Promise.all([
    repos.colors.listForSeller(seller.id),
    repos.materials.listForSeller(seller.id),
    repos.sessions.listPublicBySeller(seller.id, 60),
  ]);

  // Filter materials by the seller's visible-materials config (null = show all).
  const visible = seller.visible_materials;
  const materials =
    visible === null ? allMaterials : allMaterials.filter((m) => visible.includes(m.slug));

  // Storefront cards = the seller's materials + her public designed sessions.
  const materialItems: StorefrontItem[] = materials.map((m) =>
    StorefrontItemSchema.parse({
      kind: 'material',
      slug: m.slug,
      label: m.label,
      image_key: m.image_key,
      builtin_shape: m.builtin_shape,
    }),
  );

  const designItems: StorefrontItem[] = [];
  for (const session of publicSessions) {
     
    const design = await repos.designs.bySessionId(session.id);
    if (!design) continue;
    designItems.push(
      StorefrontItemSchema.parse({
        kind: 'design',
        token: session.token,
        label: session.customer_name ?? 'Custom design',
        shirt_type: session.shirt_type,
        shirt_color: session.shirt_color,
        material_slug: session.material_slug,
        preview: design.canvas_front,
      }),
    );
  }

  return {
    brand: toPublicBrand(seller),
    shirt_colors: colors.map((c) => c.slug),
    materials,
    items: [...designItems, ...materialItems],
  };
};

const uniqueToken = async (): Promise<string> => {
  const repos = getRepos();
  let token = generateToken(8);

  while (await repos.sessions.tokenExists(token)) {
    token = generateToken(8);
  }
  return token;
};

/**
 * Cold walk-in: create a public-kind session and return its token. If
 * `from_token` is given (customer chose a public designed item), the source
 * design is CLONED into the new session so they can tweak a copy.
 */
export const startPublicSession = async (
  slug: string,
  input: {
    shirt_type: ShirtType;
    shirt_color: string;
    material_slug?: string;
    customer_name?: string;
    from_token?: string;
  },
): Promise<{ token: string }> => {
  const repos = getRepos();
  const seller = await repos.sellers.bySlug(slug);
  if (!seller) throw new NotFoundError('Storefront');

  await assertColorAvailable(seller.id, input.shirt_color);
  if (input.material_slug) await assertMaterialAvailable(seller.id, input.material_slug);

  const token = await uniqueToken();
  const session = await repos.sessions.create({
    seller_id: seller.id,
    kind: 'public',
    token,
    shirt_type: input.shirt_type,
    shirt_color: input.shirt_color,
    ...(input.material_slug !== undefined && { material_slug: input.material_slug }),
    ...(input.customer_name !== undefined && { customer_name: input.customer_name }),
  });

  // Clone a chosen public design, or start from a fresh material-backed scene.
  let front = await buildInitialScene(
    seller.id,
    session.shirt_type,
    session.shirt_color,
    session.material_slug ?? undefined,
  );
  let back = front;
  if (input.from_token) {
    const source = await repos.sessions.byToken(input.from_token);
    if (source && source.seller_id === seller.id && source.visibility === 'public') {
      const sourceDesign = await repos.designs.bySessionId(source.id);
      if (sourceDesign) {
        front = sourceDesign.canvas_front;
        back = sourceDesign.canvas_back;
      }
    }
  }
  await repos.designs.createForSession(session.id, front, back);
  return { token };
};
