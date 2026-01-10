'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toast';

interface CompanyData {
  name: string;
  tagline: string;
  industry: string;
  companySize: string;
  founded: string;
  website: string;
  email: string;
  phone: string;
  location: string;
  about: string;
  mission: string;
  vision: string;
  culture: string[];
  benefits: string[];
  socialLinks: {
    linkedin: string;
    facebook: string;
  };
}

const defaultCompanyData: CompanyData = {
  name: '',
  tagline: '',
  industry: '',
  companySize: '',
  founded: '',
  website: '',
  email: '',
  phone: '',
  location: '',
  about: '',
  mission: '',
  vision: '',
  culture: [],
  benefits: [],
  socialLinks: {
    linkedin: '',
    facebook: '',
  },
};

export default function CompanyProfilePage() {
  const { user } = useAuth();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [companyData, setCompanyData] = useState<CompanyData>(defaultCompanyData);
  const [newCultureValue, setNewCultureValue] = useState('');
  const [newBenefit, setNewBenefit] = useState('');

  // Fetch company data from API
  const fetchCompanyData = useCallback(async () => {
    if (!user?.tenantId) return;

    try {
      const response = await fetch('/api/employer/company', {
        headers: { 'x-tenant-id': user.tenantId },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch company data');
      }

      const data = await response.json();
      const company = data.company;

      setCompanyData({
        name: company.name || '',
        tagline: company.description || '',
        industry: company.industry || '',
        companySize: company.size || '',
        founded: company.foundedYear?.toString() || '',
        website: company.website || '',
        email: company.email || '',
        phone: company.phone || '',
        location: company.address || '',
        about: company.culture || '',
        mission: company.mission || '',
        vision: company.vision || '',
        culture: [], // Could add a separate cultureValues field later
        benefits: company.benefits || [],
        socialLinks: {
          linkedin: company.linkedinUrl || '',
          facebook: company.facebookUrl || '',
        },
      });
    } catch (error) {
      console.error('Error fetching company data:', error);
      // Initialize with basic data from auth context
      setCompanyData({
        ...defaultCompanyData,
        name: user.tenantName || '',
        email: user.email || '',
      });
    } finally {
      setLoading(false);
    }
  }, [user?.tenantId, user?.tenantName, user?.email]);

  useEffect(() => {
    fetchCompanyData();
  }, [fetchCompanyData]);

  const handleSave = async () => {
    if (!user?.tenantId) return;

    setSaving(true);
    try {
      const response = await fetch('/api/employer/company', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': user.tenantId,
        },
        body: JSON.stringify(companyData),
      });

      if (!response.ok) {
        throw new Error('Failed to save company data');
      }

      toast.success('Company profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving company data:', error);
      toast.error('Failed to save company profile');
    } finally {
      setSaving(false);
    }
  };

  const addCultureValue = () => {
    if (newCultureValue.trim()) {
      setCompanyData({
        ...companyData,
        culture: [...companyData.culture, newCultureValue.trim()],
      });
      setNewCultureValue('');
    }
  };

  const removeCultureValue = (index: number) => {
    setCompanyData({
      ...companyData,
      culture: companyData.culture.filter((_, i) => i !== index),
    });
  };

  const addBenefit = () => {
    if (newBenefit.trim()) {
      setCompanyData({
        ...companyData,
        benefits: [...companyData.benefits, newBenefit.trim()],
      });
      setNewBenefit('');
    }
  };

  const removeBenefit = (index: number) => {
    setCompanyData({
      ...companyData,
      benefits: companyData.benefits.filter((_, i) => i !== index),
    });
  };

  const tabs = [
    { id: 'profile', label: 'Company Profile' },
    { id: 'culture', label: 'Culture & Benefits' },
  ];

  const getInitials = () => {
    if (companyData.name) {
      return companyData.name.substring(0, 2).toUpperCase();
    }
    return user?.tenantName?.substring(0, 2).toUpperCase() || 'CO';
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8 max-w-5xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-48 mb-2" />
          <div className="h-4 bg-slate-200 rounded w-64 mb-8" />
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-6">
            <div className="h-40 bg-slate-200" />
            <div className="p-6">
              <div className="h-24 bg-slate-100 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Company Profile</h1>
        <p className="text-slate-600 mt-1">Manage how your company appears to job seekers</p>
      </div>

      {/* Company Banner */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-6">
        <div className="h-40 bg-gradient-to-r from-primary-600 to-primary-700 relative">
        </div>
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
            <div className="relative">
              <div className="w-24 h-24 rounded-xl bg-white border-4 border-white shadow-lg flex items-center justify-center text-primary-600 font-bold text-3xl">
                {getInitials()}
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-900">
                {companyData.name || user?.tenantName || 'Your Company'}
              </h2>
              <p className="text-slate-600">{companyData.tagline || 'Add a tagline to describe your company'}</p>
            </div>
            <button
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              disabled={saving}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Edit Profile'}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 mb-6">
        <div className="flex gap-6 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Basic Information</h3>
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Company Name</label>
                <input
                  type="text"
                  value={companyData.name}
                  onChange={(e) => setCompanyData({ ...companyData, name: e.target.value })}
                  disabled={!isEditing}
                  placeholder="Enter company name"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-slate-900 disabled:bg-slate-50 disabled:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Industry</label>
                <select
                  value={companyData.industry}
                  onChange={(e) => setCompanyData({ ...companyData, industry: e.target.value })}
                  disabled={!isEditing}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-slate-900 disabled:bg-slate-50 disabled:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                >
                  <option value="">Select industry</option>
                  <option>Information Technology</option>
                  <option>Financial Services</option>
                  <option>Healthcare</option>
                  <option>Education</option>
                  <option>Manufacturing</option>
                  <option>Retail</option>
                  <option>Consulting</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Company Size</label>
                <select
                  value={companyData.companySize}
                  onChange={(e) => setCompanyData({ ...companyData, companySize: e.target.value })}
                  disabled={!isEditing}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-slate-900 disabled:bg-slate-50 disabled:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                >
                  <option value="">Select size</option>
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201-500">201-500 employees</option>
                  <option value="501-1000">501-1000 employees</option>
                  <option value="1000+">1000+ employees</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Founded Year</label>
                <input
                  type="text"
                  value={companyData.founded}
                  onChange={(e) => setCompanyData({ ...companyData, founded: e.target.value })}
                  disabled={!isEditing}
                  placeholder="e.g., 2020"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-slate-900 disabled:bg-slate-50 disabled:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Website</label>
                <input
                  type="url"
                  value={companyData.website}
                  onChange={(e) => setCompanyData({ ...companyData, website: e.target.value })}
                  disabled={!isEditing}
                  placeholder="https://yourcompany.com"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-slate-900 disabled:bg-slate-50 disabled:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                <input
                  type="email"
                  value={companyData.email}
                  onChange={(e) => setCompanyData({ ...companyData, email: e.target.value })}
                  disabled={!isEditing}
                  placeholder="contact@company.com"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-slate-900 disabled:bg-slate-50 disabled:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Tagline</label>
                <input
                  type="text"
                  value={companyData.tagline}
                  onChange={(e) => setCompanyData({ ...companyData, tagline: e.target.value })}
                  disabled={!isEditing}
                  placeholder="A brief description of your company"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-slate-900 disabled:bg-slate-50 disabled:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Location</label>
                <input
                  type="text"
                  value={companyData.location}
                  onChange={(e) => setCompanyData({ ...companyData, location: e.target.value })}
                  disabled={!isEditing}
                  placeholder="City, Country"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-slate-900 disabled:bg-slate-50 disabled:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">About the Company</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Company Description</label>
                <textarea
                  value={companyData.about}
                  onChange={(e) => setCompanyData({ ...companyData, about: e.target.value })}
                  disabled={!isEditing}
                  rows={6}
                  placeholder="Tell potential candidates about your company..."
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-slate-900 disabled:bg-slate-50 disabled:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Mission Statement</label>
                <textarea
                  value={companyData.mission}
                  onChange={(e) => setCompanyData({ ...companyData, mission: e.target.value })}
                  disabled={!isEditing}
                  rows={2}
                  placeholder="What is your company's mission?"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-slate-900 disabled:bg-slate-50 disabled:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Vision Statement</label>
                <textarea
                  value={companyData.vision}
                  onChange={(e) => setCompanyData({ ...companyData, vision: e.target.value })}
                  disabled={!isEditing}
                  rows={2}
                  placeholder="What is your company's vision?"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-slate-900 disabled:bg-slate-50 disabled:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Social Media Links</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </span>
                <input
                  type="url"
                  value={companyData.socialLinks.linkedin}
                  onChange={(e) => setCompanyData({ ...companyData, socialLinks: { ...companyData.socialLinks, linkedin: e.target.value } })}
                  disabled={!isEditing}
                  placeholder="LinkedIn URL"
                  className="w-full pl-12 pr-4 py-2.5 border border-slate-200 rounded-lg text-slate-900 disabled:bg-slate-50 disabled:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </span>
                <input
                  type="url"
                  value={companyData.socialLinks.facebook}
                  onChange={(e) => setCompanyData({ ...companyData, socialLinks: { ...companyData.socialLinks, facebook: e.target.value } })}
                  disabled={!isEditing}
                  placeholder="Facebook URL"
                  className="w-full pl-12 pr-4 py-2.5 border border-slate-200 rounded-lg text-slate-900 disabled:bg-slate-50 disabled:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Culture Tab */}
      {activeTab === 'culture' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Company Culture</h3>
            <p className="text-sm text-slate-600 mb-4">Highlight what makes your workplace special</p>

            {companyData.culture.length === 0 && !isEditing ? (
              <p className="text-slate-500 text-sm">No culture values added yet. Click Edit Profile to add some.</p>
            ) : (
              <div className="space-y-3">
                {companyData.culture.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-slate-700">{item}</span>
                    {isEditing && (
                      <button
                        onClick={() => removeCultureValue(index)}
                        className="ml-auto text-slate-400 hover:text-red-500"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {isEditing && (
              <div className="flex gap-2 mt-4">
                <input
                  type="text"
                  value={newCultureValue}
                  onChange={(e) => setNewCultureValue(e.target.value)}
                  placeholder="Add a culture value..."
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  onKeyPress={(e) => e.key === 'Enter' && addCultureValue()}
                />
                <button
                  onClick={addCultureValue}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
                >
                  Add
                </button>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Benefits & Perks</h3>
            <p className="text-sm text-slate-600 mb-4">List the benefits you offer to employees</p>

            {companyData.benefits.length === 0 && !isEditing ? (
              <p className="text-slate-500 text-sm">No benefits added yet. Click Edit Profile to add some.</p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {companyData.benefits.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-green-800">{item}</span>
                    {isEditing && (
                      <button
                        onClick={() => removeBenefit(index)}
                        className="ml-auto text-green-400 hover:text-red-500"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {isEditing && (
              <div className="flex gap-2 mt-4">
                <input
                  type="text"
                  value={newBenefit}
                  onChange={(e) => setNewBenefit(e.target.value)}
                  placeholder="Add a benefit..."
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  onKeyPress={(e) => e.key === 'Enter' && addBenefit()}
                />
                <button
                  onClick={addBenefit}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
                >
                  Add
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
