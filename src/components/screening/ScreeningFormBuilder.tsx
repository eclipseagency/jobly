'use client';

import { useState } from 'react';

// Question types supported by the screening system
const QUESTION_TYPES = [
  { value: 'YES_NO', label: 'Yes/No', icon: '✓' },
  { value: 'SINGLE_SELECT', label: 'Single Choice', icon: '○' },
  { value: 'MULTI_SELECT', label: 'Multiple Choice', icon: '☑' },
  { value: 'SHORT_TEXT', label: 'Short Text', icon: 'Aa' },
  { value: 'LONG_TEXT', label: 'Long Text', icon: '¶' },
  { value: 'NUMBER', label: 'Number', icon: '#' },
  { value: 'DATE', label: 'Date', icon: '📅' },
  { value: 'SALARY_EXPECTATION', label: 'Salary Expectation', icon: '₱' },
  { value: 'YEARS_OF_EXPERIENCE', label: 'Years of Experience', icon: '📊' },
  { value: 'AVAILABILITY', label: 'Start Date Availability', icon: '📆' },
  { value: 'WORK_AUTHORIZATION', label: 'Work Authorization', icon: '📋' },
  { value: 'URL_LIST', label: 'Portfolio/Links', icon: '🔗' },
  { value: 'FILE_UPLOAD', label: 'File Upload', icon: '📎' },
] as const;

const RULE_OPERATORS = [
  { value: 'EQUALS', label: 'Equals' },
  { value: 'NOT_EQUALS', label: 'Does not equal' },
  { value: 'CONTAINS', label: 'Contains' },
  { value: 'NOT_CONTAINS', label: 'Does not contain' },
  { value: 'GREATER_THAN', label: 'Greater than' },
  { value: 'LESS_THAN', label: 'Less than' },
  { value: 'GREATER_THAN_OR_EQUAL', label: 'Greater than or equal' },
  { value: 'LESS_THAN_OR_EQUAL', label: 'Less than or equal' },
  { value: 'IN_LIST', label: 'Is one of' },
  { value: 'NOT_IN_LIST', label: 'Is not one of' },
] as const;

export interface ScreeningQuestion {
  id: string;
  questionText: string;
  questionType: string;
  order: number;
  isRequired: boolean;
  config: Record<string, unknown>;
  helpText?: string;
  placeholder?: string;
  rules: ScreeningRule[];
}

export interface ScreeningRule {
  id: string;
  ruleType: 'KNOCKOUT' | 'SCORE';
  operator: string;
  value: unknown;
  scoreValue?: number;
  message?: string;
  priority: number;
}

interface ScreeningFormBuilderProps {
  questions: ScreeningQuestion[];
  onChange: (questions: ScreeningQuestion[]) => void;
  passingThreshold?: number;
  shortlistThreshold?: number;
  onThresholdsChange?: (passing: number | undefined, shortlist: number | undefined) => void;
}

