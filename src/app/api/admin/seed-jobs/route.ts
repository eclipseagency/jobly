import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { JobApprovalStatus } from '@prisma/client';

const jobsData = [
  {
    title: 'Senior Full Stack Developer',
    description: `We are looking for an experienced Senior Full Stack Developer to join our growing tech team in Manila. You will be responsible for designing, developing, and maintaining web applications using modern technologies.

As a Senior Full Stack Developer, you will work closely with product managers, designers, and other engineers to deliver high-quality software solutions. You'll mentor junior developers and contribute to architectural decisions that shape our products.

Key Responsibilities:
• Design and implement scalable web applications using React, Node.js, and PostgreSQL
• Write clean, maintainable, and well-tested code
• Participate in code reviews and provide constructive feedback
• Collaborate with cross-functional teams to define and implement new features
• Optimize applications for maximum speed and scalability
• Mentor junior team members and share knowledge

What We Offer:
• Competitive salary with performance bonuses
• HMO coverage for you and 2 dependents
• Flexible work arrangement (3 days WFH)
• 20 days paid leave + Philippine holidays
• Learning and development budget
• Modern MacBook Pro and equipment`,
    requirements: `Required Qualifications:
• 5+ years of experience in full-stack web development
• Strong proficiency in React.js, TypeScript, and Node.js
• Experience with PostgreSQL or similar relational databases
• Familiarity with cloud services (AWS, GCP, or Azure)
• Experience with Git and CI/CD pipelines
• Excellent problem-solving and communication skills

Nice to Have:
• Experience with Next.js or similar frameworks
• Knowledge of containerization (Docker, Kubernetes)
• Experience leading technical projects
• Contributions to open-source projects`,
    location: 'Makati City, Metro Manila',
    locationType: 'Hybrid',
    salary: '₱120,000 - ₱180,000/month',
    jobType: 'Full-time',
    department: 'Technology',
  },
  {
    title: 'Digital Marketing Manager',
    description: `Join our dynamic marketing team as a Digital Marketing Manager! We're seeking a creative and data-driven professional to lead our digital marketing initiatives and drive brand growth across the Philippines.

You will develop and execute comprehensive digital marketing strategies, manage campaigns across multiple channels, and analyze performance to optimize ROI. This role offers the opportunity to make a significant impact on our company's growth.

Key Responsibilities:
• Develop and implement digital marketing strategies aligned with business goals
• Manage SEO/SEM, social media, email marketing, and paid advertising campaigns
• Analyze campaign performance and provide actionable insights
• Lead and mentor a team of digital marketing specialists
• Collaborate with creative team to produce engaging content
• Manage marketing budget and optimize spend for maximum ROI
• Stay updated on digital marketing trends and best practices

What We Offer:
• Competitive salary package
• Performance-based bonuses
• Comprehensive HMO with dental
• Remote-first work environment
• Annual team retreats
• Professional development opportunities`,
    requirements: `Required Qualifications:
• 4+ years of experience in digital marketing
• Proven track record of successful digital campaigns
• Strong knowledge of Google Analytics, Google Ads, and Facebook Ads Manager
• Experience with SEO tools (SEMrush, Ahrefs, or similar)
• Excellent analytical and project management skills
• Strong written and verbal communication skills in English and Filipino

Nice to Have:
• Google Ads and Analytics certifications
• Experience in e-commerce or SaaS marketing
• Knowledge of marketing automation tools (HubSpot, Mailchimp)
• Basic understanding of HTML/CSS`,
    location: 'BGC, Taguig City',
    locationType: 'Remote',
    salary: '₱80,000 - ₱120,000/month',
    jobType: 'Full-time',
    department: 'Marketing',
  },
  {
    title: 'UI/UX Designer',
    description: `We're looking for a talented UI/UX Designer to create beautiful and intuitive user experiences for our digital products. Join our design team and help shape products used by millions of Filipinos.

As a UI/UX Designer, you will be involved in the entire design process from research and wireframing to creating high-fidelity prototypes and collaborating with developers on implementation.

Key Responsibilities:
• Conduct user research and usability testing
• Create user personas, journey maps, and information architecture
• Design wireframes, mockups, and interactive prototypes
• Develop and maintain design systems and style guides
• Collaborate closely with product managers and developers
• Present design concepts to stakeholders and iterate based on feedback
• Ensure designs are accessible and follow best practices

What We Offer:
• Competitive compensation package
• HMO + life insurance
• Flexible hybrid work setup
• Latest design tools and equipment
• Design conferences and workshop budget
• Collaborative and creative work environment`,
    requirements: `Required Qualifications:
• 3+ years of experience in UI/UX design
• Strong portfolio demonstrating web and mobile design work
• Proficiency in Figma (required) and other design tools
• Experience with design systems and component libraries
• Understanding of user-centered design principles
• Knowledge of accessibility standards (WCAG)
• Excellent communication and presentation skills

Nice to Have:
• Experience with motion design and micro-interactions
• Basic knowledge of HTML, CSS, and front-end frameworks
• Experience with user research methodologies
• Illustration or graphic design skills`,
    location: 'Cebu City, Cebu',
    locationType: 'Hybrid',
    salary: '₱60,000 - ₱90,000/month',
    jobType: 'Full-time',
    department: 'Design',
  },
  {
    title: 'Customer Success Manager',
    description: `We are seeking a passionate Customer Success Manager to join our team and help our clients achieve their business goals. You will be the primary point of contact for our enterprise customers, ensuring they get maximum value from our products and services.

As a Customer Success Manager, you will build strong relationships with clients, understand their needs, and proactively identify opportunities for growth and improvement. You'll work closely with sales, product, and support teams to deliver exceptional customer experiences.

Key Responsibilities:
• Manage a portfolio of enterprise accounts and serve as their trusted advisor
• Conduct regular business reviews and health checks with customers
• Develop and execute customer success plans aligned with client objectives
• Monitor customer health metrics and proactively address at-risk accounts
• Identify upsell and cross-sell opportunities within existing accounts
• Gather customer feedback and advocate for product improvements
• Coordinate with internal teams to resolve customer issues promptly
• Drive customer adoption, retention, and expansion

What We Offer:
• Competitive base salary plus performance bonuses
• Comprehensive HMO coverage for you and dependents
• Hybrid work arrangement (2 days in office)
• Career growth opportunities in a fast-growing company
• Regular team events and company outings
• Professional development and training programs
• Transportation and meal allowances`,
    requirements: `Required Qualifications:
• 3+ years of experience in customer success, account management, or related roles
• Excellent communication and interpersonal skills in English and Filipino
• Strong problem-solving abilities and customer-centric mindset
• Experience with CRM tools (Salesforce, HubSpot, or similar)
• Ability to manage multiple accounts and priorities simultaneously
• Bachelor's degree in Business, Communications, or related field
• Proven track record of meeting retention and growth targets

Nice to Have:
• Experience in SaaS or technology industry
• Knowledge of customer success platforms (Gainsight, ChurnZero)
• Project management certification or experience
• Experience with data analysis and reporting tools`,
    location: 'Ortigas Center, Pasig City',
    locationType: 'Hybrid',
    salary: '₱70,000 - ₱100,000/month',
    jobType: 'Full-time',
    department: 'Customer Success',
  },
];

