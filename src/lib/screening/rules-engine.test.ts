import { describe, it, expect } from 'vitest';
import {
  evaluateRule,
  evaluateAnswerRules,
  processScreeningApplication,
  getScreeningSummary,
} from './rules-engine';
import {
  ScreeningRule,
  ScreeningQuestion,
  ScreeningForm,
  AnswerSubmission,
} from './types';

describe('evaluateRule', () => {
  describe('EQUALS operator', () => {
    it('should trigger when values match (boolean)', () => {
      const rule: ScreeningRule = {
        id: 'r1',
        ruleType: 'KNOCKOUT',
        operator: 'EQUALS',
        value: false,
        priority: 0,
        isActive: true,
      };

      const result = evaluateRule(rule, false, 'YES_NO');
      expect(result.triggered).toBe(true);
    });

    it('should not trigger when values differ', () => {
      const rule: ScreeningRule = {
        id: 'r1',
        ruleType: 'KNOCKOUT',
        operator: 'EQUALS',
        value: false,
        priority: 0,
        isActive: true,
      };

      const result = evaluateRule(rule, true, 'YES_NO');
      expect(result.triggered).toBe(false);
    });

    it('should trigger when strings match', () => {
      const rule: ScreeningRule = {
        id: 'r1',
        ruleType: 'SCORE',
        operator: 'EQUALS',
        value: 'Option A',
        scoreValue: 10,
        priority: 0,
        isActive: true,
      };

      const result = evaluateRule(rule, 'Option A', 'SINGLE_SELECT');
      expect(result.triggered).toBe(true);
      expect(result.scoreValue).toBe(10);
    });
  });

  describe('NOT_EQUALS operator', () => {
    it('should trigger when values differ', () => {
      const rule: ScreeningRule = {
        id: 'r1',
        ruleType: 'KNOCKOUT',
        operator: 'NOT_EQUALS',
        value: true,
        priority: 0,
        isActive: true,
      };

      const result = evaluateRule(rule, false, 'YES_NO');
      expect(result.triggered).toBe(true);
    });

    it('should not trigger when values match', () => {
      const rule: ScreeningRule = {
        id: 'r1',
        ruleType: 'KNOCKOUT',
        operator: 'NOT_EQUALS',
        value: true,
        priority: 0,
        isActive: true,
      };

      const result = evaluateRule(rule, true, 'YES_NO');
      expect(result.triggered).toBe(false);
    });
  });

  describe('GREATER_THAN operator', () => {
    it('should trigger when answer is greater', () => {
      const rule: ScreeningRule = {
        id: 'r1',
        ruleType: 'SCORE',
        operator: 'GREATER_THAN',
        value: 5,
        scoreValue: 20,
        priority: 0,
        isActive: true,
      };

      const result = evaluateRule(rule, 10, 'YEARS_OF_EXPERIENCE');
      expect(result.triggered).toBe(true);
    });

    it('should not trigger when answer is equal', () => {
      const rule: ScreeningRule = {
        id: 'r1',
        ruleType: 'SCORE',
        operator: 'GREATER_THAN',
        value: 5,
        scoreValue: 20,
        priority: 0,
        isActive: true,
      };

      const result = evaluateRule(rule, 5, 'YEARS_OF_EXPERIENCE');
      expect(result.triggered).toBe(false);
    });

    it('should not trigger when answer is less', () => {
      const rule: ScreeningRule = {
        id: 'r1',
        ruleType: 'SCORE',
        operator: 'GREATER_THAN',
        value: 5,
        scoreValue: 20,
        priority: 0,
        isActive: true,
      };

      const result = evaluateRule(rule, 3, 'YEARS_OF_EXPERIENCE');
      expect(result.triggered).toBe(false);
    });
  });

  describe('LESS_THAN operator', () => {
    it('should trigger when answer is less', () => {
      const rule: ScreeningRule = {
        id: 'r1',
        ruleType: 'KNOCKOUT',
        operator: 'LESS_THAN',
        value: 2,
        message: 'Minimum 2 years required',
        priority: 0,
        isActive: true,
      };

      const result = evaluateRule(rule, 1, 'YEARS_OF_EXPERIENCE');
      expect(result.triggered).toBe(true);
      expect(result.message).toBe('Minimum 2 years required');
    });
  });

  describe('GREATER_THAN_OR_EQUAL operator', () => {
    it('should trigger when answer is equal', () => {
      const rule: ScreeningRule = {
        id: 'r1',
        ruleType: 'SCORE',
        operator: 'GREATER_THAN_OR_EQUAL',
        value: 5,
        scoreValue: 10,
        priority: 0,
        isActive: true,
      };

      const result = evaluateRule(rule, 5, 'NUMBER');
      expect(result.triggered).toBe(true);
    });

    it('should trigger when answer is greater', () => {
      const rule: ScreeningRule = {
        id: 'r1',
        ruleType: 'SCORE',
        operator: 'GREATER_THAN_OR_EQUAL',
        value: 5,
        scoreValue: 10,
        priority: 0,
        isActive: true,
      };

      const result = evaluateRule(rule, 10, 'NUMBER');
      expect(result.triggered).toBe(true);
    });
  });

  describe('CONTAINS operator', () => {
    it('should trigger when string contains value', () => {
      const rule: ScreeningRule = {
        id: 'r1',
        ruleType: 'SCORE',
        operator: 'CONTAINS',
        value: 'react',
        scoreValue: 5,
        priority: 0,
        isActive: true,
      };

      const result = evaluateRule(rule, 'I have experience with React and Node.js', 'SHORT_TEXT');
      expect(result.triggered).toBe(true);
    });

    it('should trigger when array contains value', () => {
      const rule: ScreeningRule = {
        id: 'r1',
        ruleType: 'SCORE',
        operator: 'CONTAINS',
        value: 'React',
        scoreValue: 5,
        priority: 0,
        isActive: true,
      };

      const result = evaluateRule(rule, ['React', 'Node.js', 'TypeScript'], 'MULTI_SELECT');
      expect(result.triggered).toBe(true);
    });

    it('should not trigger when array does not contain value', () => {
      const rule: ScreeningRule = {
        id: 'r1',
        ruleType: 'SCORE',
        operator: 'CONTAINS',
        value: 'Vue',
        scoreValue: 5,
        priority: 0,
        isActive: true,
      };

      const result = evaluateRule(rule, ['React', 'Node.js'], 'MULTI_SELECT');
      expect(result.triggered).toBe(false);
    });
  });

  describe('IN_LIST operator', () => {
    it('should trigger when answer is in list', () => {
      const rule: ScreeningRule = {
        id: 'r1',
        ruleType: 'SCORE',
        operator: 'IN_LIST',
        value: ['Senior', 'Lead'],
        scoreValue: 15,
        priority: 0,
        isActive: true,
      };

      const result = evaluateRule(rule, 'Senior', 'SINGLE_SELECT');
      expect(result.triggered).toBe(true);
    });

    it('should trigger when any array answer is in list', () => {
      const rule: ScreeningRule = {
        id: 'r1',
        ruleType: 'SCORE',
        operator: 'IN_LIST',
        value: ['React', 'Vue', 'Angular'],
        scoreValue: 10,
        priority: 0,
        isActive: true,
      };

      const result = evaluateRule(rule, ['Python', 'React', 'SQL'], 'MULTI_SELECT');
      expect(result.triggered).toBe(true);
    });

    it('should not trigger when answer is not in list', () => {
      const rule: ScreeningRule = {
        id: 'r1',
        ruleType: 'SCORE',
        operator: 'IN_LIST',
        value: ['Senior', 'Lead'],
        scoreValue: 15,
        priority: 0,
        isActive: true,
      };

      const result = evaluateRule(rule, 'Junior', 'SINGLE_SELECT');
      expect(result.triggered).toBe(false);
    });
  });

  describe('IS_EMPTY operator', () => {
    it('should trigger for null', () => {
      const rule: ScreeningRule = {
        id: 'r1',
        ruleType: 'KNOCKOUT',
        operator: 'IS_EMPTY',
        value: null,
        priority: 0,
        isActive: true,
      };

      const result = evaluateRule(rule, null, 'SHORT_TEXT');
      expect(result.triggered).toBe(true);
    });

    it('should trigger for empty string', () => {
      const rule: ScreeningRule = {
        id: 'r1',
        ruleType: 'KNOCKOUT',
        operator: 'IS_EMPTY',
        value: null,
        priority: 0,
        isActive: true,
      };

      const result = evaluateRule(rule, '', 'SHORT_TEXT');
      expect(result.triggered).toBe(true);
    });

    it('should trigger for empty array', () => {
      const rule: ScreeningRule = {
        id: 'r1',
        ruleType: 'KNOCKOUT',
        operator: 'IS_EMPTY',
        value: null,
        priority: 0,
        isActive: true,
      };

      const result = evaluateRule(rule, [], 'MULTI_SELECT');
      expect(result.triggered).toBe(true);
    });

    it('should not trigger for non-empty value', () => {
      const rule: ScreeningRule = {
        id: 'r1',
        ruleType: 'KNOCKOUT',
        operator: 'IS_EMPTY',
        value: null,
        priority: 0,
        isActive: true,
      };

      const result = evaluateRule(rule, 'some text', 'SHORT_TEXT');
      expect(result.triggered).toBe(false);
    });
  });

  describe('IS_NOT_EMPTY operator', () => {
    it('should trigger for non-empty value', () => {
      const rule: ScreeningRule = {
        id: 'r1',
        ruleType: 'SCORE',
        operator: 'IS_NOT_EMPTY',
        value: null,
        scoreValue: 5,
        priority: 0,
        isActive: true,
      };

      const result = evaluateRule(rule, 'some text', 'SHORT_TEXT');
      expect(result.triggered).toBe(true);
    });

    it('should not trigger for null', () => {
      const rule: ScreeningRule = {
        id: 'r1',
        ruleType: 'SCORE',
        operator: 'IS_NOT_EMPTY',
        value: null,
        scoreValue: 5,
        priority: 0,
        isActive: true,
      };

      const result = evaluateRule(rule, null, 'SHORT_TEXT');
      expect(result.triggered).toBe(false);
    });
  });

  describe('Inactive rules', () => {
    it('should not trigger inactive rules', () => {
      const rule: ScreeningRule = {
        id: 'r1',
        ruleType: 'KNOCKOUT',
        operator: 'EQUALS',
        value: false,
        priority: 0,
        isActive: false, // Inactive
      };

      const result = evaluateRule(rule, false, 'YES_NO');
      expect(result.triggered).toBe(false);
    });
  });

  describe('Salary expectation extraction', () => {
    it('should extract amount for comparison', () => {
      const rule: ScreeningRule = {
        id: 'r1',
        ruleType: 'KNOCKOUT',
        operator: 'GREATER_THAN',
        value: 100000,
        message: 'Salary expectation too high',
        priority: 0,
        isActive: true,
      };

      const answer = { amount: 150000, currency: 'PHP', period: 'monthly' as const };
      const result = evaluateRule(rule, answer, 'SALARY_EXPECTATION');
      expect(result.triggered).toBe(true);
    });
  });

  describe('Availability extraction', () => {
    it('should return 0 for immediate availability', () => {
      const rule: ScreeningRule = {
        id: 'r1',
        ruleType: 'SCORE',
        operator: 'EQUALS',
        value: 0,
        scoreValue: 10,
        priority: 0,
        isActive: true,
      };

      const answer = { isImmediate: true };
      const result = evaluateRule(rule, answer, 'AVAILABILITY');
      expect(result.triggered).toBe(true);
    });

    it('should use notice period for comparison', () => {
      const rule: ScreeningRule = {
        id: 'r1',
        ruleType: 'KNOCKOUT',
        operator: 'GREATER_THAN',
        value: 30,
        message: 'Notice period too long',
        priority: 0,
        isActive: true,
      };

      const answer = { isImmediate: false, noticePeriodDays: 60 };
      const result = evaluateRule(rule, answer, 'AVAILABILITY');
      expect(result.triggered).toBe(true);
    });
  });
});

