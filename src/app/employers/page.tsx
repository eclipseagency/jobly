export default function EmployersPage() {
  return (
    <main>
      {/* Hero Section */}
      <section
        style={{
          padding: "6rem 2rem",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <h1
            style={{
              fontSize: "3.5rem",
              fontWeight: "bold",
              marginBottom: "1.5rem",
            }}
          >
            Find Top Talent for Your Company
          </h1>
          <p style={{ fontSize: "1.3rem", marginBottom: "2.5rem", opacity: 0.9 }}>
            Connect with thousands of qualified professionals in the Philippines
            and build your dream team with Jobly.
          </p>
          <a
            href="/register"
            style={{
              backgroundColor: "white",
              color: "#667eea",
              padding: "1rem 2.5rem",
              borderRadius: "8px",
              textDecoration: "none",
              fontSize: "1.1rem",
              fontWeight: "600",
              display: "inline-block",
            }}
          >
            Post a Job
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: "6rem 2rem" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <h2 style={{ fontSize: "2.5rem", marginBottom: "1rem", fontWeight: "bold" }}>
              Why Employers Choose Jobly
            </h2>
            <p style={{ fontSize: "1.2rem", color: "#666" }}>
              The best platform to find and hire top talent
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "3rem",
            }}
          >
            {/* Feature 1 */}
            <div>
              <div
                style={{
                  width: "70px",
                  height: "70px",
                  backgroundColor: "#e0f2fe",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1.5rem",
                  fontSize: "2rem",
                }}
              >
                👥
              </div>
              <h3 style={{ fontSize: "1.5rem", marginBottom: "1rem", fontWeight: "600" }}>
                Large Talent Pool
              </h3>
              <p style={{ color: "#666", lineHeight: "1.6" }}>
                Access over 100,000 qualified job seekers across all industries
                and skill levels in the Philippines.
              </p>
            </div>

            {/* Feature 2 */}
            <div>
              <div
                style={{
                  width: "70px",
                  height: "70px",
                  backgroundColor: "#fef3c7",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1.5rem",
                  fontSize: "2rem",
                }}
              >
                ⚡
              </div>
              <h3 style={{ fontSize: "1.5rem", marginBottom: "1rem", fontWeight: "600" }}>
                Fast Hiring
              </h3>
              <p style={{ color: "#666", lineHeight: "1.6" }}>
                Fill positions 3x faster with our smart matching algorithm and
                streamlined application process.
              </p>
            </div>

            {/* Feature 3 */}
            <div>
              <div
                style={{
                  width: "70px",
                  height: "70px",
                  backgroundColor: "#dbeafe",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1.5rem",
                  fontSize: "2rem",
                }}
              >
                📊
              </div>
              <h3 style={{ fontSize: "1.5rem", marginBottom: "1rem", fontWeight: "600" }}>
                Employer Dashboard
              </h3>
              <p style={{ color: "#666", lineHeight: "1.6" }}>
                Manage applications, track candidates, and collaborate with your
                team all in one place.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section style={{ padding: "6rem 2rem", backgroundColor: "#f9fafb" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <h2 style={{ fontSize: "2.5rem", marginBottom: "1rem", fontWeight: "bold" }}>
              Simple, Transparent Pricing
            </h2>
            <p style={{ fontSize: "1.2rem", color: "#666" }}>
              Choose the plan that works best for your hiring needs
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "2rem",
            }}
          >
            {/* Basic Plan */}
            <div
              style={{
                backgroundColor: "white",
                padding: "2.5rem",
                borderRadius: "12px",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              }}
            >
              <h3 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "1rem" }}>
                Basic
              </h3>
              <div style={{ marginBottom: "2rem" }}>
                <span style={{ fontSize: "3rem", fontWeight: "bold" }}>₱5,000</span>
                <span style={{ color: "#666" }}>/month</span>
              </div>
              <ul style={{ listStyle: "none", padding: 0, marginBottom: "2rem" }}>
                <li style={{ marginBottom: "0.75rem", color: "#666" }}>
                  ✓ 3 Job Postings
                </li>
                <li style={{ marginBottom: "0.75rem", color: "#666" }}>
                  ✓ 30-day visibility
                </li>
                <li style={{ marginBottom: "0.75rem", color: "#666" }}>
                  ✓ Basic support
                </li>
                <li style={{ marginBottom: "0.75rem", color: "#666" }}>
                  ✓ Applicant tracking
                </li>
              </ul>
              <a
                href="/register"
                style={{
                  display: "block",
                  textAlign: "center",
                  backgroundColor: "#0070f3",
                  color: "white",
                  padding: "0.75rem",
                  borderRadius: "6px",
                  textDecoration: "none",
                  fontWeight: "600",
                }}
              >
                Get Started
              </a>
            </div>

            {/* Pro Plan */}
            <div
              style={{
                backgroundColor: "#0070f3",
                color: "white",
                padding: "2.5rem",
                borderRadius: "12px",
                boxShadow: "0 8px 16px rgba(0, 112, 243, 0.3)",
                transform: "scale(1.05)",
              }}
            >
              <div
                style={{
                  display: "inline-block",
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  padding: "0.25rem 0.75rem",
                  borderRadius: "20px",
                  fontSize: "0.85rem",
                  marginBottom: "0.5rem",
                }}
              >
                MOST POPULAR
              </div>
              <h3 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "1rem" }}>
                Professional
              </h3>
              <div style={{ marginBottom: "2rem" }}>
                <span style={{ fontSize: "3rem", fontWeight: "bold" }}>₱12,000</span>
                <span style={{ opacity: 0.9 }}>/month</span>
              </div>
              <ul style={{ listStyle: "none", padding: 0, marginBottom: "2rem" }}>
                <li style={{ marginBottom: "0.75rem", opacity: 0.95 }}>
                  ✓ 10 Job Postings
                </li>
                <li style={{ marginBottom: "0.75rem", opacity: 0.95 }}>
                  ✓ 60-day visibility
                </li>
                <li style={{ marginBottom: "0.75rem", opacity: 0.95 }}>
                  ✓ Priority support
                </li>
                <li style={{ marginBottom: "0.75rem", opacity: 0.95 }}>
                  ✓ Advanced analytics
                </li>
                <li style={{ marginBottom: "0.75rem", opacity: 0.95 }}>
                  ✓ Featured listings
                </li>
              </ul>
              <a
                href="/register"
                style={{
                  display: "block",
                  textAlign: "center",
                  backgroundColor: "white",
                  color: "#0070f3",
                  padding: "0.75rem",
                  borderRadius: "6px",
                  textDecoration: "none",
                  fontWeight: "600",
                }}
              >
                Get Started
              </a>
            </div>

            {/* Enterprise Plan */}
            <div
              style={{
                backgroundColor: "white",
                padding: "2.5rem",
                borderRadius: "12px",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              }}
            >
              <h3 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "1rem" }}>
                Enterprise
              </h3>
              <div style={{ marginBottom: "2rem" }}>
                <span style={{ fontSize: "2rem", fontWeight: "bold" }}>Custom</span>
              </div>
              <ul style={{ listStyle: "none", padding: 0, marginBottom: "2rem" }}>
                <li style={{ marginBottom: "0.75rem", color: "#666" }}>
                  ✓ Unlimited postings
                </li>
                <li style={{ marginBottom: "0.75rem", color: "#666" }}>
                  ✓ 90-day visibility
                </li>
                <li style={{ marginBottom: "0.75rem", color: "#666" }}>
                  ✓ Dedicated support
                </li>
                <li style={{ marginBottom: "0.75rem", color: "#666" }}>
                  ✓ Custom integrations
                </li>
                <li style={{ marginBottom: "0.75rem", color: "#666" }}>
                  ✓ Employer branding
                </li>
              </ul>
              <a
                href="/register"
                style={{
                  display: "block",
                  textAlign: "center",
                  backgroundColor: "#0070f3",
                  color: "white",
                  padding: "0.75rem",
                  borderRadius: "6px",
                  textDecoration: "none",
                  fontWeight: "600",
                }}
              >
                Contact Sales
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        style={{
          padding: "6rem 2rem",
          backgroundColor: "#1e40af",
          color: "white",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "2.5rem", marginBottom: "1.5rem", fontWeight: "bold" }}>
            Ready to Hire Top Talent?
          </h2>
          <p style={{ fontSize: "1.2rem", marginBottom: "2rem", opacity: 0.9 }}>
            Join over 10,000 companies using Jobly to find and hire the best candidates.
          </p>
          <a
            href="/register"
            style={{
              backgroundColor: "white",
              color: "#1e40af",
              padding: "1rem 2.5rem",
              borderRadius: "8px",
              textDecoration: "none",
              fontSize: "1.1rem",
              fontWeight: "600",
              display: "inline-block",
            }}
          >
            Post Your First Job
          </a>
        </div>
      </section>
    </main>
  );
}
