import Script from 'next/script';

interface OrganizationProps {
  name: string;
  url: string;
  logo?: string;
  description?: string;
}

interface JobPostingProps {
  title: string;
  description: string;
  company: string;
  location: string;
  salaryMin?: number;
  salaryMax?: number;
  employmentType: string;
  datePosted: string;
  validThrough?: string;
  remote?: boolean;
}

interface ArticleProps {
  title: string;
  description: string;
  author: string;
  datePublished: string;
  dateModified?: string;
  image?: string;
  url: string;
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

export function OrganizationSchema({ name, url, logo, description }: OrganizationProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    url,
    logo: logo || `${url}/logo.png`,
    description: description || 'Job portal connecting employers and job seekers in the Philippines',
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

  return (
    <Script
      id="organization-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function JobPostingSchema({
  title,
  description,
  company,
  location,
  salaryMin,
  salaryMax,
  employmentType,
  datePosted,
  validThrough,
  remote,
}: JobPostingProps) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title,
    description,
    datePosted,
    hiringOrganization: {
      '@type': 'Organization',
      name: company,
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: location,
        addressCountry: 'PH',
      },
    },
    employmentType: employmentType.toUpperCase().replace('-', '_'),
  };

  if (validThrough) {
    schema.validThrough = validThrough;
  }

  if (salaryMin && salaryMax) {
    schema.baseSalary = {
      '@type': 'MonetaryAmount',
      currency: 'PHP',
      value: {
        '@type': 'QuantitativeValue',
        minValue: salaryMin,
        maxValue: salaryMax,
        unitText: 'MONTH',
      },
    };
  }

  if (remote) {
    schema.jobLocationType = 'TELECOMMUTE';
  }

  return (
    <Script
      id="job-posting-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function ArticleSchema({
  title,
  description,
  author,
  datePublished,
  dateModified,
  image,
  url,
}: ArticleProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    author: {
      '@type': 'Person',
      name: author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Jobly Philippines',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.jobly.ph/logo.png',
      },
    },
    datePublished,
    dateModified: dateModified || datePublished,
    image: image || 'https://www.jobly.ph/og-image.png',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
  };

  return (
    <Script
      id="article-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function BreadcrumbSchema({ items }: { items: BreadcrumbItem[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <Script
      id="breadcrumb-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function WebsiteSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Jobly Philippines',
    url: 'https://www.jobly.ph',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://www.jobly.ph/jobs?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <Script
      id="website-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
