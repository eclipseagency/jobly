import Link from 'next/link';
import Image from 'next/image';

export function Footer() {
  return (
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
  );
}
