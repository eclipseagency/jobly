'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Search,
  MapPin,
  TrendingUp,
  DollarSign,
  Briefcase,
  GraduationCap,
  Loader2,
  BarChart3,
  ArrowUp,
  ArrowDown,
  Building2,
  Info,
  X,
} from 'lucide-react';

interface SalaryData {
  dataSource: string;
  sampleSize: number;
  currency: string;
  period: string;
  jobTitle?: string;
  location?: string;
  baseSalary?: {
    min: number;
    max: number;
    median: number;
    average: number;
    percentile25: number;
    percentile75: number;
    percentile90: number;
  };
  salary?: {
    min: number;
    max: number;
    median: number;
    percentile25: number;
    percentile75: number;
  };
  totalCompensation?: {
    median: number;
    min: number;
    max: number;
  } | null;
  byExperience?: Record<string, { median: number; average: number }>;
  byLocation?: Record<string, { count: number; median: number }>;
  byEmploymentType?: Record<string, { median: number }>;
  note?: string;
  message?: string;
  suggestions?: string[];
}

const popularJobTitles = [
  'Software Engineer',
  'Web Developer',
  'Data Analyst',
  'Product Manager',
  'UI/UX Designer',
  'Marketing Manager',
  'Sales Representative',
  'Accountant',
  'Human Resources',
  'Project Manager',
];

