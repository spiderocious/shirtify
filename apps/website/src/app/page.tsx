import Link from 'next/link';

import { AppText } from '@repo/ui';

export default function HomePage() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:5173';

  return (
    <main className="mx-auto max-w-4xl px-6 py-20">
      <AppText variant="overline">marketing site</AppText>
      <AppText variant="display-1" className="mt-2">
        Your product headline goes here.
      </AppText>
      <AppText variant="body" className="mt-6 max-w-2xl">
        This is the Next.js marketing site in the monorepo template. It shares the
        same UI primitives as the app. Replace this copy, the cards below and the
        metadata in layout.tsx with your own.
      </AppText>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href={appUrl}
          className="inline-flex items-center justify-center border-3 border-ink bg-lime px-5 py-2.5 text-sm font-bold text-lime-ink shadow-pop active:translate-x-1 active:translate-y-1 active:shadow-none"
        >
          Open the app
        </Link>
        <Link
          href="/pricing"
          className="inline-flex items-center justify-center border-3 border-ink bg-paper-warm px-5 py-2.5 text-sm font-bold text-ink shadow-pop active:translate-x-1 active:translate-y-1 active:shadow-none"
        >
          Pricing
        </Link>
      </div>

      <section className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Card title="Feature one" body="Describe your first feature here." />
        <Card title="Feature two" body="Describe your second feature here." />
        <Card title="Feature three" body="Describe your third feature here." />
        <Card title="Feature four" body="Describe your fourth feature here." />
      </section>
    </main>
  );
}

function Card({ title, body }: { title: string; body: string }) {
  return (
    <div className="border-3 border-ink bg-paper-warm p-5 shadow-pop-sm">
      <AppText variant="heading">{title}</AppText>
      <AppText variant="body-sm" className="mt-2">
        {body}
      </AppText>
    </div>
  );
}
