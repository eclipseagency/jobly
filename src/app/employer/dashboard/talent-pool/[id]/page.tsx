'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

interface JobSeekerProfile {
  id: string;
  name: string;
  avatar: string | null;
  title: string;
  bio: string | null;
  location: string | null;
  skills: string[];
  primarySkills: string[];
  yearsOfExp: number | null;
  experienceLevel: string;
  workSetup: string | null;
  jobType: string | null;
  expectedSalary: string | null;
  availability: string;
  availableFrom: string | null;
  willingToRelocate: boolean | null;
  preferredLocations: string[];
  profileCompleteness: number;
  lastActive: string;
  hasResume: boolean;
  links: {
    linkedin: string | null;
    portfolio: string | null;
    github: string | null;
    website: string | null;
  };
  experience: {
    id: string;
    title: string;
    company: string;
    companyLogo: string | null;
    location: string | null;
    locationType: string | null;
    employmentType: string | null;
    startDate: string;
    endDate: string | null;
    isCurrent: boolean;
    description: string | null;
    achievements: string[];
    skills: string[];
  }[];
  education: {
    id: string;
    school: string;
    schoolLogo: string | null;
    degree: string | null;
    fieldOfStudy: string | null;
    startDate: string | null;
    endDate: string | null;
    isCurrent: boolean;
    achievements: string[];
  }[];
  certifications: {
    id: string;
    name: string;
    issuingOrg: string;
    issuingOrgLogo: string | null;
    issueDate: string | null;
    expiryDate: string | null;
    hasNoExpiry: boolean;
    credentialUrl: string | null;
  }[];
  languages: {
    id: string;
    language: string;
    proficiency: string;
  }[];
  activity: {
    applications: {
      id: string;
      jobId: string;
      jobTitle: string;
      status: string;
      appliedAt: string;
    }[];
    invitesSent: {
      id: string;
      type: string;
      status: string;
      jobTitle: string | null;
      sentAt: string;
    }[];
    messageCount: number;
  };
  shortlists: {
    id: string;
    name: string;
    notes: string | null;
    rating: number | null;
  }[];
}

interface Shortlist {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  candidateCount: number;
}

interface Job {
  id: string;
  title: string;
  status: string;
}

