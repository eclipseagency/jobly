import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// PUT /api/employee/interview-prep/[id]/questions/[questionId] - Update question
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; questionId: string } }
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

    // Verify question belongs to prep
    const existingQuestion = await prisma.interviewQuestion.findFirst({
      where: { id: params.questionId, prepId: params.id },
    });

    if (!existingQuestion) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    const body = await request.json();
    const { question, category, answer, tip, practiced, confidenceLevel, notes } = body;

    const updatedQuestion = await prisma.interviewQuestion.update({
      where: { id: params.questionId },
      data: {
        question,
        category,
        answer,
        tip,
        practiced: practiced ?? existingQuestion.practiced,
        confidenceLevel: confidenceLevel ?? existingQuestion.confidenceLevel,
        notes,
        practicedAt: practiced && !existingQuestion.practiced ? new Date() : existingQuestion.practicedAt,
      },
    });

    return NextResponse.json({ question: updatedQuestion });
  } catch (error) {
    console.error('[Interview Question] Error updating:', error);
    return NextResponse.json(
      { error: 'Failed to update question' },
      { status: 500 }
    );
  }
}

// DELETE /api/employee/interview-prep/[id]/questions/[questionId] - Delete question
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; questionId: string } }
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

    // Verify question belongs to prep
    const existingQuestion = await prisma.interviewQuestion.findFirst({
      where: { id: params.questionId, prepId: params.id },
    });

    if (!existingQuestion) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    await prisma.interviewQuestion.delete({
      where: { id: params.questionId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Interview Question] Error deleting:', error);
    return NextResponse.json(
      { error: 'Failed to delete question' },
      { status: 500 }
    );
  }
}
