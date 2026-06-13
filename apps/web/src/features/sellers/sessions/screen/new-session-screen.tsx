import { ROUTES } from '@shirtify/core';
import { AppText } from '@shirtify/ui';
import { Link } from 'react-router-dom';

import { NewSessionForm } from './parts/new-session-form.tsx';

export default function NewSessionScreen() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <Link to={ROUTES.DASHBOARD} className="font-mono text-[11px] text-ink-3 hover:text-ink">
        ‹ Back to sessions
      </Link>
      <AppText variant="display-2" className="mt-3">
        New customer session
      </AppText>
      <AppText variant="body" className="mt-2">
        Pre-load the shirt details, then send the generated link to your customer.
      </AppText>

      <div className="mt-7 border-3 border-ink bg-paper-warm p-6 shadow-pop">
        <NewSessionForm />
      </div>
    </main>
  );
}
