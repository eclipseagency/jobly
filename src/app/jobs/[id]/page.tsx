'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import ApplicantScreeningForm from '@/components/screening/ApplicantScreeningForm';
import { ApplicationWizard } from '@/components/application';

interface JobDetail {
  id: string;
  title: string;
  description: string;
  requirements: string | null;
  location: string | null;
  locationType: string | null;
  salary: string | null;
  jobType: string | null;
  department: string | null;
  experienceLevel?: string | null;
  createdAt: string;
  expiresAt: string | null;
  company: {
    id: string;
    name: string;
    logo: string | null;
    location: string | null;
    isVerified: boolean;
    industry?: string;
    size?: string;
    website?: string;
    description?: string;
  };
  applicationsCount: number;
}

// Experience level styling
function getExperienceLevelStyle(level: string): { bg: string; text: string; label: string } {
  const styles: Record<string, { bg: string; text: string; label: string }> = {
    entry: { bg: 'bg-green-50', text: 'text-green-700', label: 'Entry Level' },
    junior: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Junior' },
    mid: { bg: 'bg-purple-50', text: 'text-purple-700', label: 'Mid Level' },
    senior: { bg: 'bg-orange-50', text: 'text-orange-700', label: 'Senior' },
    lead: { bg: 'bg-red-50', text: 'text-red-700', label: 'Lead' },
    manager: { bg: 'bg-slate-100', text: 'text-slate-700', label: 'Manager' },
  };
  return styles[level.toLowerCase()] || { bg: 'bg-slate-100', text: 'text-slate-700', label: level };
}

// Work setup icons
function getWorkSetupIcon(setup: string): string {
  const icons: Record<string, string> = {
    remote: '🌐',
    hybrid: '🏢',
    onsite: '📍',
    'on-site': '📍',
  };
  return icons[setup.toLowerCase()] || '📍';
}

// Company size label
function formatCompanySize(size: string): string {
  const sizes: Record<string, string> = {
    '1-10': '1-10 employees',
    '11-50': '11-50 employees',
    '51-200': '51-200 employees',
    '201-500': '201-500 employees',
    '501-1000': '501-1000 employees',
    '1001-5000': '1,001-5,000 employees',
    '5001+': '5,001+ employees',
  };
  return sizes[size] || size;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
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

// Parse job requirements into structured sections
interface ParsedJobContent {
  responsibilities: string[];
  requirements: string[];
  niceToHave: string[];
  skills: string[];
  benefits: string[];
}

function parseJobContent(requirements: string | null): ParsedJobContent {
  const result: ParsedJobContent = {
    responsibilities: [],
    requirements: [],
    niceToHave: [],
    skills: [],
    benefits: [],
  };

  if (!requirements) return result;

  const lines = requirements.split('\n');
  let currentSection: keyof ParsedJobContent = 'responsibilities';

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Check for section headers
    const lowerLine = trimmed.toLowerCase();
    if (lowerLine.includes('requirement')) {
      currentSection = 'requirements';
      continue;
    } else if (lowerLine.includes('nice to have') || lowerLine.includes('preferred')) {
      currentSection = 'niceToHave';
      continue;
    } else if (lowerLine.startsWith('skills:')) {
      const skillsStr = trimmed.substring(7).trim();
      result.skills = skillsStr.split(',').map(s => s.trim()).filter(Boolean);
      continue;
    } else if (lowerLine.startsWith('benefits:')) {
      const benefitsStr = trimmed.substring(9).trim();
      result.benefits = benefitsStr.split(',').map(s => s.trim()).filter(Boolean);
      continue;
    }

    // Add to current section (remove bullet if present)
    const cleanLine = trimmed.replace(/^[•\-\*]\s*/, '');
    if (cleanLine) {
      result[currentSection].push(cleanLine);
    }
  }

  return result;
}

