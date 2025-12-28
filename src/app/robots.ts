import { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.jobly.ph';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/employer/dashboard/',
          '/employer/applicants/',
          '/employer/jobs/',
          '/employer/analytics/',
          '/employer/settings/',
          '/employer/company/',
          '/employer/messages/',
          '/api/',
          '/auth/reset-password/',
          '/auth/forgot-password/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/employer/dashboard/',
          '/api/',
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
