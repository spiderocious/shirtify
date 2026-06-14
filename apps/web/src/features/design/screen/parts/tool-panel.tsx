import { AppText } from '@shirtify/ui';
import { Show } from '@shirtify/ui/flow';

import { useDesign } from '../../providers/design-provider.tsx';
import { AiTool } from './ai-tool.tsx';
import { ColourTool } from './colour-tool.tsx';
import { FiltersTool } from './filters-tool.tsx';
import { GraphicsTool } from './graphics-tool.tsx';
import { ImageTool } from './image-tool.tsx';
import { ShapesTool } from './shapes-tool.tsx';
import { TextEditor } from './text-editor.tsx';
import { LayerPanel } from './layer-panel.tsx';

export type ToolId = 'text' | 'image' | 'ai' | 'graphics' | 'shapes' | 'filters' | 'colour' | null;

/**
 * The right rail content. Priority: a selected text layer shows its editor;
 * otherwise the active tool's panel; always followed by the layer list.
 */
export function ToolPanel({ tool }: { tool: ToolId }) {
  const { selectedLayer } = useDesign();

  if (selectedLayer?.kind === 'text') {
    return (
      <div className="flex flex-col gap-5">
        <TextEditor layer={selectedLayer} />
        <LayerPanel />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <Show when={tool === 'text'}>
        <div>
          <AppText variant="overline">Text</AppText>
          <AppText variant="body-sm" className="mt-1">
            Tap “Text” to add a layer, then tap it on the shirt to edit.
          </AppText>
        </div>
      </Show>
      <Show when={tool === 'image'}>
        <ImageTool />
      </Show>
      <Show when={tool === 'ai'}>
        <AiTool />
      </Show>
      <Show when={tool === 'graphics'}>
        <GraphicsTool />
      </Show>
      <Show when={tool === 'shapes'}>
        <ShapesTool />
      </Show>
      <Show when={tool === 'filters'}>
        <FiltersTool />
      </Show>
      <Show when={tool === 'colour'}>
        <ColourTool />
      </Show>
      <LayerPanel />
    </div>
  );
}
