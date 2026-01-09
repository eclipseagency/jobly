'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { MessagingProvider } from '@/contexts/MessagingContext';
import { ToastProvider } from '@/components/ui/Toast';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <MessagingProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </MessagingProvider>
    </AuthProvider>
  );
}
