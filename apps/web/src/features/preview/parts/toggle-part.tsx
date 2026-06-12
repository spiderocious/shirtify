import { useState } from 'react';

import { AppToggle } from '@repo/ui';

import { Section, ComponentRow } from './preview-canvas.tsx';

export function TogglePart() {
  const [stroke, setStroke] = useState(true);
  const [shadow, setShadow] = useState(false);

  return (
    <Section
      title="Toggle"
      description="A hard switch — outlined track, square ink thumb that slides and fills lime when on. Used for stroke / shadow on a text layer."
    >
      <ComponentRow label="Interactive">
        <label className="flex items-center gap-3 font-sans text-sm font-semibold">
          <AppToggle checked={stroke} onChange={setStroke} label="Stroke" />
          Stroke / outline
        </label>
        <label className="flex items-center gap-3 font-sans text-sm font-semibold">
          <AppToggle checked={shadow} onChange={setShadow} label="Drop shadow" />
          Drop shadow
        </label>
      </ComponentRow>

      <ComponentRow label="States">
        <AppToggle checked onChange={() => undefined} />
        <AppToggle checked={false} onChange={() => undefined} />
        <AppToggle checked disabled onChange={() => undefined} />
      </ComponentRow>
    </Section>
  );
}
