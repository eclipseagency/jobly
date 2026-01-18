'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Briefcase,
  Building2,
  FileText,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

interface DashboardStats {
  users: {
    total: number;
    active: number;
    suspended: number;
    newThisWeek: number;
    newThisMonth: number;
  };
  jobs: {
    total: number;
    active: number;
    pending: number;
    approved: number;
    rejected: number;
    featured: number;
  };
  applications: {
    total: number;
    pending: number;
    reviewing: number;
    accepted: number;
    rejected: number;
    newToday: number;
    newThisWeek: number;
  };
  tenants: {
    total: number;
    verified: number;
    unverified: number;
    suspended: number;
  };
  recentActivity: Array<{
    id: string;
    type: string;
    message: string;
    createdAt: string;
  }>;
}

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchStats = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const token = localStorage.getItem('superadmin_token');
      if (!token) {
        setError('Not authenticated. Please log in.');
        return;
      }

      const response = await fetch('/api/superadmin/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch stats');
      }

      // Validate that we have the expected data structure
      if (!data.users || !data.jobs || !data.applications || !data.tenants) {
        throw new Error('Invalid response from server');
      }

      setStats(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => fetchStats(true), 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        <p className="font-medium">{error}</p>
        <a href="/superadmin/login" className="text-red-600 underline mt-2 inline-block">
          Go to Login
        </a>
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      title: 'Total Users',
      value: stats.users.total,
      icon: Users,
      color: 'bg-blue-500',
      link: '/superadmin/users',
      subStats: [
        { label: 'Active', value: stats.users.active },
        { label: 'Suspended', value: stats.users.suspended },
      ],
    },
    {
      title: 'Total Jobs',
      value: stats.jobs.total,
      icon: Briefcase,
      color: 'bg-green-500',
      link: '/superadmin/jobs',
      subStats: [
        { label: 'Active', value: stats.jobs.active },
        { label: 'Pending', value: stats.jobs.pending, highlight: stats.jobs.pending > 0 },
      ],
    },
    {
      title: 'Employers',
      value: stats.tenants.total,
      icon: Building2,
      color: 'bg-purple-500',
      link: '/superadmin/employers',
      subStats: [
        { label: 'Verified', value: stats.tenants.verified },
        { label: 'Unverified', value: stats.tenants.unverified },
      ],
    },
    {
      title: 'Applications',
      value: stats.applications.total,
      icon: FileText,
      color: 'bg-orange-500',
      link: '/superadmin/users',
      subStats: [
        { label: 'Today', value: stats.applications.newToday },
        { label: 'This Week', value: stats.applications.newThisWeek },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
          <p className="text-gray-500">Monitor and manage your platform</p>
        </div>
        <button
          onClick={() => fetchStats(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Alert Cards */}
      {(stats.jobs.pending > 0 || stats.tenants.suspended > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats.jobs.pending > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-800">Pending Job Approvals</h3>
                <p className="text-sm text-yellow-600">
                  {stats.jobs.pending} jobs waiting for review
                </p>
              </div>
              <Link
                href="/superadmin/jobs?status=PENDING"
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm"
              >
                Review
              </Link>
            </div>
          )}
          {stats.tenants.suspended > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-red-800">Suspended Employers</h3>
                <p className="text-sm text-red-600">
                  {stats.tenants.suspended} employers currently suspended
                </p>
              </div>
              <Link
                href="/superadmin/employers?status=suspended"
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
              >
                View
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <Link
            key={card.title}
            href={card.link}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900">{card.value.toLocaleString()}</h3>
            <p className="text-gray-500 mt-1">{card.title}</p>
            <div className="flex gap-4 mt-4 pt-4 border-t border-gray-100">
              {card.subStats.map((sub) => (
                <div key={sub.label}>
                  <p className={`text-lg font-semibold ${sub.highlight ? 'text-yellow-600' : 'text-gray-900'}`}>
                    {sub.value}
                  </p>
                  <p className="text-xs text-gray-500">{sub.label}</p>
                </div>
              ))}
            </div>
          </Link>
        ))}
      </div>

      {/* Job Approval Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Approval Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Pending</p>
                  <p className="text-sm text-gray-500">Awaiting review</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-yellow-600">{stats.jobs.pending}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Approved</p>
                  <p className="text-sm text-gray-500">Live on platform</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-green-600">{stats.jobs.approved}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Rejected</p>
                  <p className="text-sm text-gray-500">Did not meet criteria</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-red-600">{stats.jobs.rejected}</span>
            </div>
          </div>
        </div>

        {/* Application Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Overview</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Pending</p>
                  <p className="text-sm text-gray-500">New applications</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-blue-600">{stats.applications.pending}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Reviewing</p>
                  <p className="text-sm text-gray-500">Under consideration</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-purple-600">{stats.applications.reviewing}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Accepted</p>
                  <p className="text-sm text-gray-500">Successful applications</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-green-600">{stats.applications.accepted}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        {stats.recentActivity && stats.recentActivity.length > 0 ? (
          <div className="space-y-3">
            {stats.recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    activity.type === 'job'
                      ? 'bg-green-100'
                      : activity.type === 'user'
                      ? 'bg-blue-100'
                      : activity.type === 'application'
                      ? 'bg-orange-100'
                      : 'bg-gray-100'
                  }`}
                >
                  {activity.type === 'job' ? (
                    <Briefcase className="w-5 h-5 text-green-600" />
                  ) : activity.type === 'user' ? (
                    <Users className="w-5 h-5 text-blue-600" />
                  ) : activity.type === 'application' ? (
                    <FileText className="w-5 h-5 text-orange-600" />
                  ) : (
                    <Building2 className="w-5 h-5 text-gray-600" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(activity.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No recent activity</p>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/superadmin/jobs?status=PENDING"
            className="flex flex-col items-center gap-2 p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition"
          >
            <Clock className="w-8 h-8 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">Review Jobs</span>
          </Link>
          <Link
            href="/superadmin/employers?status=unverified"
            className="flex flex-col items-center gap-2 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
          >
            <Building2 className="w-8 h-8 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Verify Employers</span>
          </Link>
          <Link
            href="/superadmin/users"
            className="flex flex-col items-center gap-2 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition"
          >
            <Users className="w-8 h-8 text-purple-600" />
            <span className="text-sm font-medium text-purple-800">Manage Users</span>
          </Link>
          <Link
            href="/superadmin/settings"
            className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
          >
            <TrendingUp className="w-8 h-8 text-gray-600" />
            <span className="text-sm font-medium text-gray-800">View Reports</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
