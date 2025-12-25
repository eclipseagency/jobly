'use client';

import { useState } from 'react';

export default function CompanyProfilePage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);

  const [companyData, setCompanyData] = useState({
    name: 'TechCorp Inc.',
    tagline: 'Building the future of digital innovation',
    industry: 'Information Technology',
    companySize: '201-500',
    founded: '2015',
    website: 'https://techcorp.ph',
    email: 'careers@techcorp.ph',
    phone: '+63 2 8123 4567',
    location: 'BGC, Taguig City, Metro Manila',
    about: 'TechCorp Inc. is a leading technology company in the Philippines, specializing in digital transformation, software development, and IT consulting. We work with Fortune 500 companies and emerging startups to deliver innovative solutions that drive business growth.\n\nOur team of 300+ talented professionals is passionate about technology and committed to excellence. We foster a culture of continuous learning, collaboration, and innovation.',
    mission: 'To empower businesses through innovative technology solutions that create lasting impact.',
    vision: 'To be the most trusted technology partner in Southeast Asia.',
    culture: [
      'Innovation-driven mindset',
      'Collaborative environment',
      'Work-life balance',
      'Continuous learning',
      'Diversity and inclusion',
    ],
    benefits: [
      'Competitive salary packages',
      'HMO coverage with 3 dependents',
      'Flexible work arrangements',
      'Learning & development budget',
      'Stock options for key positions',
      'Annual performance bonus',
      'Gym membership subsidy',
      'Mental health support',
    ],
    socialLinks: {
      linkedin: 'https://linkedin.com/company/techcorp',
      facebook: 'https://facebook.com/techcorp',
      twitter: 'https://twitter.com/techcorp',
      instagram: 'https://instagram.com/techcorp',
    },
    photos: [
      { id: 1, url: '#', caption: 'Our modern office space' },
      { id: 2, url: '#', caption: 'Team building event' },
      { id: 3, url: '#', caption: 'Annual company outing' },
    ],
  });

  const tabs = [
    { id: 'profile', label: 'Company Profile' },
    { id: 'culture', label: 'Culture & Benefits' },
    { id: 'media', label: 'Photos & Media' },
    { id: 'team', label: 'Team' },
  ];

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
          <button className="absolute bottom-4 right-4 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-sm font-medium rounded-lg backdrop-blur transition-colors">
            Change Cover
          </button>
        </div>
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
            <div className="relative">
              <div className="w-24 h-24 rounded-xl bg-white border-4 border-white shadow-lg flex items-center justify-center text-primary-600 font-bold text-3xl">
                TC
              </div>
              <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-900">{companyData.name}</h2>
              <p className="text-slate-600">{companyData.tagline}</p>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
            >
              {isEditing ? 'Save Changes' : 'Edit Profile'}
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
                  <option>Information Technology</option>
                  <option>Financial Services</option>
                  <option>Healthcare</option>
                  <option>Education</option>
                  <option>Manufacturing</option>
                  <option>Retail</option>
                  <option>Consulting</option>
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
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-slate-900 disabled:bg-slate-50 disabled:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Location</label>
                <input
                  type="text"
                  value={companyData.location}
                  onChange={(e) => setCompanyData({ ...companyData, location: e.target.value })}
                  disabled={!isEditing}
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
            <div className="space-y-3">
              {companyData.culture.map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-700">{item}</span>
                  {isEditing && (
                    <button className="ml-auto text-slate-400 hover:text-red-500">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
              {isEditing && (
                <button className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium mt-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Culture Value
                </button>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Benefits & Perks</h3>
            <p className="text-sm text-slate-600 mb-4">List the benefits you offer to employees</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {companyData.benefits.map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-green-800">{item}</span>
                  {isEditing && (
                    <button className="ml-auto text-green-400 hover:text-red-500">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
            {isEditing && (
              <button className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium mt-4">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Benefit
              </button>
            )}
          </div>
        </div>
      )}

      {/* Media Tab */}
      {activeTab === 'media' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Photos & Videos</h3>
              <p className="text-sm text-slate-600">Showcase your office and team</p>
            </div>
            <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors">
              Upload Media
            </button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {companyData.photos.map((photo) => (
              <div key={photo.id} className="group relative aspect-video bg-slate-100 rounded-lg overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                  <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white text-sm">{photo.caption}</p>
                </div>
              </div>
            ))}
            <button className="aspect-video border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center text-slate-400 hover:border-primary-300 hover:text-primary-500 transition-colors">
              <svg className="w-8 h-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-sm font-medium">Add Photo</span>
            </button>
          </div>
        </div>
      )}

      {/* Team Tab */}
      {activeTab === 'team' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Team Members</h3>
              <p className="text-sm text-slate-600">Showcase key team members</p>
            </div>
            <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors">
              Add Team Member
            </button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: 'John Dela Cruz', role: 'CEO & Founder', avatar: 'JD' },
              { name: 'Maria Santos', role: 'CTO', avatar: 'MS' },
              { name: 'Carlos Reyes', role: 'VP of Engineering', avatar: 'CR' },
              { name: 'Ana Garcia', role: 'Head of Design', avatar: 'AG' },
              { name: 'Miguel Lopez', role: 'HR Director', avatar: 'ML' },
              { name: 'Lisa Tan', role: 'Head of Marketing', avatar: 'LT' },
            ].map((member, i) => (
              <div key={i} className="text-center p-4 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-100 to-slate-100 flex items-center justify-center text-primary-600 font-bold text-xl mx-auto mb-3">
                  {member.avatar}
                </div>
                <h4 className="font-medium text-slate-900">{member.name}</h4>
                <p className="text-sm text-slate-500">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
