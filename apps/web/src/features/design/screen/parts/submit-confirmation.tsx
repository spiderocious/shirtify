import { AppText } from '@shirtify/ui';

/** Shown after the customer submits — a thank-you in the seller's voice. */
export function SubmitConfirmation({ brandName }: { brandName: string }) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-paper px-6 py-12">
      <div className="w-full max-w-md border-3 border-ink bg-paper-warm p-8 text-center shadow-pop">
        <span className="inline-block -rotate-[5deg] font-display text-[56px] text-lime">✓</span>
        <AppText variant="display-2" className="mt-3">
          Design sent!
        </AppText>
        <AppText variant="body" className="mt-3">
          Thanks! {brandName} will be in touch on WhatsApp shortly to sort out your shirt.
        </AppText>
        <AppText variant="mono" as="p" className="mt-6 text-[10px]">
          Designed with Shirtify · for {brandName}
        </AppText>
      </div>
    </main>
  );
}
