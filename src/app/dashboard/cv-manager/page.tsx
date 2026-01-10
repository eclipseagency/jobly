'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { parseResume, getSkillCategory } from '@/lib/resume-parser';
import { useToast } from '@/components/ui/Toast';

interface Resume {
  id: string;
  filename: string;
  fileSize: number;
  mimeType: string;
  extractedSkills: string[];
  isPrimary: boolean;
  createdAt: string;
}

export default function CVManagerPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [dragActive, setDragActive] = useState(false);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expandedResume, setExpandedResume] = useState<string | null>(null);
  const [addingSkills, setAddingSkills] = useState(false);
  const [parsingResumeId, setParsingResumeId] = useState<string | null>(null);

  // Fetch resumes from API
  const fetchResumes = useCallback(async () => {
    if (!user?.id) return;

    try {
      const response = await fetch('/api/resumes', {
        headers: { 'x-user-id': user.id },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch resumes');
      }

      const data = await response.json();
      setResumes(data.resumes);
    } catch (error) {
      console.error('Error fetching resumes:', error);
      toast.error('Failed to load resumes');
    } finally {
      setLoading(false);
    }
  }, [user?.id, toast]);

  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFile = async (file: File) => {
    if (!user?.id) return;

    // Validate file type
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      toast.warning('Please upload a PDF or Word document');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.warning('File size must be less than 5MB');
      return;
    }

    setUploading(true);

    try {
      // Read file as data URL
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      });

      // Upload to API
      const response = await fetch('/api/resumes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify({
          filename: file.name,
          fileSize: file.size,
          mimeType: file.type,
          dataUrl,
          extractedSkills: [],
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload resume');
      }

      const { resume } = await response.json();
      setResumes(prev => [resume, ...prev]);
      toast.success('Resume uploaded successfully');

      // Parse resume to extract skills (async)
      if (file.type === 'application/pdf') {
        setParsingResumeId(resume.id);
        try {
          const { skills } = await parseResume(dataUrl, file.name);
          if (skills.length > 0) {
            // Update resume with extracted skills
            const updateResponse = await fetch(`/api/resumes/${resume.id}`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                'x-user-id': user.id,
              },
              body: JSON.stringify({ extractedSkills: skills }),
            });

            if (updateResponse.ok) {
              const { resume: updated } = await updateResponse.json();
              setResumes(prev => prev.map(r => r.id === updated.id ? updated : r));
              setExpandedResume(updated.id);
              toast.info(`Found ${skills.length} skills in your resume`);
            }
          }
        } catch (parseError) {
          console.error('Error parsing resume:', parseError);
        } finally {
          setParsingResumeId(null);
        }
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error(error instanceof Error ? error.message : 'Error uploading file');
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleDelete = async (id: string) => {
    if (!user?.id) return;
    if (!confirm('Are you sure you want to delete this resume?')) return;

    try {
      const response = await fetch(`/api/resumes/${id}`, {
        method: 'DELETE',
        headers: { 'x-user-id': user.id },
      });

      if (!response.ok) {
        throw new Error('Failed to delete resume');
      }

      setResumes(prev => prev.filter(r => r.id !== id));
      toast.success('Resume deleted');
    } catch (error) {
      console.error('Error deleting resume:', error);
      toast.error('Failed to delete resume');
    }
  };

  const handleDownload = async (resume: Resume) => {
    if (!user?.id) return;

    try {
      // Fetch the full resume with dataUrl
      const response = await fetch(`/api/resumes/${resume.id}`, {
        headers: { 'x-user-id': user.id },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch resume');
      }

      const { resume: fullResume } = await response.json();

      // Create download link
      const link = document.createElement('a');
      link.href = fullResume.dataUrl;
      link.download = fullResume.filename;
      link.click();
    } catch (error) {
      console.error('Error downloading resume:', error);
      toast.error('Failed to download resume');
    }
  };

  const handleSetPrimary = async (id: string) => {
    if (!user?.id) return;

    try {
      const response = await fetch(`/api/resumes/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify({ isPrimary: true }),
      });

      if (!response.ok) {
        throw new Error('Failed to update resume');
      }

      // Update local state
      setResumes(prev => prev.map(r => ({
        ...r,
        isPrimary: r.id === id,
      })));
      toast.success('Primary resume updated');
    } catch (error) {
      console.error('Error setting primary resume:', error);
      toast.error('Failed to update primary resume');
    }
  };

  const addSkillsToProfile = async (skills: string[]) => {
    if (!user?.id || skills.length === 0) return;

    setAddingSkills(true);
    try {
      // Update user profile with skills via API
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify({
          skills: skills,
          mergeSkills: true, // Tell API to merge with existing skills
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const newSkillsCount = data.newSkillsAdded || skills.length;
        toast.success(`Added ${newSkillsCount} new skill${newSkillsCount !== 1 ? 's' : ''} to your profile!`);
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error adding skills to profile:', error);
      toast.error('Error adding skills to profile');
    } finally {
      setAddingSkills(false);
    }
  };

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      programming: 'bg-blue-100 text-blue-700',
      frameworks: 'bg-purple-100 text-purple-700',
      databases: 'bg-green-100 text-green-700',
      cloud: 'bg-orange-100 text-orange-700',
      tools: 'bg-slate-100 text-slate-700',
      data: 'bg-cyan-100 text-cyan-700',
      soft: 'bg-pink-100 text-pink-700',
      design: 'bg-rose-100 text-rose-700',
      marketing: 'bg-amber-100 text-amber-700',
      industry: 'bg-teal-100 text-teal-700',
      other: 'bg-gray-100 text-gray-700',
    };
    return colors[category] || colors.other;
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8 max-w-5xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-48 mb-2" />
          <div className="h-4 bg-slate-200 rounded w-64 mb-8" />
          <div className="bg-white rounded-lg border border-slate-200 p-8">
            <div className="h-32 bg-slate-100 rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">My CV / Resume</h1>
        <p className="text-slate-500 mt-1">Upload your resume to apply for jobs quickly</p>
      </div>

      {/* Upload Area */}
      <div
        className={`bg-white rounded-lg border-2 border-dashed p-8 text-center mb-6 transition-colors ${
          dragActive ? 'border-primary-500 bg-primary-50' : 'border-slate-200'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <h3 className="font-medium text-slate-900 mb-1">
          {uploading ? 'Uploading...' : 'Drag and drop your resume'}
        </h3>
        <p className="text-sm text-slate-500 mb-4">or</p>
        <label className={`inline-flex px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg cursor-pointer transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
          {uploading ? 'Uploading...' : 'Browse Files'}
          <input
            type="file"
            className="hidden"
            accept=".pdf,.doc,.docx"
            onChange={handleFileInput}
            disabled={uploading}
          />
        </label>
        <p className="text-xs text-slate-400 mt-4">
          PDF, DOC, DOCX (Max 5MB)
        </p>
      </div>

      {/* My Resumes */}
      <div className="bg-white rounded-lg border border-slate-200">
        <div className="p-5 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">My Resumes</h2>
        </div>
        {resumes.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="font-medium text-slate-900 mb-1">No resumes uploaded yet</h3>
            <p className="text-sm text-slate-500">Upload your resume to start applying for jobs</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {resumes.map((resume) => (
              <div key={resume.id} className="p-5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-red-600 flex-shrink-0">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-slate-900 truncate">{resume.filename}</h3>
                      {resume.isPrimary && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-700">
                          Primary
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500">
                      {formatFileSize(resume.fileSize)} - Uploaded {formatDate(resume.createdAt)}
                      {parsingResumeId === resume.id && (
                        <span className="ml-2 text-primary-600">
                          <svg className="inline w-4 h-4 animate-spin mr-1" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Extracting skills...
                        </span>
                      )}
                      {parsingResumeId !== resume.id && resume.extractedSkills && resume.extractedSkills.length > 0 && (
                        <span className="ml-2 text-green-600">
                          {resume.extractedSkills.length} skills found
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!resume.isPrimary && (
                      <button
                        onClick={() => handleSetPrimary(resume.id)}
                        className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="Set as primary"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      </button>
                    )}
                    {resume.extractedSkills && resume.extractedSkills.length > 0 && (
                      <button
                        onClick={() => setExpandedResume(expandedResume === resume.id ? null : resume.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          expandedResume === resume.id
                            ? 'text-primary-600 bg-primary-50'
                            : 'text-slate-400 hover:text-primary-600 hover:bg-primary-50'
                        }`}
                        title="View skills"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </button>
                    )}
                    <button
                      onClick={() => handleDownload(resume)}
                      className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                      title="Download"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(resume.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Expanded Skills View */}
                {expandedResume === resume.id && resume.extractedSkills && resume.extractedSkills.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-slate-700">Extracted Skills</h4>
                      <button
                        onClick={() => addSkillsToProfile(resume.extractedSkills || [])}
                        disabled={addingSkills}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                      >
                        {addingSkills ? (
                          <>
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Adding...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Add to Profile
                          </>
                        )}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {resume.extractedSkills.map((skill, index) => {
                        const category = getSkillCategory(skill);
                        return (
                          <span
                            key={index}
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getCategoryColor(category)}`}
                          >
                            {skill}
                          </span>
                        );
                      })}
                    </div>
                    <p className="mt-3 text-xs text-slate-500">
                      Skills are categorized by type: Programming, Frameworks, Databases, Cloud, Tools, Data/AI, Soft Skills, Design, Marketing, Industry
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Skill Extraction Info */}
      <div className="mt-6 bg-primary-50 rounded-lg p-5 border border-primary-100">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600 flex-shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h3 className="font-medium text-primary-900 mb-1">Automatic Skill Extraction</h3>
            <p className="text-sm text-primary-700">
              When you upload a PDF resume, we automatically extract skills from it. Click the lightbulb icon to view extracted skills and add them to your profile with one click!
            </p>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="mt-6 bg-slate-50 rounded-lg p-5">
        <h3 className="font-medium text-slate-900 mb-3">Resume Tips</h3>
        <ul className="space-y-2 text-sm text-slate-600">
          <li className="flex items-start gap-2">
            <svg className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Keep your resume to 1-2 pages
          </li>
          <li className="flex items-start gap-2">
            <svg className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Tailor your resume for each application
          </li>
          <li className="flex items-start gap-2">
            <svg className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Use action verbs and quantify achievements
          </li>
          <li className="flex items-start gap-2">
            <svg className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            PDF format is preferred for automatic skill extraction
          </li>
        </ul>
      </div>
    </div>
  );
}