describe('evaluateAnswerRules', () => {
  it('should evaluate all rules and sum scores', () => {
    const question: ScreeningQuestion = {
      id: 'q1',
      questionText: 'Years of experience',
      questionType: 'YEARS_OF_EXPERIENCE',
      order: 0,
      isRequired: true,
      config: null,
      rules: [
        {
          id: 'r1',
          ruleType: 'SCORE',
          operator: 'GREATER_THAN_OR_EQUAL',
          value: 2,
          scoreValue: 10,
          priority: 0,
          isActive: true,
        },
        {
          id: 'r2',
          ruleType: 'SCORE',
          operator: 'GREATER_THAN_OR_EQUAL',
          value: 5,
          scoreValue: 15,
          priority: 1,
          isActive: true,
        },
      ],
    };

    // Answer of 7 years should trigger both rules
    const result = evaluateAnswerRules(question, 7);
    expect(result.scoreEarned).toBe(25); // 10 + 15
    expect(result.isKnockout).toBe(false);
    expect(result.triggeredRules).toHaveLength(2);
  });

  it('should detect knockout and set message', () => {
    const question: ScreeningQuestion = {
      id: 'q1',
      questionText: 'Are you authorized to work in the Philippines?',
      questionType: 'YES_NO',
      order: 0,
      isRequired: true,
      config: null,
      rules: [
        {
          id: 'r1',
          ruleType: 'KNOCKOUT',
          operator: 'EQUALS',
          value: false,
          message: 'Work authorization required',
          priority: 0,
          isActive: true,
        },
      ],
    };

    const result = evaluateAnswerRules(question, false);
    expect(result.isKnockout).toBe(true);
    expect(result.knockoutMessage).toBe('Work authorization required');
  });

  it('should use question text for knockout message if not specified', () => {
    const question: ScreeningQuestion = {
      id: 'q1',
      questionText: 'Do you have a valid driver license?',
      questionType: 'YES_NO',
      order: 0,
      isRequired: true,
      config: null,
      rules: [
        {
          id: 'r1',
          ruleType: 'KNOCKOUT',
          operator: 'EQUALS',
          value: false,
          priority: 0,
          isActive: true,
        },
      ],
    };

    const result = evaluateAnswerRules(question, false);
    expect(result.isKnockout).toBe(true);
    expect(result.knockoutMessage).toContain('Do you have a valid driver license?');
  });

  it('should evaluate rules by priority order', () => {
    const question: ScreeningQuestion = {
      id: 'q1',
      questionText: 'Experience level',
      questionType: 'SINGLE_SELECT',
      order: 0,
      isRequired: true,
      config: null,
      rules: [
        {
          id: 'r2',
          ruleType: 'SCORE',
          operator: 'EQUALS',
          value: 'Senior',
          scoreValue: 20,
          priority: 1, // Second
          isActive: true,
        },
        {
          id: 'r1',
          ruleType: 'SCORE',
          operator: 'EQUALS',
          value: 'Junior',
          scoreValue: 5,
          priority: 0, // First
          isActive: true,
        },
      ],
    };

    const result = evaluateAnswerRules(question, 'Senior');
    expect(result.triggeredRules[0].ruleId).toBe('r2');
    expect(result.scoreEarned).toBe(20);
  });
});

