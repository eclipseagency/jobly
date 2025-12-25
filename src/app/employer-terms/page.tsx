import Link from 'next/link';

export default function EmployerTermsPage() {
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
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Employer Agreement</h1>
          <p className="text-slate-500 mb-8">Last updated: December 2024</p>

          <div className="prose prose-slate max-w-none">
            <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">1. Employer Account</h2>
            <p className="text-slate-600 mb-4">
              By creating an employer account on Jobly, you represent that you have the authority to bind your
              organization to these terms. You agree to provide accurate company information and maintain
              the security of your account credentials.
            </p>

            <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">2. Job Postings</h2>
            <p className="text-slate-600 mb-4">
              All job postings must be for legitimate employment opportunities. You agree that job listings will:
              be accurate and not misleading; comply with all applicable employment laws; not discriminate based
              on protected characteristics; and include accurate compensation information where required.
            </p>

            <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">3. Candidate Data</h2>
            <p className="text-slate-600 mb-4">
              You agree to use candidate information solely for recruitment purposes. You will not share, sell,
              or misuse applicant data. You must comply with all applicable data protection laws, including the
              Philippine Data Privacy Act of 2012.
            </p>

            <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">4. Fees and Payment</h2>
            <p className="text-slate-600 mb-4">
              Jobly offers various pricing plans for employers. By subscribing to a paid plan, you agree to pay
              all applicable fees. Fees are non-refundable unless otherwise specified. We reserve the right to
              modify pricing with 30 days notice.
            </p>

            <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">5. Prohibited Conduct</h2>
            <p className="text-slate-600 mb-4">
              Employers may not: post fraudulent or misleading job listings; engage in discriminatory hiring practices;
              use the platform for purposes other than legitimate recruitment; or contact candidates for marketing
              purposes without consent.
            </p>

            <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">6. Account Termination</h2>
            <p className="text-slate-600 mb-4">
              We reserve the right to suspend or terminate employer accounts that violate these terms.
              You may close your account at any time by contacting support.
            </p>

            <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">7. Indemnification</h2>
            <p className="text-slate-600 mb-4">
              You agree to indemnify and hold Jobly harmless from any claims arising from your use of the platform,
              your job postings, or your hiring practices.
            </p>

            <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">8. Contact</h2>
            <p className="text-slate-600 mb-4">
              For employer-related inquiries, contact our business team at employers@jobly.ph
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
