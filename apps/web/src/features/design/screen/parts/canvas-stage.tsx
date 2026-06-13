import { DesignCanvas } from '@shirtify/canvas';

import { resolveAssetUrl } from '@shared/api/resolve-asset-url.ts';

import { useDesign } from '../../providers/design-provider.tsx';

/** The editing surface — DesignCanvas wired to the design provider state. */
export function CanvasStage() {
  const { scenes, side, selectedLayerId, selectLayer, replaceScenes } = useDesign();

  return (
    <div className="flex items-center justify-center bg-paper-deep p-4">
      <div className="w-full max-w-[520px] border-3 border-ink bg-paper shadow-pop">
        <DesignCanvas
          front={scenes.front}
          back={scenes.back}
          side={side}
          resolveAssetUrl={resolveAssetUrl}
          selectedLayerId={selectedLayerId}
          onSelectLayer={selectLayer}
          onChange={replaceScenes}
          className="mx-auto"
        />
      </div>
    </div>
  );
}
