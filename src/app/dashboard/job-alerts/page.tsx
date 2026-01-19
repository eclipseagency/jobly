'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Bell,
  Plus,
  Trash2,
  Edit,
  ToggleLeft,
  ToggleRight,
  Search,
  MapPin,
  Briefcase,
  DollarSign,
  Clock,
  ChevronRight,
  X,
  Check,
  AlertCircle,
  Loader2,
} from 'lucide-react';

interface JobAlert {
  id: string;
  name: string;
  keywords: string[];
  locations: string[];
  jobTypes: string[];
  salaryMin: number | null;
  salaryMax: number | null;
  remoteOnly: boolean;
  industries: string[];
  experienceLevel: string | null;
  frequency: string;
  emailEnabled: boolean;
  isActive: boolean;
  lastSentAt: string | null;
  lastJobCount: number;
  createdAt: string;
}

interface MatchingJob {
  id: string;
  title: string;
  location: string | null;
  locationType: string | null;
  salary: string | null;
  jobType: string | null;
  createdAt: string;
  company: {
    id: string;
    name: string;
    logo: string | null;
    city: string | null;
    isVerified: boolean;
  };
  applicationCount: number;
  matchScore: number;
  matchReasons: string[];
}

const frequencyOptions = [
  { value: 'instant', label: 'Instant', description: 'Get notified immediately' },
  { value: 'daily', label: 'Daily', description: 'Once per day digest' },
  { value: 'weekly', label: 'Weekly', description: 'Once per week digest' },
];

const jobTypeOptions = [
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
  { value: 'freelance', label: 'Freelance' },
];

const defaultFormData = {
  name: '',
  keywords: [] as string[],
  locations: [] as string[],
  jobTypes: [] as string[],
  salaryMin: '',
  salaryMax: '',
  remoteOnly: false,
  frequency: 'daily',
  emailEnabled: true,
};

