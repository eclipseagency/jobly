'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  Plus,
  ChevronDown,
  ChevronRight,
  Edit2,
  Trash2,
  CheckCircle2,
  Circle,
  Clock,
  MessageSquare,
  Building2,
  Briefcase,
  Calendar,
  Star,
  Loader2,
  X,
  Lightbulb,
  Target,
  ThumbsUp,
} from 'lucide-react';

interface InterviewQuestion {
  id: string;
  question: string;
  category: string;
  answer: string | null;
  tip: string | null;
  practiced: boolean;
  confidenceLevel: number;
  notes: string | null;
  practicedAt: string | null;
}

interface InterviewPrep {
  id: string;
  title: string;
  companyName: string | null;
  jobTitle: string | null;
  interviewDate: string | null;
  notes: string | null;
  status: string;
  questions: InterviewQuestion[];
  createdAt: string;
  updatedAt: string;
}

interface QuestionBank {
  behavioral: Array<{ question: string; tip: string }>;
  technical: Array<{ question: string; tip: string }>;
  situational: Array<{ question: string; tip: string }>;
  culture: Array<{ question: string; tip: string }>;
}

const categoryColors: Record<string, { bg: string; text: string }> = {
  behavioral: { bg: 'bg-blue-100', text: 'text-blue-700' },
  technical: { bg: 'bg-purple-100', text: 'text-purple-700' },
  situational: { bg: 'bg-orange-100', text: 'text-orange-700' },
  culture: { bg: 'bg-green-100', text: 'text-green-700' },
  general: { bg: 'bg-slate-100', text: 'text-slate-700' },
};

