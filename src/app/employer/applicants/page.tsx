'use client';

import { useState } from 'react';

interface Applicant {
  id: string;
  name: string;
  email: string;
  avatar: string;
  job: string;
  jobId: string;
  appliedAt: string;
  status: 'New' | 'Reviewed' | 'Shortlisted' | 'Interview' | 'Hired' | 'Rejected';
  matchScore: number;
  experience: string;
  location: string;
  skills: string[];
  education: string;
  currentRole: string;
  resumeUrl: string;
  phone?: string;
  summary?: string;
}

const initialApplicants: Applicant[] = [
  {
    id: '1',
    name: 'Maria Santos',
    email: 'maria.santos@email.com',
    phone: '+63 917 123 4567',
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
    summary: 'Passionate frontend developer with expertise in modern React ecosystems. Led multiple successful projects and mentored junior developers.',
  },
  {
    id: '2',
    name: 'John Reyes',
    email: 'john.reyes@email.com',
    phone: '+63 918 234 5678',
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
    summary: 'Full stack developer experienced in building scalable applications. Strong background in cloud infrastructure.',
  },
  {
    id: '3',
    name: 'Ana Cruz',
    email: 'ana.cruz@email.com',
    phone: '+63 919 345 6789',
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
    summary: 'Award-winning designer focused on creating intuitive user experiences. Strong advocate for user-centered design.',
  },
  {
    id: '4',
    name: 'Miguel Lopez',
    email: 'miguel.lopez@email.com',
    phone: '+63 920 456 7890',
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
    summary: 'Infrastructure specialist with a focus on automation and CI/CD pipelines.',
  },
  {
    id: '5',
    name: 'Sarah Garcia',
    email: 'sarah.garcia@email.com',
    phone: '+63 921 567 8901',
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
    summary: 'Technical lead with experience managing frontend teams. Passionate about code quality and performance.',
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
    phone: '+63 922 678 9012',
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
    summary: 'Design leader with international experience. Built and scaled design systems for Fortune 500 companies.',
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

const jobOptions = [
  { id: 'all', title: 'All Jobs' },
  { id: '1', title: 'Senior Frontend Developer' },
  { id: '2', title: 'Full Stack Engineer' },
  { id: '3', title: 'Product Designer' },
  { id: '4', title: 'DevOps Engineer' },
];

const statusOptions: Array<'All' | Applicant['status']> = ['All', 'New', 'Reviewed', 'Shortlisted', 'Interview', 'Hired', 'Rejected'];

export default function ApplicantsPage() {
  const [applicants, setApplicants] = useState<Applicant[]>(initialApplicants);
  const [selectedJob, setSelectedJob] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState<'All' | Applicant['status']>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [selectedApplicants, setSelectedApplicants] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);

  const filteredApplicants = applicants.filter(applicant => {
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
      case 'New': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Reviewed': return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'Shortlisted': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'Interview': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Hired': return 'bg-green-50 text-green-700 border-green-200';
      case 'Rejected': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50';
    if (score >= 75) return 'text-yellow-600 bg-yellow-50';
    return 'text-slate-500 bg-slate-50';
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

  const handleViewApplicant = (applicant: Applicant) => {
    setSelectedApplicant(applicant);
    setShowModal(true);
  };

  const updateApplicantStatus = (applicantId: string, newStatus: Applicant['status']) => {
    setApplicants(prev => prev.map(app =>
      app.id === applicantId ? { ...app, status: newStatus } : app
    ));
    if (selectedApplicant?.id === applicantId) {
      setSelectedApplicant(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  const handleShortlist = (applicant: Applicant) => {
    updateApplicantStatus(applicant.id, 'Shortlisted');
  };

  const handleScheduleInterview = (applicant: Applicant) => {
    updateApplicantStatus(applicant.id, 'Interview');
    alert(`Interview scheduled with ${applicant.name}. They will receive an email notification.`);
  };

  const handleReject = (applicant: Applicant) => {
    if (confirm(`Are you sure you want to reject ${applicant.name}'s application?`)) {
      updateApplicantStatus(applicant.id, 'Rejected');
    }
  };

  const handleHire = (applicant: Applicant) => {
    if (confirm(`Confirm hiring ${applicant.name}?`)) {
      updateApplicantStatus(applicant.id, 'Hired');
      alert(`Congratulations! ${applicant.name} has been marked as hired. They will receive an offer email.`);
    }
  };

  const ApplicantDetailContent = ({ applicant }: { applicant: Applicant }) => (
    <>
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-100 to-slate-100 flex items-center justify-center text-primary-600 font-bold text-xl">
            {applicant.avatar}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-slate-900">{applicant.name}</h2>
            <p className="text-slate-600">{applicant.currentRole}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusColor(applicant.status)}`}>
                {applicant.status}
              </span>
              <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getMatchScoreColor(applicant.matchScore)}`}>
                {applicant.matchScore}% match
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-5 overflow-y-auto max-h-[50vh] xl:max-h-none">
        {applicant.summary && (
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Summary</p>
            <p className="text-slate-700 text-sm">{applicant.summary}</p>
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Applied For</p>
            <p className="text-slate-900 text-sm font-medium">{applicant.job}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Experience</p>
            <p className="text-slate-900 text-sm">{applicant.experience}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Location</p>
            <p className="text-slate-900 text-sm">{applicant.location}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Applied</p>
            <p className="text-slate-900 text-sm">{formatDate(applicant.appliedAt)}</p>
          </div>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Email</p>
          <a href={`mailto:${applicant.email}`} className="text-primary-600 hover:underline text-sm">{applicant.email}</a>
        </div>
        {applicant.phone && (
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Phone</p>
            <a href={`tel:${applicant.phone}`} className="text-primary-600 hover:underline text-sm">{applicant.phone}</a>
          </div>
        )}
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Education</p>
          <p className="text-slate-900 text-sm">{applicant.education}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Skills</p>
          <div className="flex flex-wrap gap-1.5">
            {applicant.skills.map((skill, i) => (
              <span key={i} className="px-2.5 py-1 bg-primary-50 text-primary-700 text-xs rounded-lg">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6 border-t border-slate-100 space-y-3">
        {applicant.status !== 'Hired' && applicant.status !== 'Rejected' && (
          <>
            {applicant.status !== 'Interview' && (
              <button
                onClick={() => handleScheduleInterview(applicant)}
                className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
              >
                Schedule Interview
              </button>
            )}
            {applicant.status === 'Interview' && (
              <button
                onClick={() => handleHire(applicant)}
                className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
              >
                Send Offer
              </button>
            )}
          </>
        )}
        <div className="grid grid-cols-2 gap-2">
          <button className="py-2.5 border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors text-sm">
            View Resume
          </button>
          <button className="py-2.5 border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors text-sm">
            Send Message
          </button>
        </div>
        {applicant.status !== 'Hired' && applicant.status !== 'Rejected' && (
          <div className="grid grid-cols-2 gap-2">
            {applicant.status !== 'Shortlisted' && applicant.status !== 'Interview' && (
              <button
                onClick={() => handleShortlist(applicant)}
                className="py-2.5 text-green-600 font-medium rounded-lg hover:bg-green-50 transition-colors text-sm"
              >
                Shortlist
              </button>
            )}
            <button
              onClick={() => handleReject(applicant)}
              className={`py-2.5 text-red-600 font-medium rounded-lg hover:bg-red-50 transition-colors text-sm ${
                applicant.status !== 'Shortlisted' && applicant.status !== 'Interview' ? '' : 'col-span-2'
              }`}
            >
              Reject
            </button>
          </div>
        )}
        {applicant.status === 'Hired' && (
          <div className="text-center py-2 text-green-600 font-medium text-sm">
            This candidate has been hired
          </div>
        )}
        {applicant.status === 'Rejected' && (
          <div className="text-center py-2 text-slate-500 font-medium text-sm">
            This application has been rejected
          </div>
        )}
      </div>
    </>
  );

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
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

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{applicants.filter(a => a.status === 'New').length}</p>
              <p className="text-xs text-slate-500">New</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-50 flex items-center justify-center">
              <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600">{applicants.filter(a => a.status === 'Shortlisted').length}</p>
              <p className="text-xs text-slate-500">Shortlisted</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">{applicants.filter(a => a.status === 'Interview').length}</p>
              <p className="text-xs text-slate-500">Interview</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{applicants.filter(a => a.status === 'Hired').length}</p>
              <p className="text-xs text-slate-500">Hired</p>
            </div>
          </div>
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
          <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0">
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
        <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-sm text-primary-700">
            <span className="font-semibold">{selectedApplicants.length}</span> applicant(s) selected
          </p>
          <div className="flex flex-wrap gap-2">
            <button className="px-3 py-1.5 text-sm font-medium text-primary-700 hover:bg-primary-100 rounded-lg transition-colors">
              Move to Shortlist
            </button>
            <button className="px-3 py-1.5 text-sm font-medium text-primary-700 hover:bg-primary-100 rounded-lg transition-colors">
              Schedule Interview
            </button>
            <button className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors">
              Reject
            </button>
            <button
              onClick={() => setSelectedApplicants([])}
              className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Clear
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
                  className={`p-4 lg:p-5 hover:bg-slate-50 transition-colors cursor-pointer ${
                    selectedApplicant?.id === applicant.id ? 'bg-primary-50 xl:bg-primary-50' : ''
                  }`}
                  onClick={() => handleViewApplicant(applicant)}
                >
                  <div className="flex items-start gap-3 lg:gap-4">
                    <input
                      type="checkbox"
                      checked={selectedApplicants.includes(applicant.id)}
                      onChange={(e) => { e.stopPropagation(); toggleSelectApplicant(applicant.id); }}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-1 w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                    />
                    <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-gradient-to-br from-primary-100 to-slate-100 flex items-center justify-center text-primary-600 font-medium flex-shrink-0 text-sm lg:text-base">
                      {applicant.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-medium text-slate-900">{applicant.name}</h3>
                          <p className="text-sm text-slate-500 truncate">{applicant.currentRole}</p>
                        </div>
                        <span className={`px-2 lg:px-2.5 py-1 text-xs font-medium rounded-full border flex-shrink-0 ${getStatusColor(applicant.status)}`}>
                          {applicant.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mt-1 hidden sm:block">Applied for: <span className="font-medium">{applicant.job}</span></p>
                      <div className="flex items-center gap-2 lg:gap-4 mt-2 flex-wrap">
                        <span className={`text-sm font-semibold px-2 py-0.5 rounded ${getMatchScoreColor(applicant.matchScore)}`}>
                          {applicant.matchScore}% match
                        </span>
                        <span className="text-sm text-slate-400 hidden sm:inline">{applicant.experience} exp</span>
                        <span className="text-sm text-slate-400">{formatDate(applicant.appliedAt)}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2 hidden md:flex">
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
                    <svg className="w-5 h-5 text-slate-400 flex-shrink-0 xl:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                    </svg>
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

        {/* Desktop Applicant Detail Panel */}
        {selectedApplicant && (
          <div className="hidden xl:block w-96 flex-shrink-0">
            <div className="bg-white rounded-xl border border-slate-200 sticky top-6">
              <button
                onClick={() => setSelectedApplicant(null)}
                className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 z-10"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <ApplicantDetailContent applicant={selectedApplicant} />
            </div>
          </div>
        )}
      </div>

      {/* Mobile/Tablet Modal */}
      {showModal && selectedApplicant && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 xl:hidden">
          <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900">Applicant Details</h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedApplicant(null);
                }}
                className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto max-h-[calc(90vh-60px)]">
              <ApplicantDetailContent applicant={selectedApplicant} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
