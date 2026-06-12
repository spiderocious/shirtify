import { Link } from 'react-router-dom';

import { useHealth } from '@repo/api';
import { ROUTES } from '@repo/core';
import { AppButton, AppText } from '@repo/ui';

export function HomeScreen() {
  const { data, isLoading, isError } = useHealth();

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <AppText variant="overline">Shirtify</AppText>
      <AppText variant="display-1" className="mt-2">
        Design your shirt. Send it back.
      </AppText>
      <AppText variant="body" className="mt-4 max-w-2xl">
        A per-customer t-shirt design link. The customer designs in the browser; she gets a
        print-ready file. Built on the <code>@repo/ui</code> neobrutalist-pop library.
      </AppText>

      <div className="mt-8 flex gap-3">
        <Link to={ROUTES.PREVIEW}>
          <AppButton variant="primary">Open the component library ›</AppButton>
        </Link>
        <Link to={ROUTES.EXAMPLE}>
          <AppButton variant="secondary" type="button">
            Example screen
          </AppButton>
        </Link>
      </div>

      <section className="mt-12 border-3 border-ink bg-paper-warm p-4 text-sm shadow-pop-sm">
        <AppText variant="overline">backend health</AppText>
        <div className="mt-2 font-mono text-sm">
          {isLoading ? 'Checking…' : null}
          {isError ? (
            <span className="text-tomato">unreachable — is main-backend running?</span>
          ) : null}
          {data ? (
            <span>
              status: <strong>{data.status}</strong>
            </span>
          ) : null}
        </div>
      </section>
    </main>
  );
}
