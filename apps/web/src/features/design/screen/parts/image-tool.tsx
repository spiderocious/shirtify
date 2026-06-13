import { MAX_UPLOAD_BYTES } from '@shirtify/core';
import { AppText, AppButton, DrawerService } from '@shirtify/ui';
import { Show } from '@shirtify/ui/flow';
import { useRef, useState } from 'react';

import { fileService } from '@shared/api/resolve-asset-url.ts';

import { useRegisterAsset } from '../../api/use-register-asset.ts';
import { useDesign } from '../../providers/design-provider.tsx';

const ACCEPT = 'image/png,image/jpeg,image/svg+xml';

const readImageDimensions = (file: File): Promise<{ width: number; height: number } | null> =>
  new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      resolve(null);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });

/** Upload an image to R2, register it, and drop it onto the shirt as a layer. */
export function ImageTool() {
  const { token, addImageLayer } = useDesign();
  const registerAsset = useRegisterAsset();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  const onFile = async (file: File) => {
    if (file.size > MAX_UPLOAD_BYTES) {
      DrawerService.toast('Image is too large (max 5MB)', { tone: 'warn' });
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() ?? 'png';
      const dims = await readImageDimensions(file);
      const key = await fileService.upload(file, ext, file.type || 'image/png');
      await registerAsset.mutateAsync({
        token,
        asset: {
          storage_key: key,
          mime: file.type || 'image/png',
          ...(dims && { width: dims.width, height: dims.height }),
          bytes: file.size,
        },
      });
      addImageLayer(key);
      DrawerService.toast('Image added', { tone: 'go' });
    } catch {
      DrawerService.toast('Upload failed — try again', { tone: 'warn' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <AppText variant="overline">Image</AppText>
      <AppText variant="body-sm">PNG, JPG or SVG. Up to 5MB.</AppText>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void onFile(file);
          e.target.value = '';
        }}
      />
      <AppButton variant="secondary" block loading={uploading} onClick={() => inputRef.current?.click()}>
        <Show when={!uploading} fallback={<>Uploading…</>}>
          Upload an image
        </Show>
      </AppButton>
    </div>
  );
}
