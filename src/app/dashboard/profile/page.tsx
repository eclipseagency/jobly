'use client';

import { useState } from 'react';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('overview');

  const profile = {
    name: 'Alex Morgan',
    title: 'Senior Frontend Developer',
    email: 'alex@example.com',
    phone: '+63 912 345 6789',
    location: 'Makati City, Philippines',
    bio: 'Passionate frontend developer with 5+ years of experience building responsive and user-friendly web applications. Specialized in React, TypeScript, and modern CSS frameworks.',
    skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Node.js', 'GraphQL', 'Git', 'Figma'],
    experience: [
      {
        title: 'Senior Frontend Developer',
        company: 'Tech Solutions Inc.',
        location: 'Makati City',
        period: 'Jan 2022 - Present',
        description: 'Lead frontend development for multiple client projects.',
      },
      {
        title: 'Frontend Developer',
        company: 'Digital Agency PH',
        location: 'BGC, Taguig',
        period: 'Mar 2019 - Dec 2021',
        description: 'Developed responsive web applications for e-commerce and fintech clients.',
      },
    ],
    education: [
      {
        degree: 'BS Computer Science',
        school: 'University of the Philippines',
        period: '2015 - 2019',
      },
    ],
  };

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Profile Header */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden mb-6">
        <div className="h-24 bg-slate-100" />
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10 mb-4">
            <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-2xl font-semibold border-4 border-white">
              AM
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-slate-900">{profile.name}</h1>
              <p className="text-slate-500">{profile.title}</p>
            </div>
            <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors">
              Edit Profile
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {profile.email}
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              {profile.location}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 mb-6">
        <div className="flex gap-6">
          {['overview', 'experience', 'settings'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
                activeTab === tab
                  ? 'text-primary-600 border-primary-600'
                  : 'text-slate-500 border-transparent hover:text-slate-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* About */}
          <div className="bg-white rounded-lg border border-slate-200 p-5">
            <h2 className="font-semibold text-slate-900 mb-3">About</h2>
            <p className="text-sm text-slate-600 leading-relaxed">{profile.bio}</p>
          </div>

          {/* Skills */}
          <div className="bg-white rounded-lg border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-900">Skills</h2>
              <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                Edit
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill, i) => (
                <span key={i} className="px-3 py-1.5 bg-primary-50 text-primary-700 text-sm rounded-lg">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Experience */}
          <div className="bg-white rounded-lg border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-900">Experience</h2>
              <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                Add
              </button>
            </div>
            <div className="space-y-5">
              {profile.experience.map((exp, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 flex-shrink-0">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900">{exp.title}</h3>
                    <p className="text-sm text-slate-500">{exp.company}</p>
                    <p className="text-xs text-slate-400 mt-1">{exp.period}</p>
                    <p className="text-sm text-slate-600 mt-2">{exp.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'experience' && (
        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-slate-900">Work Experience</h2>
            <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors">
              Add Experience
            </button>
          </div>
          <div className="space-y-6">
            {profile.experience.map((exp, i) => (
              <div key={i} className="relative pl-6 pb-6 border-l-2 border-slate-200 last:pb-0">
                <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-primary-600 border-2 border-white" />
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-slate-900">{exp.title}</h3>
                    <p className="text-sm text-slate-500">{exp.company}</p>
                    <p className="text-xs text-slate-400 mt-1">{exp.period}</p>
                  </div>
                  <button className="text-sm text-primary-600 hover:text-primary-700">Edit</button>
                </div>
                <p className="text-sm text-slate-600 mt-2">{exp.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-slate-200 p-5">
            <h2 className="font-semibold text-slate-900 mb-4">Account Settings</h2>
            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                <input
                  type="email"
                  defaultValue={profile.email}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone</label>
                <input
                  type="tel"
                  defaultValue={profile.phone}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors">
                Save Changes
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-5">
            <h2 className="font-semibold text-slate-900 mb-4">Preferences</h2>
            <div className="space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-slate-700">Email notifications</span>
                <input type="checkbox" defaultChecked className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500" />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-slate-700">Show profile to employers</span>
                <input type="checkbox" defaultChecked className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500" />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-slate-700">Open to remote work</span>
                <input type="checkbox" defaultChecked className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500" />
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
