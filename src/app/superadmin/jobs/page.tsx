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
} from 'lucide-react';

interface Job {
  id: string;
  title: string;
  description?: string;
  location?: string;
  locationType?: string;
  salary?: string;
  jobType?: string;
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
  const [showActionModal, setShowActionModal] = useState<{ type: string; job: Job } | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

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
    </div>
  );
}
