// Common skills database for matching
const SKILLS_DATABASE = {
  // Programming Languages
  programming: [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Ruby', 'PHP', 'Go', 'Rust',
    'Swift', 'Kotlin', 'Scala', 'R', 'MATLAB', 'Perl', 'Shell', 'Bash', 'PowerShell', 'SQL',
    'HTML', 'CSS', 'SASS', 'LESS', 'Assembly', 'Objective-C', 'Dart', 'Lua', 'Haskell',
  ],

  // Frameworks & Libraries
  frameworks: [
    'React', 'React.js', 'ReactJS', 'Angular', 'Vue', 'Vue.js', 'VueJS', 'Next.js', 'NextJS',
    'Node.js', 'NodeJS', 'Express', 'Express.js', 'Django', 'Flask', 'FastAPI', 'Spring',
    'Spring Boot', 'Laravel', 'Ruby on Rails', 'Rails', 'ASP.NET', '.NET', '.NET Core',
    'jQuery', 'Bootstrap', 'Tailwind', 'TailwindCSS', 'Material UI', 'Chakra UI',
    'Redux', 'MobX', 'Zustand', 'GraphQL', 'REST', 'RESTful', 'Prisma', 'Sequelize',
    'Mongoose', 'TypeORM', 'Hibernate', 'NestJS', 'Fastify', 'Svelte', 'SvelteKit',
    'Nuxt', 'Gatsby', 'Remix', 'Electron', 'React Native', 'Flutter', 'Ionic',
  ],

  // Databases
  databases: [
    'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'SQLite', 'Oracle', 'SQL Server',
    'MariaDB', 'Cassandra', 'DynamoDB', 'Firebase', 'Firestore', 'Supabase',
    'Neo4j', 'Elasticsearch', 'CouchDB', 'InfluxDB', 'TimescaleDB',
  ],

  // Cloud & DevOps
  cloud: [
    'AWS', 'Amazon Web Services', 'Azure', 'Google Cloud', 'GCP', 'Heroku', 'Vercel',
    'Netlify', 'DigitalOcean', 'Linode', 'Docker', 'Kubernetes', 'K8s', 'Jenkins',
    'CircleCI', 'GitHub Actions', 'GitLab CI', 'Travis CI', 'Terraform', 'Ansible',
    'Puppet', 'Chef', 'Nginx', 'Apache', 'Linux', 'Ubuntu', 'CentOS', 'AWS Lambda',
    'S3', 'EC2', 'RDS', 'CloudFront', 'ECS', 'EKS', 'Fargate',
  ],

  // Tools & Technologies
  tools: [
    'Git', 'GitHub', 'GitLab', 'Bitbucket', 'Jira', 'Confluence', 'Trello', 'Asana',
    'Slack', 'VS Code', 'Visual Studio', 'IntelliJ', 'WebStorm', 'PyCharm', 'Eclipse',
    'Figma', 'Sketch', 'Adobe XD', 'Photoshop', 'Illustrator', 'Webpack', 'Vite',
    'Babel', 'ESLint', 'Prettier', 'npm', 'yarn', 'pnpm', 'Postman', 'Insomnia',
    'Swagger', 'OpenAPI', 'Jest', 'Mocha', 'Cypress', 'Playwright', 'Selenium',
  ],

  // Data & AI
  data: [
    'Machine Learning', 'Deep Learning', 'AI', 'Artificial Intelligence', 'TensorFlow',
    'PyTorch', 'Keras', 'Scikit-learn', 'Pandas', 'NumPy', 'Data Science', 'Data Analysis',
    'Data Visualization', 'Tableau', 'Power BI', 'Apache Spark', 'Hadoop', 'ETL',
    'NLP', 'Natural Language Processing', 'Computer Vision', 'Neural Networks',
  ],

  // Soft Skills
  soft: [
    'Leadership', 'Communication', 'Problem Solving', 'Teamwork', 'Collaboration',
    'Project Management', 'Agile', 'Scrum', 'Kanban', 'Critical Thinking',
    'Time Management', 'Adaptability', 'Creativity', 'Attention to Detail',
    'Customer Service', 'Presentation', 'Public Speaking', 'Negotiation',
    'Mentoring', 'Coaching', 'Strategic Planning', 'Decision Making',
  ],

  // Design & UX
  design: [
    'UI Design', 'UX Design', 'UI/UX', 'User Interface', 'User Experience',
    'Wireframing', 'Prototyping', 'Responsive Design', 'Mobile Design',
    'Web Design', 'Graphic Design', 'Typography', 'Color Theory',
    'Design Systems', 'Accessibility', 'WCAG', 'A11y', 'Usability Testing',
  ],

  // Marketing & Business
  marketing: [
    'SEO', 'SEM', 'Google Analytics', 'Google Ads', 'Facebook Ads', 'Social Media',
    'Content Marketing', 'Email Marketing', 'Digital Marketing', 'Marketing Automation',
    'HubSpot', 'Salesforce', 'CRM', 'B2B', 'B2C', 'Lead Generation', 'Conversion Optimization',
  ],

  // Industry Specific (Philippines)
  industry: [
    'BPO', 'Call Center', 'Customer Support', 'Technical Support', 'Accounting',
    'Bookkeeping', 'QuickBooks', 'SAP', 'ERP', 'Virtual Assistant', 'VA',
    'Medical Transcription', 'Legal Transcription', 'Content Writing', 'Copywriting',
    'Video Editing', 'Premiere Pro', 'After Effects', 'Final Cut Pro',
  ],
};

