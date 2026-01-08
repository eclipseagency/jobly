'use client';

import { useState, useEffect } from 'react';

interface ScreeningQuestion {
  id: string;
  questionText: string;
  questionType: string;
  isRequired: boolean;
  config: Record<string, unknown>;
  helpText?: string;
  placeholder?: string;
}

interface ScreeningFormData {
  id: string;
  title?: string;
  description?: string;
  questions: ScreeningQuestion[];
}

interface ApplicantScreeningFormProps {
  jobId: string;
  onSubmit: (answers: { questionId: string; answer: unknown }[]) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

export default function ApplicantScreeningForm({
  jobId,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: ApplicantScreeningFormProps) {
  const [form, setForm] = useState<ScreeningFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchScreeningForm();
  }, [jobId]);

  const fetchScreeningForm = async () => {
    try {
      const response = await fetch(`/api/jobs/${jobId}/screening-form`);
      if (!response.ok) {
        if (response.status === 404) {
          setForm(null);
          setLoading(false);
          return;
        }
        throw new Error('Failed to load screening form');
      }
      const data = await response.json();
      setForm(data.form);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const updateAnswer = (questionId: string, value: unknown) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    // Clear validation error when user updates answer
    if (validationErrors[questionId]) {
      setValidationErrors(prev => {
        const next = { ...prev };
        delete next[questionId];
        return next;
      });
    }
  };

  const validateAnswers = (): boolean => {
    if (!form) return true;

    const errors: Record<string, string> = {};

    for (const question of form.questions) {
      const answer = answers[question.id];

      if (question.isRequired) {
        if (answer === undefined || answer === null || answer === '') {
          errors[question.id] = 'This field is required';
          continue;
        }
        if (Array.isArray(answer) && answer.length === 0) {
          errors[question.id] = 'Please select at least one option';
          continue;
        }
      }

      // Type-specific validation
      if (answer !== undefined && answer !== null && answer !== '') {
        const validationError = validateQuestionAnswer(question, answer);
        if (validationError) {
          errors[question.id] = validationError;
        }
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateQuestionAnswer = (question: ScreeningQuestion, answer: unknown): string | null => {
    const config = question.config;

    switch (question.questionType) {
      case 'NUMBER':
      case 'YEARS_OF_EXPERIENCE': {
        const num = typeof answer === 'number' ? answer : parseInt(answer as string);
        if (isNaN(num)) return 'Please enter a valid number';
        if (config.min !== undefined && num < (config.min as number)) {
          return `Minimum value is ${config.min}`;
        }
        if (config.max !== undefined && num > (config.max as number)) {
          return `Maximum value is ${config.max}`;
        }
        break;
      }

      case 'SALARY_EXPECTATION': {
        const salary = answer as { amount?: number; currency?: string; period?: string };
        if (!salary.amount || salary.amount <= 0) {
          return 'Please enter a valid salary amount';
        }
        if (config.minAmount !== undefined && salary.amount < (config.minAmount as number)) {
          return `Minimum salary is ${config.minAmount}`;
        }
        if (config.maxAmount !== undefined && salary.amount > (config.maxAmount as number)) {
          return `Maximum salary is ${config.maxAmount}`;
        }
        break;
      }

      case 'URL_LIST': {
        const urls = answer as string[];
        const maxUrls = (config.maxUrls as number) || 5;
        if (urls.length > maxUrls) {
          return `Maximum ${maxUrls} URLs allowed`;
        }
        for (const url of urls) {
          if (url && !/^https?:\/\/.+/i.test(url)) {
            return `Invalid URL: ${url}`;
          }
        }
        break;
      }
    }

    return null;
  };

  const handleSubmit = () => {
    if (!validateAnswers()) {
      return;
    }

    const formattedAnswers = Object.entries(answers)
      .filter(([_, value]) => value !== undefined && value !== null && value !== '')
      .map(([questionId, answer]) => ({
        questionId,
        answer,
      }));

    onSubmit(formattedAnswers);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
        <button onClick={fetchScreeningForm} className="text-primary-600 hover:underline mt-2">
          Try again
        </button>
      </div>
    );
  }

  if (!form || form.questions.length === 0) {
    // No screening form - allow direct submission
    return null;
  }

  return (
    <div className="space-y-6">
      {form.title && (
        <div className="border-b border-slate-200 pb-4">
          <h3 className="text-lg font-semibold text-slate-900">{form.title}</h3>
          {form.description && (
            <p className="text-sm text-slate-600 mt-1">{form.description}</p>
          )}
        </div>
      )}

      <div className="space-y-6">
        {form.questions.map((question) => (
          <QuestionRenderer
            key={question.id}
            question={question}
            value={answers[question.id]}
            onChange={(value) => updateAnswer(question.id, value)}
            error={validationErrors[question.id]}
          />
        ))}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
        {onCancel && (
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Application'}
        </button>
      </div>
    </div>
  );
}

// Question Renderer Component
function QuestionRenderer({
  question,
  value,
  onChange,
  error,
}: {
  question: ScreeningQuestion;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string;
}) {
  const renderInput = () => {
    switch (question.questionType) {
      case 'YES_NO':
        return (
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name={question.id}
                checked={value === true}
                onChange={() => onChange(true)}
                className="w-4 h-4 text-primary-600"
              />
              <span>Yes</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name={question.id}
                checked={value === false}
                onChange={() => onChange(false)}
                className="w-4 h-4 text-primary-600"
              />
              <span>No</span>
            </label>
          </div>
        );

      case 'SINGLE_SELECT': {
        const choices = (question.config.choices as string[]) || [];
        return (
          <div className="space-y-2">
            {choices.map((choice) => (
              <label key={choice} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name={question.id}
                  checked={value === choice}
                  onChange={() => onChange(choice)}
                  className="w-4 h-4 text-primary-600"
                />
                <span>{choice}</span>
              </label>
            ))}
          </div>
        );
      }

      case 'MULTI_SELECT': {
        const choices = (question.config.choices as string[]) || [];
        const selected = (value as string[]) || [];
        return (
          <div className="space-y-2">
            {choices.map((choice) => (
              <label key={choice} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selected.includes(choice)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      onChange([...selected, choice]);
                    } else {
                      onChange(selected.filter(s => s !== choice));
                    }
                  }}
                  className="w-4 h-4 rounded text-primary-600"
                />
                <span>{choice}</span>
              </label>
            ))}
          </div>
        );
      }

      case 'SHORT_TEXT':
        return (
          <input
            type="text"
            value={(value as string) || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder || 'Enter your answer...'}
            maxLength={(question.config.maxLength as number) || 200}
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        );

      case 'LONG_TEXT':
        return (
          <textarea
            value={(value as string) || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder || 'Enter your answer...'}
            maxLength={(question.config.maxLength as number) || 2000}
            rows={4}
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
          />
        );

      case 'NUMBER':
      case 'YEARS_OF_EXPERIENCE':
        return (
          <input
            type="number"
            value={(value as number) ?? ''}
            onChange={(e) => onChange(e.target.value ? parseInt(e.target.value) : '')}
            placeholder={question.placeholder || 'Enter a number...'}
            min={(question.config.min as number) ?? undefined}
            max={(question.config.max as number) ?? undefined}
            className="w-full max-w-xs px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        );

      case 'DATE':
        return (
          <input
            type="date"
            value={(value as string) || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full max-w-xs px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        );

      case 'SALARY_EXPECTATION': {
        const salary = (value as { amount?: number; currency?: string; period?: string }) || { currency: 'PHP', period: 'monthly' };
        return (
          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">₱</span>
              <input
                type="number"
                value={salary.amount ?? ''}
                onChange={(e) => onChange({ ...salary, amount: e.target.value ? parseInt(e.target.value) : undefined })}
                placeholder="Amount"
                className="w-40 pl-7 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <select
              value={salary.period || 'monthly'}
              onChange={(e) => onChange({ ...salary, period: e.target.value })}
              className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="hourly">per hour</option>
              <option value="daily">per day</option>
              <option value="weekly">per week</option>
              <option value="monthly">per month</option>
              <option value="yearly">per year</option>
            </select>
          </div>
        );
      }

      case 'AVAILABILITY': {
        const availability = (value as { type?: string; date?: string }) || {};
        return (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-3">
              {['Immediately', '2 weeks', '1 month', 'Specific date'].map((option) => (
                <label key={option} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name={`${question.id}-type`}
                    checked={availability.type === option}
                    onChange={() => onChange({ ...availability, type: option, date: option === 'Specific date' ? availability.date : undefined })}
                    className="w-4 h-4 text-primary-600"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
            {availability.type === 'Specific date' && (
              <input
                type="date"
                value={availability.date || ''}
                onChange={(e) => onChange({ ...availability, date: e.target.value })}
                className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            )}
          </div>
        );
      }

      case 'WORK_AUTHORIZATION': {
        const auth = (value as { authorized?: boolean; visaType?: string; requiresSponsorship?: boolean }) || {};
        return (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-700 mb-2">Are you authorized to work in the Philippines?</p>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name={`${question.id}-authorized`}
                    checked={auth.authorized === true}
                    onChange={() => onChange({ ...auth, authorized: true })}
                    className="w-4 h-4 text-primary-600"
                  />
                  <span>Yes</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name={`${question.id}-authorized`}
                    checked={auth.authorized === false}
                    onChange={() => onChange({ ...auth, authorized: false })}
                    className="w-4 h-4 text-primary-600"
                  />
                  <span>No</span>
                </label>
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-700 mb-2">Do you require visa sponsorship?</p>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name={`${question.id}-sponsorship`}
                    checked={auth.requiresSponsorship === true}
                    onChange={() => onChange({ ...auth, requiresSponsorship: true })}
                    className="w-4 h-4 text-primary-600"
                  />
                  <span>Yes</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name={`${question.id}-sponsorship`}
                    checked={auth.requiresSponsorship === false}
                    onChange={() => onChange({ ...auth, requiresSponsorship: false })}
                    className="w-4 h-4 text-primary-600"
                  />
                  <span>No</span>
                </label>
              </div>
            </div>
          </div>
        );
      }

      case 'URL_LIST': {
        const urls = (value as string[]) || [''];
        const maxUrls = (question.config.maxUrls as number) || 5;
        return (
          <div className="space-y-2">
            {urls.map((url, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => {
                    const newUrls = [...urls];
                    newUrls[index] = e.target.value;
                    onChange(newUrls);
                  }}
                  placeholder="https://..."
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {urls.length > 1 && (
                  <button
                    type="button"
                    onClick={() => onChange(urls.filter((_, i) => i !== index))}
                    className="p-2 text-slate-400 hover:text-red-500"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
            {urls.length < maxUrls && (
              <button
                type="button"
                onClick={() => onChange([...urls, ''])}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                + Add another URL
              </button>
            )}
          </div>
        );
      }

      case 'FILE_UPLOAD':
        return (
          <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center">
            <svg className="w-8 h-8 mx-auto text-slate-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm text-slate-600">File upload not yet implemented</p>
            <p className="text-xs text-slate-400 mt-1">Coming soon</p>
          </div>
        );

      default:
        return (
          <input
            type="text"
            value={(value as string) || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      <label className="block">
        <span className="text-sm font-medium text-slate-900">
          {question.questionText}
          {question.isRequired && <span className="text-red-500 ml-1">*</span>}
        </span>
        {question.helpText && (
          <span className="block text-xs text-slate-500 mt-0.5">{question.helpText}</span>
        )}
      </label>
      {renderInput()}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