export default function InterviewPrepPage() {
  const router = useRouter();
  const { user, isLoggedIn } = useAuth();
  const [preps, setPreps] = useState<InterviewPrep[]>([]);
  const [questionBank, setQuestionBank] = useState<QuestionBank | null>(null);
  const [stats, setStats] = useState({
    totalPreps: 0,
    totalQuestions: 0,
    practicedQuestions: 0,
    confidentQuestions: 0,
    practiceRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [expandedPrep, setExpandedPrep] = useState<string | null>(null);
  const [showPrepModal, setShowPrepModal] = useState(false);
  const [showQuestionBankModal, setShowQuestionBankModal] = useState(false);
  const [showPracticeModal, setShowPracticeModal] = useState(false);
  const [selectedPrep, setSelectedPrep] = useState<InterviewPrep | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<InterviewQuestion | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('behavioral');
  const [saving, setSaving] = useState(false);

  const [prepForm, setPrepForm] = useState({
    title: '',
    companyName: '',
    jobTitle: '',
    interviewDate: '',
    notes: '',
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/auth/employee/login');
    }
  }, [isLoggedIn, router]);

  // Fetch data
  useEffect(() => {
    async function fetchData() {
      if (!user?.id) return;
      try {
        const response = await fetch('/api/employee/interview-prep', {
          headers: { 'x-user-id': user.id },
        });
        if (response.ok) {
          const data = await response.json();
          setPreps(data.preps);
          setQuestionBank(data.questionBank);
          setStats(data.stats);
        }
      } catch (err) {
        console.error('Error fetching interview prep:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user?.id]);

  const handleCreatePrep = async () => {
    if (!user?.id || !prepForm.title) return;

    setSaving(true);
    try {
      const response = await fetch('/api/employee/interview-prep', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify(prepForm),
      });

      if (response.ok) {
        const data = await response.json();
        setPreps((prev) => [data.prep, ...prev]);
        setShowPrepModal(false);
        setPrepForm({ title: '', companyName: '', jobTitle: '', interviewDate: '', notes: '' });
        setExpandedPrep(data.prep.id);
      }
    } catch (err) {
      console.error('Error creating prep:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePrep = async (prepId: string) => {
    if (!user?.id || !confirm('Delete this interview prep?')) return;

    try {
      const response = await fetch(`/api/employee/interview-prep/${prepId}`, {
        method: 'DELETE',
        headers: { 'x-user-id': user.id },
      });

      if (response.ok) {
        setPreps((prev) => prev.filter((p) => p.id !== prepId));
      }
    } catch (err) {
      console.error('Error deleting prep:', err);
    }
  };

  const handleAddQuestionsFromBank = async (category: string) => {
    if (!user?.id || !selectedPrep || !questionBank) return;

    const questions = questionBank[category as keyof QuestionBank];
    if (!questions) return;

    setSaving(true);
    try {
      const response = await fetch(
        `/api/employee/interview-prep/${selectedPrep.id}/questions`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': user.id,
          },
          body: JSON.stringify({
            questions: questions.map((q) => ({
              question: q.question,
              category,
              tip: q.tip,
            })),
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPreps((prev) =>
          prev.map((p) =>
            p.id === selectedPrep.id ? { ...p, questions: data.questions } : p
          )
        );
        setShowQuestionBankModal(false);
      }
    } catch (err) {
      console.error('Error adding questions:', err);
    } finally {
      setSaving(false);
    }
  };

  const handlePracticeQuestion = async (
    prepId: string,
    question: InterviewQuestion,
    confidenceLevel: number,
    answer?: string
  ) => {
    if (!user?.id) return;

    try {
      const response = await fetch(
        `/api/employee/interview-prep/${prepId}/questions/${question.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': user.id,
          },
          body: JSON.stringify({
            practiced: true,
            confidenceLevel,
            answer: answer || question.answer,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPreps((prev) =>
          prev.map((p) =>
            p.id === prepId
              ? {
                  ...p,
                  questions: p.questions.map((q) =>
                    q.id === question.id ? data.question : q
                  ),
                }
              : p
          )
        );
        setShowPracticeModal(false);
        setSelectedQuestion(null);
      }
    } catch (err) {
      console.error('Error updating question:', err);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

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
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Interview Prep Hub</h1>
            <p className="text-slate-600 mt-1">
              Practice questions and prepare for interviews
            </p>
          </div>
          <button
            onClick={() => setShowPrepModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Prep
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-500 text-sm">Total Preps</span>
              <BookOpen className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{stats.totalPreps}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-500 text-sm">Questions</span>
              <MessageSquare className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{stats.totalQuestions}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-500 text-sm">Practiced</span>
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{stats.practicedQuestions}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-500 text-sm">Practice Rate</span>
              <Target className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{stats.practiceRate}%</p>
          </div>
        </div>

        {/* Preps List */}
        {preps.length > 0 ? (
          <div className="space-y-4">
            {preps.map((prep) => {
              const isExpanded = expandedPrep === prep.id;
              const practicedCount = prep.questions.filter((q) => q.practiced).length;
              const totalQuestions = prep.questions.length;
              const progress = totalQuestions > 0
                ? Math.round((practicedCount / totalQuestions) * 100)
                : 0;

              return (
                <div
                  key={prep.id}
                  className="bg-white rounded-xl border border-slate-200 overflow-hidden"
                >
                  {/* Prep Header */}
                  <div
                    className="p-5 cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => setExpandedPrep(isExpanded ? null : prep.id)}
                  >
                    <div className="flex items-start gap-4">
                      <button className="mt-1">
                        {isExpanded ? (
                          <ChevronDown className="w-5 h-5 text-slate-400" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-slate-400" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 text-lg">
                          {prep.title}
                        </h3>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 mt-2">
                          {prep.companyName && (
                            <span className="flex items-center gap-1.5">
                              <Building2 className="w-4 h-4" />
                              {prep.companyName}
                            </span>
                          )}
                          {prep.jobTitle && (
                            <span className="flex items-center gap-1.5">
                              <Briefcase className="w-4 h-4" />
                              {prep.jobTitle}
                            </span>
                          )}
                          {prep.interviewDate && (
                            <span className="flex items-center gap-1.5">
                              <Calendar className="w-4 h-4" />
                              {formatDate(prep.interviewDate)}
                            </span>
                          )}
                        </div>

                        {/* Progress */}
                        {totalQuestions > 0 && (
                          <div className="mt-4">
                            <div className="flex items-center justify-between text-sm mb-1.5">
                              <span className="text-slate-600">Practice Progress</span>
                              <span className="font-medium text-slate-900">
                                {practicedCount}/{totalQuestions} questions
                              </span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-green-500 rounded-full transition-all"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div
                        className="flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => handleDeletePrep(prep.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="border-t border-slate-200 p-5 bg-slate-50">
                      {/* Notes */}
                      {prep.notes && (
                        <div className="mb-6 p-4 bg-white rounded-lg border border-slate-200">
                          <h4 className="text-sm font-medium text-slate-700 mb-2">Notes</h4>
                          <p className="text-sm text-slate-600">{prep.notes}</p>
                        </div>
                      )}

                      {/* Add Questions Button */}
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-slate-700">Questions</h4>
                        <button
                          onClick={() => {
                            setSelectedPrep(prep);
                            setShowQuestionBankModal(true);
                          }}
                          className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        >
                          <Plus className="w-4 h-4" /> Add from Bank
                        </button>
                      </div>

                      {/* Questions */}
                      {prep.questions.length > 0 ? (
                        <div className="space-y-3">
                          {prep.questions.map((question) => {
                            const catColors = categoryColors[question.category] || categoryColors.general;

                            return (
                              <div
                                key={question.id}
                                className={`p-4 bg-white rounded-lg border transition-colors ${
                                  question.practiced
                                    ? 'border-green-200'
                                    : 'border-slate-200'
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  <button
                                    onClick={() => {
                                      if (!question.practiced) {
                                        setSelectedQuestion(question);
                                        setSelectedPrep(prep);
                                        setShowPracticeModal(true);
                                      }
                                    }}
                                    className={`flex-shrink-0 mt-0.5 ${
                                      question.practiced
                                        ? 'text-green-600'
                                        : 'text-slate-300 hover:text-slate-400'
                                    }`}
                                  >
                                    {question.practiced ? (
                                      <CheckCircle2 className="w-5 h-5" />
                                    ) : (
                                      <Circle className="w-5 h-5" />
                                    )}
                                  </button>

                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span
                                        className={`px-2 py-0.5 text-xs font-medium rounded ${catColors.bg} ${catColors.text}`}
                                      >
                                        {question.category}
                                      </span>
                                      {question.practiced && question.confidenceLevel > 0 && (
                                        <div className="flex items-center gap-0.5">
                                          {[1, 2, 3, 4, 5].map((level) => (
                                            <Star
                                              key={level}
                                              className={`w-3 h-3 ${
                                                level <= question.confidenceLevel
                                                  ? 'text-yellow-400 fill-yellow-400'
                                                  : 'text-slate-300'
                                              }`}
                                            />
                                          ))}
                                        </div>
                                      )}
                                    </div>

                                    <p className="text-slate-900 font-medium">
                                      {question.question}
                                    </p>

                                    {question.tip && (
                                      <p className="text-sm text-slate-500 mt-2 flex items-start gap-1.5">
                                        <Lightbulb className="w-4 h-4 flex-shrink-0 mt-0.5 text-yellow-500" />
                                        {question.tip}
                                      </p>
                                    )}

                                    {question.answer && (
                                      <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                                        <p className="text-sm text-slate-700">{question.answer}</p>
                                      </div>
                                    )}
                                  </div>

                                  {!question.practiced && (
                                    <button
                                      onClick={() => {
                                        setSelectedQuestion(question);
                                        setSelectedPrep(prep);
                                        setShowPracticeModal(true);
                                      }}
                                      className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    >
                                      Practice
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-8 bg-white rounded-lg border border-slate-200">
                          <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                          <p className="text-slate-500">No questions yet</p>
                          <button
                            onClick={() => {
                              setSelectedPrep(prep);
                              setShowQuestionBankModal(true);
                            }}
                            className="mt-2 text-sm text-blue-600 hover:text-blue-700"
                          >
                            Add questions from our question bank
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="font-semibold text-slate-900 mb-2">No interview preps yet</h3>
            <p className="text-slate-500 mb-6">
              Create your first interview prep to start practicing
            </p>
            <button
              onClick={() => setShowPrepModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-5 h-5" />
              Create Interview Prep
            </button>
          </div>
        )}
      </div>

      {/* Create Prep Modal */}
      {showPrepModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">New Interview Prep</h2>
              <button
                onClick={() => setShowPrepModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Title *
                </label>
                <input
                  type="text"
                  value={prepForm.title}
                  onChange={(e) => setPrepForm({ ...prepForm, title: e.target.value })}
                  placeholder="e.g., Google SWE Interview"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Company
                  </label>
                  <input
                    type="text"
                    value={prepForm.companyName}
                    onChange={(e) => setPrepForm({ ...prepForm, companyName: e.target.value })}
                    placeholder="e.g., Google"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Position
                  </label>
                  <input
                    type="text"
                    value={prepForm.jobTitle}
                    onChange={(e) => setPrepForm({ ...prepForm, jobTitle: e.target.value })}
                    placeholder="e.g., Software Engineer"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Interview Date
                </label>
                <input
                  type="date"
                  value={prepForm.interviewDate}
                  onChange={(e) => setPrepForm({ ...prepForm, interviewDate: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Notes
                </label>
                <textarea
                  value={prepForm.notes}
                  onChange={(e) => setPrepForm({ ...prepForm, notes: e.target.value })}
                  placeholder="Any notes about the interview..."
                  rows={3}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>

            <div className="border-t border-slate-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setShowPrepModal(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePrep}
                disabled={saving || !prepForm.title}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Question Bank Modal */}
      {showQuestionBankModal && questionBank && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Question Bank</h2>
              <button
                onClick={() => setShowQuestionBankModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="p-6">
              {/* Category Tabs */}
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {Object.keys(questionBank).map((category) => {
                  const catColors = categoryColors[category] || categoryColors.general;
                  return (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                        selectedCategory === category
                          ? `${catColors.bg} ${catColors.text}`
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </button>
                  );
                })}
              </div>

              {/* Questions Preview */}
              <div className="space-y-3 mb-6">
                {questionBank[selectedCategory as keyof QuestionBank]?.slice(0, 5).map(
                  (q, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-sm text-slate-900">{q.question}</p>
                      <p className="text-xs text-slate-500 mt-1 flex items-start gap-1">
                        <Lightbulb className="w-3 h-3 flex-shrink-0 mt-0.5 text-yellow-500" />
                        {q.tip}
                      </p>
                    </div>
                  )
                )}
                <p className="text-sm text-slate-500 text-center">
                  ...and {(questionBank[selectedCategory as keyof QuestionBank]?.length || 0) - 5}{' '}
                  more questions
                </p>
              </div>

              <button
                onClick={() => handleAddQuestionsFromBank(selectedCategory)}
                disabled={saving}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Add All {selectedCategory} Questions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Practice Modal */}
      {showPracticeModal && selectedQuestion && selectedPrep && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg">
            <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Practice Question</h2>
              <button
                onClick={() => {
                  setShowPracticeModal(false);
                  setSelectedQuestion(null);
                }}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="p-6">
              <p className="text-lg font-medium text-slate-900 mb-4">
                {selectedQuestion.question}
              </p>

              {selectedQuestion.tip && (
                <div className="p-3 bg-yellow-50 rounded-lg mb-6">
                  <p className="text-sm text-yellow-800 flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    {selectedQuestion.tip}
                  </p>
                </div>
              )}

              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Your Answer (optional)
                </label>
                <textarea
                  id="practiceAnswer"
                  rows={4}
                  placeholder="Practice your answer here..."
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  How confident do you feel?
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <button
                      key={level}
                      onClick={() => {
                        const answerEl = document.getElementById('practiceAnswer') as HTMLTextAreaElement;
                        handlePracticeQuestion(
                          selectedPrep.id,
                          selectedQuestion,
                          level,
                          answerEl?.value
                        );
                      }}
                      className="flex-1 py-3 flex flex-col items-center gap-1 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-colors"
                    >
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= level
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-slate-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-slate-500">
                        {level === 1
                          ? 'Not ready'
                          : level === 2
                          ? 'Needs work'
                          : level === 3
                          ? 'Okay'
                          : level === 4
                          ? 'Good'
                          : 'Excellent'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
