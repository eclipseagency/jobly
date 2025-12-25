'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button, Input, Card } from '@/components/ui';

export default function EmployeeRegisterPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    title: '',
    location: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
      return;
    }
    setIsLoading(true);
    // TODO: Implement actual registration
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-500 to-primary-700 relative overflow-hidden">
        {/* Animated shapes */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-2xl rotate-12 animate-float" />
          <div className="absolute bottom-40 right-20 w-24 h-24 bg-white/10 rounded-full animate-float" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-white/10 rounded-lg rotate-45 animate-float" style={{ animationDelay: '2s' }} />
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
            Launch Your<br />
            Career Journey
          </h1>
          <p className="text-xl text-white/80 mb-12 max-w-md">
            Create your profile in minutes and get discovered by thousands of employers worldwide.
          </p>

          {/* Benefits */}
          <div className="space-y-4">
            {[
              { icon: '🚀', text: 'Get matched with jobs that fit your skills' },
              { icon: '📊', text: 'Track all your applications in one place' },
              { icon: '🔔', text: 'Instant alerts for new opportunities' },
              { icon: '💼', text: 'Build a professional profile that stands out' },
            ].map((benefit, i) => (
              <div key={i} className="flex items-center gap-4 animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                <span className="text-2xl">{benefit.icon}</span>
                <span className="text-white/90">{benefit.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Registration Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-md animate-slide-up">
          {/* Mobile back link */}
          <Link href="/auth" className="lg:hidden inline-flex items-center gap-2 mb-8 text-slate-600 hover:text-primary-600 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Link>

          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-primary-500/25">
              J
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Create Account</h2>
              <p className="text-slate-500">Step {step} of 2 - {step === 1 ? 'Basic Info' : 'About You'}</p>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="flex gap-2 mb-8">
            <div className={`h-1 flex-1 rounded-full ${step >= 1 ? 'bg-primary-500' : 'bg-slate-200'}`} />
            <div className={`h-1 flex-1 rounded-full ${step >= 2 ? 'bg-primary-500' : 'bg-slate-200'}`} />
          </div>

          <Card variant="elevated" className="mb-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {step === 1 ? (
                <>
                  <Input
                    name="fullName"
                    type="text"
                    label="Full Name"
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={handleChange}
                    icon={
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    }
                    required
                  />

                  <Input
                    name="email"
                    type="email"
                    label="Email Address"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    icon={
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    }
                    required
                  />

                  <div className="relative">
                    <Input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      label="Password"
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChange={handleChange}
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

                  {/* Password strength indicator */}
                  <div className="space-y-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            formData.password.length >= level * 3
                              ? level <= 2
                                ? 'bg-red-400'
                                : level === 3
                                ? 'bg-yellow-400'
                                : 'bg-green-400'
                              : 'bg-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-slate-500">Use 8+ characters with a mix of letters, numbers & symbols</p>
                  </div>

                  <Input
                    name="confirmPassword"
                    type="password"
                    label="Confirm Password"
                    placeholder="Re-enter your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    icon={
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    }
                    required
                  />
                </>
              ) : (
                <>
                  <Input
                    name="title"
                    type="text"
                    label="Professional Title"
                    placeholder="e.g., Software Engineer, Marketing Manager"
                    value={formData.title}
                    onChange={handleChange}
                    icon={
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    }
                    required
                  />

                  <Input
                    name="location"
                    type="text"
                    label="Location"
                    placeholder="City, Country"
                    value={formData.location}
                    onChange={handleChange}
                    icon={
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    }
                    required
                  />

                  {/* Terms checkbox */}
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-5 h-5 mt-0.5 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                      required
                    />
                    <span className="text-sm text-slate-600">
                      I agree to Jobly&apos;s{' '}
                      <Link href="/terms" className="text-primary-600 hover:underline">Terms of Service</Link>
                      {' '}and{' '}
                      <Link href="/privacy" className="text-primary-600 hover:underline">Privacy Policy</Link>
                    </span>
                  </label>
                </>
              )}

              <div className="flex gap-3">
                {step === 2 && (
                  <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
                    Back
                  </Button>
                )}
                <Button
                  type="submit"
                  fullWidth={step === 1}
                  size="lg"
                  isLoading={isLoading}
                  className={step === 2 ? 'flex-1' : ''}
                >
                  {step === 1 ? 'Continue' : 'Create Account'}
                </Button>
              </div>
            </form>

            {step === 1 && (
              <>
                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-slate-500">or sign up with</span>
                  </div>
                </div>

                {/* Social signup */}
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="gap-2">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Google
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                    LinkedIn
                  </Button>
                </div>
              </>
            )}
          </Card>

          {/* Login link */}
          <p className="text-center text-slate-600">
            Already have an account?{' '}
            <Link href="/auth/employee/login" className="text-primary-600 hover:text-primary-700 font-semibold">
              Sign in instead
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
