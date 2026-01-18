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
  Ban,
  Trash2,
  X,
  MapPin,
  Building2,
  Globe,
  Mail,
  Phone,
  Users,
  Briefcase,
  Calendar,
  AlertTriangle,
  Loader2,
  ShieldCheck,
  ShieldOff,
  ExternalLink,
} from 'lucide-react';

interface Employer {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  email?: string;
  phone?: string;
  website?: string;
  industry?: string;
  size?: string;
  city?: string;
  country?: string;
  isVerified: boolean;
  verifiedAt?: string;
  isSuspended: boolean;
  suspendedAt?: string;
  suspensionReason?: string;
  createdAt: string;
  usersCount: number;
  jobsCount: number;
  activeJobsCount: number;
  totalApplications: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function EmployersPage() {
  const searchParams = useSearchParams();

  const [employers, setEmployers] = useState<Employer[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [selectedEmployer, setSelectedEmployer] = useState<any>(null);
  const [showEmployerModal, setShowEmployerModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState<{ type: string; employer: Employer } | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const fetchEmployers = async (page = 1) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('superadmin_token');
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(search && { search }),
        ...(status && { status }),
      });

      const response = await fetch(`/api/superadmin/employers?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch employers');

      const data = await response.json();
      setEmployers(data.employers);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching employers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployers();
  }, [search, status]);

  const handleAction = async (action: string, employerId: string, reason?: string) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('superadmin_token');
      const response = await fetch(`/api/superadmin/employers/${employerId}`, {
        method: action === 'delete' ? 'DELETE' : 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: action !== 'delete' ? JSON.stringify({ action, reason }) : undefined,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Action failed');
      }

      await fetchEmployers(pagination.page);
      setShowActionModal(null);
      setActionReason('');
      setShowEmployerModal(false);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const viewEmployerDetails = async (employerId: string) => {
    try {
      const token = localStorage.getItem('superadmin_token');
      const response = await fetch(`/api/superadmin/employers/${employerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch employer');

      const data = await response.json();
      setSelectedEmployer(data.employer);
      setShowEmployerModal(true);
    } catch (error) {
      console.error('Error fetching employer:', error);
    }
  };

  const getStatusBadge = (employer: Employer) => {
    if (employer.isSuspended) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
          <Ban className="w-3 h-3" />
          Suspended
        </span>
      );
    }
    if (!employer.isVerified) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
          <AlertTriangle className="w-3 h-3" />
          Unverified
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
        <CheckCircle className="w-3 h-3" />
        Verified
      </span>
    );
  };

  // Calculate account age
  const getAccountAge = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffMs = now.getTime() - created.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 30) return `${diffDays} days`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months`;
    return `${Math.floor(diffDays / 365)} years`;
  };

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
          <p className="text-sm text-gray-500">All Employers</p>
        </button>
        <button
          onClick={() => setStatus('verified')}
          className={`p-4 rounded-lg border ${
            status === 'verified' ? 'bg-green-50 border-green-300' : 'bg-white border-gray-200'
          }`}
        >
          <p className="text-2xl font-bold text-green-600">
            {employers.filter(e => e.isVerified && !e.isSuspended).length}
          </p>
          <p className="text-sm text-gray-500">Verified</p>
        </button>
        <button
          onClick={() => setStatus('unverified')}
          className={`p-4 rounded-lg border ${
            status === 'unverified' ? 'bg-yellow-50 border-yellow-300' : 'bg-white border-gray-200'
          }`}
        >
          <p className="text-2xl font-bold text-yellow-600">
            {employers.filter(e => !e.isVerified).length}
          </p>
          <p className="text-sm text-gray-500">Unverified</p>
        </button>
        <button
          onClick={() => setStatus('suspended')}
          className={`p-4 rounded-lg border ${
            status === 'suspended' ? 'bg-red-50 border-red-300' : 'bg-white border-gray-200'
          }`}
        >
          <p className="text-2xl font-bold text-red-600">
            {employers.filter(e => e.isSuspended).length}
          </p>
          <p className="text-sm text-gray-500">Suspended</p>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or slug..."
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
            <option value="verified">Verified</option>
            <option value="unverified">Unverified</option>
            <option value="suspended">Suspended</option>
            <option value="active">Active (Not Suspended)</option>
          </select>
        </div>
      </div>

      {/* Employers Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : employers.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No employers found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jobs
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Users
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Account Age
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {employers.map((employer) => (
                  <tr key={employer.id} className={`hover:bg-gray-50 ${!employer.isVerified ? 'bg-yellow-50/30' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center overflow-hidden">
                          {employer.logo ? (
                            <img src={employer.logo} alt={employer.name} className="w-full h-full object-cover" />
                          ) : (
                            <Building2 className="w-5 h-5 text-purple-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{employer.name}</p>
                          <p className="text-sm text-gray-500">{employer.industry || employer.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(employer)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-900">
                        <span className="font-medium">{employer.activeJobsCount}</span>
                        <span className="text-gray-500"> / {employer.jobsCount}</span>
                      </div>
                      <p className="text-xs text-gray-500">Active / Total</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-gray-600">
                        <Users className="w-4 h-4" />
                        {employer.usersCount}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getAccountAge(employer.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="relative">
                        <button
                          onClick={() => setOpenDropdown(openDropdown === employer.id ? null : employer.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                          <MoreVertical className="w-5 h-5 text-gray-500" />
                        </button>
                        {openDropdown === employer.id && (
                          <>
                            <div
                              className="fixed inset-0 z-40"
                              onClick={() => setOpenDropdown(null)}
                            />
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50">
                              <button
                                onClick={() => {
                                  viewEmployerDetails(employer.id);
                                  setOpenDropdown(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                              >
                                <Eye className="w-4 h-4" />
                                View Details
                              </button>
                              {employer.isVerified ? (
                                <button
                                  onClick={() => {
                                    handleAction('unverify', employer.id);
                                    setOpenDropdown(null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                >
                                  <ShieldOff className="w-4 h-4" />
                                  Remove Verification
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    handleAction('verify', employer.id);
                                    setOpenDropdown(null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-gray-100 flex items-center gap-2"
                                >
                                  <ShieldCheck className="w-4 h-4" />
                                  Verify
                                </button>
                              )}
                              {employer.isSuspended ? (
                                <button
                                  onClick={() => {
                                    handleAction('unsuspend', employer.id);
                                    setOpenDropdown(null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-gray-100 flex items-center gap-2"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  Unsuspend
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    setShowActionModal({ type: 'suspend', employer });
                                    setOpenDropdown(null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-yellow-700 hover:bg-gray-100 flex items-center gap-2"
                                >
                                  <Ban className="w-4 h-4" />
                                  Suspend
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  setShowActionModal({ type: 'delete', employer });
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
              {pagination.total} employers
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchEmployers(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="px-4 py-2 text-sm">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => fetchEmployers(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Employer Details Modal */}
      {showEmployerModal && selectedEmployer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
              <h2 className="text-xl font-semibold">Employer Details</h2>
              <button
                onClick={() => setShowEmployerModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Employer Header */}
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 bg-purple-100 rounded-xl flex items-center justify-center overflow-hidden">
                  {selectedEmployer.logo ? (
                    <img src={selectedEmployer.logo} alt={selectedEmployer.name} className="w-full h-full object-cover" />
                  ) : (
                    <Building2 className="w-10 h-10 text-purple-600" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-bold text-gray-900">{selectedEmployer.name}</h3>
                    {getStatusBadge(selectedEmployer)}
                  </div>
                  <p className="text-gray-500 mt-1">{selectedEmployer.industry}</p>
                  {selectedEmployer.website && (
                    <a
                      href={selectedEmployer.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-purple-600 hover:underline mt-2"
                    >
                      <Globe className="w-4 h-4" />
                      {selectedEmployer.website}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-4">
                {selectedEmployer.email && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4" />
                    {selectedEmployer.email}
                  </div>
                )}
                {selectedEmployer.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4" />
                    {selectedEmployer.phone}
                  </div>
                )}
                {(selectedEmployer.city || selectedEmployer.country) && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    {[selectedEmployer.city, selectedEmployer.country].filter(Boolean).join(', ')}
                  </div>
                )}
                {selectedEmployer.size && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="w-4 h-4" />
                    {selectedEmployer.size} employees
                  </div>
                )}
              </div>

              {/* Suspension Info */}
              {selectedEmployer.isSuspended && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-red-800 font-medium mb-2">
                    <Ban className="w-5 h-5" />
                    Account Suspended
                  </div>
                  {selectedEmployer.suspensionReason && (
                    <p className="text-sm text-red-700">
                      Reason: {selectedEmployer.suspensionReason}
                    </p>
                  )}
                  {selectedEmployer.suspendedAt && (
                    <p className="text-sm text-red-600 mt-1">
                      Suspended on: {new Date(selectedEmployer.suspendedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-4 gap-4 pt-4 border-t">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{selectedEmployer.stats?.usersCount || 0}</p>
                  <p className="text-sm text-gray-500">Team Members</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{selectedEmployer.stats?.totalJobs || 0}</p>
                  <p className="text-sm text-gray-500">Total Jobs</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{selectedEmployer.stats?.activeJobs || 0}</p>
                  <p className="text-sm text-gray-500">Active Jobs</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{selectedEmployer.stats?.totalApplications || 0}</p>
                  <p className="text-sm text-gray-500">Applications</p>
                </div>
              </div>

              {/* Recent Jobs */}
              {selectedEmployer.jobs && selectedEmployer.jobs.length > 0 && (
                <div className="pt-4 border-t">
                  <h4 className="font-semibold text-gray-900 mb-3">Recent Jobs</h4>
                  <div className="space-y-2">
                    {selectedEmployer.jobs.slice(0, 5).map((job: any) => (
                      <div key={job.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{job.title}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            {job.location && <span>{job.location}</span>}
                            <span>•</span>
                            <span>{job._count?.applications || 0} applications</span>
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          job.approvalStatus === 'APPROVED' ? 'bg-green-100 text-green-800' :
                          job.approvalStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {job.approvalStatus}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Team Members */}
              {selectedEmployer.users && selectedEmployer.users.length > 0 && (
                <div className="pt-4 border-t">
                  <h4 className="font-semibold text-gray-900 mb-3">Team Members</h4>
                  <div className="space-y-2">
                    {selectedEmployer.users.map((user: any) => (
                      <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <span className="text-sm text-purple-600 font-medium">
                              {user.name?.charAt(0).toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{user.name}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                        {user.isSuspended && (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                            Suspended
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap justify-end gap-3 p-6 border-t bg-gray-50 rounded-b-xl">
              {!selectedEmployer.isVerified && (
                <button
                  onClick={() => handleAction('verify', selectedEmployer.id)}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Verify Employer
                </button>
              )}
              {selectedEmployer.isSuspended ? (
                <button
                  onClick={() => handleAction('unsuspend', selectedEmployer.id)}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" />
                  Unsuspend
                </button>
              ) : (
                <button
                  onClick={() => setShowActionModal({ type: 'suspend', employer: selectedEmployer })}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 flex items-center gap-2"
                >
                  <Ban className="w-4 h-4" />
                  Suspend
                </button>
              )}
              <button
                onClick={() => setShowEmployerModal(false)}
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
                    showActionModal.type === 'delete' ? 'bg-red-100' : 'bg-yellow-100'
                  }`}
                >
                  {showActionModal.type === 'delete' ? (
                    <Trash2 className="w-6 h-6 text-red-600" />
                  ) : (
                    <Ban className="w-6 h-6 text-yellow-600" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">
                    {showActionModal.type === 'delete' ? 'Delete Employer' : 'Suspend Employer'}
                  </h3>
                  <p className="text-gray-500">{showActionModal.employer.name}</p>
                </div>
              </div>

              <p className="text-gray-600 mb-4">
                {showActionModal.type === 'delete'
                  ? 'Are you sure you want to delete this employer? All their jobs, team members, and applications will also be deleted. This action cannot be undone.'
                  : 'This will suspend the employer, all their users, and deactivate all their jobs.'}
              </p>

              {showActionModal.type === 'suspend' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason for suspension
                  </label>
                  <textarea
                    value={actionReason}
                    onChange={(e) => setActionReason(e.target.value)}
                    placeholder="Enter the reason for suspension..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows={3}
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
                onClick={() =>
                  handleAction(showActionModal.type, showActionModal.employer.id, actionReason)
                }
                disabled={actionLoading}
                className={`px-4 py-2 text-white rounded-lg flex items-center gap-2 ${
                  showActionModal.type === 'delete'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-yellow-600 hover:bg-yellow-700'
                } disabled:opacity-50`}
              >
                {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {showActionModal.type === 'delete' ? 'Delete' : 'Suspend'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
