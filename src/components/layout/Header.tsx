'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';

interface HeaderProps {
  currentPage?: 'home' | 'blog' | 'jobs' | 'other';
}

export function Header({ currentPage = 'other' }: HeaderProps) {
  const { isLoggedIn, user, getDashboardPath, logout } = useAuth();

  return (
    <nav className="border-b border-slate-100 w-full bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/">
            <Image src="/logo.svg" alt="Jobly" width={100} height={28} priority />
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/dashboard/jobs"
              className={`text-sm font-medium ${currentPage === 'jobs' ? 'text-primary-600' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Find Jobs
            </Link>
            <Link
              href="/blog"
              className={`text-sm font-medium ${currentPage === 'blog' ? 'text-primary-600' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Blog
            </Link>
            {isLoggedIn && user?.role === 'employer' ? (
              <Link href="/employer/dashboard" className="text-slate-600 hover:text-slate-900 text-sm font-medium">
                Employer Dashboard
              </Link>
            ) : (
              <Link href="/auth/employer/login" className="text-slate-600 hover:text-slate-900 text-sm font-medium">
                For Employers
              </Link>
            )}
          </div>

          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <button
                  onClick={logout}
                  className="hidden sm:inline-flex text-slate-600 hover:text-slate-900 text-sm font-medium"
                >
                  Sign out
                </button>
                <Link
                  href={getDashboardPath()}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  My Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/auth"
                  className="hidden sm:inline-flex text-slate-600 hover:text-slate-900 text-sm font-medium"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth"
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
