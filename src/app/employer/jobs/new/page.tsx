'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toast';
import ScreeningFormBuilder, { ScreeningQuestion } from '@/components/screening/ScreeningFormBuilder';

const skillOptions = [
  'JavaScript', 'TypeScript', 'React', 'Vue.js', 'Angular', 'Node.js', 'Python', 'Java', 'Go', 'Rust',
  'PostgreSQL', 'MongoDB', 'Redis', 'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'CI/CD', 'Git',
  'Figma', 'UI/UX Design', 'Product Management', 'Agile', 'Scrum', 'Data Analysis', 'Machine Learning',
  'SQL', 'REST API', 'GraphQL', 'Tailwind CSS', 'Next.js', 'React Native', 'Flutter',
];

const benefitOptions = [
  'HMO Coverage', 'Dental Coverage', 'Life Insurance', 'Stock Options', '13th Month Pay', '14th Month Pay',
  'Performance Bonus', 'Flexible Hours', 'Remote Work', 'Hybrid Setup', 'Work from Home Equipment',
  'Learning & Development Budget', 'Gym Membership', 'Mental Health Support', 'Retirement Plan',
  'Free Parking', 'Meal Allowance', 'Transportation Allowance', 'Vacation Leave', 'Sick Leave',
];

export default function PostNewJobPage() {
  const router = useRouter();
  const { user } = useAuth();
  const toast = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    location: '',
    workSetup: '',
    jobType: '',
    experienceLevel: '',
    salaryMin: '',
    salaryMax: '',
    showSalary: true,
    description: '',
    responsibilities: [''],
    requirements: [''],
    niceToHave: [''],
    skills: [] as string[],
    benefits: [] as string[],
    applicationDeadline: '',
    startDate: '',
    positions: '1',
    screeningQuestions: [] as ScreeningQuestion[],
    passingThreshold: undefined as number | undefined,
    shortlistThreshold: undefined as number | undefined,
  });

  const updateFormData = (field: string, value: string | string[] | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addListItem = (field: 'responsibilities' | 'requirements' | 'niceToHave') => {
    setFormData(prev => ({ ...prev, [field]: [...prev[field], ''] }));
  };

  const updateListItem = (field: 'responsibilities' | 'requirements' | 'niceToHave', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item),
    }));
  };

  const removeListItem = (field: 'responsibilities' | 'requirements' | 'niceToHave', index: number) => {
    if (formData[field].length > 1) {
      setFormData(prev => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index),
      }));
    }
  };

  const toggleSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const toggleBenefit = (benefit: string) => {
    setFormData(prev => ({
      ...prev,
      benefits: prev.benefits.includes(benefit)
        ? prev.benefits.filter(b => b !== benefit)
        : [...prev.benefits, benefit],
    }));
  };

  const [errors, setErrors] = useState<string[]>([]);

  const steps = [
    { number: 1, title: 'Job Details' },
    { number: 2, title: 'Description' },
    { number: 3, title: 'Skills & Benefits' },
    { number: 4, title: 'Screening' },
    { number: 5, title: 'Review' },
  ];

  const validateStep = (step: number): string[] => {
    const stepErrors: string[] = [];
    if (step === 1) {
      if (!formData.title.trim()) stepErrors.push('Job title is required');
      if (!formData.department) stepErrors.push('Department is required');
      if (!formData.location.trim()) stepErrors.push('Location is required');
      if (!formData.workSetup) stepErrors.push('Work setup is required');
      if (!formData.jobType) stepErrors.push('Job type is required');
      if (!formData.experienceLevel) stepErrors.push('Experience level is required');
      if (!formData.salaryMin || !formData.salaryMax) stepErrors.push('Salary range is required');
    } else if (step === 2) {
      if (!formData.description.trim()) stepErrors.push('Job description is required');
      if (formData.responsibilities.filter(r => r.trim()).length === 0) {
        stepErrors.push('At least one responsibility is required');
      }
      if (formData.requirements.filter(r => r.trim()).length === 0) {
        stepErrors.push('At least one requirement is required');
      }
    } else if (step === 3) {
      if (formData.skills.length === 0) stepErrors.push('At least one skill is required');
    }
    return stepErrors;
  };

  const handleContinue = () => {
    const stepErrors = validateStep(currentStep);
    if (stepErrors.length > 0) {
      setErrors(stepErrors);
      return;
    }
    setErrors([]);
    setCurrentStep(prev => prev + 1);
  };

  const handlePublish = async () => {
    if (!user?.tenantId) {
      setPublishError('You must be logged in as an employer to publish jobs');
      return;
    }

    setIsPublishing(true);
    setPublishError(null);

    try {
      // Format salary string
      const salary = formData.salaryMin && formData.salaryMax
        ? `₱${parseInt(formData.salaryMin).toLocaleString()} - ₱${parseInt(formData.salaryMax).toLocaleString()}/mo`
        : null;

      // Combine responsibilities and requirements into a formatted requirements string
      const requirementsText = [
        ...formData.responsibilities.filter(r => r.trim()).map(r => `• ${r}`),
        '',
        'Requirements:',
        ...formData.requirements.filter(r => r.trim()).map(r => `• ${r}`),
        ...(formData.niceToHave.filter(r => r.trim()).length > 0 ? ['', 'Nice to have:', ...formData.niceToHave.filter(r => r.trim()).map(r => `• ${r}`)] : []),
        ...(formData.skills.length > 0 ? ['', 'Skills: ' + formData.skills.join(', ')] : []),
        ...(formData.benefits.length > 0 ? ['', 'Benefits: ' + formData.benefits.join(', ')] : []),
      ].join('\n');

      const response = await fetch('/api/employer/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': user.tenantId,
          'x-user-id': user.id,
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          requirements: requirementsText,
          location: formData.location,
          locationType: formData.workSetup,
          salary,
          jobType: formData.jobType,
          department: formData.department,
          expiresAt: formData.applicationDeadline || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to publish job');
      }

      const jobData = await response.json();
      const jobId = jobData.job?.id;

      // Save screening form if questions exist
      if (jobId && formData.screeningQuestions.length > 0) {
        try {
          const screeningResponse = await fetch(`/api/employer/jobs/${jobId}/screening-form`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-tenant-id': user.tenantId,
              'x-user-id': user.id,
            },
            body: JSON.stringify({
              title: 'Screening Questions',
              passingThreshold: formData.passingThreshold,
              shortlistThreshold: formData.shortlistThreshold,
              questions: formData.screeningQuestions.map(q => ({
                questionText: q.questionText,
                questionType: q.questionType,
                order: q.order,
                isRequired: q.isRequired,
                config: q.config,
                helpText: q.helpText,
                placeholder: q.placeholder,
                rules: q.rules.map(r => ({
                  ruleType: r.ruleType,
                  operator: r.operator,
                  value: r.value,
                  scoreValue: r.scoreValue,
                  message: r.message,
                  priority: r.priority,
                })),
              })),
            }),
          });

          if (!screeningResponse.ok) {
            console.error('Failed to save screening form, but job was created');
          }
        } catch (screeningError) {
          console.error('Error saving screening form:', screeningError);
        }
      }

      router.push('/employer/jobs?published=true');
    } catch (error) {
      console.error('Error publishing job:', error);
      setPublishError(error instanceof Error ? error.message : 'Failed to publish job. Please try again.');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSaveDraft = async () => {
    // For now, drafts are not supported in the API, so just redirect
    // In a full implementation, you would save with isActive: false
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsSaving(false);
    toast.info('Draft saving is not yet implemented. Please publish the job when ready.');
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link href="/employer/jobs" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-4">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Jobs
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Post a New Job</h1>
        <p className="text-slate-600 mt-1">Fill in the details to create your job listing</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${
                  currentStep >= step.number
                    ? 'bg-primary-600 text-white'
                    : 'bg-slate-100 text-slate-400'
                }`}>
                  {currentStep > step.number ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step.number
                  )}
                </div>
                <span className={`mt-2 text-xs font-medium ${
                  currentStep >= step.number ? 'text-primary-600' : 'text-slate-400'
                }`}>
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-1 mx-4 rounded ${
                  currentStep > step.number ? 'bg-primary-600' : 'bg-slate-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Steps */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        {/* Step 1: Job Details */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Job Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => updateFormData('title', e.target.value)}
                placeholder="e.g. Senior Frontend Developer"
                className="w-full px-4 py-3 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Department *</label>
                <select
                  value={formData.department}
                  onChange={(e) => updateFormData('department', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                >
                  <option value="">Select department</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Design">Design</option>
                  <option value="Product">Product</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="Operations">Operations</option>
                  <option value="Finance">Finance</option>
                  <option value="HR">Human Resources</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Location *</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => updateFormData('location', e.target.value)}
                  placeholder="e.g. BGC, Taguig or Remote"
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Work Setup *</label>
                <select
                  value={formData.workSetup}
                  onChange={(e) => updateFormData('workSetup', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                >
                  <option value="">Select setup</option>
                  <option value="On-site">On-site</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Remote">Remote</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Job Type *</label>
                <select
                  value={formData.jobType}
                  onChange={(e) => updateFormData('jobType', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                >
                  <option value="">Select type</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Freelance">Freelance</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Experience Level *</label>
                <select
                  value={formData.experienceLevel}
                  onChange={(e) => updateFormData('experienceLevel', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                >
                  <option value="">Select level</option>
                  <option value="Entry">Entry Level (0-2 years)</option>
                  <option value="Mid">Mid Level (2-5 years)</option>
                  <option value="Senior">Senior (5-8 years)</option>
                  <option value="Lead">Lead/Manager (8+ years)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Salary Range (PHP/month) *</label>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">₱</span>
                  <input
                    type="number"
                    value={formData.salaryMin}
                    onChange={(e) => updateFormData('salaryMin', e.target.value)}
                    placeholder="Minimum"
                    className="w-full pl-8 pr-4 py-3 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">₱</span>
                  <input
                    type="number"
                    value={formData.salaryMax}
                    onChange={(e) => updateFormData('salaryMax', e.target.value)}
                    placeholder="Maximum"
                    className="w-full pl-8 pr-4 py-3 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 mt-3">
                <input
                  type="checkbox"
                  checked={formData.showSalary}
                  onChange={(e) => updateFormData('showSalary', e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-slate-600">Display salary on job listing</span>
              </label>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Application Deadline</label>
                <input
                  type="date"
                  value={formData.applicationDeadline}
                  onChange={(e) => updateFormData('applicationDeadline', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Expected Start Date</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => updateFormData('startDate', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Open Positions</label>
                <input
                  type="number"
                  min="1"
                  value={formData.positions}
                  onChange={(e) => updateFormData('positions', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Description */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Job Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => updateFormData('description', e.target.value)}
                placeholder="Provide a summary of the role, what the candidate will be doing, and what kind of person would thrive in this position..."
                rows={5}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Responsibilities *</label>
              <p className="text-sm text-slate-500 mb-3">List the key responsibilities and duties of the role</p>
              {formData.responsibilities.map((item, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => updateListItem('responsibilities', index, e.target.value)}
                    placeholder={`Responsibility ${index + 1}`}
                    className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <button
                    onClick={() => removeListItem('responsibilities', index)}
                    className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
              <button
                onClick={() => addListItem('responsibilities')}
                className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium mt-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Responsibility
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Requirements *</label>
              <p className="text-sm text-slate-500 mb-3">List the required qualifications and experience</p>
              {formData.requirements.map((item, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => updateListItem('requirements', index, e.target.value)}
                    placeholder={`Requirement ${index + 1}`}
                    className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <button
                    onClick={() => removeListItem('requirements', index)}
                    className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
              <button
                onClick={() => addListItem('requirements')}
                className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium mt-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Requirement
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Nice to Have</label>
              <p className="text-sm text-slate-500 mb-3">Optional qualifications that would be a bonus</p>
              {formData.niceToHave.map((item, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => updateListItem('niceToHave', index, e.target.value)}
                    placeholder={`Nice to have ${index + 1}`}
                    className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <button
                    onClick={() => removeListItem('niceToHave', index)}
                    className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
              <button
                onClick={() => addListItem('niceToHave')}
                className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium mt-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Nice to Have
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Skills & Benefits */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Required Skills *</label>
              <p className="text-sm text-slate-500 mb-3">Select the skills required for this position</p>
              <div className="flex flex-wrap gap-2">
                {skillOptions.map((skill) => (
                  <button
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                      formData.skills.includes(skill)
                        ? 'bg-primary-50 border-primary-300 text-primary-700'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
              {formData.skills.length > 0 && (
                <p className="text-sm text-slate-500 mt-3">
                  {formData.skills.length} skill(s) selected
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Benefits & Perks</label>
              <p className="text-sm text-slate-500 mb-3">Select the benefits offered with this position</p>
              <div className="flex flex-wrap gap-2">
                {benefitOptions.map((benefit) => (
                  <button
                    key={benefit}
                    onClick={() => toggleBenefit(benefit)}
                    className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                      formData.benefits.includes(benefit)
                        ? 'bg-green-50 border-green-300 text-green-700'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {benefit}
                  </button>
                ))}
              </div>
              {formData.benefits.length > 0 && (
                <p className="text-sm text-slate-500 mt-3">
                  {formData.benefits.length} benefit(s) selected
                </p>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Screening */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex gap-3">
                <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="font-medium text-blue-800">Screening Questions (Optional)</p>
                  <p className="text-sm text-blue-700 mt-1">
                    Add screening questions to automatically evaluate applicants. You can add knockout rules to auto-reject unqualified candidates
                    and scoring rules to rank applicants.
                  </p>
                </div>
              </div>
            </div>

            <ScreeningFormBuilder
              questions={formData.screeningQuestions}
              onChange={(questions) => setFormData(prev => ({ ...prev, screeningQuestions: questions }))}
              passingThreshold={formData.passingThreshold}
              shortlistThreshold={formData.shortlistThreshold}
              onThresholdsChange={(passing, shortlist) => setFormData(prev => ({
                ...prev,
                passingThreshold: passing,
                shortlistThreshold: shortlist,
              }))}
            />
          </div>
        )}

        {/* Step 5: Review */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div className="bg-slate-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">{formData.title || 'Job Title'}</h3>

              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-slate-500">Department</p>
                  <p className="text-slate-900">{formData.department || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Location</p>
                  <p className="text-slate-900">{formData.location || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Work Setup</p>
                  <p className="text-slate-900">{formData.workSetup || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Job Type</p>
                  <p className="text-slate-900">{formData.jobType || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Experience Level</p>
                  <p className="text-slate-900">{formData.experienceLevel || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Salary Range</p>
                  <p className="text-slate-900">
                    {formData.salaryMin && formData.salaryMax
                      ? `₱${parseInt(formData.salaryMin).toLocaleString()} - ₱${parseInt(formData.salaryMax).toLocaleString()}/mo`
                      : '-'
                    }
                  </p>
                </div>
              </div>

              {formData.description && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-slate-700 mb-2">Description</p>
                  <p className="text-slate-600">{formData.description}</p>
                </div>
              )}

              {formData.responsibilities.filter(r => r).length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-slate-700 mb-2">Responsibilities</p>
                  <ul className="list-disc list-inside text-slate-600 space-y-1">
                    {formData.responsibilities.filter(r => r).map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {formData.requirements.filter(r => r).length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-slate-700 mb-2">Requirements</p>
                  <ul className="list-disc list-inside text-slate-600 space-y-1">
                    {formData.requirements.filter(r => r).map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {formData.skills.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-slate-700 mb-2">Required Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map((skill, i) => (
                      <span key={i} className="px-2.5 py-1 bg-primary-50 text-primary-700 text-sm rounded-lg">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {formData.benefits.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-2">Benefits</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.benefits.map((benefit, i) => (
                      <span key={i} className="px-2.5 py-1 bg-green-50 text-green-700 text-sm rounded-lg">
                        {benefit}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex gap-3">
                <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="font-medium text-yellow-800">Before you publish</p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Please review all details carefully. Once published, the job will be visible to all candidates.
                  </p>
                </div>
              </div>
            </div>

            {publishError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-medium text-red-800">Failed to publish</p>
                    <p className="text-sm text-red-700 mt-1">{publishError}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Validation Errors */}
        {errors.length > 0 && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex gap-3">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-medium text-red-800">Please fix the following errors:</p>
                <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
                  {errors.map((error, i) => (
                    <li key={i}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
          {currentStep > 1 ? (
            <button
              onClick={() => { setErrors([]); setCurrentStep(prev => prev - 1); }}
              className="flex items-center gap-2 px-5 py-2.5 text-slate-600 hover:text-slate-900 font-medium transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>
          ) : (
            <div />
          )}

          {currentStep < 5 ? (
            <button
              onClick={handleContinue}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
            >
              Continue
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={handleSaveDraft}
                disabled={isSaving || isPublishing}
                className="px-5 py-2.5 border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Saving...' : 'Save as Draft'}
              </button>
              <button
                onClick={handlePublish}
                disabled={isPublishing || isSaving}
                className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPublishing ? 'Publishing...' : 'Publish Job'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
