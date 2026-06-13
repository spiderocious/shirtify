import { DesignCanvas } from '@shirtify/canvas';
import {
  searchTemplates,
  emptyScene,
  type DesignTemplate,
  type Scene,
} from '@shirtify/core';
import { AppText, DrawerService } from '@shirtify/ui';
import { useMemo, useState } from 'react';

import { resolveAssetUrl } from '@shared/api/resolve-asset-url.ts';

// A template's preview scene: its layers on a plain white tee backdrop.
const previewScene = (tpl: DesignTemplate): Scene => ({
  ...emptyScene('tee', 'white'),
  layers: tpl.layers,
});

function TemplateGalleryBody({ onApply }: { onApply: (tpl: DesignTemplate) => void }) {
  const [query, setQuery] = useState('');
  const results = useMemo(() => searchTemplates(query), [query]);

  return (
    <div className="flex max-h-[82vh] w-[min(94vw,720px)] flex-col border-3 border-ink bg-paper shadow-pop-lg">
      <div className="flex items-center justify-between border-b-3 border-ink bg-lime px-4 py-3">
        <AppText variant="display-3" as="span" className="!text-lime-ink">
          Templates
        </AppText>
        <span className="font-mono text-[10px] uppercase text-lime-ink">{results.length} designs</span>
      </div>
      <div className="flex min-h-0 flex-1 flex-col p-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or vibe — owambe, retro, gradient, birthday…"
          className="mb-3 w-full border-3 border-ink bg-paper-warm px-3 py-2 font-sans text-sm outline-none focus:shadow-[0_0_0_4px_rgba(31,107,255,0.22)]"
        />
        <div className="grid flex-1 grid-cols-2 gap-3 overflow-y-auto pr-1 sm:grid-cols-3">
          {results.map((tpl) => (
            <button
              key={tpl.id}
              type="button"
              onClick={() => onApply(tpl)}
              className="group flex flex-col border-2.5 border-ink bg-paper-warm text-left shadow-pop-sm transition-transform hover:-translate-y-0.5"
            >
              <div className="pointer-events-none aspect-square w-full overflow-hidden border-b-2.5 border-ink bg-paper-deep">
                <DesignCanvas
                  front={previewScene(tpl)}
                  back={previewScene(tpl)}
                  side="front"
                  readOnly
                  resolveAssetUrl={resolveAssetUrl}
                  onChange={() => undefined}
                  className="h-full w-full"
                />
              </div>
              <span className="truncate px-2.5 py-2 font-heavy text-[12px] font-bold text-ink">
                {tpl.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Open the searchable template gallery. Picking applies + closes. */
export function openTemplateGallery(onApply: (tpl: DesignTemplate) => void): void {
  DrawerService.openModal(
    <TemplateGalleryBody
      onApply={(tpl) => {
        onApply(tpl);
        DrawerService.closeModal();
      }}
    />,
    { bare: true, closeOnOutsideClick: true, closeOnEscape: true },
  );
}
