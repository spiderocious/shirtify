import { AppField, AppInput, AppTextarea } from '@repo/ui';

import { Section, ComponentRow } from './preview-canvas.tsx';

export function FieldPart() {
  return (
    <Section
      title="Field · Input"
      description="An outlined well with a faint inset shadow — a slot you drop content into. On focus it drops a blue ring. Mono variant for money and record."
    >
      <ComponentRow label="The AI prompt (the most-used input)">
        <div className="w-[420px]">
          <AppField label="Describe your design">
            <AppTextarea rows={3} placeholder="e.g. make me something fly for owambe — gold and black, bold" />
          </AppField>
        </div>
      </ComponentRow>

      <ComponentRow label="States">
        <div className="w-[220px]">
          <AppField label="Default">
            <AppInput placeholder="Tap to type…" />
          </AppField>
        </div>
        <div className="w-[220px]">
          <AppField label="With hint" hint="Only you see this">
            <AppInput defaultValue="In focus" />
          </AppField>
        </div>
        <div className="w-[220px]">
          <AppField label="Error" error="Give the customer a name first.">
            <AppInput invalid placeholder="Required" />
          </AppField>
        </div>
      </ComponentRow>

      <ComponentRow label="Mono — money & record">
        <div className="w-[160px]">
          <AppField label="Price">
            <AppInput mono defaultValue="₦12,500" />
          </AppField>
        </div>
        <div className="w-[240px]">
          <AppField label="Session link">
            <AppInput mono readOnly defaultValue="shirtify.app/c/k7m2x9p4" />
          </AppField>
        </div>
      </ComponentRow>
    </Section>
  );
}
