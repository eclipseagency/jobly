'use client';

import { useState } from 'react';

const resumes = [
  {
    id: '1',
    name: 'Alex_Morgan_Resume_2024.pdf',
    size: '245 KB',
    uploadedAt: 'Dec 20, 2024',
    isDefault: true,
  },
  {
    id: '2',
    name: 'Alex_Morgan_CV_Frontend.pdf',
    size: '312 KB',
    uploadedAt: 'Dec 15, 2024',
    isDefault: false,
  },
  {
    id: '3',
    name: 'Portfolio_Summary.pdf',
    size: '1.2 MB',
    uploadedAt: 'Dec 10, 2024',
    isDefault: false,
  },
];

export default function CVManagerPage() {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">Documents</h1>
        <p className="text-slate-500 mt-1">Upload and manage your resumes</p>
      </div>

      {/* Upload Area */}
      <div
        className={`bg-white rounded-lg border-2 border-dashed p-8 text-center mb-6 transition-colors ${
          dragActive ? 'border-primary-500 bg-primary-50' : 'border-slate-200'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
        }}
      >
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <h3 className="font-medium text-slate-900 mb-1">
          Drag and drop your resume
        </h3>
        <p className="text-sm text-slate-500 mb-4">or</p>
        <label className="inline-flex px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg cursor-pointer transition-colors">
          Browse Files
          <input type="file" className="hidden" accept=".pdf,.doc,.docx" />
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
        <div className="divide-y divide-slate-100">
          {resumes.map((resume) => (
            <div key={resume.id} className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-red-600 flex-shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-slate-900 truncate">{resume.name}</h3>
                  {resume.isDefault && (
                    <span className="px-2 py-0.5 bg-primary-50 text-primary-600 text-xs font-medium rounded">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-500">{resume.size} - Uploaded {resume.uploadedAt}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {!resume.isDefault && (
                  <button className="px-3 py-1.5 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                    Set as Default
                  </button>
                )}
                <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>
                <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
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
            PDF format is preferred by most employers
          </li>
        </ul>
      </div>
    </div>
  );
}
