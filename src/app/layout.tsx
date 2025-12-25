import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jobly - Find Your Dream Job in the Philippines",
  description: "Connect with top employers in the Philippines and beyond. Find jobs, post vacancies, and build your career with Jobly - the trusted job portal for Filipino professionals.",
  keywords: "jobs Philippines, hiring Philippines, Manila jobs, Cebu jobs, career Philippines, job portal, employment, recruitment, job search",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="w-full">
      <body className="antialiased w-full min-h-screen">{children}</body>
    </html>
  );
}
