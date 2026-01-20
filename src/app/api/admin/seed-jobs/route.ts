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
  {
    title: 'Data Analyst',
    description: `We are looking for a skilled Data Analyst to join our business intelligence team. You will transform raw data into actionable insights that drive strategic decisions across the organization.

As a Data Analyst, you will work with large datasets, build dashboards, and collaborate with stakeholders to understand their data needs. Your analysis will directly impact product development, marketing strategies, and operational efficiency.

Key Responsibilities:
• Collect, clean, and analyze large datasets from multiple sources
• Build and maintain dashboards and reports using BI tools
• Identify trends, patterns, and anomalies in data
• Collaborate with business teams to understand requirements and deliver insights
• Develop and maintain documentation for data processes
• Present findings to stakeholders in clear, actionable formats
• Support A/B testing and experimentation initiatives
• Ensure data quality and integrity across reporting systems

What We Offer:
• Competitive salary with performance bonuses
• Comprehensive HMO for you and dependents
• Flexible work schedule with remote options
• Learning budget for courses and certifications
• Access to premium data tools and platforms
• Collaborative team environment
• Career growth opportunities in a data-driven company`,
    requirements: `Required Qualifications:
• 2+ years of experience in data analysis or related role
• Proficiency in SQL and Excel/Google Sheets
• Experience with BI tools (Tableau, Power BI, or Looker)
• Strong analytical and problem-solving skills
• Knowledge of basic statistics and data visualization principles
• Excellent communication skills to present data insights
• Bachelor's degree in Statistics, Mathematics, Computer Science, or related field

Nice to Have:
• Experience with Python or R for data analysis
• Knowledge of data warehousing concepts
• Experience with Google Analytics or similar web analytics tools
• Familiarity with machine learning concepts
• Experience in e-commerce or fintech industry`,
    location: 'Makati City, Metro Manila',
    locationType: 'Hybrid',
    salary: '₱50,000 - ₱80,000/month',
    jobType: 'Full-time',
    department: 'Data & Analytics',
  },
  {
    title: 'Human Resources Specialist',
    description: `Join our People & Culture team as an HR Specialist! We're seeking a passionate HR professional to help build and maintain a positive workplace culture while managing core HR functions.

You will be responsible for the full employee lifecycle, from recruitment to offboarding, while ensuring compliance with Philippine labor laws and company policies. This role offers the opportunity to shape our employee experience and organizational culture.

Key Responsibilities:
• Manage end-to-end recruitment process including job postings, screening, and interviews
• Handle employee onboarding and orientation programs
• Administer employee benefits, leave management, and payroll coordination
• Maintain accurate employee records and HR documentation
• Ensure compliance with Philippine labor laws and regulations (DOLE)
• Support employee engagement initiatives and company events
• Handle employee relations and address workplace concerns
• Assist in developing and implementing HR policies and procedures
• Coordinate training and development programs

What We Offer:
• Competitive salary package
• HMO coverage with dental and optical
• Hybrid work arrangement
• Birthday and anniversary leave
• Team building activities and company events
• Professional development opportunities
• Supportive and inclusive work environment`,
    requirements: `Required Qualifications:
• 3+ years of experience in HR generalist or specialist role
• Strong knowledge of Philippine labor laws (Labor Code, DOLE requirements)
• Experience with HRIS systems and MS Office applications
• Excellent interpersonal and communication skills in English and Filipino
• Strong organizational skills and attention to detail
• Ability to handle confidential information with discretion
• Bachelor's degree in Human Resources, Psychology, or related field

Nice to Have:
• HR certifications (CHRP, SHRM-CP)
• Experience with BambooHR, Sprout, or similar HRIS
• Background in tech or startup companies
• Experience in employee engagement and culture building
• Knowledge of compensation and benefits benchmarking`,
    location: 'BGC, Taguig City',
    locationType: 'Hybrid',
    salary: '₱45,000 - ₱65,000/month',
    jobType: 'Full-time',
    department: 'Human Resources',
  },
  {
    title: 'Financial Analyst',
    description: `We are seeking a detail-oriented Financial Analyst to join our Finance team. You will play a key role in financial planning, budgeting, and providing insights that drive business decisions.

As a Financial Analyst, you will analyze financial data, prepare reports, and work closely with leadership to support strategic initiatives. This role offers excellent exposure to business operations and growth opportunities in finance.

Key Responsibilities:
• Prepare monthly, quarterly, and annual financial reports and analysis
• Develop and maintain financial models for forecasting and budgeting
• Analyze revenue, expenses, and profitability trends
• Support the annual budgeting and planning process
• Conduct variance analysis and provide actionable insights
• Prepare presentations for management and stakeholders
• Monitor KPIs and financial metrics across departments
• Assist with ad-hoc financial analysis and special projects

What We Offer:
• Competitive salary with performance bonuses
• Comprehensive HMO coverage
• Hybrid work arrangement (3 days office, 2 days WFH)
• CPA/CFA review assistance program
• Career advancement opportunities
• Modern office in Makati CBD
• Annual performance reviews with salary adjustments`,
    requirements: `Required Qualifications:
• 2-4 years of experience in financial analysis or accounting
• Bachelor's degree in Finance, Accounting, or related field
• Strong proficiency in Excel (pivot tables, VLOOKUP, financial modeling)
• Experience with financial reporting and analysis
• Knowledge of accounting principles (GAAP/PFRS)
• Excellent analytical and problem-solving skills
• Strong attention to detail and accuracy
• Good communication and presentation skills

Nice to Have:
• CPA license or working towards CPA/CFA certification
• Experience with ERP systems (SAP, Oracle, NetSuite)
• Knowledge of Power BI or Tableau for data visualization
• Experience in tech, e-commerce, or fintech industry
• MBA or master's degree in Finance`,
    location: 'Makati City, Metro Manila',
    locationType: 'Hybrid',
    salary: '₱55,000 - ₱85,000/month',
    jobType: 'Full-time',
    department: 'Finance',
  },
  {
    title: 'Operations Manager',
    description: `We are looking for an experienced Operations Manager to oversee and optimize our daily business operations. You will lead a team and ensure smooth, efficient processes across the organization.

As Operations Manager, you will be responsible for developing operational strategies, managing resources, and driving continuous improvement initiatives. This is a leadership role with significant impact on company performance.

Key Responsibilities:
• Oversee daily operations and ensure business objectives are met
• Lead, mentor, and develop a team of operations staff
• Develop and implement operational policies and procedures
• Monitor and analyze operational metrics and KPIs
• Identify opportunities for process improvement and cost reduction
• Manage vendor relationships and negotiate contracts
• Ensure compliance with company policies and regulations
• Coordinate with other departments to align operational activities
• Prepare operational reports for senior management

What We Offer:
• Competitive salary plus performance incentives
• Comprehensive benefits package (HMO, life insurance)
• Company car or car allowance
• Leadership development programs
• Flexible work arrangements
• Annual company retreats
• Stock options for senior roles
• Dynamic and fast-paced work environment`,
    requirements: `Required Qualifications:
• 5+ years of experience in operations management
• Proven track record of leading and developing teams
• Strong knowledge of operations and process improvement methodologies
• Experience with project management and resource allocation
• Excellent leadership and people management skills
• Strong analytical and decision-making abilities
• Bachelor's degree in Business Administration, Operations Management, or related field
• Proficiency in MS Office and operations management software

Nice to Have:
• Six Sigma or Lean certification
• PMP or similar project management certification
• Experience in BPO, logistics, or e-commerce operations
• MBA or master's degree
• Experience with ERP implementation or optimization`,
    location: 'Quezon City, Metro Manila',
    locationType: 'On-site',
    salary: '₱90,000 - ₱130,000/month',
    jobType: 'Full-time',
    department: 'Operations',
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
