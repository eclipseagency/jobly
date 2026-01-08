/**
 * Rules engine for evaluating screening knockout and scoring rules
 */

import {
  RuleOperator,
  RuleType,
  AnswerValue,
  ScreeningRule,
  ScreeningQuestion,
  ScreeningForm,
  AnswerSubmission,
  RuleEvaluationResult,
  AnswerEvaluationResult,
  ScreeningResult,
  SalaryAnswer,
  AvailabilityAnswer,
  WorkAuthorizationAnswer,
} from './types';
import { validateAllAnswers } from './validators';

/**
 * Extract a comparable value from complex answer types
 */
function extractComparableValue(answer: AnswerValue, questionType: string): unknown {
  if (answer === null || answer === undefined) {
    return null;
  }

  // For complex types, extract the primary comparable value
  switch (questionType) {
    case 'SALARY_EXPECTATION':
      return (answer as SalaryAnswer).amount;
    case 'YEARS_OF_EXPERIENCE':
      return answer as number;
    case 'AVAILABILITY':
      const avail = answer as AvailabilityAnswer;
      if (avail.isImmediate) return 0;
      return avail.noticePeriodDays ?? 999;
    case 'WORK_AUTHORIZATION':
      return (answer as WorkAuthorizationAnswer).authorized;
    case 'YES_NO':
      return answer as boolean;
    default:
      return answer;
  }
}

/**
 * Check if an answer is empty
 */
function isAnswerEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string' && value.trim() === '') return true;
  if (Array.isArray(value) && value.length === 0) return true;
  return false;
}

/**
 * Compare two values with the given operator
 */
function compareValues(
  answer: unknown,
  ruleValue: unknown,
  operator: RuleOperator
): boolean {
  switch (operator) {
    case 'EQUALS':
      return answer === ruleValue;

    case 'NOT_EQUALS':
      return answer !== ruleValue;

    case 'CONTAINS':
      if (typeof answer === 'string' && typeof ruleValue === 'string') {
        return answer.toLowerCase().includes(ruleValue.toLowerCase());
      }
      if (Array.isArray(answer)) {
        return answer.includes(ruleValue);
      }
      return false;

    case 'NOT_CONTAINS':
      if (typeof answer === 'string' && typeof ruleValue === 'string') {
        return !answer.toLowerCase().includes(ruleValue.toLowerCase());
      }
      if (Array.isArray(answer)) {
        return !answer.includes(ruleValue);
      }
      return true;

    case 'GREATER_THAN':
      if (typeof answer === 'number' && typeof ruleValue === 'number') {
        return answer > ruleValue;
      }
      if (typeof answer === 'string' && typeof ruleValue === 'string') {
        return answer > ruleValue;
      }
      return false;

    case 'LESS_THAN':
      if (typeof answer === 'number' && typeof ruleValue === 'number') {
        return answer < ruleValue;
      }
      if (typeof answer === 'string' && typeof ruleValue === 'string') {
        return answer < ruleValue;
      }
      return false;

    case 'GREATER_THAN_OR_EQUAL':
      if (typeof answer === 'number' && typeof ruleValue === 'number') {
        return answer >= ruleValue;
      }
      if (typeof answer === 'string' && typeof ruleValue === 'string') {
        return answer >= ruleValue;
      }
      return false;

    case 'LESS_THAN_OR_EQUAL':
      if (typeof answer === 'number' && typeof ruleValue === 'number') {
        return answer <= ruleValue;
      }
      if (typeof answer === 'string' && typeof ruleValue === 'string') {
        return answer <= ruleValue;
      }
      return false;

    case 'IN_LIST':
      if (Array.isArray(ruleValue)) {
        if (Array.isArray(answer)) {
          // Check if any answer value is in the rule list
          return answer.some(a => ruleValue.includes(a));
        }
        return ruleValue.includes(answer);
      }
      return false;

    case 'NOT_IN_LIST':
      if (Array.isArray(ruleValue)) {
        if (Array.isArray(answer)) {
          // Check if no answer value is in the rule list
          return !answer.some(a => ruleValue.includes(a));
        }
        return !ruleValue.includes(answer);
      }
      return true;

    case 'IS_EMPTY':
      return isAnswerEmpty(answer);

    case 'IS_NOT_EMPTY':
      return !isAnswerEmpty(answer);

    default:
      return false;
  }
}

/**
 * Evaluate a single rule against an answer
 */
