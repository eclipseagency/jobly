import { Resend } from 'resend';

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.FROM_EMAIL || 'Jobly <noreply@jobly.ph>';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.jobly.ph';

// Email templates
const baseTemplate = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Jobly</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .card { background: white; border-radius: 8px; padding: 32px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .header { text-align: center; margin-bottom: 24px; }
    .logo { font-size: 28px; font-weight: bold; color: #2563eb; }
    .button { display: inline-block; background: #2563eb; color: white !important; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500; margin: 16px 0; }
    .button:hover { background: #1d4ed8; }
    .footer { text-align: center; margin-top: 24px; color: #666; font-size: 14px; }
    .divider { border-top: 1px solid #eee; margin: 24px 0; }
    h1 { color: #111; margin-bottom: 16px; }
    h2 { color: #333; margin-bottom: 12px; }
    p { margin: 12px 0; }
    .highlight { background: #f0f9ff; padding: 16px; border-radius: 6px; border-left: 4px solid #2563eb; }
    .muted { color: #666; font-size: 14px; }
    ul { padding-left: 20px; }
    li { margin: 8px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <div class="logo">Jobly</div>
      </div>
      ${content}
      <div class="footer">
        <div class="divider"></div>
        <p>&copy; ${new Date().getFullYear()} Jobly. All rights reserved.</p>
        <p class="muted">You're receiving this email because you have an account on Jobly.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

// Types
interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

interface ApplicationStatusEmailData {
  candidateName: string;
  jobTitle: string;
  companyName: string;
  status: string;
  message?: string;
}

interface InterviewInvitationEmailData {
  candidateName: string;
  jobTitle: string;
  companyName: string;
  proposedDates: string[];
  message?: string;
  expiresAt?: string;
}

interface NewMessageEmailData {
  recipientName: string;
  senderName: string;
  companyName?: string;
  messagePreview: string;
  conversationUrl: string;
}

interface JobAlertEmailData {
  userName: string;
  jobs: Array<{
    id: string;
    title: string;
    company: string;
    location: string;
    salary?: string;
  }>;
}

interface WelcomeEmailData {
  userName: string;
  userType: 'jobseeker' | 'employer';
}

interface PasswordResetEmailData {
  userName: string;
  resetUrl: string;
}

interface JobApprovalEmailData {
  employerName: string;
  jobTitle: string;
  status: 'approved' | 'rejected' | 'changes_requested';
  reason?: string;
}

interface NewApplicationEmailData {
  employerName: string;
  jobTitle: string;
  candidateName: string;
  candidateEmail: string;
  applicationUrl: string;
}

// Send email function
async function sendEmail({ to, subject, html }: SendEmailOptions): Promise<{ success: boolean; error?: string }> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.log('[Email] Resend API key not configured, skipping email send');
      console.log('[Email] Would send to:', to, 'Subject:', subject);
      return { success: true };
    }

    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });

    if (error) {
      console.error('[Email] Send error:', error);
      return { success: false, error: error.message };
    }

    console.log('[Email] Sent successfully to:', to);
    return { success: true };
  } catch (error) {
    console.error('[Email] Exception:', error);
    return { success: false, error: String(error) };
  }
}

// Email sending functions
export async function sendWelcomeEmail(to: string, data: WelcomeEmailData) {
  const content = data.userType === 'employer'
    ? `
      <h1>Welcome to Jobly, ${data.userName}!</h1>
      <p>Thank you for joining Jobly as an employer. You're now ready to find the best talent for your company.</p>
      <div class="highlight">
        <h2>Get Started</h2>
        <ul>
          <li>Complete your company profile to attract top candidates</li>
          <li>Post your first job listing</li>
          <li>Browse our talent pool to find passive candidates</li>
        </ul>
      </div>
      <a href="${APP_URL}/employer/dashboard" class="button">Go to Dashboard</a>
      <p class="muted">Need help? Contact our support team at support@jobly.ph</p>
    `
    : `
      <h1>Welcome to Jobly, ${data.userName}!</h1>
      <p>Thank you for joining Jobly! Your journey to finding your dream job starts here.</p>
      <div class="highlight">
        <h2>Get Started</h2>
        <ul>
          <li>Complete your profile to stand out to employers</li>
          <li>Upload your resume for better job matches</li>
          <li>Set up job alerts to never miss an opportunity</li>
        </ul>
      </div>
      <a href="${APP_URL}/employee/dashboard" class="button">Go to Dashboard</a>
      <p class="muted">Need help? Contact our support team at support@jobly.ph</p>
    `;

  return sendEmail({
    to,
    subject: `Welcome to Jobly, ${data.userName}!`,
    html: baseTemplate(content),
  });
}

export async function sendPasswordResetEmail(to: string, data: PasswordResetEmailData) {
  const content = `
    <h1>Reset Your Password</h1>
    <p>Hi ${data.userName},</p>
    <p>We received a request to reset your password. Click the button below to create a new password:</p>
    <a href="${data.resetUrl}" class="button">Reset Password</a>
    <p class="muted">This link will expire in 1 hour.</p>
    <p class="muted">If you didn't request this, you can safely ignore this email. Your password won't be changed.</p>
  `;

  return sendEmail({
    to,
    subject: 'Reset Your Jobly Password',
    html: baseTemplate(content),
  });
}

export async function sendApplicationStatusEmail(to: string, data: ApplicationStatusEmailData) {
  const statusMessages: Record<string, { title: string; color: string; message: string }> = {
    shortlisted: {
      title: 'Great News! You\'ve Been Shortlisted',
      color: '#22c55e',
      message: 'Congratulations! Your application has been shortlisted. The employer is interested in your profile and will reach out soon.',
    },
    reviewing: {
      title: 'Application Under Review',
      color: '#f59e0b',
      message: 'Good news! Your application is now being reviewed by the hiring team.',
    },
    interviewed: {
      title: 'Interview Stage',
      color: '#3b82f6',
      message: 'Your application has moved to the interview stage. Expect to hear from the employer regarding next steps.',
    },
    offered: {
      title: 'Congratulations! You Received an Offer',
      color: '#22c55e',
      message: 'Amazing news! You\'ve received a job offer. Log in to view the details.',
    },
    rejected: {
      title: 'Application Update',
      color: '#ef4444',
      message: 'We appreciate your interest, but the employer has decided to move forward with other candidates.',
    },
    hired: {
      title: 'Congratulations! You\'re Hired',
      color: '#22c55e',
      message: 'Congratulations on your new position! We wish you all the best in your new role.',
    },
  };

  const statusInfo = statusMessages[data.status] || {
    title: 'Application Status Update',
    color: '#6b7280',
    message: `Your application status has been updated to: ${data.status}`,
  };

  const content = `
    <h1 style="color: ${statusInfo.color}">${statusInfo.title}</h1>
    <p>Hi ${data.candidateName},</p>
    <div class="highlight">
      <p><strong>Job:</strong> ${data.jobTitle}</p>
      <p><strong>Company:</strong> ${data.companyName}</p>
    </div>
    <p>${statusInfo.message}</p>
    ${data.message ? `<p><strong>Message from employer:</strong> ${data.message}</p>` : ''}
    <a href="${APP_URL}/employee/applications" class="button">View Application</a>
  `;

  return sendEmail({
    to,
    subject: `${statusInfo.title} - ${data.jobTitle} at ${data.companyName}`,
    html: baseTemplate(content),
  });
}

export async function sendInterviewInvitationEmail(to: string, data: InterviewInvitationEmailData) {
  const datesHtml = data.proposedDates.map(date => `<li>${date}</li>`).join('');

  const content = `
    <h1>Interview Invitation</h1>
    <p>Hi ${data.candidateName},</p>
    <p>Great news! <strong>${data.companyName}</strong> would like to interview you for the <strong>${data.jobTitle}</strong> position.</p>
    <div class="highlight">
      <h2>Proposed Interview Times</h2>
      <ul>${datesHtml}</ul>
    </div>
    ${data.message ? `<p><strong>Message:</strong> ${data.message}</p>` : ''}
    ${data.expiresAt ? `<p class="muted">Please respond by ${data.expiresAt}</p>` : ''}
    <a href="${APP_URL}/employee/interviews" class="button">Respond to Invitation</a>
    <p class="muted">Log in to accept or propose alternative times.</p>
  `;

  return sendEmail({
    to,
    subject: `Interview Invitation: ${data.jobTitle} at ${data.companyName}`,
    html: baseTemplate(content),
  });
}

export async function sendNewMessageEmail(to: string, data: NewMessageEmailData) {
  const content = `
    <h1>New Message</h1>
    <p>Hi ${data.recipientName},</p>
    <p>You have a new message from <strong>${data.senderName}</strong>${data.companyName ? ` at ${data.companyName}` : ''}:</p>
    <div class="highlight">
      <p>"${data.messagePreview.substring(0, 200)}${data.messagePreview.length > 200 ? '...' : ''}"</p>
    </div>
    <a href="${data.conversationUrl}" class="button">View Message</a>
  `;

  return sendEmail({
    to,
    subject: `New message from ${data.senderName}${data.companyName ? ` at ${data.companyName}` : ''}`,
    html: baseTemplate(content),
  });
}

export async function sendJobAlertEmail(to: string, data: JobAlertEmailData) {
  const jobsHtml = data.jobs.map(job => `
    <div style="padding: 12px; border: 1px solid #eee; border-radius: 6px; margin: 8px 0;">
      <h3 style="margin: 0 0 8px 0;"><a href="${APP_URL}/jobs/${job.id}" style="color: #2563eb; text-decoration: none;">${job.title}</a></h3>
      <p style="margin: 4px 0; color: #666;">${job.company} • ${job.location}</p>
      ${job.salary ? `<p style="margin: 4px 0; color: #22c55e; font-weight: 500;">${job.salary}</p>` : ''}
    </div>
  `).join('');

  const content = `
    <h1>New Jobs Matching Your Preferences</h1>
    <p>Hi ${data.userName},</p>
    <p>We found <strong>${data.jobs.length} new job${data.jobs.length > 1 ? 's' : ''}</strong> that match your saved search criteria:</p>
    ${jobsHtml}
    <a href="${APP_URL}/jobs" class="button">Browse All Jobs</a>
    <p class="muted">You're receiving this because you set up job alerts. <a href="${APP_URL}/employee/settings">Manage your alerts</a></p>
  `;

  return sendEmail({
    to,
    subject: `${data.jobs.length} New Job${data.jobs.length > 1 ? 's' : ''} Matching Your Search`,
    html: baseTemplate(content),
  });
}

export async function sendJobApprovalEmail(to: string, data: JobApprovalEmailData) {
  const statusConfig = {
    approved: {
      title: 'Your Job Has Been Approved!',
      color: '#22c55e',
      message: 'Great news! Your job posting has been approved and is now live on Jobly. Candidates can now view and apply to your position.',
    },
    rejected: {
      title: 'Job Posting Not Approved',
      color: '#ef4444',
      message: 'Unfortunately, your job posting was not approved.',
    },
    changes_requested: {
      title: 'Changes Requested for Your Job Posting',
      color: '#f59e0b',
      message: 'Our team has reviewed your job posting and requested some changes before it can go live.',
    },
  };

  const config = statusConfig[data.status];

  const content = `
    <h1 style="color: ${config.color}">${config.title}</h1>
    <p>Hi ${data.employerName},</p>
    <div class="highlight">
      <p><strong>Job Title:</strong> ${data.jobTitle}</p>
    </div>
    <p>${config.message}</p>
    ${data.reason ? `<div class="highlight"><p><strong>Feedback:</strong> ${data.reason}</p></div>` : ''}
    <a href="${APP_URL}/employer/jobs" class="button">${data.status === 'approved' ? 'View Live Posting' : 'Edit Job Posting'}</a>
  `;

  return sendEmail({
    to,
    subject: `${config.title} - ${data.jobTitle}`,
    html: baseTemplate(content),
  });
}

export async function sendNewApplicationEmail(to: string, data: NewApplicationEmailData) {
  const content = `
    <h1>New Application Received</h1>
    <p>Hi ${data.employerName},</p>
    <p>You have a new application for <strong>${data.jobTitle}</strong>!</p>
    <div class="highlight">
      <p><strong>Candidate:</strong> ${data.candidateName}</p>
      <p><strong>Email:</strong> ${data.candidateEmail}</p>
    </div>
    <a href="${data.applicationUrl}" class="button">Review Application</a>
    <p class="muted">Log in to view the full application and candidate profile.</p>
  `;

  return sendEmail({
    to,
    subject: `New Application: ${data.candidateName} applied for ${data.jobTitle}`,
    html: baseTemplate(content),
  });
}

export async function sendVerificationEmail(to: string, data: { userName: string; verificationUrl: string }) {
  const content = `
    <h1>Verify Your Email</h1>
    <p>Hi ${data.userName},</p>
    <p>Please verify your email address by clicking the button below:</p>
    <a href="${data.verificationUrl}" class="button">Verify Email</a>
    <p class="muted">This link will expire in 24 hours.</p>
    <p class="muted">If you didn't create an account on Jobly, you can safely ignore this email.</p>
  `;

  return sendEmail({
    to,
    subject: 'Verify Your Jobly Email',
    html: baseTemplate(content),
  });
}

export async function send2FACodeEmail(to: string, data: { userName: string; code: string }) {
  const content = `
    <h1>Your Login Code</h1>
    <p>Hi ${data.userName},</p>
    <p>Your two-factor authentication code is:</p>
    <div style="text-align: center; padding: 24px;">
      <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; background: #f0f9ff; padding: 16px 32px; border-radius: 8px;">${data.code}</span>
    </div>
    <p class="muted">This code will expire in 10 minutes.</p>
    <p class="muted">If you didn't request this code, please secure your account immediately.</p>
  `;

  return sendEmail({
    to,
    subject: 'Your Jobly Login Code',
    html: baseTemplate(content),
  });
}

// Export all functions
export const emailService = {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendApplicationStatusEmail,
  sendInterviewInvitationEmail,
  sendNewMessageEmail,
  sendJobAlertEmail,
  sendJobApprovalEmail,
  sendNewApplicationEmail,
  sendVerificationEmail,
  send2FACodeEmail,
};

export default emailService;
