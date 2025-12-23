"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button, Card, CardContent, Input } from "@/components/ui";

type Step = "phone" | "otp" | "role";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const formattedPhone = phone.startsWith("+63")
        ? phone
        : `+63${phone.replace(/^0/, "")}`;

      const res = await fetch("/api/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: formattedPhone, purpose: "LOGIN" }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send OTP");
      }

      // In development, show OTP in console
      if (data.data?.otp) {
        console.log("Development OTP:", data.data.otp);
      }

      setStep("otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const formattedPhone = phone.startsWith("+63")
        ? phone
        : `+63${phone.replace(/^0/, "")}`;

      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: formattedPhone,
          otp,
          ...(selectedRole && { role: selectedRole }),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Invalid OTP");
      }

      // Check if new user needs to select role
      if (data.data?.isNewUser) {
        setIsNewUser(true);
        setStep("role");
        return;
      }

      // Redirect based on role
      const role = data.data?.user?.role;
      if (role === "JOBSEEKER") {
        router.push("/dashboard/jobseeker");
      } else if (role === "EMPLOYER_OWNER" || role === "EMPLOYER_STAFF") {
        router.push("/dashboard/employer");
      } else {
        router.push("/");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectRole = async (role: string) => {
    setSelectedRole(role);
    setError("");
    setIsLoading(true);

    try {
      const formattedPhone = phone.startsWith("+63")
        ? phone
        : `+63${phone.replace(/^0/, "")}`;

      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: formattedPhone,
          otp,
          role,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create account");
      }

      // Redirect based on role
      if (role === "JOBSEEKER") {
        router.push("/dashboard/jobseeker");
      } else {
        router.push("/dashboard/employer");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-grow flex items-center justify-center py-12 px-4">
        <Card variant="elevated" className="w-full max-w-md">
          <CardContent className="p-8">
            {/* Logo */}
            <div className="text-center mb-8">
              <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent">
                JOBLY
              </span>
              <p className="text-gray-600 mt-2">
                {step === "phone" && "Sign in with your phone number"}
                {step === "otp" && "Enter the verification code"}
                {step === "role" && "Choose how you want to use Jobly"}
              </p>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* Phone Step */}
            {step === "phone" && (
              <form onSubmit={handleRequestOtp}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                        +63
                      </span>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                        placeholder="9XX XXX XXXX"
                        className="flex-1 px-4 py-2.5 rounded-r-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        maxLength={10}
                        required
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      We&apos;ll send you a verification code
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    isLoading={isLoading}
                    disabled={phone.length < 10}
                  >
                    Continue
                  </Button>
                </div>
              </form>
            )}

            {/* OTP Step */}
            {step === "otp" && (
              <form onSubmit={handleVerifyOtp}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Verification Code
                    </label>
                    <Input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                      className="text-center text-2xl tracking-widest"
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Sent to +63{phone}
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    isLoading={isLoading}
                    disabled={otp.length < 6}
                  >
                    Verify
                  </Button>

                  <button
                    type="button"
                    onClick={() => setStep("phone")}
                    className="w-full text-sm text-gray-600 hover:text-gray-900"
                  >
                    Use a different number
                  </button>
                </div>
              </form>
            )}

            {/* Role Selection Step */}
            {step === "role" && (
              <div className="space-y-4">
                <button
                  onClick={() => handleSelectRole("JOBSEEKER")}
                  disabled={isLoading}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        I&apos;m looking for a job
                      </div>
                      <div className="text-sm text-gray-500">
                        Find opportunities and apply to jobs
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleSelectRole("EMPLOYER_OWNER")}
                  disabled={isLoading}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-emerald-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        I&apos;m hiring talent
                      </div>
                      <div className="text-sm text-gray-500">
                        Post jobs and find candidates
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            )}

            {/* Footer */}
            <div className="mt-8 text-center text-sm text-gray-500">
              By continuing, you agree to our{" "}
              <Link href="/terms" className="text-blue-600 hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-blue-600 hover:underline">
                Privacy Policy
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
