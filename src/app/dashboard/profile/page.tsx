'use client';

import { useState } from 'react';

// Icons
const Icons = {
  user: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  briefcase: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  academic: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
    </svg>
  ),
  certificate: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  ),
  document: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  globe: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
    </svg>
  ),
  users: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  settings: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  plus: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  ),
  edit: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
  ),
  trash: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  email: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  phone: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  ),
  location: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  linkedin: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  ),
  github: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
  ),
  link: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  ),
  upload: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
  ),
  check: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  calendar: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
};

// Tabs for the profile
const tabs = [
  { id: 'personal', label: 'Personal Info', icon: Icons.user },
  { id: 'experience', label: 'Experience', icon: Icons.briefcase },
  { id: 'education', label: 'Education', icon: Icons.academic },
  { id: 'skills', label: 'Skills', icon: Icons.certificate },
  { id: 'documents', label: 'Documents', icon: Icons.document },
  { id: 'preferences', label: 'Job Preferences', icon: Icons.settings },
];

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);

  // Sample profile data - in production this would come from API/database
  const [profile, setProfile] = useState({
    // Personal Info
    firstName: 'Alex',
    lastName: 'Morgan',
    email: 'alex.morgan@example.com',
    phone: '+63 912 345 6789',
    dateOfBirth: '1995-06-15',
    gender: 'Male',
    nationality: 'Filipino',
    address: '123 Ayala Avenue',
    city: 'Makati City',
    province: 'Metro Manila',
    postalCode: '1226',
    country: 'Philippines',

    // Professional Info
    title: 'Senior Frontend Developer',
    bio: 'Passionate frontend developer with 5+ years of experience building responsive and user-friendly web applications. Specialized in React, TypeScript, and modern CSS frameworks. I love creating elegant solutions to complex problems and am always eager to learn new technologies.',
    yearsOfExp: 5,

    // Links
    linkedinUrl: 'https://linkedin.com/in/alexmorgan',
    githubUrl: 'https://github.com/alexmorgan',
    portfolioUrl: 'https://alexmorgan.dev',
    websiteUrl: '',

    // Job Preferences
    expectedSalary: '80,000 - 120,000',
    preferredJobType: 'full-time',
    preferredWorkSetup: 'hybrid',
    availableFrom: '2024-02-01',
    willingToRelocate: true,
    openToOffers: true,
    preferredLocations: ['Makati City', 'BGC', 'Ortigas'],
    preferredIndustries: ['Technology', 'Finance', 'E-commerce'],
  });

  const [skills, setSkills] = useState([
    { name: 'React', level: 'Expert', years: 4 },
    { name: 'TypeScript', level: 'Expert', years: 3 },
    { name: 'Next.js', level: 'Advanced', years: 2 },
    { name: 'Tailwind CSS', level: 'Expert', years: 3 },
    { name: 'Node.js', level: 'Intermediate', years: 2 },
    { name: 'GraphQL', level: 'Intermediate', years: 1 },
    { name: 'PostgreSQL', level: 'Intermediate', years: 2 },
    { name: 'Git', level: 'Advanced', years: 5 },
    { name: 'Figma', level: 'Intermediate', years: 2 },
    { name: 'AWS', level: 'Basic', years: 1 },
  ]);

  const [experience, setExperience] = useState([
    {
      id: 1,
      jobTitle: 'Senior Frontend Developer',
      company: 'Tech Solutions Inc.',
      location: 'Makati City, Philippines',
      locationType: 'hybrid',
      employmentType: 'full-time',
      startDate: '2022-01',
      endDate: null,
      isCurrent: true,
      description: 'Lead frontend development for multiple client projects. Mentor junior developers and establish coding standards.',
      achievements: [
        'Led the migration of legacy jQuery codebase to React, improving performance by 40%',
        'Implemented CI/CD pipeline reducing deployment time by 60%',
        'Mentored 3 junior developers who were promoted within the year',
      ],
      skills: ['React', 'TypeScript', 'Next.js', 'AWS'],
    },
    {
      id: 2,
      jobTitle: 'Frontend Developer',
      company: 'Digital Agency PH',
      location: 'BGC, Taguig, Philippines',
      locationType: 'onsite',
      employmentType: 'full-time',
      startDate: '2019-03',
      endDate: '2021-12',
      isCurrent: false,
      description: 'Developed responsive web applications for e-commerce and fintech clients.',
      achievements: [
        'Built e-commerce platform serving 50,000+ monthly users',
        'Reduced page load time by 50% through optimization',
        'Received "Developer of the Year" award in 2020',
      ],
      skills: ['React', 'JavaScript', 'CSS', 'Node.js'],
    },
  ]);

  const [education, setEducation] = useState([
    {
      id: 1,
      school: 'University of the Philippines',
      degree: "Bachelor's Degree",
      fieldOfStudy: 'Computer Science',
      startDate: '2015-06',
      endDate: '2019-05',
      isCurrent: false,
      grade: '1.5 (Cum Laude)',
      activities: 'Computer Science Society, Hackathon Club',
      achievements: ['Cum Laude', 'Best Thesis Award', 'Dean\'s List 2017-2019'],
    },
  ]);

  const [certifications, setCertifications] = useState([
    {
      id: 1,
      name: 'AWS Certified Developer - Associate',
      issuingOrg: 'Amazon Web Services',
      issueDate: '2023-06',
      expiryDate: '2026-06',
      hasNoExpiry: false,
      credentialId: 'AWS-DEV-12345',
      credentialUrl: 'https://aws.amazon.com/verification/12345',
    },
    {
      id: 2,
      name: 'Meta Frontend Developer Professional Certificate',
      issuingOrg: 'Meta',
      issueDate: '2023-01',
      expiryDate: null,
      hasNoExpiry: true,
      credentialId: 'META-FE-67890',
      credentialUrl: 'https://coursera.org/verify/67890',
    },
  ]);

  const [languages, setLanguages] = useState([
    { id: 1, language: 'English', proficiency: 'Fluent' },
    { id: 2, language: 'Filipino', proficiency: 'Native' },
    { id: 3, language: 'Japanese', proficiency: 'Basic' },
  ]);

  const [documents, setDocuments] = useState({
    resume: { name: 'Alex_Morgan_Resume_2024.pdf', uploadedAt: '2024-01-15', size: '245 KB' },
    coverLetter: { name: 'Cover_Letter_Template.pdf', uploadedAt: '2024-01-10', size: '128 KB' },
    certificates: [
      { name: 'AWS_Certificate.pdf', uploadedAt: '2023-06-20', size: '512 KB' },
      { name: 'Meta_Certificate.pdf', uploadedAt: '2023-01-15', size: '489 KB' },
    ],
  });

  const [references, setReferences] = useState([
    {
      id: 1,
      name: 'Maria Santos',
      position: 'Engineering Manager',
      company: 'Tech Solutions Inc.',
      email: 'maria.santos@techsolutions.com',
      phone: '+63 917 123 4567',
      relationship: 'Direct Manager',
    },
    {
      id: 2,
      name: 'John Cruz',
      position: 'Senior Developer',
      company: 'Digital Agency PH',
      email: 'john.cruz@digitalph.com',
      phone: '+63 918 234 5678',
      relationship: 'Former Colleague',
    },
  ]);

  // Profile completion percentage
  const calculateCompletion = () => {
    let completed = 0;
    let total = 10;

    if (profile.firstName && profile.lastName) completed++;
    if (profile.email && profile.phone) completed++;
    if (profile.bio && profile.title) completed++;
    if (experience.length > 0) completed++;
    if (education.length > 0) completed++;
    if (skills.length >= 5) completed++;
    if (certifications.length > 0) completed++;
    if (documents.resume) completed++;
    if (profile.linkedinUrl || profile.githubUrl) completed++;
    if (profile.expectedSalary && profile.preferredJobType) completed++;

    return Math.round((completed / total) * 100);
  };

  const completionPercentage = calculateCompletion();

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto">
      {/* Profile Header */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-6 shadow-sm">
        <div className="h-32 bg-gradient-to-r from-primary-500 via-cyan-500 to-emerald-500" />
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 mb-4">
            <div className="w-24 h-24 rounded-xl bg-white flex items-center justify-center text-primary-600 text-3xl font-bold border-4 border-white shadow-lg">
              {profile.firstName[0]}{profile.lastName[0]}
            </div>
            <div className="flex-1 pt-2">
              <h1 className="text-2xl font-bold text-slate-900">{profile.firstName} {profile.lastName}</h1>
              <p className="text-slate-500 font-medium">{profile.title}</p>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-slate-500">
                <span className="flex items-center gap-1.5">
                  {Icons.location}
                  {profile.city}, {profile.country}
                </span>
                <span className="flex items-center gap-1.5">
                  {Icons.briefcase}
                  {profile.yearsOfExp} years experience
                </span>
                {profile.openToOffers && (
                  <span className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-xs font-medium">
                    {Icons.check}
                    Open to offers
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              {Icons.edit}
              {isEditing ? 'Save Changes' : 'Edit Profile'}
            </button>
          </div>

          {/* Profile Completion */}
          <div className="bg-slate-50 rounded-lg p-4 mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">Profile Completion</span>
              <span className="text-sm font-bold text-primary-600">{completionPercentage}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-primary-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            {completionPercentage < 100 && (
              <p className="text-xs text-slate-500 mt-2">
                Complete your profile to increase visibility to employers
              </p>
            )}
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap gap-3 mt-4">
            {profile.linkedinUrl && (
              <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm hover:bg-blue-100 transition-colors">
                {Icons.linkedin} LinkedIn
              </a>
            )}
            {profile.githubUrl && (
              <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm hover:bg-slate-200 transition-colors">
                {Icons.github} GitHub
              </a>
            )}
            {profile.portfolioUrl && (
              <a href={profile.portfolioUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-sm hover:bg-purple-100 transition-colors">
                {Icons.link} Portfolio
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-xl border border-slate-200 mb-6 shadow-sm overflow-x-auto">
        <div className="flex min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-primary-600 border-primary-600 bg-primary-50/50'
                  : 'text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Personal Information Tab */}
        {activeTab === 'personal' && (
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-slate-900">Basic Information</h2>
                <button className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
                  {Icons.edit} Edit
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">First Name</label>
                  <p className="text-slate-900">{profile.firstName}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Last Name</label>
                  <p className="text-slate-900">{profile.lastName}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Email Address</label>
                  <p className="text-slate-900 flex items-center gap-2">{Icons.email} {profile.email}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Phone Number</label>
                  <p className="text-slate-900 flex items-center gap-2">{Icons.phone} {profile.phone}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Date of Birth</label>
                  <p className="text-slate-900">{new Date(profile.dateOfBirth).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Gender</label>
                  <p className="text-slate-900">{profile.gender}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Nationality</label>
                  <p className="text-slate-900">{profile.nationality}</p>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-slate-900">Address</h2>
                <button className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
                  {Icons.edit} Edit
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-500 mb-1">Street Address</label>
                  <p className="text-slate-900">{profile.address}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">City</label>
                  <p className="text-slate-900">{profile.city}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Province/State</label>
                  <p className="text-slate-900">{profile.province}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Postal Code</label>
                  <p className="text-slate-900">{profile.postalCode}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Country</label>
                  <p className="text-slate-900">{profile.country}</p>
                </div>
              </div>
            </div>

            {/* About / Bio */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900">About Me</h2>
                <button className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
                  {Icons.edit} Edit
                </button>
              </div>
              <p className="text-slate-600 leading-relaxed">{profile.bio}</p>
            </div>

            {/* Social Links */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-slate-900">Social & Professional Links</h2>
                <button className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
                  {Icons.edit} Edit
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                    {Icons.linkedin}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-500">LinkedIn</p>
                    <p className="text-sm text-slate-900 truncate">{profile.linkedinUrl || 'Not added'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center text-slate-700">
                    {Icons.github}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-500">GitHub</p>
                    <p className="text-sm text-slate-900 truncate">{profile.githubUrl || 'Not added'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
                    {Icons.link}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-500">Portfolio</p>
                    <p className="text-sm text-slate-900 truncate">{profile.portfolioUrl || 'Not added'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600">
                    {Icons.globe}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-500">Personal Website</p>
                    <p className="text-sm text-slate-900 truncate">{profile.websiteUrl || 'Not added'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Languages */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900">Languages</h2>
                <button className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
                  {Icons.plus} Add
                </button>
              </div>
              <div className="flex flex-wrap gap-3">
                {languages.map((lang) => (
                  <div key={lang.id} className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-lg">
                    <span className="font-medium text-slate-900">{lang.language}</span>
                    <span className="text-xs px-2 py-0.5 bg-slate-200 text-slate-600 rounded-full">{lang.proficiency}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* References */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900">Professional References</h2>
                <button className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
                  {Icons.plus} Add
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {references.map((ref) => (
                  <div key={ref.id} className="p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-slate-900">{ref.name}</h3>
                        <p className="text-sm text-slate-500">{ref.position} at {ref.company}</p>
                        <p className="text-xs text-slate-400 mt-1">{ref.relationship}</p>
                      </div>
                      <button className="text-slate-400 hover:text-slate-600">{Icons.edit}</button>
                    </div>
                    <div className="mt-3 space-y-1 text-sm text-slate-600">
                      <p className="flex items-center gap-2">{Icons.email} {ref.email}</p>
                      <p className="flex items-center gap-2">{Icons.phone} {ref.phone}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Experience Tab */}
        {activeTab === 'experience' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-slate-900">Work Experience</h2>
                <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2">
                  {Icons.plus} Add Experience
                </button>
              </div>
              <div className="space-y-6">
                {experience.map((exp, index) => (
                  <div key={exp.id} className={`relative pl-6 pb-6 ${index !== experience.length - 1 ? 'border-l-2 border-slate-200' : ''}`}>
                    <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-primary-600 border-4 border-white shadow" />
                    <div className="bg-slate-50 rounded-lg p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-slate-900">{exp.jobTitle}</h3>
                            {exp.isCurrent && (
                              <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-medium">Current</span>
                            )}
                          </div>
                          <p className="text-primary-600 font-medium">{exp.company}</p>
                          <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-slate-500">
                            <span className="flex items-center gap-1">{Icons.location} {exp.location}</span>
                            <span className="capitalize px-2 py-0.5 bg-slate-200 rounded text-xs">{exp.employmentType}</span>
                            <span className="capitalize px-2 py-0.5 bg-slate-200 rounded text-xs">{exp.locationType}</span>
                          </div>
                          <p className="text-sm text-slate-400 mt-1 flex items-center gap-1">
                            {Icons.calendar}
                            {new Date(exp.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - {exp.isCurrent ? 'Present' : new Date(exp.endDate!).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button className="p-2 text-slate-400 hover:text-primary-600 hover:bg-white rounded-lg transition-colors">{Icons.edit}</button>
                          <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg transition-colors">{Icons.trash}</button>
                        </div>
                      </div>
                      <p className="text-slate-600 text-sm mb-3">{exp.description}</p>
                      {exp.achievements.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs font-medium text-slate-500 mb-2">Key Achievements</p>
                          <ul className="space-y-1">
                            {exp.achievements.map((achievement, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                                <span className="text-emerald-500 mt-1">{Icons.check}</span>
                                {achievement}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {exp.skills.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {exp.skills.map((skill, i) => (
                            <span key={i} className="px-2 py-1 bg-primary-50 text-primary-700 text-xs rounded-md">{skill}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Education Tab */}
        {activeTab === 'education' && (
          <div className="space-y-6">
            {/* Education */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-slate-900">Education</h2>
                <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2">
                  {Icons.plus} Add Education
                </button>
              </div>
              <div className="space-y-4">
                {education.map((edu) => (
                  <div key={edu.id} className="bg-slate-50 rounded-lg p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4">
                        <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600">
                          {Icons.academic}
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900">{edu.school}</h3>
                          <p className="text-primary-600">{edu.degree} in {edu.fieldOfStudy}</p>
                          <p className="text-sm text-slate-500 mt-1">
                            {new Date(edu.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - {edu.isCurrent ? 'Present' : new Date(edu.endDate!).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                          </p>
                          {edu.grade && <p className="text-sm text-slate-500">Grade: {edu.grade}</p>}
                          {edu.activities && <p className="text-sm text-slate-500">Activities: {edu.activities}</p>}
                          {edu.achievements.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {edu.achievements.map((achievement, i) => (
                                <span key={i} className="px-2 py-1 bg-amber-50 text-amber-700 text-xs rounded-md">{achievement}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="p-2 text-slate-400 hover:text-primary-600 hover:bg-white rounded-lg transition-colors">{Icons.edit}</button>
                        <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg transition-colors">{Icons.trash}</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Certifications */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-slate-900">Certifications & Licenses</h2>
                <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2">
                  {Icons.plus} Add Certification
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {certifications.map((cert) => (
                  <div key={cert.id} className="bg-slate-50 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-3">
                        <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600">
                          {Icons.certificate}
                        </div>
                        <div>
                          <h3 className="font-medium text-slate-900 text-sm">{cert.name}</h3>
                          <p className="text-sm text-slate-500">{cert.issuingOrg}</p>
                          <p className="text-xs text-slate-400 mt-1">
                            Issued {new Date(cert.issueDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                            {!cert.hasNoExpiry && cert.expiryDate && ` · Expires ${new Date(cert.expiryDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`}
                            {cert.hasNoExpiry && ' · No Expiration'}
                          </p>
                          {cert.credentialId && (
                            <p className="text-xs text-slate-400">ID: {cert.credentialId}</p>
                          )}
                          {cert.credentialUrl && (
                            <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary-600 hover:underline">
                              View Credential
                            </a>
                          )}
                        </div>
                      </div>
                      <button className="p-1 text-slate-400 hover:text-primary-600">{Icons.edit}</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Skills Tab */}
        {activeTab === 'skills' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-900">Skills & Expertise</h2>
              <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2">
                {Icons.plus} Add Skill
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {skills.map((skill, index) => (
                <div key={index} className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-slate-900">{skill.name}</h3>
                    <button className="text-slate-400 hover:text-primary-600">{Icons.edit}</button>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      skill.level === 'Expert' ? 'bg-emerald-100 text-emerald-700' :
                      skill.level === 'Advanced' ? 'bg-blue-100 text-blue-700' :
                      skill.level === 'Intermediate' ? 'bg-amber-100 text-amber-700' :
                      'bg-slate-200 text-slate-600'
                    }`}>
                      {skill.level}
                    </span>
                    <span className="text-slate-500">{skill.years} {skill.years === 1 ? 'year' : 'years'}</span>
                  </div>
                  <div className="mt-2 w-full bg-slate-200 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${
                        skill.level === 'Expert' ? 'bg-emerald-500 w-full' :
                        skill.level === 'Advanced' ? 'bg-blue-500 w-3/4' :
                        skill.level === 'Intermediate' ? 'bg-amber-500 w-1/2' :
                        'bg-slate-400 w-1/4'
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div className="space-y-6">
            {/* Resume */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900">Resume / CV</h2>
              </div>
              {documents.resume ? (
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center text-red-600">
                      {Icons.document}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{documents.resume.name}</p>
                      <p className="text-xs text-slate-500">Uploaded {documents.resume.uploadedAt} · {documents.resume.size}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">View</button>
                    <button className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Replace</button>
                    <button className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">Delete</button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 mx-auto mb-3">
                    {Icons.upload}
                  </div>
                  <p className="text-slate-600 mb-2">Drag and drop your resume here, or click to browse</p>
                  <p className="text-xs text-slate-400">PDF, DOC, DOCX up to 5MB</p>
                  <button className="mt-4 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors">
                    Upload Resume
                  </button>
                </div>
              )}
            </div>

            {/* Cover Letter */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900">Cover Letter Template</h2>
              </div>
              {documents.coverLetter ? (
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                      {Icons.document}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{documents.coverLetter.name}</p>
                      <p className="text-xs text-slate-500">Uploaded {documents.coverLetter.uploadedAt} · {documents.coverLetter.size}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">View</button>
                    <button className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Replace</button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center">
                  <p className="text-slate-500 text-sm">No cover letter template uploaded</p>
                  <button className="mt-3 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors">
                    Upload Template
                  </button>
                </div>
              )}
            </div>

            {/* Certificates */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900">Certificates & Documents</h2>
                <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2">
                  {Icons.plus} Upload
                </button>
              </div>
              <div className="space-y-3">
                {documents.certificates.map((cert, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-amber-100 rounded flex items-center justify-center text-amber-600">
                        {Icons.certificate}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{cert.name}</p>
                        <p className="text-xs text-slate-500">{cert.uploadedAt} · {cert.size}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button className="p-1.5 text-slate-400 hover:text-primary-600 rounded">{Icons.edit}</button>
                      <button className="p-1.5 text-slate-400 hover:text-red-600 rounded">{Icons.trash}</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Job Preferences Tab */}
        {activeTab === 'preferences' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-slate-900">Job Preferences</h2>
                <button className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
                  {Icons.edit} Edit
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Expected Salary (PHP/month)</label>
                  <p className="text-slate-900 font-medium">₱{profile.expectedSalary}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Preferred Job Type</label>
                  <p className="text-slate-900 capitalize">{profile.preferredJobType}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Preferred Work Setup</label>
                  <p className="text-slate-900 capitalize">{profile.preferredWorkSetup}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Available From</label>
                  <p className="text-slate-900">{new Date(profile.availableFrom).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Willing to Relocate</label>
                  <p className={`font-medium ${profile.willingToRelocate ? 'text-emerald-600' : 'text-slate-500'}`}>
                    {profile.willingToRelocate ? 'Yes' : 'No'}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Open to Offers</label>
                  <p className={`font-medium ${profile.openToOffers ? 'text-emerald-600' : 'text-slate-500'}`}>
                    {profile.openToOffers ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900">Preferred Locations</h2>
                <button className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
                  {Icons.edit} Edit
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.preferredLocations.map((loc, i) => (
                  <span key={i} className="px-3 py-1.5 bg-slate-100 text-slate-700 text-sm rounded-lg">{loc}</span>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900">Preferred Industries</h2>
                <button className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
                  {Icons.edit} Edit
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.preferredIndustries.map((ind, i) => (
                  <span key={i} className="px-3 py-1.5 bg-primary-50 text-primary-700 text-sm rounded-lg">{ind}</span>
                ))}
              </div>
            </div>

            {/* Privacy Settings */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Privacy Settings</h2>
              <div className="space-y-4">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <p className="font-medium text-slate-900">Show profile to employers</p>
                    <p className="text-sm text-slate-500">Allow employers to find and view your profile</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500" />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <p className="font-medium text-slate-900">Show salary expectation</p>
                    <p className="text-sm text-slate-500">Display your expected salary to employers</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500" />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <p className="font-medium text-slate-900">Email notifications</p>
                    <p className="text-sm text-slate-500">Receive job alerts and updates via email</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500" />
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
