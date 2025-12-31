'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface SettingsData {
  email: string;
  phone: string;
  companyName: string;
  notifications: {
    newApplications: boolean;
    applicationUpdates: boolean;
    interviewReminders: boolean;
    weeklySummary: boolean;
    marketingEmails: boolean;
  };
}

export default function EmployerSettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('account');
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<SettingsData>({
    email: '',
    phone: '',
    companyName: '',
    notifications: {
      newApplications: true,
      applicationUpdates: true,
      interviewReminders: true,
      weeklySummary: false,
      marketingEmails: false,
    },
  });

  // Load settings from localStorage
  useEffect(() => {
    if (user?.id) {
      try {
        const saved = localStorage.getItem(`jobly_settings_${user.id}`);
        if (saved) {
          setSettings(JSON.parse(saved));
        } else {
          // Initialize with user data
          setSettings(prev => ({
            ...prev,
            email: user.email || '',
            companyName: user.tenantName || '',
          }));
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
  }, [user?.id, user?.email, user?.tenantName]);

  const tabs = [
    { id: 'account', label: 'Account' },
    { id: 'notifications', label: 'Notifications' },
  ];

  const handleSave = async () => {
    setIsSaving(true);
    if (user?.id) {
      localStorage.setItem(`jobly_settings_${user.id}`, JSON.stringify(settings));
    }
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsSaving(false);
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-600 mt-1">Manage your account and preferences</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 mb-6">
        <nav className="flex gap-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Account Settings */}
      {activeTab === 'account' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Account Information</h2>
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={settings.email}
                    onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                    placeholder="your@email.com"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={settings.phone}
                    onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                    placeholder="+63 917 123 4567"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Company Name</label>
                <input
                  type="text"
                  value={settings.companyName}
                  onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                  placeholder="Your Company Name"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Change Password</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Current Password</label>
                <input
                  type="password"
                  placeholder="Enter current password"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">New Password</label>
                  <input
                    type="password"
                    placeholder="Enter new password"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}

      {/* Notifications Settings */}
      {activeTab === 'notifications' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Email Notifications</h2>
          <div className="space-y-4">
            {[
              { key: 'newApplications', label: 'New applications', description: 'Get notified when someone applies to your jobs' },
              { key: 'applicationUpdates', label: 'Application updates', description: 'When candidates update their application status' },
              { key: 'interviewReminders', label: 'Interview reminders', description: 'Reminders before scheduled interviews' },
              { key: 'weeklySummary', label: 'Weekly summary', description: 'Weekly report of your hiring activity' },
              { key: 'marketingEmails', label: 'Marketing emails', description: 'Tips and best practices for hiring' },
            ].map((item) => (
              <label key={item.key} className="flex items-start gap-4 p-4 rounded-lg hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications[item.key as keyof typeof settings.notifications]}
                  onChange={(e) => setSettings({
                    ...settings,
                    notifications: {
                      ...settings.notifications,
                      [item.key]: e.target.checked,
                    },
                  })}
                  className="mt-1 w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                />
                <div>
                  <p className="font-medium text-slate-900">{item.label}</p>
                  <p className="text-sm text-slate-500">{item.description}</p>
                </div>
              </label>
            ))}
          </div>
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
