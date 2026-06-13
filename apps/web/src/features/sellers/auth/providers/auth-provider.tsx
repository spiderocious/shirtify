import { type Seller } from '@shirtify/core';
import { createContext, useContext, type ReactNode } from 'react';

import { hasAccessToken } from '@shared/api/tokens.ts';

import { useMe } from '../api/use-me.ts';

interface AuthContextValue {
  seller: Seller | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  /** True until the seller submits their business details (staged onboarding). */
  needsBusinessSetup: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const hasToken = hasAccessToken();
  const { data: seller, isLoading, isError } = useMe();

  const value: AuthContextValue = {
    seller: seller ?? null,
    // Only "loading" when we actually have a token to validate.
    isLoading: hasToken && isLoading,
    isAuthenticated: hasToken && !isError && seller !== undefined,
    needsBusinessSetup: seller?.registration_status === 'AWAITING_BUSINESS_SUBMISSION',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
