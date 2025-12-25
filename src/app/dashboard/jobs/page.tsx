'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { LocationDropdown } from '@/components/ui/LocationDropdown';

const jobs = [
  {
    id: '1',
    title: 'Senior Frontend Developer',
    company: 'Accenture Philippines',
    companyLogo: 'AC',
    location: 'BGC, Taguig',
    type: 'Full-time',
    workSetup: 'Hybrid',
    salaryMin: 120000,
    salaryMax: 180000,
    posted: '2 hours ago',
    applicants: 24,
    description: 'We are looking for a Senior Frontend Developer to join our digital transformation team. You will lead the development of enterprise web applications for our Fortune 500 clients.',
    responsibilities: [
      'Lead frontend architecture decisions and code reviews',
      'Build responsive, performant web applications using React and TypeScript',
      'Mentor junior developers and establish best practices',
      'Collaborate with UX designers and backend engineers',
      'Optimize applications for maximum speed and scalability',
    ],
    requirements: [
      '5+ years of experience in frontend development',
      'Expert knowledge of React, TypeScript, and modern CSS',
      'Experience with state management (Redux, Zustand)',
      'Strong understanding of web performance optimization',
      'Excellent communication and leadership skills',
    ],
    benefits: ['HMO with 3 dependents', 'Life Insurance', 'Performance Bonus', 'Hybrid Work Setup', 'Learning & Development Budget'],
    skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'GraphQL'],
    experience: 'Senior',
  },
  {
    id: '2',
    title: 'Product Designer',
    company: 'Canva Philippines',
    companyLogo: 'CA',
    location: 'Makati City',
    type: 'Full-time',
    workSetup: 'Hybrid',
    salaryMin: 90000,
    salaryMax: 140000,
    posted: '5 hours ago',
    applicants: 67,
    description: 'Join Canva\'s design team to create intuitive and delightful user experiences that empower millions of users worldwide to create beautiful designs.',
    responsibilities: [
      'Design end-to-end user experiences for web and mobile',
      'Create wireframes, prototypes, and high-fidelity mockups',
      'Conduct user research and usability testing',
      'Collaborate with product managers and engineers',
      'Contribute to and maintain our design system',
    ],
    requirements: [
      '4+ years of product design experience',
      'Strong portfolio showcasing UX/UI projects',
      'Proficiency in Figma and prototyping tools',
      'Experience with design systems',
      'Data-driven design approach',
    ],
    benefits: ['HMO', 'Stock Options', 'Flexible Hours', 'Home Office Stipend', 'Wellness Allowance'],
    skills: ['Figma', 'UI/UX Design', 'Prototyping', 'User Research', 'Design Systems'],
    experience: 'Mid',
  },
  {
    id: '3',
    title: 'Full Stack Engineer',
    company: 'GCash (Mynt)',
    companyLogo: 'GC',
    location: 'BGC, Taguig',
    type: 'Full-time',
    workSetup: 'Hybrid',
    salaryMin: 100000,
    salaryMax: 160000,
    posted: '1 day ago',
    applicants: 89,
    description: 'Build and scale the Philippines\' leading mobile wallet platform used by over 80 million Filipinos. Work on high-impact features that drive financial inclusion.',
    responsibilities: [
      'Develop and maintain microservices architecture',
      'Build APIs that handle millions of transactions daily',
      'Implement security best practices for financial systems',
      'Optimize database queries and system performance',
      'Participate in on-call rotation and incident response',
    ],
    requirements: [
      '4+ years of full stack development experience',
      'Strong proficiency in Node.js, Python, or Java',
      'Experience with React or Vue.js',
      'Knowledge of SQL and NoSQL databases',
      'Understanding of fintech or payment systems is a plus',
    ],
    benefits: ['HMO + Dental', 'Performance Bonus', '14th Month Pay', 'Stock Options', 'Free GCash Credits'],
    skills: ['Node.js', 'React', 'PostgreSQL', 'Redis', 'Kubernetes'],
    experience: 'Mid',
  },
  {
    id: '4',
    title: 'Data Scientist',
    company: 'Thinking Machines',
    companyLogo: 'TM',
    location: 'Remote',
    type: 'Full-time',
    workSetup: 'Remote',
    salaryMin: 80000,
    salaryMax: 130000,
    posted: '2 days ago',
    applicants: 43,
    description: 'Apply machine learning and data science to solve complex business problems for leading companies in Southeast Asia.',
    responsibilities: [
      'Develop and deploy machine learning models',
      'Analyze large datasets to derive actionable insights',
      'Build data pipelines and ETL processes',
      'Present findings to stakeholders and clients',
      'Stay current with latest ML/AI research',
    ],
    requirements: [
      '3+ years of data science experience',
      'Strong Python skills (pandas, scikit-learn, TensorFlow)',
      'Experience with SQL and data visualization',
      'Masters or PhD in relevant field preferred',
      'Excellent problem-solving abilities',
    ],
    benefits: ['Fully Remote', 'HMO', 'Learning Budget', 'Flexible Schedule', 'Annual Retreat'],
    skills: ['Python', 'Machine Learning', 'SQL', 'TensorFlow', 'Data Visualization'],
    experience: 'Mid',
  },
  {
    id: '5',
    title: 'DevOps Engineer',
    company: 'Kumu',
    companyLogo: 'KU',
    location: 'Makati City',
    type: 'Full-time',
    workSetup: 'Hybrid',
    salaryMin: 90000,
    salaryMax: 150000,
    posted: '3 days ago',
    applicants: 31,
    description: 'Scale the infrastructure powering the Philippines\' fastest-growing live streaming platform with millions of active users.',
    responsibilities: [
      'Design and maintain cloud infrastructure on AWS',
      'Implement CI/CD pipelines for rapid deployment',
      'Monitor system performance and respond to incidents',
      'Automate infrastructure provisioning with Terraform',
      'Ensure 99.99% uptime for live streaming services',
    ],
    requirements: [
      '4+ years of DevOps/SRE experience',
      'Strong experience with AWS services',
      'Proficiency in Docker and Kubernetes',
      'Experience with infrastructure as code',
      'Strong scripting skills (Bash, Python)',
    ],
    benefits: ['HMO', 'Stock Options', 'Hybrid Work', 'Tech Allowance', 'Free Kumu Diamonds'],
    skills: ['AWS', 'Kubernetes', 'Docker', 'Terraform', 'CI/CD'],
    experience: 'Senior',
  },
  {
    id: '6',
    title: 'Mobile Developer (React Native)',
    company: 'PayMaya',
    companyLogo: 'PM',
    location: 'BGC, Taguig',
    type: 'Full-time',
    workSetup: 'Hybrid',
    salaryMin: 80000,
    salaryMax: 130000,
    posted: '3 days ago',
    applicants: 52,
    description: 'Build and enhance the Maya super app experience used by millions of Filipinos for payments, investments, and financial services.',
    responsibilities: [
      'Develop new features for iOS and Android apps',
      'Optimize app performance and reduce load times',
      'Implement secure payment flows and biometric auth',
      'Write unit and integration tests',
      'Collaborate with backend teams on API design',
    ],
    requirements: [
      '3+ years of React Native experience',
      'Published apps on App Store and Google Play',
      'Experience with native modules (iOS/Android)',
      'Knowledge of mobile security best practices',
      'Familiarity with fintech applications',
    ],
    benefits: ['HMO with dependents', 'Life Insurance', '15 days VL', 'Performance Bonus', 'Maya Credits'],
    skills: ['React Native', 'TypeScript', 'iOS', 'Android', 'Redux'],
    experience: 'Mid',
  },
  {
    id: '7',
    title: 'Backend Engineer (Python)',
    company: 'Shopee Philippines',
    companyLogo: 'SP',
    location: 'BGC, Taguig',
    type: 'Full-time',
    workSetup: 'On-site',
    salaryMin: 85000,
    salaryMax: 140000,
    posted: '4 days ago',
    applicants: 78,
    description: 'Join Southeast Asia\'s leading e-commerce platform and build scalable backend systems handling millions of orders daily.',
    responsibilities: [
      'Design and implement RESTful APIs and microservices',
      'Optimize database performance for high-traffic scenarios',
      'Build real-time order processing systems',
      'Implement caching strategies for improved performance',
      'Conduct code reviews and mentor junior engineers',
    ],
    requirements: [
      '3+ years of backend development with Python',
      'Experience with Django or FastAPI',
      'Strong SQL and database design skills',
      'Knowledge of message queues (Kafka, RabbitMQ)',
      'E-commerce experience is a plus',
    ],
    benefits: ['HMO', 'Meal Allowance', 'Transportation Allowance', 'Shopee Vouchers', '13th Month Pay'],
    skills: ['Python', 'Django', 'PostgreSQL', 'Redis', 'Kafka'],
    experience: 'Mid',
  },
  {
    id: '8',
    title: 'QA Automation Engineer',
    company: 'Concentrix',
    companyLogo: 'CX',
    location: 'Cebu City',
    type: 'Full-time',
    workSetup: 'Hybrid',
    salaryMin: 50000,
    salaryMax: 80000,
    posted: '4 days ago',
    applicants: 36,
    description: 'Ensure quality delivery for our enterprise clients by building robust test automation frameworks and processes.',
    responsibilities: [
      'Design and maintain automated test suites',
      'Develop test strategies for web and mobile apps',
      'Set up CI/CD integration for automated testing',
      'Identify and report bugs with detailed documentation',
      'Collaborate with developers to improve code quality',
    ],
    requirements: [
      '2+ years of QA automation experience',
      'Proficiency in Selenium, Cypress, or Playwright',
      'Experience with API testing (Postman, RestAssured)',
      'Knowledge of testing methodologies and best practices',
      'ISTQB certification is a plus',
    ],
    benefits: ['HMO', 'Night Differential', 'Performance Bonus', 'Career Growth', 'Training Programs'],
    skills: ['Selenium', 'Cypress', 'JavaScript', 'API Testing', 'CI/CD'],
    experience: 'Mid',
  },
  {
    id: '9',
    title: 'Technical Project Manager',
    company: 'Globe Telecom',
    companyLogo: 'GL',
    location: 'BGC, Taguig',
    type: 'Full-time',
    workSetup: 'Hybrid',
    salaryMin: 100000,
    salaryMax: 150000,
    posted: '5 days ago',
    applicants: 29,
    description: 'Lead digital transformation projects for one of the Philippines\' largest telecommunications companies.',
    responsibilities: [
      'Manage end-to-end delivery of technical projects',
      'Coordinate cross-functional teams of 10-20 people',
      'Define project scope, timelines, and budgets',
      'Identify and mitigate project risks',
      'Report progress to executive stakeholders',
    ],
    requirements: [
      '5+ years of technical project management',
      'PMP or Agile certification preferred',
      'Strong understanding of software development lifecycle',
      'Excellent communication and leadership skills',
      'Experience in telecom or tech industry',
    ],
    benefits: ['HMO with 4 dependents', 'Company Car', 'Globe Plan', 'Stock Options', 'Executive Training'],
    skills: ['Project Management', 'Agile', 'Scrum', 'JIRA', 'Stakeholder Management'],
    experience: 'Senior',
  },
  {
    id: '10',
    title: 'Junior Software Developer',
    company: 'Exist Software Labs',
    companyLogo: 'EX',
    location: 'Ortigas, Pasig',
    type: 'Full-time',
    workSetup: 'Hybrid',
    salaryMin: 35000,
    salaryMax: 50000,
    posted: '5 days ago',
    applicants: 124,
    description: 'Start your career with one of the Philippines\' premier software companies. Work on exciting projects while learning from industry experts.',
    responsibilities: [
      'Develop features under senior developer guidance',
      'Write clean, maintainable code following standards',
      'Participate in code reviews and team meetings',
      'Learn and apply best practices in software development',
      'Contribute to technical documentation',
    ],
    requirements: [
      'Fresh graduate or 1 year of experience',
      'Degree in Computer Science or related field',
      'Basic knowledge of Java, Python, or JavaScript',
      'Eagerness to learn and grow',
      'Good communication skills',
    ],
    benefits: ['HMO', 'Training Programs', 'Mentorship', 'Team Events', '13th Month Pay'],
    skills: ['Java', 'JavaScript', 'SQL', 'Git', 'Agile'],
    experience: 'Entry',
  },
  {
    id: '11',
    title: 'Cloud Solutions Architect',
    company: 'IBM Philippines',
    companyLogo: 'IB',
    location: 'Makati City',
    type: 'Full-time',
    workSetup: 'Hybrid',
    salaryMin: 150000,
    salaryMax: 220000,
    posted: '6 days ago',
    applicants: 18,
    description: 'Design and implement enterprise cloud solutions for major corporations across APAC using IBM Cloud and hybrid multi-cloud strategies.',
    responsibilities: [
      'Architect cloud solutions for enterprise clients',
      'Lead technical discussions and workshops',
      'Create technical proposals and architecture documents',
      'Provide guidance on cloud migration strategies',
      'Stay current with cloud technologies and certifications',
    ],
    requirements: [
      '7+ years of IT experience with 3+ in cloud',
      'AWS, Azure, or GCP certifications',
      'Experience with hybrid and multi-cloud architectures',
      'Strong presentation and consulting skills',
      'Pre-sales experience is a plus',
    ],
    benefits: ['HMO', 'Company Stock', 'Certification Budget', 'Flexible Work', 'Global Mobility'],
    skills: ['AWS', 'Azure', 'Cloud Architecture', 'Kubernetes', 'Enterprise Solutions'],
    experience: 'Lead',
  },
  {
    id: '12',
    title: 'Cybersecurity Analyst',
    company: 'BDO Unibank',
    companyLogo: 'BD',
    location: 'Makati City',
    type: 'Full-time',
    workSetup: 'On-site',
    salaryMin: 70000,
    salaryMax: 110000,
    posted: '1 week ago',
    applicants: 41,
    description: 'Protect the Philippines\' largest bank from cyber threats. Join our security operations team to safeguard millions of customers.',
    responsibilities: [
      'Monitor security events and respond to incidents',
      'Conduct vulnerability assessments and penetration testing',
      'Analyze malware and investigate security breaches',
      'Implement security controls and policies',
      'Provide security awareness training',
    ],
    requirements: [
      '3+ years in cybersecurity or IT security',
      'Security certifications (CEH, CISSP, CompTIA Security+)',
      'Experience with SIEM tools and security operations',
      'Knowledge of banking security regulations',
      'Strong analytical and problem-solving skills',
    ],
    benefits: ['HMO', 'Life Insurance', 'Rice Subsidy', 'Retirement Plan', 'Banking Benefits'],
    skills: ['SIEM', 'Penetration Testing', 'Incident Response', 'Network Security', 'Compliance'],
    experience: 'Mid',
  },
  {
    id: '13',
    title: 'UI Developer',
    company: 'Angkas',
    companyLogo: 'AN',
    location: 'BGC, Taguig',
    type: 'Full-time',
    workSetup: 'Hybrid',
    salaryMin: 60000,
    salaryMax: 90000,
    posted: '1 week ago',
    applicants: 55,
    description: 'Build the rider and driver interfaces for the Philippines\' leading motorcycle ride-hailing platform.',
    responsibilities: [
      'Implement responsive web interfaces using React',
      'Collaborate with designers to ensure pixel-perfect implementation',
      'Optimize for mobile-first experiences',
      'Build reusable component libraries',
      'Ensure accessibility and cross-browser compatibility',
    ],
    requirements: [
      '2+ years of frontend development experience',
      'Strong HTML, CSS, and JavaScript skills',
      'Experience with React and modern frontend tools',
      'Eye for design and attention to detail',
      'Portfolio showcasing UI work',
    ],
    benefits: ['HMO', 'Free Angkas Rides', 'Flexible Schedule', 'Team Outings', 'Stock Options'],
    skills: ['React', 'CSS', 'JavaScript', 'HTML5', 'Responsive Design'],
    experience: 'Mid',
  },
  {
    id: '14',
    title: 'Technical Support Engineer',
    company: 'Zendesk Manila',
    companyLogo: 'ZD',
    location: 'Makati City',
    type: 'Full-time',
    workSetup: 'Hybrid',
    salaryMin: 45000,
    salaryMax: 70000,
    posted: '1 week ago',
    applicants: 82,
    description: 'Provide world-class technical support to Zendesk customers globally. Troubleshoot issues and help customers succeed with our platform.',
    responsibilities: [
      'Respond to customer technical inquiries',
      'Troubleshoot API integrations and configurations',
      'Document solutions and contribute to knowledge base',
      'Escalate complex issues to engineering teams',
      'Provide feedback on product improvements',
    ],
    requirements: [
      '1-2 years of technical support experience',
      'Basic understanding of APIs and web technologies',
      'Excellent English communication skills',
      'Customer-focused mindset',
      'Willingness to work in shifts',
    ],
    benefits: ['HMO', 'Shift Allowance', 'Stock Options', 'Zendesk Academy', 'Career Growth'],
    skills: ['Technical Support', 'API', 'Troubleshooting', 'Customer Service', 'Documentation'],
    experience: 'Entry',
  },
  {
    id: '15',
    title: 'Engineering Manager',
    company: 'Grab Philippines',
    companyLogo: 'GR',
    location: 'BGC, Taguig',
    type: 'Full-time',
    workSetup: 'Hybrid',
    salaryMin: 180000,
    salaryMax: 280000,
    posted: '1 week ago',
    applicants: 12,
    description: 'Lead a team of engineers building the super app that serves millions of users across Southeast Asia for rides, food, deliveries, and payments.',
    responsibilities: [
      'Manage and mentor a team of 8-12 engineers',
      'Set technical direction and engineering standards',
      'Drive hiring and team growth',
      'Partner with product managers on roadmap planning',
      'Ensure team delivery and quality metrics',
    ],
    requirements: [
      '8+ years of software engineering experience',
      '3+ years in engineering management',
      'Track record of building and scaling teams',
      'Strong technical background in backend or mobile',
      'Experience with high-scale consumer applications',
    ],
    benefits: ['HMO with 5 dependents', 'Stock Options', 'Grab Credits', 'Leadership Training', 'Global Mobility'],
    skills: ['Engineering Leadership', 'Team Management', 'System Design', 'Agile', 'Hiring'],
    experience: 'Lead',
  },
];

