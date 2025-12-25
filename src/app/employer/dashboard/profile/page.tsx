'use client';

import { useState } from 'react';

// Icons
const Icons = {
  edit: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
  ),
  check: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  x: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  upload: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
  ),
  plus: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  ),
  trash: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  lock: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  ),
  verified: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
};

// Tab definitions
const tabs = [
  { id: 'company', label: 'Company Info' },
  { id: 'contact', label: 'Contact & Location' },
  { id: 'culture', label: 'Culture & Benefits' },
  { id: 'social', label: 'Social Links' },
];

// Industry options
const industries = [
  'Technology', 'Finance & Banking', 'Healthcare', 'E-commerce', 'Manufacturing',
  'Education', 'Real Estate', 'Telecommunications', 'Media & Entertainment',
  'Consulting', 'Retail', 'Transportation', 'Energy', 'Agriculture', 'Other'
];

// Company size options
const companySizes = [
  '1-10 employees', '11-50 employees', '51-200 employees',
  '201-500 employees', '501-1000 employees', '1000+ employees'
];

export default function EmployerProfilePage() {
  const [activeTab, setActiveTab] = useState('company');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Company profile state
  const [profile, setProfile] = useState({
    // Company Info (name is NOT editable)
    name: 'Tech Solutions Inc.',
    slug: 'tech-solutions-inc',
    description: 'Tech Solutions Inc. is a leading software development company specializing in custom enterprise solutions, cloud services, and digital transformation. We help businesses modernize their operations through innovative technology.',
    industry: 'Technology',
    size: '51-200 employees',
    foundedYear: 2015,
    website: 'https://techsolutions.com.ph',
    logo: null,
    coverImage: null,

    // Contact Info
    email: 'careers@techsolutions.com.ph',
    phone: '+63 2 8888 1234',

    // Location
    address: '25th Floor, GT Tower International',
    city: 'Makati City',
    province: 'Metro Manila',
    postalCode: '1227',
    country: 'Philippines',

    // Social Links
    linkedinUrl: 'https://linkedin.com/company/techsolutions',
    facebookUrl: 'https://facebook.com/techsolutionsph',
    twitterUrl: 'https://twitter.com/techsolutionsph',
    instagramUrl: 'https://instagram.com/techsolutionsph',

    // Culture
    mission: 'To empower businesses through innovative technology solutions that drive growth and efficiency.',
    vision: 'To be the leading technology partner for enterprises in Southeast Asia.',
    culture: 'We foster a collaborative and inclusive environment where innovation thrives. Our team values continuous learning, open communication, and work-life balance.',
    benefits: [
      'Competitive salary packages',
      'Health insurance (HMO) for you and dependents',
      'Flexible work arrangements',
      'Professional development budget',
      'Free snacks and coffee',
      'Team building activities',
      'Performance bonuses',
      '15 days paid leave',
    ],

    // Status
    isVerified: true,
    verifiedAt: '2023-06-15',
  });

  const [newBenefit, setNewBenefit] = useState('');

  const handleInputChange = (field: string, value: string | number) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleAddBenefit = () => {
    if (newBenefit.trim()) {
      setProfile(prev => ({
        ...prev,
        benefits: [...prev.benefits, newBenefit.trim()]
      }));
      setNewBenefit('');
    }
  };

  const handleRemoveBenefit = (index: number) => {
    setProfile(prev => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    setIsEditing(false);
  };

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      {/* Profile Header */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-6 shadow-sm">
        {/* Cover Image */}
        <div className="h-40 bg-gradient-to-r from-primary-500 via-cyan-500 to-emerald-500 relative">
          {isEditing && (
            <button className="absolute bottom-4 right-4 px-3 py-1.5 bg-black/50 hover:bg-black/60 text-white text-sm rounded-lg flex items-center gap-2 transition-colors">
              {Icons.upload}
              Change Cover
            </button>
          )}
        </div>

        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 mb-4">
            {/* Logo */}
            <div className="relative">
              <div className="w-24 h-24 rounded-xl bg-white flex items-center justify-center text-primary-600 text-3xl font-bold border-4 border-white shadow-lg">
                TS
              </div>
              {isEditing && (
                <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary-600 hover:bg-primary-700 text-white rounded-full flex items-center justify-center shadow-lg transition-colors">
                  {Icons.edit}
                </button>
              )}
            </div>

            <div className="flex-1 pt-2">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900">{profile.name}</h1>
                {profile.isVerified && (
                  <span className="text-primary-500" title="Verified Company">
                    {Icons.verified}
                  </span>
                )}
                <span className="ml-2 flex items-center gap-1 text-xs text-slate-400" title="Company name cannot be changed">
                  {Icons.lock}
                  Locked
                </span>
              </div>
              <p className="text-slate-500">{profile.industry} · {profile.size}</p>
              <p className="text-sm text-slate-400 mt-1">{profile.city}, {profile.country}</p>
            </div>

            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                  >
                    {Icons.x}
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSaving ? (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : Icons.check}
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                  {Icons.edit}
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* Verification Badge */}
          {profile.isVerified && (
            <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 rounded-lg text-emerald-700 text-sm">
              <span className="text-emerald-500">{Icons.verified}</span>
              <span className="font-medium">Verified Company</span>
              <span className="text-emerald-600/70">· Verified on {new Date(profile.verifiedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 mb-6 shadow-sm overflow-x-auto">
        <div className="flex min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-primary-600 border-primary-600 bg-primary-50/50'
                  : 'text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Company Info Tab */}
        {activeTab === 'company' && (
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-6">Company Information</h2>
              <div className="space-y-5">
                {/* Company Name - NOT EDITABLE */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Company Name
                    <span className="ml-2 text-xs text-slate-400 font-normal flex items-center gap-1 inline-flex">
                      {Icons.lock} Cannot be changed
                    </span>
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    disabled
                    className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-slate-400 mt-1">Contact support if you need to change your company name</p>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Company Description</label>
                  {isEditing ? (
                    <textarea
                      value={profile.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                      placeholder="Tell candidates about your company..."
                    />
                  ) : (
                    <p className="text-slate-600 leading-relaxed">{profile.description}</p>
                  )}
                </div>

                {/* Industry & Size */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Industry</label>
                    {isEditing ? (
                      <select
                        value={profile.industry}
                        onChange={(e) => handleInputChange('industry', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        {industries.map(ind => (
                          <option key={ind} value={ind}>{ind}</option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-slate-900">{profile.industry}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Company Size</label>
                    {isEditing ? (
                      <select
                        value={profile.size}
                        onChange={(e) => handleInputChange('size', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        {companySizes.map(size => (
                          <option key={size} value={size}>{size}</option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-slate-900">{profile.size}</p>
                    )}
                  </div>
                </div>

                {/* Founded Year & Website */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Founded Year</label>
                    {isEditing ? (
                      <input
                        type="number"
                        value={profile.foundedYear}
                        onChange={(e) => handleInputChange('foundedYear', parseInt(e.target.value))}
                        min="1900"
                        max={new Date().getFullYear()}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    ) : (
                      <p className="text-slate-900">{profile.foundedYear}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Website</label>
                    {isEditing ? (
                      <input
                        type="url"
                        value={profile.website}
                        onChange={(e) => handleInputChange('website', e.target.value)}
                        placeholder="https://yourcompany.com"
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    ) : (
                      <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                        {profile.website}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contact & Location Tab */}
        {activeTab === 'contact' && (
          <div className="space-y-6">
            {/* Contact Info */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-6">Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  ) : (
                    <p className="text-slate-900">{profile.email}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone Number</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  ) : (
                    <p className="text-slate-900">{profile.phone}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-6">Office Location</h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Street Address</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profile.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  ) : (
                    <p className="text-slate-900">{profile.address}</p>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">City</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profile.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    ) : (
                      <p className="text-slate-900">{profile.city}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Province/State</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profile.province}
                        onChange={(e) => handleInputChange('province', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    ) : (
                      <p className="text-slate-900">{profile.province}</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Postal Code</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profile.postalCode}
                        onChange={(e) => handleInputChange('postalCode', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    ) : (
                      <p className="text-slate-900">{profile.postalCode}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Country</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profile.country}
                        onChange={(e) => handleInputChange('country', e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    ) : (
                      <p className="text-slate-900">{profile.country}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Culture & Benefits Tab */}
        {activeTab === 'culture' && (
          <div className="space-y-6">
            {/* Mission & Vision */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-6">Mission & Vision</h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Mission Statement</label>
                  {isEditing ? (
                    <textarea
                      value={profile.mission}
                      onChange={(e) => handleInputChange('mission', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                    />
                  ) : (
                    <p className="text-slate-600 leading-relaxed">{profile.mission}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Vision Statement</label>
                  {isEditing ? (
                    <textarea
                      value={profile.vision}
                      onChange={(e) => handleInputChange('vision', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                    />
                  ) : (
                    <p className="text-slate-600 leading-relaxed">{profile.vision}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Company Culture */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-6">Company Culture</h2>
              {isEditing ? (
                <textarea
                  value={profile.culture}
                  onChange={(e) => handleInputChange('culture', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  placeholder="Describe your company culture..."
                />
              ) : (
                <p className="text-slate-600 leading-relaxed">{profile.culture}</p>
              )}
            </div>

            {/* Benefits */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-6">Benefits & Perks</h2>
              <div className="flex flex-wrap gap-2 mb-4">
                {profile.benefits.map((benefit, index) => (
                  <span
                    key={index}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-sm rounded-lg ${
                      isEditing ? 'pr-1.5' : ''
                    }`}
                  >
                    {benefit}
                    {isEditing && (
                      <button
                        onClick={() => handleRemoveBenefit(index)}
                        className="w-5 h-5 flex items-center justify-center hover:bg-emerald-200 rounded transition-colors"
                      >
                        {Icons.x}
                      </button>
                    )}
                  </span>
                ))}
              </div>
              {isEditing && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newBenefit}
                    onChange={(e) => setNewBenefit(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddBenefit()}
                    placeholder="Add a benefit or perk..."
                    className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <button
                    onClick={handleAddBenefit}
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    {Icons.plus} Add
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Social Links Tab */}
        {activeTab === 'social' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">Social Media Links</h2>
            <div className="space-y-5">
              {/* LinkedIn */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    LinkedIn
                  </span>
                </label>
                {isEditing ? (
                  <input
                    type="url"
                    value={profile.linkedinUrl}
                    onChange={(e) => handleInputChange('linkedinUrl', e.target.value)}
                    placeholder="https://linkedin.com/company/..."
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                ) : (
                  <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                    {profile.linkedinUrl}
                  </a>
                )}
              </div>

              {/* Facebook */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Facebook
                  </span>
                </label>
                {isEditing ? (
                  <input
                    type="url"
                    value={profile.facebookUrl}
                    onChange={(e) => handleInputChange('facebookUrl', e.target.value)}
                    placeholder="https://facebook.com/..."
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                ) : (
                  <a href={profile.facebookUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                    {profile.facebookUrl}
                  </a>
                )}
              </div>

              {/* Twitter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-slate-900" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    Twitter / X
                  </span>
                </label>
                {isEditing ? (
                  <input
                    type="url"
                    value={profile.twitterUrl}
                    onChange={(e) => handleInputChange('twitterUrl', e.target.value)}
                    placeholder="https://twitter.com/..."
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                ) : (
                  <a href={profile.twitterUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                    {profile.twitterUrl}
                  </a>
                )}
              </div>

              {/* Instagram */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                    </svg>
                    Instagram
                  </span>
                </label>
                {isEditing ? (
                  <input
                    type="url"
                    value={profile.instagramUrl}
                    onChange={(e) => handleInputChange('instagramUrl', e.target.value)}
                    placeholder="https://instagram.com/..."
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                ) : (
                  <a href={profile.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                    {profile.instagramUrl}
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
