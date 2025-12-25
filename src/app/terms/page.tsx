import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-8 text-slate-600 hover:text-primary-600 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Home
        </Link>

        <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Terms of Service</h1>
          <p className="text-slate-500 mb-8">Last updated: December 2024</p>

          <div className="prose prose-slate max-w-none">
            <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">1. Acceptance of Terms</h2>
            <p className="text-slate-600 mb-4">
              By accessing and using Jobly, you accept and agree to be bound by the terms and provision of this agreement.
              If you do not agree to abide by these terms, please do not use this service.
            </p>

            <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">2. Description of Service</h2>
            <p className="text-slate-600 mb-4">
              Jobly provides an online platform connecting job seekers with employers. Our services include job listings,
              application management, and communication tools between candidates and hiring companies.
            </p>

            <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">3. User Accounts</h2>
            <p className="text-slate-600 mb-4">
              To access certain features of our service, you must register for an account. You agree to provide accurate,
              current, and complete information during registration and to update such information to keep it accurate,
              current, and complete.
            </p>

            <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">4. User Conduct</h2>
            <p className="text-slate-600 mb-4">
              You agree not to use the service to: post false or misleading information; harass, abuse, or harm others;
              violate any applicable laws; or engage in any activity that interferes with the service.
            </p>

            <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">5. Intellectual Property</h2>
            <p className="text-slate-600 mb-4">
              The service and its original content, features, and functionality are owned by Jobly and are protected
              by international copyright, trademark, patent, trade secret, and other intellectual property laws.
            </p>

            <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">6. Limitation of Liability</h2>
            <p className="text-slate-600 mb-4">
              Jobly shall not be liable for any indirect, incidental, special, consequential, or punitive damages
              resulting from your use of or inability to use the service.
            </p>

            <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">7. Changes to Terms</h2>
            <p className="text-slate-600 mb-4">
              We reserve the right to modify these terms at any time. We will notify users of any material changes
              by posting the new terms on this page.
            </p>

            <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">8. Contact Us</h2>
            <p className="text-slate-600 mb-4">
              If you have any questions about these Terms, please contact us at legal@jobly.ph
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
