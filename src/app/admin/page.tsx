'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  avatar: string | null;
  phone: string | null;
  location: string | null;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  tenant: {
    id: string;
    name: string;
    slug: string;
    isVerified: boolean;
  } | null;
  stats: {
    applications: number;
    savedJobs: number;
  };
}

interface Stats {
  total: number;
  employees: number;
  employers: number;
}

interface ApiError {
  error: string;
  details?: string;
  hint?: string;
  dbConnected?: boolean;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, employees: 0, employers: 0 });
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [apiError, setApiError] = useState<ApiError | null>(null);

  const getAdminToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('jobly_admin_token');
    }
    return null;
  };

  const fetchUsers = useCallback(async () => {
    const token = getAdminToken();
    if (!token) {
      router.push('/admin/login');
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (roleFilter) params.append('role', roleFilter);
      if (searchQuery) params.append('search', searchQuery);
      params.append('page', pagination.page.toString());
      params.append('limit', '20');

      const response = await fetch(`/api/admin/users?${params}`, {
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

      if (!response.ok) {
        setApiError(data);
        setUsers([]);
        setStats({ total: 0, employees: 0, employers: 0 });
      } else {
        setApiError(null);
        setUsers(data.users || []);
        setStats(data.stats || { total: 0, employees: 0, employers: 0 });
        setPagination(data.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 });
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setApiError({
        error: 'Network error',
        details: error instanceof Error ? error.message : 'Failed to connect to API',
      });
    } finally {
      setLoading(false);
    }
  }, [roleFilter, searchQuery, pagination.page, router]);

  useEffect(() => {
    const token = getAdminToken();
    if (!token) {
      router.push('/admin/login');
      return;
    }
    fetchUsers();
  }, [fetchUsers, router]);

  const handleLogout = () => {
    localStorage.removeItem('jobly_admin_token');
    localStorage.removeItem('jobly_admin');
    router.push('/admin/login');
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    const token = getAdminToken();
    if (!token) return;

    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setShowDeleteModal(false);
        setSelectedUser(null);
        fetchUsers();
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateUser = async (updates: Partial<User>) => {
    if (!selectedUser) return;

    const token = getAdminToken();
    if (!token) return;

    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        setShowEditModal(false);
        setSelectedUser(null);
        fetchUsers();
      }
    } catch (error) {
      console.error('Error updating user:', error);
    } finally {
      setActionLoading(false);
    }
  };

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
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Jobly Admin</h1>
                <p className="text-xs text-slate-400">Super Admin Panel</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/admin/jobs"
                className="px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              >
                Jobs
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Total Users</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Job Seekers</p>
                <p className="text-2xl font-bold text-white">{stats.employees}</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Employers</p>
                <p className="text-2xl font-bold text-white">{stats.employers}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Database Error Warning */}
        {apiError && (
          <div className="bg-red-900/30 border border-red-700 rounded-xl p-4 mb-6">
            <div className="flex gap-3">
              <svg className="w-6 h-6 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="font-medium text-red-300">{apiError.error}</p>
                {apiError.details && <p className="text-sm text-red-400 mt-1">{apiError.details}</p>}
                {apiError.hint && <p className="text-sm text-red-400/80 mt-2">{apiError.hint}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Info about localStorage users */}
        {!apiError && stats.total === 0 && !loading && (
          <div className="bg-yellow-900/30 border border-yellow-700 rounded-xl p-4 mb-6">
            <div className="flex gap-3">
              <svg className="w-6 h-6 text-yellow-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-medium text-yellow-300">No users in database</p>
                <p className="text-sm text-yellow-400 mt-1">
                  Users who registered while the database was unavailable are stored in localStorage (browser-only)
                  and won&apos;t appear here. Only users with successful API registrations will show up in this panel.
                </p>
                <p className="text-sm text-yellow-400/80 mt-2">
                  To fix this, ensure the DATABASE_URL environment variable is properly configured in your deployment.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-slate-800 rounded-xl p-4 mb-6 border border-slate-700">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">All Users</option>
              <option value="employee">Job Seekers</option>
              <option value="employer">Employers</option>
            </select>
            <button
              onClick={() => fetchUsers()}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
            >
              Search
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-700/50">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Company</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                      Loading users...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center text-white font-medium">
                            {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{user.name || 'No name'}</p>
                            <p className="text-xs text-slate-400">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${
                          user.role === 'employer'
                            ? 'bg-purple-900/50 text-purple-300'
                            : 'bg-green-900/50 text-green-300'
                        }`}>
                          {user.role === 'employer' ? 'Employer' : 'Job Seeker'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {user.tenant ? (
                          <div>
                            <p className="text-sm text-white">{user.tenant.name}</p>
                            {user.tenant.isVerified && (
                              <span className="text-xs text-blue-400">Verified</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-slate-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${
                          user.isActive
                            ? 'bg-green-900/50 text-green-300'
                            : 'bg-red-900/50 text-red-300'
                        }`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/users/${user.id}`}
                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-600 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </Link>
                          <button
                            onClick={() => { setSelectedUser(user); setShowEditModal(true); }}
                            className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-600 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => { setSelectedUser(user); setShowDeleteModal(true); }}
                            className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-600 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
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
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} users
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

      {/* Delete Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl max-w-md w-full p-6 border border-slate-700">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Delete User</h3>
              <p className="text-slate-400 mb-6">
                Are you sure you want to delete <span className="text-white font-medium">{selectedUser.name || selectedUser.email}</span>? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => { setShowDeleteModal(false); setSelectedUser(null); }}
                  className="flex-1 px-4 py-2.5 bg-slate-700 text-slate-300 font-medium rounded-lg hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteUser}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {actionLoading ? 'Deleting...' : 'Delete User'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedUser && (
        <EditUserModal
          user={selectedUser}
          onClose={() => { setShowEditModal(false); setSelectedUser(null); }}
          onSave={handleUpdateUser}
          isLoading={actionLoading}
        />
      )}
    </div>
  );
}

// Edit User Modal Component
function EditUserModal({
  user,
  onClose,
  onSave,
  isLoading,
}: {
  user: User;
  onClose: () => void;
  onSave: (updates: Partial<User>) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email,
    phone: user.phone || '',
    location: user.location || '',
    isActive: user.isActive,
  });

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl max-w-lg w-full p-6 border border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Edit User</h3>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Phone</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-red-600 focus:ring-red-500"
            />
            <label htmlFor="isActive" className="text-sm text-slate-300">Account Active</label>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-slate-700 text-slate-300 font-medium rounded-lg hover:bg-slate-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(formData)}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
