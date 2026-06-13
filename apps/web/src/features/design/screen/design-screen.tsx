import { AppSkeleton, AppEmptyState } from '@shirtify/ui';
import { useParams } from 'react-router-dom';

import { usePublicSession } from '../api/use-public-session.ts';
import { DesignProvider } from '../providers/design-provider.tsx';
import { DesignEditor } from './parts/design-editor.tsx';
import { SubmitConfirmation } from './parts/submit-confirmation.tsx';

export default function DesignScreen() {
  const { token = '' } = useParams();
  const { data, isLoading, isError } = usePublicSession(token);

  if (isLoading) {
    return (
      <main className="min-h-dvh bg-paper p-6">
        <AppSkeleton className="h-12 w-full" />
        <AppSkeleton className="mt-4 h-[60vh] w-full" />
      </main>
    );
  }

  if (isError || !data) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-paper px-6">
        <AppEmptyState
          glyph="⚠"
          title="This link isn't working"
          description="The design link may be wrong or expired. Ask the seller for a fresh link."
        />
      </main>
    );
  }

  // Already submitted → show the thank-you, not the editor.
  if (data.session.status === 'submitted') {
    return <SubmitConfirmation brandName={data.brand.business_name} />;
  }

  if (data.session.status === 'archived') {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-paper px-6">
        <AppEmptyState
          glyph="◌"
          title="This link is no longer active"
          description="Reach out to the seller if you still need a shirt."
        />
      </main>
    );
  }

  return (
    <DesignProvider token={token} context={data}>
      <DesignEditor />
    </DesignProvider>
  );
}
