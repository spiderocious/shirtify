import { useState } from 'react';

import { AppColourSwatches, AppFontPicker, type AppFontOption } from '@shirtify/ui';

import { Section, ComponentRow } from './preview-canvas.tsx';

const FONTS: readonly AppFontOption[] = [
  { id: 'archivo-black', label: 'Archivo Black', fontFamily: '"Archivo Black", sans-serif' },
  { id: 'grotesk', label: 'Grotesk', fontFamily: '"Space Grotesk", sans-serif' },
  { id: 'serif', label: 'Serif', fontFamily: 'Georgia, serif' },
  { id: 'mono', label: 'Mono', fontFamily: '"JetBrains Mono", monospace' },
  { id: 'script', label: 'Script', fontFamily: '"Brush Script MT", cursive' },
  { id: 'impact', label: 'Impact', fontFamily: 'Impact, sans-serif' },
];

const COLOURS = ['#16140F', '#FFFFFF', '#C6F24E', '#FF5252', '#1F6BFF', '#FFB22E', '#7C5CFF', '#E6007A'];

export function PickersPart() {
  const [font, setFont] = useState('archivo-black');
  const [colour, setColour] = useState('#16140F');

  return (
    <Section
      title="Font · Colour pickers"
      description="Curated, not freeform — a controlled set that always prints clean. A freeform colour wheel and a 900-font dropdown produce designs that print badly. Fewer choices, better shirts."
    >
      <ComponentRow label="Font — 12 that print clean">
        <div className="w-[300px]">
          <AppFontPicker fonts={FONTS} value={font} onChange={setFont} />
        </div>
      </ComponentRow>
      <ComponentRow label="Colour — curated set">
        <AppColourSwatches colours={COLOURS} value={colour} onChange={setColour} />
      </ComponentRow>
    </Section>
  );
}
