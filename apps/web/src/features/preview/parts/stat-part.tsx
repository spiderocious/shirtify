import { AppStat } from '@shirtify/ui';

import { Section, ComponentRow } from './preview-canvas.tsx';

export function StatPart() {
  return (
    <Section
      title="Stat"
      description="A fat-outlined box with a loud Archivo Black number — the one place size shouts. Tone tints the value and shadow."
    >
      <ComponentRow label="Her dashboard summary">
        <AppStat label="Active" value="7" />
        <AppStat label="Submitted today" value="3" tone="lime" />
        <AppStat label="Need a nudge" value="2" tone="tomato" />
        <AppStat label="Quoted this week" value="₦86,000" mono />
      </ComponentRow>
    </Section>
  );
}
