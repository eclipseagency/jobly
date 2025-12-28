'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface ApplicationDetail {
  id: string;
  status: string;
  coverLetter: string | null;
  resumeUrl: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  job: {
    id: string;
    title: string;
    description: string;
    requirements: string | null;
    location: string | null;
    locationType: string | null;
    salary: string | null;
    jobType: string | null;
    department: string | null;
    isActive: boolean;
    company: {
      id: string;
      name: string;
      logo: string | null;
      isVerified: boolean;
    };
  };
  timeline: Array<{
    id: string;
    status: string;
    date: string;
    note?: string;
  }>;
}

const statusConfig: Record<string, { label: string; color: string; bgColor: string; icon: string }> = {
  pending: {
    label: 'Application Submitted',
    color: 'text-slate-700',
    bgColor: 'bg-slate-100',
    icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  reviewing: {
    label: 'Under Review',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
  },
  interviewed: {
    label: 'Interview Completed',
    color: 'text-purple-700',
    bgColor: 'bg-purple-100',
    icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  },
  offered: {
    label: 'Offer Received',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  rejected: {
    label: 'Not Selected',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  withdrawn: {
    label: 'Withdrawn',
    color: 'text-slate-500',
    bgColor: 'bg-slate-100',
    icon: 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636',
  },
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / 86400000);

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return formatDate(dateString);
}

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [application, setApplication] = useState<ApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(false);
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false);

  useEffect(() => {
    async function fetchApplication() {
      try {
        const response = await fetch(`/api/applications/${params.id}`, {
          headers: {
            'x-user-id': 'demo-user', // TODO: Get from auth
          },
        });
        if (response.ok) {
          const data = await response.json();
          setApplication(data.application);
        }
      } catch (error) {
        console.error('Error fetching application:', error);
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchApplication();
    }
  }, [params.id]);

  const handleWithdraw = async () => {
    setWithdrawing(true);
    try {
      const response = await fetch(`/api/applications/${params.id}/withdraw`, {
        method: 'POST',
        headers: {
          'x-user-id': 'demo-user', // TODO: Get from auth
        },
      });

      if (response.ok) {
        router.push('/dashboard/applications?withdrawn=true');
      }
    } catch (error) {
      console.error('Error withdrawing application:', error);
    } finally {
      setWithdrawing(false);
      setShowWithdrawConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 lg:p-8 max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-200 rounded w-32 mb-6" />
          <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
            <div className="flex gap-4">
              <div className="w-16 h-16 bg-slate-200 rounded-lg" />
              <div className="flex-1">
                <div className="h-6 bg-slate-200 rounded w-1/3 mb-2" />
                <div className="h-4 bg-slate-200 rounded w-1/4 mb-3" />
                <div className="h-8 bg-slate-200 rounded w-32" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="p-4 lg:p-8 max-w-4xl mx-auto">
        <div className="text-center py-12">
          <svg
            className="w-16 h-16 text-slate-300 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h1 className="text-xl font-semibold text-slate-900 mb-2">Application Not Found</h1>
          <p className="text-slate-600 mb-6">
            This application may have been removed or doesn&apos;t exist.
          </p>
          <Link
            href="/dashboard/applications"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
          >
            View All Applications
          </Link>
        </div>
      </div>
    );
  }

  const status = statusConfig[application.status] || statusConfig.pending;

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      {/* Back Link */}
      <Link
        href="/dashboard/applications"
        className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-6"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Applications
      </Link>

      {/* Job Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Company Logo */}
          <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-slate-100 rounded-xl flex items-center justify-center text-primary-600 font-bold text-xl flex-shrink-0">
            {application.job.company.logo ? (
              <Image
                src={application.job.company.logo}
                alt={application.job.company.name}
                width={64}
                height={64}
                className="rounded-xl object-cover"
              />
            ) : (
              application.job.company.name.substring(0, 2).toUpperCase()
            )}
          </div>

          {/* Job Info */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div>
                <h1 className="text-xl font-semibold text-slate-900 mb-1">
                  {application.job.title}
                </h1>
                <div className="flex items-center gap-2 text-slate-600 mb-3">
                  <span>{application.job.company.name}</span>
                  {application.job.company.isVerified && (
                    <svg className="w-4 h-4 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {application.job.location && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      {application.job.location}
                    </span>
                  )}
                  {application.job.jobType && (
                    <span className="px-2.5 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded-full capitalize">
                      {application.job.jobType}
                    </span>
                  )}
                  {application.job.salary && (
                    <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-full">
                      {application.job.salary}
                    </span>
                  )}
                </div>
              </div>

              {/* Status Badge */}
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 ${status.bgColor} ${status.color} text-sm font-medium rounded-full flex-shrink-0`}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={status.icon} />
                </svg>
                {status.label}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-3 mt-6 pt-6 border-t border-slate-100">
          <Link
            href={`/jobs/${application.job.id}`}
            className="px-4 py-2 border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
          >
            View Job Posting
          </Link>
          <Link
            href={`/companies/${application.job.company.id}`}
            className="px-4 py-2 border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
          >
            View Company
          </Link>
          {application.status === 'pending' && (
            <button
              onClick={() => setShowWithdrawConfirm(true)}
              className="px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 text-sm font-medium rounded-lg transition-colors"
            >
              Withdraw Application
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Application Timeline */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Application Timeline</h2>
            <div className="space-y-4">
              {/* Current Status */}
              <div className="flex gap-4">
                <div className={`w-10 h-10 rounded-full ${status.bgColor} flex items-center justify-center flex-shrink-0`}>
                  <svg className={`w-5 h-5 ${status.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={status.icon} />
                  </svg>
                </div>
                <div className="flex-1 pb-4 border-b border-slate-100">
                  <p className="font-medium text-slate-900">{status.label}</p>
                  <p className="text-sm text-slate-500">{formatRelativeDate(application.updatedAt)}</p>
                </div>
              </div>

              {/* Application Submitted */}
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900">Application Submitted</p>
                  <p className="text-sm text-slate-500">{formatDate(application.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Cover Letter */}
          {application.coverLetter && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Your Cover Letter</h2>
              <p className="text-slate-600 whitespace-pre-wrap">{application.coverLetter}</p>
            </div>
          )}

          {/* Job Description */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Job Description</h2>
            <p className="text-slate-600 whitespace-pre-wrap">{application.job.description}</p>
          </div>

          {/* Requirements */}
          {application.job.requirements && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Requirements</h2>
              <p className="text-slate-600 whitespace-pre-wrap">{application.job.requirements}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Application Details */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Application Details</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-500 mb-1">Applied On</p>
                <p className="text-sm font-medium text-slate-900">{formatDate(application.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Last Updated</p>
                <p className="text-sm font-medium text-slate-900">{formatRelativeDate(application.updatedAt)}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Application ID</p>
                <p className="text-xs font-mono text-slate-600">{application.id}</p>
              </div>
              {application.resumeUrl && (
                <div>
                  <p className="text-sm text-slate-500 mb-2">Resume</p>
                  <a
                    href={application.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    View Resume
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Tips Based on Status */}
          <div className="bg-primary-50 border border-primary-100 rounded-xl p-6">
            <h3 className="font-medium text-primary-900 mb-3">
              {application.status === 'pending' && 'While You Wait'}
              {application.status === 'reviewing' && 'Application Under Review'}
              {application.status === 'interviewed' && 'After the Interview'}
              {application.status === 'offered' && 'Congratulations!'}
              {application.status === 'rejected' && 'Keep Going!'}
            </h3>
            <p className="text-sm text-primary-700">
              {application.status === 'pending' &&
                'Your application has been submitted. Companies typically review applications within 1-2 weeks. Continue applying to other positions while you wait.'}
              {application.status === 'reviewing' &&
                'Great news! The employer is reviewing your application. Make sure your contact information is up to date in case they want to schedule an interview.'}
              {application.status === 'interviewed' &&
                'Thank you for completing the interview! Most companies make decisions within 1-2 weeks. Consider sending a thank-you note to your interviewer.'}
              {application.status === 'offered' &&
                "You've received an offer! Take time to review all details carefully. Don't hesitate to ask questions or negotiate terms."}
              {application.status === 'rejected' &&
                "While this position wasn't the right fit, every application is a learning experience. Check out similar positions that match your skills."}
            </p>
          </div>

          {/* Similar Jobs */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Find Similar Jobs</h3>
            <Link
              href={`/dashboard/jobs?search=${encodeURIComponent(application.job.title)}`}
              className="block w-full px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors text-center"
            >
              Search Similar Positions
            </Link>
          </div>
        </div>
      </div>

      {/* Withdraw Confirmation Modal */}
      {showWithdrawConfirm && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Withdraw Application?</h3>
              <p className="text-sm text-slate-600 mb-6">
                Are you sure you want to withdraw your application for <strong>{application.job.title}</strong> at {application.job.company.name}? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowWithdrawConfirm(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Keep Application
                </button>
                <button
                  onClick={handleWithdraw}
                  disabled={withdrawing}
                  className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  {withdrawing ? 'Withdrawing...' : 'Withdraw'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