describe('processScreeningApplication', () => {
  const createTestForm = (questions: ScreeningQuestion[], thresholds?: { shortlist?: number; passing?: number }): ScreeningForm => ({
    id: 'form1',
    jobId: 'job1',
    version: 1,
    isActive: true,
    shortlistThreshold: thresholds?.shortlist,
    passingThreshold: thresholds?.passing,
    questions,
  });

  it('should process valid application and calculate score', () => {
    const form = createTestForm([
      {
        id: 'q1',
        questionText: 'Years of experience',
        questionType: 'YEARS_OF_EXPERIENCE',
        order: 0,
        isRequired: true,
        config: null,
        rules: [
          {
            id: 'r1',
            ruleType: 'SCORE',
            operator: 'GREATER_THAN_OR_EQUAL',
            value: 3,
            scoreValue: 20,
            priority: 0,
            isActive: true,
          },
        ],
      },
      {
        id: 'q2',
        questionText: 'Skills',
        questionType: 'MULTI_SELECT',
        order: 1,
        isRequired: true,
        config: { choices: ['React', 'Node.js', 'TypeScript'] },
        rules: [
          {
            id: 'r2',
            ruleType: 'SCORE',
            operator: 'CONTAINS',
            value: 'React',
            scoreValue: 10,
            priority: 0,
            isActive: true,
          },
        ],
      },
    ]);

    const answers: AnswerSubmission[] = [
      { questionId: 'q1', answer: 5 },
      { questionId: 'q2', answer: ['React', 'TypeScript'] },
    ];

    const result = processScreeningApplication(form, answers);

    expect(result.isValid).toBe(true);
    expect(result.totalScore).toBe(30); // 20 + 10
    expect(result.hasKnockout).toBe(false);
    expect(result.recommendedStatus).toBe('new');
  });

  it('should reject application with knockout', () => {
    const form = createTestForm([
      {
        id: 'q1',
        questionText: 'Are you authorized to work?',
        questionType: 'YES_NO',
        order: 0,
        isRequired: true,
        config: null,
        rules: [
          {
            id: 'r1',
            ruleType: 'KNOCKOUT',
            operator: 'EQUALS',
            value: false,
            message: 'Work authorization required',
            priority: 0,
            isActive: true,
          },
        ],
      },
    ]);

    const answers: AnswerSubmission[] = [
      { questionId: 'q1', answer: false },
    ];

    const result = processScreeningApplication(form, answers);

    expect(result.isValid).toBe(true);
    expect(result.hasKnockout).toBe(true);
    expect(result.knockoutReason).toBe('Work authorization required');
    expect(result.recommendedStatus).toBe('rejected');
  });

  it('should shortlist application when score meets threshold', () => {
    const form = createTestForm(
      [
        {
          id: 'q1',
          questionText: 'Experience',
          questionType: 'NUMBER',
          order: 0,
          isRequired: true,
          config: null,
          rules: [
            {
              id: 'r1',
              ruleType: 'SCORE',
              operator: 'GREATER_THAN',
              value: 0,
              scoreValue: 50,
              priority: 0,
              isActive: true,
            },
          ],
        },
      ],
      { shortlist: 40 }
    );

    const answers: AnswerSubmission[] = [
      { questionId: 'q1', answer: 5 },
    ];

    const result = processScreeningApplication(form, answers);

    expect(result.totalScore).toBe(50);
    expect(result.recommendedStatus).toBe('shortlisted');
  });

  it('should return validation errors for invalid answers', () => {
    const form = createTestForm([
      {
        id: 'q1',
        questionText: 'Email',
        questionType: 'SHORT_TEXT',
        order: 0,
        isRequired: true,
        config: { regex: '^[^@]+@[^@]+\\.[^@]+$' },
        rules: [],
      },
    ]);

    const answers: AnswerSubmission[] = [
      { questionId: 'q1', answer: 'not-an-email' },
    ];

    const result = processScreeningApplication(form, answers);

    expect(result.isValid).toBe(false);
    expect(result.validationErrors).toHaveLength(1);
    expect(result.validationErrors[0].questionId).toBe('q1');
  });

  it('should return validation errors for missing required answers', () => {
    const form = createTestForm([
      {
        id: 'q1',
        questionText: 'Name',
        questionType: 'SHORT_TEXT',
        order: 0,
        isRequired: true,
        config: null,
        rules: [],
      },
    ]);

    const answers: AnswerSubmission[] = []; // Missing required q1

    const result = processScreeningApplication(form, answers);

    expect(result.isValid).toBe(false);
    expect(result.validationErrors).toHaveLength(1);
    expect(result.validationErrors[0].message).toBe('This field is required');
  });

  it('should handle multiple knockouts correctly', () => {
    const form = createTestForm([
      {
        id: 'q1',
        questionText: 'Work authorization',
        questionType: 'YES_NO',
        order: 0,
        isRequired: true,
        config: null,
        rules: [
          {
            id: 'r1',
            ruleType: 'KNOCKOUT',
            operator: 'EQUALS',
            value: false,
            message: 'Not authorized',
            priority: 0,
            isActive: true,
          },
        ],
      },
      {
        id: 'q2',
        questionText: 'Experience',
        questionType: 'YEARS_OF_EXPERIENCE',
        order: 1,
        isRequired: true,
        config: null,
        rules: [
          {
            id: 'r2',
            ruleType: 'KNOCKOUT',
            operator: 'LESS_THAN',
            value: 2,
            message: 'Not enough experience',
            priority: 0,
            isActive: true,
          },
        ],
      },
    ]);

    const answers: AnswerSubmission[] = [
      { questionId: 'q1', answer: false },
      { questionId: 'q2', answer: 1 },
    ];

    const result = processScreeningApplication(form, answers);

    expect(result.hasKnockout).toBe(true);
    // First knockout reason should be captured
    expect(result.knockoutReason).toBe('Not authorized');
    expect(result.recommendedStatus).toBe('rejected');
  });
});

