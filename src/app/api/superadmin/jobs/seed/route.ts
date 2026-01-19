import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireSuperAdmin, hasPermission } from '@/lib/superadmin-auth';
import { JobApprovalStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

// Sample jobs data for the Philippines job market
const sampleJobs = [
  {
    title: 'Senior Software Engineer',
    description: `We are looking for an experienced Senior Software Engineer to join our growing technology team. You will be responsible for designing and implementing scalable software solutions, mentoring junior developers, and contributing to our technical architecture decisions.

Key Responsibilities:
• Design and develop high-quality software solutions using modern technologies
• Lead code reviews and ensure best practices are followed
• Collaborate with product managers and designers to deliver features
• Mentor junior team members and contribute to their growth
• Participate in architectural decisions and technical planning`,
    requirements: `• 5+ years of experience in software development
• Strong proficiency in JavaScript/TypeScript, React, and Node.js
• Experience with cloud services (AWS, GCP, or Azure)
• Excellent problem-solving and communication skills
• Bachelor's degree in Computer Science or related field`,
    location: 'Makati City, Metro Manila',
    locationType: 'hybrid',
    salary: '₱80,000 - ₱120,000/month',
    jobType: 'Full-time',
    department: 'Technology',
  },
  {
    title: 'Digital Marketing Manager',
    description: `We are seeking a creative and data-driven Digital Marketing Manager to lead our online marketing initiatives. You will develop and execute comprehensive digital marketing strategies to increase brand awareness and drive customer acquisition.

Key Responsibilities:
• Develop and implement digital marketing strategies across multiple channels
• Manage social media presence and content calendar
• Analyze campaign performance and optimize for better results
• Coordinate with creative teams for content creation
• Manage digital advertising budgets and ROI tracking`,
    requirements: `• 3-5 years of experience in digital marketing
• Proven track record of successful marketing campaigns
• Experience with SEO, SEM, and social media marketing
• Strong analytical skills and proficiency in Google Analytics
• Excellent communication and project management skills`,
    location: 'BGC, Taguig City',
    locationType: 'onsite',
    salary: '₱60,000 - ₱90,000/month',
    jobType: 'Full-time',
    department: 'Marketing',
  },
  {
    title: 'Customer Service Representative',
    description: `Join our dynamic customer service team as a Customer Service Representative. You will be the first point of contact for our valued customers, providing exceptional support and ensuring customer satisfaction.

Key Responsibilities:
• Handle customer inquiries via phone, email, and chat
• Resolve customer complaints and issues promptly
• Process orders, returns, and account updates
• Document customer interactions in CRM system
• Identify opportunities to improve customer experience`,
    requirements: `• 1-2 years of customer service experience
• Excellent verbal and written communication skills in English
• Strong problem-solving abilities
• Ability to work in a fast-paced environment
• Computer literate with good typing skills
• Willing to work on shifting schedules`,
    location: 'Ortigas Center, Pasig City',
    locationType: 'onsite',
    salary: '₱18,000 - ₱25,000/month',
    jobType: 'Full-time',
    department: 'Customer Service',
  },
  {
    title: 'Financial Analyst',
    description: `We are looking for a detail-oriented Financial Analyst to join our finance team. You will play a key role in financial planning, analysis, and reporting to support business decision-making.

Key Responsibilities:
• Prepare financial reports, forecasts, and budgets
• Analyze financial data and identify trends
• Support month-end and year-end closing processes
• Develop financial models for business planning
• Collaborate with department heads on budget management`,
    requirements: `• Bachelor's degree in Finance, Accounting, or related field
• 2-4 years of experience in financial analysis
• Strong proficiency in Excel and financial modeling
• Knowledge of accounting principles (GAAP/PFRS)
• CPA license is a plus`,
    location: 'Makati City, Metro Manila',
    locationType: 'hybrid',
    salary: '₱45,000 - ₱65,000/month',
    jobType: 'Full-time',
    department: 'Finance',
  },
  {
    title: 'HR Recruitment Specialist',
    description: `We are seeking a proactive HR Recruitment Specialist to help us build our talented workforce. You will manage the full recruitment cycle and contribute to our employer branding efforts.

Key Responsibilities:
• Source and screen candidates through various channels
• Conduct initial interviews and assessments
• Coordinate with hiring managers on recruitment needs
• Manage job postings and employer branding initiatives
• Maintain recruitment metrics and reports`,
    requirements: `• Bachelor's degree in Psychology, HR, or related field
• 2-3 years of recruitment experience
• Strong networking and sourcing skills
• Excellent interpersonal and communication skills
• Experience with ATS and recruitment tools`,
    location: 'Cebu City, Cebu',
    locationType: 'onsite',
    salary: '₱30,000 - ₱45,000/month',
    jobType: 'Full-time',
    department: 'Human Resources',
  },
  {
    title: 'UI/UX Designer',
    description: `We're looking for a creative UI/UX Designer to create amazing user experiences for our digital products. You will work closely with product and engineering teams to design intuitive interfaces.

Key Responsibilities:
• Design user interfaces for web and mobile applications
• Conduct user research and usability testing
• Create wireframes, prototypes, and high-fidelity designs
• Develop and maintain design systems
• Collaborate with developers for design implementation`,
    requirements: `• 3+ years of experience in UI/UX design
• Proficiency in Figma, Sketch, or Adobe XD
• Strong portfolio demonstrating design process
• Understanding of user-centered design principles
• Knowledge of HTML/CSS is a plus`,
    location: 'Remote - Philippines',
    locationType: 'remote',
    salary: '₱50,000 - ₱80,000/month',
    jobType: 'Full-time',
    department: 'Design',
  },
];

// POST /api/superadmin/jobs/seed - Seed sample jobs
export async function POST(request: NextRequest) {
  const authResult = requireSuperAdmin(request);
  if (authResult instanceof NextResponse) return authResult;
  const { admin } = authResult;

  if (!hasPermission(admin, 'canApproveJobs')) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
  }

  try {
    // Get the first tenant to assign jobs to
    const tenant = await prisma.tenant.findFirst({
      where: { isSuspended: false },
      orderBy: { createdAt: 'desc' },
    });

    if (!tenant) {
      return NextResponse.json(
        { error: 'No company/tenant found. Please create a company first.' },
        { status: 400 }
      );
    }

    // Create sample jobs
    const createdJobs = [];
    for (const jobData of sampleJobs) {
      const job = await prisma.job.create({
        data: {
          ...jobData,
          tenantId: tenant.id,
          isActive: true,
          approvalStatus: JobApprovalStatus.APPROVED,
          approvedAt: new Date(),
          approvedBy: admin.adminId,
        },
      });
      createdJobs.push(job);
    }

    return NextResponse.json({
      success: true,
      message: `Created ${createdJobs.length} sample jobs for ${tenant.name}`,
      jobs: createdJobs.map(j => ({ id: j.id, title: j.title })),
    }, { status: 201 });
  } catch (error) {
    console.error('[SuperAdmin Jobs] Seed error:', error);
    return NextResponse.json(
      { error: 'Failed to seed jobs' },
      { status: 500 }
    );
  }
}
