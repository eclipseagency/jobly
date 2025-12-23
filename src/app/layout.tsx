import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jobly - Where Talent Meets Opportunity",
  description: "The modern job platform connecting exceptional talent with innovative companies. Find your dream job or hire your next star employee.",
  keywords: "jobs, hiring, recruitment, career, employment, job search, talent acquisition",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
