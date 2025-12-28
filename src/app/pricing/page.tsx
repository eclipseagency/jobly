import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Pricing - Employer Plans',
  description: 'Affordable job posting packages for Philippine employers. Choose from flexible pricing plans to find the best talent for your company.',
  openGraph: {
    title: 'Employer Pricing Plans - Jobly Philippines',
    description: 'Find the perfect hiring plan for your company. Affordable job posting packages.',
    url: 'https://www.jobly.ph/pricing',
  },
};

const plans = [
  {
    name: 'Starter',
    price: 'Free',
    period: '',
    description: 'Perfect for small businesses just getting started',
    features: [
      '1 active job posting',
      'Basic applicant tracking',
      'Email notifications',
      '30-day job visibility',
      'Standard support',
    ],
    cta: 'Get Started Free',
    href: '/auth/employer/register',
    popular: false,
  },
  {
    name: 'Professional',
    price: '₱2,999',
    period: '/month',
    description: 'Ideal for growing companies with regular hiring needs',
    features: [
      '10 active job postings',
      'Advanced applicant tracking',
      'Priority job placement',
      '60-day job visibility',
      'Company profile page',
      'Analytics dashboard',
      'Priority support',
    ],
    cta: 'Start Free Trial',
    href: '/auth/employer/register',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: '₱7,999',
    period: '/month',
    description: 'For large organizations with high-volume hiring',
    features: [
      'Unlimited job postings',
      'Full applicant management',
      'Featured job placements',
      '90-day job visibility',
      'Branded company page',
      'Advanced analytics & reports',
      'API access',
      'Dedicated account manager',
      '24/7 premium support',
    ],
    cta: 'Contact Sales',
    href: '/contact',
    popular: false,
  },
];

export default function PricingPage() {
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
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-white/90">
            Choose the plan that fits your hiring needs. No hidden fees.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 -mt-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative bg-white rounded-2xl border-2 p-8 ${
                  plan.popular
                    ? 'border-primary-500 shadow-xl scale-105'
                    : 'border-slate-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-primary-600 text-white text-sm font-medium px-4 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                    {plan.period && (
                      <span className="text-slate-500">{plan.period}</span>
                    )}
                  </div>
                  <p className="text-slate-600 mt-2 text-sm">{plan.description}</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <svg
                        className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-slate-600 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.href}
                  className={`block w-full py-3 rounded-lg font-medium text-center transition-colors ${
                    plan.popular
                      ? 'bg-primary-600 text-white hover:bg-primary-700'
                      : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-2">
                Can I change plans anytime?
              </h3>
              <p className="text-slate-600">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we&apos;ll prorate your billing accordingly.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-slate-600">
                We accept all major credit cards, GCash, Maya, bank transfers, and PayPal. Enterprise customers can also pay via invoice.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-2">
                Is there a free trial for paid plans?
              </h3>
              <p className="text-slate-600">
                Yes! Professional and Enterprise plans come with a 14-day free trial. No credit card required to start.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-2">
                What happens to my job postings if I cancel?
              </h3>
              <p className="text-slate-600">
                Your active job postings will remain visible until their expiration date. You&apos;ll retain access to view applications received.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Find Great Talent?
          </h2>
          <p className="text-white/90 mb-8">
            Join thousands of Philippine companies hiring through Jobly
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/employer/register"
              className="px-8 py-4 bg-white text-primary-600 font-semibold rounded-lg hover:bg-slate-100 transition-colors"
            >
              Start Hiring Today
            </Link>
            <Link
              href="/contact"
              className="px-8 py-4 bg-primary-700 text-white font-semibold rounded-lg hover:bg-primary-800 transition-colors"
            >
              Talk to Sales
            </Link>
          </div>
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
