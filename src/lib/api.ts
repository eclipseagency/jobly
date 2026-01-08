// API Service Layer
// Replace these functions with real API calls when backend is ready

import { config } from './config';

const API_BASE = config.API_BASE_URL;

// Generic fetch wrapper
async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}

// ============ JOB SEEKER APIs ============

export interface Job {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  type: string;
  workSetup: string;
  salaryMin: number;
  salaryMax: number;
  posted: string;
  applicants: number;
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  skills: string[];
  experience: string;
}

// Raw API response job structure
interface APIJobResponse {
  id: string;
  title: string;
  description: string;
  requirements: string | null;
  location: string | null;
  locationType: string | null;
  salary: string | null;
  jobType: string | null;
  department: string | null;
  createdAt: string;
  company: {
    id: string;
    name: string;
    logo: string | null;
    location: string | null;
    isVerified: boolean;
  };
  applicationsCount: number;
}

function mapAPIJobToJob(apiJob: APIJobResponse): Job {
  return {
    id: apiJob.id,
    title: apiJob.title,
    company: apiJob.company.name,
    companyLogo: apiJob.company.logo || undefined,
    location: apiJob.location || apiJob.company.location || 'Not specified',
    type: apiJob.jobType || 'Full-time',
    workSetup: apiJob.locationType || 'On-site',
    salaryMin: 0,
    salaryMax: 0,
    posted: apiJob.createdAt,
    applicants: apiJob.applicationsCount || 0,
    description: apiJob.description,
    responsibilities: [],
    requirements: apiJob.requirements ? [apiJob.requirements] : [],
    benefits: [],
    skills: [],
    experience: '',
  };
}

export interface Application {
  id: string;
  jobId: string;
  title: string;
  company: string;
  companyAvatar: string;
  location: string;
  salary: string;
  type: string;
  status: 'applied' | 'in_review' | 'interview' | 'offer' | 'rejected' | 'withdrawn';
  statusLabel: string;
  appliedAt: string;
  description: string;
  requirements: string[];
}

export interface Interview {
  id: string;
  applicationId: string;
  title: string;
  company: string;
  companyAvatar: string;
  date: string;
  time: string;
  type: 'video' | 'onsite' | 'phone';
  platform?: string;
  location?: string;
  meetingLink?: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  interviewerName?: string;
  interviewerRole?: string;
  notes?: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  title: string;
  bio: string;
  avatar?: string;
  skills: string[];
  experience: Array<{
    id: string;
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate?: string;
    isCurrent: boolean;
    description: string;
  }>;
  education: Array<{
    id: string;
    school: string;
    degree: string;
    field: string;
    startDate: string;
    endDate?: string;
  }>;
}

