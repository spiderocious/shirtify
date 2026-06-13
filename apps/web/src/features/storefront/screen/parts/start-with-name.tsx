import { type StorefrontItem } from '@shirtify/core';
import { AppText, AppField, AppInput, AppButton, DrawerService } from '@shirtify/ui';
import { useState } from 'react';

/** Modal: capture the customer's name, then start a session from a storefront item. */
function NameForm({
  item,
  onStart,
  pending,
}: {
  item: StorefrontItem;
  onStart: (name: string) => void;
  pending: boolean;
}) {
  const [name, setName] = useState('');
  return (
    <div className="w-[min(92vw,400px)] border-3 border-ink bg-paper shadow-pop-lg">
      <div className="border-b-3 border-ink bg-lime px-4 py-3">
        <AppText variant="display-3" as="span" className="!text-lime-ink">
          Make it yours
        </AppText>
      </div>
      <div className="flex flex-col gap-4 p-5">
        <AppText variant="body-sm">
          {item.kind === 'design'
            ? `Start from “${item.label}” — you can tweak it before sending.`
            : 'Design your own from a blank shirt.'}
        </AppText>
        <AppField label="Your name">
          <AppInput
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Tobi"
            autoFocus
          />
        </AppField>
        <AppButton
          variant="primary"
          block
          size="lg"
          loading={pending}
          disabled={!name.trim()}
          onClick={() => onStart(name.trim())}
        >
          Start designing →
        </AppButton>
      </div>
    </div>
  );
}

export function openStartWithName(
  item: StorefrontItem,
  onStart: (name: string) => void,
  pending = false,
): void {
  DrawerService.openModal(<NameForm item={item} onStart={onStart} pending={pending} />, {
    bare: true,
    closeOnOutsideClick: true,
    closeOnEscape: true,
  });
}
