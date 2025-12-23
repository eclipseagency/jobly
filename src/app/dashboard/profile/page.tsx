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
        description: 'Lead frontend development for multiple client projects, mentoring junior developers and implementing best practices.',
      },
      {
        title: 'Frontend Developer',
        company: 'Digital Agency PH',
        location: 'BGC, Taguig',
        period: 'Mar 2019 - Dec 2021',
        description: 'Developed responsive web applications for various clients in e-commerce and fintech industries.',
      },
    ],
    education: [
      {
        degree: 'Bachelor of Science in Computer Science',
        school: 'University of the Philippines',
        period: '2015 - 2019',
      },
    ],
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Profile Header */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-6">
        {/* Cover */}
        <div className="h-32 sm:h-40 bg-gradient-to-r from-primary-600 to-employer-600" />

        {/* Profile Info */}
        <div className="px-4 sm:px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 sm:-mt-16 mb-6">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-br from-employee-400 to-employee-600 flex items-center justify-center text-white text-3xl sm:text-4xl font-bold border-4 border-white shadow-xl">
              AM
            </div>
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">{profile.name}</h1>
              <p className="text-slate-600">{profile.title}</p>
              <p className="text-sm text-slate-500 mt-1">{profile.location}</p>
            </div>
            <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors">
              Edit Profile
            </button>
          </div>

          {/* Contact Info */}
          <div className="flex flex-wrap gap-4 text-sm text-slate-600">
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {profile.email}
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              {profile.phone}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 mb-6">
        <div className="flex gap-8 overflow-x-auto">
          {['overview', 'experience', 'education', 'settings'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-sm font-medium capitalize whitespace-nowrap transition-colors border-b-2 ${
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
        <div className="grid gap-6">
          {/* About */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">About</h2>
            <p className="text-slate-600 leading-relaxed">{profile.bio}</p>
          </div>

          {/* Skills */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800">Skills</h2>
              <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                Add Skills
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 bg-primary-50 text-primary-700 text-sm font-medium rounded-lg"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Experience Preview */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800">Experience</h2>
              <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                Add Experience
              </button>
            </div>
            <div className="space-y-6">
              {profile.experience.map((exp, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 flex-shrink-0">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">{exp.title}</h3>
                    <p className="text-sm text-slate-600">{exp.company} • {exp.location}</p>
                    <p className="text-sm text-slate-500 mt-1">{exp.period}</p>
                    <p className="text-sm text-slate-600 mt-2">{exp.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'experience' && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-800">Work Experience</h2>
            <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors">
              Add Experience
            </button>
          </div>
          <div className="space-y-8">
            {profile.experience.map((exp, i) => (
              <div key={i} className="relative pl-8 pb-8 border-l-2 border-slate-200 last:pb-0">
                <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-primary-600 border-4 border-white" />
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-slate-800 text-lg">{exp.title}</h3>
                    <p className="text-slate-600">{exp.company}</p>
                    <p className="text-sm text-slate-500">{exp.location} • {exp.period}</p>
                  </div>
                  <button className="text-sm text-primary-600 hover:text-primary-700">Edit</button>
                </div>
                <p className="text-slate-600 mt-3">{exp.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'education' && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-800">Education</h2>
            <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors">
              Add Education
            </button>
          </div>
          <div className="space-y-6">
            {profile.education.map((edu, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 flex-shrink-0">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-800">{edu.degree}</h3>
                      <p className="text-slate-600">{edu.school}</p>
                      <p className="text-sm text-slate-500 mt-1">{edu.period}</p>
                    </div>
                    <button className="text-sm text-primary-600 hover:text-primary-700">Edit</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-6">Account Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                <input
                  type="email"
                  defaultValue={profile.email}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  defaultValue={profile.phone}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors">
                Save Changes
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Job Preferences</h2>
            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-slate-700">Receive job alerts via email</span>
                <input type="checkbox" defaultChecked className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500" />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-slate-700">Show profile to employers</span>
                <input type="checkbox" defaultChecked className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500" />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-slate-700">Open to remote work</span>
                <input type="checkbox" defaultChecked className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500" />
              </label>
            </div>
          </div>

          <div className="bg-red-50 rounded-xl border border-red-200 p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Danger Zone</h2>
            <p className="text-red-600 text-sm mb-4">Once you delete your account, there is no going back.</p>
            <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors">
              Delete Account
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
