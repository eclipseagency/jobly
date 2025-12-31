import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { Providers } from "./providers";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.jobly.ph';

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Jobly Philippines',
  url: siteUrl,
  logo: `${siteUrl}/logo.png`,
  description: 'The trusted job portal connecting employers and job seekers in the Philippines',
  sameAs: [
    'https://www.facebook.com/joblyph',
    'https://www.linkedin.com/company/joblyph',
    'https://twitter.com/joblyph',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    availableLanguage: ['English', 'Filipino'],
  },
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Jobly Philippines',
  url: siteUrl,
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${siteUrl}/jobs?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Jobly - Find Your Dream Job in the Philippines",
    template: "%s | Jobly Philippines",
  },
  description: "Connect with top employers in the Philippines and beyond. Find jobs, post vacancies, and build your career with Jobly - the trusted job portal for Filipino professionals.",
  keywords: [
    "jobs Philippines",
    "hiring Philippines",
    "Manila jobs",
    "Cebu jobs",
    "Davao jobs",
    "career Philippines",
    "job portal",
    "employment",
    "recruitment",
    "job search",
    "work in Philippines",
    "Filipino jobs",
    "IT jobs Philippines",
    "BPO jobs",
    "remote jobs Philippines",
  ],
  authors: [{ name: "Jobly Philippines" }],
  creator: "Jobly",
  publisher: "Jobly Philippines",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_PH",
    url: siteUrl,
    siteName: "Jobly Philippines",
    title: "Jobly - Find Your Dream Job in the Philippines",
    description: "Connect with top employers in the Philippines. Search thousands of jobs in Manila, Cebu, Davao and across the country.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Jobly - Philippines Job Portal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Jobly - Find Your Dream Job in the Philippines",
    description: "Connect with top employers in the Philippines. Search thousands of jobs across the country.",
    images: ["/og-image.png"],
    creator: "@joblyph",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "google26cec3fd77cc819b",
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="w-full">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="antialiased w-full min-h-screen">
        <Script
          id="organization-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <Script
          id="website-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
