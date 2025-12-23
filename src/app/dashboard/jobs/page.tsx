'use client';

import { useState } from 'react';
import { JobCard } from '@/components/dashboard/JobCard';
import { JobFilters } from '@/components/dashboard/JobFilters';

// Sample job data
const sampleJobs = [
  {
    id: '1',
    title: 'Senior Frontend Developer',
    company: 'TechFlow Solutions',
    location: 'Makati, Philippines',
    locationType: 'onsite' as const,
    salary: '₱120k - ₱180k',
    jobType: 'Full-time',
    postedAt: '2 days ago',
    description: 'We are looking for an experienced Frontend Developer to join our team. You will be responsible for building high-quality, responsive web applications using React and TypeScript.',
    skills: ['React', 'TypeScript', 'Tailwind CSS', 'Next.js', 'GraphQL'],
  },
  {
    id: '2',
    title: 'UX/UI Designer',
    company: 'Creative Minds Agency',
    location: 'Remote',
    locationType: 'remote' as const,
    salary: '$2,500 - $4,000',
    jobType: 'Full-time',
    postedAt: '5 days ago',
    description: 'Join our creative team to design beautiful and intuitive user interfaces. You should have a strong portfolio demonstrating your skills in user-centered design.',
    skills: ['Figma', 'Adobe XD', 'Prototyping', 'User Research', 'Design Systems'],
  },
  {
    id: '3',
    title: 'Full Stack Developer',
    company: 'StartUp Hub PH',
    location: 'BGC, Taguig',
    locationType: 'hybrid' as const,
    salary: '₱80k - ₱120k',
    jobType: 'Full-time',
    postedAt: '1 week ago',
    description: 'Looking for a versatile Full Stack Developer to work on exciting startup projects. Experience with modern JavaScript frameworks and cloud services is required.',
    skills: ['Node.js', 'React', 'PostgreSQL', 'AWS', 'Docker'],
  },
  {
    id: '4',
    title: 'Digital Marketing Specialist',
    company: 'Growth Partners Inc.',
    location: 'Cebu City, Philippines',
    locationType: 'onsite' as const,
    salary: '₱45k - ₱65k',
    jobType: 'Full-time',
    postedAt: '3 days ago',
    description: 'We need a data-driven Digital Marketing Specialist to plan and execute marketing campaigns across multiple channels including social media, email, and paid advertising.',
    skills: ['SEO', 'Google Ads', 'Facebook Ads', 'Analytics', 'Content Marketing'],
  },
  {
    id: '5',
    title: 'Mobile App Developer',
    company: 'AppWorks Studio',
    location: 'Remote',
    locationType: 'remote' as const,
    salary: '₱100k - ₱150k',
    jobType: 'Contract',
    postedAt: '1 day ago',
    description: 'Seeking a skilled Mobile App Developer proficient in React Native or Flutter to build cross-platform mobile applications for our diverse client base.',
    skills: ['React Native', 'Flutter', 'iOS', 'Android', 'Firebase'],
  },
  {
    id: '6',
    title: 'Data Analyst',
    company: 'Analytics Pro',
    location: 'Ortigas, Pasig',
    locationType: 'hybrid' as const,
    salary: '₱55k - ₱80k',
    jobType: 'Full-time',
    postedAt: '4 days ago',
    description: 'Join our analytics team to transform data into actionable insights. Strong SQL skills and experience with visualization tools required.',
    skills: ['SQL', 'Python', 'Tableau', 'Excel', 'Statistics'],
  },
  {
    id: '7',
    title: 'Customer Success Manager',
    company: 'SaaS Solutions PH',
    location: 'Makati, Philippines',
    locationType: 'onsite' as const,
    salary: '₱60k - ₱90k',
    jobType: 'Full-time',
    postedAt: '6 days ago',
    description: 'Be the voice of our customers and ensure their success with our platform. Previous experience in B2B SaaS environment preferred.',
    skills: ['Customer Relations', 'SaaS', 'Communication', 'Problem Solving', 'CRM'],
  },
  {
    id: '8',
    title: 'DevOps Engineer',
    company: 'CloudTech Systems',
    location: 'Remote',
    locationType: 'remote' as const,
    salary: '₱130k - ₱200k',
    jobType: 'Full-time',
    postedAt: '2 days ago',
    description: 'Looking for a DevOps Engineer to help us build and maintain our cloud infrastructure. Experience with Kubernetes and CI/CD pipelines is essential.',
    skills: ['Kubernetes', 'Docker', 'AWS', 'CI/CD', 'Terraform'],
  },
];

export default function FindJobsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [sortBy, setSortBy] = useState('relevance');
  const [showFilters, setShowFilters] = useState(false);

  const filteredJobs = sampleJobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.skills.some((skill) => skill.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesLocation =
      !locationQuery || job.location.toLowerCase().includes(locationQuery.toLowerCase());
    return matchesSearch && matchesLocation;
  });

  return (
    <div className="min-h-full">
      {/* Search Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">Find Your Dream Job</h1>
          <p className="text-slate-300 mb-6 sm:mb-8">
            Browse thousands of job openings from top companies in the Philippines and abroad.
          </p>

          {/* Search Form */}
          <div className="bg-white rounded-xl p-3 sm:p-4 shadow-xl">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Job title, keywords, or company"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border-2 border-transparent focus:border-primary-500 focus:bg-white text-slate-800 placeholder-slate-400 transition-all outline-none"
                />
              </div>
              <div className="flex-1 relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="City, state, or remote"
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border-2 border-transparent focus:border-primary-500 focus:bg-white text-slate-800 placeholder-slate-400 transition-all outline-none"
                />
              </div>
              <button className="w-full sm:w-auto px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-colors">
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Filters Sidebar */}
          <div className="w-full lg:w-72 flex-shrink-0">
            <JobFilters isOpen={showFilters} onClose={() => setShowFilters(false)} />
          </div>

          {/* Job Listings */}
          <div className="flex-1 min-w-0">
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <p className="text-slate-600">
                  Showing <span className="font-semibold text-slate-800">{filteredJobs.length}</span> jobs
                </p>
                {/* Mobile Filter Button */}
                <button
                  onClick={() => setShowFilters(true)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filters
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="relevance">Relevance</option>
                  <option value="date">Most Recent</option>
                  <option value="salary-high">Salary: High to Low</option>
                  <option value="salary-low">Salary: Low to High</option>
                </select>
              </div>
            </div>

            {/* Job Cards */}
            <div className="space-y-4">
              {filteredJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onApply={(id) => console.log('Apply to job:', id)}
                  onSave={(id) => console.log('Save job:', id)}
                />
              ))}
            </div>

            {/* Empty State */}
            {filteredJobs.length === 0 && (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">No jobs found</h3>
                <p className="text-slate-500">Try adjusting your search or filter criteria</p>
              </div>
            )}

            {/* Pagination */}
            {filteredJobs.length > 0 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button className="p-2 border border-slate-200 rounded-lg text-slate-400 hover:bg-slate-50 disabled:opacity-50" disabled>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                {[1, 2, 3, 4, 5].map((page) => (
                  <button
                    key={page}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                      page === 1
                        ? 'bg-primary-600 text-white'
                        : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
