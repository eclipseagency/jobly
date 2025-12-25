'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Input, Card } from '@/components/ui';

export default function EmployerLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // TODO: Implement actual authentication with backend
    // For now, simulate login and redirect to employer dashboard
    setTimeout(() => {
      setIsLoading(false);
      router.push('/employer');
    }, 1500);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-md animate-slide-up">
          {/* Mobile back link */}
          <Link href="/auth" className="lg:hidden inline-flex items-center gap-2 mb-8 text-slate-600 hover:text-primary-600 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Link>

          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-primary-500/25">
              J
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Employer Portal</h2>
              <p className="text-slate-500">Access your hiring dashboard</p>
            </div>
          </div>

          <Card variant="elevated" className="mb-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                type="email"
                label="Work Email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                }
                required
              />

              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  label="Password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  icon={
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  }
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-[42px] text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-slate-600">Keep me signed in</span>
                </label>
                <Link href="/auth/forgot-password" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                  Forgot password?
                </Link>
              </div>

              <Button type="submit" fullWidth size="lg" isLoading={isLoading}>
                Access Dashboard
              </Button>
            </form>
          </Card>

          {/* Register link */}
          <p className="text-center text-slate-600">
            New to Jobly for Business?{' '}
            <Link href="/auth/employer/register" className="text-primary-600 hover:text-primary-700 font-semibold">
              Create employer account
            </Link>
          </p>
        </div>
      </div>

      {/* Right Panel - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 to-primary-800 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="hexagons" width="24" height="24" patternUnits="userSpaceOnUse">
                <polygon points="12,0 24,6 24,18 12,24 0,18 0,6" fill="none" stroke="white" strokeWidth="0.3" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#hexagons)" />
          </svg>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center p-12 text-white">
          <Link href="/auth" className="inline-flex items-center gap-2 mb-12 group w-fit">
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-white/80 group-hover:text-white">Back to role selection</span>
          </Link>

          <h1 className="text-4xl font-bold mb-6">
            Build Your<br />
            Dream Team
          </h1>
          <p className="text-xl text-white/80 mb-12 max-w-md">
            Access powerful hiring tools, analytics, and a pool of qualified candidates ready to join your organization.
          </p>

          {/* Testimonial */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 max-w-md">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-xl">
                ST
              </div>
              <div>
                <div className="font-semibold">Sarah Thompson</div>
                <div className="text-white/60 text-sm">Head of Talent, TechCorp</div>
              </div>
            </div>
            <p className="text-white/80 italic">
              &ldquo;Jobly transformed our hiring process. We reduced our time-to-hire by 60% and found candidates that perfectly matched our culture.&rdquo;
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-12">
            {[
              { number: '60%', label: 'Faster Hiring' },
              { number: '85%', label: 'Retention Rate' },
              { number: '3x', label: 'More Applicants' },
            ].map((stat, i) => (
              <div key={i} className="animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="text-2xl font-bold">{stat.number}</div>
                <div className="text-white/60 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Decorative elements */}
          <div className="absolute top-20 right-20 w-40 h-40 border border-white/10 rounded-2xl rotate-12" />
          <div className="absolute bottom-20 right-40 w-20 h-20 bg-white/5 rounded-full" />
        </div>
      </div>
    </div>
  );
}
