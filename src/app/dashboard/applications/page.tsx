'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { jobSeekerAPI, Application as APIApplication } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';

interface ApplicationTimeline {
  date: string;
  event: string;
  description?: string;
}

interface Application {
  id: string;
  title: string;
  company: string;
  companyAvatar: string;
  location: string;
  salary: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Remote';
  status: 'applied' | 'in_review' | 'interview' | 'offer' | 'rejected' | 'withdrawn';
  statusLabel: string;
  appliedAt: string;
  description: string;
  requirements: string[];
  timeline: ApplicationTimeline[];
  interviewDate?: string;
  offerDetails?: {
    salary: string;
    startDate: string;
    benefits: string[];
    expiresAt: string;
  };
}

function mapAPIApplication(app: APIApplication): Application {
  const statusLabels: Record<string, string> = {
    'applied': 'Applied',
    'in_review': 'In Review',
    'interview': 'Interview Scheduled',
    'offer': 'Offer Received',
    'rejected': 'Not Selected',
    'withdrawn': 'Withdrawn',
  };

  return {
    id: app.id,
    title: app.title,
    company: app.company,
    companyAvatar: app.companyAvatar,
    location: app.location,
    salary: app.salary,
    type: app.type as Application['type'],
    status: app.status,
    statusLabel: app.statusLabel || statusLabels[app.status] || 'Applied',
    appliedAt: app.appliedAt,
    description: app.description,
    requirements: app.requirements,
    timeline: [
      { date: app.appliedAt, event: 'Application Submitted', description: 'Your application was received' },
    ],
  };
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'interview': return 'bg-green-50 text-green-600 border-green-200';
    case 'in_review': return 'bg-blue-50 text-blue-600 border-blue-200';
    case 'offer': return 'bg-purple-50 text-purple-600 border-purple-200';
    case 'rejected': return 'bg-slate-100 text-slate-500 border-slate-200';
    case 'withdrawn': return 'bg-orange-50 text-orange-600 border-orange-200';
    default: return 'bg-slate-100 text-slate-600 border-slate-200';
  }
};

const getTimelineIcon = (event: string) => {
  if (event.includes('Submitted')) return '📝';
  if (event.includes('Viewed')) return '👁️';
  if (event.includes('Review')) return '🔍';
  if (event.includes('Shortlisted')) return '⭐';
  if (event.includes('Interview')) return '📅';
  if (event.includes('Offer')) return '🎉';
  if (event.includes('Not Selected') || event.includes('Rejected')) return '❌';
  if (event.includes('Withdrawn')) return '↩️';
  return '📌';
};

