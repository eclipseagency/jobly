import { describe, it, expect } from 'vitest';
import { validateAnswer, validateAllAnswers } from './validators';
import { ScreeningQuestion, QuestionType } from './types';

describe('validateAnswer', () => {
  describe('YES_NO', () => {
    it('should accept boolean true', () => {
      const error = validateAnswer('YES_NO', true, null, false);
      expect(error).toBeNull();
    });

    it('should accept boolean false', () => {
      const error = validateAnswer('YES_NO', false, null, false);
      expect(error).toBeNull();
    });

    it('should reject string "yes"', () => {
      const error = validateAnswer('YES_NO', 'yes', null, false);
      expect(error).toBe('Answer must be yes or no');
    });

    it('should reject number 1', () => {
      const error = validateAnswer('YES_NO', 1, null, false);
      expect(error).toBe('Answer must be yes or no');
    });
  });

  describe('SINGLE_SELECT', () => {
    const config = { choices: ['Option A', 'Option B', 'Option C'] };

    it('should accept valid choice', () => {
      const error = validateAnswer('SINGLE_SELECT', 'Option A', config, false);
      expect(error).toBeNull();
    });

    it('should reject invalid choice', () => {
      const error = validateAnswer('SINGLE_SELECT', 'Option D', config, false);
      expect(error).toBe('Selected option is not valid');
    });

    it('should reject array', () => {
      const error = validateAnswer('SINGLE_SELECT', ['Option A'], config, false);
      expect(error).toBe('Please select an option');
    });
  });

  describe('MULTI_SELECT', () => {
    const config = { choices: ['Skill 1', 'Skill 2', 'Skill 3'] };

    it('should accept valid choices', () => {
      const error = validateAnswer('MULTI_SELECT', ['Skill 1', 'Skill 2'], config, false);
      expect(error).toBeNull();
    });

    it('should accept single choice as array', () => {
      const error = validateAnswer('MULTI_SELECT', ['Skill 1'], config, false);
      expect(error).toBeNull();
    });

    it('should reject invalid choices', () => {
      const error = validateAnswer('MULTI_SELECT', ['Skill 1', 'Invalid'], config, false);
      expect(error).toBe('Invalid options selected: Invalid');
    });

    it('should reject string', () => {
      const error = validateAnswer('MULTI_SELECT', 'Skill 1', config, false);
      expect(error).toBe('Please select one or more options');
    });
  });

  describe('SHORT_TEXT', () => {
    it('should accept valid text', () => {
      const error = validateAnswer('SHORT_TEXT', 'Hello world', null, false);
      expect(error).toBeNull();
    });

    it('should enforce minLength', () => {
      const config = { minLength: 10 };
      const error = validateAnswer('SHORT_TEXT', 'Short', config, false);
      expect(error).toBe('Answer must be at least 10 characters');
    });

    it('should enforce maxLength', () => {
      const config = { maxLength: 5 };
      const error = validateAnswer('SHORT_TEXT', 'Too long text', config, false);
      expect(error).toBe('Answer must be no more than 5 characters');
    });

    it('should validate regex pattern', () => {
      const config = { regex: '^[A-Z]+$' };
      const error = validateAnswer('SHORT_TEXT', 'lowercase', config, false);
      expect(error).toBe('Answer format is invalid');
    });

    it('should pass valid regex pattern', () => {
      const config = { regex: '^[A-Z]+$' };
      const error = validateAnswer('SHORT_TEXT', 'UPPERCASE', config, false);
      expect(error).toBeNull();
    });
  });

  describe('NUMBER', () => {
    it('should accept valid number', () => {
      const error = validateAnswer('NUMBER', 42, null, false);
      expect(error).toBeNull();
    });

    it('should accept zero', () => {
      const error = validateAnswer('NUMBER', 0, null, false);
      expect(error).toBeNull();
    });

    it('should reject string', () => {
      const error = validateAnswer('NUMBER', '42', null, false);
      expect(error).toBe('Answer must be a number');
    });

    it('should enforce min', () => {
      const config = { min: 10 };
      const error = validateAnswer('NUMBER', 5, config, false);
      expect(error).toBe('Value must be at least 10');
    });

    it('should enforce max', () => {
      const config = { max: 100 };
      const error = validateAnswer('NUMBER', 150, config, false);
      expect(error).toBe('Value must be no more than 100');
    });
  });

  describe('DATE', () => {
    it('should accept valid ISO date string', () => {
      const error = validateAnswer('DATE', '2024-01-15', null, false);
      expect(error).toBeNull();
    });

    it('should accept full ISO datetime', () => {
      const error = validateAnswer('DATE', '2024-01-15T10:30:00Z', null, false);
      expect(error).toBeNull();
    });

    it('should reject invalid date string', () => {
      const error = validateAnswer('DATE', 'not-a-date', null, false);
      expect(error).toBe('Invalid date format');
    });
  });

  describe('SALARY_EXPECTATION', () => {
    it('should accept valid salary object', () => {
      const answer = { amount: 50000, currency: 'PHP', period: 'monthly' as const };
      const error = validateAnswer('SALARY_EXPECTATION', answer, null, false);
      expect(error).toBeNull();
    });

    it('should reject negative amount', () => {
      const answer = { amount: -1000, currency: 'PHP', period: 'monthly' as const };
      const error = validateAnswer('SALARY_EXPECTATION', answer, null, false);
      expect(error).toBe('Please provide a valid salary amount');
    });

    it('should reject invalid period', () => {
      // Intentionally invalid period to test validation
      const answer = { amount: 50000, currency: 'PHP', period: 'quarterly' } as unknown as import('../screening/types').SalaryAnswer;
      const error = validateAnswer('SALARY_EXPECTATION', answer, null, false);
      expect(error).toBe('Please select a valid pay period');
    });

    it('should enforce minAmount', () => {
      const config = { minAmount: 30000 };
      const answer = { amount: 20000, currency: 'PHP', period: 'monthly' as const };
      const error = validateAnswer('SALARY_EXPECTATION', answer, config, false);
      expect(error).toBe('Minimum salary is 30000');
    });
  });

  describe('YEARS_OF_EXPERIENCE', () => {
    it('should accept valid years', () => {
      const error = validateAnswer('YEARS_OF_EXPERIENCE', 5, null, false);
      expect(error).toBeNull();
    });

    it('should accept zero', () => {
      const error = validateAnswer('YEARS_OF_EXPERIENCE', 0, null, false);
      expect(error).toBeNull();
    });

    it('should reject negative years', () => {
      const error = validateAnswer('YEARS_OF_EXPERIENCE', -1, null, false);
      expect(error).toBe('Years of experience cannot be negative');
    });

    it('should reject unrealistic years', () => {
      const error = validateAnswer('YEARS_OF_EXPERIENCE', 100, null, false);
      expect(error).toBe('Please provide a valid number of years');
    });

    it('should enforce min years', () => {
      const config = { min: 3 };
      const error = validateAnswer('YEARS_OF_EXPERIENCE', 2, config, false);
      expect(error).toBe('Minimum 3 years required');
    });
  });

  describe('AVAILABILITY', () => {
    it('should accept immediate availability', () => {
      const answer = { isImmediate: true };
      const error = validateAnswer('AVAILABILITY', answer, null, false);
      expect(error).toBeNull();
    });

    it('should accept availability with date', () => {
      const answer = { isImmediate: false, availableDate: '2024-02-01' };
      const error = validateAnswer('AVAILABILITY', answer, null, false);
      expect(error).toBeNull();
    });

    it('should accept availability with notice period', () => {
      const answer = { isImmediate: false, noticePeriodDays: 30 };
      const error = validateAnswer('AVAILABILITY', answer, null, false);
      expect(error).toBeNull();
    });

    it('should require date or notice period when not immediate', () => {
      const answer = { isImmediate: false };
      const error = validateAnswer('AVAILABILITY', answer, null, false);
      expect(error).toBe('Please provide your available date or notice period');
    });

    it('should enforce max notice days', () => {
      const config = { maxNoticeDays: 60 };
      const answer = { isImmediate: false, noticePeriodDays: 90 };
      const error = validateAnswer('AVAILABILITY', answer, config, false);
      expect(error).toBe('Notice period cannot exceed 60 days');
    });
  });

  describe('WORK_AUTHORIZATION', () => {
    it('should accept authorized status', () => {
      const answer = { authorized: true };
      const error = validateAnswer('WORK_AUTHORIZATION', answer, null, false);
      expect(error).toBeNull();
    });

    it('should accept with visa details', () => {
      const answer = {
        authorized: true,
        visaType: 'Work Permit',
        expiryDate: '2025-12-31',
      };
      const error = validateAnswer('WORK_AUTHORIZATION', answer, null, false);
      expect(error).toBeNull();
    });

    it('should accept not authorized status', () => {
      const answer = { authorized: false, requiresSponsorship: true };
      const error = validateAnswer('WORK_AUTHORIZATION', answer, null, false);
      expect(error).toBeNull();
    });
  });

  describe('URL_LIST', () => {
    it('should accept valid URLs', () => {
      const answer = ['https://github.com/user', 'https://linkedin.com/in/user'];
      const error = validateAnswer('URL_LIST', answer, null, false);
      expect(error).toBeNull();
    });

    it('should accept empty array when not required', () => {
      const error = validateAnswer('URL_LIST', [], null, false);
      expect(error).toBeNull();
    });

    it('should reject invalid URLs', () => {
      const answer = ['not-a-url'];
      const error = validateAnswer('URL_LIST', answer, null, false);
      expect(error).toBe('Invalid URL: not-a-url');
    });

    it('should enforce maxUrls', () => {
      const config = { maxUrls: 2 };
      const answer = ['https://a.com', 'https://b.com', 'https://c.com'];
      const error = validateAnswer('URL_LIST', answer, config, false);
      expect(error).toBe('Maximum 2 URLs allowed');
    });

    it('should enforce required domains', () => {
      const config = { requiredDomains: ['linkedin.com', 'github.com'] };
      const answer = ['https://twitter.com/user'];
      const error = validateAnswer('URL_LIST', answer, config, false);
      expect(error).toBe('URL must be from: linkedin.com, github.com');
    });
  });

  describe('FILE_UPLOAD', () => {
    it('should accept valid file', () => {
      const answer = { url: 'https://storage.com/file.pdf', filename: 'resume.pdf', size: 1024, type: 'application/pdf' };
      const error = validateAnswer('FILE_UPLOAD', answer, null, false);
      expect(error).toBeNull();
    });

    it('should enforce maxSize', () => {
      const config = { maxSize: 1000 }; // 1KB
      const answer = { url: 'https://storage.com/file.pdf', filename: 'big.pdf', size: 5000, type: 'application/pdf' };
      const error = validateAnswer('FILE_UPLOAD', answer, config, false);
      expect(error).toBe('File size must be less than 0.0MB');
    });

    it('should enforce allowedTypes', () => {
      const config = { allowedTypes: ['pdf', 'doc'] };
      const answer = { url: 'https://storage.com/file.exe', filename: 'file.exe', size: 1024, type: 'application/exe' };
      const error = validateAnswer('FILE_UPLOAD', answer, config, false);
      expect(error).toBe('Allowed file types: pdf, doc');
    });
  });

  describe('Required fields', () => {
    it('should return error for required null value', () => {
      const error = validateAnswer('SHORT_TEXT', null, null, true);
      expect(error).toBe('This field is required');
    });

    it('should return error for required empty string', () => {
      const error = validateAnswer('SHORT_TEXT', '', null, true);
      expect(error).toBe('This field is required');
    });

    it('should return error for required empty array', () => {
      const error = validateAnswer('MULTI_SELECT', [], null, true);
      expect(error).toBe('This field is required');
    });

    it('should not return error for optional null value', () => {
      const error = validateAnswer('SHORT_TEXT', null, null, false);
      expect(error).toBeNull();
    });
  });
});

