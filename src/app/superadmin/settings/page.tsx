'use client';

import { useEffect, useState } from 'react';
import {
  Settings,
  Save,
  RefreshCw,
  CheckCircle,
  Shield,
  Clock,
  Briefcase,
  Users,
  Building2,
  Bell,
  Loader2,
  AlertTriangle,
  Zap,
  Database,
  Server,
  Activity,
} from 'lucide-react';

interface SystemSettings {
  requireJobApproval: boolean;
  requireEmployerVerification: boolean;
  maxJobsPerEmployer: number;
  maxApplicationsPerUser: number;
  featuredJobDurationDays: number;
  autoExpireJobsDays: number;
  allowPublicJobPosting: boolean;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  emailNotifications: boolean;
  slackWebhookUrl: string;
}

interface SystemStats {
  totalUsers: number;
  totalEmployers: number;
  totalJobs: number;
  totalApplications: number;
  pendingJobs: number;
  unverifiedEmployers: number;
  suspendedUsers: number;
  suspendedEmployers: number;
}

interface EnvironmentInfo {
  nodeEnv: string;
  databaseConnected: boolean;
  version: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [environment, setEnvironment] = useState<EnvironmentInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('superadmin_token');
      const response = await fetch('/api/superadmin/settings', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch settings');

      const data = await response.json();
      setSettings(data.settings);
      setStats(data.stats);
      setEnvironment(data.environment);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const saveSettings = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const token = localStorage.getItem('superadmin_token');
      const response = await fetch('/api/superadmin/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) throw new Error('Failed to save settings');

      setSuccessMessage('Settings saved successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  const executeAction = async (action: string) => {
    setActionLoading(action);
    try {
      const token = localStorage.getItem('superadmin_token');
      const response = await fetch('/api/superadmin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Action failed');
      }

      const data = await response.json();
      setSuccessMessage(data.message);
      setTimeout(() => setSuccessMessage(''), 3000);
      await fetchSettings();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const updateSetting = (key: keyof SystemSettings, value: any) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          {successMessage}
        </div>
      )}

      {/* System Status */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Server className="w-5 h-5" />
          System Status
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Activity className={`w-4 h-4 ${environment?.databaseConnected ? 'text-green-500' : 'text-red-500'}`} />
              <span className="text-sm font-medium">Database</span>
            </div>
            <p className={`text-lg font-semibold ${environment?.databaseConnected ? 'text-green-600' : 'text-red-600'}`}>
              {environment?.databaseConnected ? 'Connected' : 'Disconnected'}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Server className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium">Environment</span>
            </div>
            <p className="text-lg font-semibold text-gray-900">{environment?.nodeEnv}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Database className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium">Version</span>
            </div>
            <p className="text-lg font-semibold text-gray-900">{environment?.version}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Shield className={`w-4 h-4 ${settings?.maintenanceMode ? 'text-yellow-500' : 'text-green-500'}`} />
              <span className="text-sm font-medium">Status</span>
            </div>
            <p className={`text-lg font-semibold ${settings?.maintenanceMode ? 'text-yellow-600' : 'text-green-600'}`}>
              {settings?.maintenanceMode ? 'Maintenance' : 'Online'}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Platform Statistics
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <Users className="w-6 h-6 text-blue-600 mb-2" />
            <p className="text-2xl font-bold text-gray-900">{stats?.totalUsers}</p>
            <p className="text-sm text-gray-500">Total Users</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <Building2 className="w-6 h-6 text-purple-600 mb-2" />
            <p className="text-2xl font-bold text-gray-900">{stats?.totalEmployers}</p>
            <p className="text-sm text-gray-500">Employers</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <Briefcase className="w-6 h-6 text-green-600 mb-2" />
            <p className="text-2xl font-bold text-gray-900">{stats?.totalJobs}</p>
            <p className="text-sm text-gray-500">Total Jobs</p>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg">
            <Clock className="w-6 h-6 text-orange-600 mb-2" />
            <p className="text-2xl font-bold text-gray-900">{stats?.pendingJobs}</p>
            <p className="text-sm text-gray-500">Pending Jobs</p>
          </div>
        </div>
      </div>

      {/* Job Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Briefcase className="w-5 h-5" />
          Job Settings
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Require Job Approval</p>
              <p className="text-sm text-gray-500">Jobs must be approved before going live</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings?.requireJobApproval ?? true}
                onChange={(e) => updateSetting('requireJobApproval', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Allow Public Job Posting</p>
              <p className="text-sm text-gray-500">Allow employers to post jobs without verification</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings?.allowPublicJobPosting ?? true}
                onChange={(e) => updateSetting('allowPublicJobPosting', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Jobs Per Employer
              </label>
              <input
                type="number"
                value={settings?.maxJobsPerEmployer ?? 50}
                onChange={(e) => updateSetting('maxJobsPerEmployer', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Auto-Expire Jobs After (Days)
              </label>
              <input
                type="number"
                value={settings?.autoExpireJobsDays ?? 30}
                onChange={(e) => updateSetting('autoExpireJobsDays', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Featured Job Duration (Days)
              </label>
              <input
                type="number"
                value={settings?.featuredJobDurationDays ?? 7}
                onChange={(e) => updateSetting('featuredJobDurationDays', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Applications Per User
              </label>
              <input
                type="number"
                value={settings?.maxApplicationsPerUser ?? 100}
                onChange={(e) => updateSetting('maxApplicationsPerUser', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Employer Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          Employer Settings
        </h3>
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium text-gray-900">Require Employer Verification</p>
            <p className="text-sm text-gray-500">Employers must be verified before posting jobs</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings?.requireEmployerVerification ?? false}
              onChange={(e) => updateSetting('requireEmployerVerification', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>
      </div>

      {/* Notifications Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notification Settings
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Email Notifications</p>
              <p className="text-sm text-gray-500">Send email notifications for important events</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings?.emailNotifications ?? true}
                onChange={(e) => updateSetting('emailNotifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Slack Webhook URL
            </label>
            <input
              type="url"
              value={settings?.slackWebhookUrl ?? ''}
              onChange={(e) => updateSetting('slackWebhookUrl', e.target.value)}
              placeholder="https://hooks.slack.com/services/..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Maintenance Mode */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Maintenance Mode
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Enable Maintenance Mode</p>
              <p className="text-sm text-gray-500">Put the platform in maintenance mode</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings?.maintenanceMode ?? false}
                onChange={(e) => updateSetting('maintenanceMode', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600"></div>
            </label>
          </div>
          {settings?.maintenanceMode && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maintenance Message
              </label>
              <textarea
                value={settings?.maintenanceMessage ?? ''}
                onChange={(e) => updateSetting('maintenanceMessage', e.target.value)}
                placeholder="We're currently performing maintenance. Please check back later."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows={3}
              />
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <button
            onClick={() => executeAction('approve_all_pending_jobs')}
            disabled={actionLoading !== null}
            className="p-4 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg text-left transition disabled:opacity-50"
          >
            <div className="flex items-center gap-2 mb-2">
              {actionLoading === 'approve_all_pending_jobs' ? (
                <Loader2 className="w-5 h-5 text-green-600 animate-spin" />
              ) : (
                <CheckCircle className="w-5 h-5 text-green-600" />
              )}
              <span className="font-medium text-gray-900">Approve All Jobs</span>
            </div>
            <p className="text-sm text-gray-500">Approve all pending job listings</p>
          </button>
          <button
            onClick={() => executeAction('verify_all_employers')}
            disabled={actionLoading !== null}
            className="p-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-left transition disabled:opacity-50"
          >
            <div className="flex items-center gap-2 mb-2">
              {actionLoading === 'verify_all_employers' ? (
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
              ) : (
                <Shield className="w-5 h-5 text-blue-600" />
              )}
              <span className="font-medium text-gray-900">Verify All Employers</span>
            </div>
            <p className="text-sm text-gray-500">Verify all unverified employers</p>
          </button>
          <button
            onClick={() => executeAction('expire_old_jobs')}
            disabled={actionLoading !== null}
            className="p-4 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg text-left transition disabled:opacity-50"
          >
            <div className="flex items-center gap-2 mb-2">
              {actionLoading === 'expire_old_jobs' ? (
                <Loader2 className="w-5 h-5 text-orange-600 animate-spin" />
              ) : (
                <Clock className="w-5 h-5 text-orange-600" />
              )}
              <span className="font-medium text-gray-900">Expire Old Jobs</span>
            </div>
            <p className="text-sm text-gray-500">Deactivate jobs older than {settings?.autoExpireJobsDays || 30} days</p>
          </button>
          <button
            onClick={() => executeAction('cleanup_expired_features')}
            disabled={actionLoading !== null}
            className="p-4 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg text-left transition disabled:opacity-50"
          >
            <div className="flex items-center gap-2 mb-2">
              {actionLoading === 'cleanup_expired_features' ? (
                <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
              ) : (
                <RefreshCw className="w-5 h-5 text-purple-600" />
              )}
              <span className="font-medium text-gray-900">Cleanup Features</span>
            </div>
            <p className="text-sm text-gray-500">Remove expired featured badges</p>
          </button>
          <button
            onClick={() => executeAction('unsuspend_all_users')}
            disabled={actionLoading !== null}
            className="p-4 bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 rounded-lg text-left transition disabled:opacity-50"
          >
            <div className="flex items-center gap-2 mb-2">
              {actionLoading === 'unsuspend_all_users' ? (
                <Loader2 className="w-5 h-5 text-yellow-600 animate-spin" />
              ) : (
                <Users className="w-5 h-5 text-yellow-600" />
              )}
              <span className="font-medium text-gray-900">Unsuspend All</span>
            </div>
            <p className="text-sm text-gray-500">Unsuspend all suspended users</p>
          </button>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-4">
        <button
          onClick={fetchSettings}
          disabled={saving}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Reset
        </button>
        <button
          onClick={saveSettings}
          disabled={saving}
          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save Settings
        </button>
      </div>
    </div>
  );
}
