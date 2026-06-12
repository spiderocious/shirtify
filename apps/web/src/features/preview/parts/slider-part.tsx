import { useState } from 'react';

import { AppSlider, AppText } from '@repo/ui';

import { Section, ComponentRow } from './preview-canvas.tsx';

export function SliderPart() {
  const [stroke, setStroke] = useState(4);
  const [scale, setScale] = useState(118);
  const [rotate, setRotate] = useState(42);

  return (
    <Section
      title="Slider"
      description="Chunky outlined track with a square lime thumb. Used for stroke width, scale, and rotation on a layer. The readout is mono and tabular."
    >
      <ComponentRow label="Stroke width">
        <div className="grid w-[280px] grid-cols-[1fr_56px] items-center gap-3.5">
          <AppSlider min={0} max={12} value={stroke} onChange={(e) => setStroke(Number(e.target.value))} />
          <AppText variant="mono" className="text-right font-bold text-ink">
            {stroke} px
          </AppText>
        </div>
      </ComponentRow>
      <ComponentRow label="Scale">
        <div className="grid w-[280px] grid-cols-[1fr_56px] items-center gap-3.5">
          <AppSlider min={20} max={200} value={scale} onChange={(e) => setScale(Number(e.target.value))} />
          <AppText variant="mono" className="text-right font-bold text-ink">
            {scale}%
          </AppText>
        </div>
      </ComponentRow>
      <ComponentRow label="Rotate">
        <div className="grid w-[280px] grid-cols-[1fr_56px] items-center gap-3.5">
          <AppSlider
            min={-180}
            max={180}
            value={rotate}
            onChange={(e) => setRotate(Number(e.target.value))}
          />
          <AppText variant="mono" className="text-right font-bold text-ink">
            {rotate}°
          </AppText>
        </div>
      </ComponentRow>
    </Section>
  );
}
