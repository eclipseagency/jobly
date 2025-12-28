import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Employer Resources - Hiring Guides & Tips',
  description: 'Free resources for Philippine employers. Learn best practices for hiring, writing job descriptions, conducting interviews, and building great teams.',
  openGraph: {
    title: 'Employer Resources - Jobly Philippines',
    description: 'Free hiring guides and resources for Philippine employers.',
    url: 'https://www.jobly.ph/resources',
  },
};

const guides = [
  {
    title: 'How to Write Effective Job Descriptions',
    description: 'Learn the art of crafting job postings that attract top talent. Includes templates and examples.',
    icon: '📝',
    category: 'Job Posting',
  },
  {
    title: 'Interview Best Practices',
    description: 'Structured interview techniques to help you identify the best candidates consistently.',
    icon: '🎯',
    category: 'Interviewing',
  },
  {
    title: 'Competitive Salary Guide 2024',
    description: 'Benchmark salaries across industries in the Philippines to make competitive offers.',
    icon: '💰',
    category: 'Compensation',
  },
  {
    title: 'Onboarding New Employees',
    description: 'Create a seamless onboarding experience that sets new hires up for success.',
    icon: '🚀',
    category: 'Onboarding',
  },
  {
    title: 'Remote Hiring Guide',
    description: 'Best practices for recruiting, interviewing, and onboarding remote employees.',
    icon: '🏠',
    category: 'Remote Work',
  },
  {
    title: 'Legal Compliance Checklist',
    description: 'Essential Philippine labor laws and regulations every employer should know.',
    icon: '⚖️',
    category: 'Compliance',
  },
];

const blogPosts = [
  {
    title: 'Top 10 Highest Paying Jobs in the Philippines 2024',
    slug: 'top-10-highest-paying-jobs-philippines-2024',
    category: 'Salary Guide',
  },
  {
    title: 'IT Jobs Salary Guide Philippines 2024',
    slug: 'it-jobs-salary-guide-philippines',
    category: 'Salary Guide',
  },
  {
    title: 'BPO Industry Careers Guide',
    slug: 'bpo-industry-careers-philippines',
    category: 'Industry Guide',
  },
];

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Image src="/logo.svg" alt="Jobly" width={100} height={28} priority />
            </Link>
            <nav className="flex items-center gap-6">
              <Link href="/jobs" className="text-slate-600 hover:text-slate-900">
                Find Jobs
              </Link>
              <Link href="/employer" className="text-slate-600 hover:text-slate-900">
                For Employers
              </Link>
              <Link
                href="/auth"
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Sign In
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-600 to-cyan-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Employer Resources
          </h1>
          <p className="text-xl text-white/90">
            Free guides, templates, and insights to help you hire better
          </p>
        </div>
      </section>

      {/* Resource Guides */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">Hiring Guides</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guides.map((guide) => (
              <div
                key={guide.title}
                className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="text-4xl mb-4">{guide.icon}</div>
                <span className="inline-block px-3 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full mb-3">
                  {guide.category}
                </span>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{guide.title}</h3>
                <p className="text-slate-600 text-sm">{guide.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Templates Section */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">Free Templates</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">Job Description Templates</h3>
                  <p className="text-slate-600 text-sm mb-3">
                    Ready-to-use templates for common roles in IT, BPO, Finance, and more.
                  </p>
                  <span className="text-primary-600 text-sm font-medium">Coming Soon</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">Interview Question Bank</h3>
                  <p className="text-slate-600 text-sm mb-3">
                    Curated interview questions for different roles and experience levels.
                  </p>
                  <span className="text-primary-600 text-sm font-medium">Coming Soon</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">Offer Letter Templates</h3>
                  <p className="text-slate-600 text-sm mb-3">
                    Professional offer letter templates compliant with Philippine labor law.
                  </p>
                  <span className="text-primary-600 text-sm font-medium">Coming Soon</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">Onboarding Checklist</h3>
                  <p className="text-slate-600 text-sm mb-3">
                    Step-by-step onboarding checklist to welcome new team members.
                  </p>
                  <span className="text-primary-600 text-sm font-medium">Coming Soon</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Articles */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-slate-900">From Our Blog</h2>
            <Link href="/blog" className="text-primary-600 font-medium hover:text-primary-700">
              View all articles →
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {blogPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
              >
                <span className="inline-block px-3 py-1 bg-primary-50 text-primary-600 text-xs font-medium rounded-full mb-3">
                  {post.category}
                </span>
                <h3 className="font-semibold text-slate-900 hover:text-primary-600">
                  {post.title}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Stay Updated
          </h2>
          <p className="text-slate-600 mb-6">
            Get the latest hiring tips and industry insights delivered to your inbox.
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Hiring?
          </h2>
          <p className="text-white/90 mb-8">
            Post your first job for free and reach thousands of qualified candidates
          </p>
          <Link
            href="/auth/employer/register"
            className="inline-block px-8 py-4 bg-white text-primary-600 font-semibold rounded-lg hover:bg-slate-100 transition-colors"
          >
            Post a Job Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-slate-400">&copy; {new Date().getFullYear()} Jobly Philippines. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
