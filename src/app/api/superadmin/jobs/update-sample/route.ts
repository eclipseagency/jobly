import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireSuperAdmin, hasPermission } from '@/lib/superadmin-auth';
import { JobApprovalStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

// Better job data for existing jobs
const betterJobData = [
  {
    title: 'Full Stack Developer',
    description: `Join our innovative tech team as a Full Stack Developer! We're building the next generation of digital products that impact millions of users across the Philippines.

**About the Role:**
You'll work on exciting projects using modern technologies, collaborating with talented designers and product managers to create exceptional user experiences.

**What You'll Do:**
• Build and maintain web applications using React, Node.js, and TypeScript
• Design and implement RESTful APIs and database schemas
• Write clean, maintainable, and well-tested code
• Participate in code reviews and technical discussions
• Deploy and monitor applications on cloud infrastructure
• Collaborate with cross-functional teams in an Agile environment

**Why Join Us:**
• Work on products used by millions of Filipinos
• Competitive salary with performance bonuses
• HMO coverage for you and 2 dependents
• Flexible work arrangements
• Learning and development budget
• Free snacks and coffee in the office`,
    requirements: `**Must Have:**
• 3+ years of experience in full stack development
• Strong proficiency in JavaScript/TypeScript
• Experience with React.js and Node.js
• Familiarity with SQL and NoSQL databases
• Understanding of RESTful API design
• Good problem-solving skills

**Nice to Have:**
• Experience with Next.js or similar frameworks
• Knowledge of AWS, GCP, or Azure
• Familiarity with Docker and CI/CD pipelines
• Experience with Agile/Scrum methodologies

**Education:**
• Bachelor's degree in Computer Science, IT, or related field
• Or equivalent practical experience`,
    location: 'Makati City, Metro Manila',
    locationType: 'hybrid',
    salary: '₱70,000 - ₱100,000/month',
    jobType: 'Full-time',
    department: 'Technology',
  },
  {
    title: 'Marketing Specialist',
    description: `We're looking for a creative and data-driven Marketing Specialist to join our growing marketing team. Help us build brand awareness and drive customer acquisition for our expanding business.

**About the Role:**
You'll be responsible for executing marketing campaigns across multiple channels, analyzing performance metrics, and contributing creative ideas to our marketing strategy.

**What You'll Do:**
• Plan and execute digital marketing campaigns (social media, email, paid ads)
• Create engaging content for various platforms
• Manage and grow our social media presence
• Track and analyze campaign performance using analytics tools
• Collaborate with the design team on marketing materials
• Support event planning and brand activations
• Monitor industry trends and competitor activities

**What We Offer:**
• Competitive compensation package
• Health insurance (HMO) with dental
• 15 days vacation leave + 10 sick leaves
• Monthly team activities and outings
• Career growth opportunities
• Modern office in BGC with free parking`,
    requirements: `**Qualifications:**
• 2-4 years of experience in marketing
• Bachelor's degree in Marketing, Communications, or related field
• Experience with social media management and advertising
• Proficiency in Google Analytics and social media analytics
• Strong written and verbal communication skills
• Creative mindset with attention to detail
• Can work independently and in a team

**Skills:**
• Social media marketing (Facebook, Instagram, LinkedIn, TikTok)
• Content creation and copywriting
• Basic graphic design (Canva, Adobe tools)
• Email marketing platforms (Mailchimp, etc.)
• Google Ads and Meta Ads experience is a plus`,
    location: 'BGC, Taguig City',
    locationType: 'onsite',
    salary: '₱35,000 - ₱50,000/month',
    jobType: 'Full-time',
    department: 'Marketing',
  },
  {
    title: 'Customer Success Manager',
    description: `Be the voice of our customers! We're seeking a passionate Customer Success Manager to ensure our clients achieve their goals using our platform.

**About the Role:**
As a Customer Success Manager, you'll build strong relationships with our clients, understand their needs, and help them maximize the value they get from our products.

**What You'll Do:**
• Manage a portfolio of key accounts and build lasting relationships
• Onboard new clients and ensure smooth product adoption
• Conduct regular check-ins and business reviews with clients
• Identify upsell and cross-sell opportunities
• Gather customer feedback and communicate with product team
• Create training materials and conduct product demos
• Resolve escalated customer issues promptly
• Track customer health metrics and reduce churn

**Perks & Benefits:**
• Base salary + performance incentives
• Comprehensive HMO for employee and dependents
• Work from home options (2 days/week)
• Professional development allowance
• Team bonding activities
• Retirement benefit plan`,
    requirements: `**Requirements:**
• 3+ years in customer success, account management, or related role
• Excellent communication and presentation skills
• Strong problem-solving abilities
• Experience with CRM tools (Salesforce, HubSpot, etc.)
• Ability to manage multiple accounts simultaneously
• Customer-centric mindset
• Bachelor's degree in Business, Communications, or related field

**Preferred:**
• Experience in SaaS or tech industry
• Knowledge of customer success metrics (NPS, CSAT, etc.)
• Project management skills
• Experience conducting training sessions`,
    location: 'Ortigas Center, Pasig City',
    locationType: 'hybrid',
    salary: '₱45,000 - ₱65,000/month',
    jobType: 'Full-time',
    department: 'Customer Service',
  },
];

// POST /api/superadmin/jobs/update-sample - Update existing jobs with better data
export async function POST(request: NextRequest) {
  const authResult = requireSuperAdmin(request);
  if (authResult instanceof NextResponse) return authResult;
  const { admin } = authResult;

  if (!hasPermission(admin, 'canApproveJobs')) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
  }

  try {
    // Get existing jobs
    const existingJobs = await prisma.job.findMany({
      take: 3,
      orderBy: { createdAt: 'asc' },
    });

    if (existingJobs.length === 0) {
      return NextResponse.json(
        { error: 'No jobs found to update. Please create some jobs first.' },
        { status: 400 }
      );
    }

    // Update each job with better data
    const updatedJobs = [];
    for (let i = 0; i < Math.min(existingJobs.length, betterJobData.length); i++) {
      const job = existingJobs[i];
      const newData = betterJobData[i];

      const updated = await prisma.job.update({
        where: { id: job.id },
        data: {
          title: newData.title,
          description: newData.description,
          requirements: newData.requirements,
          location: newData.location,
          locationType: newData.locationType,
          salary: newData.salary,
          jobType: newData.jobType,
          department: newData.department,
          isActive: true,
          approvalStatus: JobApprovalStatus.APPROVED,
          approvedAt: new Date(),
          approvedBy: admin.adminId,
          expiresAt: null, // Remove expiry
        },
      });
      updatedJobs.push(updated);
    }

    return NextResponse.json({
      success: true,
      message: `Updated ${updatedJobs.length} jobs with better data`,
      jobs: updatedJobs.map(j => ({ id: j.id, title: j.title })),
    });
  } catch (error) {
    console.error('[SuperAdmin Jobs] Update sample error:', error);
    return NextResponse.json(
      { error: 'Failed to update jobs' },
      { status: 500 }
    );
  }
}
