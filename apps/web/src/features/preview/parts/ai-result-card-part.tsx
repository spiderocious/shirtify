import { useState } from 'react';

import { AppAiResultCard } from '@repo/ui';

import { Section, ComponentRow } from './preview-canvas.tsx';

export function AiResultCardPart() {
  const [picked, setPicked] = useState(2);

  return (
    <Section
      title="AI result card"
      description="One of the three options the AI returns. Tap one to drop it onto the shirt; the picked card lifts onto a blue shadow. Artwork is passed via the preview slot — the library never hardcodes a mockup."
    >
      <ComponentRow label="Three options (tap to pick)">
        <div className="w-[180px]">
          <AppAiResultCard
            index={1}
            label="Option 1"
            picked={picked === 1}
            onPick={() => setPicked(1)}
            preview={
              <div className="shirtify-halftone flex h-full w-full items-center justify-center">
                <span className="-rotate-[3deg] font-display text-lg text-[#FFB22E]">OWAMBE</span>
              </div>
            }
          />
        </div>
        <div className="w-[180px]">
          <AppAiResultCard
            index={2}
            label="Option 2"
            picked={picked === 2}
            onPick={() => setPicked(2)}
            preview={
              <div className="flex h-full w-full items-center justify-center bg-[#FFB22E]">
                <span className="-rotate-[3deg] font-display text-lg text-ink">OWAMBE</span>
              </div>
            }
          />
        </div>
        <div className="w-[180px]">
          <AppAiResultCard
            index={3}
            label="Option 3"
            picked={picked === 3}
            onPick={() => setPicked(3)}
            preview={
              <div className="flex h-full w-full items-center justify-center bg-ink">
                <span className="rotate-[2deg] font-display text-lg text-[#FFB22E]">OWAMBE</span>
              </div>
            }
          />
        </div>
      </ComponentRow>

      <ComponentRow label="Generating (loading)">
        <div className="w-[180px]">
          <AppAiResultCard index={1} label="Option 1" loading />
        </div>
      </ComponentRow>
    </Section>
  );
}
