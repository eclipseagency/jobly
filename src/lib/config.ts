// Application configuration

export const config = {
  // When true, the app shows demo data. Set to false for production with real API
  DEMO_MODE: false,

  // API base URL - uses Next.js API routes by default
  API_BASE_URL: process.env.NEXT_PUBLIC_API_URL || '/api',

  // App info
  APP_NAME: 'Jobly',
  APP_TAGLINE: 'Find your dream job in the Philippines',

  // Company info (for employer demo)
  DEFAULT_COMPANY: {
    name: 'Your Company',
    avatar: 'YC',
  },

  // Pagination
  JOBS_PER_PAGE: 10,
  APPLICANTS_PER_PAGE: 20,

  // Feature flags
  FEATURES: {
    MESSAGING: true,
    INTERVIEWS: true,
    ANALYTICS: true,
    CV_MANAGER: true,
  },
};

export const isDemoMode = () => config.DEMO_MODE;
