import { AppText, AppPill, AppButton } from '@shirtify/ui';
import { Show } from '@shirtify/ui/flow';

import { useDesign } from '../../providers/design-provider.tsx';

const SAVE_LABEL = {
  idle: '',
  saving: 'Saving…',
  saved: 'Saved ✓',
  error: 'Save failed',
} as const;

/** Top bar: brand wordmark, "designing for", side toggle, save status. */
export function DesignTopbar() {
  const { context, side, setSide, saveState } = useDesign();
  const customer = context.session.customer_name;

  return (
    <header className="flex items-center justify-between gap-3 border-b-3 border-ink bg-paper-warm px-4 py-2.5">
      <div className="flex items-center gap-2.5">
        <span className="flex h-7 w-7 items-center justify-center border-2.5 border-ink bg-lime font-display text-xs text-lime-ink">
          S
        </span>
        <Show when={Boolean(customer)}>
          <AppText variant="mono" as="span" className="hidden sm:inline">
            Designing for {customer}
          </AppText>
        </Show>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex border-2.5 border-ink">
          <AppButton
            variant={side === 'front' ? 'primary' : 'ghost'}
            size="sm"
            className="!border-0 !shadow-none"
            onClick={() => setSide('front')}
          >
            Front
          </AppButton>
          <AppButton
            variant={side === 'back' ? 'primary' : 'ghost'}
            size="sm"
            className="!border-0 !shadow-none"
            onClick={() => setSide('back')}
          >
            Back
          </AppButton>
        </div>
        <Show when={saveState !== 'idle'}>
          <AppPill tone={saveState === 'error' ? 'warn' : saveState === 'saved' ? 'go' : 'default'}>
            {SAVE_LABEL[saveState]}
          </AppPill>
        </Show>
      </div>
    </header>
  );
}
