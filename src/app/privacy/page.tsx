import Link from 'next/link';

export default function PrivacyPage() {
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
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Privacy Policy</h1>
          <p className="text-slate-500 mb-8">Last updated: December 2024</p>

          <div className="prose prose-slate max-w-none">
            <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">1. Information We Collect</h2>
            <p className="text-slate-600 mb-4">
              We collect information you provide directly to us, such as when you create an account,
              submit a job application, or contact us for support. This includes your name, email address,
              phone number, resume, and employment history.
            </p>

            <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">2. How We Use Your Information</h2>
            <p className="text-slate-600 mb-4">
              We use the information we collect to: provide and maintain our services; process job applications;
              communicate with you about opportunities; improve our platform; and comply with legal obligations.
            </p>

            <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">3. Information Sharing</h2>
            <p className="text-slate-600 mb-4">
              We share your information with employers when you apply for jobs. We do not sell your personal
              information to third parties. We may share data with service providers who assist in our operations.
            </p>

            <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">4. Data Security</h2>
            <p className="text-slate-600 mb-4">
              We implement appropriate technical and organizational measures to protect your personal information
              against unauthorized access, alteration, disclosure, or destruction.
            </p>

            <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">5. Your Rights</h2>
            <p className="text-slate-600 mb-4">
              You have the right to access, correct, or delete your personal information. You can update your
              profile settings or contact us to exercise these rights. Under Philippine law (Data Privacy Act of 2012),
              you have additional rights regarding your personal data.
            </p>

            <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">6. Cookies</h2>
            <p className="text-slate-600 mb-4">
              We use cookies and similar technologies to enhance your experience, analyze usage patterns,
              and deliver personalized content. You can manage cookie preferences through your browser settings.
            </p>

            <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">7. Data Retention</h2>
            <p className="text-slate-600 mb-4">
              We retain your information for as long as your account is active or as needed to provide services.
              We will delete or anonymize your data upon request, subject to legal retention requirements.
            </p>

            <h2 className="text-xl font-semibold text-slate-800 mt-8 mb-4">8. Contact Us</h2>
            <p className="text-slate-600 mb-4">
              For privacy-related questions or concerns, contact our Data Protection Officer at privacy@jobly.ph
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
