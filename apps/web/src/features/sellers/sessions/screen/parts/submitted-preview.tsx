import { type Design } from '@shirtify/core';
import { DesignCanvas } from '@shirtify/canvas';

import { resolveAssetUrl } from '@shared/api/resolve-asset-url.ts';

/** Read-only render of a submitted design (front + back) using the canvas module. */
export function SubmittedPreview({ design, className }: { design: Design; className?: string }) {
  return (
    <div className={className}>
      <div className="grid gap-4 sm:grid-cols-2">
        <DesignCanvas
          front={design.canvas_front}
          back={design.canvas_back}
          initialSide="front"
          readOnly
          resolveAssetUrl={resolveAssetUrl}
          onChange={() => undefined}
        />
        <DesignCanvas
          front={design.canvas_front}
          back={design.canvas_back}
          initialSide="back"
          readOnly
          resolveAssetUrl={resolveAssetUrl}
          onChange={() => undefined}
        />
      </div>
    </div>
  );
}
