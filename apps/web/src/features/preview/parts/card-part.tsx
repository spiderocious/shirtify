import { AppBox, AppCard, AppPill, AppText } from '@repo/ui';

import { Section, ComponentRow } from './preview-canvas.tsx';

export function CardPart() {
  return (
    <Section
      title="Box · Card"
      description="One card idiom — a fat-outlined box on a hard offset shadow. AppCard adds a labelled header strip; pressable cards collapse onto their shadow like buttons."
    >
      <ComponentRow label="Session preview card (pressable)">
        <AppCard
          pressable
          headerLabel="Tobi — birthday hoodie"
          headerRight="Submitted"
          headerTone="ink"
          className="w-[260px]"
        >
          <div className="shirtify-halftone flex h-[140px] items-center justify-center border-b-3 border-ink">
            <span className="-rotate-[4deg] font-display text-[28px] text-lime">OWAMBE</span>
          </div>
          <div className="flex items-center justify-between p-3.5">
            <div>
              <AppText variant="heading">Hoodie · Black</AppText>
              <AppText variant="mono" className="text-[11px]">
                /c/k7m2x9p4 · ₦12,500
              </AppText>
            </div>
            <AppPill tone="ink">↗</AppPill>
          </div>
        </AppCard>
      </ComponentRow>

      <ComponentRow label="Plain content box">
        <AppBox padded className="max-w-[420px]">
          <AppText variant="overline" className="mb-2.5 block">
            Default per-session welcome
          </AppText>
          <AppText variant="body-sm">
            “Hi Tobi 👋 here&apos;s your design space — make it however you want, hit Done when
            you&apos;re happy and I&apos;ll be in touch on WhatsApp.”
          </AppText>
        </AppBox>
      </ComponentRow>
    </Section>
  );
}
