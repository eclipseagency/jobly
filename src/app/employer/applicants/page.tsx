'use client';

import { useState } from 'react';
import Link from 'next/link';

const applicantsData = [
  {
    id: '1',
    name: 'Maria Santos',
    email: 'maria.santos@email.com',
    avatar: 'MS',
    job: 'Senior Frontend Developer',
    jobId: '1',
    appliedAt: '2024-12-23T10:30:00',
    status: 'New',
    matchScore: 92,
    experience: '6 years',
    location: 'Makati City',
    skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS'],
    education: 'BS Computer Science, UP Diliman',
    currentRole: 'Frontend Developer at Accenture',
    resumeUrl: '#',
  },
  {
    id: '2',
    name: 'John Reyes',
    email: 'john.reyes@email.com',
    avatar: 'JR',
    job: 'Full Stack Engineer',
    jobId: '2',
    appliedAt: '2024-12-23T08:15:00',
    status: 'Reviewed',
    matchScore: 88,
    experience: '4 years',
    location: 'BGC, Taguig',
    skills: ['Node.js', 'React', 'PostgreSQL', 'AWS'],
    education: 'BS Information Technology, DLSU',
    currentRole: 'Software Engineer at Grab',
    resumeUrl: '#',
  },
  {
    id: '3',
    name: 'Ana Cruz',
    email: 'ana.cruz@email.com',
    avatar: 'AC',
    job: 'Product Designer',
    jobId: '3',
    appliedAt: '2024-12-22T14:20:00',
    status: 'Interview',
    matchScore: 95,
    experience: '5 years',
    location: 'Remote',
    skills: ['Figma', 'UI/UX Design', 'Prototyping', 'User Research'],
    education: 'BA Multimedia Arts, UST',
    currentRole: 'Senior Designer at Canva',
    resumeUrl: '#',
  },
  {
    id: '4',
    name: 'Miguel Lopez',
    email: 'miguel.lopez@email.com',
    avatar: 'ML',
    job: 'DevOps Engineer',
    jobId: '4',
    appliedAt: '2024-12-22T11:45:00',
    status: 'New',
    matchScore: 85,
    experience: '3 years',
    location: 'Cebu City',
    skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform'],
    education: 'BS Computer Engineering, USC',
    currentRole: 'DevOps Engineer at Accenture',
    resumeUrl: '#',
  },
  {
    id: '5',
    name: 'Sarah Garcia',
    email: 'sarah.garcia@email.com',
    avatar: 'SG',
    job: 'Senior Frontend Developer',
    jobId: '1',
    appliedAt: '2024-12-21T16:30:00',
    status: 'Shortlisted',
    matchScore: 90,
    experience: '7 years',
    location: 'Makati City',
    skills: ['React', 'Vue.js', 'TypeScript', 'GraphQL'],
    education: 'BS Computer Science, Ateneo',
    currentRole: 'Lead Developer at GCash',
    resumeUrl: '#',
  },
  {
    id: '6',
    name: 'Paolo Mendoza',
    email: 'paolo.mendoza@email.com',
    avatar: 'PM',
    job: 'Full Stack Engineer',
    jobId: '2',
    appliedAt: '2024-12-21T09:00:00',
    status: 'Rejected',
    matchScore: 65,
    experience: '2 years',
    location: 'Quezon City',
    skills: ['JavaScript', 'PHP', 'MySQL'],
    education: 'BS Information Systems, PUP',
    currentRole: 'Junior Developer at Startup',
    resumeUrl: '#',
  },
  {
    id: '7',
    name: 'Lisa Tan',
    email: 'lisa.tan@email.com',
    avatar: 'LT',
    job: 'Product Designer',
    jobId: '3',
    appliedAt: '2024-12-20T13:15:00',
    status: 'Hired',
    matchScore: 98,
    experience: '8 years',
    location: 'BGC, Taguig',
    skills: ['Figma', 'Sketch', 'Design Systems', 'User Research'],
    education: 'MA Design, Parsons School of Design',
    currentRole: 'Design Lead at Meta',
    resumeUrl: '#',
  },
  {
    id: '8',
    name: 'Carlos Villanueva',
    email: 'carlos.v@email.com',
    avatar: 'CV',
    job: 'Senior Frontend Developer',
    jobId: '1',
    appliedAt: '2024-12-20T10:45:00',
    status: 'New',
    matchScore: 78,
    experience: '4 years',
    location: 'Pasig City',
    skills: ['React', 'JavaScript', 'CSS', 'HTML'],
    education: 'BS Computer Science, Mapua',
    currentRole: 'Frontend Developer at IBM',
    resumeUrl: '#',
  },
];

type Applicant = typeof applicantsData[0];

const jobOptions = [
  { id: 'all', title: 'All Jobs' },
  { id: '1', title: 'Senior Frontend Developer' },
  { id: '2', title: 'Full Stack Engineer' },
  { id: '3', title: 'Product Designer' },
  { id: '4', title: 'DevOps Engineer' },
];

const statusOptions = ['All', 'New', 'Reviewed', 'Shortlisted', 'Interview', 'Hired', 'Rejected'];

