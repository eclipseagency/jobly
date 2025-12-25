import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jobly",
  description: "Job management application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header
          style={{
            backgroundColor: "white",
            borderBottom: "1px solid #e5e7eb",
            position: "sticky",
            top: 0,
            zIndex: 50,
          }}
        >
          <nav
            style={{
              maxWidth: "1400px",
              margin: "0 auto",
              padding: "1rem 2rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {/* Logo */}
            <a
              href="/"
              style={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                color: "#0070f3",
                textDecoration: "none",
              }}
            >
              Jobly
            </a>

            {/* Navigation Links */}
            <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
              <a
                href="/"
                style={{
                  color: "#374151",
                  textDecoration: "none",
                  fontSize: "1rem",
                }}
              >
                Find Jobs
              </a>
              <a
                href="/employers"
                style={{
                  color: "#374151",
                  textDecoration: "none",
                  fontSize: "1rem",
                }}
              >
                For Employers
              </a>
              <a
                href="/about"
                style={{
                  color: "#374151",
                  textDecoration: "none",
                  fontSize: "1rem",
                }}
              >
                About
              </a>
              <a
                href="/login"
                style={{
                  color: "#374151",
                  textDecoration: "none",
                  fontSize: "1rem",
                }}
              >
                Login
              </a>
              <a
                href="/register"
                style={{
                  backgroundColor: "#0070f3",
                  color: "white",
                  padding: "0.5rem 1.5rem",
                  borderRadius: "6px",
                  textDecoration: "none",
                  fontSize: "1rem",
                  fontWeight: "500",
                }}
              >
                Sign Up
              </a>
            </div>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
