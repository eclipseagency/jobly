'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { MessagingProvider } from '@/contexts/MessagingContext';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <MessagingProvider>
        {children}
      </MessagingProvider>
    </AuthProvider>
  );
}