// Flatten all skills into a single searchable array
const ALL_SKILLS = Object.values(SKILLS_DATABASE).flat();

/**
 * Extract text from a PDF file using PDF.js
 */
export async function extractTextFromPDF(dataUrl: string): Promise<string> {
  try {
    // Dynamic import of PDF.js to avoid SSR issues
    const pdfjsLib = await import('pdfjs-dist');
    type TextItem = Awaited<ReturnType<Awaited<ReturnType<typeof pdfjsLib.getDocument>['promise']>['getPage']>>['getTextContent'] extends () => Promise<{ items: (infer T)[] }> ? T : never;

    // Set worker source
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

    // Convert data URL to array buffer
    const base64 = dataUrl.split(',')[1];
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument({ data: bytes });
    const pdf = await loadingTask.promise;

    let fullText = '';

    // Extract text from each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: TextItem) => ('str' in item ? item.str : ''))
        .join(' ');
      fullText += pageText + '\n';
    }

    return fullText;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    return '';
  }
}

/**
 * Extract skills from text by matching against skills database
 */
export function extractSkillsFromText(text: string): string[] {
  const foundSkills = new Set<string>();
  const normalizedText = text.toLowerCase();

  for (const skill of ALL_SKILLS) {
    // Create variations of the skill for matching
    const skillLower = skill.toLowerCase();
    const skillNoSpaces = skillLower.replace(/\s+/g, '');
    const skillWithDots = skillLower.replace(/\s+/g, '.');

    // Check for exact match with word boundaries
    const patterns = [
      new RegExp(`\\b${escapeRegex(skillLower)}\\b`, 'i'),
      new RegExp(`\\b${escapeRegex(skillNoSpaces)}\\b`, 'i'),
      new RegExp(`\\b${escapeRegex(skillWithDots)}\\b`, 'i'),
    ];

    for (const pattern of patterns) {
      if (pattern.test(normalizedText)) {
        foundSkills.add(skill);
        break;
      }
    }
  }

  return Array.from(foundSkills).sort();
}

/**
 * Escape special regex characters
 */
function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Parse a resume and extract skills
 */
export async function parseResume(dataUrl: string, fileName: string): Promise<{
  skills: string[];
  rawText: string;
}> {
  let rawText = '';

  // Check file type
  const isPDF = fileName.toLowerCase().endsWith('.pdf') || dataUrl.includes('application/pdf');

  if (isPDF) {
    rawText = await extractTextFromPDF(dataUrl);
  } else {
    // For DOC/DOCX files, we can't easily parse them client-side
    // Return empty for now - would need server-side processing
    console.log('DOC/DOCX parsing requires server-side processing');
    return { skills: [], rawText: '' };
  }

  const skills = extractSkillsFromText(rawText);

  return { skills, rawText };
}

/**
 * Get skill category
 */
export function getSkillCategory(skill: string): string {
  for (const [category, skills] of Object.entries(SKILLS_DATABASE)) {
    if (skills.some(s => s.toLowerCase() === skill.toLowerCase())) {
      return category;
    }
  }
  return 'other';
}

/**
 * Get all available skills for autocomplete
 */
export function getAllSkills(): string[] {
  return ALL_SKILLS;
}