function generateId(): string {
  return `q_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export default function ScreeningFormBuilder({
  questions,
  onChange,
  passingThreshold,
  shortlistThreshold,
  onThresholdsChange,
}: ScreeningFormBuilderProps) {
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [showRulesFor, setShowRulesFor] = useState<string | null>(null);

  const addQuestion = (type: string) => {
    const newQuestion: ScreeningQuestion = {
      id: generateId(),
      questionText: '',
      questionType: type,
      order: questions.length,
      isRequired: false,
      config: getDefaultConfig(type),
      rules: [],
    };
    onChange([...questions, newQuestion]);
    setExpandedQuestion(newQuestion.id);
  };

  const updateQuestion = (id: string, updates: Partial<ScreeningQuestion>) => {
    onChange(
      questions.map(q => (q.id === id ? { ...q, ...updates } : q))
    );
  };

  const deleteQuestion = (id: string) => {
    onChange(questions.filter(q => q.id !== id).map((q, i) => ({ ...q, order: i })));
    if (expandedQuestion === id) setExpandedQuestion(null);
  };

  const moveQuestion = (id: string, direction: 'up' | 'down') => {
    const index = questions.findIndex(q => q.id === id);
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === questions.length - 1)
    ) {
      return;
    }
    const newQuestions = [...questions];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    [newQuestions[index], newQuestions[swapIndex]] = [newQuestions[swapIndex], newQuestions[index]];
    onChange(newQuestions.map((q, i) => ({ ...q, order: i })));
  };

  const addRule = (questionId: string, ruleType: 'KNOCKOUT' | 'SCORE') => {
    const question = questions.find(q => q.id === questionId);
    if (!question) return;

    const newRule: ScreeningRule = {
      id: generateId(),
      ruleType,
      operator: 'EQUALS',
      value: '',
      scoreValue: ruleType === 'SCORE' ? 10 : undefined,
      message: ruleType === 'KNOCKOUT' ? 'Does not meet requirements' : undefined,
      priority: question.rules.length,
    };

    updateQuestion(questionId, { rules: [...question.rules, newRule] });
  };

  const updateRule = (questionId: string, ruleId: string, updates: Partial<ScreeningRule>) => {
    const question = questions.find(q => q.id === questionId);
    if (!question) return;

    updateQuestion(questionId, {
      rules: question.rules.map(r => (r.id === ruleId ? { ...r, ...updates } : r)),
    });
  };

  const deleteRule = (questionId: string, ruleId: string) => {
    const question = questions.find(q => q.id === questionId);
    if (!question) return;

    updateQuestion(questionId, {
      rules: question.rules.filter(r => r.id !== ruleId),
    });
  };

  const getDefaultConfig = (type: string): Record<string, unknown> => {
    switch (type) {
      case 'SINGLE_SELECT':
      case 'MULTI_SELECT':
        return { choices: ['Option 1', 'Option 2'] };
      case 'SHORT_TEXT':
        return { maxLength: 200 };
      case 'LONG_TEXT':
        return { maxLength: 2000 };
      case 'NUMBER':
        return { min: 0 };
      case 'SALARY_EXPECTATION':
        return { currency: 'PHP', periods: ['monthly', 'yearly'] };
      case 'URL_LIST':
        return { maxUrls: 5 };
      case 'FILE_UPLOAD':
        return { maxFiles: 1, acceptedTypes: ['.pdf', '.doc', '.docx'] };
      default:
        return {};
    }
  };

  return (
    <div className="space-y-6">
      {/* Thresholds */}
      {onThresholdsChange && (
        <div className="bg-slate-50 rounded-lg p-4">
          <h4 className="font-medium text-slate-900 mb-3">Scoring Thresholds</h4>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-600 mb-1">
                Passing Score (auto-advance)
              </label>
              <input
                type="number"
                min="0"
                value={passingThreshold ?? ''}
                onChange={(e) =>
                  onThresholdsChange(
                    e.target.value ? parseInt(e.target.value) : undefined,
                    shortlistThreshold
                  )
                }
                placeholder="e.g., 50"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">
                Shortlist Score (priority review)
              </label>
              <input
                type="number"
                min="0"
                value={shortlistThreshold ?? ''}
                onChange={(e) =>
                  onThresholdsChange(
                    passingThreshold,
                    e.target.value ? parseInt(e.target.value) : undefined
                  )
                }
                placeholder="e.g., 80"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* Questions List */}
      <div className="space-y-3">
        {questions.map((question, index) => (
          <div
            key={question.id}
            className="bg-white border border-slate-200 rounded-lg overflow-hidden"
          >
            {/* Question Header */}
            <div
              className="flex items-center gap-3 px-4 py-3 bg-slate-50 cursor-pointer"
              onClick={() => setExpandedQuestion(expandedQuestion === question.id ? null : question.id)}
            >
              <span className="text-lg">
                {QUESTION_TYPES.find(t => t.value === question.questionType)?.icon || '?'}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900 truncate">
                  {question.questionText || `Question ${index + 1}`}
                </p>
                <p className="text-xs text-slate-500">
                  {QUESTION_TYPES.find(t => t.value === question.questionType)?.label}
                  {question.isRequired && ' • Required'}
                  {question.rules.length > 0 && ` • ${question.rules.length} rule(s)`}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => { e.stopPropagation(); moveQuestion(question.id, 'up'); }}
                  disabled={index === 0}
                  className="p-1.5 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); moveQuestion(question.id, 'down'); }}
                  disabled={index === questions.length - 1}
                  className="p-1.5 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteQuestion(question.id); }}
                  className="p-1.5 text-slate-400 hover:text-red-500"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
                <svg
                  className={`w-5 h-5 text-slate-400 transition-transform ${expandedQuestion === question.id ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Question Editor */}
            {expandedQuestion === question.id && (
              <div className="p-4 space-y-4 border-t border-slate-100">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Question Text *
                  </label>
                  <input
                    type="text"
                    value={question.questionText}
                    onChange={(e) => updateQuestion(question.id, { questionText: e.target.value })}
                    placeholder="Enter your question..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Help Text
                    </label>
                    <input
                      type="text"
                      value={question.helpText || ''}
                      onChange={(e) => updateQuestion(question.id, { helpText: e.target.value })}
                      placeholder="Additional instructions..."
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    />
                  </div>
                  <div className="flex items-center">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={question.isRequired}
                        onChange={(e) => updateQuestion(question.id, { isRequired: e.target.checked })}
                        className="w-4 h-4 rounded border-slate-300 text-primary-600"
                      />
                      <span className="text-sm text-slate-700">Required question</span>
                    </label>
                  </div>
                </div>

                {/* Type-specific config */}
                <QuestionConfigEditor
                  question={question}
                  onUpdate={(config) => updateQuestion(question.id, { config })}
                />

                {/* Rules Section */}
                <div className="pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="text-sm font-medium text-slate-900">Screening Rules</h5>
                    <div className="flex gap-2">
                      <button
                        onClick={() => addRule(question.id, 'KNOCKOUT')}
                        className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100"
                      >
                        + Knockout Rule
                      </button>
                      <button
                        onClick={() => addRule(question.id, 'SCORE')}
                        className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                      >
                        + Scoring Rule
                      </button>
                    </div>
                  </div>

                  {question.rules.length === 0 ? (
                    <p className="text-sm text-slate-500 italic">
                      No rules configured. Add rules to auto-evaluate responses.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {question.rules.map((rule) => (
                        <RuleEditor
                          key={rule.id}
                          rule={rule}
                          questionType={question.questionType}
                          questionConfig={question.config}
                          onUpdate={(updates) => updateRule(question.id, rule.id, updates)}
                          onDelete={() => deleteRule(question.id, rule.id)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Question */}
      <div className="bg-slate-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-slate-700 mb-3">Add Question</h4>
        <div className="flex flex-wrap gap-2">
          {QUESTION_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => addQuestion(type.value)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 hover:border-primary-300 hover:bg-primary-50 transition-colors"
            >
              <span>{type.icon}</span>
              {type.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Question Config Editor Component
function QuestionConfigEditor({
  question,
  onUpdate,
}: {
  question: ScreeningQuestion;
  onUpdate: (config: Record<string, unknown>) => void;
}) {
  const config = question.config;

  switch (question.questionType) {
    case 'SINGLE_SELECT':
    case 'MULTI_SELECT':
      return (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Options
          </label>
          {((config.choices as string[]) || []).map((choice, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={choice}
                onChange={(e) => {
                  const newChoices = [...(config.choices as string[])];
                  newChoices[index] = e.target.value;
                  onUpdate({ ...config, choices: newChoices });
                }}
                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                placeholder={`Option ${index + 1}`}
              />
              <button
                onClick={() => {
                  const newChoices = (config.choices as string[]).filter((_, i) => i !== index);
                  onUpdate({ ...config, choices: newChoices });
                }}
                className="p-2 text-slate-400 hover:text-red-500"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
          <button
            onClick={() => {
              const newChoices = [...((config.choices as string[]) || []), ''];
              onUpdate({ ...config, choices: newChoices });
            }}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            + Add Option
          </button>
        </div>
      );

    case 'NUMBER':
    case 'YEARS_OF_EXPERIENCE':
      return (
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Minimum</label>
            <input
              type="number"
              value={(config.min as number) ?? ''}
              onChange={(e) => onUpdate({ ...config, min: e.target.value ? parseInt(e.target.value) : undefined })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Maximum</label>
            <input
              type="number"
              value={(config.max as number) ?? ''}
              onChange={(e) => onUpdate({ ...config, max: e.target.value ? parseInt(e.target.value) : undefined })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
            />
          </div>
        </div>
      );

    case 'SALARY_EXPECTATION':
      return (
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Min Salary</label>
            <input
              type="number"
              value={(config.minAmount as number) ?? ''}
              onChange={(e) => onUpdate({ ...config, minAmount: e.target.value ? parseInt(e.target.value) : undefined })}
              placeholder="e.g., 30000"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Max Salary</label>
            <input
              type="number"
              value={(config.maxAmount as number) ?? ''}
              onChange={(e) => onUpdate({ ...config, maxAmount: e.target.value ? parseInt(e.target.value) : undefined })}
              placeholder="e.g., 100000"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
            />
          </div>
        </div>
      );

    case 'URL_LIST':
      return (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Max URLs</label>
          <input
            type="number"
            min="1"
            max="10"
            value={(config.maxUrls as number) ?? 5}
            onChange={(e) => onUpdate({ ...config, maxUrls: parseInt(e.target.value) })}
            className="w-24 px-3 py-2 border border-slate-200 rounded-lg text-sm"
          />
        </div>
      );

    default:
      return null;
  }
}

// Rule Editor Component
function RuleEditor({
  rule,
  questionType,
  questionConfig,
  onUpdate,
  onDelete,
}: {
  rule: ScreeningRule;
  questionType: string;
  questionConfig: Record<string, unknown>;
  onUpdate: (updates: Partial<ScreeningRule>) => void;
  onDelete: () => void;
}) {
  const getValueInput = () => {
    // For YES_NO questions
    if (questionType === 'YES_NO') {
      return (
        <select
          value={rule.value as string}
          onChange={(e) => onUpdate({ value: e.target.value === 'true' })}
          className="px-3 py-1.5 border border-slate-200 rounded text-sm"
        >
          <option value="">Select...</option>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      );
    }

    // For SINGLE_SELECT or MULTI_SELECT
    if (questionType === 'SINGLE_SELECT' || questionType === 'MULTI_SELECT') {
      const choices = (questionConfig.choices as string[]) || [];
      return (
        <select
          value={rule.value as string}
          onChange={(e) => onUpdate({ value: e.target.value })}
          className="px-3 py-1.5 border border-slate-200 rounded text-sm"
        >
          <option value="">Select...</option>
          {choices.map((choice) => (
            <option key={choice} value={choice}>{choice}</option>
          ))}
        </select>
      );
    }

    // For NUMBER, YEARS_OF_EXPERIENCE, SALARY_EXPECTATION
    if (['NUMBER', 'YEARS_OF_EXPERIENCE', 'SALARY_EXPECTATION'].includes(questionType)) {
      return (
        <input
          type="number"
          value={rule.value as number ?? ''}
          onChange={(e) => onUpdate({ value: e.target.value ? parseInt(e.target.value) : '' })}
          placeholder="Value"
          className="w-24 px-3 py-1.5 border border-slate-200 rounded text-sm"
        />
      );
    }

    // Default text input
    return (
      <input
        type="text"
        value={rule.value as string ?? ''}
        onChange={(e) => onUpdate({ value: e.target.value })}
        placeholder="Value"
        className="px-3 py-1.5 border border-slate-200 rounded text-sm"
      />
    );
  };

  return (
    <div className={`flex items-center gap-2 p-2 rounded-lg ${rule.ruleType === 'KNOCKOUT' ? 'bg-red-50' : 'bg-blue-50'}`}>
      <span className={`text-xs font-medium px-2 py-0.5 rounded ${rule.ruleType === 'KNOCKOUT' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
        {rule.ruleType === 'KNOCKOUT' ? 'Reject if' : 'Score if'}
      </span>

      <select
        value={rule.operator}
        onChange={(e) => onUpdate({ operator: e.target.value })}
        className="px-2 py-1.5 border border-slate-200 rounded text-sm bg-white"
      >
        {RULE_OPERATORS.map((op) => (
          <option key={op.value} value={op.value}>{op.label}</option>
        ))}
      </select>

      {getValueInput()}

      {rule.ruleType === 'SCORE' && (
        <div className="flex items-center gap-1">
          <span className="text-xs text-slate-500">+</span>
          <input
            type="number"
            value={rule.scoreValue ?? ''}
            onChange={(e) => onUpdate({ scoreValue: e.target.value ? parseInt(e.target.value) : undefined })}
            placeholder="pts"
            className="w-16 px-2 py-1.5 border border-slate-200 rounded text-sm"
          />
        </div>
      )}

      {rule.ruleType === 'KNOCKOUT' && (
        <input
          type="text"
          value={rule.message ?? ''}
          onChange={(e) => onUpdate({ message: e.target.value })}
          placeholder="Rejection reason"
          className="flex-1 px-2 py-1.5 border border-slate-200 rounded text-sm"
        />
      )}

      <button onClick={onDelete} className="p-1 text-slate-400 hover:text-red-500">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
