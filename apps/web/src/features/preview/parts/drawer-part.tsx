import { AppButton, DrawerService } from '@repo/ui';

import { Section, ComponentRow } from './preview-canvas.tsx';

export function DrawerPart() {
  return (
    <Section
      title="DrawerService"
      description="The imperative overlay layer — toasts, banners, and modals triggered from anywhere. Hosts are mounted once at the app root; call DrawerService.* to fire them."
    >
      <ComponentRow label="Toasts (each tone, 6 zones available)">
        <AppButton variant="primary" size="sm" onClick={() => DrawerService.toast('Link copied', { tone: 'go' })}>
          go
        </AppButton>
        <AppButton
          variant="ai"
          size="sm"
          onClick={() => DrawerService.toast('3 designs ready', { tone: 'ai', position: 'top-right' })}
        >
          ai · top-right
        </AppButton>
        <AppButton
          variant="secondary"
          size="sm"
          onClick={() => DrawerService.toast('Image too big — max 5MB', { tone: 'warn' })}
        >
          warn
        </AppButton>
        <AppButton
          variant="secondary"
          size="sm"
          onClick={() =>
            DrawerService.toast('Tobi submitted a design', {
              tone: 'ink',
              action: { label: 'Open', onClick: () => undefined },
            })
          }
        >
          ink + action
        </AppButton>
      </ComponentRow>

      <ComponentRow label="Banners">
        <AppButton
          variant="secondary"
          size="sm"
          onClick={() =>
            DrawerService.banner('Submitted', {
              tone: 'go',
              description: 'Tobi sent this design 2 minutes ago.',
            })
          }
        >
          go banner
        </AppButton>
        <AppButton
          variant="secondary"
          size="sm"
          onClick={() =>
            DrawerService.banner('Needs a nudge', {
              tone: 'warn',
              description: "Church anniversary hasn't opened their link in 3 days.",
              cta: { label: 'Remind', onClick: () => undefined },
            })
          }
        >
          warn banner + CTA
        </AppButton>
      </ComponentRow>

      <ComponentRow label="Modals">
        <AppButton
          variant="secondary"
          size="sm"
          onClick={() =>
            DrawerService.confirm('Archive this session?', {
              description: "It'll disappear from your main list but you can still find it under Archived.",
              confirmLabel: 'Archive',
              onConfirm: () => DrawerService.toast('Archived', { tone: 'go' }),
            })
          }
        >
          confirm
        </AppButton>
        <AppButton
          variant="secondary"
          size="sm"
          onClick={() =>
            DrawerService.confirm('Discard changes?', {
              destructive: true,
              description: 'Your edits since the last save will be lost.',
              confirmLabel: 'Discard',
              onConfirm: () => undefined,
            })
          }
        >
          danger confirm
        </AppButton>
        <AppButton
          variant="danger"
          size="sm"
          onClick={() =>
            DrawerService.critical('Delete this design', {
              confirmPhrase: 'DELETE',
              description:
                "This can't be undone. Tobi's submitted design and its print-ready file will be permanently deleted.",
              onConfirm: () => DrawerService.toast('Design deleted', { tone: 'warn' }),
            })
          }
        >
          critical (type DELETE)
        </AppButton>
        <AppButton
          variant="secondary"
          size="sm"
          onClick={() =>
            DrawerService.openModal(
              <div className="w-[360px] p-6">
                <div className="font-display text-xl">Custom modal body</div>
                <p className="mt-2 font-sans text-sm text-ink-2">
                  Any JSX. The service still provides the scrim + close button.
                </p>
              </div>,
            )
          }
        >
          custom
        </AppButton>
      </ComponentRow>
    </Section>
  );
}
