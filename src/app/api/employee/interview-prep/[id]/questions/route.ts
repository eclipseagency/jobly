import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// POST /api/employee/interview-prep/[id]/questions - Add question to prep
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify prep ownership
    const prep = await prisma.interviewPrep.findFirst({
      where: { id: params.id, userId },
    });

    if (!prep) {
      return NextResponse.json({ error: 'Prep not found' }, { status: 404 });
    }

    const body = await request.json();
    const { question, category, answer, tip } = body;

    if (!question) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }

    const newQuestion = await prisma.interviewQuestion.create({
      data: {
        prepId: params.id,
        question,
        category: category || 'general',
        answer,
        tip,
      },
    });

    return NextResponse.json({ question: newQuestion }, { status: 201 });
  } catch (error) {
    console.error('[Interview Questions] Error creating:', error);
    return NextResponse.json(
      { error: 'Failed to add question' },
      { status: 500 }
    );
  }
}

// PUT /api/employee/interview-prep/[id]/questions - Batch add questions
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify prep ownership
    const prep = await prisma.interviewPrep.findFirst({
      where: { id: params.id, userId },
    });

    if (!prep) {
      return NextResponse.json({ error: 'Prep not found' }, { status: 404 });
    }

    const body = await request.json();
    const { questions } = body;

    if (!Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { error: 'Questions array is required' },
        { status: 400 }
      );
    }

    const createdQuestions = await prisma.interviewQuestion.createMany({
      data: questions.map((q: { question: string; category?: string; tip?: string }) => ({
        prepId: params.id,
        question: q.question,
        category: q.category || 'general',
        tip: q.tip,
      })),
    });

    // Fetch all questions for the prep
    const allQuestions = await prisma.interviewQuestion.findMany({
      where: { prepId: params.id },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({
      added: createdQuestions.count,
      questions: allQuestions,
    });
  } catch (error) {
    console.error('[Interview Questions] Error batch adding:', error);
    return NextResponse.json(
      { error: 'Failed to add questions' },
      { status: 500 }
    );
  }
}