function getApplicantInterest(count: number): { label: string; color: string; urgency?: string } {
  if (count === 0) return { label: 'Be the first to apply!', color: 'text-green-600' };
  if (count < 10) return { label: `${count} applicant${count > 1 ? 's' : ''}`, color: 'text-green-600' };
  if (count < 50) return { label: `${count} applicants`, color: 'text-yellow-600', urgency: 'Growing interest' };
  if (count < 100) return { label: `${count} applicants`, color: 'text-orange-600', urgency: 'High interest' };
  return { label: `${count}+ applicants`, color: 'text-red-600', urgency: 'Very competitive' };
}

// Format salary with monthly breakdown
function formatSalaryWithContext(salaryStr: string | null): { display: string; monthly?: string; disclosed: boolean } {
  if (!salaryStr) return { display: 'Salary not disclosed', disclosed: false };

  // Check for zero salary
  if (salaryStr.includes('₱0') && salaryStr.includes('-') && salaryStr.split('-').every(p => p.trim().replace(/[₱,]/g, '') === '0')) {
    return { display: 'Salary not disclosed', disclosed: false };
  }

  // Try to extract numeric values for monthly calculation
  const numbers = salaryStr.match(/[\d,]+/g);
  if (numbers && numbers.length >= 1) {
    const min = parseInt(numbers[0].replace(/,/g, ''));
    const max = numbers[1] ? parseInt(numbers[1].replace(/,/g, '')) : min;

    // Assume annual if > 100k, otherwise monthly
    if (min > 100000) {
      const monthlyMin = Math.round(min / 12).toLocaleString();
      const monthlyMax = Math.round(max / 12).toLocaleString();
      return {
        display: salaryStr,
        monthly: `₱${monthlyMin} - ₱${monthlyMax}/mo`,
        disclosed: true
      };
    }
  }

  return { display: salaryStr, disclosed: true };
}

