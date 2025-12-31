// Shared job data and types for the application

export interface Job {
  id: string;
  title: string;
  company: string;
  companyLogo: string;
  companyDescription?: string;
  companySize?: string;
  companyIndustry?: string;
  location: string;
  type: string;
  workSetup: string;
  salaryMin: number;
  salaryMax: number;
  posted: string;
  applicants: number;
  description: string;
  responsibilities: string[];
  requirements: string[];
  niceToHave?: string[];
  benefits: string[];
  skills: string[];
  experience: string;
  applicationDeadline?: string;
}

export const jobs: Job[] = [
  {
    id: '1',
    title: 'Senior Frontend Developer',
    company: 'Accenture Philippines',
    companyLogo: 'AC',
    companyDescription: 'Accenture is a global professional services company with leading capabilities in digital, cloud and security.',
    companySize: '10,000+ employees',
    companyIndustry: 'Information Technology & Services',
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
    niceToHave: [
      'Experience with Next.js and server-side rendering',
      'Knowledge of GraphQL and Apollo Client',
      'Familiarity with micro-frontend architecture',
    ],
    benefits: ['HMO with 3 dependents', 'Life Insurance', 'Performance Bonus', 'Hybrid Work Setup', 'Learning & Development Budget'],
    skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'GraphQL'],
    experience: 'Senior',
    applicationDeadline: '2025-01-31',
  },
  {
    id: '2',
    title: 'Product Designer',
    company: 'Canva Philippines',
    companyLogo: 'CA',
    companyDescription: 'Canva is an online design and publishing tool with a mission to empower everyone in the world to design anything and publish anywhere.',
    companySize: '1,000-5,000 employees',
    companyIndustry: 'Computer Software',
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
    niceToHave: [
      'Experience with motion design and animation',
      'Understanding of frontend development',
      'Previous experience in B2C products',
    ],
    benefits: ['HMO', 'Stock Options', 'Flexible Hours', 'Home Office Stipend', 'Wellness Allowance'],
    skills: ['Figma', 'UI/UX Design', 'Prototyping', 'User Research', 'Design Systems'],
    experience: 'Mid',
    applicationDeadline: '2025-02-15',
  },
  {
    id: '3',
    title: 'Full Stack Engineer',
    company: 'GCash (Mynt)',
    companyLogo: 'GC',
    companyDescription: 'GCash is the Philippines\' leading mobile wallet, serving over 80 million registered users with payments, remittances, and financial services.',
    companySize: '1,000-5,000 employees',
    companyIndustry: 'Financial Services',
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
    applicationDeadline: '2025-01-20',
  },
  {
    id: '4',
    title: 'Data Scientist',
    company: 'Thinking Machines',
    companyLogo: 'TM',
    companyDescription: 'Thinking Machines is a technology consultancy specializing in data science, machine learning, and AI solutions for enterprises in Southeast Asia.',
    companySize: '100-500 employees',
    companyIndustry: 'Information Technology & Services',
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
    companyDescription: 'Kumu is the Philippines\' leading live streaming and social entertainment platform, connecting millions of Filipinos through live video.',
    companySize: '100-500 employees',
    companyIndustry: 'Entertainment',
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
    companyDescription: 'PayMaya (Maya) is one of the Philippines\' leading digital financial services platforms, offering payments, banking, and investment services.',
    companySize: '1,000-5,000 employees',
    companyIndustry: 'Financial Services',
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
    companyDescription: 'Shopee is the leading e-commerce platform in Southeast Asia, offering users an easy, secure, and fast online shopping experience.',
    companySize: '10,000+ employees',
    companyIndustry: 'E-commerce',
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
    companyDescription: 'Concentrix is a global business services company providing customer experience solutions and technology services.',
    companySize: '10,000+ employees',
    companyIndustry: 'Business Process Outsourcing',
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
    companyDescription: 'Globe Telecom is the Philippines\' leading telecommunications company, providing mobile, broadband, and enterprise solutions.',
    companySize: '10,000+ employees',
    companyIndustry: 'Telecommunications',
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
    companyDescription: 'Exist Software Labs is one of the Philippines\' premier software development companies, building custom solutions for global clients.',
    companySize: '500-1,000 employees',
    companyIndustry: 'Information Technology & Services',
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
    companyDescription: 'IBM is a global technology and consulting company, delivering innovation in cloud, AI, and enterprise solutions.',
    companySize: '10,000+ employees',
    companyIndustry: 'Information Technology & Services',
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
    companyDescription: 'BDO Unibank is the Philippines\' largest bank by total assets, serving millions of customers with comprehensive banking services.',
    companySize: '10,000+ employees',
    companyIndustry: 'Banking',
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
    companyDescription: 'Angkas is the Philippines\' leading motorcycle ride-hailing platform, providing safe and affordable transportation solutions.',
    companySize: '100-500 employees',
    companyIndustry: 'Transportation',
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
    companyDescription: 'Zendesk builds software for better customer relationships, serving over 100,000 companies worldwide.',
    companySize: '5,000-10,000 employees',
    companyIndustry: 'Computer Software',
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
    companyDescription: 'Grab is Southeast Asia\'s leading superapp, delivering everyday services from rides to food delivery and financial services.',
    companySize: '10,000+ employees',
    companyIndustry: 'Internet',
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

export const getJobById = (id: string): Job | undefined => {
  return jobs.find(job => job.id === id);
};

export const formatSalary = (min: number, max: number): string => {
  const formatNum = (n: number) => {
    if (n >= 1000) return `₱${(n / 1000).toFixed(0)}k`;
    return `₱${n}`;
  };
  return `${formatNum(min)} - ${formatNum(max)}/mo`;
};

// Saved jobs helper functions (localStorage)
const SAVED_JOBS_KEY = 'jobly_saved_jobs';

export const getSavedJobs = (): string[] => {
  if (typeof window === 'undefined') return [];
  const saved = localStorage.getItem(SAVED_JOBS_KEY);
  return saved ? JSON.parse(saved) : [];
};

export const saveJob = (jobId: string): string[] => {
  const saved = getSavedJobs();
  if (!saved.includes(jobId)) {
    saved.push(jobId);
    localStorage.setItem(SAVED_JOBS_KEY, JSON.stringify(saved));
  }
  return saved;
};

export const unsaveJob = (jobId: string): string[] => {
  let saved = getSavedJobs();
  saved = saved.filter(id => id !== jobId);
  localStorage.setItem(SAVED_JOBS_KEY, JSON.stringify(saved));
  return saved;
};

export const toggleSavedJob = (jobId: string): { saved: string[]; isSaved: boolean } => {
  const saved = getSavedJobs();
  if (saved.includes(jobId)) {
    return { saved: unsaveJob(jobId), isSaved: false };
  } else {
    return { saved: saveJob(jobId), isSaved: true };
  }
};

export const isJobSaved = (jobId: string): boolean => {
  return getSavedJobs().includes(jobId);
};
