import {
  SHIRT_TYPES,
  SHIRT_TYPE_LABELS,
  type Session,
  type ShirtType,
} from '@shirtify/core';
import { AppButton, AppField, AppSelect, AppColourSwatches, AppText, AppSkeleton, DrawerService } from '@shirtify/ui';
import { Show } from '@shirtify/ui/flow';
import { useMemo, useState } from 'react';

import { toApiError } from '@shared/api/api-error.ts';

import { useColors } from '../../api/use-colors.ts';
import { useEditSession } from '../../api/use-edit-session.ts';
import { useMaterials } from '../../../materials/api/use-materials.ts';

const typeOptions = SHIRT_TYPES.map((t) => ({ value: t, label: SHIRT_TYPE_LABELS[t] }));

/** Inline editor (modal body) for a session's shirt type / colour / material. */
function EditShirtBody({ session, onDone }: { session: Session; onDone: () => void }) {
  const edit = useEditSession();
  const { data: colors, isLoading: colorsLoading } = useColors();
  const { data: materials } = useMaterials();

  const [shirtType, setShirtType] = useState<ShirtType>(session.shirt_type);
  const [shirtColor, setShirtColor] = useState(session.shirt_color);
  const [materialSlug, setMaterialSlug] = useState<string>(session.material_slug ?? '');

  const swatchHexes = useMemo(() => (colors ?? []).map((c) => c.hex), [colors]);
  const selectedHex = useMemo(
    () => colors?.find((c) => c.slug === shirtColor)?.hex ?? '',
    [colors, shirtColor],
  );
  const hexToSlug = useMemo(
    () => new Map((colors ?? []).map((c) => [c.hex.toLowerCase(), c.slug])),
    [colors],
  );

  const materialOptions = [
    { value: '', label: 'Built-in (by type)' },
    ...(materials ?? []).map((m) => ({ value: m.slug, label: m.label })),
  ];

  const save = async () => {
    try {
      await edit.mutateAsync({
        id: session.id,
        patch: {
          shirt_type: shirtType,
          shirt_color: shirtColor,
          material_slug: materialSlug || null,
        },
      });
      DrawerService.toast('Shirt updated', { tone: 'go' });
      onDone();
    } catch (err) {
      DrawerService.toast((await toApiError(err)).message, { tone: 'warn' });
    }
  };

  return (
    <div className="flex w-[min(92vw,420px)] flex-col gap-4">
      <AppText variant="display-3">Edit shirt</AppText>

      <AppField label="Shirt type">
        <AppSelect
          options={typeOptions}
          value={shirtType}
          onChange={(e) => setShirtType(e.target.value as ShirtType)}
        />
      </AppField>

      <AppField label="Material">
        <AppSelect
          options={materialOptions}
          value={materialSlug}
          onChange={(e) => setMaterialSlug(e.target.value)}
        />
      </AppField>

      <AppField label="Colour">
        <Show when={!colorsLoading} fallback={<AppSkeleton className="h-10 w-40" />}>
          <AppColourSwatches
            colours={swatchHexes}
            value={selectedHex}
            onChange={(hex) => setShirtColor(hexToSlug.get(hex.toLowerCase()) ?? shirtColor)}
          />
        </Show>
      </AppField>

      <div className="flex gap-2">
        <AppButton variant="primary" loading={edit.isPending} onClick={save}>
          Save changes
        </AppButton>
        <AppButton variant="ghost" onClick={onDone}>
          Cancel
        </AppButton>
      </div>
    </div>
  );
}

/** Button that opens the edit-shirt modal. */
export function EditShirtButton({ session }: { session: Session }) {
  return (
    <AppButton
      variant="secondary"
      size="sm"
      onClick={() =>
        DrawerService.openModal(
          <EditShirtBody session={session} onDone={() => DrawerService.closeModal()} />,
          { closeOnOutsideClick: true, closeOnEscape: true },
        )
      }
    >
      Edit shirt
    </AppButton>
  );
}
