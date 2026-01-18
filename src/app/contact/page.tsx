'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitted(true);
      } else {
        setError(data.error || 'Failed to send message. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
              <Link href="/blog" className="text-slate-600 hover:text-slate-900">
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

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-600 to-cyan-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Contact Us
          </h1>
          <p className="text-xl text-white/90">
            Have questions? We&apos;d love to hear from you.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Get in Touch</h2>
              <p className="text-slate-600 mb-8">
                Whether you&apos;re a job seeker with questions about our platform or an employer looking for hiring solutions, our team is here to help.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Email</h3>
                    <p className="text-slate-600">support@jobly.ph</p>
                    <p className="text-slate-600">employers@jobly.ph</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Office</h3>
                    <p className="text-slate-600">Metro Manila, Philippines</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Business Hours</h3>
                    <p className="text-slate-600">Monday - Friday: 9:00 AM - 6:00 PM</p>
                    <p className="text-slate-600">Saturday: 9:00 AM - 12:00 PM</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-4">Follow Us</h3>
                <div className="flex gap-4">
                  <a href="#" className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center hover:bg-slate-200 transition-colors">
                    <svg className="w-5 h-5 text-slate-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                  <a href="#" className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center hover:bg-slate-200 transition-colors">
                    <svg className="w-5 h-5 text-slate-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                  <a href="#" className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center hover:bg-slate-200 transition-colors">
                    <svg className="w-5 h-5 text-slate-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-slate-50 rounded-2xl p-8">
              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">Message Sent!</h3>
                  <p className="text-slate-600 mb-6">Thank you for reaching out. We&apos;ll get back to you within 24 hours.</p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ name: '', email: '', subject: '', message: '' });
                    }}
                    className="text-primary-600 font-medium hover:text-primary-700"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">Send us a Message</h2>
                  {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                      {error}
                    </div>
                  )}
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Juan dela Cruz"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="juan@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Subject
                      </label>
                      <select
                        required
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="">Select a topic</option>
                        <option value="general">General Inquiry</option>
                        <option value="job-seeker">Job Seeker Support</option>
                        <option value="employer">Employer Support</option>
                        <option value="technical">Technical Issue</option>
                        <option value="partnership">Partnership Inquiry</option>
                        <option value="feedback">Feedback</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Message
                      </label>
                      <textarea
                        required
                        rows={5}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                        placeholder="How can we help you?"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Sending...' : 'Send Message'}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Teaser */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
          <p className="text-slate-600 mb-8">
            Find quick answers to common questions in our blog and resources section.
          </p>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-primary-600 font-medium hover:text-primary-700"
          >
            Visit our Blog
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
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
