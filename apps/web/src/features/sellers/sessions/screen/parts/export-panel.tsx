import { EXPORT_PRESETS, type ExportBody, type SceneSide } from '@shirtify/core';
import { AppButton, AppField, AppSelect, AppText, DrawerService } from '@shirtify/ui';
import { useState } from 'react';

import { toApiError } from '@shared/api/api-error.ts';

import { useExport } from '../../api/use-export.ts';

const presetOptions = EXPORT_PRESETS.map((p) => ({ value: p.id, label: p.label }));
const sideOptions: ReadonlyArray<{ value: SceneSide; label: string }> = [
  { value: 'front', label: 'Front' },
  { value: 'back', label: 'Back' },
];

/** Pick a size + side, render a transparent PNG, open the download. */
export function ExportPanel({ sessionId }: { sessionId: string }) {
  const exportDesign = useExport(sessionId);
  const [preset, setPreset] = useState(EXPORT_PRESETS[0]?.id ?? 'web');
  const [side, setSide] = useState<SceneSide>('front');

  const download = async () => {
    const body: ExportBody = { preset, side };
    try {
      const { url } = await exportDesign.mutateAsync(body);
      window.open(url, '_blank', 'noopener');
      DrawerService.toast('Export ready — opening download', { tone: 'go' });
    } catch (err) {
      const apiError = await toApiError(err);
      DrawerService.toast(apiError.message, { tone: 'warn' });
    }
  };

  return (
    <div className="border-3 border-ink bg-paper-warm p-5 shadow-pop">
      <AppText variant="overline">Download print file</AppText>
      <AppText variant="body-sm" className="mt-1">
        Renders a transparent PNG at the size you choose.
      </AppText>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <AppField label="Size" htmlFor="export-size">
          <AppSelect
            id="export-size"
            options={presetOptions}
            value={preset}
            onChange={(e) => setPreset(e.target.value)}
          />
        </AppField>
        <AppField label="Side" htmlFor="export-side">
          <AppSelect
            id="export-side"
            options={sideOptions}
            value={side}
            onChange={(e) => setSide(e.target.value as SceneSide)}
          />
        </AppField>
      </div>
      <AppButton
        variant="primary"
        className="mt-4"
        loading={exportDesign.isPending}
        onClick={download}
      >
        Download PNG ↓
      </AppButton>
    </div>
  );
}
