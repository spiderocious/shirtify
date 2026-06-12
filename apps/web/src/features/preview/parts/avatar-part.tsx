import { AppAvatar } from '@repo/ui';

import { Section, ComponentRow } from './preview-canvas.tsx';

export function AvatarPart() {
  return (
    <Section
      title="Avatar"
      description="Initials only, hard square with a 2px radius. Tinted to role: lime default customer, blue AI-assisted, paper the seller."
    >
      <ComponentRow label="Sizes">
        <AppAvatar initials="TB" size="sm" />
        <AppAvatar initials="AM" size="md" />
        <AppAvatar initials="CH" size="lg" />
      </ComponentRow>
      <ComponentRow label="Tones">
        <AppAvatar initials="TB" tone="lime" />
        <AppAvatar initials="DE" tone="blue" />
        <AppAvatar initials="SE" tone="paper" />
      </ComponentRow>
    </Section>
  );
}
