'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Eye,
  Heart,
  Calendar,
  Briefcase,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
  Loader2,
  FileText,
  Users,
  Award,
} from 'lucide-react';

interface Analytics {
  summary: {
    totalApplications: number;
    responseRate: number;
    interviewRate: number;
    offerRate: number;
    profileViews: number;
    savedJobs: number;
    interviews: number;
  };
  statusBreakdown: Record<string, number>;
  recentApplications: Array<{
    id: string;
    status: string;
    appliedAt: string;
    job: {
      id: string;
      title: string;
      company: string;
      logo: string | null;
    };
  }>;
  trends: Array<{
    week: string;
    count: number;
  }>;
  insights: {
    topIndustries: Array<{ industry: string; count: number }>;
    profileCompleteness: number;
    memberSince: string;
  };
}

const statusColors: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
  new: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Clock },
  shortlisted: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
  reviewing: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Eye },
  interviewed: { bg: 'bg-purple-100', text: 'text-purple-700', icon: Users },
  offered: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: Award },
  rejected: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
  hired: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
};

export default function ApplicationAnalyticsPage() {
  const router = useRouter();
  const { user, isLoggedIn } = useAuth();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/auth/employee/login');
    }
  }, [isLoggedIn, router]);

  // Fetch analytics
  useEffect(() => {
    async function fetchAnalytics() {
      if (!user?.id) return;
      try {
        const response = await fetch('/api/employee/analytics', {
          headers: { 'x-user-id': user.id },
        });
        if (response.ok) {
          const data = await response.json();
          setAnalytics(data);
        }
      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, [user?.id]);

  // Format date
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  // Get max value for chart scaling
  const maxTrendValue = analytics?.trends
    ? Math.max(...analytics.trends.map(t => t.count), 1)
    : 1;

  if (!isLoggedIn) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Application Analytics</h1>
          <p className="text-slate-600 mt-1">
            Track your job search progress and insights
          </p>
        </div>

        {analytics ? (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-500 text-sm">Total Applications</span>
                  <FileText className="w-5 h-5 text-blue-500" />
                </div>
                <p className="text-2xl font-bold text-slate-900">
                  {analytics.summary.totalApplications}
                </p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-500 text-sm">Response Rate</span>
                  {analytics.summary.responseRate > 50 ? (
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-500" />
                  )}
                </div>
                <p className="text-2xl font-bold text-slate-900">
                  {analytics.summary.responseRate}%
                </p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-500 text-sm">Interview Rate</span>
                  <Calendar className="w-5 h-5 text-purple-500" />
                </div>
                <p className="text-2xl font-bold text-slate-900">
                  {analytics.summary.interviewRate}%
                </p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-500 text-sm">Profile Views</span>
                  <Eye className="w-5 h-5 text-cyan-500" />
                </div>
                <p className="text-2xl font-bold text-slate-900">
                  {analytics.summary.profileViews}
                </p>
                <p className="text-xs text-slate-400 mt-1">Last 30 days</p>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              {/* Application Status Breakdown */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-900 mb-4">Application Status</h3>
                <div className="space-y-3">
                  {Object.entries(analytics.statusBreakdown).map(([status, count]) => {
                    const config = statusColors[status] || statusColors.new;
                    const percentage = analytics.summary.totalApplications > 0
                      ? (count / analytics.summary.totalApplications) * 100
                      : 0;

                    return (
                      <div key={status} className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center`}>
                          <config.icon className={`w-4 h-4 ${config.text}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-slate-700 capitalize">
                              {status.replace('_', ' ')}
                            </span>
                            <span className="text-sm text-slate-500">{count}</span>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${config.bg} rounded-full transition-all`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Application Trends */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-900 mb-4">Application Trends</h3>
                <div className="h-48 flex items-end gap-1">
                  {analytics.trends.map((week, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-600"
                        style={{
                          height: `${(week.count / maxTrendValue) * 100}%`,
                          minHeight: week.count > 0 ? '8px' : '2px',
                        }}
                        title={`${week.count} applications`}
                      />
                      <span className="text-xs text-slate-400 rotate-45 origin-left whitespace-nowrap">
                        {week.week}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-slate-500 mt-4 text-center">
                  Last 12 weeks
                </p>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Recent Applications */}
              <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-900">Recent Applications</h3>
                  <Link
                    href="/dashboard/applications"
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    View all <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="space-y-3">
                  {analytics.recentApplications.slice(0, 5).map(app => {
                    const config = statusColors[app.status] || statusColors.new;
                    return (
                      <Link
                        key={app.id}
                        href={`/dashboard/applications/${app.id}`}
                        className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        {app.job.logo ? (
                          <img
                            src={app.job.logo}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                            <Briefcase className="w-5 h-5 text-slate-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 truncate">
                            {app.job.title}
                          </p>
                          <p className="text-sm text-slate-500">{app.job.company}</p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${config.bg} ${config.text}`}>
                            {app.status}
                          </span>
                          <p className="text-xs text-slate-400 mt-1">
                            {formatDate(app.appliedAt)}
                          </p>
                        </div>
                      </Link>
                    );
                  })}

                  {analytics.recentApplications.length === 0 && (
                    <div className="text-center py-8 text-slate-500">
                      <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p>No applications yet</p>
                      <Link
                        href="/jobs"
                        className="text-sm text-blue-600 hover:text-blue-700 mt-2 inline-block"
                      >
                        Browse jobs
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Insights */}
              <div className="space-y-6">
                {/* Profile Completeness */}
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h3 className="font-semibold text-slate-900 mb-4">Profile Strength</h3>
                  <div className="flex items-center justify-center mb-4">
                    <div className="relative w-24 h-24">
                      <svg className="w-24 h-24 transform -rotate-90">
                        <circle
                          cx="48"
                          cy="48"
                          r="40"
                          className="stroke-slate-200"
                          strokeWidth="8"
                          fill="none"
                        />
                        <circle
                          cx="48"
                          cy="48"
                          r="40"
                          className={`${
                            analytics.insights.profileCompleteness >= 80
                              ? 'stroke-green-500'
                              : analytics.insights.profileCompleteness >= 50
                              ? 'stroke-yellow-500'
                              : 'stroke-red-500'
                          }`}
                          strokeWidth="8"
                          fill="none"
                          strokeLinecap="round"
                          strokeDasharray={`${analytics.insights.profileCompleteness * 2.51} 251`}
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-slate-900">
                        {analytics.insights.profileCompleteness}%
                      </span>
                    </div>
                  </div>
                  {analytics.insights.profileCompleteness < 80 && (
                    <Link
                      href="/dashboard/profile"
                      className="block text-center text-sm text-blue-600 hover:text-blue-700"
                    >
                      Complete your profile
                    </Link>
                  )}
                </div>

                {/* Top Industries */}
                {analytics.insights.topIndustries.length > 0 && (
                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h3 className="font-semibold text-slate-900 mb-4">Best Performing Industries</h3>
                    <div className="space-y-2">
                      {analytics.insights.topIndustries.map((industry, index) => (
                        <div key={industry.industry} className="flex items-center justify-between">
                          <span className="text-sm text-slate-700">{industry.industry}</span>
                          <span className="text-sm font-medium text-green-600">
                            {industry.count} responses
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Stats */}
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h3 className="font-semibold text-slate-900 mb-4">Quick Stats</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500 flex items-center gap-2">
                        <Heart className="w-4 h-4" /> Saved Jobs
                      </span>
                      <span className="font-medium">{analytics.summary.savedJobs}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500 flex items-center gap-2">
                        <Calendar className="w-4 h-4" /> Interviews
                      </span>
                      <span className="font-medium">{analytics.summary.interviews}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500 flex items-center gap-2">
                        <Award className="w-4 h-4" /> Offer Rate
                      </span>
                      <span className="font-medium">{analytics.summary.offerRate}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <BarChart3 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="font-semibold text-slate-900 mb-2">No analytics data yet</h3>
            <p className="text-slate-500 mb-4">
              Start applying to jobs to see your analytics
            </p>
            <Link
              href="/jobs"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Browse Jobs
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
