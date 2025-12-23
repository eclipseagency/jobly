"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent">
              JOBLY
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/jobs"
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              Find Jobs
            </Link>
            <Link
              href="/companies"
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              Companies
            </Link>
            <Link
              href="/for-employers"
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              For Employers
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost">Log in</Button>
            </Link>
            <Link href="/register">
              <Button variant="primary">Sign up</Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg
              className="w-6 h-6 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col space-y-4">
              <Link
                href="/jobs"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Find Jobs
              </Link>
              <Link
                href="/companies"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Companies
              </Link>
              <Link
                href="/for-employers"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                For Employers
              </Link>
              <hr className="border-gray-200" />
              <Link href="/login">
                <Button variant="ghost" className="w-full">
                  Log in
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="primary" className="w-full">
                  Sign up
                </Button>
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
