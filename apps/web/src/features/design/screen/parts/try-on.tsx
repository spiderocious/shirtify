import { buildSceneContext } from '@shirtify/core';
import { AppText, AppButton, DrawerService } from '@shirtify/ui';
import { Show } from '@shirtify/ui/flow';
import { useEffect, useRef, useState } from 'react';

import { resolveAssetUrl } from '@shared/api/resolve-asset-url.ts';

import { useAiTryOn, useAiJob } from '../../api/use-ai.ts';
import { useDesign } from '../../providers/design-provider.tsx';

const readAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('read failed'));
    reader.readAsDataURL(file);
  });

/** Shows the try-on result image once its R2 url resolves. */
function TryOnResult({ storageKey }: { storageKey: string }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let live = true;
    void resolveAssetUrl(storageKey).then((u) => live && setUrl(u));
    return () => {
      live = false;
    };
  }, [storageKey]);
  return url ? (
    <img src={url} alt="You wearing the design" className="w-full border-3 border-ink shadow-pop-sm" />
  ) : null;
}

/** "See it on me" — upload a photo, composite the current design onto you. */
export function TryOnButton() {
  const { token, activeScene, snapshot } = useDesign();
  const tryOn = useAiTryOn();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);

  const job = useAiJob(token, jobId);
  const status = job.data?.status;
  const isWorking = tryOn.isPending || status === 'pending' || status === 'running';
  const result = job.data?.results[0] ?? null;

  const onFile = async (file: File) => {
    const design = snapshot();
    if (!design) {
      DrawerService.toast('Canvas not ready yet — try again', { tone: 'warn' });
      return;
    }
    try {
      const person = await readAsDataUrl(file);
      tryOn.mutate(
        {
          token,
          body: { person_image: person, design_snapshot: design, scene: buildSceneContext(activeScene) },
        },
        {
          onSuccess: (j) => setJobId(j.id),
          onError: () => DrawerService.toast('Try-on failed — try again', { tone: 'warn' }),
        },
      );
    } catch {
      DrawerService.toast('Could not read that photo', { tone: 'warn' });
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <AppText variant="overline">See it on you</AppText>
      <AppText variant="body-sm">Upload a photo of yourself to preview the shirt on you.</AppText>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void onFile(file);
          e.target.value = '';
        }}
      />
      <AppButton variant="secondary" block loading={isWorking} onClick={() => inputRef.current?.click()}>
        <Show when={!isWorking} fallback={<>Creating your preview…</>}>
          See it on me
        </Show>
      </AppButton>

      <Show when={status === 'failed'}>
        <AppText variant="body-sm" className="!text-crit">
          {job.data?.error ?? 'Could not create the preview.'}
        </AppText>
      </Show>

      <Show when={result !== null}>{result && <TryOnResult storageKey={result.storage_key} />}</Show>
    </div>
  );
}