export default function JobAlertsPage() {
  const router = useRouter();
  const { user, isLoggedIn } = useAuth();
  const [alerts, setAlerts] = useState<JobAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMatchesModal, setShowMatchesModal] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<JobAlert | null>(null);
  const [matchingJobs, setMatchingJobs] = useState<MatchingJob[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [formData, setFormData] = useState(defaultFormData);
  const [keywordInput, setKeywordInput] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/auth/employee/login');
    }
  }, [isLoggedIn, router]);

  // Fetch alerts
  useEffect(() => {
    async function fetchAlerts() {
      if (!user?.id) return;
      try {
        const response = await fetch('/api/employee/job-alerts', {
          headers: { 'x-user-id': user.id },
        });
        if (response.ok) {
          const data = await response.json();
          setAlerts(data.alerts || []);
        }
      } catch (err) {
        console.error('Error fetching alerts:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchAlerts();
  }, [user?.id]);

  // Add keyword
  const addKeyword = () => {
    if (keywordInput.trim() && !formData.keywords.includes(keywordInput.trim())) {
      setFormData(prev => ({
        ...prev,
        keywords: [...prev.keywords, keywordInput.trim()],
      }));
      setKeywordInput('');
    }
  };

  // Remove keyword
  const removeKeyword = (keyword: string) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword),
    }));
  };

  // Add location
  const addLocation = () => {
    if (locationInput.trim() && !formData.locations.includes(locationInput.trim())) {
      setFormData(prev => ({
        ...prev,
        locations: [...prev.locations, locationInput.trim()],
      }));
      setLocationInput('');
    }
  };

  // Remove location
  const removeLocation = (location: string) => {
    setFormData(prev => ({
      ...prev,
      locations: prev.locations.filter(l => l !== location),
    }));
  };

  // Toggle job type
  const toggleJobType = (jobType: string) => {
    setFormData(prev => ({
      ...prev,
      jobTypes: prev.jobTypes.includes(jobType)
        ? prev.jobTypes.filter(jt => jt !== jobType)
        : [...prev.jobTypes, jobType],
    }));
  };

  // Create alert
  const handleCreate = async () => {
    if (!user?.id || !formData.name.trim()) {
      setError('Alert name is required');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const response = await fetch('/api/employee/job-alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setAlerts(prev => [data.alert, ...prev]);
        setShowCreateModal(false);
        setFormData(defaultFormData);
      } else {
        setError(data.error || 'Failed to create alert');
      }
    } catch (err) {
      console.error('Error creating alert:', err);
      setError('Failed to create alert');
    } finally {
      setSaving(false);
    }
  };

  // Update alert
  const handleUpdate = async () => {
    if (!user?.id || !selectedAlert) return;

    setSaving(true);
    setError('');

    try {
      const response = await fetch('/api/employee/job-alerts', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify({ id: selectedAlert.id, ...formData }),
      });

      const data = await response.json();

      if (response.ok) {
        setAlerts(prev => prev.map(a => a.id === selectedAlert.id ? data.alert : a));
        setShowEditModal(false);
        setSelectedAlert(null);
        setFormData(defaultFormData);
      } else {
        setError(data.error || 'Failed to update alert');
      }
    } catch (err) {
      console.error('Error updating alert:', err);
      setError('Failed to update alert');
    } finally {
      setSaving(false);
    }
  };

  // Toggle alert active status
  const toggleAlertActive = async (alert: JobAlert) => {
    if (!user?.id) return;

    try {
      const response = await fetch('/api/employee/job-alerts', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify({ id: alert.id, isActive: !alert.isActive }),
      });

      if (response.ok) {
        const data = await response.json();
        setAlerts(prev => prev.map(a => a.id === alert.id ? data.alert : a));
      }
    } catch (err) {
      console.error('Error toggling alert:', err);
    }
  };

  // Delete alert
  const handleDelete = async (alertId: string) => {
    if (!user?.id || !confirm('Are you sure you want to delete this alert?')) return;

    try {
      const response = await fetch(`/api/employee/job-alerts?id=${alertId}`, {
        method: 'DELETE',
        headers: { 'x-user-id': user.id },
      });

      if (response.ok) {
        setAlerts(prev => prev.filter(a => a.id !== alertId));
      }
    } catch (err) {
      console.error('Error deleting alert:', err);
    }
  };

  // Open edit modal
  const openEditModal = (alert: JobAlert) => {
    setSelectedAlert(alert);
    setFormData({
      name: alert.name,
      keywords: alert.keywords || [],
      locations: alert.locations || [],
      jobTypes: alert.jobTypes || [],
      salaryMin: alert.salaryMin?.toString() || '',
      salaryMax: alert.salaryMax?.toString() || '',
      remoteOnly: alert.remoteOnly,
      frequency: alert.frequency,
      emailEnabled: alert.emailEnabled,
    });
    setShowEditModal(true);
  };

  // View matching jobs
  const viewMatchingJobs = async (alert: JobAlert) => {
    if (!user?.id) return;

    setSelectedAlert(alert);
    setShowMatchesModal(true);
    setLoadingMatches(true);

    try {
      const response = await fetch(`/api/employee/job-alerts/matches?alertId=${alert.id}`, {
        headers: { 'x-user-id': user.id },
      });

      if (response.ok) {
        const data = await response.json();
        setMatchingJobs(data.jobs || []);
      }
    } catch (err) {
      console.error('Error fetching matches:', err);
    } finally {
      setLoadingMatches(false);
    }
  };

  // Format date
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Job Alerts</h1>
            <p className="text-slate-600 mt-1">
              Get notified when new jobs match your preferences
            </p>
          </div>
          <button
            onClick={() => {
              setFormData(defaultFormData);
              setShowCreateModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            Create Alert
          </button>
        </div>

        {/* Alerts List */}
        {loading ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8">
            <div className="flex items-center justify-center gap-3 text-slate-500">
              <Loader2 className="w-5 h-5 animate-spin" />
              Loading alerts...
            </div>
          </div>
        ) : alerts.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No job alerts yet</h3>
            <p className="text-slate-600 mb-6">
              Create your first job alert to receive notifications when new jobs match your criteria.
            </p>
            <button
              onClick={() => {
                setFormData(defaultFormData);
                setShowCreateModal(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              Create Your First Alert
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map(alert => (
              <div
                key={alert.id}
                className={`bg-white rounded-xl border shadow-sm transition-all ${
                  alert.isActive ? 'border-slate-200' : 'border-slate-200 opacity-60'
                }`}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-slate-900">{alert.name}</h3>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          alert.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {alert.isActive ? 'Active' : 'Paused'}
                        </span>
                      </div>

                      {/* Alert criteria */}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {alert.keywords?.map(keyword => (
                          <span key={keyword} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                            <Search className="w-3 h-3" />
                            {keyword}
                          </span>
                        ))}
                        {alert.locations?.map(location => (
                          <span key={location} className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded text-xs">
                            <MapPin className="w-3 h-3" />
                            {location}
                          </span>
                        ))}
                        {alert.jobTypes?.map(jobType => (
                          <span key={jobType} className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs">
                            <Briefcase className="w-3 h-3" />
                            {jobType}
                          </span>
                        ))}
                        {alert.remoteOnly && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-cyan-50 text-cyan-700 rounded text-xs">
                            Remote only
                          </span>
                        )}
                        {(alert.salaryMin || alert.salaryMax) && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 rounded text-xs">
                            <DollarSign className="w-3 h-3" />
                            {alert.salaryMin && `₱${alert.salaryMin.toLocaleString()}`}
                            {alert.salaryMin && alert.salaryMax && ' - '}
                            {alert.salaryMax && `₱${alert.salaryMax.toLocaleString()}`}
                          </span>
                        )}
                      </div>

                      {/* Meta info */}
                      <div className="mt-3 flex items-center gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {alert.frequency === 'instant' ? 'Instant' : alert.frequency === 'daily' ? 'Daily' : 'Weekly'}
                        </span>
                        <span>Created {formatDate(alert.createdAt)}</span>
                        {alert.lastJobCount > 0 && (
                          <span className="text-blue-600">{alert.lastJobCount} matches</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => viewMatchingJobs(alert)}
                        className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View matching jobs"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => toggleAlertActive(alert)}
                        className={`p-2 rounded-lg transition-colors ${
                          alert.isActive
                            ? 'text-green-600 hover:bg-green-50'
                            : 'text-slate-400 hover:bg-slate-100'
                        }`}
                        title={alert.isActive ? 'Pause alert' : 'Activate alert'}
                      >
                        {alert.isActive ? (
                          <ToggleRight className="w-5 h-5" />
                        ) : (
                          <ToggleLeft className="w-5 h-5" />
                        )}
                      </button>
                      <button
                        onClick={() => openEditModal(alert)}
                        className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit alert"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(alert.id)}
                        className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete alert"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create/Edit Modal */}
        {(showCreateModal || showEditModal) && (
          <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-900">
                    {showEditModal ? 'Edit Job Alert' : 'Create Job Alert'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      setShowEditModal(false);
                      setSelectedAlert(null);
                      setFormData(defaultFormData);
                      setError('');
                    }}
                    className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}

                {/* Alert Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Alert Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Frontend Developer Jobs"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Keywords */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Job Keywords
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.keywords.map(keyword => (
                      <span key={keyword} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                        {keyword}
                        <button onClick={() => removeKeyword(keyword)} className="hover:text-blue-900">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={keywordInput}
                      onChange={e => setKeywordInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                      placeholder="Add keyword..."
                      className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={addKeyword}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Locations */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Locations
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.locations.map(location => (
                      <span key={location} className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-sm">
                        {location}
                        <button onClick={() => removeLocation(location)} className="hover:text-green-900">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={locationInput}
                      onChange={e => setLocationInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addLocation())}
                      placeholder="Add location..."
                      className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={addLocation}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Job Types */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Job Types
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {jobTypeOptions.map(option => (
                      <button
                        key={option.value}
                        onClick={() => toggleJobType(option.value)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          formData.jobTypes.includes(option.value)
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Remote Only */}
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.remoteOnly}
                    onChange={e => setFormData(prev => ({ ...prev, remoteOnly: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700">Only show remote jobs</span>
                </label>

                {/* Salary Range */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Salary Range (PHP)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      value={formData.salaryMin}
                      onChange={e => setFormData(prev => ({ ...prev, salaryMin: e.target.value }))}
                      placeholder="Min"
                      className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-slate-400">to</span>
                    <input
                      type="number"
                      value={formData.salaryMax}
                      onChange={e => setFormData(prev => ({ ...prev, salaryMax: e.target.value }))}
                      placeholder="Max"
                      className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Frequency */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Notification Frequency
                  </label>
                  <div className="space-y-2">
                    {frequencyOptions.map(option => (
                      <label
                        key={option.value}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                          formData.frequency === option.value
                            ? 'bg-blue-50 border border-blue-200'
                            : 'bg-slate-50 border border-transparent hover:bg-slate-100'
                        }`}
                      >
                        <input
                          type="radio"
                          name="frequency"
                          value={option.value}
                          checked={formData.frequency === option.value}
                          onChange={e => setFormData(prev => ({ ...prev, frequency: e.target.value }))}
                          className="w-4 h-4 text-blue-600"
                        />
                        <div>
                          <div className="font-medium text-slate-900 text-sm">{option.label}</div>
                          <div className="text-xs text-slate-500">{option.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Email Enabled */}
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.emailEnabled}
                    onChange={e => setFormData(prev => ({ ...prev, emailEnabled: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700">Send email notifications</span>
                </label>
              </div>

              <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                    setSelectedAlert(null);
                    setFormData(defaultFormData);
                    setError('');
                  }}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={showEditModal ? handleUpdate : handleCreate}
                  disabled={saving || !formData.name.trim()}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {showEditModal ? 'Save Changes' : 'Create Alert'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Matching Jobs Modal */}
        {showMatchesModal && selectedAlert && (
          <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Matching Jobs</h2>
                    <p className="text-sm text-slate-500 mt-1">
                      Jobs matching &quot;{selectedAlert.name}&quot;
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowMatchesModal(false);
                      setSelectedAlert(null);
                      setMatchingJobs([]);
                    }}
                    className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {loadingMatches ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  </div>
                ) : matchingJobs.length === 0 ? (
                  <div className="text-center py-12">
                    <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="font-medium text-slate-900 mb-2">No matching jobs found</h3>
                    <p className="text-sm text-slate-500">
                      Try adjusting your alert criteria to find more jobs.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {matchingJobs.map(job => (
                      <Link
                        key={job.id}
                        href={`/jobs/${job.id}`}
                        className="block bg-slate-50 hover:bg-slate-100 rounded-lg p-4 transition-colors"
                      >
                        <div className="flex items-start gap-4">
                          {job.company.logo ? (
                            <img
                              src={job.company.logo}
                              alt={job.company.name}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                              <Briefcase className="w-6 h-6 text-blue-600" />
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <h3 className="font-semibold text-slate-900">{job.title}</h3>
                                <p className="text-sm text-slate-600">
                                  {job.company.name}
                                  {job.company.isVerified && (
                                    <Check className="inline w-4 h-4 text-blue-600 ml-1" />
                                  )}
                                </p>
                              </div>
                              <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                                {job.matchScore}% match
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-slate-500">
                              {job.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  {job.location}
                                </span>
                              )}
                              {job.jobType && (
                                <span className="flex items-center gap-1">
                                  <Briefcase className="w-4 h-4" />
                                  {job.jobType}
                                </span>
                              )}
                              {job.salary && (
                                <span className="flex items-center gap-1">
                                  <DollarSign className="w-4 h-4" />
                                  {job.salary}
                                </span>
                              )}
                            </div>
                            {job.matchReasons.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {job.matchReasons.map((reason, i) => (
                                  <span key={i} className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                                    {reason}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
