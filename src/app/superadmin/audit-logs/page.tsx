'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Shield,
  User,
  Clock,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle,
  Loader2,
  Download,
  RefreshCw,
} from 'lucide-react';

interface AuditLog {
  id: string;
  actorType: string;
  actorId: string | null;
  actorEmail: string | null;
  actorName: string | null;
  action: string;
  resource: string;
  resourceId: string | null;
  description: string | null;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  category: string | null;
  severity: string;
  createdAt: string;
}

const severityConfig = {
  info: { icon: Info, color: 'text-blue-600', bg: 'bg-blue-50' },
  warning: { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
  error: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
  critical: { icon: AlertCircle, color: 'text-red-700', bg: 'bg-red-100' },
};

const categoryLabels: Record<string, string> = {
  authentication: 'Authentication',
  data_modification: 'Data Modification',
  admin_action: 'Admin Action',
  security: 'Security',
  system: 'System',
};

export default function AuditLogsPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    action: '',
    resource: '',
    severity: '',
    category: '',
    search: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('superadmin_token');
    if (!token) {
      router.push('/superadmin/login');
    }
  }, [router]);

  // Fetch logs
  useEffect(() => {
    fetchLogs();
  }, [page, filters]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('superadmin_token');
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
      });

      if (filters.action) params.set('action', filters.action);
      if (filters.resource) params.set('resource', filters.resource);
      if (filters.severity) params.set('severity', filters.severity);
      if (filters.category) params.set('category', filters.category);
      if (filters.search) params.set('search', filters.search);

      const response = await fetch(`/api/superadmin/audit-logs?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs || []);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const exportLogs = async () => {
    const token = localStorage.getItem('superadmin_token');
    try {
      const response = await fetch('/api/superadmin/audit-logs?export=true', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data.logs, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
      }
    } catch (err) {
      console.error('Error exporting logs:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Shield className="w-6 h-6" />
              Audit Logs
            </h1>
            <p className="text-slate-600 mt-1">
              Track all system activities and admin actions
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchLogs}
              className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={exportLogs}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-6">
          <div className="p-4 flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={filters.search}
                onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
                placeholder="Search logs..."
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                showFilters ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>

          {showFilters && (
            <div className="p-4 pt-0 grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Action</label>
                <select
                  value={filters.action}
                  onChange={e => setFilters(prev => ({ ...prev, action: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                >
                  <option value="">All Actions</option>
                  <option value="login_success">Login Success</option>
                  <option value="login_failed">Login Failed</option>
                  <option value="create">Create</option>
                  <option value="update">Update</option>
                  <option value="delete">Delete</option>
                  <option value="approve">Approve</option>
                  <option value="reject">Reject</option>
                  <option value="suspend">Suspend</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Resource</label>
                <select
                  value={filters.resource}
                  onChange={e => setFilters(prev => ({ ...prev, resource: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                >
                  <option value="">All Resources</option>
                  <option value="user">User</option>
                  <option value="job">Job</option>
                  <option value="application">Application</option>
                  <option value="tenant">Tenant</option>
                  <option value="review">Review</option>
                  <option value="session">Session</option>
                  <option value="security">Security</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Severity</label>
                <select
                  value={filters.severity}
                  onChange={e => setFilters(prev => ({ ...prev, severity: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                >
                  <option value="">All Severities</option>
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select
                  value={filters.category}
                  onChange={e => setFilters(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                >
                  <option value="">All Categories</option>
                  <option value="authentication">Authentication</option>
                  <option value="data_modification">Data Modification</option>
                  <option value="admin_action">Admin Action</option>
                  <option value="security">Security</option>
                  <option value="system">System</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
            </div>
          ) : logs.length === 0 ? (
            <div className="p-12 text-center">
              <Shield className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="font-medium text-slate-900 mb-2">No audit logs found</h3>
              <p className="text-slate-500 text-sm">
                Audit logs will appear here as actions are performed
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                      Time
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                      Actor
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                      Action
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                      Resource
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                      Description
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                      Severity
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {logs.map(log => {
                    const severity = severityConfig[log.severity as keyof typeof severityConfig] || severityConfig.info;
                    const SeverityIcon = severity.icon;

                    return (
                      <tr key={log.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-sm text-slate-500 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            {formatDate(log.createdAt)}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                              <User className="w-4 h-4 text-slate-500" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-900">
                                {log.actorName || log.actorEmail || 'System'}
                              </p>
                              <p className="text-xs text-slate-500 capitalize">{log.actorType}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 text-xs font-medium bg-slate-100 text-slate-700 rounded capitalize">
                            {log.action.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm text-slate-900 capitalize">{log.resource}</p>
                            {log.resourceId && (
                              <p className="text-xs text-slate-400 font-mono">{log.resourceId.slice(0, 8)}...</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-slate-600 max-w-md truncate">
                            {log.description || '-'}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded ${severity.bg} ${severity.color}`}>
                            <SeverityIcon className="w-3 h-3" />
                            {log.severity}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-4 py-3 border-t border-slate-200 flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Page {page} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 hover:bg-slate-100 rounded-lg disabled:opacity-50"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 hover:bg-slate-100 rounded-lg disabled:opacity-50"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
