'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import {
  Target,
  Plus,
  ChevronDown,
  ChevronRight,
  Edit2,
  Trash2,
  CheckCircle2,
  Circle,
  Clock,
  TrendingUp,
  Star,
  Calendar,
  Building2,
  DollarSign,
  Award,
  Loader2,
  X,
  GripVertical,
} from 'lucide-react';

interface SkillTarget {
  id: string;
  skillName: string;
  currentLevel: number;
  targetLevel: number;
  isAchieved: boolean;
}

interface Milestone {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  isCompleted: boolean;
  completedAt: string | null;
  order: number;
}

interface CareerGoal {
  id: string;
  title: string;
  targetRole: string;
  targetIndustry: string | null;
  targetSalary: number | null;
  targetCompanies: string[];
  targetDate: string | null;
  priority: 'low' | 'medium' | 'high';
  status: 'active' | 'achieved' | 'paused' | 'abandoned';
  description: string | null;
  motivation: string | null;
  milestones: Milestone[];
  skillTargets: SkillTarget[];
  progressPercent: number;
  stats: {
    totalMilestones: number;
    completedMilestones: number;
    totalSkills: number;
    achievedSkills: number;
  };
  createdAt: string;
}

const priorityColors = {
  low: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' },
  medium: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
  high: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' },
};

const statusColors = {
  active: { bg: 'bg-green-100', text: 'text-green-700' },
  achieved: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  paused: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  abandoned: { bg: 'bg-red-100', text: 'text-red-700' },
};