export default function ApplicantsPage() {
  const [selectedJob, setSelectedJob] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [selectedApplicants, setSelectedApplicants] = useState<string[]>([]);

  const filteredApplicants = applicantsData.filter(applicant => {
    const matchesJob = selectedJob === 'all' || applicant.jobId === selectedJob;
    const matchesStatus = selectedStatus === 'All' || applicant.status === selectedStatus;
    const matchesSearch = !searchQuery ||
      applicant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      applicant.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      applicant.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesJob && matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New': return 'bg-blue-50 text-blue-700';
      case 'Reviewed': return 'bg-slate-100 text-slate-700';
      case 'Shortlisted': return 'bg-yellow-50 text-yellow-700';
      case 'Interview': return 'bg-purple-50 text-purple-700';
      case 'Hired': return 'bg-green-50 text-green-700';
      case 'Rejected': return 'bg-red-50 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    return 'text-slate-500';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHrs < 1) return 'Just now';
    if (diffHrs < 24) return `${diffHrs} hours ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
  };

  const toggleSelectApplicant = (id: string) => {
    setSelectedApplicants(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Applicants</h1>
          <p className="text-slate-600 mt-1">Review and manage job applications</p>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name, email, or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedJob}
            onChange={(e) => setSelectedJob(e.target.value)}
            className="px-4 py-2.5 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
          >
            {jobOptions.map(job => (
              <option key={job.id} value={job.id}>{job.title}</option>
            ))}
          </select>
          <div className="flex gap-2 overflow-x-auto">
            {statusOptions.map(status => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-3 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                  selectedStatus === status
                    ? 'bg-primary-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedApplicants.length > 0 && (
        <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 mb-4 flex items-center justify-between">
          <p className="text-sm text-primary-700">
            <span className="font-semibold">{selectedApplicants.length}</span> applicant(s) selected
          </p>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 text-sm font-medium text-primary-700 hover:bg-primary-100 rounded-lg transition-colors">
              Move to Shortlist
            </button>
            <button className="px-3 py-1.5 text-sm font-medium text-primary-700 hover:bg-primary-100 rounded-lg transition-colors">
              Schedule Interview
            </button>
            <button className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors">
              Reject
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-6">
        {/* Applicants List */}
        <div className="flex-1">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="divide-y divide-slate-100">
              {filteredApplicants.map((applicant) => (
                <div
                  key={applicant.id}
                  className={`p-5 hover:bg-slate-50 transition-colors cursor-pointer ${
                    selectedApplicant?.id === applicant.id ? 'bg-primary-50' : ''
                  }`}
                  onClick={() => setSelectedApplicant(applicant)}
                >
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={selectedApplicants.includes(applicant.id)}
                      onChange={(e) => { e.stopPropagation(); toggleSelectApplicant(applicant.id); }}
                      className="mt-1 w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                    />
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-100 to-slate-100 flex items-center justify-center text-primary-600 font-medium flex-shrink-0">
                      {applicant.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-medium text-slate-900">{applicant.name}</h3>
                          <p className="text-sm text-slate-500">{applicant.currentRole}</p>
                        </div>
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusColor(applicant.status)}`}>
                          {applicant.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mt-1">Applied for: <span className="font-medium">{applicant.job}</span></p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className={`text-sm font-semibold ${getMatchScoreColor(applicant.matchScore)}`}>
                          {applicant.matchScore}% match
                        </span>
                        <span className="text-sm text-slate-400">{applicant.experience} exp</span>
                        <span className="text-sm text-slate-400">{formatDate(applicant.appliedAt)}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {applicant.skills.slice(0, 3).map((skill, i) => (
                          <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded">
                            {skill}
                          </span>
                        ))}
                        {applicant.skills.length > 3 && (
                          <span className="text-xs text-slate-400">+{applicant.skills.length - 3}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredApplicants.length === 0 && (
              <div className="text-center py-16">
                <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h3 className="font-semibold text-slate-900 mb-2">No applicants found</h3>
                <p className="text-sm text-slate-500">Try adjusting your filters</p>
              </div>
            )}
          </div>
        </div>

        {/* Applicant Detail Panel */}
        {selectedApplicant && (
          <div className="hidden xl:block w-96 flex-shrink-0">
            <div className="bg-white rounded-xl border border-slate-200 sticky top-6">
              <div className="p-6 border-b border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-100 to-slate-100 flex items-center justify-center text-primary-600 font-bold text-xl">
                    {selectedApplicant.avatar}
                  </div>
                  <button
                    onClick={() => setSelectedApplicant(null)}
                    className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <h2 className="text-xl font-semibold text-slate-900">{selectedApplicant.name}</h2>
                <p className="text-slate-600">{selectedApplicant.currentRole}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedApplicant.status)}`}>
                    {selectedApplicant.status}
                  </span>
                  <span className={`text-sm font-semibold ${getMatchScoreColor(selectedApplicant.matchScore)}`}>
                    {selectedApplicant.matchScore}% match
                  </span>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Applied For</p>
                  <p className="text-slate-900">{selectedApplicant.job}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Email</p>
                  <p className="text-slate-900">{selectedApplicant.email}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Location</p>
                  <p className="text-slate-900">{selectedApplicant.location}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Experience</p>
                  <p className="text-slate-900">{selectedApplicant.experience}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Education</p>
                  <p className="text-slate-900">{selectedApplicant.education}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedApplicant.skills.map((skill, i) => (
                      <span key={i} className="px-2.5 py-1 bg-primary-50 text-primary-700 text-xs rounded-lg">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 space-y-2">
                <button className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors">
                  Schedule Interview
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button className="py-2.5 border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors">
                    View Resume
                  </button>
                  <button className="py-2.5 border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors">
                    Send Message
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button className="py-2.5 text-green-600 font-medium rounded-lg hover:bg-green-50 transition-colors">
                    Shortlist
                  </button>
                  <button className="py-2.5 text-red-600 font-medium rounded-lg hover:bg-red-50 transition-colors">
                    Reject
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