// Get days until expiration
function getDaysUntilExpiry(expiresAt: string | null): { days: number; label: string; urgent: boolean } | null {
  if (!expiresAt) return null;

  const expiry = new Date(expiresAt);
  const now = new Date();
  const diff = expiry.getTime() - now.getTime();
  const days = Math.ceil(diff / 86400000);

  if (days < 0) return null;
  if (days === 0) return { days: 0, label: 'Closes today!', urgent: true };
  if (days === 1) return { days: 1, label: 'Closes tomorrow', urgent: true };
  if (days <= 3) return { days, label: `Closes in ${days} days`, urgent: true };
  if (days <= 7) return { days, label: `Closes in ${days} days`, urgent: false };
  return null;
}

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoggedIn, isLoading: authLoading } = useAuth();
  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [applied, setApplied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [hasScreeningForm, setHasScreeningForm] = useState(false);
  const [screeningAnswers, setScreeningAnswers] = useState<{ questionId: string; answer: unknown }[]>([]);
  const [showScreeningForm, setShowScreeningForm] = useState(false);
  const [showApplicationWizard, setShowApplicationWizard] = useState(false);

  useEffect(() => {
    async function fetchJob() {
      try {
        const response = await fetch(`/api/jobs/${params.id}`);
        if (!response.ok) {
          throw new Error('Job not found');
        }
        const data = await response.json();
        setJob(data.job);
      } catch (error) {
        console.error('Error fetching job:', error);
        setJob(null);
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchJob();
    }
  }, [params.id]);

  // Check if job has screening form
  useEffect(() => {
    async function checkScreeningForm() {
      if (!params.id) return;
      try {
        const response = await fetch(`/api/jobs/${params.id}/screening-form`);
        if (response.ok) {
          const data = await response.json();
          setHasScreeningForm(data.form && data.form.questions?.length > 0);
        }
      } catch (error) {
        console.error('Error checking screening form:', error);
      }
    }
    checkScreeningForm();
  }, [params.id]);

  // Check if user has already applied or saved
  useEffect(() => {
    async function checkUserStatus() {
      if (!user?.id || !params.id) return;

      try {
        // Check application status
        const appResponse = await fetch('/api/applications', {
          headers: { 'x-user-id': user.id },
        });

        if (appResponse.ok) {
          const appData = await appResponse.json();
          const hasApplied = appData.applications?.some(
            (app: { job: { id: string } }) => app.job.id === params.id
          );
          if (hasApplied) {
            setApplied(true);
          }
        }

        // Check saved status
        const savedResponse = await fetch('/api/saved-jobs', {
          headers: { 'x-user-id': user.id },
        });

        if (savedResponse.ok) {
          const savedData = await savedResponse.json();
          const isSaved = savedData.savedJobs?.some(
            (saved: { job: { id: string } }) => saved.job.id === params.id
          );
          if (isSaved) {
            setSaved(true);
          }
        }
      } catch (error) {
        console.error('Error checking user status:', error);
      }
    }

    if (isLoggedIn && user) {
      checkUserStatus();
    }
  }, [isLoggedIn, user, params.id]);

  const handleApplyClick = () => {
    if (!isLoggedIn) {
      // Redirect to login with return URL
      router.push(`/auth/employee/login?redirect=/jobs/${params.id}`);
      return;
    }
    // Show the application wizard
    setShowApplicationWizard(true);
  };

  // Handler for the Application Wizard
  const handleWizardSubmit = async (data: { coverLetter: string; screeningAnswers: { questionId: string; answer: unknown }[] }) => {
    if (!isLoggedIn || !user) {
      router.push(`/auth/employee/login?redirect=/jobs/${params.id}`);
      return;
    }

    setApplying(true);
    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
          'x-user-name': user.name || '',
          'x-user-email': user.email || '',
        },
        body: JSON.stringify({
          jobId: params.id,
          coverLetter: data.coverLetter,
          screeningAnswers: data.screeningAnswers,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setApplied(true);
        setShowApplicationWizard(false);
      } else {
        alert(result.error || 'Failed to apply. Please try again.');
      }
    } catch (error) {
      console.error('Error applying:', error);
      alert('Failed to apply. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  const handleApply = async (answers?: { questionId: string; answer: unknown }[]) => {
    if (!isLoggedIn || !user) {
      router.push(`/auth/employee/login?redirect=/jobs/${params.id}`);
      return;
    }

    setApplying(true);
    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
          'x-user-name': user.name || '',
          'x-user-email': user.email || '',
        },
        body: JSON.stringify({
          jobId: params.id,
          coverLetter,
          screeningAnswers: answers || screeningAnswers,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setApplied(true);
        setShowApplyModal(false);
        setShowScreeningForm(false);
        setCoverLetter('');
        setScreeningAnswers([]);
      } else {
        alert(data.error || 'Failed to apply. Please try again.');
      }
    } catch (error) {
      console.error('Error applying:', error);
      alert('Failed to apply. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  const handleSaveJob = async () => {
    if (!isLoggedIn || !user) {
      router.push(`/auth/employee/login?redirect=/jobs/${params.id}`);
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/saved-jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
          'x-user-name': user.name || '',
          'x-user-email': user.email || '',
        },
        body: JSON.stringify({ jobId: params.id }),
      });

      const data = await response.json();

      if (response.ok) {
        setSaved(true);
      } else {
        if (data.message?.includes('already saved') || data.error?.includes('already saved')) {
          setSaved(true);
        } else {
          alert(data.error || 'Failed to save job');
        }
      }
    } catch (error) {
      console.error('Error saving job:', error);
      alert('Failed to save job. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <header className="bg-white border-b border-slate-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link href="/jobs" className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Jobs
              </Link>
              <Link href="/">
                <Image src="/logo.svg" alt="Jobly" width={90} height={25} />
              </Link>
            </div>
          </div>
        </header>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="bg-white rounded-xl border border-slate-200 p-8">
              <div className="flex gap-6">
                <div className="w-20 h-20 bg-slate-200 rounded-xl" />
                <div className="flex-1">
                  <div className="h-8 bg-slate-200 rounded w-1/2 mb-3" />
                  <div className="h-5 bg-slate-200 rounded w-1/3 mb-4" />
                  <div className="flex gap-2">
                    <div className="h-6 bg-slate-200 rounded w-24" />
                    <div className="h-6 bg-slate-200 rounded w-24" />
                    <div className="h-6 bg-slate-200 rounded w-24" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="bg-white border-b border-slate-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link href="/jobs" className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Jobs
              </Link>
              <Link href="/">
                <Image src="/logo.svg" alt="Jobly" width={90} height={25} />
              </Link>
            </div>
          </div>
        </header>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <svg className="w-20 h-20 text-slate-300 mx-auto mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h1 className="text-2xl font-bold text-slate-900 mb-3">Job Not Found</h1>
            <p className="text-slate-600 mb-8">
              This job posting may have been removed or is no longer available.
            </p>
            <Link
              href="/jobs"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
            >
              Browse All Jobs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/jobs" className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Jobs
            </Link>
            <Link href="/">
              <Image src="/logo.svg" alt="Jobly" width={90} height={25} />
            </Link>
            <div className="flex items-center gap-3">
              {isLoggedIn ? (
                <Link
                  href="/dashboard"
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  My Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/auth/employee/login"
                    className="text-sm font-medium text-slate-600 hover:text-slate-900"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/employee/register"
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Header */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-slate-100 rounded-xl flex items-center justify-center text-primary-600 font-bold text-2xl flex-shrink-0">
                  {job.company.logo ? (
                    <Image
                      src={job.company.logo}
                      alt={job.company.name}
                      width={80}
                      height={80}
                      className="rounded-xl object-cover"
                    />
                  ) : (
                    job.company.name.substring(0, 2).toUpperCase()
                  )}
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                    {job.title}
                  </h1>
                  <div className="flex items-center gap-2 text-lg text-slate-600 mb-3">
                    <span className="font-medium">{job.company.name}</span>
                    {job.company.isVerified && (
                      <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>

                  {/* Company Context Row */}
                  {(job.company.industry || job.company.size || job.company.location) && (
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500 mb-4">
                      {job.company.industry && (
                        <span className="flex items-center gap-1.5">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          {job.company.industry}
                        </span>
                      )}
                      {job.company.size && (
                        <span className="flex items-center gap-1.5">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          {formatCompanySize(job.company.size)}
                        </span>
                      )}
                      {job.company.location && (
                        <span className="flex items-center gap-1.5">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                          {job.company.location}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Tags grouped by meaning */}
                  <div className="flex flex-wrap gap-2">
                    {/* Location & Work Setup */}
                    {job.location && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 text-sm font-medium rounded-full">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        {job.location}
                      </span>
                    )}
                    {job.locationType && (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 text-sm font-medium rounded-full capitalize">
                        <span>{getWorkSetupIcon(job.locationType)}</span>
                        {job.locationType}
                      </span>
                    )}

                    {/* Employment Type & Experience */}
                    {job.jobType && (
                      <span className="px-3 py-1.5 bg-primary-50 text-primary-700 text-sm font-medium rounded-full capitalize">
                        {job.jobType}
                      </span>
                    )}
                    {job.experienceLevel && (() => {
                      const style = getExperienceLevelStyle(job.experienceLevel);
                      return (
                        <span className={`px-3 py-1.5 ${style.bg} ${style.text} text-sm font-medium rounded-full`}>
                          {style.label}
                        </span>
                      );
                    })()}

                    {/* Department */}
                    {job.department && (
                      <span className="px-3 py-1.5 bg-purple-50 text-purple-700 text-sm font-medium rounded-full">
                        {job.department}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Job Description */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-1">About the Role</h2>
              <p className="text-sm text-slate-500 mb-4">What you&apos;ll be doing at {job.company.name}</p>
              <div className="prose prose-slate max-w-none">
                <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">{job.description}</p>
              </div>
            </div>

            {/* Structured Job Content */}
            {job.requirements && (() => {
              const parsed = parseJobContent(job.requirements);
              const hasStructuredContent = parsed.responsibilities.length > 0 ||
                parsed.requirements.length > 0 ||
                parsed.niceToHave.length > 0;

              return (
                <>
                  {/* Responsibilities Section */}
                  {parsed.responsibilities.length > 0 && (
                    <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
                            <svg className="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                            </svg>
                          </div>
                          <h2 className="text-xl font-semibold text-slate-900">Responsibilities</h2>
                        </div>
                        <span className="text-sm text-slate-500">{parsed.responsibilities.length} items</span>
                      </div>
                      <ul className="space-y-3">
                        {parsed.responsibilities.map((item, idx) => (
                          <li key={idx} className="flex gap-3 text-slate-600">
                            <svg className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                            </svg>
                            <span className="leading-relaxed">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Requirements Section */}
                  {parsed.requirements.length > 0 && (
                    <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                            <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                          </div>
                          <h2 className="text-xl font-semibold text-slate-900">Requirements</h2>
                        </div>
                        <span className="text-sm text-slate-500">{parsed.requirements.length} must-have{parsed.requirements.length > 1 ? 's' : ''}</span>
                      </div>
                      <ul className="space-y-3">
                        {parsed.requirements.map((item, idx) => (
                          <li key={idx} className="flex gap-3 text-slate-600">
                            <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                            </svg>
                            <span className="leading-relaxed">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Nice to Have Section */}
                  {parsed.niceToHave.length > 0 && (
                    <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                            <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                          </div>
                          <h2 className="text-xl font-semibold text-slate-900">Nice to Have</h2>
                        </div>
                        <span className="text-sm text-slate-500">{parsed.niceToHave.length} bonus{parsed.niceToHave.length > 1 ? 'es' : ''}</span>
                      </div>
                      <ul className="space-y-3">
                        {parsed.niceToHave.map((item, idx) => (
                          <li key={idx} className="flex gap-3 text-slate-600">
                            <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="leading-relaxed">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Skills Tags */}
                  {parsed.skills.length > 0 && (
                    <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                            <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                          </div>
                          <h2 className="text-xl font-semibold text-slate-900">Required Skills</h2>
                        </div>
                        <span className="text-sm text-slate-500">{parsed.skills.length} skills</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {parsed.skills.map((skill, idx) => (
                          <Link
                            key={idx}
                            href={`/jobs?skill=${encodeURIComponent(skill)}`}
                            className="px-3 py-1.5 bg-primary-50 text-primary-700 text-sm font-medium rounded-full hover:bg-primary-100 transition-colors cursor-pointer"
                          >
                            {skill}
                          </Link>
                        ))}
                      </div>
                      <p className="text-xs text-slate-400 mt-3">Click a skill to find similar jobs</p>
                    </div>
                  )}

                  {/* Benefits Tags */}
                  {parsed.benefits.length > 0 && (
                    <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                            <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <h2 className="text-xl font-semibold text-slate-900">Benefits & Perks</h2>
                        </div>
                        <span className="text-sm text-slate-500">{parsed.benefits.length} benefits</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {parsed.benefits.map((benefit, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2.5 p-3 bg-emerald-50 rounded-lg"
                          >
                            <svg className="w-5 h-5 text-emerald-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-sm font-medium text-emerald-800">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Fallback: Show raw requirements if no structured content was parsed */}
                  {!hasStructuredContent && (
                    <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8">
                      <h2 className="text-xl font-semibold text-slate-900 mb-4">Requirements</h2>
                      <div className="prose prose-slate max-w-none">
                        <p className="text-slate-600 whitespace-pre-wrap">{job.requirements}</p>
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </div>

          {/* Sidebar */}
          <div className="space-y-6 lg:relative">
            {/* Apply Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 sticky top-24 z-30">
              {/* Urgency Banner */}
              {(() => {
                const expiry = getDaysUntilExpiry(job.expiresAt);
                const interest = getApplicantInterest(job.applicationsCount);
                if (expiry?.urgent) {
                  return (
                    <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm font-semibold text-red-700">{expiry.label}</span>
                      </div>
                    </div>
                  );
                } else if (interest.urgency) {
                  return (
                    <div className="mb-4 p-3 bg-amber-50 border border-amber-100 rounded-lg">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                        </svg>
                        <span className="text-sm font-semibold text-amber-700">{interest.urgency}</span>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Salary Section */}
              {(() => {
                const salary = formatSalaryWithContext(job.salary);
                return (
                  <div className="mb-4">
                    <p className="text-sm text-slate-500 mb-1">Compensation</p>
                    {salary.disclosed ? (
                      <>
                        <p className="text-xl font-semibold text-slate-900">{salary.display}</p>
                        {salary.monthly && (
                          <p className="text-sm text-slate-500 mt-0.5">{salary.monthly}</p>
                        )}
                      </>
                    ) : (
                      <p className="text-lg text-slate-400 italic">{salary.display}</p>
                    )}
                  </div>
                );
              })()}

              {/* Application Type Badge */}
              {hasScreeningForm && (
                <div className="mb-4 p-3 bg-purple-50 border border-purple-100 rounded-lg">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-sm font-medium text-purple-700">Screened Application</span>
                  </div>
                  <p className="text-xs text-purple-600 mt-1">Includes screening questions (2-3 min)</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Posted</p>
                  <p className="text-sm font-medium text-slate-900">{formatRelativeDate(job.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Applicants</p>
                  <p className={`text-sm font-medium ${getApplicantInterest(job.applicationsCount).color}`}>
                    {getApplicantInterest(job.applicationsCount).label}
                  </p>
                </div>
              </div>

              {/* What happens next */}
              <div className="mb-6 p-3 bg-slate-50 rounded-lg">
                <p className="text-xs font-medium text-slate-600 mb-2">What happens next</p>
                <div className="space-y-2">
                  <div className="flex items-start gap-2 text-xs text-slate-500">
                    <span className="w-4 h-4 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0 text-[10px] font-semibold mt-0.5">1</span>
                    <span>Your profile is sent to the employer</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-slate-500">
                    <span className="w-4 h-4 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0 text-[10px] font-semibold mt-0.5">2</span>
                    <span>They review and respond within 2-5 days</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-slate-500">
                    <span className="w-4 h-4 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0 text-[10px] font-semibold mt-0.5">3</span>
                    <span>Track status in your dashboard</span>
                  </div>
                </div>
              </div>

              {applied ? (
                <div className="text-center py-4">
                  <svg className="w-12 h-12 text-green-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm font-medium text-green-700">Application Submitted!</p>
                  <p className="text-xs text-slate-500 mt-1">We&apos;ll notify you when they respond</p>
                  <Link
                    href="/dashboard/applications"
                    className="inline-block mt-3 text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Track My Application
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={handleApplyClick}
                    className="w-full px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors cursor-pointer active:scale-[0.98]"
                  >
                    Apply Now
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveJob}
                    disabled={saving || saved}
                    className={`w-full px-6 py-3 border font-medium rounded-lg transition-colors cursor-pointer ${
                      saved
                        ? 'border-green-200 bg-green-50 text-green-700'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    } disabled:cursor-not-allowed`}
                  >
                    {saving ? 'Saving...' : saved ? 'Job Saved' : 'Save Job'}
                  </button>
                </div>
              )}
            </div>

            {/* Company Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-4">About {job.company.name}</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-primary-100 to-slate-100 rounded-lg flex items-center justify-center text-primary-600 font-bold text-lg">
                  {job.company.logo ? (
                    <Image
                      src={job.company.logo}
                      alt={job.company.name}
                      width={56}
                      height={56}
                      className="rounded-lg object-cover"
                    />
                  ) : (
                    job.company.name.substring(0, 2).toUpperCase()
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="font-semibold text-slate-900">{job.company.name}</p>
                    {job.company.isVerified && (
                      <svg className="w-4 h-4 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  {job.company.industry && (
                    <p className="text-sm text-slate-500">{job.company.industry}</p>
                  )}
                </div>
              </div>

              {/* Company Stats */}
              {(job.company.size || job.company.location) && (
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {job.company.size && (
                    <div className="p-2.5 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-500">Company size</p>
                      <p className="text-sm font-medium text-slate-700">{formatCompanySize(job.company.size)}</p>
                    </div>
                  )}
                  {job.company.location && (
                    <div className="p-2.5 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-500">Headquarters</p>
                      <p className="text-sm font-medium text-slate-700">{job.company.location}</p>
                    </div>
                  )}
                </div>
              )}

              {job.company.description && (
                <p className="text-sm text-slate-600 mb-4 leading-relaxed">{job.company.description}</p>
              )}

              <div className="flex flex-col gap-2">
                <Link
                  href={`/companies/${job.company.id}`}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                >
                  View company profile
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link
                  href={`/jobs?company=${job.company.id}`}
                  className="text-sm text-slate-500 hover:text-slate-700 font-medium flex items-center gap-1"
                >
                  See all jobs from this company
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Share */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-2">Know someone who&apos;d be great?</h3>
              <p className="text-sm text-slate-500 mb-4">Share this opportunity with your network</p>
              <div className="flex gap-2">
                <button
                  className="flex-1 p-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors group"
                  title="Share on Twitter"
                >
                  <svg className="w-5 h-5 mx-auto text-slate-500 group-hover:text-[#1DA1F2]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </button>
                <button
                  className="flex-1 p-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors group"
                  title="Share on LinkedIn"
                >
                  <svg className="w-5 h-5 mx-auto text-slate-500 group-hover:text-[#0A66C2]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </button>
                <button
                  className="flex-1 p-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors group"
                  title="Copy link"
                >
                  <svg className="w-5 h-5 mx-auto text-slate-500 group-hover:text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Application Wizard */}
      {showApplicationWizard && isLoggedIn && job && user && (
        <ApplicationWizard
          job={{
            id: job.id,
            title: job.title,
            company: {
              name: job.company.name,
              logo: job.company.logo || undefined,
            },
            requiresResume: true,
            requiresPortfolio: false,
          }}
          user={{
            id: user.id,
            name: user.name || '',
            email: user.email || '',
            phone: user.phone,
            location: user.location,
            headline: user.headline,
            summary: user.summary,
            experience: user.experience,
            skills: user.skills,
            resumeUrl: user.resumeUrl,
            portfolioUrl: user.portfolioUrl,
            linkedinUrl: user.linkedinUrl,
            githubUrl: user.githubUrl,
          }}
          hasScreeningForm={hasScreeningForm}
          onSubmit={handleWizardSubmit}
          onCancel={() => setShowApplicationWizard(false)}
          isSubmitting={applying}
        />
      )}

      {/* Screening Form Modal */}
      {showScreeningForm && isLoggedIn && job && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Application Questions</h2>
                <p className="text-sm text-slate-600 mt-1">Please answer the following questions to complete your application.</p>
              </div>
              <button
                onClick={() => setShowScreeningForm(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <ApplicantScreeningForm
              jobId={job.id}
              onSubmit={(answers) => {
                setScreeningAnswers(answers);
                handleApply(answers);
              }}
              onCancel={() => setShowScreeningForm(false)}
              isSubmitting={applying}
            />
          </div>
        </div>
      )}

      {/* Apply Modal */}
      {showApplyModal && isLoggedIn && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-900">Apply for {job.title}</h2>
              <button
                onClick={() => setShowApplyModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-6">
              <p className="text-sm text-slate-600 mb-4">
                You&apos;re applying to <strong>{job.company.name}</strong> for the position of <strong>{job.title}</strong>.
              </p>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm text-green-800 font-medium">Logged in as {user?.name}</p>
                    <p className="text-sm text-green-700 mt-0.5">
                      Your profile will be attached to this application.
                    </p>
                  </div>
                </div>
              </div>

              <label className="block text-sm font-medium text-slate-700 mb-2">
                Cover Letter (Optional)
              </label>
              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows={6}
                placeholder="Tell the employer why you're a great fit for this role..."
                className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowApplyModal(false)}
                className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleApply()}
                disabled={applying}
                className="flex-1 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {applying ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 mt-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <Image src="/logo.svg" alt="Jobly" width={80} height={22} />
              <p className="text-sm text-slate-500">Find your dream job in the Philippines</p>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <Link href="/terms" className="hover:text-slate-900">Terms</Link>
              <Link href="/privacy" className="hover:text-slate-900">Privacy</Link>
              <Link href="/jobs" className="hover:text-slate-900">Browse Jobs</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
