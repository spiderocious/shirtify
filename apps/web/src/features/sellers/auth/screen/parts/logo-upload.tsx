import { MAX_UPLOAD_BYTES } from '@shirtify/core';
import { AppButton, AppText, DrawerService } from '@shirtify/ui';
import { Show } from '@shirtify/ui/flow';
import { useEffect, useRef, useState } from 'react';

import { fileService } from '@shared/api/resolve-asset-url.ts';

/** Upload a logo to R2; reports its key up. Shows a live preview. */
export function LogoUpload({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (key: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!value) {
      setPreviewUrl(null);
      return;
    }
    void fileService.getFileUri(value).then((u) => {
      if (!cancelled) setPreviewUrl(u);
    });
    return () => {
      cancelled = true;
    };
  }, [value]);

  const onFile = async (file: File) => {
    if (file.size > MAX_UPLOAD_BYTES) {
      DrawerService.toast('Logo is too large (max 5MB)', { tone: 'warn' });
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() ?? 'png';
      const key = await fileService.upload(file, ext, file.type || 'image/png');
      onChange(key);
    } catch {
      DrawerService.toast('Logo upload failed', { tone: 'warn' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex h-20 w-20 shrink-0 items-center justify-center border-3 border-ink bg-paper-deep">
        <Show when={previewUrl !== null} fallback={<span className="text-2xl text-ink-3">＋</span>}>
          <img src={previewUrl ?? ''} alt="logo" className="h-full w-full object-contain" />
        </Show>
      </div>
      <div>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void onFile(f);
            e.target.value = '';
          }}
        />
        <AppButton variant="secondary" size="sm" loading={uploading} onClick={() => inputRef.current?.click()}>
          {value ? 'Replace logo' : 'Upload logo'}
        </AppButton>
        <AppText variant="mono" as="p" className="mt-1 text-[10px]">
          PNG/SVG, square works best.
        </AppText>
      </div>
    </div>
  );
}
