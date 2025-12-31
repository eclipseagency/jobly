'use client';

import Link from 'next/link';
import Image from 'next/image';
import { blogPosts, getAllCategories } from '@/lib/blog-data';
import { WebsiteSchema } from '@/components/seo/StructuredData';
import { useAuth } from '@/contexts/AuthContext';

export default function BlogPage() {
  const { isLoggedIn, user, getDashboardPath, logout } = useAuth();
  const categories = getAllCategories();
  const featuredPosts = blogPosts.filter(p => p.featured);
  const recentPosts = blogPosts.slice(0, 6);

  return (
    <>
      <WebsiteSchema />
      <div className="min-h-screen bg-slate-50">
        {/* Navigation - Same as Homepage */}
        <nav className="border-b border-slate-100 w-full bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link href="/">
                <Image src="/logo.svg" alt="Jobly" width={100} height={28} priority />
              </Link>

              <div className="hidden md:flex items-center gap-8">
                <Link href="/dashboard/jobs" className="text-slate-600 hover:text-slate-900 text-sm font-medium">
                  Find Jobs
                </Link>
                <Link href="/blog" className="text-primary-600 text-sm font-medium">
                  Blog
                </Link>
                {isLoggedIn && user?.role === 'employer' ? (
                  <Link href="/employer/dashboard" className="text-slate-600 hover:text-slate-900 text-sm font-medium">
                    Employer Dashboard
                  </Link>
                ) : (
                  <Link href="/auth/employer/login" className="text-slate-600 hover:text-slate-900 text-sm font-medium">
                    For Employers
                  </Link>
                )}
              </div>

              <div className="flex items-center gap-3">
                {isLoggedIn ? (
                  <>
                    <button
                      onClick={logout}
                      className="hidden sm:inline-flex text-slate-600 hover:text-slate-900 text-sm font-medium"
                    >
                      Sign out
                    </button>
                    <Link
                      href={getDashboardPath()}
                      className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      My Dashboard
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/auth"
                      className="hidden sm:inline-flex text-slate-600 hover:text-slate-900 text-sm font-medium"
                    >
                      Sign in
                    </Link>
                    <Link
                      href="/auth"
                      className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </nav>

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

        {/* Footer - Same as Homepage */}
        <footer className="py-12 border-t border-slate-100 w-full bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="col-span-2 md:col-span-1">
                <div className="mb-4">
                  <Image src="/logo.svg" alt="Jobly" width={90} height={25} />
                </div>
                <p className="text-sm text-slate-500">
                  Connecting talent with opportunity across the Philippines and beyond.
                </p>
              </div>

              <div>
                <h4 className="font-medium text-slate-900 mb-4 text-sm">For Job Seekers</h4>
                <ul className="space-y-2 text-sm text-slate-500">
                  <li><Link href="/jobs" className="hover:text-slate-900">Browse Jobs</Link></li>
                  <li><Link href="/blog" className="hover:text-slate-900">Career Advice</Link></li>
                  <li><Link href="/blog/how-to-write-winning-resume-philippines" className="hover:text-slate-900">Resume Tips</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-slate-900 mb-4 text-sm">For Employers</h4>
                <ul className="space-y-2 text-sm text-slate-500">
                  <li><Link href="/auth/employer/register" className="hover:text-slate-900">Post a Job</Link></li>
                  <li><Link href="/pricing" className="hover:text-slate-900">Pricing</Link></li>
                  <li><Link href="/resources" className="hover:text-slate-900">Resources</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-slate-900 mb-4 text-sm">Company</h4>
                <ul className="space-y-2 text-sm text-slate-500">
                  <li><Link href="/about" className="hover:text-slate-900">About</Link></li>
                  <li><Link href="/contact" className="hover:text-slate-900">Contact</Link></li>
                  <li><Link href="/privacy" className="hover:text-slate-900">Privacy</Link></li>
                </ul>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-slate-500">
                © {new Date().getFullYear()} Jobly. All rights reserved.
              </p>
              <p className="text-sm text-slate-500">
                Made in the Philippines
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
