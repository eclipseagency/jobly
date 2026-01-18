import { NextRequest, NextResponse } from 'next/server';

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

// POST /api/contact - Handle contact form submissions
export async function POST(request: NextRequest) {
  try {
    const body: ContactFormData = await request.json();
    const { name, email, subject, message } = body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // In production, integrate with email service to send to support team
    // For example:
    // await sendEmail({
    //   to: 'support@jobly.ph',
    //   subject: `[Contact Form] ${subject}`,
    //   html: `
    //     <h2>New Contact Form Submission</h2>
    //     <p><strong>From:</strong> ${name} (${email})</p>
    //     <p><strong>Subject:</strong> ${subject}</p>
    //     <p><strong>Message:</strong></p>
    //     <p>${message}</p>
    //   `,
    // });

    // Log the submission for now (in production, store in database or send email)
    console.info(`[Contact] New submission from ${name} (${email}) - Subject: ${subject}`);

    return NextResponse.json({
      success: true,
      message: 'Thank you for your message. We will get back to you within 24 hours.',
    });
  } catch (error) {
    console.error('[Contact] Error processing contact form:', error);
    return NextResponse.json(
      { error: 'Failed to send message. Please try again.' },
      { status: 500 }
    );
  }
}
