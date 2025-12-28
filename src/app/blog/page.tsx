import { Metadata } from 'next';
import Link from 'next/link';
import { blogPosts, getAllCategories } from '@/lib/blog-data';
import { WebsiteSchema } from '@/components/seo/StructuredData';

export const metadata: Metadata = {
  title: 'Career Blog - Job Search Tips & Career Advice',
  description: 'Expert career advice, job search tips, and industry insights for Filipino professionals. Learn how to advance your career, write better resumes, and ace interviews.',
  keywords: [
    'career advice Philippines',
    'job search tips',
    'resume writing',
    'interview tips',
    'salary guide Philippines',
    'career development',
    'professional growth',
  ],
  openGraph: {
    title: 'Jobly Career Blog - Job Search Tips & Career Advice',
    description: 'Expert career advice and job search tips for Filipino professionals.',
    url: 'https://www.jobly.ph/blog',
    type: 'website',
  },
};

export default function BlogPage() {
  const categories = getAllCategories();
  const featuredPosts = blogPosts.filter(p => p.featured);
  const recentPosts = blogPosts.slice(0, 6);

  return (
    <>
      <WebsiteSchema />
      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <header className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="text-2xl font-bold text-primary-600">
                Jobly
              </Link>
              <nav className="flex items-center gap-6">
                <Link href="/jobs" className="text-slate-600 hover:text-slate-900">
                  Find Jobs
                </Link>
                <Link href="/blog" className="text-primary-600 font-medium">
                  Blog
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

        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary-600 to-cyan-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Career Blog
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Expert advice, industry insights, and practical tips to help you succeed in your career
            </p>
          </div>
        </section>

        {/* Categories */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/blog"
              className="px-4 py-2 bg-primary-600 text-white rounded-full text-sm font-medium"
            >
              All Posts
            </Link>
            {categories.map(category => (
              <span
                key={category}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-full text-sm font-medium hover:border-primary-300 cursor-pointer"
              >
                {category}
              </span>
            ))}
          </div>
        </section>

        {/* Featured Posts */}
        {featuredPosts.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Featured Articles</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {featuredPosts.map(post => (
                <article
                  key={post.slug}
                  className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="h-48 bg-gradient-to-br from-primary-500 to-cyan-500 flex items-center justify-center">
                    <span className="text-white/90 text-6xl">
                      {post.category === 'Career Advice' ? '💼' : post.category === 'Resume Tips' ? '📄' : '🎯'}
                    </span>
                  </div>
                  <div className="p-6">
                    <span className="inline-block px-3 py-1 bg-primary-50 text-primary-600 text-xs font-medium rounded-full mb-3">
                      {post.category}
                    </span>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2 line-clamp-2">
                      <Link href={`/blog/${post.slug}`} className="hover:text-primary-600">
                        {post.title}
                      </Link>
                    </h3>
                    <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                      {post.description}
                    </p>
                    <div className="flex items-center justify-between text-sm text-slate-500">
                      <span>{post.author}</span>
                      <span>{post.readTime} min read</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* All Posts */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">All Articles</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogPosts.map(post => (
              <article
                key={post.slug}
                className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow"
              >
                <span className="inline-block px-3 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full mb-3">
                  {post.category}
                </span>
                <h3 className="text-lg font-semibold text-slate-900 mb-2 line-clamp-2">
                  <Link href={`/blog/${post.slug}`} className="hover:text-primary-600">
                    {post.title}
                  </Link>
                </h3>
                <p className="text-slate-600 text-sm mb-4 line-clamp-3">
                  {post.description}
                </p>
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span>{post.author}</span>
                  <span>{post.readTime} min read</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-primary-600 py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Find Your Dream Job?
            </h2>
            <p className="text-white/90 mb-8 text-lg">
              Apply the tips you&apos;ve learned and start your job search today
            </p>
            <Link
              href="/jobs"
              className="inline-block px-8 py-4 bg-white text-primary-600 font-semibold rounded-lg hover:bg-slate-100 transition-colors"
            >
              Browse Jobs Now
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-slate-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-xl font-bold mb-4">Jobly</h3>
                <p className="text-slate-400">
                  The trusted job portal for Filipino professionals
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Job Seekers</h4>
                <ul className="space-y-2 text-slate-400">
                  <li><Link href="/jobs" className="hover:text-white">Browse Jobs</Link></li>
                  <li><Link href="/auth/employee/register" className="hover:text-white">Create Account</Link></li>
                  <li><Link href="/blog" className="hover:text-white">Career Blog</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Employers</h4>
                <ul className="space-y-2 text-slate-400">
                  <li><Link href="/employer" className="hover:text-white">Post a Job</Link></li>
                  <li><Link href="/auth/employer/register" className="hover:text-white">Employer Sign Up</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Company</h4>
                <ul className="space-y-2 text-slate-400">
                  <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
                  <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                </ul>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-slate-800 text-center text-slate-400">
              <p>&copy; {new Date().getFullYear()} Jobly Philippines. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
