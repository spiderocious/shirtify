import { useState } from 'react';

import { Repeat } from 'meemaw';

import { AppLayerRow, type AppLayerKind } from '@shirtify/ui';

import { Section, ComponentRow } from './preview-canvas.tsx';

interface Layer {
  readonly id: string;
  readonly kind: AppLayerKind;
  readonly name: string;
  readonly meta: string;
}

const LAYERS: readonly Layer[] = [
  { id: '1', kind: 'text', name: '“LAGOS BOY”', meta: 'text · x142 y88 · 42°' },
  { id: '2', kind: 'ai', name: 'Street-art badge', meta: 'ai · 118%' },
  { id: '3', kind: 'image', name: 'church-logo.png', meta: 'image · 64%' },
  { id: '4', kind: 'text', name: '“EST. 2026”', meta: 'text · −8°' },
];

export function LayerRowPart() {
  const [selected, setSelected] = useState('1');
  const [hidden, setHidden] = useState<readonly string[]>(['3']);

  return (
    <Section
      title="Layer row"
      description="One row in the design tool's layer stack — type-tinted thumbnail, name, mono transform, eye toggle. The selected row fills lime and lifts onto its shadow."
    >
      <ComponentRow label="The stack (tap to select, ● to hide)">
        <div className="flex w-[320px] flex-col gap-2 border-3 border-ink bg-paper-warm p-2.5 shadow-pop">
          <Repeat each={[...LAYERS]}>
            {(layer) => (
              <AppLayerRow
                kind={layer.kind}
                name={layer.name}
                meta={layer.meta}
                selected={layer.id === selected}
                visible={!hidden.includes(layer.id)}
                onSelect={() => setSelected(layer.id)}
                onToggleVisible={() =>
                  setHidden((prev) =>
                    prev.includes(layer.id)
                      ? prev.filter((id) => id !== layer.id)
                      : [...prev, layer.id],
                  )
                }
              />
            )}
          </Repeat>
        </div>
      </ComponentRow>
    </Section>
  );
}
