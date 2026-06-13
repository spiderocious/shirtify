import { AppText } from '@shirtify/ui';
import { type ReactNode } from 'react';

/** Centered card shell shared by the login and register screens. */
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-paper px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <AppText variant="overline">Shirtify · seller</AppText>
          <AppText variant="display-2" className="mt-1.5">
            {title}
          </AppText>
          <AppText variant="body-sm" className="mt-2">
            {subtitle}
          </AppText>
        </div>
        <div className="border-3 border-ink bg-paper-warm p-6 shadow-pop">{children}</div>
        <div className="mt-5 text-center">{footer}</div>
      </div>
    </main>
  );
}