export default function JobSeekerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const candidateId = params.id as string;
  const tenantId = user?.id || '';

  const [profile, setProfile] = useState<JobSeekerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'experience' | 'education' | 'activity'>('overview');

  // Modal states
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showShortlistModal, setShowShortlistModal] = useState(false);
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);

  // Action data
  const [shortlists, setShortlists] = useState<Shortlist[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [messageText, setMessageText] = useState('');
  const [inviteData, setInviteData] = useState({ jobId: '', type: 'interview', message: '' });
  const [selectedShortlistId, setSelectedShortlistId] = useState('');
  const [shortlistNotes, setShortlistNotes] = useState('');
  const [shortlistRating, setShortlistRating] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch profile
  const fetchProfile = useCallback(async () => {
    if (!tenantId) return;
    try {
      setLoading(true);
      const response = await fetch(`/api/employer/talent-pool/${candidateId}`, {
        headers: { 'x-tenant-id': tenantId },
      });

      if (!response.ok) {
        if (response.status === 404) {
          setError('Candidate not found or not available');
        } else {
          throw new Error('Failed to fetch profile');
        }
        return;
      }

      const data = await response.json();
      setProfile(data.profile);
    } catch (err) {
      setError('Failed to load profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [candidateId, tenantId]);

  // Fetch shortlists
  const fetchShortlists = useCallback(async () => {
    if (!tenantId) return;
    try {
      const response = await fetch('/api/employer/shortlists', {
        headers: { 'x-tenant-id': tenantId },
      });
      if (response.ok) {
        const data = await response.json();
        setShortlists(data.shortlists || []);
      }
    } catch (err) {
      console.error('Failed to fetch shortlists:', err);
    }
  }, [tenantId]);

  // Fetch jobs for invite
  const fetchJobs = useCallback(async () => {
    if (!tenantId) return;
    try {
      const response = await fetch('/api/employer/jobs?status=active', {
        headers: { 'x-tenant-id': tenantId },
      });
      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs || []);
      }
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchProfile();
    fetchShortlists();
    fetchJobs();
  }, [fetchProfile, fetchShortlists, fetchJobs]);

  // Send message
  const handleSendMessage = async () => {
    if (!messageText.trim() || !tenantId) return;
    setActionLoading(true);
    try {
      const response = await fetch('/api/employer/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': tenantId,
        },
        body: JSON.stringify({
          recipientId: candidateId,
          content: messageText,
        }),
      });

      if (response.ok) {
        setShowMessageModal(false);
        setMessageText('');
        fetchProfile();
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Send invite
  const handleSendInvite = async () => {
    if (!inviteData.type || !tenantId) return;
    setActionLoading(true);
    try {
      const response = await fetch('/api/employer/interview-invites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': tenantId,
        },
        body: JSON.stringify({
          candidateId,
          jobId: inviteData.jobId || undefined,
          type: inviteData.type,
          message: inviteData.message,
        }),
      });

      if (response.ok) {
        setShowInviteModal(false);
        setInviteData({ jobId: '', type: 'interview', message: '' });
        fetchProfile();
      }
    } catch (err) {
      console.error('Failed to send invite:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Add to shortlist
  const handleAddToShortlist = async () => {
    if (!selectedShortlistId || !tenantId) return;
    setActionLoading(true);
    try {
      const response = await fetch('/api/employer/shortlists', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': tenantId,
        },
        body: JSON.stringify({
          shortlistId: selectedShortlistId,
          action: 'add_candidate',
          candidateId,
          notes: shortlistNotes,
          rating: shortlistRating || undefined,
        }),
      });

      if (response.ok) {
        setShowShortlistModal(false);
        setSelectedShortlistId('');
        setShortlistNotes('');
        setShortlistRating(0);
        fetchProfile();
      }
    } catch (err) {
      console.error('Failed to add to shortlist:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Block candidate
  const handleBlockCandidate = async () => {
    if (!tenantId) return;
    setActionLoading(true);
    try {
      const response = await fetch('/api/employer/candidate-blocks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': tenantId,
        },
        body: JSON.stringify({ candidateId }),
      });

      if (response.ok) {
        router.push('/employer/dashboard/talent-pool');
      }
    } catch (err) {
      console.error('Failed to block candidate:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Remove from shortlist
  const handleRemoveFromShortlist = async (shortlistId: string) => {
    if (!tenantId) return;
    try {
      await fetch('/api/employer/shortlists', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': tenantId,
        },
        body: JSON.stringify({
          shortlistId,
          action: 'remove_candidate',
          candidateId,
        }),
      });
      fetchProfile();
    } catch (err) {
      console.error('Failed to remove from shortlist:', err);
    }
  };

  // Format date
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Present';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
  };

  // Format relative time
  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return formatDate(dateStr);
  };

  // Get availability badge
  const getAvailabilityBadge = (availability: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      immediate: { bg: 'bg-green-100', text: 'text-green-700', label: 'Available Now' },
      open: { bg: 'bg-green-100', text: 'text-green-700', label: 'Open to Offers' },
      two_weeks: { bg: 'bg-blue-100', text: 'text-blue-700', label: '2 Weeks Notice' },
      one_month: { bg: 'bg-amber-100', text: 'text-amber-700', label: '1 Month Notice' },
      not_looking: { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Not Looking' },
    };
    return badges[availability] || badges.open;
  };

  // Get experience level label
  const getExperienceLevelLabel = (level: string) => {
    const labels: Record<string, string> = {
      entry: 'Entry Level',
      junior: 'Junior',
      mid: 'Mid-Level',
      senior: 'Senior',
      lead: 'Lead/Principal',
      executive: 'Executive',
    };
    return labels[level] || level;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-slate-200 rounded mb-6" />
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex gap-6">
              <div className="w-24 h-24 bg-slate-200 rounded-full" />
              <div className="flex-1 space-y-3">
                <div className="h-6 w-48 bg-slate-200 rounded" />
                <div className="h-4 w-32 bg-slate-200 rounded" />
                <div className="h-4 w-64 bg-slate-200 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">{error || 'Profile not found'}</h3>
          <p className="text-slate-500 mb-6">This candidate may not be available or has been removed.</p>
          <Link
            href="/employer/dashboard/talent-pool"
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Talent Pool
          </Link>
        </div>
      </div>
    );
  }

  const availabilityBadge = getAvailabilityBadge(profile.availability);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/employer/dashboard/talent-pool"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Talent Pool
        </Link>
      </div>

      {/* Profile Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {profile.avatar ? (
              <Image
                src={profile.avatar}
                alt={profile.name}
                width={96}
                height={96}
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-cyan-500 flex items-center justify-center text-white text-2xl font-bold">
                {profile.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{profile.name}</h1>
                <p className="text-lg text-slate-600">{profile.title}</p>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-slate-500">
                  {profile.location && (
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {profile.location}
                    </span>
                  )}
                  {profile.yearsOfExp && (
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {profile.yearsOfExp} years experience
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Active {formatRelativeTime(profile.lastActive)}
                  </span>
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${availabilityBadge.bg} ${availabilityBadge.text}`}>
                  {availabilityBadge.label}
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-700">
                  {getExperienceLevelLabel(profile.experienceLevel)}
                </span>
                {profile.workSetup && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-700">
                    {profile.workSetup === 'remote' ? 'Remote' : profile.workSetup === 'hybrid' ? 'Hybrid' : 'On-site'}
                  </span>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex flex-wrap gap-6 mt-4 pt-4 border-t border-slate-100">
              <div>
                <p className="text-sm text-slate-500">Profile Strength</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${profile.profileCompleteness >= 80 ? 'bg-green-500' : profile.profileCompleteness >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                      style={{ width: `${profile.profileCompleteness}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-slate-700">{profile.profileCompleteness}%</span>
                </div>
              </div>
              {profile.expectedSalary && (
                <div>
                  <p className="text-sm text-slate-500">Expected Salary</p>
                  <p className="text-sm font-medium text-slate-900 mt-1">{profile.expectedSalary}</p>
                </div>
              )}
              {profile.availableFrom && (
                <div>
                  <p className="text-sm text-slate-500">Available From</p>
                  <p className="text-sm font-medium text-slate-900 mt-1">{formatDate(profile.availableFrom)}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-slate-200">
          <button
            onClick={() => setShowMessageModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Message
          </button>
          <button
            onClick={() => setShowInviteModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Invite to Interview
          </button>
          <button
            onClick={() => setShowShortlistModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            Save to Shortlist
          </button>
          <button
            onClick={() => setShowBlockConfirm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-auto"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
            Block
          </button>
        </div>

        {/* Shortlists */}
        {profile.shortlists.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-sm text-slate-500 mb-2">Saved in shortlists:</p>
            <div className="flex flex-wrap gap-2">
              {profile.shortlists.map((sl) => (
                <span key={sl.id} className="inline-flex items-center gap-1 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm">
                  {sl.name}
                  <button
                    onClick={() => handleRemoveFromShortlist(sl.id)}
                    className="ml-1 hover:text-red-600"
                    title="Remove from shortlist"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="border-b border-slate-200">
          <nav className="flex -mb-px">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'experience', label: 'Experience' },
              { id: 'education', label: 'Education' },
              { id: 'activity', label: 'Activity' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Bio */}
              {profile.bio && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">About</h3>
                  <p className="text-slate-600 whitespace-pre-line">{profile.bio}</p>
                </div>
              )}

              {/* Skills */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.primarySkills.map((skill, idx) => (
                    <span key={idx} className="px-3 py-1.5 bg-primary-50 text-primary-700 rounded-full text-sm font-medium">
                      {skill}
                    </span>
                  ))}
                  {profile.skills.filter(s => !profile.primarySkills.includes(s)).map((skill, idx) => (
                    <span key={idx} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Languages */}
              {profile.languages.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Languages</h3>
                  <div className="flex flex-wrap gap-4">
                    {profile.languages.map((lang) => (
                      <div key={lang.id} className="flex items-center gap-2">
                        <span className="text-slate-900 font-medium">{lang.language}</span>
                        <span className="text-sm text-slate-500">({lang.proficiency})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Links */}
              {(profile.links.linkedin || profile.links.portfolio || profile.links.github || profile.links.website) && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Portfolio & Links</h3>
                  <div className="flex flex-wrap gap-3">
                    {profile.links.linkedin && (
                      <a
                        href={profile.links.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#0077B5] text-white rounded-lg hover:bg-[#006699] transition-colors"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                        LinkedIn
                      </a>
                    )}
                    {profile.links.github && (
                      <a
                        href={profile.links.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                        GitHub
                      </a>
                    )}
                    {profile.links.portfolio && (
                      <a
                        href={profile.links.portfolio}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Portfolio
                      </a>
                    )}
                    {profile.links.website && (
                      <a
                        href={profile.links.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                        Website
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Certifications */}
              {profile.certifications.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Certifications</h3>
                  <div className="space-y-3">
                    {profile.certifications.map((cert) => (
                      <div key={cert.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                        {cert.issuingOrgLogo ? (
                          <Image src={cert.issuingOrgLogo} alt="" width={40} height={40} className="w-10 h-10 rounded object-contain" />
                        ) : (
                          <div className="w-10 h-10 bg-amber-100 rounded flex items-center justify-center">
                            <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                            </svg>
                          </div>
                        )}
                        <div className="flex-1">
                          <h4 className="font-medium text-slate-900">{cert.name}</h4>
                          <p className="text-sm text-slate-500">{cert.issuingOrg}</p>
                          <p className="text-xs text-slate-400 mt-1">
                            Issued {formatDate(cert.issueDate)}
                            {!cert.hasNoExpiry && cert.expiryDate && ` · Expires ${formatDate(cert.expiryDate)}`}
                          </p>
                        </div>
                        {cert.credentialUrl && (
                          <a
                            href={cert.credentialUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-600 hover:text-primary-700 text-sm"
                          >
                            View
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Resume indicator */}
              {profile.hasResume && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div>
                      <p className="font-medium text-green-800">Resume Available</p>
                      <p className="text-sm text-green-600">This candidate has uploaded a resume. Request access via message.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Experience Tab */}
          {activeTab === 'experience' && (
            <div className="space-y-6">
              {profile.experience.length === 0 ? (
                <p className="text-slate-500 text-center py-8">No work experience listed</p>
              ) : (
                profile.experience.map((exp, idx) => (
                  <div key={exp.id} className="relative pl-8 pb-6 last:pb-0">
                    {idx < profile.experience.length - 1 && (
                      <div className="absolute left-3 top-10 bottom-0 w-0.5 bg-slate-200" />
                    )}
                    <div className="absolute left-0 top-1 w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-primary-600 rounded-full" />
                    </div>
                    <div className="flex items-start gap-4">
                      {exp.companyLogo ? (
                        <Image src={exp.companyLogo} alt="" width={48} height={48} className="w-12 h-12 rounded object-contain" />
                      ) : (
                        <div className="w-12 h-12 bg-slate-100 rounded flex items-center justify-center text-slate-400">
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                      )}
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900">{exp.title}</h4>
                        <p className="text-slate-600">{exp.company}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-slate-500">
                          <span>{formatDate(exp.startDate)} - {exp.isCurrent ? 'Present' : formatDate(exp.endDate)}</span>
                          {exp.location && (
                            <>
                              <span>·</span>
                              <span>{exp.location}</span>
                            </>
                          )}
                          {exp.employmentType && (
                            <>
                              <span>·</span>
                              <span className="capitalize">{exp.employmentType.replace('_', ' ')}</span>
                            </>
                          )}
                        </div>
                        {exp.description && (
                          <p className="mt-3 text-slate-600 whitespace-pre-line">{exp.description}</p>
                        )}
                        {exp.achievements && exp.achievements.length > 0 && (
                          <ul className="mt-3 space-y-1">
                            {exp.achievements.map((achievement, i) => (
                              <li key={i} className="flex items-start gap-2 text-slate-600">
                                <span className="text-primary-500 mt-1">•</span>
                                {achievement}
                              </li>
                            ))}
                          </ul>
                        )}
                        {exp.skills && exp.skills.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {exp.skills.map((skill, i) => (
                              <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Education Tab */}
          {activeTab === 'education' && (
            <div className="space-y-6">
              {profile.education.length === 0 ? (
                <p className="text-slate-500 text-center py-8">No education listed</p>
              ) : (
                profile.education.map((edu) => (
                  <div key={edu.id} className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg">
                    {edu.schoolLogo ? (
                      <Image src={edu.schoolLogo} alt="" width={48} height={48} className="w-12 h-12 rounded object-contain" />
                    ) : (
                      <div className="w-12 h-12 bg-blue-100 rounded flex items-center justify-center text-blue-500">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path d="M12 14l9-5-9-5-9 5 9 5z" />
                          <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                        </svg>
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900">{edu.school}</h4>
                      {(edu.degree || edu.fieldOfStudy) && (
                        <p className="text-slate-600">
                          {edu.degree}{edu.degree && edu.fieldOfStudy && ' in '}{edu.fieldOfStudy}
                        </p>
                      )}
                      <p className="text-sm text-slate-500 mt-1">
                        {formatDate(edu.startDate)} - {edu.isCurrent ? 'Present' : formatDate(edu.endDate)}
                      </p>
                      {edu.achievements && edu.achievements.length > 0 && (
                        <ul className="mt-2 space-y-1">
                          {edu.achievements.map((achievement, i) => (
                            <li key={i} className="text-sm text-slate-600">• {achievement}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div className="space-y-8">
              {/* Applications */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Applications to Your Jobs</h3>
                {profile.activity.applications.length === 0 ? (
                  <p className="text-slate-500 py-4 text-center bg-slate-50 rounded-lg">No applications yet</p>
                ) : (
                  <div className="space-y-2">
                    {profile.activity.applications.map((app) => (
                      <div key={app.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div>
                          <Link href={`/employer/dashboard/jobs/${app.jobId}`} className="font-medium text-slate-900 hover:text-primary-600">
                            {app.jobTitle}
                          </Link>
                          <p className="text-sm text-slate-500">Applied {formatRelativeTime(app.appliedAt)}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          app.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                          app.status === 'reviewing' ? 'bg-blue-100 text-blue-700' :
                          app.status === 'interview' ? 'bg-purple-100 text-purple-700' :
                          app.status === 'offered' ? 'bg-green-100 text-green-700' :
                          app.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Invites Sent */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Interview Invites Sent</h3>
                {profile.activity.invitesSent.length === 0 ? (
                  <p className="text-slate-500 py-4 text-center bg-slate-50 rounded-lg">No invites sent yet</p>
                ) : (
                  <div className="space-y-2">
                    {profile.activity.invitesSent.map((invite) => (
                      <div key={invite.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div>
                          <p className="font-medium text-slate-900 capitalize">{invite.type.replace('_', ' ')} Invite</p>
                          {invite.jobTitle && <p className="text-sm text-slate-600">For: {invite.jobTitle}</p>}
                          <p className="text-sm text-slate-500">Sent {formatRelativeTime(invite.sentAt)}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          invite.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                          invite.status === 'accepted' ? 'bg-green-100 text-green-700' :
                          invite.status === 'declined' ? 'bg-red-100 text-red-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {invite.status.charAt(0).toUpperCase() + invite.status.slice(1)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Messages */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Messages</h3>
                <div className="p-4 bg-slate-50 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900">{profile.activity.messageCount} messages exchanged</p>
                    <p className="text-sm text-slate-500">View conversation history</p>
                  </div>
                  <Link
                    href={`/employer/dashboard/messages?candidate=${candidateId}`}
                    className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                  >
                    View Messages
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Message Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowMessageModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Send Message to {profile.name}</h3>
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Write your message..."
              rows={5}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowMessageModal(false)}
                className="px-4 py-2 text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSendMessage}
                disabled={actionLoading || !messageText.trim()}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowInviteModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Invite to Interview</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Invite Type</label>
                <select
                  value={inviteData.type}
                  onChange={(e) => setInviteData({ ...inviteData, type: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="interview">Interview</option>
                  <option value="phone_screen">Phone Screen</option>
                  <option value="technical">Technical Interview</option>
                  <option value="onsite">On-site Interview</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">For Job (Optional)</label>
                <select
                  value={inviteData.jobId}
                  onChange={(e) => setInviteData({ ...inviteData, jobId: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">General Invite</option>
                  {jobs.map((job) => (
                    <option key={job.id} value={job.id}>{job.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                <textarea
                  value={inviteData.message}
                  onChange={(e) => setInviteData({ ...inviteData, message: e.target.value })}
                  placeholder="Add a personal message (optional)"
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowInviteModal(false)}
                className="px-4 py-2 text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSendInvite}
                disabled={actionLoading}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading ? 'Sending...' : 'Send Invite'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shortlist Modal */}
      {showShortlistModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowShortlistModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Save to Shortlist</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Select Shortlist</label>
                {shortlists.length === 0 ? (
                  <p className="text-sm text-slate-500 py-2">No shortlists created yet. Create one in the Talent Pool page.</p>
                ) : (
                  <select
                    value={selectedShortlistId}
                    onChange={(e) => setSelectedShortlistId(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select a shortlist</option>
                    {shortlists.map((sl) => (
                      <option key={sl.id} value={sl.id}>{sl.name} ({sl.candidateCount} candidates)</option>
                    ))}
                  </select>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes (Optional)</label>
                <textarea
                  value={shortlistNotes}
                  onChange={(e) => setShortlistNotes(e.target.value)}
                  placeholder="Add notes about this candidate"
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setShortlistRating(star)}
                      className={`w-8 h-8 rounded ${shortlistRating >= star ? 'text-amber-400' : 'text-slate-300'}`}
                    >
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowShortlistModal(false)}
                className="px-4 py-2 text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleAddToShortlist}
                disabled={actionLoading || !selectedShortlistId}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading ? 'Saving...' : 'Save to Shortlist'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Block Confirmation Modal */}
      {showBlockConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowBlockConfirm(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Block Candidate?</h3>
            <p className="text-slate-600 mb-6">
              This will hide {profile.name} from your talent pool searches. They won&apos;t be notified. You can unblock them later.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowBlockConfirm(false)}
                className="px-4 py-2 text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleBlockCandidate}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading ? 'Blocking...' : 'Block Candidate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
