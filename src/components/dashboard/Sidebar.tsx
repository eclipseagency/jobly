'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

// Navigation groups
const navigationGroups = [
  {
    label: 'Main',
    items: [
      {
        label: 'Dashboard',
        href: '/dashboard',
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        ),
      },
      {
        label: 'Find Jobs',
        href: '/dashboard/jobs',
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        ),
      },
      {
        label: 'Applications',
        href: '/dashboard/applications',
        badgeKey: 'applications',
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        ),
      },
      {
        label: 'Interviews',
        href: '/dashboard/interviews',
        badgeKey: 'interviews',
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        ),
      },
    ],
  },
  {
    label: 'Activity',
    items: [
      {
        label: 'Saved Jobs',
        href: '/dashboard/saved-jobs',
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        ),
      },
      {
        label: 'Messages',
        href: '/dashboard/messages',
        badgeKey: 'messages',
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        ),
      },
      {
        label: 'Notifications',
        href: '/dashboard/notifications',
        badgeKey: 'notifications',
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        ),
      },
    ],
  },
  {
    label: 'Career',
    items: [
      {
        label: 'Career Goals',
        href: '/dashboard/career-goals',
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
          </svg>
        ),
      },
      {
        label: 'Job Alerts',
        href: '/dashboard/job-alerts',
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        ),
      },
      {
        label: 'Analytics',
        href: '/dashboard/analytics',
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        ),
      },
      {
        label: 'Skills Analysis',
        href: '/dashboard/skills-analysis',
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        ),
      },
      {
        label: 'Interview Prep',
        href: '/dashboard/interview-prep',
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        ),
      },
    ],
  },
  {
    label: 'Account',
    items: [
      {
        label: 'Profile',
        href: '/dashboard/profile',
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        ),
      },
      {
        label: 'Documents',
        href: '/dashboard/cv-manager',
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        ),
      },
    ],
  },
];

// Profile completion fields
const PROFILE_FIELDS = [
  { key: 'name', weight: 15 },
  { key: 'email', weight: 15 },
  { key: 'phone', weight: 10 },
  { key: 'location', weight: 10 },
  { key: 'headline', weight: 10 },
  { key: 'summary', weight: 10 },
  { key: 'experience', weight: 10 },
  { key: 'skills', weight: 10 },
  { key: 'resumeUrl', weight: 10 },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  // Calculate profile completion
  const profileCompletion = useMemo(() => {
    if (!user) return 0;
    let total = 0;
    for (const field of PROFILE_FIELDS) {
      const value = user[field.key as keyof typeof user];
      const isComplete = Array.isArray(value) ? value.length > 0 : Boolean(value);
      if (isComplete) total += field.weight;
    }
    return total;
  }, [user]);

  // Badge counts from API
  const [badges, setBadges] = useState<Record<string, number>>({
    applications: 0,
    interviews: 0,
    messages: 0,
    notifications: 0,
  });

  useEffect(() => {
    async function fetchBadgeCounts() {
      if (!user?.id) return;

      try {
        const headers = { 'x-user-id': user.id };

        // Fetch counts in parallel
        const [applicationsRes, notificationsRes] = await Promise.all([
          fetch('/api/applications', { headers }),
          fetch('/api/notifications', { headers }),
        ]);

        const counts: Record<string, number> = {
          applications: 0,
          interviews: 0,
          messages: 0,
          notifications: 0,
        };

        if (applicationsRes.ok) {
          const data = await applicationsRes.json();
          // Count pending/in-review applications
          counts.applications = data.applications?.filter(
            (app: { status: string }) => ['submitted', 'in_review'].includes(app.status.toLowerCase().replace(' ', '_'))
          ).length || 0;
          // Count upcoming interviews
          counts.interviews = data.applications?.filter(
            (app: { status: string }) => app.status.toLowerCase() === 'interview'
          ).length || 0;
        }

        if (notificationsRes.ok) {
          const data = await notificationsRes.json();
          counts.notifications = data.notifications?.filter(
            (n: { read: boolean }) => !n.read
          ).length || 0;
        }

        setBadges(counts);
      } catch {
        // Silently fail - badges will show 0
      }
    }

    fetchBadgeCounts();
  }, [user?.id]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-slate-200
          transform transition-transform duration-200 ease-out
          lg:translate-x-0 lg:static lg:z-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-slate-100">
            <Link href="/dashboard">
              <Image src="/logo.svg" alt="Jobly" width={90} height={25} />
            </Link>
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 hover:bg-slate-100 rounded-lg text-slate-500"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation Groups */}
          <nav className="flex-1 px-3 py-4 overflow-y-auto">
            {navigationGroups.map((group, groupIdx) => (
              <div key={group.label} className={groupIdx > 0 ? 'mt-6' : ''}>
                <p className="px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {group.label}
                </p>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const isActive = pathname === item.href ||
                      (item.href !== '/dashboard' && pathname.startsWith(item.href));
                    const badgeCount = item.badgeKey ? badges[item.badgeKey] : 0;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onClose}
                        className={`
                          flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors
                          ${isActive
                            ? 'bg-primary-50 text-primary-700 font-semibold'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
                          }
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <span className={isActive ? 'text-primary-600' : 'text-slate-400'}>
                            {item.icon}
                          </span>
                          <span>{item.label}</span>
                        </div>
                        {badgeCount > 0 && (
                          <span className={`min-w-[20px] h-5 px-1.5 rounded-full text-xs font-semibold flex items-center justify-center ${
                            isActive
                              ? 'bg-primary-600 text-white'
                              : 'bg-slate-200 text-slate-600'
                          }`}>
                            {badgeCount}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Account Footer with Profile Completion */}
          <div className="p-3 border-t border-slate-100">
            {/* Profile Completion Progress */}
            {profileCompletion < 100 && (
              <div className="mb-3 p-3 bg-primary-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-primary-700">Profile completion</span>
                  <span className="text-xs font-semibold text-primary-700">{profileCompletion}%</span>
                </div>
                <div className="h-1.5 bg-primary-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-600 rounded-full transition-all duration-300"
                    style={{ width: `${profileCompletion}%` }}
                  />
                </div>
                <Link
                  href="/dashboard/profile"
                  className="mt-2 text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                >
                  Complete profile
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            )}

            {/* User Info */}
            <Link
              href="/dashboard/profile"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold text-sm">
                {user?.name ? getInitials(user.name) : 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">{user?.name || 'My Profile'}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email || 'View profile'}</p>
              </div>
            </Link>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-2.5 mt-1 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-red-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Log out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