export default function ApplicationsPage() {
  const toast = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [withdrawReason, setWithdrawReason] = useState('');

  useEffect(() => {
    async function loadApplications() {
      try {
        const data = await jobSeekerAPI.getApplications();
        setApplications(data.map(mapAPIApplication));
      } catch (error) {
        console.error('Failed to load applications:', error);
        setApplications([]);
      } finally {
        setIsLoading(false);
      }
    }
    loadApplications();
  }, []);

  const filteredApps = filter === 'all'
    ? applications.filter(app => app.status !== 'withdrawn')
    : applications.filter(app => app.status === filter);

  const stats = {
    total: applications.filter(a => a.status !== 'withdrawn').length,
    inReview: applications.filter(a => a.status === 'in_review').length,
    interviews: applications.filter(a => a.status === 'interview').length,
    offers: applications.filter(a => a.status === 'offer').length,
  };

  const handleViewDetails = (app: Application) => {
    setSelectedApp(app);
    setShowDetailsModal(true);
  };

  const handleWithdraw = (app: Application) => {
    setSelectedApp(app);
    setWithdrawReason('');
    setShowWithdrawModal(true);
  };

  const confirmWithdraw = () => {
    if (selectedApp) {
      setApplications(apps => apps.map(app =>
        app.id === selectedApp.id
          ? {
              ...app,
              status: 'withdrawn' as const,
              statusLabel: 'Withdrawn',
              timeline: [...app.timeline, {
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                event: 'Application Withdrawn',
                description: withdrawReason || 'You withdrew your application',
              }],
            }
          : app
      ));
      setShowWithdrawModal(false);
      setShowDetailsModal(false);
      setSelectedApp(null);
    }
  };

  const handleViewOffer = (app: Application) => {
    setSelectedApp(app);
    setShowOfferModal(true);
  };

  const handleAcceptOffer = () => {
    if (selectedApp) {
      setApplications(apps => apps.map(app =>
        app.id === selectedApp.id
          ? {
              ...app,
              statusLabel: 'Offer Accepted',
              timeline: [...app.timeline, {
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                event: 'Offer Accepted',
                description: 'Congratulations! You accepted the job offer',
              }],
            }
          : app
      ));
      setShowOfferModal(false);
      setSelectedApp(null);
      toast.success('Congratulations! You have accepted the offer. The employer will contact you with next steps.');
    }
  };

  const handleDeclineOffer = () => {
    if (selectedApp) {
      setApplications(apps => apps.map(app =>
        app.id === selectedApp.id
          ? {
              ...app,
              status: 'rejected' as const,
              statusLabel: 'Offer Declined',
              timeline: [...app.timeline, {
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                event: 'Offer Declined',
                description: 'You declined the job offer',
              }],
            }
          : app
      ));
      setShowOfferModal(false);
      setSelectedApp(null);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 lg:p-8 max-w-5xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-slate-200 rounded mb-2"></div>
          <div className="h-4 w-64 bg-slate-200 rounded mb-8"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-20 bg-slate-200 rounded-xl"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-slate-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const isEmpty = applications.length === 0;

  if (isEmpty) {
    return (
      <div className="p-4 lg:p-8 max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">My Applications</h1>
          <p className="text-slate-500 mt-1">Track and manage your job applications</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">No Applications Yet</h2>
          <p className="text-slate-500 mb-6 max-w-md mx-auto">
            Start applying to jobs to track your applications here. Your application history and status updates will appear on this page.
          </p>
          <Link
            href="/dashboard/jobs"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Browse Jobs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">My Applications</h1>
        <p className="text-slate-500 mt-1">Track and manage your job applications</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
              <p className="text-xs text-slate-500">Total Applied</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">{stats.inReview}</p>
              <p className="text-xs text-slate-500">In Review</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{stats.interviews}</p>
              <p className="text-xs text-slate-500">Interviews</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">{stats.offers}</p>
              <p className="text-xs text-slate-500">Offers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { key: 'all', label: 'All Applications' },
          { key: 'applied', label: 'Applied' },
          { key: 'in_review', label: 'In Review' },
          { key: 'interview', label: 'Interview' },
          { key: 'offer', label: 'Offers' },
          { key: 'rejected', label: 'Not Selected' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
              filter === tab.key
                ? 'bg-primary-600 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Applications list */}
      {filteredApps.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="font-semibold text-slate-900 mb-2">No applications found</h3>
          <p className="text-sm text-slate-500">
            {filter === 'all' ? 'Start applying to jobs to track your applications here' : `No applications with status "${filter}"`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApps.map((app) => (
            <div key={app.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-slate-100 flex items-center justify-center text-primary-700 font-semibold text-sm flex-shrink-0">
                  {app.companyAvatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-slate-900">{app.title}</h3>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          {app.company}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {app.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {app.salary}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${getStatusColor(app.status)}`}>
                        {app.statusLabel}
                      </span>
                    </div>
                  </div>

                  {/* Interview date notice */}
                  {app.status === 'interview' && app.interviewDate && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-100 rounded-lg">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm font-medium text-green-700">Interview: {app.interviewDate}</span>
                      </div>
                    </div>
                  )}

                  {/* Offer notice */}
                  {app.status === 'offer' && app.offerDetails && (
                    <div className="mt-3 p-3 bg-purple-50 border border-purple-100 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                          </svg>
                          <span className="text-sm font-medium text-purple-700">Offer: {app.offerDetails.salary}</span>
                        </div>
                        <span className="text-xs text-purple-600">Expires: {app.offerDetails.expiresAt}</span>
                      </div>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-slate-400">Applied {app.appliedAt}</span>
                    <div className="flex items-center gap-2">
                      {app.status === 'offer' && (
                        <button
                          onClick={() => handleViewOffer(app)}
                          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                          View Offer
                        </button>
                      )}
                      {app.status !== 'rejected' && app.status !== 'withdrawn' && app.status !== 'offer' && (
                        <button
                          onClick={() => handleWithdraw(app)}
                          className="px-3 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium rounded-lg transition-colors"
                        >
                          Withdraw
                        </button>
                      )}
                      <button
                        onClick={() => handleViewDetails(app)}
                        className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1"
                      >
                        View Details
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Application Details Modal */}
      {showDetailsModal && selectedApp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-100 to-slate-100 flex items-center justify-center text-primary-700 font-semibold">
                    {selectedApp.companyAvatar}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{selectedApp.title}</h2>
                    <p className="text-slate-500">{selectedApp.company} • {selectedApp.location}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg"
                >
                  <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="flex items-center gap-3 mb-6">
                <span className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${getStatusColor(selectedApp.status)}`}>
                  {selectedApp.statusLabel}
                </span>
                <span className="text-sm text-slate-500">Applied {selectedApp.appliedAt}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">Salary Range</p>
                  <p className="text-sm font-medium text-slate-900">{selectedApp.salary}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">Employment Type</p>
                  <p className="text-sm font-medium text-slate-900">{selectedApp.type}</p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-slate-900 mb-2">Job Description</h3>
                <p className="text-sm text-slate-600">{selectedApp.description}</p>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-slate-900 mb-2">Requirements</h3>
                <ul className="space-y-2">
                  {selectedApp.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                      <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {req}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Application Timeline</h3>
                <div className="space-y-4">
                  {selectedApp.timeline.map((item, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-lg">
                          {getTimelineIcon(item.event)}
                        </div>
                        {i < selectedApp.timeline.length - 1 && (
                          <div className="w-0.5 h-full bg-slate-200 mt-1" />
                        )}
                      </div>
                      <div className="pb-4">
                        <p className="text-sm font-medium text-slate-900">{item.event}</p>
                        <p className="text-xs text-slate-500">{item.date}</p>
                        {item.description && (
                          <p className="text-sm text-slate-600 mt-1">{item.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 flex justify-between">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50"
              >
                Close
              </button>
              {selectedApp.status !== 'rejected' && selectedApp.status !== 'withdrawn' && (
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    handleWithdraw(selectedApp);
                  }}
                  className="px-4 py-2 border border-red-200 text-red-600 font-medium rounded-lg hover:bg-red-50"
                >
                  Withdraw Application
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Confirmation Modal */}
      {showWithdrawModal && selectedApp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900">Withdraw Application?</h3>
              <p className="text-sm text-slate-500 mt-2">
                Are you sure you want to withdraw your application for <strong>{selectedApp.title}</strong> at <strong>{selectedApp.company}</strong>?
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">Reason (optional)</label>
              <textarea
                value={withdrawReason}
                onChange={(e) => setWithdrawReason(e.target.value)}
                placeholder="Let the employer know why you're withdrawing..."
                rows={3}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmWithdraw}
                className="flex-1 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg"
              >
                Withdraw
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Offer Details Modal */}
      {showOfferModal && selectedApp && selectedApp.offerDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900">Congratulations!</h3>
              <p className="text-sm text-slate-500 mt-1">You have received a job offer from</p>
              <p className="text-lg font-semibold text-primary-600 mt-1">{selectedApp.company}</p>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 mb-6">
              <h4 className="font-semibold text-slate-900 mb-3">Offer Details</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Position</span>
                  <span className="text-sm font-medium text-slate-900">{selectedApp.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Salary</span>
                  <span className="text-sm font-medium text-green-600">{selectedApp.offerDetails.salary}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Start Date</span>
                  <span className="text-sm font-medium text-slate-900">{selectedApp.offerDetails.startDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Offer Expires</span>
                  <span className="text-sm font-medium text-orange-600">{selectedApp.offerDetails.expiresAt}</span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-semibold text-slate-900 mb-2">Benefits Package</h4>
              <ul className="space-y-2">
                {selectedApp.offerDetails.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                    <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleDeclineOffer}
                className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50"
              >
                Decline Offer
              </button>
              <button
                onClick={handleAcceptOffer}
                className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg"
              >
                Accept Offer
              </button>
            </div>

            <button
              onClick={() => setShowOfferModal(false)}
              className="w-full mt-3 text-sm text-slate-500 hover:text-slate-700"
            >
              Review Later
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
