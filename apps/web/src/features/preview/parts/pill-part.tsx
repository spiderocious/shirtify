import { AppPill } from '@repo/ui';

import { Section, ComponentRow } from './preview-canvas.tsx';

export function PillPart() {
  return (
    <Section
      title="Pill"
      description="Mono, uppercase, fat-outlined — never a soft blob. Each tone means one thing: lime go, ink submitted, tomato warn, blue AI. Always paired with a word."
    >
      <ComponentRow label="Tones">
        <AppPill tone="go" dot>
          In progress
        </AppPill>
        <AppPill tone="ink">Submitted</AppPill>
        <AppPill tone="warn" dot>
          Quiet 3d
        </AppPill>
        <AppPill tone="ai">✦ AI design</AppPill>
        <AppPill>Draft</AppPill>
      </ComponentRow>
    </Section>
  );
}
