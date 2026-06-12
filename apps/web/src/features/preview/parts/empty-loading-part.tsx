import { AppButton, AppEmptyState, AppSkeleton } from '@repo/ui';

import { Section, ComponentRow } from './preview-canvas.tsx';

export function EmptyLoadingPart() {
  return (
    <Section
      title="Empty · Loading"
      description="Empty states use a dashed fat outline (a slot waiting to be filled) and point at the next action. Skeletons are hard-edged boxes with a single sweep — no spinners."
    >
      <ComponentRow label="Customer · blank shirt">
        <div className="w-[460px]">
          <AppEmptyState
            title="Your shirt's empty — let's fix that"
            description="Tap a tool below to add text, drop an image, or let AI design something for you."
            action={
              <>
                <AppButton variant="secondary">T  Add text</AppButton>
                <AppButton variant="ai">✦ Try AI</AppButton>
              </>
            }
          />
        </div>
      </ComponentRow>

      <ComponentRow label="Her dashboard · no sessions">
        <div className="w-[460px]">
          <AppEmptyState
            glyph="✚"
            title="No customers yet"
            description="Create a session, send the link on WhatsApp, and their design lands right here."
            action={<AppButton variant="primary">＋ New customer session</AppButton>}
          />
        </div>
      </ComponentRow>

      <ComponentRow label="Skeleton row (loading)">
        <div className="flex w-[460px] items-center gap-3 border-3 border-ink bg-paper-warm p-3.5 shadow-pop-sm">
          <AppSkeleton className="h-[38px] w-[38px] rounded-sm" />
          <div className="flex-1">
            <AppSkeleton className="mb-2.5 h-3.5 w-3/5" />
            <AppSkeleton className="h-3.5 w-1/3" />
          </div>
          <AppSkeleton className="h-6 w-20" />
        </div>
      </ComponentRow>
    </Section>
  );
}
