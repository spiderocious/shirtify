import { AppField, AppSelect } from '@repo/ui';

import { Section, ComponentRow } from './preview-canvas.tsx';

const SHIRT_TYPES = [
  { label: 'Hoodie', value: 'hoodie' },
  { label: 'Tee', value: 'tee' },
  { label: 'Polo', value: 'polo' },
  { label: 'Oversized', value: 'oversized' },
];

const COLOURS = [
  { label: 'Black', value: 'black' },
  { label: 'White', value: 'white' },
  { label: 'Cream', value: 'cream' },
  { label: 'Forest', value: 'forest' },
];

export function SelectPart() {
  return (
    <Section
      title="Select"
      description="The same outlined-well skin as the input, native arrow replaced with a square-cap ink chevron."
    >
      <ComponentRow label="Her new-session form">
        <div className="w-[200px]">
          <AppField label="Shirt type">
            <AppSelect options={SHIRT_TYPES} />
          </AppField>
        </div>
        <div className="w-[200px]">
          <AppField label="Shirt colour">
            <AppSelect options={COLOURS} />
          </AppField>
        </div>
      </ComponentRow>
    </Section>
  );
}
