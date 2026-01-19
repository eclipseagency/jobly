'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, ArrowLeft } from 'lucide-react';

const errorMessages: Record<string, string> = {
  oauth_init_failed: 'Failed to initiate login. Please try again.',
  oauth_failed: 'Login failed. Please try again or use a different method.',
  missing_params: 'Invalid login request. Please try again.',
  invalid_state: 'Login session expired. Please try again.',
  access_denied: 'Access was denied. Please try again.',
  default: 'An error occurred during login. Please try again.',
};

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const errorCode = searchParams.get('message') || 'default';
  const errorMessage = errorMessages[errorCode] || errorMessages.default;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-2">Login Error</h1>
        <p className="text-slate-600 mb-8">{errorMessage}</p>

        <div className="space-y-3">
          <Link
            href="/auth/employee/login"
            className="block w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Try Again
          </Link>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full py-3 px-4 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>

        <p className="mt-8 text-sm text-slate-500">
          Having trouble?{' '}
          <Link href="/support" className="text-blue-600 hover:text-blue-700">
            Contact support
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>}>
      <AuthErrorContent />
    </Suspense>
  );
}