describe('validateAllAnswers', () => {
  const questions: ScreeningQuestion[] = [
    {
      id: 'q1',
      questionText: 'Are you authorized to work?',
      questionType: 'YES_NO',
      order: 0,
      isRequired: true,
      config: null,
      rules: [],
    },
    {
      id: 'q2',
      questionText: 'Years of experience',
      questionType: 'YEARS_OF_EXPERIENCE',
      order: 1,
      isRequired: true,
      config: { min: 2 },
      rules: [],
    },
    {
      id: 'q3',
      questionText: 'Additional comments',
      questionType: 'LONG_TEXT',
      order: 2,
      isRequired: false,
      config: null,
      rules: [],
    },
  ];

  it('should validate all answers successfully', () => {
    const answers = [
      { questionId: 'q1', answer: true },
      { questionId: 'q2', answer: 5 },
    ];

    const result = validateAllAnswers(questions, answers);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should catch missing required answers', () => {
    const answers = [
      { questionId: 'q1', answer: true },
      // Missing q2 which is required
    ];

    const result = validateAllAnswers(questions, answers);
    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].questionId).toBe('q2');
    expect(result.errors[0].message).toBe('This field is required');
  });

  it('should catch validation errors in answers', () => {
    const answers = [
      { questionId: 'q1', answer: true },
      { questionId: 'q2', answer: 1 }, // Below min of 2
    ];

    const result = validateAllAnswers(questions, answers);
    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].questionId).toBe('q2');
    expect(result.errors[0].message).toBe('Minimum 2 years required');
  });

  it('should allow missing optional answers', () => {
    const answers = [
      { questionId: 'q1', answer: true },
      { questionId: 'q2', answer: 3 },
      // q3 is optional and missing - that's ok
    ];

    const result = validateAllAnswers(questions, answers);
    expect(result.isValid).toBe(true);
  });

  it('should collect multiple errors', () => {
    const answers = [
      { questionId: 'q1', answer: 'not-a-boolean' },
      { questionId: 'q2', answer: 'not-a-number' },
    ];

    const result = validateAllAnswers(questions, answers);
    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveLength(2);
  });
});