export function evaluateRule(
  rule: ScreeningRule,
  answer: AnswerValue,
  questionType: string
): RuleEvaluationResult {
  if (!rule.isActive) {
    return {
      questionId: '', // Will be set by caller
      ruleId: rule.id,
      triggered: false,
      ruleType: rule.ruleType,
    };
  }

  const comparableAnswer = extractComparableValue(answer, questionType);
  const triggered = compareValues(comparableAnswer, rule.value, rule.operator);

  return {
    questionId: '', // Will be set by caller
    ruleId: rule.id,
    triggered,
    ruleType: rule.ruleType,
    scoreValue: triggered && rule.ruleType === 'SCORE' ? rule.scoreValue : undefined,
    message: triggered && rule.ruleType === 'KNOCKOUT' ? rule.message : undefined,
  };
}

/**
 * Evaluate all rules for a single question/answer pair
 */
export function evaluateAnswerRules(
  question: ScreeningQuestion,
  answer: AnswerValue
): AnswerEvaluationResult {
  // Sort rules by priority (lower = first)
  const sortedRules = [...question.rules].sort((a, b) => a.priority - b.priority);

  let isKnockout = false;
  let knockoutMessage: string | undefined;
  let scoreEarned = 0;
  const triggeredRules: RuleEvaluationResult[] = [];

  for (const rule of sortedRules) {
    const result = evaluateRule(rule, answer, question.questionType);
    result.questionId = question.id;

    if (result.triggered) {
      triggeredRules.push(result);

      if (rule.ruleType === 'KNOCKOUT') {
        isKnockout = true;
        knockoutMessage = rule.message || `Disqualified based on: ${question.questionText}`;
        // Don't break - continue to calculate score for reporting
      }

      if (rule.ruleType === 'SCORE' && rule.scoreValue) {
        scoreEarned += rule.scoreValue;
      }
    }
  }

  return {
    questionId: question.id,
    isKnockout,
    scoreEarned,
    knockoutMessage,
    triggeredRules,
  };
}

/**
 * Determine the recommended status based on screening results
 */
function determineStatus(
  hasKnockout: boolean,
  totalScore: number,
  shortlistThreshold?: number,
  passingThreshold?: number
): 'rejected' | 'new' | 'shortlisted' {
  if (hasKnockout) {
    return 'rejected';
  }

  if (shortlistThreshold !== undefined && totalScore >= shortlistThreshold) {
    return 'shortlisted';
  }

  // If there's a passing threshold and score is below it, could reject
  // But typically we just mark as 'new' for manual review
  if (passingThreshold !== undefined && totalScore < passingThreshold) {
    return 'new'; // Still allow but mark for review
  }

  return 'new';
}

/**
 * Process a complete application through the screening form
 */
export function processScreeningApplication(
  form: ScreeningForm,
  answers: AnswerSubmission[]
): ScreeningResult {
  // First, validate all answers
  const validationResult = validateAllAnswers(form.questions, answers);

  if (!validationResult.isValid) {
    return {
      isValid: false,
      validationErrors: validationResult.errors,
      totalScore: 0,
      hasKnockout: false,
      recommendedStatus: 'new',
      answerResults: [],
    };
  }

  // Create answer map for quick lookup
  const answerMap = new Map(answers.map(a => [a.questionId, a.answer]));

  // Evaluate rules for each question
  let totalScore = 0;
  let hasKnockout = false;
  let knockoutReason: string | undefined;
  const answerResults: AnswerEvaluationResult[] = [];

  for (const question of form.questions) {
    const answer = answerMap.get(question.id) ?? null;
    const result = evaluateAnswerRules(question, answer);

    answerResults.push(result);
    totalScore += result.scoreEarned;

    if (result.isKnockout && !hasKnockout) {
      hasKnockout = true;
      knockoutReason = result.knockoutMessage;
    }
  }

  // Determine recommended status
  const recommendedStatus = determineStatus(
    hasKnockout,
    totalScore,
    form.shortlistThreshold ?? undefined,
    form.passingThreshold ?? undefined
  );

  return {
    isValid: true,
    validationErrors: [],
    totalScore,
    hasKnockout,
    knockoutReason,
    recommendedStatus,
    answerResults,
  };
}

/**
 * Get a summary of the screening result for display
 */
export function getScreeningSummary(result: ScreeningResult): {
  status: string;
  score: number;
  knockedOut: boolean;
  reason?: string;
  passedQuestions: number;
  totalQuestions: number;
} {
  const passedQuestions = result.answerResults.filter(r => !r.isKnockout).length;

  return {
    status: result.recommendedStatus,
    score: result.totalScore,
    knockedOut: result.hasKnockout,
    reason: result.knockoutReason,
    passedQuestions,
    totalQuestions: result.answerResults.length,
  };
}