// Job Seeker API Functions
export const jobSeekerAPI = {
  // Jobs
  async getJobs(filters?: { search?: string; location?: string; type?: string }): Promise<Job[]> {
    if (!API_BASE) return [];
    const data = await fetchAPI<{ jobs: APIJobResponse[] }>(`/jobs?${new URLSearchParams(filters as Record<string, string>)}`);
    return (data.jobs || []).map(mapAPIJobToJob);
  },

  async getJob(id: string): Promise<Job | null> {
    if (!API_BASE) return null;
    const data = await fetchAPI<{ job: APIJobResponse }>(`/jobs/${id}`);
    return data.job ? mapAPIJobToJob(data.job) : null;
  },

  // Applications
  async getApplications(): Promise<Application[]> {
    if (!API_BASE) return [];
    return fetchAPI<Application[]>('/applications');
  },

  async createApplication(jobId: string, coverLetter?: string): Promise<Application> {
    return fetchAPI<Application>('/applications', {
      method: 'POST',
      body: JSON.stringify({ jobId, coverLetter }),
    });
  },

  async withdrawApplication(id: string): Promise<void> {
    await fetchAPI(`/applications/${id}/withdraw`, { method: 'POST' });
  },

  // Interviews
  async getInterviews(): Promise<Interview[]> {
    if (!API_BASE) return [];
    return fetchAPI<Interview[]>('/interviews');
  },

  async confirmInterview(id: string): Promise<void> {
    await fetchAPI(`/interviews/${id}/confirm`, { method: 'POST' });
  },

  async rescheduleInterview(id: string, date: string, time: string): Promise<void> {
    await fetchAPI(`/interviews/${id}/reschedule`, {
      method: 'POST',
      body: JSON.stringify({ date, time }),
    });
  },

  // Profile
  async getProfile(): Promise<UserProfile | null> {
    if (!API_BASE) return null;
    return fetchAPI<UserProfile>('/profile');
  },

  async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    return fetchAPI<UserProfile>('/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Saved Jobs
  async getSavedJobs(): Promise<Job[]> {
    if (!API_BASE) return [];
    return fetchAPI<Job[]>('/saved-jobs');
  },

  async saveJob(jobId: string): Promise<void> {
    await fetchAPI('/saved-jobs', {
      method: 'POST',
      body: JSON.stringify({ jobId }),
    });
  },

  async unsaveJob(jobId: string): Promise<void> {
    await fetchAPI(`/saved-jobs/${jobId}`, { method: 'DELETE' });
  },
};

// ============ EMPLOYER APIs ============

export interface JobPosting {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  workSetup: string;
  salaryMin: number;
  salaryMax: number;
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  skills: string[];
  status: 'Active' | 'Paused' | 'Closed' | 'Draft';
  applicants: number;
  views: number;
  posted: string;
  expires: string;
}

export interface Applicant {
  id: string;
  jobId: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  title: string;
  location: string;
  experience: string;
  appliedAt: string;
  status: 'New' | 'Reviewed' | 'Shortlisted' | 'Interview' | 'Hired' | 'Rejected';
  matchScore?: number;
  resumeUrl?: string;
  skills: string[];
}

export interface CompanyProfile {
  id: string;
  name: string;
  tagline: string;
  industry: string;
  size: string;
  founded: string;
  website: string;
  email: string;
  phone: string;
  location: string;
  about: string;
  mission?: string;
  vision?: string;
  culture: string[];
  benefits: string[];
  logo?: string;
  coverImage?: string;
}

export interface AnalyticsData {
  totalViews: number;
  totalApplications: number;
  interviewRate: number;
  hireRate: number;
  viewsChange: number;
  applicationsChange: number;
  jobPerformance: Array<{
    id: string;
    title: string;
    views: number;
    applications: number;
    interviews: number;
    hires: number;
  }>;
}

// Employer API Functions
export const employerAPI = {
  // Job Postings
  async getJobPostings(): Promise<JobPosting[]> {
    if (!API_BASE) return [];
    return fetchAPI<JobPosting[]>('/employer/jobs');
  },

  async getJobPosting(id: string): Promise<JobPosting | null> {
    if (!API_BASE) return null;
    return fetchAPI<JobPosting>(`/employer/jobs/${id}`);
  },

  async createJobPosting(data: Omit<JobPosting, 'id' | 'applicants' | 'views' | 'posted'>): Promise<JobPosting> {
    return fetchAPI<JobPosting>('/employer/jobs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateJobPosting(id: string, data: Partial<JobPosting>): Promise<JobPosting> {
    return fetchAPI<JobPosting>(`/employer/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteJobPosting(id: string): Promise<void> {
    await fetchAPI(`/employer/jobs/${id}`, { method: 'DELETE' });
  },

  // Applicants
  async getApplicants(jobId?: string): Promise<Applicant[]> {
    if (!API_BASE) return [];
    const query = jobId ? `?jobId=${jobId}` : '';
    return fetchAPI<Applicant[]>(`/employer/applicants${query}`);
  },

  async updateApplicantStatus(id: string, status: Applicant['status']): Promise<Applicant> {
    return fetchAPI<Applicant>(`/employer/applicants/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  // Company Profile
  async getCompanyProfile(): Promise<CompanyProfile | null> {
    if (!API_BASE) return null;
    return fetchAPI<CompanyProfile>('/employer/company');
  },

  async updateCompanyProfile(data: Partial<CompanyProfile>): Promise<CompanyProfile> {
    return fetchAPI<CompanyProfile>('/employer/company', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Analytics
  async getAnalytics(period: '7d' | '30d' | '90d' = '30d'): Promise<AnalyticsData | null> {
    if (!API_BASE) return null;
    return fetchAPI<AnalyticsData>(`/employer/analytics?period=${period}`);
  },

  // Schedule Interview
  async scheduleInterview(applicantId: string, data: {
    date: string;
    time: string;
    type: 'video' | 'onsite' | 'phone';
    notes?: string;
  }): Promise<void> {
    await fetchAPI(`/employer/applicants/${applicantId}/interview`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Send Offer
  async sendOffer(applicantId: string, data: {
    salary: string;
    startDate: string;
    benefits?: string;
    notes?: string;
  }): Promise<void> {
    await fetchAPI(`/employer/applicants/${applicantId}/offer`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// ============ AUTH APIs ============

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  type: 'jobseeker' | 'employer';
  avatar?: string;
}

export const authAPI = {
  async login(email: string, password: string, type: 'jobseeker' | 'employer'): Promise<AuthUser> {
    return fetchAPI<AuthUser>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, type }),
    });
  },

  async register(data: {
    email: string;
    password: string;
    name: string;
    type: 'jobseeker' | 'employer';
    companyName?: string;
  }): Promise<AuthUser> {
    return fetchAPI<AuthUser>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async logout(): Promise<void> {
    await fetchAPI('/auth/logout', { method: 'POST' });
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    if (!API_BASE) return null;
    return fetchAPI<AuthUser>('/auth/me');
  },

  async forgotPassword(email: string): Promise<void> {
    await fetchAPI('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async resetPassword(token: string, password: string): Promise<void> {
    await fetchAPI('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  },
};

// ============ MESSAGING APIs ============

export interface Conversation {
  id: string;
  jobseekerId: string;
  jobseekerName: string;
  employerId: string;
  employerName: string;
  jobTitle: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderType: 'jobseeker' | 'employer';
  text: string;
  timestamp: string;
  read: boolean;
}

export const messagingAPI = {
  async getConversations(): Promise<Conversation[]> {
    if (!API_BASE) return [];
    return fetchAPI<Conversation[]>('/messages/conversations');
  },

  async getMessages(conversationId: string): Promise<Message[]> {
    if (!API_BASE) return [];
    return fetchAPI<Message[]>(`/messages/conversations/${conversationId}`);
  },

  async sendMessage(conversationId: string, text: string): Promise<Message> {
    return fetchAPI<Message>(`/messages/conversations/${conversationId}`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  },

  async markAsRead(conversationId: string): Promise<void> {
    await fetchAPI(`/messages/conversations/${conversationId}/read`, { method: 'POST' });
  },

  async startConversation(data: {
    recipientId: string;
    jobId: string;
    message: string;
  }): Promise<Conversation> {
    return fetchAPI<Conversation>('/messages/conversations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
