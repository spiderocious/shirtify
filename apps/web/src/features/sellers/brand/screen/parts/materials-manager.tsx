import { MAX_UPLOAD_BYTES, type Seller, type Material } from '@shirtify/core';
import { AppText, AppButton, AppSkeleton, AppToggle, DrawerService } from '@shirtify/ui';
import { Show, Repeat } from '@shirtify/ui/flow';
import { useRef, useState } from 'react';

import { fileService } from '@shared/api/resolve-asset-url.ts';
import { toApiError } from '@shared/api/api-error.ts';

import { useUpdateBrand } from '../../../auth/api/use-update-brand.ts';
import {
  useMaterials,
  useCreateMaterial,
  useDeleteMaterial,
} from '../../../materials/api/use-materials.ts';

/**
 * Manage the materials shown on the storefront: upload custom ones (photo → R2),
 * delete your own, and choose which are visible (stored on the seller).
 */
export function MaterialsManager({ seller }: { seller: Seller }) {
  const { data: materials, isLoading } = useMaterials();
  const createMaterial = useCreateMaterial();
  const deleteMaterial = useDeleteMaterial();
  const updateBrand = useUpdateBrand();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [label, setLabel] = useState('');

  // null visible_materials = all visible.
  const visible = seller.visible_materials;
  const isVisible = (slug: string): boolean => visible === null || visible.includes(slug);

  const toggleVisible = async (slug: string, on: boolean) => {
    const all = (materials ?? []).map((m) => m.slug);
    const current = visible ?? all;
    const next = on ? [...new Set([...current, slug])] : current.filter((s) => s !== slug);
    try {
      await updateBrand.mutateAsync({ visible_materials: next });
    } catch (err) {
      DrawerService.toast((await toApiError(err)).message, { tone: 'warn' });
    }
  };

  const onFile = async (file: File) => {
    if (file.size > MAX_UPLOAD_BYTES) {
      DrawerService.toast('Image is too large (max 5MB)', { tone: 'warn' });
      return;
    }
    if (!label.trim()) {
      DrawerService.toast('Give the material a name first', { tone: 'warn' });
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() ?? 'png';
      const key = await fileService.upload(file, ext, file.type || 'image/png');
      await createMaterial.mutateAsync({ label: label.trim(), image_key: key });
      setLabel('');
      DrawerService.toast('Material added', { tone: 'go' });
    } catch (err) {
      DrawerService.toast((await toApiError(err)).message, { tone: 'warn' });
    } finally {
      setUploading(false);
    }
  };

  const onDelete = (m: Material) => {
    DrawerService.confirm(`Delete "${m.label}"?`, {
      confirmLabel: 'Delete',
      onConfirm: async () => {
        try {
          await deleteMaterial.mutateAsync(m.id);
          DrawerService.toast('Material deleted', { tone: 'ink' });
        } catch (err) {
          DrawerService.toast((await toApiError(err)).message, { tone: 'warn' });
        }
      },
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <AppText variant="overline">Materials</AppText>
        <AppText variant="body-sm" className="mt-1">
          Upload photos of your own shirts/hoodies. Toggle which show on your storefront.
        </AppText>
      </div>

      {/* Upload row */}
      <div className="flex flex-col gap-2 border-2.5 border-ink bg-paper p-3 sm:flex-row sm:items-end">
        <label className="flex-1">
          <span className="mb-1 block font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-ink">
            New material name
          </span>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Vintage Denim Jacket"
            className="w-full border-3 border-ink bg-paper-warm px-3 py-2 font-sans text-sm outline-none focus:shadow-[0_0_0_4px_rgba(31,107,255,0.22)]"
          />
        </label>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void onFile(f);
            e.target.value = '';
          }}
        />
        <AppButton variant="secondary" loading={uploading} onClick={() => inputRef.current?.click()}>
          Upload photo
        </AppButton>
      </div>

      <Show when={!isLoading} fallback={<AppSkeleton className="h-24" />}>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <Repeat each={materials ?? []}>
            {(m) => (
              <div key={m.id} className="border-2.5 border-ink bg-paper-warm p-2.5">
                <div className="flex items-center justify-between">
                  <AppText variant="body-sm" className="truncate font-bold !text-ink">
                    {m.label}
                  </AppText>
                  <Show when={m.scope === 'seller'}>
                    <button
                      type="button"
                      aria-label="Delete"
                      onClick={() => onDelete(m)}
                      className="text-crit"
                    >
                      ✕
                    </button>
                  </Show>
                </div>
                <span className="mt-0.5 block font-mono text-[9px] uppercase text-ink-3">
                  {m.scope === 'platform' ? 'built-in' : 'custom'}
                  {m.image_key ? ' · photo' : ''}
                </span>
                <div className="mt-2">
                  <AppToggle
                    label="On storefront"
                    checked={isVisible(m.slug)}
                    onChange={(on) => void toggleVisible(m.slug, on)}
                  />
                </div>
              </div>
            )}
          </Repeat>
        </div>
      </Show>
    </div>
  );
}
