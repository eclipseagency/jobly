'use client';

import { useState, useEffect, useRef } from 'react';
import { Modal } from '@/components/ui/Modal';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toast';

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
  const { user } = useAuth();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);

  // Parse user name into first and last name
  const nameParts = (user?.name || '').split(' ');
  const defaultFirstName = nameParts[0] || '';
  const defaultLastName = nameParts.slice(1).join(' ') || '';

  // Profile data initialized with user's actual data
  const [profile, setProfile] = useState({
    // Personal Info - populated from auth context
    firstName: defaultFirstName,
    lastName: defaultLastName,
    email: user?.email || '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    nationality: 'Filipino',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    country: 'Philippines',

    // Professional Info
    title: '',
    bio: '',
    yearsOfExp: 0,

    // Links
    linkedinUrl: '',
    githubUrl: '',
    portfolioUrl: '',
    websiteUrl: '',

    // Job Preferences
    expectedSalary: '',
    preferredJobType: 'full-time',
    preferredWorkSetup: 'hybrid',
    availableFrom: '',
    willingToRelocate: false,
    openToOffers: true,
    preferredLocations: [] as string[],
    preferredIndustries: [] as string[],
  });

  // Update profile when user changes
  useEffect(() => {
    if (user) {
      const nameParts = (user.name || '').split(' ');
      setProfile(prev => ({
        ...prev,
        firstName: nameParts[0] || prev.firstName,
        lastName: nameParts.slice(1).join(' ') || prev.lastName,
        email: user.email || prev.email,
      }));
    }
  }, [user]);

  const [skills, setSkills] = useState<Array<{ name: string; level: string; years: number }>>([]);

  interface ExperienceItem {
    id: number;
    jobTitle: string;
    company: string;
    location: string;
    locationType: string;
    employmentType: string;
    startDate: string;
    endDate: string | null;
    isCurrent: boolean;
    description: string;
    achievements: string[];
    skills: string[];
  }

  interface EducationItem {
    id: number;
    school: string;
    degree: string;
    fieldOfStudy: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
    grade: string;
    activities: string;
    achievements: string[];
  }

  interface CertificationItem {
    id: number;
    name: string;
    issuingOrg: string;
    issueDate: string;
    expiryDate: string | null;
    hasNoExpiry: boolean;
    credentialId: string;
    credentialUrl: string;
  }

  interface DocumentFile {
    name: string;
    uploadedAt: string;
    size: string;
  }

  const [experience, setExperience] = useState<ExperienceItem[]>([]);

  const [education, setEducation] = useState<EducationItem[]>([]);

  const [certifications, setCertifications] = useState<CertificationItem[]>([]);

  const [languages, setLanguages] = useState<Array<{ id: number; language: string; proficiency: string }>>([]);

  const [documents, setDocuments] = useState<{
    resume: DocumentFile | null;
    coverLetter: DocumentFile | null;
    certificates: DocumentFile[];
  }>({
    resume: null,
    coverLetter: null,
    certificates: [],
  });

  interface ReferenceItem {
    id: number;
    name: string;
    position: string;
    company: string;
    email: string;
    phone: string;
    relationship: string;
  }

  const [references, setReferences] = useState<ReferenceItem[]>([]);

  // Load profile data from localStorage on mount
  useEffect(() => {
    if (user?.id) {
      try {
        const savedProfile = localStorage.getItem(`jobly_profile_${user.id}`);
        if (savedProfile) {
          const parsed = JSON.parse(savedProfile);
          if (parsed.profile) setProfile(prev => ({ ...prev, ...parsed.profile }));
          if (parsed.skills) setSkills(parsed.skills);
          if (parsed.experience) setExperience(parsed.experience);
          if (parsed.education) setEducation(parsed.education);
          if (parsed.certifications) setCertifications(parsed.certifications);
          if (parsed.languages) setLanguages(parsed.languages);
          if (parsed.documents) setDocuments(parsed.documents);
          if (parsed.references) setReferences(parsed.references);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    }
  }, [user?.id]);

  // Save profile data to localStorage whenever it changes
  useEffect(() => {
    if (user?.id && profile.firstName) {
      const dataToSave = {
        profile,
        skills,
        experience,
        education,
        certifications,
        languages,
        documents,
        references,
      };
      localStorage.setItem(`jobly_profile_${user.id}`, JSON.stringify(dataToSave));
    }
  }, [user?.id, profile, skills, experience, education, certifications, languages, documents, references]);

  // Modal states
  const [showBasicInfoModal, setShowBasicInfoModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showBioModal, setShowBioModal] = useState(false);
  const [showLinksModal, setShowLinksModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showReferenceModal, setShowReferenceModal] = useState(false);
  const [showExperienceModal, setShowExperienceModal] = useState(false);
  const [showEducationModal, setShowEducationModal] = useState(false);
  const [showCertificationModal, setShowCertificationModal] = useState(false);
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [showLocationsModal, setShowLocationsModal] = useState(false);
  const [showIndustriesModal, setShowIndustriesModal] = useState(false);

  // Edit form states
  const [editingProfile, setEditingProfile] = useState({ ...profile });
  const [editingLanguage, setEditingLanguage] = useState<{ id?: number; language: string; proficiency: string } | null>(null);
  const [editingReference, setEditingReference] = useState<ReferenceItem | null>(null);
  const [editingExperience, setEditingExperience] = useState<ExperienceItem | null>(null);
  const [editingEducation, setEditingEducation] = useState<EducationItem | null>(null);
  const [editingCertification, setEditingCertification] = useState<CertificationItem | null>(null);
  const [editingSkill, setEditingSkill] = useState<{ name: string; level: string; years: number } | null>(null);

  // File upload refs
  const resumeInputRef = useRef<HTMLInputElement>(null);
  const coverLetterInputRef = useRef<HTMLInputElement>(null);
  const certificateInputRef = useRef<HTMLInputElement>(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [uploadingCoverLetter, setUploadingCoverLetter] = useState(false);
  const [uploadingCertificate, setUploadingCertificate] = useState(false);

  // File upload handlers
  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      toast.warning('Please upload a PDF, DOC, or DOCX file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.warning('File size must be less than 5MB');
      return;
    }

    setUploadingResume(true);
    try {
      // Convert to base64 for localStorage storage
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        const newDocument: DocumentFile = {
          name: file.name,
          uploadedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          size: formatFileSize(file.size),
        };
        // Store both metadata and file data
        setDocuments(prev => ({ ...prev, resume: newDocument }));
        // Store the actual file data separately
        if (user?.id) {
          localStorage.setItem(`jobly_resume_${user.id}`, base64);
          localStorage.setItem(`jobly_resume_name_${user.id}`, file.name);
        }
        setUploadingResume(false);
        toast.success('Resume uploaded successfully');
      };
      reader.readAsDataURL(file);
    } catch {
      toast.error('Failed to upload resume. Please try again.');
      setUploadingResume(false);
    }
    // Reset input
    if (resumeInputRef.current) resumeInputRef.current.value = '';
  };

  const handleCoverLetterUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      toast.warning('Please upload a PDF, DOC, or DOCX file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.warning('File size must be less than 5MB');
      return;
    }

    setUploadingCoverLetter(true);
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        const newDocument: DocumentFile = {
          name: file.name,
          uploadedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          size: formatFileSize(file.size),
        };
        setDocuments(prev => ({ ...prev, coverLetter: newDocument }));
        if (user?.id) {
          localStorage.setItem(`jobly_cover_letter_${user.id}`, base64);
        }
        setUploadingCoverLetter(false);
        toast.success('Cover letter uploaded successfully');
      };
      reader.readAsDataURL(file);
    } catch {
      toast.error('Failed to upload cover letter. Please try again.');
      setUploadingCoverLetter(false);
    }
    if (coverLetterInputRef.current) coverLetterInputRef.current.value = '';
  };

  const handleCertificateUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.warning('File size must be less than 5MB');
      return;
    }

    setUploadingCertificate(true);
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        const newDocument: DocumentFile = {
          name: file.name,
          uploadedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          size: formatFileSize(file.size),
        };
        setDocuments(prev => ({ ...prev, certificates: [...prev.certificates, newDocument] }));
        // Store certificates with index
        if (user?.id) {
          const existingCerts = JSON.parse(localStorage.getItem(`jobly_certificates_${user.id}`) || '[]');
          existingCerts.push({ name: file.name, data: base64 });
          localStorage.setItem(`jobly_certificates_${user.id}`, JSON.stringify(existingCerts));
        }
        setUploadingCertificate(false);
        toast.success('Certificate uploaded successfully');
      };
      reader.readAsDataURL(file);
    } catch {
      toast.error('Failed to upload certificate. Please try again.');
      setUploadingCertificate(false);
    }
    if (certificateInputRef.current) certificateInputRef.current.value = '';
  };

  const deleteResume = () => {
    setDocuments(prev => ({ ...prev, resume: null }));
    if (user?.id) {
      localStorage.removeItem(`jobly_resume_${user.id}`);
      localStorage.removeItem(`jobly_resume_name_${user.id}`);
    }
  };

  const deleteCoverLetter = () => {
    setDocuments(prev => ({ ...prev, coverLetter: null }));
    if (user?.id) {
      localStorage.removeItem(`jobly_cover_letter_${user.id}`);
    }
  };

  const deleteCertificate = (index: number) => {
    setDocuments(prev => ({
      ...prev,
      certificates: prev.certificates.filter((_, i) => i !== index)
    }));
    if (user?.id) {
      const existingCerts = JSON.parse(localStorage.getItem(`jobly_certificates_${user.id}`) || '[]');
      existingCerts.splice(index, 1);
      localStorage.setItem(`jobly_certificates_${user.id}`, JSON.stringify(existingCerts));
    }
  };

  const viewDocument = (type: 'resume' | 'coverLetter' | 'certificate', index?: number) => {
    if (!user?.id) return;
    let data: string | null = null;

    if (type === 'resume') {
      data = localStorage.getItem(`jobly_resume_${user.id}`);
    } else if (type === 'coverLetter') {
      data = localStorage.getItem(`jobly_cover_letter_${user.id}`);
    } else if (type === 'certificate' && index !== undefined) {
      const certs = JSON.parse(localStorage.getItem(`jobly_certificates_${user.id}`) || '[]');
      data = certs[index]?.data;
    }

    if (data) {
      // Open in new tab
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(`<iframe src="${data}" style="width:100%;height:100%;border:none;"></iframe>`);
      }
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Save handlers
  const saveBasicInfo = () => {
    setProfile({ ...profile, ...editingProfile });
    setShowBasicInfoModal(false);
  };

  const saveAddress = () => {
    setProfile({ ...profile, address: editingProfile.address, city: editingProfile.city, province: editingProfile.province, postalCode: editingProfile.postalCode, country: editingProfile.country });
    setShowAddressModal(false);
  };

  const saveBio = () => {
    setProfile({ ...profile, bio: editingProfile.bio, title: editingProfile.title });
    setShowBioModal(false);
  };

  const saveLinks = () => {
    setProfile({ ...profile, linkedinUrl: editingProfile.linkedinUrl, githubUrl: editingProfile.githubUrl, portfolioUrl: editingProfile.portfolioUrl, websiteUrl: editingProfile.websiteUrl });
    setShowLinksModal(false);
  };

  const saveLanguage = () => {
    if (!editingLanguage) return;
    if (editingLanguage.id) {
      setLanguages(languages.map(l => l.id === editingLanguage.id ? editingLanguage as typeof l : l));
    } else {
      setLanguages([...languages, { ...editingLanguage, id: Date.now() }]);
    }
    setShowLanguageModal(false);
    setEditingLanguage(null);
  };

  const deleteLanguage = (id: number) => {
    setLanguages(languages.filter(l => l.id !== id));
  };

  const saveReference = () => {
    if (!editingReference) return;
    if (editingReference.id) {
      setReferences(references.map(r => r.id === editingReference.id ? editingReference : r));
    } else {
      setReferences([...references, { ...editingReference, id: Date.now() }]);
    }
    setShowReferenceModal(false);
    setEditingReference(null);
  };

  const deleteReference = (id: number) => {
    setReferences(references.filter(r => r.id !== id));
  };

  const saveExperience = () => {
    if (!editingExperience) return;
    if (experience.find(e => e.id === editingExperience.id)) {
      setExperience(experience.map(e => e.id === editingExperience.id ? editingExperience : e));
    } else {
      setExperience([...experience, { ...editingExperience, id: Date.now() }]);
    }
    setShowExperienceModal(false);
    setEditingExperience(null);
  };

  const deleteExperience = (id: number) => {
    setExperience(experience.filter(e => e.id !== id));
  };

  const saveEducation = () => {
    if (!editingEducation) return;
    if (education.find(e => e.id === editingEducation.id)) {
      setEducation(education.map(e => e.id === editingEducation.id ? editingEducation : e));
    } else {
      setEducation([...education, { ...editingEducation, id: Date.now() }]);
    }
    setShowEducationModal(false);
    setEditingEducation(null);
  };

  const deleteEducation = (id: number) => {
    setEducation(education.filter(e => e.id !== id));
  };

  const saveCertification = () => {
    if (!editingCertification) return;
    if (certifications.find(c => c.id === editingCertification.id)) {
      setCertifications(certifications.map(c => c.id === editingCertification.id ? editingCertification : c));
    } else {
      setCertifications([...certifications, { ...editingCertification, id: Date.now() }]);
    }
    setShowCertificationModal(false);
    setEditingCertification(null);
  };

  const deleteCertification = (id: number) => {
    setCertifications(certifications.filter(c => c.id !== id));
  };

  const saveSkill = () => {
    if (!editingSkill) return;
    const existingIndex = skills.findIndex(s => s.name === editingSkill.name);
    if (existingIndex >= 0) {
      const newSkills = [...skills];
      newSkills[existingIndex] = editingSkill;
      setSkills(newSkills);
    } else {
      setSkills([...skills, editingSkill]);
    }
    setShowSkillModal(false);
    setEditingSkill(null);
  };

  const deleteSkill = (name: string) => {
    setSkills(skills.filter(s => s.name !== name));
  };

  const savePreferences = () => {
    setProfile({ ...profile, expectedSalary: editingProfile.expectedSalary, preferredJobType: editingProfile.preferredJobType, preferredWorkSetup: editingProfile.preferredWorkSetup, availableFrom: editingProfile.availableFrom, willingToRelocate: editingProfile.willingToRelocate, openToOffers: editingProfile.openToOffers });
    setShowPreferencesModal(false);
  };

  const saveLocations = () => {
    setProfile({ ...profile, preferredLocations: editingProfile.preferredLocations });
    setShowLocationsModal(false);
  };

  const saveIndustries = () => {
    setProfile({ ...profile, preferredIndustries: editingProfile.preferredIndustries });
    setShowIndustriesModal(false);
  };

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
                <button onClick={() => { setEditingProfile({ ...profile }); setShowBasicInfoModal(true); }} className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
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
                <button onClick={() => { setEditingProfile({ ...profile }); setShowAddressModal(true); }} className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
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
                <button onClick={() => { setEditingProfile({ ...profile }); setShowBioModal(true); }} className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
                  {Icons.edit} Edit
                </button>
              </div>
              <p className="text-slate-600 leading-relaxed">{profile.bio}</p>
            </div>

            {/* Social Links */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-slate-900">Social & Professional Links</h2>
                <button onClick={() => { setEditingProfile({ ...profile }); setShowLinksModal(true); }} className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
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
                <button onClick={() => { setEditingLanguage({ language: '', proficiency: 'Basic' }); setShowLanguageModal(true); }} className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
                  {Icons.plus} Add
                </button>
              </div>
              <div className="flex flex-wrap gap-3">
                {languages.map((lang) => (
                  <div key={lang.id} className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-lg group">
                    <span className="font-medium text-slate-900">{lang.language}</span>
                    <span className="text-xs px-2 py-0.5 bg-slate-200 text-slate-600 rounded-full">{lang.proficiency}</span>
                    <button onClick={() => { setEditingLanguage(lang); setShowLanguageModal(true); }} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-primary-600 ml-1">{Icons.edit}</button>
                    <button onClick={() => deleteLanguage(lang.id)} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-600">{Icons.trash}</button>
                  </div>
                ))}
              </div>
            </div>

            {/* References */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900">Professional References</h2>
                <button onClick={() => { setEditingReference({ id: 0, name: '', position: '', company: '', email: '', phone: '', relationship: '' }); setShowReferenceModal(true); }} className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
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
                      <div className="flex gap-1">
                        <button onClick={() => { setEditingReference(ref); setShowReferenceModal(true); }} className="text-slate-400 hover:text-primary-600">{Icons.edit}</button>
                        <button onClick={() => deleteReference(ref.id)} className="text-slate-400 hover:text-red-600">{Icons.trash}</button>
                      </div>
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
                <button onClick={() => { setEditingExperience({ id: 0, jobTitle: '', company: '', location: '', locationType: 'onsite', employmentType: 'full-time', startDate: '', endDate: null, isCurrent: false, description: '', achievements: [], skills: [] }); setShowExperienceModal(true); }} className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2">
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
                          <button onClick={() => { setEditingExperience(exp); setShowExperienceModal(true); }} className="p-2 text-slate-400 hover:text-primary-600 hover:bg-white rounded-lg transition-colors">{Icons.edit}</button>
                          <button onClick={() => deleteExperience(exp.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg transition-colors">{Icons.trash}</button>
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
                <button onClick={() => { setEditingEducation({ id: 0, school: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '', isCurrent: false, grade: '', activities: '', achievements: [] }); setShowEducationModal(true); }} className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2">
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
                        <button onClick={() => { setEditingEducation(edu); setShowEducationModal(true); }} className="p-2 text-slate-400 hover:text-primary-600 hover:bg-white rounded-lg transition-colors">{Icons.edit}</button>
                        <button onClick={() => deleteEducation(edu.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg transition-colors">{Icons.trash}</button>
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
                <button onClick={() => { setEditingCertification({ id: 0, name: '', issuingOrg: '', issueDate: '', expiryDate: null, hasNoExpiry: false, credentialId: '', credentialUrl: '' }); setShowCertificationModal(true); }} className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2">
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
                      <div className="flex flex-col gap-1">
                        <button onClick={() => { setEditingCertification(cert); setShowCertificationModal(true); }} className="p-1 text-slate-400 hover:text-primary-600">{Icons.edit}</button>
                        <button onClick={() => deleteCertification(cert.id)} className="p-1 text-slate-400 hover:text-red-600">{Icons.trash}</button>
                      </div>
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
              <button onClick={() => { setEditingSkill({ name: '', level: 'Basic', years: 1 }); setShowSkillModal(true); }} className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2">
                {Icons.plus} Add Skill
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {skills.map((skill, index) => (
                <div key={index} className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-slate-900">{skill.name}</h3>
                    <div className="flex gap-1">
                      <button onClick={() => { setEditingSkill(skill); setShowSkillModal(true); }} className="text-slate-400 hover:text-primary-600">{Icons.edit}</button>
                      <button onClick={() => deleteSkill(skill.name)} className="text-slate-400 hover:text-red-600">{Icons.trash}</button>
                    </div>
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
            {/* Hidden file inputs */}
            <input
              ref={resumeInputRef}
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleResumeUpload}
              className="hidden"
            />
            <input
              ref={coverLetterInputRef}
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleCoverLetterUpload}
              className="hidden"
            />
            <input
              ref={certificateInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,image/*,application/pdf"
              onChange={handleCertificateUpload}
              className="hidden"
            />

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
                    <button onClick={() => viewDocument('resume')} className="px-3 py-1.5 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">View</button>
                    <button onClick={() => resumeInputRef.current?.click()} className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Replace</button>
                    <button onClick={deleteResume} className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">Delete</button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => resumeInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center cursor-pointer hover:border-primary-300 hover:bg-primary-50/30 transition-colors"
                >
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 mx-auto mb-3">
                    {uploadingResume ? (
                      <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      Icons.upload
                    )}
                  </div>
                  <p className="text-slate-600 mb-2">
                    {uploadingResume ? 'Uploading...' : 'Drag and drop your resume here, or click to browse'}
                  </p>
                  <p className="text-xs text-slate-400">PDF, DOC, DOCX up to 5MB</p>
                  <button
                    onClick={(e) => { e.stopPropagation(); resumeInputRef.current?.click(); }}
                    disabled={uploadingResume}
                    className="mt-4 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                  >
                    {uploadingResume ? 'Uploading...' : 'Upload Resume'}
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
                    <button onClick={() => viewDocument('coverLetter')} className="px-3 py-1.5 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">View</button>
                    <button onClick={() => coverLetterInputRef.current?.click()} className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Replace</button>
                    <button onClick={deleteCoverLetter} className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">Delete</button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => coverLetterInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center cursor-pointer hover:border-primary-300 hover:bg-primary-50/30 transition-colors"
                >
                  <p className="text-slate-500 text-sm">
                    {uploadingCoverLetter ? 'Uploading...' : 'No cover letter template uploaded'}
                  </p>
                  <button
                    onClick={(e) => { e.stopPropagation(); coverLetterInputRef.current?.click(); }}
                    disabled={uploadingCoverLetter}
                    className="mt-3 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                  >
                    {uploadingCoverLetter ? 'Uploading...' : 'Upload Template'}
                  </button>
                </div>
              )}
            </div>

            {/* Certificates */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900">Certificates & Documents</h2>
                <button
                  onClick={() => certificateInputRef.current?.click()}
                  disabled={uploadingCertificate}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {uploadingCertificate ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    Icons.plus
                  )}
                  {uploadingCertificate ? 'Uploading...' : 'Upload'}
                </button>
              </div>
              {documents.certificates.length === 0 ? (
                <div
                  onClick={() => certificateInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center cursor-pointer hover:border-primary-300 hover:bg-primary-50/30 transition-colors"
                >
                  <p className="text-slate-500 text-sm">No certificates uploaded yet</p>
                  <p className="text-xs text-slate-400 mt-1">Click to upload certificates, licenses, or other documents</p>
                </div>
              ) : (
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
                        <button onClick={() => viewDocument('certificate', index)} className="p-1.5 text-slate-400 hover:text-primary-600 rounded" title="View">{Icons.document}</button>
                        <button onClick={() => deleteCertificate(index)} className="p-1.5 text-slate-400 hover:text-red-600 rounded" title="Delete">{Icons.trash}</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Job Preferences Tab */}
        {activeTab === 'preferences' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-slate-900">Job Preferences</h2>
                <button onClick={() => { setEditingProfile({ ...profile }); setShowPreferencesModal(true); }} className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
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
                <button onClick={() => { setEditingProfile({ ...profile }); setShowLocationsModal(true); }} className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
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
                <button onClick={() => { setEditingProfile({ ...profile }); setShowIndustriesModal(true); }} className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
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

      {/* Basic Info Modal */}
      <Modal isOpen={showBasicInfoModal} onClose={() => setShowBasicInfoModal(false)} title="Edit Basic Information" size="lg">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
            <input type="text" value={editingProfile.firstName} onChange={(e) => setEditingProfile({ ...editingProfile, firstName: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
            <input type="text" value={editingProfile.lastName} onChange={(e) => setEditingProfile({ ...editingProfile, lastName: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input type="email" value={editingProfile.email} onChange={(e) => setEditingProfile({ ...editingProfile, email: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
            <input type="tel" value={editingProfile.phone} onChange={(e) => setEditingProfile({ ...editingProfile, phone: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth</label>
            <input type="date" value={editingProfile.dateOfBirth} onChange={(e) => setEditingProfile({ ...editingProfile, dateOfBirth: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
            <select value={editingProfile.gender} onChange={(e) => setEditingProfile({ ...editingProfile, gender: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Nationality</label>
            <input type="text" value={editingProfile.nationality} onChange={(e) => setEditingProfile({ ...editingProfile, nationality: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setShowBasicInfoModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
          <button onClick={saveBasicInfo} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">Save Changes</button>
        </div>
      </Modal>

      {/* Address Modal */}
      <Modal isOpen={showAddressModal} onClose={() => setShowAddressModal(false)} title="Edit Address">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Street Address</label>
            <input type="text" value={editingProfile.address} onChange={(e) => setEditingProfile({ ...editingProfile, address: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
              <input type="text" value={editingProfile.city} onChange={(e) => setEditingProfile({ ...editingProfile, city: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Province</label>
              <input type="text" value={editingProfile.province} onChange={(e) => setEditingProfile({ ...editingProfile, province: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Postal Code</label>
              <input type="text" value={editingProfile.postalCode} onChange={(e) => setEditingProfile({ ...editingProfile, postalCode: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Country</label>
              <input type="text" value={editingProfile.country} onChange={(e) => setEditingProfile({ ...editingProfile, country: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setShowAddressModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
          <button onClick={saveAddress} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">Save Changes</button>
        </div>
      </Modal>

      {/* Bio Modal */}
      <Modal isOpen={showBioModal} onClose={() => setShowBioModal(false)} title="Edit About Me" size="lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Professional Title</label>
            <input type="text" value={editingProfile.title} onChange={(e) => setEditingProfile({ ...editingProfile, title: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Bio</label>
            <textarea value={editingProfile.bio} onChange={(e) => setEditingProfile({ ...editingProfile, bio: e.target.value })} rows={5} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setShowBioModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
          <button onClick={saveBio} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">Save Changes</button>
        </div>
      </Modal>

      {/* Links Modal */}
      <Modal isOpen={showLinksModal} onClose={() => setShowLinksModal(false)} title="Edit Social Links">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">LinkedIn URL</label>
            <input type="url" value={editingProfile.linkedinUrl} onChange={(e) => setEditingProfile({ ...editingProfile, linkedinUrl: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">GitHub URL</label>
            <input type="url" value={editingProfile.githubUrl} onChange={(e) => setEditingProfile({ ...editingProfile, githubUrl: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Portfolio URL</label>
            <input type="url" value={editingProfile.portfolioUrl} onChange={(e) => setEditingProfile({ ...editingProfile, portfolioUrl: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Website URL</label>
            <input type="url" value={editingProfile.websiteUrl} onChange={(e) => setEditingProfile({ ...editingProfile, websiteUrl: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setShowLinksModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
          <button onClick={saveLinks} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">Save Changes</button>
        </div>
      </Modal>

      {/* Language Modal */}
      <Modal isOpen={showLanguageModal} onClose={() => setShowLanguageModal(false)} title={editingLanguage?.id ? 'Edit Language' : 'Add Language'} size="sm">
        {editingLanguage && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Language</label>
              <input type="text" value={editingLanguage.language} onChange={(e) => setEditingLanguage({ ...editingLanguage, language: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Proficiency</label>
              <select value={editingLanguage.proficiency} onChange={(e) => setEditingLanguage({ ...editingLanguage, proficiency: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                <option value="Basic">Basic</option>
                <option value="Conversational">Conversational</option>
                <option value="Fluent">Fluent</option>
                <option value="Native">Native</option>
              </select>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowLanguageModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
              <button onClick={saveLanguage} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">Save</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Reference Modal */}
      <Modal isOpen={showReferenceModal} onClose={() => setShowReferenceModal(false)} title={editingReference?.id ? 'Edit Reference' : 'Add Reference'}>
        {editingReference && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
              <input type="text" value={editingReference.name} onChange={(e) => setEditingReference({ ...editingReference, name: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Position</label>
                <input type="text" value={editingReference.position} onChange={(e) => setEditingReference({ ...editingReference, position: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Company</label>
                <input type="text" value={editingReference.company} onChange={(e) => setEditingReference({ ...editingReference, company: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input type="email" value={editingReference.email} onChange={(e) => setEditingReference({ ...editingReference, email: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                <input type="tel" value={editingReference.phone} onChange={(e) => setEditingReference({ ...editingReference, phone: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Relationship</label>
              <input type="text" value={editingReference.relationship} onChange={(e) => setEditingReference({ ...editingReference, relationship: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" placeholder="e.g., Direct Manager, Former Colleague" />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowReferenceModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
              <button onClick={saveReference} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">Save</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Experience Modal */}
      <Modal isOpen={showExperienceModal} onClose={() => setShowExperienceModal(false)} title={editingExperience?.id ? 'Edit Experience' : 'Add Experience'} size="lg">
        {editingExperience && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Job Title</label>
              <input type="text" value={editingExperience.jobTitle} onChange={(e) => setEditingExperience({ ...editingExperience, jobTitle: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Company</label>
                <input type="text" value={editingExperience.company} onChange={(e) => setEditingExperience({ ...editingExperience, company: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                <input type="text" value={editingExperience.location} onChange={(e) => setEditingExperience({ ...editingExperience, location: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Employment Type</label>
                <select value={editingExperience.employmentType} onChange={(e) => setEditingExperience({ ...editingExperience, employmentType: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="freelance">Freelance</option>
                  <option value="internship">Internship</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Work Setup</label>
                <select value={editingExperience.locationType} onChange={(e) => setEditingExperience({ ...editingExperience, locationType: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                  <option value="onsite">On-site</option>
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                <input type="month" value={editingExperience.startDate} onChange={(e) => setEditingExperience({ ...editingExperience, startDate: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                <input type="month" value={editingExperience.endDate || ''} onChange={(e) => setEditingExperience({ ...editingExperience, endDate: e.target.value || null })} disabled={editingExperience.isCurrent} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-slate-100" />
              </div>
            </div>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={editingExperience.isCurrent} onChange={(e) => setEditingExperience({ ...editingExperience, isCurrent: e.target.checked, endDate: e.target.checked ? null : editingExperience.endDate })} className="w-4 h-4 text-primary-600 rounded" />
              <span className="text-sm text-slate-700">I currently work here</span>
            </label>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea value={editingExperience.description} onChange={(e) => setEditingExperience({ ...editingExperience, description: e.target.value })} rows={3} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowExperienceModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
              <button onClick={saveExperience} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">Save</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Education Modal */}
      <Modal isOpen={showEducationModal} onClose={() => setShowEducationModal(false)} title={editingEducation?.id ? 'Edit Education' : 'Add Education'} size="lg">
        {editingEducation && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">School/University</label>
              <input type="text" value={editingEducation.school} onChange={(e) => setEditingEducation({ ...editingEducation, school: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Degree</label>
                <select value={editingEducation.degree} onChange={(e) => setEditingEducation({ ...editingEducation, degree: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                  <option value="">Select degree</option>
                  <option value="High School">High School</option>
                  <option value="Associate's Degree">Associate&apos;s Degree</option>
                  <option value="Bachelor's Degree">Bachelor&apos;s Degree</option>
                  <option value="Master's Degree">Master&apos;s Degree</option>
                  <option value="Doctorate">Doctorate</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Field of Study</label>
                <input type="text" value={editingEducation.fieldOfStudy} onChange={(e) => setEditingEducation({ ...editingEducation, fieldOfStudy: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                <input type="month" value={editingEducation.startDate} onChange={(e) => setEditingEducation({ ...editingEducation, startDate: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                <input type="month" value={editingEducation.endDate || ''} onChange={(e) => setEditingEducation({ ...editingEducation, endDate: e.target.value })} disabled={editingEducation.isCurrent} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-slate-100" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Grade/GPA</label>
              <input type="text" value={editingEducation.grade} onChange={(e) => setEditingEducation({ ...editingEducation, grade: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Activities & Societies</label>
              <input type="text" value={editingEducation.activities} onChange={(e) => setEditingEducation({ ...editingEducation, activities: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowEducationModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
              <button onClick={saveEducation} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">Save</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Certification Modal */}
      <Modal isOpen={showCertificationModal} onClose={() => setShowCertificationModal(false)} title={editingCertification?.id ? 'Edit Certification' : 'Add Certification'}>
        {editingCertification && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Certification Name</label>
              <input type="text" value={editingCertification.name} onChange={(e) => setEditingCertification({ ...editingCertification, name: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Issuing Organization</label>
              <input type="text" value={editingCertification.issuingOrg} onChange={(e) => setEditingCertification({ ...editingCertification, issuingOrg: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Issue Date</label>
                <input type="month" value={editingCertification.issueDate} onChange={(e) => setEditingCertification({ ...editingCertification, issueDate: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Expiry Date</label>
                <input type="month" value={editingCertification.expiryDate || ''} onChange={(e) => setEditingCertification({ ...editingCertification, expiryDate: e.target.value || null })} disabled={editingCertification.hasNoExpiry} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-slate-100" />
              </div>
            </div>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={editingCertification.hasNoExpiry} onChange={(e) => setEditingCertification({ ...editingCertification, hasNoExpiry: e.target.checked, expiryDate: e.target.checked ? null : editingCertification.expiryDate })} className="w-4 h-4 text-primary-600 rounded" />
              <span className="text-sm text-slate-700">This credential does not expire</span>
            </label>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Credential ID</label>
              <input type="text" value={editingCertification.credentialId} onChange={(e) => setEditingCertification({ ...editingCertification, credentialId: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Credential URL</label>
              <input type="url" value={editingCertification.credentialUrl} onChange={(e) => setEditingCertification({ ...editingCertification, credentialUrl: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowCertificationModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
              <button onClick={saveCertification} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">Save</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Skill Modal */}
      <Modal isOpen={showSkillModal} onClose={() => setShowSkillModal(false)} title={editingSkill?.name ? 'Edit Skill' : 'Add Skill'} size="sm">
        {editingSkill && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Skill Name</label>
              <input type="text" value={editingSkill.name} onChange={(e) => setEditingSkill({ ...editingSkill, name: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Proficiency Level</label>
              <select value={editingSkill.level} onChange={(e) => setEditingSkill({ ...editingSkill, level: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                <option value="Basic">Basic</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Years of Experience</label>
              <input type="number" min="0" value={editingSkill.years} onChange={(e) => setEditingSkill({ ...editingSkill, years: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowSkillModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
              <button onClick={saveSkill} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">Save</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Preferences Modal */}
      <Modal isOpen={showPreferencesModal} onClose={() => setShowPreferencesModal(false)} title="Edit Job Preferences" size="lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Expected Salary (PHP/month)</label>
            <input type="text" value={editingProfile.expectedSalary} onChange={(e) => setEditingProfile({ ...editingProfile, expectedSalary: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" placeholder="e.g., 80,000 - 120,000" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Job Type</label>
              <select value={editingProfile.preferredJobType} onChange={(e) => setEditingProfile({ ...editingProfile, preferredJobType: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="freelance">Freelance</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Work Setup</label>
              <select value={editingProfile.preferredWorkSetup} onChange={(e) => setEditingProfile({ ...editingProfile, preferredWorkSetup: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                <option value="onsite">On-site</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Available From</label>
            <input type="date" value={editingProfile.availableFrom} onChange={(e) => setEditingProfile({ ...editingProfile, availableFrom: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={editingProfile.willingToRelocate} onChange={(e) => setEditingProfile({ ...editingProfile, willingToRelocate: e.target.checked })} className="w-4 h-4 text-primary-600 rounded" />
              <span className="text-sm text-slate-700">Willing to relocate</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={editingProfile.openToOffers} onChange={(e) => setEditingProfile({ ...editingProfile, openToOffers: e.target.checked })} className="w-4 h-4 text-primary-600 rounded" />
              <span className="text-sm text-slate-700">Open to offers</span>
            </label>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setShowPreferencesModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
          <button onClick={savePreferences} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">Save Changes</button>
        </div>
      </Modal>

      {/* Locations Modal */}
      <Modal isOpen={showLocationsModal} onClose={() => setShowLocationsModal(false)} title="Edit Preferred Locations">
        <div className="space-y-4">
          <p className="text-sm text-slate-500">Enter locations separated by comma</p>
          <input type="text" value={editingProfile.preferredLocations.join(', ')} onChange={(e) => setEditingProfile({ ...editingProfile, preferredLocations: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" placeholder="e.g., Makati City, BGC, Ortigas" />
          <div className="flex flex-wrap gap-2">
            {editingProfile.preferredLocations.map((loc, i) => (
              <span key={i} className="px-3 py-1.5 bg-slate-100 text-slate-700 text-sm rounded-lg">{loc}</span>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setShowLocationsModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
          <button onClick={saveLocations} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">Save Changes</button>
        </div>
      </Modal>

      {/* Industries Modal */}
      <Modal isOpen={showIndustriesModal} onClose={() => setShowIndustriesModal(false)} title="Edit Preferred Industries">
        <div className="space-y-4">
          <p className="text-sm text-slate-500">Enter industries separated by comma</p>
          <input type="text" value={editingProfile.preferredIndustries.join(', ')} onChange={(e) => setEditingProfile({ ...editingProfile, preferredIndustries: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" placeholder="e.g., Technology, Finance, E-commerce" />
          <div className="flex flex-wrap gap-2">
            {editingProfile.preferredIndustries.map((ind, i) => (
              <span key={i} className="px-3 py-1.5 bg-primary-50 text-primary-700 text-sm rounded-lg">{ind}</span>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setShowIndustriesModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
          <button onClick={saveIndustries} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">Save Changes</button>
        </div>
      </Modal>
    </div>
  );
}
