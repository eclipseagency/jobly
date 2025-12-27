'use client';

import { useState } from 'react';

export default function EmployerSettingsPage() {
  const [activeTab, setActiveTab] = useState('account');
  const [isSaving, setIsSaving] = useState(false);

  const tabs = [
    { id: 'account', label: 'Account' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'team', label: 'Team Members' },
    { id: 'billing', label: 'Billing' },
  ];

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
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
                    defaultValue="hr@techcorp.com"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    defaultValue="+63 917 123 4567"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Company Name</label>
                <input
                  type="text"
                  defaultValue="TechCorp Inc."
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
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">New Password</label>
                  <input
                    type="password"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Confirm New Password</label>
                  <input
                    type="password"
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
              { label: 'New applications', description: 'Get notified when someone applies to your jobs', checked: true },
              { label: 'Application updates', description: 'When candidates update their application status', checked: true },
              { label: 'Interview reminders', description: 'Reminders before scheduled interviews', checked: true },
              { label: 'Weekly summary', description: 'Weekly report of your hiring activity', checked: false },
              { label: 'Marketing emails', description: 'Tips and best practices for hiring', checked: false },
            ].map((item, i) => (
              <label key={i} className="flex items-start gap-4 p-4 rounded-lg hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked={item.checked}
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

      {/* Team Members */}
      {activeTab === 'team' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900">Team Members</h2>
            <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors">
              Invite Member
            </button>
          </div>
          <div className="space-y-4">
            {[
              { name: 'Maria Santos', email: 'maria@techcorp.com', role: 'Admin', avatar: 'MS' },
              { name: 'John Cruz', email: 'john@techcorp.com', role: 'Recruiter', avatar: 'JC' },
              { name: 'Ana Reyes', email: 'ana@techcorp.com', role: 'Hiring Manager', avatar: 'AR' },
            ].map((member, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-lg border border-slate-100">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium">
                  {member.avatar}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{member.name}</p>
                  <p className="text-sm text-slate-500">{member.email}</p>
                </div>
                <span className="px-3 py-1 bg-slate-100 text-slate-600 text-sm rounded-full">
                  {member.role}
                </span>
                <button className="p-2 text-slate-400 hover:text-slate-600">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Billing */}
      {activeTab === 'billing' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Current Plan</h2>
            <div className="flex items-center justify-between p-4 bg-primary-50 rounded-lg">
              <div>
                <p className="font-semibold text-primary-900">Premium Plan</p>
                <p className="text-sm text-primary-700">Unlimited job postings, priority support</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary-900">$99</p>
                <p className="text-sm text-primary-700">/month</p>
              </div>
            </div>
            <button className="mt-4 text-sm text-primary-600 hover:text-primary-700 font-medium">
              Change Plan
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Payment Method</h2>
            <div className="flex items-center gap-4 p-4 border border-slate-200 rounded-lg">
              <div className="w-12 h-8 bg-slate-100 rounded flex items-center justify-center text-slate-400 text-xs font-bold">
                VISA
              </div>
              <div>
                <p className="font-medium text-slate-900">**** **** **** 4242</p>
                <p className="text-sm text-slate-500">Expires 12/2025</p>
              </div>
              <button className="ml-auto text-sm text-primary-600 hover:text-primary-700 font-medium">
                Update
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Billing History</h2>
            <div className="space-y-3">
              {[
                { date: 'Dec 1, 2024', amount: '$99.00', status: 'Paid' },
                { date: 'Nov 1, 2024', amount: '$99.00', status: 'Paid' },
                { date: 'Oct 1, 2024', amount: '$99.00', status: 'Paid' },
              ].map((invoice, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                  <p className="text-slate-900">{invoice.date}</p>
                  <p className="font-medium text-slate-900">{invoice.amount}</p>
                  <span className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full">{invoice.status}</span>
                  <button className="text-sm text-primary-600 hover:text-primary-700">Download</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
