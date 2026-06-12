import { AppText } from '@repo/ui';

import { Section, ComponentRow } from './preview-canvas.tsx';

export function TextPart() {
  return (
    <Section
      title="Text"
      description="Three families, three jobs. Archivo Black shouts; Space Grotesk works; JetBrains Mono keeps the record (tabular). No serif — this is not a reading product."
    >
      <ComponentRow label="Display — Archivo Black">
        <div className="flex flex-col gap-3">
          <AppText variant="display-1">DESIGN IT.</AppText>
          <AppText variant="display-2">OWAMBE READY</AppText>
          <AppText variant="display-3">Tobi — birthday hoodie</AppText>
        </div>
      </ComponentRow>

      <ComponentRow label="Chrome — Space Grotesk">
        <div className="flex flex-col gap-2">
          <AppText variant="heading">Add a text layer to your shirt</AppText>
          <AppText variant="body">
            Pick a font, set a colour, drag it where you want it. Twelve fonts that print clean.
          </AppText>
          <AppText variant="body-sm">Body copy holds up at small sizes on a phone.</AppText>
          <AppText variant="overline">Mono overline · section label</AppText>
        </div>
      </ComponentRow>

      <ComponentRow label="Record — JetBrains Mono (tabular)">
        <div className="flex flex-wrap gap-6">
          <AppText variant="mono">shirtify.app/c/k7m2x9p4</AppText>
          <AppText variant="mono">₦12,500</AppText>
          <AppText variant="mono">x 142 · y 88 · 42°</AppText>
          <AppText variant="mono">4500×5400 · 300dpi</AppText>
        </div>
      </ComponentRow>
    </Section>
  );
}
