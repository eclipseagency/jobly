'use client';

import { useState, useEffect, useRef } from 'react';
import ApplicantScreeningForm from '@/components/screening/ApplicantScreeningForm';
import { useToast } from '@/components/ui/Toast';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  headline?: string;
  summary?: string;
  experience?: string;
  skills?: string[];
  resumeUrl?: string;
  portfolioUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
}

interface Job {
  id: string;
  title: string;
  company: {
    name: string;
    logo?: string;
  };
  requiresPortfolio?: boolean;
  requiresResume?: boolean;
}

interface ScreeningAnswer {
  questionId: string;
  answer: unknown;
}

interface ApplicationWizardProps {
  job: Job;
  user: UserProfile;
  hasScreeningForm: boolean;
  onSubmit: (data: { coverLetter: string; screeningAnswers: ScreeningAnswer[] }) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  onProfileUpdate?: (updates: Partial<UserProfile>) => void;
}

type Step = 'eligibility' | 'screening' | 'review';

interface ProfileCheck {
  label: string;
  completed: boolean;
  required: boolean;
  field: string;
}

export default function ApplicationWizard({
  job,
  user,
  hasScreeningForm,
  onSubmit,
  onCancel,
  isSubmitting,
}: ApplicationWizardProps) {
  const toast = useToast();
  const [currentStep, setCurrentStep] = useState<Step>('eligibility');
  const [coverLetter, setCoverLetter] = useState('');
  const [screeningAnswers, setScreeningAnswers] = useState<ScreeningAnswer[]>([]);

  // Local profile state for inline editing
  const [localProfile, setLocalProfile] = useState({
    phone: user.phone || '',
    location: user.location || '',
    headline: user.headline || '',
    resumeUrl: user.resumeUrl || '',
  });

  // Inline editing states
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [uploadingResume, setUploadingResume] = useState(false);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  // Update local profile when user prop changes
  useEffect(() => {
    setLocalProfile({
      phone: user.phone || '',
      location: user.location || '',
      headline: user.headline || '',
      resumeUrl: user.resumeUrl || '',
    });
  }, [user.phone, user.location, user.headline, user.resumeUrl]);

  // Calculate profile completeness with local state
  const profileChecks: ProfileCheck[] = [
    { label: 'Full Name', completed: !!user.name, required: true, field: 'name' },
    { label: 'Email Address', completed: !!user.email, required: true, field: 'email' },
    { label: 'Phone Number', completed: !!localProfile.phone, required: false, field: 'phone' },
    { label: 'Location', completed: !!localProfile.location, required: false, field: 'location' },
    { label: 'Professional Headline', completed: !!localProfile.headline, required: false, field: 'headline' },
    { label: 'Resume/CV', completed: !!localProfile.resumeUrl, required: job.requiresResume !== false, field: 'resumeUrl' },
    { label: 'Portfolio URL', completed: !!user.portfolioUrl, required: !!job.requiresPortfolio, field: 'portfolioUrl' },
    { label: 'Work Experience', completed: !!user.experience, required: false, field: 'experience' },
    { label: 'Skills', completed: (user.skills?.length || 0) > 0, required: false, field: 'skills' },
  ];

  const requiredChecks = profileChecks.filter(c => c.required);
  const completedRequired = requiredChecks.filter(c => c.completed).length;
  const allRequiredComplete = completedRequired === requiredChecks.length;

  const completedTotal = profileChecks.filter(c => c.completed).length;
  const completenessPercent = Math.round((completedTotal / profileChecks.length) * 100);

  // Determine steps based on screening form
  const steps: { key: Step; label: string }[] = [
    { key: 'eligibility', label: 'Eligibility' },
    ...(hasScreeningForm ? [{ key: 'screening' as Step, label: 'Screening' }] : []),
    { key: 'review', label: 'Review & Submit' },
  ];

  const currentStepIndex = steps.findIndex(s => s.key === currentStep);

  const goToNextStep = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].key);
    }
  };

  const goToPrevStep = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].key);
    }
  };

  const handleScreeningSubmit = (answers: ScreeningAnswer[]) => {
    setScreeningAnswers(answers);
    goToNextStep();
  };

  const handleFinalSubmit = async () => {
    await onSubmit({ coverLetter, screeningAnswers });
  };

  // Inline editing handlers
  const startEditing = (field: string, currentValue: string) => {
    setEditingField(field);
    setEditValue(currentValue);
  };

  const saveEdit = (field: string) => {
    if (field === 'phone' || field === 'location' || field === 'headline') {
      setLocalProfile(prev => ({ ...prev, [field]: editValue }));

      // Save to localStorage
      if (user.id) {
        try {
          const savedProfile = localStorage.getItem(`jobly_profile_${user.id}`);
          const parsed = savedProfile ? JSON.parse(savedProfile) : { profile: {} };

          if (field === 'phone') {
            parsed.profile = { ...parsed.profile, phone: editValue };
          } else if (field === 'location') {
            const parts = editValue.split(',').map(p => p.trim());
            parsed.profile = { ...parsed.profile, city: parts[0] || '', country: parts[1] || '' };
          } else if (field === 'headline') {
            parsed.profile = { ...parsed.profile, title: editValue };
          }

          localStorage.setItem(`jobly_profile_${user.id}`, JSON.stringify(parsed));
        } catch {
          // Error saving to localStorage
        }
      }
    }
    setEditingField(null);
    setEditValue('');
  };

  const cancelEdit = () => {
    setEditingField(null);
    setEditValue('');
  };

  // Resume upload handler
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
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;

        // Update local state
        setLocalProfile(prev => ({ ...prev, resumeUrl: 'uploaded' }));

        // Save to localStorage
        if (user.id) {
          localStorage.setItem(`jobly_resume_${user.id}`, base64);
          localStorage.setItem(`jobly_resume_name_${user.id}`, file.name);

          // Also update profile documents
          try {
            const savedProfile = localStorage.getItem(`jobly_profile_${user.id}`);
            const parsed = savedProfile ? JSON.parse(savedProfile) : { profile: {}, documents: {} };
            parsed.documents = {
              ...parsed.documents,
              resume: {
                name: file.name,
                uploadedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                size: formatFileSize(file.size),
              }
            };
            localStorage.setItem(`jobly_profile_${user.id}`, JSON.stringify(parsed));
          } catch {
            // Error updating profile
          }
        }
        setUploadingResume(false);
      };
      reader.readAsDataURL(file);
    } catch {
      toast.error('Failed to upload resume. Please try again.');
      setUploadingResume(false);
    }

    if (resumeInputRef.current) resumeInputRef.current.value = '';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Get resume file name from localStorage
  const getResumeName = () => {
    if (user.id) {
      return localStorage.getItem(`jobly_resume_name_${user.id}`) || 'Resume uploaded';
    }
    return 'Resume uploaded';
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Hidden file input */}
        <input
          ref={resumeInputRef}
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={handleResumeUpload}
          className="hidden"
        />

        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Apply for {job.title}</h2>
              <p className="text-sm text-slate-600">{job.company.name}</p>
            </div>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center gap-2">
            {steps.map((step, index) => (
              <div key={step.key} className="flex items-center">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                  index < currentStepIndex
                    ? 'bg-green-100 text-green-700'
                    : index === currentStepIndex
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-slate-100 text-slate-500'
                }`}>
                  {index < currentStepIndex ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="w-5 h-5 flex items-center justify-center rounded-full bg-current bg-opacity-20 text-xs">
                      {index + 1}
                    </span>
                  )}
                  {step.label}
                </div>
                {index < steps.length - 1 && (
                  <svg className="w-4 h-4 text-slate-300 mx-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Step 1: Eligibility */}
          {currentStep === 'eligibility' && (
            <div className="space-y-6">
              {/* Profile Completeness */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-slate-900">Profile Completeness</h3>
                  <span className={`text-sm font-semibold ${
                    completenessPercent >= 80 ? 'text-green-600' :
                    completenessPercent >= 50 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {completenessPercent}%
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      completenessPercent >= 80 ? 'bg-green-500' :
                      completenessPercent >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${completenessPercent}%` }}
                  />
                </div>
              </div>

              {/* Required Checks */}
              <div>
                <h4 className="text-sm font-medium text-slate-700 mb-3">Required for this application</h4>
                <div className="space-y-2">
                  {requiredChecks.map((check) => (
                    <div key={check.field}>
                      {/* Resume field - special handling */}
                      {check.field === 'resumeUrl' ? (
                        <div className={`p-3 rounded-lg border ${
                          check.completed
                            ? 'bg-green-50 border-green-200'
                            : 'bg-red-50 border-red-200'
                        }`}>
                          <div className="flex items-center gap-3">
                            {check.completed ? (
                              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            )}
                            <div className="flex-1">
                              <span className={check.completed ? 'text-green-700' : 'text-red-700'}>
                                {check.label}
                              </span>
                              {check.completed && (
                                <p className="text-xs text-green-600 mt-0.5">{getResumeName()}</p>
                              )}
                            </div>
                            <button
                              onClick={() => resumeInputRef.current?.click()}
                              disabled={uploadingResume}
                              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                                check.completed
                                  ? 'text-green-700 hover:bg-green-100'
                                  : 'bg-red-100 text-red-700 hover:bg-red-200'
                              }`}
                            >
                              {uploadingResume ? (
                                <span className="flex items-center gap-2">
                                  <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                  Uploading...
                                </span>
                              ) : check.completed ? 'Replace' : 'Upload Resume'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Other required fields (Name, Email) - read only display */
                        <div className={`flex items-center gap-3 p-3 rounded-lg border ${
                          check.completed
                            ? 'bg-green-50 border-green-200'
                            : 'bg-red-50 border-red-200'
                        }`}>
                          {check.completed ? (
                            <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                          <span className={check.completed ? 'text-green-700' : 'text-red-700'}>
                            {check.label}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Optional Checks - with inline editing */}
              <div>
                <h4 className="text-sm font-medium text-slate-700 mb-3">Recommended (improves your chances)</h4>
                <div className="space-y-2">
                  {profileChecks.filter(c => !c.required).map((check) => {
                    const isEditable = ['phone', 'location', 'headline'].includes(check.field);
                    const isEditing = editingField === check.field;
                    const currentValue = check.field === 'phone' ? localProfile.phone :
                                        check.field === 'location' ? localProfile.location :
                                        check.field === 'headline' ? localProfile.headline : '';

                    return (
                      <div key={check.field} className="bg-slate-50 rounded-lg p-3">
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <input
                              type={check.field === 'phone' ? 'tel' : 'text'}
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              placeholder={
                                check.field === 'phone' ? '+63 912 345 6789' :
                                check.field === 'location' ? 'City, Country' :
                                check.field === 'headline' ? 'e.g. Senior Software Engineer' : ''
                              }
                              className="flex-1 px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                              autoFocus
                            />
                            <button
                              onClick={() => saveEdit(check.field)}
                              className="px-3 py-1.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg"
                            >
                              Save
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            {check.completed ? (
                              <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                            )}
                            <span className={`flex-1 text-sm ${check.completed ? 'text-slate-700' : 'text-slate-500'}`}>
                              {check.label}
                              {check.completed && currentValue && (
                                <span className="text-slate-500 ml-2">· {currentValue}</span>
                              )}
                            </span>
                            {isEditable && (
                              <button
                                onClick={() => startEditing(check.field, currentValue)}
                                className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                              >
                                {check.completed ? 'Edit' : 'Add'}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Blocking Message */}
              {!allRequiredComplete && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                      <p className="font-medium text-red-800">Complete required fields to apply</p>
                      <p className="text-sm text-red-700 mt-1">
                        Please upload your resume to continue with this application.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Ready Message */}
              {allRequiredComplete && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="font-medium text-green-800">You&apos;re eligible to apply!</p>
                      <p className="text-sm text-green-700 mt-1">
                        All required profile information is complete. Continue to {hasScreeningForm ? 'answer screening questions' : 'review your application'}.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Screening (if applicable) */}
          {currentStep === 'screening' && (
            <div>
              <ApplicantScreeningForm
                jobId={job.id}
                onSubmit={handleScreeningSubmit}
                onCancel={goToPrevStep}
                isSubmitting={false}
              />
            </div>
          )}

          {/* Step 3: Review */}
          {currentStep === 'review' && (
            <div className="space-y-6">
              {/* Profile Summary */}
              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="font-medium text-slate-900 mb-3">Your Profile</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-slate-500">Name:</span>
                    <span className="ml-2 text-slate-900">{user.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Email:</span>
                    <span className="ml-2 text-slate-900">{user.email}</span>
                  </div>
                  {localProfile.phone && (
                    <div>
                      <span className="text-slate-500">Phone:</span>
                      <span className="ml-2 text-slate-900">{localProfile.phone}</span>
                    </div>
                  )}
                  {localProfile.location && (
                    <div>
                      <span className="text-slate-500">Location:</span>
                      <span className="ml-2 text-slate-900">{localProfile.location}</span>
                    </div>
                  )}
                </div>
                {localProfile.resumeUrl && (
                  <div className="mt-3 flex items-center gap-2 text-sm">
                    <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-green-700">Resume attached: {getResumeName()}</span>
                  </div>
                )}
              </div>

              {/* Screening Answers Summary */}
              {screeningAnswers.length > 0 && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-slate-900 mb-2">Screening Responses</h4>
                  <p className="text-sm text-blue-700">
                    {screeningAnswers.length} question(s) answered
                  </p>
                </div>
              )}

              {/* Cover Letter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Cover Letter (Optional)
                </label>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  rows={5}
                  placeholder="Tell the employer why you're a great fit for this role..."
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
              </div>

              {/* Confirmation */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-medium text-yellow-800">Ready to submit?</p>
                    <p className="text-sm text-yellow-700 mt-1">
                      Your profile and responses will be shared with {job.company.name}.
                      You can track your application status in your dashboard.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={currentStepIndex === 0 ? onCancel : goToPrevStep}
            className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            {currentStepIndex === 0 ? 'Cancel' : 'Back'}
          </button>

          {currentStep === 'eligibility' && (
            <button
              onClick={goToNextStep}
              disabled={!allRequiredComplete}
              className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          )}

          {currentStep === 'review' && (
            <button
              onClick={handleFinalSubmit}
              disabled={isSubmitting}
              className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
