'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  isVerified: boolean;
}

interface Job {
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
  approvalStatus: string;
  isFeatured: boolean;
  createdAt: string;
  tenant: Tenant;
  applicationsCount: number;
}

interface Stats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const locationTypes = [
  { value: 'On-site', label: 'On-site' },
  { value: 'Remote', label: 'Remote' },
  { value: 'Hybrid', label: 'Hybrid' },
];

const jobTypes = [
  { value: 'Full-time', label: 'Full-time' },
  { value: 'Part-time', label: 'Part-time' },
  { value: 'Contract', label: 'Contract' },
  { value: 'Internship', label: 'Internship' },
  { value: 'Freelance', label: 'Freelance' },
];

const departments = [
  'Technology',
  'Marketing',
  'Design',
  'Customer Success',
  'Data & Analytics',
  'Human Resources',
  'Finance',
  'Operations',
  'Sales',
  'Engineering',
  'Product',
  'Legal',
  'Administration',
];

export default function AdminJobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [tenants, setTenants] = useState<Tenant[]>([]);

  const getAdminToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('jobly_admin_token');
    }
    return null;
  };

  const fetchJobs = useCallback(async () => {
    const token = getAdminToken();
    if (!token) {
      router.push('/admin/login');
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (statusFilter) params.append('status', statusFilter);
      params.append('page', pagination.page.toString());
      params.append('limit', '20');

      const response = await fetch(`/api/admin/jobs?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem('jobly_admin_token');
        localStorage.removeItem('jobly_admin');
        router.push('/admin/login');
        return;
      }

      const data = await response.json();

      if (response.ok) {
        setJobs(data.jobs || []);
        setStats(data.stats || { total: 0, pending: 0, approved: 0, rejected: 0 });
        setPagination(data.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 });
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter, pagination.page, router]);

  const fetchTenants = useCallback(async () => {
    const token = getAdminToken();
    if (!token) return;

    try {
      const response = await fetch('/api/admin/tenants', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTenants(data.tenants || []);
      }
    } catch (error) {
      console.error('Error fetching tenants:', error);
    }
  }, []);

  useEffect(() => {
    const token = getAdminToken();
    if (!token) {
      router.push('/admin/login');
      return;
    }
    fetchJobs();
    fetchTenants();
  }, [fetchJobs, fetchTenants, router]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link href="/admin" className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">Jobly Admin</h1>
                  <p className="text-xs text-slate-400">Job Management</p>
                </div>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/admin"
                className="px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              >
                Users
              </Link>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Job
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Total Jobs</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-600/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Pending</p>
                <p className="text-2xl font-bold text-white">{stats.pending}</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Approved</p>
                <p className="text-2xl font-bold text-white">{stats.approved}</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-600/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Rejected</p>
                <p className="text-2xl font-bold text-white">{stats.rejected}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-slate-800 rounded-xl p-4 mb-6 border border-slate-700">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by title or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">All Status</option>
              <option value="APPROVED">Approved</option>
              <option value="PENDING">Pending</option>
              <option value="REJECTED">Rejected</option>
            </select>
            <button
              onClick={() => fetchJobs()}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
            >
              Search
            </button>
          </div>
        </div>

        {/* Jobs Table */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-700/50">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Job</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Company</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Applications</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Posted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                      Loading jobs...
                    </td>
                  </tr>
                ) : jobs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                      No jobs found
                    </td>
                  </tr>
                ) : (
                  jobs.map((job) => (
                    <tr key={job.id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-white">{job.title}</p>
                          <p className="text-xs text-slate-400">{job.department || 'No department'} &bull; {job.jobType || 'Full-time'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-white">{job.tenant?.name || 'Unknown'}</span>
                          {job.tenant?.isVerified && (
                            <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-300">{job.location || 'Not specified'}</p>
                        <p className="text-xs text-slate-500">{job.locationType || 'On-site'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${
                          job.approvalStatus === 'APPROVED'
                            ? 'bg-green-900/50 text-green-300'
                            : job.approvalStatus === 'PENDING'
                            ? 'bg-yellow-900/50 text-yellow-300'
                            : 'bg-red-900/50 text-red-300'
                        }`}>
                          {job.approvalStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-300">
                        {job.applicationsCount}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">
                        {formatDate(job.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-slate-700 flex items-center justify-between">
              <p className="text-sm text-slate-400">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} jobs
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 text-sm bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-4 py-2 text-sm bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Create Job Modal */}
      {showCreateModal && (
        <CreateJobModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchJobs();
          }}
          tenants={tenants}
          isLoading={createLoading}
          setIsLoading={setCreateLoading}
        />
      )}
    </div>
  );
}

// Create Job Modal Component
function CreateJobModal({
  onClose,
  onSuccess,
  tenants,
  isLoading,
  setIsLoading,
}: {
  onClose: () => void;
  onSuccess: () => void;
  tenants: Tenant[];
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    location: '',
    locationType: 'Hybrid',
    salary: '',
    jobType: 'Full-time',
    department: 'Technology',
    tenantId: '',
    isActive: true,
    isFeatured: false,
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim() || !formData.description.trim()) {
      setError('Title and description are required');
      return;
    }

    const token = localStorage.getItem('jobly_admin_token');
    if (!token) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/jobs', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          tenantId: formData.tenantId || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        onSuccess();
      } else {
        setError(data.error || 'Failed to create job');
      }
    } catch (err) {
      setError('Failed to create job');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-slate-800 rounded-xl max-w-3xl w-full p-6 border border-slate-700 my-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Create New Job</h3>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Job Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Senior Full Stack Developer"
              className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Two columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Department */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Department</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {departments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            {/* Job Type */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Job Type</label>
              <select
                value={formData.jobType}
                onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {jobTypes.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., Makati City, Metro Manila"
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* Location Type */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Work Setup</label>
              <select
                value={formData.locationType}
                onChange={(e) => setFormData({ ...formData, locationType: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {locationTypes.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            {/* Salary */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Salary Range</label>
              <input
                type="text"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                placeholder="e.g., ₱80,000 - ₱120,000/month"
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* Company */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Company (Optional)</label>
              <select
                value={formData.tenantId}
                onChange={(e) => setFormData({ ...formData, tenantId: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">Use default company</option>
                {tenants.map((tenant) => (
                  <option key={tenant.id} value={tenant.id}>{tenant.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Job Description <span className="text-red-400">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the role, responsibilities, what you offer..."
              rows={6}
              className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
            />
          </div>

          {/* Requirements */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Requirements</label>
            <textarea
              value={formData.requirements}
              onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              placeholder="List required qualifications, skills, experience..."
              rows={4}
              className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
            />
          </div>

          {/* Options */}
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-red-600 focus:ring-red-500"
              />
              <span className="text-sm text-slate-300">Active</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-red-600 focus:ring-red-500"
              />
              <span className="text-sm text-slate-300">Featured</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-slate-700 text-slate-300 font-medium rounded-lg hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : 'Create Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