describe('getScreeningSummary', () => {
  it('should create readable summary', () => {
    const result = {
      isValid: true,
      validationErrors: [],
      totalScore: 75,
      hasKnockout: false,
      recommendedStatus: 'shortlisted' as const,
      answerResults: [
        {
          questionId: 'q1',
          isKnockout: false,
          scoreEarned: 40,
          triggeredRules: [],
        },
        {
          questionId: 'q2',
          isKnockout: false,
          scoreEarned: 35,
          triggeredRules: [],
        },
      ],
    };

    const summary = getScreeningSummary(result);

    expect(summary.status).toBe('shortlisted');
    expect(summary.score).toBe(75);
    expect(summary.knockedOut).toBe(false);
    expect(summary.passedQuestions).toBe(2);
    expect(summary.totalQuestions).toBe(2);
  });

  it('should include knockout info in summary', () => {
    const result = {
      isValid: true,
      validationErrors: [],
      totalScore: 20,
      hasKnockout: true,
      knockoutReason: 'Not authorized to work',
      recommendedStatus: 'rejected' as const,
      answerResults: [
        {
          questionId: 'q1',
          isKnockout: true,
          scoreEarned: 0,
          knockoutMessage: 'Not authorized to work',
          triggeredRules: [],
        },
        {
          questionId: 'q2',
          isKnockout: false,
          scoreEarned: 20,
          triggeredRules: [],
        },
      ],
    };

    const summary = getScreeningSummary(result);

    expect(summary.status).toBe('rejected');
    expect(summary.knockedOut).toBe(true);
    expect(summary.reason).toBe('Not authorized to work');
    expect(summary.passedQuestions).toBe(1);
    expect(summary.totalQuestions).toBe(2);
  });
});
