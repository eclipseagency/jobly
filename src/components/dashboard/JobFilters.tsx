'use client';

import { useState } from 'react';

interface FilterState {
  jobTypes: string[];
  salaryRange: [number, number];
  experienceLevels: string[];
  locations: string[];
}

interface JobFiltersProps {
  onFilterChange?: (filters: FilterState) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export function JobFilters({ onFilterChange, isOpen, onClose }: JobFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    jobTypes: [],
    salaryRange: [0, 100000],
    experienceLevels: [],
    locations: [],
  });

  const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship'];
  const experienceLevels = ['Entry Level', 'Mid Level', 'Senior Level', 'Manager', 'Director'];

  const toggleJobType = (type: string) => {
    const newTypes = filters.jobTypes.includes(type)
      ? filters.jobTypes.filter((t) => t !== type)
      : [...filters.jobTypes, type];
    const newFilters = { ...filters, jobTypes: newTypes };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const toggleExperience = (level: string) => {
    const newLevels = filters.experienceLevels.includes(level)
      ? filters.experienceLevels.filter((l) => l !== level)
      : [...filters.experienceLevels, level];
    const newFilters = { ...filters, experienceLevels: newLevels };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const clearAll = () => {
    const newFilters = {
      jobTypes: [],
      salaryRange: [0, 100000] as [number, number],
      experienceLevels: [],
      locations: [],
    };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const filterContent = (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800">Filters</h3>
        <button
          onClick={clearAll}
          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          Clear all
        </button>
      </div>

      {/* Job Type */}
      <div>
        <h4 className="text-sm font-semibold text-slate-800 mb-3">Job Type</h4>
        <div className="space-y-2">
          {jobTypes.map((type) => (
            <label key={type} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.jobTypes.includes(type)}
                onChange={() => toggleJobType(type)}
                className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-slate-600 group-hover:text-slate-800">{type}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Salary Range */}
      <div>
        <h4 className="text-sm font-semibold text-slate-800 mb-3">Salary Range (Monthly)</h4>
        <div className="px-2">
          <input
            type="range"
            min="0"
            max="100000"
            step="5000"
            value={filters.salaryRange[1]}
            onChange={(e) => {
              const newFilters = {
                ...filters,
                salaryRange: [filters.salaryRange[0], parseInt(e.target.value)] as [number, number],
              };
              setFilters(newFilters);
              onFilterChange?.(newFilters);
            }}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
          />
          <div className="flex justify-between mt-2 text-sm text-slate-500">
            <span>₱0</span>
            <span>₱{filters.salaryRange[1].toLocaleString()}+</span>
          </div>
        </div>
      </div>

      {/* Experience Level */}
      <div>
        <h4 className="text-sm font-semibold text-slate-800 mb-3">Experience Level</h4>
        <div className="space-y-2">
          {experienceLevels.map((level) => (
            <label key={level} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.experienceLevels.includes(level)}
                onChange={() => toggleExperience(level)}
                className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-slate-600 group-hover:text-slate-800">{level}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Location Type */}
      <div>
        <h4 className="text-sm font-semibold text-slate-800 mb-3">Work Setup</h4>
        <div className="space-y-2">
          {['On-site', 'Remote', 'Hybrid'].map((type) => (
            <label key={type} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-slate-600 group-hover:text-slate-800">{type}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Filters */}
      <div className="hidden lg:block bg-white rounded-xl border border-slate-200 p-5 sticky top-6">
        {filterContent}
      </div>

      {/* Mobile Filters Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={onClose} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-5 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-800">Filters</h3>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-5">{filterContent}</div>
            <div className="sticky bottom-0 bg-white border-t border-slate-200 p-4">
              <button
                onClick={onClose}
                className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