type Job = typeof jobs[0];

const formatSalary = (min: number, max: number) => {
  const formatNum = (n: number) => {
    if (n >= 1000) return `₱${(n / 1000).toFixed(0)}k`;
    return `₱${n}`;
  };
  return `${formatNum(min)} - ${formatNum(max)}/mo`;
};

function FindJobsContent() {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 10;

  // Read query params on initial load
  useEffect(() => {
    const q = searchParams.get('q');
    const location = searchParams.get('location');
    if (q) setSearchQuery(q);
    if (location) setLocationQuery(location);
  }, [searchParams]);

  const [filters, setFilters] = useState({
    jobType: [] as string[],
    experience: [] as string[],
    workSetup: [] as string[],
    salaryRange: '',
  });

  const toggleFilter = (category: keyof typeof filters, value: string) => {
    if (category === 'salaryRange') {
      setFilters({ ...filters, salaryRange: filters.salaryRange === value ? '' : value });
    } else {
      const current = filters[category] as string[];
      if (current.includes(value)) {
        setFilters({ ...filters, [category]: current.filter(v => v !== value) });
      } else {
        setFilters({ ...filters, [category]: [...current, value] });
      }
    }
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({ jobType: [], experience: [], workSetup: [], salaryRange: '' });
    setCurrentPage(1);
  };

  const activeFilterCount = filters.jobType.length + filters.experience.length + filters.workSetup.length + (filters.salaryRange ? 1 : 0);

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = !searchQuery ||
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesLocation = !locationQuery || job.location.toLowerCase().includes(locationQuery.toLowerCase());
    const matchesJobType = filters.jobType.length === 0 || filters.jobType.includes(job.type);
    const matchesExperience = filters.experience.length === 0 || filters.experience.includes(job.experience);
    const matchesWorkSetup = filters.workSetup.length === 0 || filters.workSetup.includes(job.workSetup);

    let matchesSalary = true;
    if (filters.salaryRange) {
      const ranges: Record<string, [number, number]> = {
        '30-50': [30000, 50000],
        '50-80': [50000, 80000],
        '80-120': [80000, 120000],
        '120-180': [120000, 180000],
        '180+': [180000, Infinity],
      };
      const [min, max] = ranges[filters.salaryRange] || [0, Infinity];
      matchesSalary = job.salaryMin >= min || job.salaryMax <= max;
    }

    return matchesSearch && matchesLocation && matchesJobType && matchesExperience && matchesWorkSetup && matchesSalary;
  }).sort((a, b) => {
    if (sortBy === 'newest') return 0; // Already sorted by recency in data
    if (sortBy === 'salary') return b.salaryMax - a.salaryMax;
    return 0;
  });

  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
  const paginatedJobs = filteredJobs.slice((currentPage - 1) * jobsPerPage, currentPage * jobsPerPage);

  const toggleSaveJob = (jobId: string) => {
    setSavedJobs(prev => prev.includes(jobId) ? prev.filter(id => id !== jobId) : [...prev, jobId]);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/">
                <Image src="/logo.svg" alt="Jobly" width={90} height={25} priority />
              </Link>
              <nav className="hidden md:flex items-center gap-6">
                <Link href="/dashboard/jobs" className="text-sm font-medium text-primary-600">Find Jobs</Link>
                <Link href="/dashboard" className="text-sm font-medium text-slate-600 hover:text-slate-900">Dashboard</Link>
                <Link href="/dashboard/applications" className="text-sm font-medium text-slate-600 hover:text-slate-900">Applications</Link>
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <button className="hidden sm:flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
              <Link href="/dashboard/profile" className="w-9 h-9 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-sm font-medium">
                JS
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Search Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Job title, company, or keywords"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border-0 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <LocationDropdown
              value={locationQuery}
              onChange={(value) => { setLocationQuery(value); setCurrentPage(1); }}
              placeholder="Select location"
              className="flex-1 lg:max-w-xs"
            />
            <button className="px-8 py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors shrink-0">
              Search Jobs
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <aside className={`lg:w-64 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-xl border border-slate-200 p-5 sticky top-24">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-semibold text-slate-900">Filters</h2>
                {activeFilterCount > 0 && (
                  <button onClick={clearFilters} className="text-sm text-primary-600 hover:text-primary-700">
                    Clear ({activeFilterCount})
                  </button>
                )}
              </div>

              {/* Job Type */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-slate-900 mb-3">Employment Type</h3>
                <div className="space-y-2.5">
                  {['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship'].map((type) => (
                    <label key={type} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={filters.jobType.includes(type)}
                        onChange={() => toggleFilter('jobType', type)}
                        className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-slate-600 group-hover:text-slate-900">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Experience Level */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-slate-900 mb-3">Experience Level</h3>
                <div className="space-y-2.5">
                  {[
                    { value: 'Entry', label: 'Entry Level (0-2 yrs)' },
                    { value: 'Mid', label: 'Mid Level (2-5 yrs)' },
                    { value: 'Senior', label: 'Senior (5-8 yrs)' },
                    { value: 'Lead', label: 'Lead/Manager (8+ yrs)' },
                  ].map((level) => (
                    <label key={level.value} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={filters.experience.includes(level.value)}
                        onChange={() => toggleFilter('experience', level.value)}
                        className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-slate-600 group-hover:text-slate-900">{level.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Work Setup */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-slate-900 mb-3">Work Setup</h3>
                <div className="space-y-2.5">
                  {['On-site', 'Hybrid', 'Remote'].map((setup) => (
                    <label key={setup} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={filters.workSetup.includes(setup)}
                        onChange={() => toggleFilter('workSetup', setup)}
                        className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-slate-600 group-hover:text-slate-900">{setup}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Salary Range */}
              <div>
                <h3 className="text-sm font-medium text-slate-900 mb-3">Salary Range</h3>
                <div className="space-y-2.5">
                  {[
                    { value: '30-50', label: '₱30k - ₱50k' },
                    { value: '50-80', label: '₱50k - ₱80k' },
                    { value: '80-120', label: '₱80k - ₱120k' },
                    { value: '120-180', label: '₱120k - ₱180k' },
                    { value: '180+', label: '₱180k+' },
                  ].map((range) => (
                    <label key={range.value} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="radio"
                        name="salaryRange"
                        checked={filters.salaryRange === range.value}
                        onChange={() => toggleFilter('salaryRange', range.value)}
                        className="w-4 h-4 border-slate-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-slate-600 group-hover:text-slate-900">{range.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Jobs List */}
          <main className="flex-1 min-w-0">
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 hover:bg-slate-50"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-primary-600 text-white text-xs flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
                <p className="text-sm text-slate-600">
                  <span className="font-semibold text-slate-900">{filteredJobs.length}</span> jobs found
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-500">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="relevance">Most Relevant</option>
                  <option value="newest">Most Recent</option>
                  <option value="salary">Highest Salary</option>
                </select>
              </div>
            </div>

            {/* Job Cards */}
            <div className="space-y-4">
              {paginatedJobs.map((job) => (
                <article
                  key={job.id}
                  onClick={() => setSelectedJob(job)}
                  className="bg-white rounded-xl border border-slate-200 p-5 hover:border-primary-200 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex gap-4">
                    {/* Company Logo */}
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-50 to-slate-100 border border-slate-200 flex items-center justify-center text-primary-600 font-bold text-sm flex-shrink-0">
                      {job.companyLogo}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-slate-900 group-hover:text-primary-600 transition-colors">
                            {job.title}
                          </h3>
                          <p className="text-sm text-slate-600 mt-0.5">{job.company}</p>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <span>{job.posted}</span>
                          <span>•</span>
                          <span>{job.applicants} applicants</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          {job.type}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
                          </svg>
                          {job.workSetup}
                        </span>
                      </div>

                      <p className="text-sm text-slate-600 mt-3 line-clamp-2">{job.description}</p>

                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        {job.skills.slice(0, 4).map((skill, i) => (
                          <span key={i} className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs rounded-md">
                            {skill}
                          </span>
                        ))}
                        {job.skills.length > 4 && (
                          <span className="text-xs text-slate-400">+{job.skills.length - 4} more</span>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                        <span className="text-sm font-semibold text-green-600">
                          {formatSalary(job.salaryMin, job.salaryMax)}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleSaveJob(job.id); }}
                            className={`p-2 rounded-lg transition-colors ${
                              savedJobs.includes(job.id)
                                ? 'text-primary-600 bg-primary-50'
                                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                            }`}
                            aria-label={savedJobs.includes(job.id) ? 'Unsave job' : 'Save job'}
                          >
                            <svg className="w-5 h-5" fill={savedJobs.includes(job.id) ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setSelectedJob(job); }}
                            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Empty State */}
            {filteredJobs.length === 0 && (
              <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
                <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 className="font-semibold text-slate-900 mb-2">No jobs found</h3>
                <p className="text-sm text-slate-500 mb-4">Try adjusting your search or filters</p>
                <button onClick={clearFilters} className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                  Clear all filters
                </button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 text-sm rounded-lg transition-colors ${
                      currentPage === page
                        ? 'bg-primary-600 text-white'
                        : 'border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Job Detail Modal */}
      {selectedJob && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center overflow-y-auto"
          onClick={() => setSelectedJob(null)}
        >
          <div
            className="bg-white w-full max-w-3xl my-8 mx-4 rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 rounded-t-2xl flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-50 to-slate-100 border border-slate-200 flex items-center justify-center text-primary-600 font-bold">
                  {selectedJob.companyLogo}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">{selectedJob.title}</h2>
                  <p className="text-slate-600">{selectedJob.company}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 -mr-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-6">
              {/* Job Meta */}
              <div className="flex flex-wrap gap-3 mb-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 text-sm rounded-lg">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  {selectedJob.location}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 text-sm rounded-lg">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {selectedJob.type}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 text-sm rounded-lg">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
                  </svg>
                  {selectedJob.workSetup}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 text-sm font-medium rounded-lg">
                  {formatSalary(selectedJob.salaryMin, selectedJob.salaryMax)}
                </span>
              </div>

              {/* Description */}
              <section className="mb-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">About This Role</h3>
                <p className="text-slate-600 leading-relaxed">{selectedJob.description}</p>
              </section>

              {/* Responsibilities */}
              <section className="mb-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Responsibilities</h3>
                <ul className="space-y-2">
                  {selectedJob.responsibilities.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-600">
                      <svg className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </section>

              {/* Requirements */}
              <section className="mb-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Requirements</h3>
                <ul className="space-y-2">
                  {selectedJob.requirements.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-600">
                      <svg className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </section>

              {/* Skills */}
              <section className="mb-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedJob.skills.map((skill, i) => (
                    <span key={i} className="px-3 py-1.5 bg-primary-50 text-primary-700 text-sm rounded-lg">
                      {skill}
                    </span>
                  ))}
                </div>
              </section>

              {/* Benefits */}
              <section className="mb-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Benefits</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedJob.benefits.map((benefit, i) => (
                    <span key={i} className="px-3 py-1.5 bg-green-50 text-green-700 text-sm rounded-lg">
                      {benefit}
                    </span>
                  ))}
                </div>
              </section>

              {/* Posted Info */}
              <p className="text-sm text-slate-400 mb-6">
                Posted {selectedJob.posted} · {selectedJob.applicants} applicants
              </p>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  onClick={() => toggleSaveJob(selectedJob.id)}
                  className={`flex-1 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${
                    savedJobs.includes(selectedJob.id)
                      ? 'bg-primary-50 text-primary-700 border border-primary-200'
                      : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <svg className="w-5 h-5" fill={savedJobs.includes(selectedJob.id) ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  {savedJobs.includes(selectedJob.id) ? 'Saved' : 'Save Job'}
                </button>
                <button className="flex-1 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold transition-colors">
                  Apply Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FindJobsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading jobs...</p>
        </div>
      </div>
    }>
      <FindJobsContent />
    </Suspense>
  );
}
