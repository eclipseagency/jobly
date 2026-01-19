import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Sample interview questions by category
const INTERVIEW_QUESTIONS = {
  behavioral: [
    { question: "Tell me about yourself.", tip: "Keep it professional, focus on relevant experience, and aim for 2 minutes." },
    { question: "Why do you want to work here?", tip: "Research the company beforehand and mention specific values or projects." },
    { question: "What's your greatest strength?", tip: "Choose a strength relevant to the role with a specific example." },
    { question: "What's your biggest weakness?", tip: "Be honest but show how you're working to improve it." },
    { question: "Describe a challenging situation and how you handled it.", tip: "Use the STAR method: Situation, Task, Action, Result." },
    { question: "Tell me about a time you showed leadership.", tip: "Leadership can be informal - guiding projects, mentoring, or taking initiative." },
    { question: "How do you handle conflict with coworkers?", tip: "Focus on communication, understanding different perspectives, and finding solutions." },
    { question: "Where do you see yourself in 5 years?", tip: "Show ambition aligned with the company's growth opportunities." },
    { question: "Why are you leaving your current job?", tip: "Stay positive, focus on growth opportunities rather than negatives." },
    { question: "Describe a time you failed and what you learned.", tip: "Show self-awareness and demonstrate growth from the experience." },
  ],
  technical: [
    { question: "Walk me through your technical background.", tip: "Highlight relevant technologies and projects that match the job requirements." },
    { question: "How do you stay updated with new technologies?", tip: "Mention specific resources, communities, or learning habits." },
    { question: "Describe your debugging process.", tip: "Show systematic thinking: reproduce, isolate, identify, fix, verify." },
    { question: "How do you approach learning a new technology?", tip: "Describe your learning methodology: documentation, tutorials, projects." },
    { question: "Tell me about a technical project you're proud of.", tip: "Explain the problem, your solution, challenges, and impact." },
    { question: "How do you handle technical disagreements?", tip: "Focus on data-driven decisions and openness to other approaches." },
    { question: "What's your experience with code review?", tip: "Emphasize both giving and receiving constructive feedback." },
    { question: "How do you prioritize technical debt?", tip: "Balance business needs with long-term maintainability." },
    { question: "Describe your ideal development environment.", tip: "Show you understand best practices while being flexible." },
    { question: "How do you ensure code quality?", tip: "Mention testing, reviews, documentation, and CI/CD practices." },
  ],
  situational: [
    { question: "How would you handle a tight deadline with incomplete requirements?", tip: "Show prioritization skills and stakeholder communication." },
    { question: "What would you do if you disagreed with your manager's decision?", tip: "Express respect while showing ability to voice concerns professionally." },
    { question: "How would you onboard to a new codebase quickly?", tip: "Mention reading docs, talking to team, exploring code, and asking questions." },
    { question: "How would you handle multiple urgent requests?", tip: "Demonstrate prioritization and communication skills." },
    { question: "What would you do if a project was falling behind schedule?", tip: "Show proactive communication and problem-solving." },
    { question: "How would you mentor a struggling junior developer?", tip: "Emphasize patience, clear communication, and structured guidance." },
    { question: "What would you do if you noticed a security vulnerability?", tip: "Show responsible disclosure and proper escalation." },
    { question: "How would you handle a production outage?", tip: "Describe incident response: triage, communicate, fix, postmortem." },
    { question: "What if you realized your solution was wrong mid-implementation?", tip: "Show ability to reassess and communicate changes to stakeholders." },
    { question: "How would you explain a complex technical concept to non-technical stakeholders?", tip: "Use analogies and focus on business impact rather than technical details." },
  ],
  culture: [
    { question: "What type of work environment do you thrive in?", tip: "Be honest and align with the company culture you've researched." },
    { question: "How do you balance work and personal life?", tip: "Show you can be productive while maintaining boundaries." },
    { question: "What motivates you at work?", tip: "Connect your motivators to what the role offers." },
    { question: "How do you prefer to receive feedback?", tip: "Show openness to feedback and a growth mindset." },
    { question: "Describe your ideal team dynamics.", tip: "Emphasize collaboration while showing you can work independently." },
    { question: "What do you value most in a workplace?", tip: "Be specific and genuine about your values." },
    { question: "How do you celebrate team successes?", tip: "Show you value team recognition and contribution." },
    { question: "What would make you choose one offer over another?", tip: "Show you've thought about what matters to you professionally." },
    { question: "How do you handle stress or pressure?", tip: "Provide specific strategies that work for you." },
    { question: "What are you looking for in your next role?", tip: "Be specific about growth, challenges, or opportunities." },
  ],
};

// GET /api/employee/interview-prep - Get interview prep data
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's interview preps
    const preps = await prisma.interviewPrep.findMany({
      where: { userId },
      include: {
        practiceQuestions: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Get upcoming interviews
    const upcomingInterviews = await prisma.application.findMany({
      where: {
        userId,
        status: { in: ['interview', 'Interview'] },
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            tenant: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: 5,
    });

    // Calculate stats
    const totalQuestions = preps.reduce((sum, p) => sum + p.practiceQuestions.length, 0);
    const practicedQuestions = preps.reduce(
      (sum, p) => sum + p.practiceQuestions.filter((q) => q.practiceCount > 0).length,
      0
    );
    const confidentQuestions = preps.reduce(
      (sum, p) => sum + p.practiceQuestions.filter((q) => (q.confidence ?? 0) >= 4).length,
      0
    );

    return NextResponse.json({
      preps,
      upcomingInterviews,
      stats: {
        totalPreps: preps.length,
        totalQuestions,
        practicedQuestions,
        confidentQuestions,
        practiceRate: totalQuestions > 0
          ? Math.round((practicedQuestions / totalQuestions) * 100)
          : 0,
      },
      questionBank: INTERVIEW_QUESTIONS,
    });
  } catch (error) {
    console.error('[Interview Prep] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch interview prep data' },
      { status: 500 }
    );
  }
}

// POST /api/employee/interview-prep - Create new interview prep
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { companyName, jobTitle, interviewDate, interviewType, companyNotes, roleNotes, category, questions } = body;

    const prep = await prisma.interviewPrep.create({
      data: {
        userId,
        companyName,
        jobTitle,
        interviewDate: interviewDate ? new Date(interviewDate) : null,
        interviewType,
        companyNotes,
        roleNotes,
        practiceQuestions: questions?.length > 0
          ? {
              create: questions.map((q: { question: string; category?: string }) => ({
                question: q.question,
                category: q.category || category || 'general',
              })),
            }
          : undefined,
      },
      include: {
        practiceQuestions: true,
      },
    });

    return NextResponse.json({ prep }, { status: 201 });
  } catch (error) {
    console.error('[Interview Prep] Error creating:', error);
    return NextResponse.json(
      { error: 'Failed to create interview prep' },
      { status: 500 }
    );
  }
}
