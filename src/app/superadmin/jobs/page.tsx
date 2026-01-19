'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  StarOff,
  Power,
  PowerOff,
  Trash2,
  X,
  MapPin,
  Building2,
  DollarSign,
  Briefcase,
  Calendar,
  Users,
  AlertTriangle,
  Loader2,
  Filter,
  Edit,
  Save,
  MessageSquare,
  Send,
  Plus,
} from 'lucide-react';

interface Company {
  id: string;
  name: string;
  logo?: string;
  isVerified: boolean;
}

interface Job {
  id: string;
  title: string;
  description?: string;
  requirements?: string;
  location?: string;
  locationType?: string;
  salary?: string;
  jobType?: string;
  department?: string;
  isActive: boolean;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedAt?: string;
  approvedBy?: string;
  rejectionReason?: string;
  isFeatured: boolean;
  featuredUntil?: string;
  createdAt: string;
  expiresAt?: string;
  company: string;
  companyLogo?: string;
  companyVerified: boolean;
  companySuspended: boolean;
  applicationsCount: number;
  tenant?: {
    id: string;
    name: string;
    logo?: string;
    isVerified: boolean;
    isSuspended: boolean;
  };
  _count?: {
    applications: number;
    savedJobs: number;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function JobsPage() {
  const searchParams = useSearchParams();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [isActive, setIsActive] = useState(searchParams.get('isActive') || '');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showJobModal, setShowJobModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRequestChangesModal, setShowRequestChangesModal] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    requirements: '',
    location: '',
    locationType: '',
    salary: '',
    jobType: '',
    department: ''
  });
  const [changeRequestMessage, setChangeRequestMessage] = useState('');
  const [showActionModal, setShowActionModal] = useState<{ type: string; job: Job } | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [seedingJobs, setSeedingJobs] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [createForm, setCreateForm] = useState({
    tenantId: '',
    title: '',
    description: '',
    requirements: '',
    location: '',
    locationType: '',
    salary: '',
    jobType: '',
    department: '',
    autoApprove: true,
  });

  const fetchJobs = async (page = 1) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('superadmin_token');
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(search && { search }),
        ...(status && { status }),
        ...(isActive && { isActive }),
      });

      const response = await fetch(`/api/superadmin/jobs?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch jobs');

      const data = await response.json();
      setJobs(data.jobs);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [search, status, isActive]);

  const handleAction = async (action: string, jobId: string, reason?: string, featuredUntil?: string) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('superadmin_token');
      const response = await fetch(`/api/superadmin/jobs/${jobId}`, {
        method: action === 'delete' ? 'DELETE' : 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: action !== 'delete' ? JSON.stringify({ action, reason, featuredUntil }) : undefined,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Action failed');
      }

      await fetchJobs(pagination.page);
      setShowActionModal(null);
      setActionReason('');
      setShowJobModal(false);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const viewJobDetails = async (jobId: string) => {
    try {
      const token = localStorage.getItem('superadmin_token');
      const response = await fetch(`/api/superadmin/jobs/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch job');

      const data = await response.json();
      setSelectedJob(data.job);
      setShowJobModal(true);
    } catch (error) {
      console.error('Error fetching job:', error);
    }
  };

  const fetchCompanies = async () => {
    try {
      const token = localStorage.getItem('superadmin_token');
      const response = await fetch('/api/superadmin/employers?limit=100', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setCompanies(data.employers || []);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  const openCreateModal = () => {
    fetchCompanies();
    setCreateForm({
      tenantId: '',
      title: '',
      description: '',
      requirements: '',
      location: '',
      locationType: '',
      salary: '',
      jobType: '',
      department: '',
      autoApprove: true,
    });
    setShowCreateModal(true);
  };

  const handleCreateJob = async () => {
    if (!createForm.tenantId || !createForm.title || !createForm.description) {
      alert('Please fill in all required fields (Company, Title, Description)');
      return;
    }
    setActionLoading(true);
    try {
      const token = localStorage.getItem('superadmin_token');
      const response = await fetch('/api/superadmin/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(createForm),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create job');
      }

      await fetchJobs(1);
      setShowCreateModal(false);
      alert('Job created successfully!');
    } catch (error: any) {
      alert(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const seedSampleJobs = async () => {
    if (!confirm('This will create 6 sample jobs. Continue?')) return;
    setSeedingJobs(true);
    try {
      const token = localStorage.getItem('superadmin_token');
      const response = await fetch('/api/superadmin/jobs/seed', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to seed jobs');
      }

      alert(data.message);
      await fetchJobs(1);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setSeedingJobs(false);
    }
  };

  const updateExistingJobs = async () => {
    if (!confirm('This will update the first 3 jobs with better realistic data. Continue?')) return;
    setSeedingJobs(true);
    try {
      const token = localStorage.getItem('superadmin_token');
      const response = await fetch('/api/superadmin/jobs/update-sample', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update jobs');
      }

      alert(data.message);
      await fetchJobs(1);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setSeedingJobs(false);
    }
  };

  const openEditModal = (job: Job) => {
    setEditForm({
      title: job.title || '',
      description: job.description || '',
      requirements: job.requirements || '',
      location: job.location || '',
      locationType: job.locationType || '',
      salary: job.salary || '',
      jobType: job.jobType || '',
      department: job.department || '',
    });
    setSelectedJob(job);
    setShowEditModal(true);
  };

  const handleEditJob = async () => {
    if (!selectedJob) return;
    setActionLoading(true);
    try {
      const token = localStorage.getItem('superadmin_token');
      const response = await fetch(`/api/superadmin/jobs/${selectedJob.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update job');
      }

      await fetchJobs(pagination.page);
      setShowEditModal(false);
      setSelectedJob(null);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const openRequestChangesModal = (job: Job) => {
    setSelectedJob(job);
    setChangeRequestMessage('');
    setShowRequestChangesModal(true);
  };

  const handleRequestChanges = async () => {
    if (!selectedJob || !changeRequestMessage.trim()) return;
    setActionLoading(true);
    try {
      const token = localStorage.getItem('superadmin_token');
      const response = await fetch(`/api/superadmin/jobs/${selectedJob.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'request_changes',
          reason: changeRequestMessage,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to send request');
      }

      await fetchJobs(pagination.page);
      setShowRequestChangesModal(false);
      setSelectedJob(null);
      setChangeRequestMessage('');
      alert('Change request sent to employer');
    } catch (error: any) {
      alert(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (job: Job) => {
    if (job.approvalStatus === 'PENDING') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
          <Clock className="w-3 h-3" />
          Pending
        </span>
      );
    }
    if (job.approvalStatus === 'REJECTED') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
          <XCircle className="w-3 h-3" />
          Rejected
        </span>
      );
    }
    if (!job.isActive) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
          <PowerOff className="w-3 h-3" />
          Inactive
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
        <CheckCircle className="w-3 h-3" />
        Active
      </span>
    );
  };

  const pendingCount = jobs.filter(j => j.approvalStatus === 'PENDING').length;

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Jobs Management</h1>
          <p className="text-gray-500">Manage and approve job listings</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={updateExistingJobs}
            disabled={seedingJobs}
            className="px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 flex items-center gap-2 disabled:opacity-50"
          >
            {seedingJobs ? <Loader2 className="w-5 h-5 animate-spin" /> : <Edit className="w-5 h-5" />}
            Update 3 Jobs
          </button>
          <button
            onClick={seedSampleJobs}
            disabled={seedingJobs}
            className="px-4 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 flex items-center gap-2 disabled:opacity-50"
          >
            {seedingJobs ? <Loader2 className="w-5 h-5 animate-spin" /> : <Star className="w-5 h-5" />}
            Seed 6 New Jobs
          </button>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Job
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-4">
        <button
          onClick={() => setStatus('')}
          className={`p-4 rounded-lg border ${
            status === '' ? 'bg-purple-50 border-purple-300' : 'bg-white border-gray-200'
          }`}
        >
          <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
          <p className="text-sm text-gray-500">All Jobs</p>
        </button>
        <button
          onClick={() => setStatus('PENDING')}
          className={`p-4 rounded-lg border ${
            status === 'PENDING' ? 'bg-yellow-50 border-yellow-300' : 'bg-white border-gray-200'
          }`}
        >
          <p className="text-2xl font-bold text-yellow-600">
            {jobs.filter(j => j.approvalStatus === 'PENDING').length || '0'}
          </p>
          <p className="text-sm text-gray-500">Pending Review</p>
        </button>
        <button
          onClick={() => setStatus('APPROVED')}
          className={`p-4 rounded-lg border ${
            status === 'APPROVED' ? 'bg-green-50 border-green-300' : 'bg-white border-gray-200'
          }`}
        >
          <p className="text-2xl font-bold text-green-600">
            {jobs.filter(j => j.approvalStatus === 'APPROVED').length || '0'}
          </p>
          <p className="text-sm text-gray-500">Approved</p>
        </button>
        <button
          onClick={() => setStatus('REJECTED')}
          className={`p-4 rounded-lg border ${
            status === 'REJECTED' ? 'bg-red-50 border-red-300' : 'bg-white border-gray-200'
          }`}
        >
          <p className="text-2xl font-bold text-red-600">
            {jobs.filter(j => j.approvalStatus === 'REJECTED').length || '0'}
          </p>
          <p className="text-sm text-gray-500">Rejected</p>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search jobs or companies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <select
            value={isActive}
            onChange={(e) => setIsActive(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">Active & Inactive</option>
            <option value="true">Active Only</option>
            <option value="false">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No jobs found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Job
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applications
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Posted
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {jobs.map((job) => (
                  <tr key={job.id} className={`hover:bg-gray-50 ${job.approvalStatus === 'PENDING' ? 'bg-yellow-50/50' : ''}`}>
                    <td className="px-6 py-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900">{job.title}</p>
                          {job.isFeatured && (
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                          {job.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {job.location}
                            </span>
                          )}
                          {job.jobType && (
                            <span className="flex items-center gap-1">
                              <Briefcase className="w-3 h-3" />
                              {job.jobType}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-900">{job.company}</span>
                        {job.companyVerified && (
                          <CheckCircle className="w-4 h-4 text-blue-500" />
                        )}
                        {job.companySuspended && (
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(job)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-gray-600">
                        <Users className="w-4 h-4" />
                        {job.applicationsCount}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="relative">
                        <button
                          onClick={() => setOpenDropdown(openDropdown === job.id ? null : job.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                          <MoreVertical className="w-5 h-5 text-gray-500" />
                        </button>
                        {openDropdown === job.id && (
                          <>
                            <div
                              className="fixed inset-0 z-40"
                              onClick={() => setOpenDropdown(null)}
                            />
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50">
                              <button
                                onClick={() => {
                                  viewJobDetails(job.id);
                                  setOpenDropdown(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                              >
                                <Eye className="w-4 h-4" />
                                View Details
                              </button>
                              <button
                                onClick={() => {
                                  openEditModal(job);
                                  setOpenDropdown(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-blue-700 hover:bg-gray-100 flex items-center gap-2"
                              >
                                <Edit className="w-4 h-4" />
                                Edit Job
                              </button>
                              <button
                                onClick={() => {
                                  openRequestChangesModal(job);
                                  setOpenDropdown(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-purple-700 hover:bg-gray-100 flex items-center gap-2"
                              >
                                <MessageSquare className="w-4 h-4" />
                                Request Changes
                              </button>
                              {job.approvalStatus === 'PENDING' && (
                                <>
                                  <button
                                    onClick={() => {
                                      handleAction('approve', job.id);
                                      setOpenDropdown(null);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-gray-100 flex items-center gap-2"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => {
                                      setShowActionModal({ type: 'reject', job });
                                      setOpenDropdown(null);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-gray-100 flex items-center gap-2"
                                  >
                                    <XCircle className="w-4 h-4" />
                                    Reject
                                  </button>
                                </>
                              )}
                              {job.approvalStatus === 'APPROVED' && (
                                <>
                                  {job.isActive ? (
                                    <button
                                      onClick={() => {
                                        handleAction('deactivate', job.id);
                                        setOpenDropdown(null);
                                      }}
                                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                    >
                                      <PowerOff className="w-4 h-4" />
                                      Deactivate
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        handleAction('activate', job.id);
                                        setOpenDropdown(null);
                                      }}
                                      className="w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-gray-100 flex items-center gap-2"
                                    >
                                      <Power className="w-4 h-4" />
                                      Activate
                                    </button>
                                  )}
                                  {job.isFeatured ? (
                                    <button
                                      onClick={() => {
                                        handleAction('unfeature', job.id);
                                        setOpenDropdown(null);
                                      }}
                                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                    >
                                      <StarOff className="w-4 h-4" />
                                      Remove Featured
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        handleAction('feature', job.id);
                                        setOpenDropdown(null);
                                      }}
                                      className="w-full text-left px-4 py-2 text-sm text-yellow-700 hover:bg-gray-100 flex items-center gap-2"
                                    >
                                      <Star className="w-4 h-4" />
                                      Make Featured
                                    </button>
                                  )}
                                </>
                              )}
                              {job.approvalStatus === 'REJECTED' && (
                                <button
                                  onClick={() => {
                                    handleAction('pending', job.id);
                                    setOpenDropdown(null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-yellow-700 hover:bg-gray-100 flex items-center gap-2"
                                >
                                  <Clock className="w-4 h-4" />
                                  Set to Pending
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  setShowActionModal({ type: 'delete', job });
                                  setOpenDropdown(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-gray-100 flex items-center gap-2"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} jobs
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchJobs(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="px-4 py-2 text-sm">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => fetchJobs(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Job Details Modal */}
      {showJobModal && selectedJob && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
              <h2 className="text-xl font-semibold">Job Details</h2>
              <button
                onClick={() => setShowJobModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Job Header */}
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{selectedJob.title}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-gray-600">{selectedJob.tenant?.name || selectedJob.company}</span>
                      {selectedJob.tenant?.isVerified && (
                        <CheckCircle className="w-4 h-4 text-blue-500" />
                      )}
                    </div>
                  </div>
                  {getStatusBadge(selectedJob)}
                </div>

                <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-500">
                  {selectedJob.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {selectedJob.location}
                    </span>
                  )}
                  {selectedJob.jobType && (
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4" />
                      {selectedJob.jobType}
                    </span>
                  )}
                  {selectedJob.salary && (
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      {selectedJob.salary}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Posted {new Date(selectedJob.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Rejection Reason */}
              {selectedJob.approvalStatus === 'REJECTED' && selectedJob.rejectionReason && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-red-800 font-medium mb-2">
                    <XCircle className="w-5 h-5" />
                    Rejection Reason
                  </div>
                  <p className="text-red-700">{selectedJob.rejectionReason}</p>
                </div>
              )}

              {/* Featured Badge */}
              {selectedJob.isFeatured && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-yellow-800 font-medium">
                    <Star className="w-5 h-5 fill-yellow-500" />
                    Featured Job
                    {selectedJob.featuredUntil && (
                      <span className="text-sm font-normal text-yellow-600 ml-2">
                        until {new Date(selectedJob.featuredUntil).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Job Description</h4>
                <div className="prose prose-sm max-w-none text-gray-600">
                  {selectedJob.description || 'No description provided'}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{selectedJob.applicationsCount || 0}</p>
                  <p className="text-sm text-gray-500">Applications</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">
                    {selectedJob._count?.savedJobs || 0}
                  </p>
                  <p className="text-sm text-gray-500">Saved</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900">
                    {selectedJob.isActive ? 'Active' : 'Inactive'}
                  </p>
                  <p className="text-sm text-gray-500">Status</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap justify-end gap-3 p-6 border-t bg-gray-50 rounded-b-xl">
              {selectedJob.approvalStatus === 'PENDING' && (
                <>
                  <button
                    onClick={() => handleAction('approve', selectedJob.id)}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
                  >
                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    Approve
                  </button>
                  <button
                    onClick={() => setShowActionModal({ type: 'reject', job: selectedJob })}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                </>
              )}
              {selectedJob.approvalStatus === 'APPROVED' && (
                <>
                  {!selectedJob.isFeatured && (
                    <button
                      onClick={() => handleAction('feature', selectedJob.id)}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 flex items-center gap-2 disabled:opacity-50"
                    >
                      <Star className="w-4 h-4" />
                      Feature
                    </button>
                  )}
                  {selectedJob.isActive ? (
                    <button
                      onClick={() => handleAction('deactivate', selectedJob.id)}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2 disabled:opacity-50"
                    >
                      <PowerOff className="w-4 h-4" />
                      Deactivate
                    </button>
                  ) : (
                    <button
                      onClick={() => handleAction('activate', selectedJob.id)}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
                    >
                      <Power className="w-4 h-4" />
                      Activate
                    </button>
                  )}
                </>
              )}
              <button
                onClick={() => setShowJobModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Confirmation Modal */}
      {showActionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    showActionModal.type === 'delete' ? 'bg-red-100' : 'bg-red-100'
                  }`}
                >
                  {showActionModal.type === 'delete' ? (
                    <Trash2 className="w-6 h-6 text-red-600" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">
                    {showActionModal.type === 'delete' ? 'Delete Job' : 'Reject Job'}
                  </h3>
                  <p className="text-gray-500">{showActionModal.job.title}</p>
                </div>
              </div>

              <p className="text-gray-600 mb-4">
                {showActionModal.type === 'delete'
                  ? 'Are you sure you want to delete this job? All applications will also be deleted. This action cannot be undone.'
                  : 'Please provide a reason for rejecting this job. This will be visible to the employer.'}
              </p>

              {showActionModal.type === 'reject' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rejection Reason <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={actionReason}
                    onChange={(e) => setActionReason(e.target.value)}
                    placeholder="Enter the reason for rejection..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows={3}
                    required
                  />
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 p-6 border-t bg-gray-50 rounded-b-xl">
              <button
                onClick={() => {
                  setShowActionModal(null);
                  setActionReason('');
                }}
                disabled={actionLoading}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (showActionModal.type === 'reject' && !actionReason.trim()) {
                    alert('Please provide a rejection reason');
                    return;
                  }
                  handleAction(showActionModal.type, showActionModal.job.id, actionReason);
                }}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 disabled:opacity-50"
              >
                {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {showActionModal.type === 'delete' ? 'Delete' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Job Modal */}
      {showEditModal && selectedJob && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Edit className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Edit Job</h2>
                  <p className="text-sm text-gray-500">{selectedJob.company}</p>
                </div>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Title
                </label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Senior Software Engineer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Describe the role, responsibilities, and what makes this opportunity exciting..."
                  rows={5}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Requirements
                </label>
                <textarea
                  value={editForm.requirements}
                  onChange={(e) => setEditForm({ ...editForm, requirements: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="List the required skills, qualifications, and experience..."
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., Makati City, Metro Manila"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Work Setup
                  </label>
                  <select
                    value={editForm.locationType}
                    onChange={(e) => setEditForm({ ...editForm, locationType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select work setup</option>
                    <option value="remote">Remote</option>
                    <option value="onsite">On-site</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Salary
                  </label>
                  <input
                    type="text"
                    value={editForm.salary}
                    onChange={(e) => setEditForm({ ...editForm, salary: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., ₱50,000 - ₱80,000/month"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <select
                    value={editForm.department}
                    onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select department</option>
                    <option value="Technology">Technology</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Sales">Sales</option>
                    <option value="Finance">Finance</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Operations">Operations</option>
                    <option value="Customer Service">Customer Service</option>
                    <option value="Design">Design</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Education">Education</option>
                    <option value="BPO">BPO</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Type
                </label>
                <select
                  value={editForm.jobType}
                  onChange={(e) => setEditForm({ ...editForm, jobType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select job type</option>
                  <option value="Full-time">Full Time</option>
                  <option value="Part-time">Part Time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                  <option value="Freelance">Freelance</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t bg-gray-50 rounded-b-xl">
              <button
                onClick={() => setShowEditModal(false)}
                disabled={actionLoading}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleEditJob}
                disabled={actionLoading}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 disabled:opacity-50"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Changes Modal */}
      {showRequestChangesModal && selectedJob && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Request Changes</h2>
                  <p className="text-sm text-gray-500">{selectedJob.title}</p>
                </div>
              </div>
              <button
                onClick={() => setShowRequestChangesModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                Send a message to the employer requesting changes to this job posting.
                They will receive a notification and can update the job accordingly.
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={changeRequestMessage}
                  onChange={(e) => setChangeRequestMessage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Describe what changes are needed..."
                  rows={5}
                />
              </div>
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Employer:</strong> {selectedJob.company}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Job Status:</strong> {selectedJob.approvalStatus}
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t bg-gray-50 rounded-b-xl">
              <button
                onClick={() => setShowRequestChangesModal(false)}
                disabled={actionLoading}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestChanges}
                disabled={actionLoading || !changeRequestMessage.trim()}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 disabled:opacity-50"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Job Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Plus className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Create New Job</h2>
                  <p className="text-sm text-gray-500">Post a job on behalf of a company</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company <span className="text-red-500">*</span>
                </label>
                <select
                  value={createForm.tenantId}
                  onChange={(e) => setCreateForm({ ...createForm, tenantId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select a company</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name} {company.isVerified ? '✓' : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Senior Software Engineer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Describe the role, responsibilities, and what makes this opportunity exciting..."
                  rows={4}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Requirements
                </label>
                <textarea
                  value={createForm.requirements}
                  onChange={(e) => setCreateForm({ ...createForm, requirements: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="List the required skills, qualifications, and experience..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={createForm.location}
                    onChange={(e) => setCreateForm({ ...createForm, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., Makati City, Metro Manila"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Work Setup
                  </label>
                  <select
                    value={createForm.locationType}
                    onChange={(e) => setCreateForm({ ...createForm, locationType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select work setup</option>
                    <option value="remote">Remote</option>
                    <option value="onsite">On-site</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Salary
                  </label>
                  <input
                    type="text"
                    value={createForm.salary}
                    onChange={(e) => setCreateForm({ ...createForm, salary: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="e.g., ₱50,000 - ₱80,000/month"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <select
                    value={createForm.department}
                    onChange={(e) => setCreateForm({ ...createForm, department: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select department</option>
                    <option value="Technology">Technology</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Sales">Sales</option>
                    <option value="Finance">Finance</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Operations">Operations</option>
                    <option value="Customer Service">Customer Service</option>
                    <option value="Design">Design</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Education">Education</option>
                    <option value="BPO">BPO</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Type
                </label>
                <select
                  value={createForm.jobType}
                  onChange={(e) => setCreateForm({ ...createForm, jobType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select job type</option>
                  <option value="Full-time">Full Time</option>
                  <option value="Part-time">Part Time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                  <option value="Freelance">Freelance</option>
                </select>
              </div>
              <div className="pt-2 border-t">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={createForm.autoApprove}
                    onChange={(e) => setCreateForm({ ...createForm, autoApprove: e.target.checked })}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">Auto-approve this job (skip pending status)</span>
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t bg-gray-50 rounded-b-xl">
              <button
                onClick={() => setShowCreateModal(false)}
                disabled={actionLoading}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateJob}
                disabled={actionLoading || !createForm.tenantId || !createForm.title || !createForm.description}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 disabled:opacity-50"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Create Job
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
