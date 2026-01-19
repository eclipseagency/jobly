'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  Zap,
  BookOpen,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  DollarSign,
  Briefcase,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';

interface SkillAnalysis {
  skill: string;
  userLevel: number;
  marketDemand: 'low' | 'medium' | 'high' | 'critical';
  averageRequired: number;
  gap: number;
  recommendations: string[];
  relatedJobs: number;
  salaryImpact: number;
}

interface AnalysisData {
  overallScore: number;
  skillAnalyses: SkillAnalysis[];
  topGaps: SkillAnalysis[];
  topStrengths: SkillAnalysis[];
  suggestedSkills: Array<{ skill: string; demand: string; salaryImpact: number }>;
  totalSkillsAnalyzed: number;
  userSkillCount: number;
}

const demandColors = {
  low: { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' },
  medium: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
  high: { bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500' },
  critical: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
};

export default function SkillsAnalysisPage() {
  const router = useRouter();
  const { user, isLoggedIn } = useAuth();
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'gaps' | 'strengths'>('all');

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/auth/employee/login');
    }
  }, [isLoggedIn, router]);

  // Fetch analysis
  useEffect(() => {
    async function fetchAnalysis() {
      if (!user?.id) return;
      try {
        const response = await fetch('/api/employee/skills-analysis', {
          headers: { 'x-user-id': user.id },
        });
        if (response.ok) {
          const data = await response.json();
          setAnalysis(data);
        }
      } catch (err) {
        console.error('Error fetching skills analysis:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalysis();
  }, [user?.id]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'from-green-500 to-emerald-500';
    if (score >= 60) return 'from-blue-500 to-cyan-500';
    if (score >= 40) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  const filteredSkills = analysis?.skillAnalyses.filter((skill) => {
    if (filter === 'gaps') return skill.gap > 0;
    if (filter === 'strengths') return skill.userLevel >= skill.averageRequired;
    return true;
  }) || [];

  if (!isLoggedIn) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Skills Gap Analysis</h1>
          <p className="text-slate-600 mt-1">
            Understand where you stand and what to improve
          </p>
        </div>

        {analysis ? (
          <>
            {/* Score Overview */}
            <div className="grid lg:grid-cols-4 gap-4 mb-8">
              {/* Overall Score Card */}
              <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-sm font-medium text-slate-600 mb-4">Market Readiness Score</h3>
                <div className="flex items-center gap-6">
                  <div className="relative w-32 h-32">
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        className="stroke-slate-100"
                        strokeWidth="12"
                        fill="none"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        className={`stroke-current ${getScoreColor(analysis.overallScore)}`}
                        strokeWidth="12"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={`${analysis.overallScore * 3.52} 352`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className={`text-3xl font-bold ${getScoreColor(analysis.overallScore)}`}>
                        {analysis.overallScore}%
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-slate-600 mb-3">
                      {analysis.overallScore >= 80
                        ? "Excellent! You're well-prepared for the job market."
                        : analysis.overallScore >= 60
                        ? "Good progress! A few more improvements will make you stand out."
                        : analysis.overallScore >= 40
                        ? "You're on your way. Focus on the gaps identified below."
                        : "Time to level up! Check out the recommendations to get started."}
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-slate-500">
                        {analysis.userSkillCount} skills tracked
                      </span>
                      <span className="text-slate-300">|</span>
                      <span className="text-slate-500">
                        {analysis.totalSkillsAnalyzed} analyzed
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-600 text-sm">Skills to Improve</span>
                  <AlertCircle className="w-5 h-5 text-orange-500" />
                </div>
                <p className="text-2xl font-bold text-slate-900">
                  {analysis.topGaps.length}
                </p>
                <p className="text-sm text-slate-500 mt-1">Priority improvements</p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-600 text-sm">Your Strengths</span>
                  <Award className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-2xl font-bold text-slate-900">
                  {analysis.topStrengths.length}
                </p>
                <p className="text-sm text-slate-500 mt-1">Market-ready skills</p>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6 mb-8">
              {/* Top Gaps */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-orange-500" />
                  Priority Improvements
                </h3>
                {analysis.topGaps.length > 0 ? (
                  <div className="space-y-3">
                    {analysis.topGaps.map((skill) => (
                      <div key={skill.skill} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-slate-900">{skill.skill}</p>
                          <p className="text-xs text-slate-500">
                            Gap: {skill.gap}% below market avg
                          </p>
                        </div>
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded ${demandColors[skill.marketDemand].bg} ${demandColors[skill.marketDemand].text}`}
                        >
                          {skill.marketDemand}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-sm">No significant gaps found</p>
                )}
              </div>

              {/* Top Strengths */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  Your Strengths
                </h3>
                {analysis.topStrengths.length > 0 ? (
                  <div className="space-y-3">
                    {analysis.topStrengths.map((skill) => (
                      <div key={skill.skill} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-slate-900">{skill.skill}</p>
                          <p className="text-xs text-slate-500">
                            {skill.userLevel}% proficiency
                          </p>
                        </div>
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-slate-500 text-sm mb-2">No strengths yet</p>
                    <Link
                      href="/dashboard/profile"
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      Add your skills
                    </Link>
                  </div>
                )}
              </div>

              {/* Suggested Skills */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  Suggested to Learn
                </h3>
                {analysis.suggestedSkills.length > 0 ? (
                  <div className="space-y-3">
                    {analysis.suggestedSkills.slice(0, 5).map((skill) => (
                      <div key={skill.skill} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-slate-900">{skill.skill}</p>
                          <p className="text-xs text-green-600">
                            +{skill.salaryImpact}% salary boost
                          </p>
                        </div>
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded ${demandColors[skill.demand as keyof typeof demandColors].bg} ${demandColors[skill.demand as keyof typeof demandColors].text}`}
                        >
                          {skill.demand}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-sm">
                    Great job! You have most in-demand skills
                  </p>
                )}
              </div>
            </div>

            {/* Detailed Skills Analysis */}
            <div className="bg-white rounded-xl border border-slate-200">
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900">Detailed Skills Analysis</h3>
                  <div className="flex gap-2">
                    {(['all', 'gaps', 'strengths'] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                          filter === f
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {filteredSkills.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {filteredSkills.map((skill) => {
                    const isExpanded = expandedSkill === skill.skill;
                    const progressPercent = Math.min(100, (skill.userLevel / skill.averageRequired) * 100);

                    return (
                      <div key={skill.skill} className="p-4 hover:bg-slate-50">
                        <div
                          className="flex items-center gap-4 cursor-pointer"
                          onClick={() => setExpandedSkill(isExpanded ? null : skill.skill)}
                        >
                          <div className="flex-shrink-0">
                            {skill.userLevel >= skill.averageRequired ? (
                              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                              </div>
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                                <Target className="w-5 h-5 text-orange-600" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1">
                              <h4 className="font-medium text-slate-900">{skill.skill}</h4>
                              <span
                                className={`px-2 py-0.5 text-xs font-medium rounded ${demandColors[skill.marketDemand].bg} ${demandColors[skill.marketDemand].text}`}
                              >
                                {skill.marketDemand} demand
                              </span>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="flex-1">
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all ${
                                      skill.userLevel >= skill.averageRequired
                                        ? 'bg-green-500'
                                        : 'bg-orange-500'
                                    }`}
                                    style={{ width: `${progressPercent}%` }}
                                  />
                                </div>
                              </div>
                              <span className="text-sm text-slate-600 w-24 text-right">
                                {skill.userLevel}% / {skill.averageRequired}%
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-6 text-sm text-slate-500">
                            {skill.relatedJobs > 0 && (
                              <span className="flex items-center gap-1">
                                <Briefcase className="w-4 h-4" />
                                {skill.relatedJobs} jobs
                              </span>
                            )}
                            <span className="flex items-center gap-1 text-green-600">
                              <DollarSign className="w-4 h-4" />
                              +{skill.salaryImpact}%
                            </span>
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5" />
                            ) : (
                              <ChevronDown className="w-5 h-5" />
                            )}
                          </div>
                        </div>

                        {isExpanded && skill.recommendations.length > 0 && (
                          <div className="mt-4 ml-14 p-4 bg-slate-50 rounded-lg">
                            <h5 className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                              <BookOpen className="w-4 h-4" />
                              Recommendations
                            </h5>
                            <ul className="space-y-2">
                              {skill.recommendations.map((rec, idx) => (
                                <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                                  <ArrowRight className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-500" />
                                  {rec}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <Target className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No skills to display</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <Zap className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="font-semibold text-slate-900 mb-2">Add Skills to Get Started</h3>
            <p className="text-slate-500 mb-6">
              We need to know your skills to provide analysis
            </p>
            <Link
              href="/dashboard/profile"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Update Profile
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
