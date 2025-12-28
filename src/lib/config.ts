// Application configuration
// Set DEMO_MODE to false when connecting to a real backend

export const config = {
  // When true, the app shows demo data. Set to false for production with real API
  DEMO_MODE: true,

  // API base URL - update this when you have a real backend
  API_BASE_URL: process.env.NEXT_PUBLIC_API_URL || '',

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
