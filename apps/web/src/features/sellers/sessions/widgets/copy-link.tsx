import { AppButton, AppInput, DrawerService } from '@shirtify/ui';
import { useState } from 'react';

/** A read-only link field with a copy button. Used for the customer design link. */
export function CopyLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      DrawerService.toast('Link copied', { tone: 'go' });
      setTimeout(() => setCopied(false), 1800);
    } catch {
      DrawerService.toast('Could not copy — select and copy manually', { tone: 'warn' });
    }
  };

  return (
    <div className="flex gap-2">
      <AppInput mono readOnly value={url} onFocus={(e) => e.currentTarget.select()} />
      <AppButton variant="secondary" onClick={copy} className="shrink-0">
        {copied ? 'Copied ✓' : 'Copy'}
      </AppButton>
    </div>
  );
}
