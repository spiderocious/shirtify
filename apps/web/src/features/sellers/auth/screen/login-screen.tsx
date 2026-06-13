import { ROUTES } from '@shirtify/core';
import { AppText } from '@shirtify/ui';
import { Link } from 'react-router-dom';

import { AuthShell } from './parts/auth-shell.tsx';
import { LoginForm } from './parts/login-form.tsx';

export default function LoginScreen() {
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to manage your design sessions."
      footer={
        <AppText variant="body-sm">
          New here?{' '}
          <Link to={ROUTES.REGISTER} className="font-bold text-blue underline">
            Create an account
          </Link>
        </AppText>
      }
    >
      <LoginForm />
    </AuthShell>
  );
}