export default function CareerGoalsPage() {
  const router = useRouter();
  const { user, isLoggedIn } = useAuth();
  const [goals, setGoals] = useState<CareerGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<CareerGoal | null>(null);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form states
  const [goalForm, setGoalForm] = useState({
    title: '',
    targetRole: '',
    targetIndustry: '',
    targetSalary: '',
    targetCompanies: '',
    targetDate: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    description: '',
    motivation: '',
  });

  const [milestoneForm, setMilestoneForm] = useState({
    title: '',
    description: '',
    dueDate: '',
  });

  const [skillForm, setSkillForm] = useState({
    skillName: '',
    currentLevel: 30,
    targetLevel: 80,
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/auth/employee/login');
    }
  }, [isLoggedIn, router]);

  // Fetch goals
  useEffect(() => {
    async function fetchGoals() {
      if (!user?.id) return;
      try {
        const response = await fetch('/api/employee/career-goals', {
          headers: { 'x-user-id': user.id },
        });
        if (response.ok) {
          const data = await response.json();
          setGoals(data.goals);
        }
      } catch (err) {
        console.error('Error fetching goals:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchGoals();
  }, [user?.id]);

  const resetGoalForm = () => {
    setGoalForm({
      title: '',
      targetRole: '',
      targetIndustry: '',
      targetSalary: '',
      targetCompanies: '',
      targetDate: '',
      priority: 'medium',
      description: '',
      motivation: '',
    });
    setEditingGoal(null);
  };

  const openEditGoal = (goal: CareerGoal) => {
    setEditingGoal(goal);
    setGoalForm({
      title: goal.title,
      targetRole: goal.targetRole,
      targetIndustry: goal.targetIndustry || '',
      targetSalary: goal.targetSalary?.toString() || '',
      targetCompanies: goal.targetCompanies.join(', '),
      targetDate: goal.targetDate ? goal.targetDate.split('T')[0] : '',
      priority: goal.priority,
      description: goal.description || '',
      motivation: goal.motivation || '',
    });
    setShowGoalModal(true);
  };

  const handleSaveGoal = async () => {
    if (!user?.id || !goalForm.title || !goalForm.targetRole) return;

    setSaving(true);
    try {
      const payload = {
        title: goalForm.title,
        targetRole: goalForm.targetRole,
        targetIndustry: goalForm.targetIndustry || null,
        targetSalary: goalForm.targetSalary || null,
        targetCompanies: goalForm.targetCompanies
          ? goalForm.targetCompanies.split(',').map((c) => c.trim()).filter(Boolean)
          : [],
        targetDate: goalForm.targetDate || null,
        priority: goalForm.priority,
        description: goalForm.description || null,
        motivation: goalForm.motivation || null,
      };

      const url = editingGoal
        ? `/api/employee/career-goals/${editingGoal.id}`
        : '/api/employee/career-goals';

      const response = await fetch(url, {
        method: editingGoal ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        if (editingGoal) {
          setGoals((prev) =>
            prev.map((g) => (g.id === editingGoal.id ? { ...g, ...data.goal } : g))
          );
        } else {
          setGoals((prev) => [{ ...data.goal, progressPercent: 0, stats: { totalMilestones: 0, completedMilestones: 0, totalSkills: 0, achievedSkills: 0 } }, ...prev]);
        }
        setShowGoalModal(false);
        resetGoalForm();
      }
    } catch (err) {
      console.error('Error saving goal:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!user?.id || !confirm('Are you sure you want to delete this goal?')) return;

    try {
      const response = await fetch(`/api/employee/career-goals/${goalId}`, {
        method: 'DELETE',
        headers: { 'x-user-id': user.id },
      });

      if (response.ok) {
        setGoals((prev) => prev.filter((g) => g.id !== goalId));
      }
    } catch (err) {
      console.error('Error deleting goal:', err);
    }
  };

  const handleAddMilestone = async () => {
    if (!user?.id || !selectedGoalId || !milestoneForm.title) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/employee/career-goals/${selectedGoalId}/milestones`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify(milestoneForm),
      });

      if (response.ok) {
        const data = await response.json();
        setGoals((prev) =>
          prev.map((g) => {
            if (g.id === selectedGoalId) {
              return {
                ...g,
                milestones: [...g.milestones, data.milestone],
                stats: {
                  ...g.stats,
                  totalMilestones: g.stats.totalMilestones + 1,
                },
              };
            }
            return g;
          })
        );
        setShowMilestoneModal(false);
        setMilestoneForm({ title: '', description: '', dueDate: '' });
      }
    } catch (err) {
      console.error('Error adding milestone:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleMilestone = async (goalId: string, milestone: Milestone) => {
    if (!user?.id) return;

    try {
      const response = await fetch(
        `/api/employee/career-goals/${goalId}/milestones/${milestone.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': user.id,
          },
          body: JSON.stringify({
            ...milestone,
            isCompleted: !milestone.isCompleted,
          }),
        }
      );

      if (response.ok) {
        setGoals((prev) =>
          prev.map((g) => {
            if (g.id === goalId) {
              const newMilestones = g.milestones.map((m) =>
                m.id === milestone.id ? { ...m, isCompleted: !m.isCompleted } : m
              );
              const completedCount = newMilestones.filter((m) => m.isCompleted).length;
              return {
                ...g,
                milestones: newMilestones,
                stats: {
                  ...g.stats,
                  completedMilestones: completedCount,
                },
              };
            }
            return g;
          })
        );
      }
    } catch (err) {
      console.error('Error toggling milestone:', err);
    }
  };

  const handleAddSkill = async () => {
    if (!user?.id || !selectedGoalId || !skillForm.skillName) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/employee/career-goals/${selectedGoalId}/skills`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify(skillForm),
      });

      if (response.ok) {
        const data = await response.json();
        setGoals((prev) =>
          prev.map((g) => {
            if (g.id === selectedGoalId) {
              return {
                ...g,
                skillTargets: [...g.skillTargets, data.skillTarget],
                stats: {
                  ...g.stats,
                  totalSkills: g.stats.totalSkills + 1,
                  achievedSkills: data.skillTarget.isAchieved
                    ? g.stats.achievedSkills + 1
                    : g.stats.achievedSkills,
                },
              };
            }
            return g;
          })
        );
        setShowSkillModal(false);
        setSkillForm({ skillName: '', currentLevel: 30, targetLevel: 80 });
      }
    } catch (err) {
      console.error('Error adding skill:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateSkillLevel = async (
    goalId: string,
    skill: SkillTarget,
    newLevel: number
  ) => {
    if (!user?.id) return;

    try {
      const response = await fetch(
        `/api/employee/career-goals/${goalId}/skills/${skill.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': user.id,
          },
          body: JSON.stringify({
            currentLevel: newLevel,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setGoals((prev) =>
          prev.map((g) => {
            if (g.id === goalId) {
              const newSkills = g.skillTargets.map((s) =>
                s.id === skill.id ? data.skillTarget : s
              );
              return {
                ...g,
                skillTargets: newSkills,
                stats: {
                  ...g.stats,
                  achievedSkills: newSkills.filter((s) => s.isAchieved).length,
                },
              };
            }
            return g;
          })
        );
      }
    } catch (err) {
      console.error('Error updating skill:', err);
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
            <h1 className="text-2xl font-bold text-slate-900">Career Goals</h1>
            <p className="text-slate-600 mt-1">
              Track your career aspirations and progress
            </p>
          </div>
          <button
            onClick={() => {
              resetGoalForm();
              setShowGoalModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Goal
          </button>
        </div>

        {/* Goals List */}
        {goals.length > 0 ? (
          <div className="space-y-4">
            {goals.map((goal) => {
              const isExpanded = expandedGoal === goal.id;
              const priorityStyle = priorityColors[goal.priority];
              const statusStyle = statusColors[goal.status];

              return (
                <div
                  key={goal.id}
                  className="bg-white rounded-xl border border-slate-200 overflow-hidden"
                >
                  {/* Goal Header */}
                  <div
                    className="p-5 cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => setExpandedGoal(isExpanded ? null : goal.id)}
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
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-slate-900 text-lg">
                            {goal.title}
                          </h3>
                          <span
                            className={`px-2 py-0.5 text-xs font-medium rounded ${priorityStyle.bg} ${priorityStyle.text}`}
                          >
                            {goal.priority}
                          </span>
                          <span
                            className={`px-2 py-0.5 text-xs font-medium rounded ${statusStyle.bg} ${statusStyle.text}`}
                          >
                            {goal.status}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                          <span className="flex items-center gap-1.5">
                            <Target className="w-4 h-4" />
                            {goal.targetRole}
                          </span>
                          {goal.targetIndustry && (
                            <span className="flex items-center gap-1.5">
                              <Building2 className="w-4 h-4" />
                              {goal.targetIndustry}
                            </span>
                          )}
                          {goal.targetSalary && (
                            <span className="flex items-center gap-1.5">
                              <DollarSign className="w-4 h-4" />
                              {goal.targetSalary.toLocaleString()}
                            </span>
                          )}
                          {goal.targetDate && (
                            <span className="flex items-center gap-1.5">
                              <Calendar className="w-4 h-4" />
                              {formatDate(goal.targetDate)}
                            </span>
                          )}
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-4">
                          <div className="flex items-center justify-between text-sm mb-1.5">
                            <span className="text-slate-600">Progress</span>
                            <span className="font-medium text-slate-900">
                              {goal.progressPercent}%
                            </span>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                goal.progressPercent >= 80
                                  ? 'bg-green-500'
                                  : goal.progressPercent >= 50
                                  ? 'bg-blue-500'
                                  : 'bg-orange-500'
                              }`}
                              style={{ width: `${goal.progressPercent}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-xs text-slate-500 mt-1.5">
                            <span>
                              {goal.stats.completedMilestones}/{goal.stats.totalMilestones} milestones
                            </span>
                            <span>
                              {goal.stats.achievedSkills}/{goal.stats.totalSkills} skills
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => openEditGoal(goal)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteGoal(goal.id)}
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
                      {/* Description & Motivation */}
                      {(goal.description || goal.motivation) && (
                        <div className="grid md:grid-cols-2 gap-4 mb-6">
                          {goal.description && (
                            <div className="bg-white p-4 rounded-lg border border-slate-200">
                              <h4 className="text-sm font-medium text-slate-700 mb-2">
                                Description
                              </h4>
                              <p className="text-sm text-slate-600">{goal.description}</p>
                            </div>
                          )}
                          {goal.motivation && (
                            <div className="bg-white p-4 rounded-lg border border-slate-200">
                              <h4 className="text-sm font-medium text-slate-700 mb-2">
                                Motivation
                              </h4>
                              <p className="text-sm text-slate-600">{goal.motivation}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Target Companies */}
                      {goal.targetCompanies.length > 0 && (
                        <div className="mb-6">
                          <h4 className="text-sm font-medium text-slate-700 mb-2">
                            Target Companies
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {goal.targetCompanies.map((company, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-white border border-slate-200 rounded-full text-sm text-slate-700"
                              >
                                {company}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Milestones Section */}
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-medium text-slate-700">
                            Milestones ({goal.stats.completedMilestones}/{goal.stats.totalMilestones})
                          </h4>
                          <button
                            onClick={() => {
                              setSelectedGoalId(goal.id);
                              setShowMilestoneModal(true);
                            }}
                            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                          >
                            <Plus className="w-4 h-4" /> Add
                          </button>
                        </div>
                        {goal.milestones.length > 0 ? (
                          <div className="space-y-2">
                            {goal.milestones.map((milestone) => (
                              <div
                                key={milestone.id}
                                className={`flex items-center gap-3 p-3 bg-white rounded-lg border transition-colors ${
                                  milestone.isCompleted
                                    ? 'border-green-200 bg-green-50/50'
                                    : 'border-slate-200'
                                }`}
                              >
                                <button
                                  onClick={() => handleToggleMilestone(goal.id, milestone)}
                                  className={`flex-shrink-0 ${
                                    milestone.isCompleted
                                      ? 'text-green-600'
                                      : 'text-slate-300 hover:text-slate-400'
                                  }`}
                                >
                                  {milestone.isCompleted ? (
                                    <CheckCircle2 className="w-5 h-5" />
                                  ) : (
                                    <Circle className="w-5 h-5" />
                                  )}
                                </button>
                                <div className="flex-1 min-w-0">
                                  <p
                                    className={`font-medium ${
                                      milestone.isCompleted
                                        ? 'text-slate-500 line-through'
                                        : 'text-slate-900'
                                    }`}
                                  >
                                    {milestone.title}
                                  </p>
                                  {milestone.description && (
                                    <p className="text-sm text-slate-500 mt-0.5">
                                      {milestone.description}
                                    </p>
                                  )}
                                </div>
                                {milestone.dueDate && (
                                  <span className="text-xs text-slate-500 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {formatDate(milestone.dueDate)}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-slate-500 bg-white p-4 rounded-lg border border-slate-200 text-center">
                            No milestones yet. Add milestones to track your progress.
                          </p>
                        )}
                      </div>

                      {/* Skills Section */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-medium text-slate-700">
                            Skill Targets ({goal.stats.achievedSkills}/{goal.stats.totalSkills})
                          </h4>
                          <button
                            onClick={() => {
                              setSelectedGoalId(goal.id);
                              setShowSkillModal(true);
                            }}
                            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                          >
                            <Plus className="w-4 h-4" /> Add
                          </button>
                        </div>
                        {goal.skillTargets.length > 0 ? (
                          <div className="space-y-3">
                            {goal.skillTargets.map((skill) => (
                              <div
                                key={skill.id}
                                className={`p-4 bg-white rounded-lg border ${
                                  skill.isAchieved ? 'border-green-200' : 'border-slate-200'
                                }`}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-slate-900">
                                      {skill.skillName}
                                    </span>
                                    {skill.isAchieved && (
                                      <Award className="w-4 h-4 text-green-600" />
                                    )}
                                  </div>
                                  <span className="text-sm text-slate-600">
                                    {skill.currentLevel}% / {skill.targetLevel}%
                                  </span>
                                </div>
                                <div className="relative">
                                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-slate-300 rounded-full absolute"
                                      style={{ width: `${skill.targetLevel}%` }}
                                    />
                                    <div
                                      className={`h-full rounded-full relative ${
                                        skill.isAchieved ? 'bg-green-500' : 'bg-blue-500'
                                      }`}
                                      style={{ width: `${skill.currentLevel}%` }}
                                    />
                                  </div>
                                </div>
                                <div className="mt-2 flex items-center gap-2">
                                  <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={skill.currentLevel}
                                    onChange={(e) =>
                                      handleUpdateSkillLevel(
                                        goal.id,
                                        skill,
                                        parseInt(e.target.value)
                                      )
                                    }
                                    className="flex-1 h-1 bg-slate-200 rounded-full appearance-none cursor-pointer"
                                  />
                                  <span className="text-xs text-slate-500 w-8">
                                    {skill.currentLevel}%
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-slate-500 bg-white p-4 rounded-lg border border-slate-200 text-center">
                            No skill targets yet. Add skills you want to develop.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <Target className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="font-semibold text-slate-900 mb-2">No career goals yet</h3>
            <p className="text-slate-500 mb-6">
              Set your first career goal to start tracking your progress
            </p>
            <button
              onClick={() => {
                resetGoalForm();
                setShowGoalModal(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-5 h-5" />
              Create Your First Goal
            </button>
          </div>
        )}
      </div>

      {/* Goal Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">
                {editingGoal ? 'Edit Goal' : 'New Career Goal'}
              </h2>
              <button
                onClick={() => {
                  setShowGoalModal(false);
                  resetGoalForm();
                }}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Goal Title *
                </label>
                <input
                  type="text"
                  value={goalForm.title}
                  onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
                  placeholder="e.g., Become a Senior Software Engineer"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Target Role *
                  </label>
                  <input
                    type="text"
                    value={goalForm.targetRole}
                    onChange={(e) => setGoalForm({ ...goalForm, targetRole: e.target.value })}
                    placeholder="e.g., Senior Software Engineer"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Target Industry
                  </label>
                  <input
                    type="text"
                    value={goalForm.targetIndustry}
                    onChange={(e) => setGoalForm({ ...goalForm, targetIndustry: e.target.value })}
                    placeholder="e.g., Technology"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Target Salary
                  </label>
                  <input
                    type="number"
                    value={goalForm.targetSalary}
                    onChange={(e) => setGoalForm({ ...goalForm, targetSalary: e.target.value })}
                    placeholder="e.g., 150000"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Target Date
                  </label>
                  <input
                    type="date"
                    value={goalForm.targetDate}
                    onChange={(e) => setGoalForm({ ...goalForm, targetDate: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Target Companies (comma-separated)
                </label>
                <input
                  type="text"
                  value={goalForm.targetCompanies}
                  onChange={(e) => setGoalForm({ ...goalForm, targetCompanies: e.target.value })}
                  placeholder="e.g., Google, Microsoft, Amazon"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Priority
                </label>
                <div className="flex gap-3">
                  {(['low', 'medium', 'high'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setGoalForm({ ...goalForm, priority: p })}
                      className={`flex-1 py-2 rounded-lg border text-sm font-medium capitalize transition-colors ${
                        goalForm.priority === p
                          ? `${priorityColors[p].bg} ${priorityColors[p].text} ${priorityColors[p].border}`
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Description
                </label>
                <textarea
                  value={goalForm.description}
                  onChange={(e) => setGoalForm({ ...goalForm, description: e.target.value })}
                  placeholder="Describe your career goal..."
                  rows={3}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Motivation
                </label>
                <textarea
                  value={goalForm.motivation}
                  onChange={(e) => setGoalForm({ ...goalForm, motivation: e.target.value })}
                  placeholder="Why is this goal important to you?"
                  rows={3}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowGoalModal(false);
                  resetGoalForm();
                }}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveGoal}
                disabled={saving || !goalForm.title || !goalForm.targetRole}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingGoal ? 'Save Changes' : 'Create Goal'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Milestone Modal */}
      {showMilestoneModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Add Milestone</h2>
              <button
                onClick={() => setShowMilestoneModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Milestone Title *
                </label>
                <input
                  type="text"
                  value={milestoneForm.title}
                  onChange={(e) =>
                    setMilestoneForm({ ...milestoneForm, title: e.target.value })
                  }
                  placeholder="e.g., Complete AWS certification"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Description
                </label>
                <textarea
                  value={milestoneForm.description}
                  onChange={(e) =>
                    setMilestoneForm({ ...milestoneForm, description: e.target.value })
                  }
                  placeholder="Optional details..."
                  rows={2}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Due Date
                </label>
                <input
                  type="date"
                  value={milestoneForm.dueDate}
                  onChange={(e) =>
                    setMilestoneForm({ ...milestoneForm, dueDate: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="border-t border-slate-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setShowMilestoneModal(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMilestone}
                disabled={saving || !milestoneForm.title}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Add Milestone
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Skill Modal */}
      {showSkillModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Add Skill Target</h2>
              <button
                onClick={() => setShowSkillModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Skill Name *
                </label>
                <input
                  type="text"
                  value={skillForm.skillName}
                  onChange={(e) => setSkillForm({ ...skillForm, skillName: e.target.value })}
                  placeholder="e.g., React, Python, Leadership"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Current Level: {skillForm.currentLevel}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={skillForm.currentLevel}
                  onChange={(e) =>
                    setSkillForm({ ...skillForm, currentLevel: parseInt(e.target.value) })
                  }
                  className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Target Level: {skillForm.targetLevel}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={skillForm.targetLevel}
                  onChange={(e) =>
                    setSkillForm({ ...skillForm, targetLevel: parseInt(e.target.value) })
                  }
                  className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer"
                />
              </div>
            </div>

            <div className="border-t border-slate-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setShowSkillModal(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSkill}
                disabled={saving || !skillForm.skillName}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Add Skill
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
