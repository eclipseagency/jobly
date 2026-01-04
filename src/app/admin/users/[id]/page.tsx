'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface UserDetail {
  id: string;
  email: string;
  name: string | null;
  role: string;
  avatar: string | null;
  phone: string | null;
  bio: string | null;
  location: string | null;
  title: string | null;
  skills: string[];
  linkedinUrl: string | null;
  portfolioUrl: string | null;
  githubUrl: string | null;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  tenant: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    website: string | null;
    industry: string | null;
    size: string | null;
    isVerified: boolean;
  } | null;
  applications: Array<{
    id: string;
    status: string;
    createdAt: string;
    job: {
      id: string;
      title: string;
      tenant: { name: string } | null;
    };
  }>;
  savedJobs: Array<{
    id: string;
    createdAt: string;
    job: { id: string; title: string };
  }>;
  workExperiences: Array<{
    id: string;
    jobTitle: string;
    company: string;
    startDate: string;
    endDate: string | null;
    isCurrent: boolean;
  }>;
  educations: Array<{
    id: string;
    school: string;
    degree: string;
    fieldOfStudy: string;
    startDate: string;
    endDate: string | null;
  }>;
}

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const token = localStorage.getItem('jobly_admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    async function fetchUser() {
      try {
        const response = await fetch(`/api/admin/users/${params.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          localStorage.removeItem('jobly_admin_token');
          router.push('/admin/login');
          return;
        }

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [params.id, router]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-slate-400">Loading user details...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 mb-4">User not found</p>
          <Link href="/admin" className="text-red-400 hover:text-red-300">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/admin"
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Users
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">User Details</h1>
                <p className="text-xs text-slate-400">Admin View</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Header Card */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-20 h-20 bg-slate-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-white">{user.name || 'No name'}</h2>
                <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                  user.role === 'EMPLOYER'
                    ? 'bg-purple-900/50 text-purple-300'
                    : 'bg-green-900/50 text-green-300'
                }`}>
                  {user.role === 'EMPLOYER' ? 'Employer' : 'Job Seeker'}
                </span>
                <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                  user.isActive
                    ? 'bg-green-900/50 text-green-300'
                    : 'bg-red-900/50 text-red-300'
                }`}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-slate-400">{user.email}</p>
              {user.title && <p className="text-slate-300 mt-1">{user.title}</p>}
            </div>
            <div className="text-sm text-slate-400">
              <p>Joined: {formatDate(user.createdAt)}</p>
              {user.lastLoginAt && <p>Last login: {formatDate(user.lastLoginAt)}</p>}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {['overview', 'applications', 'experience', 'company'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? 'bg-red-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm text-slate-400">Email</label>
                  <p className="text-white">{user.email}</p>
                </div>
                <div>
                  <label className="text-sm text-slate-400">Phone</label>
                  <p className="text-white">{user.phone || '-'}</p>
                </div>
                <div>
                  <label className="text-sm text-slate-400">Location</label>
                  <p className="text-white">{user.location || '-'}</p>
                </div>
                <div>
                  <label className="text-sm text-slate-400">User ID</label>
                  <p className="text-white font-mono text-sm">{user.id}</p>
                </div>
              </div>

              {user.bio && (
                <div className="mt-6">
                  <label className="text-sm text-slate-400">Bio</label>
                  <p className="text-white mt-1">{user.bio}</p>
                </div>
              )}

              {user.skills && user.skills.length > 0 && (
                <div className="mt-6">
                  <label className="text-sm text-slate-400">Skills</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {user.skills.map((skill, i) => (
                      <span key={i} className="px-3 py-1 bg-slate-700 text-slate-300 text-sm rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6">
                <label className="text-sm text-slate-400">Links</label>
                <div className="flex flex-wrap gap-4 mt-2">
                  {user.linkedinUrl && (
                    <a href={user.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 text-sm">
                      LinkedIn
                    </a>
                  )}
                  {user.githubUrl && (
                    <a href={user.githubUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 text-sm">
                      GitHub
                    </a>
                  )}
                  {user.portfolioUrl && (
                    <a href={user.portfolioUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 text-sm">
                      Portfolio
                    </a>
                  )}
                  {!user.linkedinUrl && !user.githubUrl && !user.portfolioUrl && (
                    <span className="text-slate-500">No links provided</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'applications' && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">
                Applications ({user.applications.length})
              </h3>
              {user.applications.length === 0 ? (
                <p className="text-slate-400">No applications yet</p>
              ) : (
                <div className="space-y-3">
                  {user.applications.map((app) => (
                    <div key={app.id} className="bg-slate-700/50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">{app.job.title}</p>
                          <p className="text-sm text-slate-400">{app.job.tenant?.name || 'Unknown Company'}</p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                            app.status === 'pending' ? 'bg-yellow-900/50 text-yellow-300' :
                            app.status === 'reviewing' ? 'bg-blue-900/50 text-blue-300' :
                            app.status === 'offered' ? 'bg-green-900/50 text-green-300' :
                            app.status === 'rejected' ? 'bg-red-900/50 text-red-300' :
                            'bg-slate-600 text-slate-300'
                          }`}>
                            {app.status}
                          </span>
                          <p className="text-xs text-slate-500 mt-1">{formatDate(app.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <h3 className="text-lg font-semibold text-white mt-8 mb-4">
                Saved Jobs ({user.savedJobs.length})
              </h3>
              {user.savedJobs.length === 0 ? (
                <p className="text-slate-400">No saved jobs</p>
              ) : (
                <div className="space-y-2">
                  {user.savedJobs.map((saved) => (
                    <div key={saved.id} className="bg-slate-700/50 rounded-lg p-3 flex items-center justify-between">
                      <p className="text-white">{saved.job.title}</p>
                      <p className="text-xs text-slate-500">{formatDate(saved.createdAt)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'experience' && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">
                Work Experience ({user.workExperiences.length})
              </h3>
              {user.workExperiences.length === 0 ? (
                <p className="text-slate-400">No work experience added</p>
              ) : (
                <div className="space-y-4">
                  {user.workExperiences.map((exp) => (
                    <div key={exp.id} className="bg-slate-700/50 rounded-lg p-4">
                      <p className="text-white font-medium">{exp.jobTitle}</p>
                      <p className="text-slate-400">{exp.company}</p>
                      <p className="text-sm text-slate-500 mt-1">
                        {formatDate(exp.startDate)} - {exp.isCurrent ? 'Present' : exp.endDate ? formatDate(exp.endDate) : 'N/A'}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <h3 className="text-lg font-semibold text-white mt-8 mb-4">
                Education ({user.educations.length})
              </h3>
              {user.educations.length === 0 ? (
                <p className="text-slate-400">No education added</p>
              ) : (
                <div className="space-y-4">
                  {user.educations.map((edu) => (
                    <div key={edu.id} className="bg-slate-700/50 rounded-lg p-4">
                      <p className="text-white font-medium">{edu.degree} in {edu.fieldOfStudy}</p>
                      <p className="text-slate-400">{edu.school}</p>
                      <p className="text-sm text-slate-500 mt-1">
                        {formatDate(edu.startDate)} - {edu.endDate ? formatDate(edu.endDate) : 'Present'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'company' && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Company Information</h3>
              {user.tenant ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm text-slate-400">Company Name</label>
                      <p className="text-white">{user.tenant.name}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-400">Slug</label>
                      <p className="text-white font-mono text-sm">{user.tenant.slug}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-400">Industry</label>
                      <p className="text-white">{user.tenant.industry || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-400">Company Size</label>
                      <p className="text-white">{user.tenant.size || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-400">Website</label>
                      <p className="text-white">{user.tenant.website || '-'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-slate-400">Verified</label>
                      <p className={user.tenant.isVerified ? 'text-green-400' : 'text-slate-400'}>
                        {user.tenant.isVerified ? 'Yes' : 'No'}
                      </p>
                    </div>
                  </div>
                  {user.tenant.description && (
                    <div className="mt-4">
                      <label className="text-sm text-slate-400">Description</label>
                      <p className="text-white mt-1">{user.tenant.description}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-slate-400">No company associated with this user</p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
