import React, { ReactNode } from 'react';
import { AuthProvider } from './auth/AuthProvider';
import { useAuth, useAuthState } from './auth/useAuth';

// Main AuthProvider component that wraps the app
export function AuthProviderWrapper({ children }: { children: ReactNode }) {
  const authState = useAuthState();
  
  return (
    <AuthProvider value={authState}>
      {children}
    </AuthProvider>
  );
}

// Re-export the useAuth hook for convenience
export { useAuth };