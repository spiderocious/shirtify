import { buildSceneContext, type AiResultImage, type ImageLayer } from '@shirtify/core';
import { AppText, AppButton, AppField, AppAiResultCard, DrawerService } from '@shirtify/ui';
import { Show, Repeat } from '@shirtify/ui/flow';
import { useEffect, useState } from 'react';

import { resolveAssetUrl } from '@shared/api/resolve-asset-url.ts';

import { useAiGenerate, useAiEdit, useAiJob } from '../../api/use-ai.ts';
import { useDesign } from '../../providers/design-provider.tsx';
import { TryOnButton } from './try-on.tsx';

/** Suggested design colours (named so the prompt reads naturally to the model). */
const COLOURS = [
  { name: 'black & white', hex: '#16140F' },
  { name: 'lime green', hex: '#C6F24E' },
  { name: 'electric blue', hex: '#1F6BFF' },
  { name: 'red', hex: '#FF5252' },
  { name: 'orange', hex: '#ea580c' },
  { name: 'purple', hex: '#9333ea' },
  { name: 'teal', hex: '#0d9488' },
  { name: 'gold', hex: '#eab308' },
];

/** Renders a result's R2 image once its view URL resolves. */
function ResultPreview({ image }: { image: AiResultImage }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let live = true;
    void resolveAssetUrl(image.storage_key).then((u) => live && setUrl(u));
    return () => {
      live = false;
    };
  }, [image.storage_key]);
  return url ? (
    <img src={url} alt="" className="h-full w-full object-contain" />
  ) : (
    <span className="font-mono text-[10px] text-ink-3">loading…</span>
  );
}

/** AI design: generate from a prompt, or edit a selected image layer. + try-on. */
export function AiTool() {
  const { token, activeScene, selectedLayer, addImageLayer, patchLayer } = useDesign();
  const selectedImage = selectedLayer?.kind === 'image' ? (selectedLayer as ImageLayer) : null;

  const generate = useAiGenerate();
  const edit = useAiEdit();
  const [jobId, setJobId] = useState<string | null>(null);
  const [pickedKey, setPickedKey] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [colour, setColour] = useState<string | null>(null);
  const [instruction, setInstruction] = useState('');

  const job = useAiJob(token, jobId);
  const status = job.data?.status;
  const jobKind = job.data?.kind;
  const editLayerId = job.data?.layer_id ?? null;
  const results = job.data?.results ?? [];
  const isWorking =
    generate.isPending || edit.isPending || status === 'pending' || status === 'running';

  const onGenerate = () => {
    if (!prompt.trim()) return;
    setPickedKey(null);
    const colourName = COLOURS.find((c) => c.hex === colour)?.name;
    const fullPrompt = colourName
      ? `${prompt.trim()}. Use mainly ${colourName} tones as the dominant colour.`
      : prompt.trim();
    generate.mutate(
      { token, body: { prompt: fullPrompt, scene: buildSceneContext(activeScene) } },
      {
        onSuccess: (j) => setJobId(j.id),
        onError: () => DrawerService.toast('Could not start — try again', { tone: 'warn' }),
      },
    );
  };

  const onEdit = () => {
    if (!instruction.trim() || !selectedImage) return;
    edit.mutate(
      {
        token,
        body: {
          layer_id: selectedImage.id,
          base_storage_key: selectedImage.assetKey,
          instruction: instruction.trim(),
          scene: buildSceneContext(activeScene),
        },
      },
      {
        onSuccess: (j) => {
          setPickedKey(null);
          setJobId(j.id);
        },
        onError: () => DrawerService.toast('Could not start — try again', { tone: 'warn' }),
      },
    );
  };

  const onPick = (image: AiResultImage) => {
    // Edit results replace the edited layer's image; generate results add a layer.
    if (jobKind === 'edit' && editLayerId) {
      patchLayer(editLayerId, { assetKey: image.storage_key });
      DrawerService.toast('Layer updated', { tone: 'go' });
    } else {
      addImageLayer(image.storage_key);
      DrawerService.toast('Design added to your shirt', { tone: 'go' });
    }
    setPickedKey(image.storage_key);
  };

  return (
    <div className="flex flex-col gap-4">
      <Show
        when={selectedImage !== null}
        fallback={
          <>
            <AppText variant="overline">AI design</AppText>
            <AppText variant="body-sm">
              Describe what you want — you’ll get three options to choose from.
            </AppText>
            <AppField label="Describe your design">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                placeholder="e.g. a Lagos street art vibe, bold and colourful"
                className="w-full resize-none border-3 border-ink bg-paper-warm px-3 py-2 font-sans text-sm outline-none focus:shadow-[0_0_0_4px_rgba(31,107,255,0.22)]"
              />
            </AppField>
            <AppField label="Colour (optional)">
              <div className="flex flex-wrap gap-1.5">
                <Repeat each={COLOURS}>
                  {(c) => (
                    <button
                      key={c.hex}
                      type="button"
                      title={c.name}
                      onClick={() => setColour((cur) => (cur === c.hex ? null : c.hex))}
                      style={{ backgroundColor: c.hex }}
                      className={`h-7 w-7 border-2.5 ${
                        colour === c.hex ? 'border-blue shadow-pop-sm' : 'border-ink'
                      }`}
                    />
                  )}
                </Repeat>
              </div>
            </AppField>
            <AppButton variant="ai" block loading={isWorking} onClick={onGenerate}>
              <Show when={!isWorking} fallback={<>Generating…</>}>
                Generate 3 designs
              </Show>
            </AppButton>
          </>
        }
      >
        <AppText variant="overline">Edit with AI</AppText>
        <AppText variant="body-sm">Describe a change to the selected image.</AppText>
        <AppField label="What should change?">
          <input
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="e.g. make this bolder, change to coral"
            className="w-full border-3 border-ink bg-paper-warm px-3 py-2 font-sans text-sm outline-none focus:shadow-[0_0_0_4px_rgba(31,107,255,0.22)]"
          />
        </AppField>
        <AppButton variant="ai" block loading={isWorking} onClick={onEdit}>
          <Show when={!isWorking} fallback={<>Editing…</>}>
            Generate edits
          </Show>
        </AppButton>
      </Show>

      <Show when={status === 'failed'}>
        <AppText variant="body-sm" className="!text-crit">
          {job.data?.error ?? 'Generation failed. Try a different prompt.'}
        </AppText>
      </Show>

      <Show when={isWorking || results.length > 0}>
        <div className="grid grid-cols-3 gap-2">
          <Show
            when={results.length > 0}
            fallback={
              <Repeat each={[0, 1, 2]}>
                {(i) => <AppAiResultCard key={i} index={i + 1} label="…" loading />}
              </Repeat>
            }
          >
            <Repeat each={results}>
              {(image, i) => (
                <AppAiResultCard
                  key={image.storage_key}
                  index={i + 1}
                  label={`Option ${i + 1}`}
                  picked={pickedKey === image.storage_key}
                  preview={<ResultPreview image={image} />}
                  onPick={() => onPick(image)}
                />
              )}
            </Repeat>
          </Show>
        </div>
      </Show>

      <hr className="border-t-2 border-ink/15" />
      <TryOnButton />
    </div>
  );
}
