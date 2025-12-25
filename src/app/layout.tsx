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
        <footer
          style={{
            backgroundColor: "#1f2937",
            color: "white",
            padding: "4rem 2rem 2rem",
          }}
        >
          <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
            {/* Footer Content */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr 1fr 1fr",
                gap: "3rem",
                marginBottom: "3rem",
              }}
            >
              {/* Company Info */}
              <div>
                <h3
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: "bold",
                    marginBottom: "1rem",
                    color: "#60a5fa",
                  }}
                >
                  Jobly
                </h3>
                <p style={{ color: "#d1d5db", lineHeight: "1.6", marginBottom: "1rem" }}>
                  Your trusted partner in finding the perfect career opportunity.
                  Connecting talented professionals with leading companies across
                  the Philippines.
                </p>
                <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
                  <a
                    href="#"
                    style={{
                      width: "40px",
                      height: "40px",
                      backgroundColor: "#374151",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      textDecoration: "none",
                      fontSize: "1.2rem",
                    }}
                  >
                    📘
                  </a>
                  <a
                    href="#"
                    style={{
                      width: "40px",
                      height: "40px",
                      backgroundColor: "#374151",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      textDecoration: "none",
                      fontSize: "1.2rem",
                    }}
                  >
                    🐦
                  </a>
                  <a
                    href="#"
                    style={{
                      width: "40px",
                      height: "40px",
                      backgroundColor: "#374151",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      textDecoration: "none",
                      fontSize: "1.2rem",
                    }}
                  >
                    💼
                  </a>
                </div>
              </div>

              {/* For Job Seekers */}
              <div>
                <h4
                  style={{
                    fontSize: "1.1rem",
                    fontWeight: "600",
                    marginBottom: "1rem",
                  }}
                >
                  For Job Seekers
                </h4>
                <ul style={{ listStyle: "none", padding: 0 }}>
                  <li style={{ marginBottom: "0.75rem" }}>
                    <a
                      href="/"
                      style={{
                        color: "#d1d5db",
                        textDecoration: "none",
                      }}
                    >
                      Browse Jobs
                    </a>
                  </li>
                  <li style={{ marginBottom: "0.75rem" }}>
                    <a
                      href="/register"
                      style={{
                        color: "#d1d5db",
                        textDecoration: "none",
                      }}
                    >
                      Create Profile
                    </a>
                  </li>
                  <li style={{ marginBottom: "0.75rem" }}>
                    <a
                      href="#"
                      style={{
                        color: "#d1d5db",
                        textDecoration: "none",
                      }}
                    >
                      Career Resources
                    </a>
                  </li>
                  <li style={{ marginBottom: "0.75rem" }}>
                    <a
                      href="#"
                      style={{
                        color: "#d1d5db",
                        textDecoration: "none",
                      }}
                    >
                      Resume Tips
                    </a>
                  </li>
                </ul>
              </div>

              {/* For Employers */}
              <div>
                <h4
                  style={{
                    fontSize: "1.1rem",
                    fontWeight: "600",
                    marginBottom: "1rem",
                  }}
                >
                  For Employers
                </h4>
                <ul style={{ listStyle: "none", padding: 0 }}>
                  <li style={{ marginBottom: "0.75rem" }}>
                    <a
                      href="/employers"
                      style={{
                        color: "#d1d5db",
                        textDecoration: "none",
                      }}
                    >
                      Post a Job
                    </a>
                  </li>
                  <li style={{ marginBottom: "0.75rem" }}>
                    <a
                      href="/employers"
                      style={{
                        color: "#d1d5db",
                        textDecoration: "none",
                      }}
                    >
                      Pricing
                    </a>
                  </li>
                  <li style={{ marginBottom: "0.75rem" }}>
                    <a
                      href="#"
                      style={{
                        color: "#d1d5db",
                        textDecoration: "none",
                      }}
                    >
                      Employer Dashboard
                    </a>
                  </li>
                  <li style={{ marginBottom: "0.75rem" }}>
                    <a
                      href="#"
                      style={{
                        color: "#d1d5db",
                        textDecoration: "none",
                      }}
                    >
                      Hiring Solutions
                    </a>
                  </li>
                </ul>
              </div>

              {/* Company */}
              <div>
                <h4
                  style={{
                    fontSize: "1.1rem",
                    fontWeight: "600",
                    marginBottom: "1rem",
                  }}
                >
                  Company
                </h4>
                <ul style={{ listStyle: "none", padding: 0 }}>
                  <li style={{ marginBottom: "0.75rem" }}>
                    <a
                      href="/about"
                      style={{
                        color: "#d1d5db",
                        textDecoration: "none",
                      }}
                    >
                      About Us
                    </a>
                  </li>
                  <li style={{ marginBottom: "0.75rem" }}>
                    <a
                      href="#"
                      style={{
                        color: "#d1d5db",
                        textDecoration: "none",
                      }}
                    >
                      Contact
                    </a>
                  </li>
                  <li style={{ marginBottom: "0.75rem" }}>
                    <a
                      href="#"
                      style={{
                        color: "#d1d5db",
                        textDecoration: "none",
                      }}
                    >
                      Privacy Policy
                    </a>
                  </li>
                  <li style={{ marginBottom: "0.75rem" }}>
                    <a
                      href="#"
                      style={{
                        color: "#d1d5db",
                        textDecoration: "none",
                      }}
                    >
                      Terms of Service
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Footer Bottom */}
            <div
              style={{
                borderTop: "1px solid #374151",
                paddingTop: "2rem",
                textAlign: "center",
                color: "#9ca3af",
                fontSize: "0.9rem",
              }}
            >
              <p>© 2024 Jobly. All rights reserved. Made with ❤️ in the Philippines.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
