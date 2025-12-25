'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { EmployerSidebar } from '@/components/employer/EmployerSidebar';

export default function EmployerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <EmployerSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

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
          <Link href="/" className="ml-3 flex items-center gap-2">
            <Image src="/logo.svg" alt="Jobly" width={80} height={22} />
            <span className="text-xs font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">Employer</span>
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors relative">
              <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-600 rounded-full"></span>
            </button>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-xs font-bold">
              TC
            </div>
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
