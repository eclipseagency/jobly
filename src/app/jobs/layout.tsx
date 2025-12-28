import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Browse Jobs in the Philippines - Find Your Next Career',
  description: 'Search thousands of job opportunities in Manila, Cebu, Davao and across the Philippines. Filter by location, job type, salary range and more. Apply now on Jobly.',
  keywords: [
    'job search Philippines',
    'jobs in Manila',
    'jobs in Cebu',
    'Davao jobs',
    'IT jobs Philippines',
    'BPO jobs',
    'remote jobs Philippines',
    'full-time jobs',
    'part-time jobs',
    'entry-level jobs Philippines',
  ],
  openGraph: {
    title: 'Browse Jobs in the Philippines - Jobly',
    description: 'Search thousands of job opportunities across the Philippines. Find your dream job today.',
    url: 'https://www.jobly.ph/jobs',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.jobly.ph/jobs',
  },
};

export default function JobsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