export async function POST(request: Request) {
  try {
    // Simple secret key check for security
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');

    if (secret !== 'jobly-seed-2024') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all existing jobs
    const existingJobs = await prisma.job.findMany({
      orderBy: { createdAt: 'asc' },
    });

    if (existingJobs.length === 0) {
      return NextResponse.json({
        error: 'No existing jobs found. Please create jobs first through the employer dashboard.'
      }, { status: 404 });
    }

    const updatedJobs = [];
    const createdJobs = [];

    // Get tenant ID from first existing job for creating new jobs
    const tenantId = existingJobs[0].tenantId;

    // Update existing jobs with new data
    for (let i = 0; i < Math.min(existingJobs.length, jobsData.length); i++) {
      const job = existingJobs[i];
      const newData = jobsData[i];

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
        },
      });

      updatedJobs.push({ id: updated.id, title: updated.title });
    }

    // Create new jobs if there are more data entries than existing jobs
    for (let i = existingJobs.length; i < jobsData.length; i++) {
      const newData = jobsData[i];

      const created = await prisma.job.create({
        data: {
          tenantId: tenantId,
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
        },
      });

      createdJobs.push({ id: created.id, title: created.title });
    }

    return NextResponse.json({
      success: true,
      message: `Updated ${updatedJobs.length} jobs, created ${createdJobs.length} new jobs`,
      updatedJobs,
      createdJobs
    });
  } catch (error) {
    console.error('Error updating jobs:', error);
    return NextResponse.json({ error: 'Failed to update jobs' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST request with ?secret=jobly-seed-2024 to update jobs'
  });
}
