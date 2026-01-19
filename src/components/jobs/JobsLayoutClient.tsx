'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface JobsLayoutClientProps {
  children: React.ReactNode;
}

export function JobsLayoutClient({ children }: JobsLayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user, isLoggedIn } = useAuth();

  // Navigation links - same for all users, redirect to login if not authenticated
  const getNavHref = (path: string) => {
    return isLoggedIn ? path : `/auth/employee/login?redirect=${encodeURIComponent(path)}`;
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-72 bg-white border-r border-slate-200
          transform transition-transform duration-200 ease-out
          lg:translate-x-0 lg:static lg:z-auto flex-shrink-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo Header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-slate-100">
            <Link href="/" className="flex items-center">
              <Image src="/logo.svg" alt="Jobly" width={90} height={25} />
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 hover:bg-slate-100 rounded-lg text-slate-500"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 overflow-y-auto">
            {/* Main Navigation */}
            <div className="space-y-1">
              <Link
                href="/jobs"
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  pathname === '/jobs'
                    ? 'bg-primary-50 text-primary-700 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <svg className={`w-5 h-5 ${pathname === '/jobs' ? 'text-primary-600' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Browse All Jobs
              </Link>

              <Link
                href={getNavHref('/dashboard')}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all"
              >
                <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                My Dashboard
              </Link>
              <Link
                href={getNavHref('/dashboard/saved-jobs')}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all"
              >
                <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                Saved Jobs
              </Link>
              <Link
                href={getNavHref('/dashboard/applications')}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all"
              >
                <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                My Applications
              </Link>
            </div>

            {/* For Employers CTA */}
            <div className="mt-8 mx-2 p-4 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl text-white">
              <h4 className="font-semibold text-sm mb-1">Are you hiring?</h4>
              <p className="text-xs text-slate-300 mb-3">Post jobs and find the best talent</p>
              <Link
                href="/auth/employer/login"
                className="block w-full py-2 px-3 bg-white text-slate-900 text-xs font-semibold rounded-lg text-center hover:bg-slate-100 transition-colors"
              >
                Post a Job
              </Link>
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-slate-100">
            {isLoggedIn && user ? (
              <Link
                href="/dashboard/profile"
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold text-sm">
                  {user.name ? getInitials(user.name) : 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{user.name || 'My Profile'}</p>
                  <p className="text-xs text-slate-500 truncate">{user.email || 'View profile'}</p>
                </div>
              </Link>
            ) : (
              <div className="space-y-2">
                <Link
                  href="/auth/employee/login"
                  className="block w-full py-2.5 px-4 border border-slate-200 text-slate-700 text-sm font-medium rounded-xl text-center hover:bg-slate-50 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/employee/register"
                  className="block w-full py-2.5 px-4 bg-primary-600 text-white text-sm font-medium rounded-xl text-center hover:bg-primary-700 transition-colors"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-30 bg-white border-b border-slate-200 px-4 h-16 flex items-center">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Link href="/" className="ml-3">
            <Image src="/logo.svg" alt="Jobly" width={80} height={22} />
          </Link>
          <div className="ml-auto flex items-center gap-2">
            {isLoggedIn ? (
              <>
                <Link href="/dashboard/notifications" className="p-2 hover:bg-slate-100 rounded-lg transition-colors relative">
                  <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </Link>
                <Link href="/dashboard/profile" className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-xs font-medium">
                  {user?.name ? getInitials(user.name) : 'U'}
                </Link>
              </>
            ) : (
              <Link
                href="/auth/employee/login"
                className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default JobsLayoutClient;
