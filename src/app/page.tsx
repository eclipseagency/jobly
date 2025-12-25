import Image from "next/image";

export default function Home() {
  return (
    <main>
      {/* Hero Section */}
      <section
        style={{
          padding: "4rem 2rem",
          maxWidth: "1400px",
          margin: "0 auto",
          minHeight: "600px",
          display: "flex",
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "4rem",
            alignItems: "center",
            width: "100%",
          }}
        >
          {/* Left: Hero Content */}
          <div>
            <h1
              style={{
                fontSize: "3.5rem",
                fontWeight: "bold",
                marginBottom: "1.5rem",
                lineHeight: "1.2",
                color: "#1a1a1a",
              }}
            >
              Find your dream job in the Philippines and beyond.
            </h1>
            <p
              style={{
                fontSize: "1.2rem",
                marginBottom: "2.5rem",
                color: "#666",
                lineHeight: "1.6",
              }}
            >
              Connect with top employers, showcase your skills, and take the next
              step in your career journey.
            </p>

            {/* Search Form */}
            <div
              style={{
                display: "flex",
                gap: "1rem",
                marginBottom: "2rem",
                flexWrap: "wrap",
              }}
            >
              <input
                type="text"
                placeholder="Job title or keyword"
                style={{
                  flex: "1",
                  minWidth: "200px",
                  padding: "1rem",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  fontSize: "1rem",
                }}
              />
              <input
                type="text"
                placeholder="Location"
                style={{
                  flex: "1",
                  minWidth: "200px",
                  padding: "1rem",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  fontSize: "1rem",
                }}
              />
              <button
                style={{
                  backgroundColor: "#0070f3",
                  color: "white",
                  padding: "1rem 2rem",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  fontWeight: "600",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                Search Jobs
              </button>
            </div>

            {/* Features */}
            <div
              style={{
                display: "flex",
                gap: "2rem",
                fontSize: "0.95rem",
                color: "#666",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ color: "#0070f3" }}>✓</span>
                <span>Verified Employers</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ color: "#0070f3" }}>✓</span>
                <span>Smart Matching</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ color: "#0070f3" }}>✓</span>
                <span>Free for Seekers</span>
              </div>
            </div>
          </div>

          {/* Right: Team Image */}
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "500px",
              borderRadius: "16px",
              overflow: "hidden",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)",
            }}
          >
            <Image
              src="/images/hero-team.jpg"
              alt="Jobly Team"
              fill
              style={{ objectFit: "cover" }}
              priority
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        style={{
          padding: "6rem 2rem",
          backgroundColor: "#f9fafb",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <h2 style={{ fontSize: "2.5rem", marginBottom: "1rem", fontWeight: "bold" }}>
              Why Choose Jobly?
            </h2>
            <p style={{ fontSize: "1.2rem", color: "#666" }}>
              Everything you need to find your perfect job
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
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  backgroundColor: "#e0f2fe",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 1.5rem",
                  fontSize: "2rem",
                }}
              >
                🎯
              </div>
              <h3 style={{ fontSize: "1.5rem", marginBottom: "1rem", fontWeight: "600" }}>
                Smart Matching
              </h3>
              <p style={{ color: "#666", lineHeight: "1.6" }}>
                Our AI-powered algorithm matches you with jobs that fit your skills,
                experience, and career goals perfectly.
              </p>
            </div>

            {/* Feature 2 */}
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  backgroundColor: "#fef3c7",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 1.5rem",
                  fontSize: "2rem",
                }}
              >
                ✅
              </div>
              <h3 style={{ fontSize: "1.5rem", marginBottom: "1rem", fontWeight: "600" }}>
                Verified Employers
              </h3>
              <p style={{ color: "#666", lineHeight: "1.6" }}>
                All companies on our platform are thoroughly vetted to ensure
                legitimate opportunities and safe work environments.
              </p>
            </div>

            {/* Feature 3 */}
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  backgroundColor: "#dbeafe",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 1.5rem",
                  fontSize: "2rem",
                }}
              >
                💼
              </div>
              <h3 style={{ fontSize: "1.5rem", marginBottom: "1rem", fontWeight: "600" }}>
                Career Support
              </h3>
              <p style={{ color: "#666", lineHeight: "1.6" }}>
                Get access to resume reviews, interview tips, and career coaching
                from industry professionals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section
        style={{
          padding: "6rem 2rem",
          backgroundColor: "#0070f3",
          color: "white",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "3rem",
            textAlign: "center",
          }}
        >
          <div>
            <div style={{ fontSize: "3rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
              50K+
            </div>
            <div style={{ fontSize: "1.1rem", opacity: 0.9 }}>Active Jobs</div>
          </div>
          <div>
            <div style={{ fontSize: "3rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
              10K+
            </div>
            <div style={{ fontSize: "1.1rem", opacity: 0.9 }}>Companies</div>
          </div>
          <div>
            <div style={{ fontSize: "3rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
              100K+
            </div>
            <div style={{ fontSize: "1.1rem", opacity: 0.9 }}>Job Seekers</div>
          </div>
          <div>
            <div style={{ fontSize: "3rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
              95%
            </div>
            <div style={{ fontSize: "1.1rem", opacity: 0.9 }}>Success Rate</div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section style={{ padding: "6rem 2rem" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <h2 style={{ fontSize: "2.5rem", marginBottom: "1rem", fontWeight: "bold" }}>
              How It Works
            </h2>
            <p style={{ fontSize: "1.2rem", color: "#666" }}>
              Get hired in three simple steps
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "3rem" }}>
            {/* Step 1 */}
            <div style={{ position: "relative" }}>
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  backgroundColor: "#0070f3",
                  color: "white",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  marginBottom: "1.5rem",
                }}
              >
                1
              </div>
              <h3 style={{ fontSize: "1.5rem", marginBottom: "1rem", fontWeight: "600" }}>
                Create Your Profile
              </h3>
              <p style={{ color: "#666", lineHeight: "1.6" }}>
                Sign up and build your professional profile in minutes. Add your
                skills, experience, and career preferences.
              </p>
            </div>

            {/* Step 2 */}
            <div style={{ position: "relative" }}>
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  backgroundColor: "#0070f3",
                  color: "white",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  marginBottom: "1.5rem",
                }}
              >
                2
              </div>
              <h3 style={{ fontSize: "1.5rem", marginBottom: "1rem", fontWeight: "600" }}>
                Search & Apply
              </h3>
              <p style={{ color: "#666", lineHeight: "1.6" }}>
                Browse thousands of job listings or let our smart matching system
                recommend perfect opportunities for you.
              </p>
            </div>

            {/* Step 3 */}
            <div style={{ position: "relative" }}>
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  backgroundColor: "#0070f3",
                  color: "white",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  marginBottom: "1.5rem",
                }}
              >
                3
              </div>
              <h3 style={{ fontSize: "1.5rem", marginBottom: "1rem", fontWeight: "600" }}>
                Get Hired
              </h3>
              <p style={{ color: "#666", lineHeight: "1.6" }}>
                Connect with employers, attend interviews, and land your dream job.
                We support you throughout the entire process.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section
        style={{
          padding: "6rem 2rem",
          backgroundColor: "#f9fafb",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <h2 style={{ fontSize: "2.5rem", marginBottom: "1rem", fontWeight: "bold" }}>
              Success Stories
            </h2>
            <p style={{ fontSize: "1.2rem", color: "#666" }}>
              Hear from professionals who found their dream jobs through Jobly
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2rem" }}>
            {/* Testimonial 1 */}
            <div
              style={{
                backgroundColor: "white",
                padding: "2rem",
                borderRadius: "12px",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              }}
            >
              <div style={{ marginBottom: "1rem", color: "#fbbf24", fontSize: "1.2rem" }}>
                ★★★★★
              </div>
              <p style={{ color: "#666", lineHeight: "1.6", marginBottom: "1.5rem" }}>
                "Jobly helped me land my dream job as a software engineer in just 2
                weeks! The platform is intuitive and the job matches were spot on."
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div
                  style={{
                    width: "50px",
                    height: "50px",
                    backgroundColor: "#e0f2fe",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold",
                  }}
                >
                  MC
                </div>
                <div>
                  <div style={{ fontWeight: "600" }}>Maria Cruz</div>
                  <div style={{ fontSize: "0.9rem", color: "#666" }}>
                    Software Engineer
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div
              style={{
                backgroundColor: "white",
                padding: "2rem",
                borderRadius: "12px",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              }}
            >
              <div style={{ marginBottom: "1rem", color: "#fbbf24", fontSize: "1.2rem" }}>
                ★★★★★
              </div>
              <p style={{ color: "#666", lineHeight: "1.6", marginBottom: "1.5rem" }}>
                "The career support team at Jobly was amazing. They helped me refine
                my resume and prepare for interviews. Highly recommended!"
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div
                  style={{
                    width: "50px",
                    height: "50px",
                    backgroundColor: "#fef3c7",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold",
                  }}
                >
                  JS
                </div>
                <div>
                  <div style={{ fontWeight: "600" }}>Juan Santos</div>
                  <div style={{ fontSize: "0.9rem", color: "#666" }}>
                    Marketing Manager
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div
              style={{
                backgroundColor: "white",
                padding: "2rem",
                borderRadius: "12px",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              }}
            >
              <div style={{ marginBottom: "1rem", color: "#fbbf24", fontSize: "1.2rem" }}>
                ★★★★★
              </div>
              <p style={{ color: "#666", lineHeight: "1.6", marginBottom: "1.5rem" }}>
                "I love how easy it is to search for jobs and apply. The verified
                employers feature gives me peace of mind. Great platform!"
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div
                  style={{
                    width: "50px",
                    height: "50px",
                    backgroundColor: "#dbeafe",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold",
                  }}
                >
                  AR
                </div>
                <div>
                  <div style={{ fontWeight: "600" }}>Anna Reyes</div>
                  <div style={{ fontSize: "0.9rem", color: "#666" }}>
                    HR Specialist
                  </div>
                </div>
              </div>
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
          <h2 style={{ fontSize: "3rem", marginBottom: "1.5rem", fontWeight: "bold" }}>
            Ready to Start Your Journey?
          </h2>
          <p style={{ fontSize: "1.3rem", marginBottom: "2.5rem", opacity: 0.9 }}>
            Join thousands of professionals who have found their dream jobs through
            Jobly. Create your profile today and start receiving personalized job
            matches.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
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
              Get Started Free
            </a>
            <a
              href="/employers"
              style={{
                backgroundColor: "transparent",
                color: "white",
                padding: "1rem 2.5rem",
                borderRadius: "8px",
                textDecoration: "none",
                fontSize: "1.1rem",
                fontWeight: "600",
                display: "inline-block",
                border: "2px solid white",
              }}
            >
              For Employers
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
