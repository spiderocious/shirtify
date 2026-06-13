import { ROUTES } from '@shirtify/core';
import { AppText } from '@shirtify/ui';
import { Link } from 'react-router-dom';

import { AuthShell } from './parts/auth-shell.tsx';
import { RegisterForm } from './parts/register-form.tsx';

export default function RegisterScreen() {
  return (
    <AuthShell
      title="Start designing"
      subtitle="Create a seller account to send design links to your customers."
      footer={
        <AppText variant="body-sm">
          Already have an account?{' '}
          <Link to={ROUTES.LOGIN} className="font-bold text-blue underline">
            Log in
          </Link>
        </AppText>
      }
    >
      <RegisterForm />
    </AuthShell>
  );
}
