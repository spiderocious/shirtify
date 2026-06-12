import { AppChip } from '@shirtify/ui';

import { Section, ComponentRow } from './preview-canvas.tsx';

export function ChipPart() {
  return (
    <Section
      title="Chip"
      description="A looser tag for content — shirt type/colour, counts. Sans, 2px radius."
    >
      <ComponentRow label="Tags">
        <AppChip>Hoodie · Black</AppChip>
        <AppChip>Tee · Cream</AppChip>
        <AppChip>Polo · White</AppChip>
        <AppChip>Oversized · Forest</AppChip>
        <AppChip>Front + Back</AppChip>
        <AppChip>12 pcs</AppChip>
      </ComponentRow>
    </Section>
  );
}