export default function SalaryInsightsPage() {
  const { user, isLoggedIn } = useAuth();
  const [jobTitle, setJobTitle] = useState('');
  const [location, setLocation] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [salaryData, setSalaryData] = useState<SalaryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [contributing, setContributing] = useState(false);
  const [contributeForm, setContributeForm] = useState({
    jobTitle: '',
    companyName: '',
    baseSalary: '',
    totalCompensation: '',
    bonus: '',
    location: '',
    yearsExperience: '',
    employmentType: 'full-time',
    educationLevel: 'bachelors',
  });

  const searchSalaries = async () => {
    if (!jobTitle.trim()) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({ jobTitle: jobTitle.trim() });
      if (location) params.set('location', location);
      if (experienceYears) params.set('experienceYears', experienceYears);

      const response = await fetch(`/api/salary-insights?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setSalaryData(data);
      }
    } catch (err) {
      console.error('Error fetching salary data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleContribute = async () => {
    if (!user?.id || !contributeForm.jobTitle || !contributeForm.baseSalary) return;

    setContributing(true);
    try {
      const response = await fetch('/api/salary-insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify(contributeForm),
      });

      if (response.ok) {
        alert('Thank you for contributing your salary data!');
        setShowContributeModal(false);
        setContributeForm({
          jobTitle: '',
          companyName: '',
          baseSalary: '',
          totalCompensation: '',
          bonus: '',
          location: '',
          yearsExperience: '',
          employmentType: 'full-time',
          educationLevel: 'bachelors',
        });
      }
    } catch (err) {
      console.error('Error contributing:', err);
    } finally {
      setContributing(false);
    }
  };

  const formatSalary = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const salary = salaryData?.baseSalary || salaryData?.salary;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl lg:text-4xl font-bold mb-4">
            Salary Insights
          </h1>
          <p className="text-blue-100 text-lg mb-8">
            Know your worth. Explore salaries for thousands of job titles across the Philippines.
          </p>

          {/* Search Form */}
          <div className="bg-white rounded-2xl p-4 shadow-lg">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={e => setJobTitle(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && searchSalaries()}
                    placeholder="Job title (e.g., Software Engineer)"
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="Location (optional)"
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <button
                  onClick={searchSalaries}
                  disabled={loading || !jobTitle.trim()}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                  Search
                </button>
              </div>
            </div>

            {/* Quick Search */}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-sm text-slate-500 mb-2">Popular searches:</p>
              <div className="flex flex-wrap gap-2">
                {popularJobTitles.slice(0, 6).map(title => (
                  <button
                    key={title}
                    onClick={() => {
                      setJobTitle(title);
                      searchSalaries();
                    }}
                    className="px-3 py-1 text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"
                  >
                    {title}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {salaryData ? (
          <>
            {/* No Data Message */}
            {salaryData.dataSource === 'none' ? (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
                <BarChart3 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="font-semibold text-slate-900 mb-2">{salaryData.message}</h3>
                {salaryData.suggestions && (
                  <ul className="text-slate-500 text-sm space-y-1 mt-4">
                    {salaryData.suggestions.map((suggestion, i) => (
                      <li key={i}>• {suggestion}</li>
                    ))}
                  </ul>
                )}
                {isLoggedIn && (
                  <button
                    onClick={() => setShowContributeModal(true)}
                    className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Submit Your Salary
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Salary Summary */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">{salaryData.jobTitle}</h2>
                      <p className="text-slate-500">
                        {salaryData.location} • {salaryData.sampleSize} data points
                      </p>
                    </div>
                    {salaryData.note && (
                      <span className="flex items-center gap-1 text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                        <Info className="w-4 h-4" />
                        {salaryData.note}
                      </span>
                    )}
                  </div>

                  {salary && (
                    <div className="grid md:grid-cols-3 gap-6">
                      {/* Median Salary */}
                      <div className="text-center p-4 bg-blue-50 rounded-xl">
                        <p className="text-sm text-blue-600 font-medium mb-1">Median Salary</p>
                        <p className="text-3xl font-bold text-blue-700">
                          {formatSalary(salary.median)}
                        </p>
                        <p className="text-sm text-blue-500 mt-1">/year</p>
                      </div>

                      {/* Salary Range */}
                      <div className="text-center p-4 bg-slate-50 rounded-xl">
                        <p className="text-sm text-slate-600 font-medium mb-1">Salary Range</p>
                        <p className="text-lg font-semibold text-slate-900">
                          {formatSalary(salary.min)} - {formatSalary(salary.max)}
                        </p>
                      </div>

                      {/* Percentiles */}
                      <div className="text-center p-4 bg-green-50 rounded-xl">
                        <p className="text-sm text-green-600 font-medium mb-1">Top 25% Earn</p>
                        <p className="text-2xl font-bold text-green-700">
                          {formatSalary(salary.percentile75)}+
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Salary Distribution Bar */}
                  {salary && (
                    <div className="mt-8">
                      <p className="text-sm font-medium text-slate-700 mb-3">Salary Distribution</p>
                      <div className="relative h-8 bg-gradient-to-r from-red-200 via-yellow-200 to-green-200 rounded-full">
                        <div
                          className="absolute top-0 h-full w-1 bg-blue-600 rounded-full"
                          style={{
                            left: `${((salary.median - salary.min) / (salary.max - salary.min)) * 100}%`,
                          }}
                        >
                          <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-medium text-blue-600 whitespace-nowrap">
                            Median
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between mt-2 text-xs text-slate-500">
                        <span>{formatSalary(salary.min)}</span>
                        <span>{formatSalary(salary.max)}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Experience Breakdown */}
                {salaryData.byExperience && Object.keys(salaryData.byExperience).length > 0 && (
                  <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
                    <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-slate-400" />
                      Salary by Experience Level
                    </h3>
                    <div className="space-y-4">
                      {Object.entries(salaryData.byExperience).map(([level, data]) => (
                        <div key={level} className="flex items-center gap-4">
                          <div className="w-24 text-sm text-slate-600">{level} years</div>
                          <div className="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{
                                width: `${(data.median / (salary?.max || data.median)) * 100}%`,
                              }}
                            />
                          </div>
                          <div className="w-32 text-right font-medium text-slate-900">
                            {formatSalary(data.median)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Location Breakdown */}
                {salaryData.byLocation && Object.keys(salaryData.byLocation).length > 0 && (
                  <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
                    <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-slate-400" />
                      Salary by Location
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {Object.entries(salaryData.byLocation).map(([loc, data]) => (
                        <div
                          key={loc}
                          className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-slate-900">{loc}</p>
                            <p className="text-sm text-slate-500">{data.count} reports</p>
                          </div>
                          <p className="font-semibold text-blue-600">
                            {formatSalary(data.median)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contribute CTA */}
                {isLoggedIn && (
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white text-center">
                    <h3 className="font-semibold text-xl mb-2">Help improve salary data</h3>
                    <p className="text-blue-100 mb-4">
                      Share your salary anonymously to help others make informed decisions
                    </p>
                    <button
                      onClick={() => setShowContributeModal(true)}
                      className="px-6 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
                    >
                      Submit Your Salary
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <DollarSign className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="font-semibold text-slate-900 mb-2">Search for a job title</h3>
            <p className="text-slate-500">
              Enter a job title above to see salary insights and trends
            </p>
          </div>
        )}
      </div>

      {/* Contribute Modal */}
      {showContributeModal && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Submit Salary</h2>
                <button
                  onClick={() => setShowContributeModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-slate-500 mt-1">
                Your data will be kept anonymous
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Job Title *
                </label>
                <input
                  type="text"
                  value={contributeForm.jobTitle}
                  onChange={e => setContributeForm(prev => ({ ...prev, jobTitle: e.target.value }))}
                  placeholder="e.g., Software Engineer"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Company Name (Optional)
                </label>
                <input
                  type="text"
                  value={contributeForm.companyName}
                  onChange={e => setContributeForm(prev => ({ ...prev, companyName: e.target.value }))}
                  placeholder="Company name"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Base Salary (PHP/year) *
                  </label>
                  <input
                    type="number"
                    value={contributeForm.baseSalary}
                    onChange={e => setContributeForm(prev => ({ ...prev, baseSalary: e.target.value }))}
                    placeholder="e.g., 500000"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Total Compensation
                  </label>
                  <input
                    type="number"
                    value={contributeForm.totalCompensation}
                    onChange={e => setContributeForm(prev => ({ ...prev, totalCompensation: e.target.value }))}
                    placeholder="Including bonuses"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={contributeForm.location}
                    onChange={e => setContributeForm(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="e.g., Manila"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    value={contributeForm.yearsExperience}
                    onChange={e => setContributeForm(prev => ({ ...prev, yearsExperience: e.target.value }))}
                    placeholder="e.g., 5"
                    min="0"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Employment Type
                </label>
                <select
                  value={contributeForm.employmentType}
                  onChange={e => setContributeForm(prev => ({ ...prev, employmentType: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="freelance">Freelance</option>
                </select>
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setShowContributeModal(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleContribute}
                disabled={contributing || !contributeForm.jobTitle || !contributeForm.baseSalary}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
              >
                {contributing && <Loader2 className="w-4 h-4 animate-spin" />}
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
