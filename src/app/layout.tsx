import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Jobly - Find Your Dream Job in the Philippines",
  description:
    "Jobly connects talented professionals with top companies in the Philippines. Find your next career opportunity or hire the best talent.",
  keywords: ["jobs", "Philippines", "careers", "hiring", "recruitment"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50`}>{children}</body>
    </html>
  );
}
