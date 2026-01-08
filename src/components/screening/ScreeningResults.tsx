'use client';

interface ScreeningAnswer {
  id: string;
  questionId: string;
  answer: unknown;
  question: {
    questionText: string;
    questionType: string;
  };
}

interface ScreeningResultsProps {
  score?: number | null;
  hasKnockout: boolean;
  knockoutReason?: string | null;
  answers: ScreeningAnswer[];
  passingThreshold?: number | null;
  shortlistThreshold?: number | null;
}

export default function ScreeningResults({
  score,
  hasKnockout,
  knockoutReason,
  answers,
  passingThreshold,
  shortlistThreshold,
}: ScreeningResultsProps) {
  const getScoreStatus = () => {
    if (hasKnockout) return 'rejected';
    if (score === null || score === undefined) return 'pending';
    if (shortlistThreshold && score >= shortlistThreshold) return 'shortlist';
    if (passingThreshold && score >= passingThreshold) return 'passing';
    return 'below';
  };

  const status = getScoreStatus();

  const statusConfig = {
    rejected: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-700',
      icon: (
        <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
      label: 'Rejected (Knockout)',
    },
    shortlist: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-700',
      icon: (
        <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      label: 'Shortlisted',
    },
    passing: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-700',
      icon: (
        <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
      label: 'Qualified',
    },
    below: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-700',
      icon: (
        <svg className="w-5 h-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      label: 'Below Threshold',
    },
    pending: {
      bg: 'bg-slate-50',
      border: 'border-slate-200',
      text: 'text-slate-600',
      icon: (
        <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      label: 'No Score',
    },
  };

  const config = statusConfig[status];

  const formatAnswer = (answer: unknown, questionType: string): string => {
    if (answer === null || answer === undefined) return '-';

    switch (questionType) {
      case 'YES_NO':
        return answer === true ? 'Yes' : answer === false ? 'No' : String(answer);

      case 'MULTI_SELECT':
        return Array.isArray(answer) ? answer.join(', ') : String(answer);

      case 'SALARY_EXPECTATION': {
        const salary = answer as { amount?: number; currency?: string; period?: string };
        if (!salary.amount) return '-';
        return `₱${salary.amount.toLocaleString()} ${salary.period || 'monthly'}`;
      }

      case 'AVAILABILITY': {
        const avail = answer as { type?: string; date?: string };
        if (avail.type === 'Specific date' && avail.date) {
          return `${avail.type}: ${new Date(avail.date).toLocaleDateString()}`;
        }
        return avail.type || '-';
      }

      case 'WORK_AUTHORIZATION': {
        const auth = answer as { authorized?: boolean; requiresSponsorship?: boolean };
        const parts = [];
        if (auth.authorized !== undefined) {
          parts.push(auth.authorized ? 'Authorized to work' : 'Not authorized');
        }
        if (auth.requiresSponsorship !== undefined) {
          parts.push(auth.requiresSponsorship ? 'Needs sponsorship' : 'No sponsorship needed');
        }
        return parts.join(', ') || '-';
      }

      case 'URL_LIST':
        return Array.isArray(answer) ? answer.filter(Boolean).join('\n') : String(answer);

      default:
        return String(answer);
    }
  };

  return (
    <div className="space-y-4">
      {/* Score Summary */}
      <div className={`${config.bg} ${config.border} border rounded-lg p-4`}>
        <div className="flex items-center gap-3">
          {config.icon}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className={`font-semibold ${config.text}`}>{config.label}</span>
              {score !== null && score !== undefined && (
                <span className={`text-sm ${config.text}`}>
                  Score: {score} pts
                </span>
              )}
            </div>
            {hasKnockout && knockoutReason && (
              <p className="text-sm text-red-600 mt-1">{knockoutReason}</p>
            )}
            {!hasKnockout && (passingThreshold || shortlistThreshold) && (
              <p className="text-xs text-slate-500 mt-1">
                {passingThreshold && `Passing: ${passingThreshold} pts`}
                {passingThreshold && shortlistThreshold && ' • '}
                {shortlistThreshold && `Shortlist: ${shortlistThreshold} pts`}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Answers */}
      {answers.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-slate-700">Screening Answers</h4>
          <div className="space-y-3">
            {answers.map((answer) => (
              <div key={answer.id} className="bg-slate-50 rounded-lg p-3">
                <p className="text-sm font-medium text-slate-700 mb-1">
                  {answer.question.questionText}
                </p>
                <p className="text-sm text-slate-600 whitespace-pre-wrap">
                  {formatAnswer(answer.answer, answer.question.questionType)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
