import { AppButton } from '@repo/ui';

import { Section, ComponentRow } from './preview-canvas.tsx';

export function ButtonPart() {
  return (
    <Section
      title="Button"
      description="The load-bearing primitive — every action presses down onto its own shadow. Five jobs: lime to go, blue for AI, paper for secondary, ghost for quiet, crimson for the one irreversible action. Tap them."
    >
      <ComponentRow label="Variants">
        <AppButton variant="primary">Done</AppButton>
        <AppButton variant="ai">✦ Generate</AppButton>
        <AppButton variant="secondary">+ Text</AppButton>
        <AppButton variant="ghost">Cancel</AppButton>
        <AppButton variant="danger">Delete design</AppButton>
      </ComponentRow>

      <ComponentRow label="Sizes">
        <AppButton variant="primary" size="sm">
          Small
        </AppButton>
        <AppButton variant="primary" size="md">
          Default
        </AppButton>
        <AppButton variant="primary" size="lg">
          Large
        </AppButton>
      </ComponentRow>

      <ComponentRow label="States">
        <AppButton variant="primary" loading>
          Saving
        </AppButton>
        <AppButton variant="primary" disabled>
          Disabled
        </AppButton>
        <AppButton variant="ai" iconOnly aria-label="ai">
          ✦
        </AppButton>
        <AppButton variant="secondary" iconOnly aria-label="settings">
          ⚙
        </AppButton>
      </ComponentRow>

      <ComponentRow label="Block (the bottom-bar primary)">
        <div className="w-[320px]">
          <AppButton variant="primary" size="lg" block>
            Done — send to Ada ›
          </AppButton>
        </div>
      </ComponentRow>
    </Section>
  );
}
