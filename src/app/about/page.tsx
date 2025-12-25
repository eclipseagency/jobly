import Image from "next/image";

export default function AboutPage() {
  return (
    <main>
      {/* Hero Section */}
      <section
        style={{
          padding: "6rem 2rem",
          background: "linear-gradient(135deg, #0070f3 0%, #00a8ff 100%)",
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
            About Jobly
          </h1>
          <p style={{ fontSize: "1.3rem", opacity: 0.9 }}>
            Connecting talented professionals with their dream careers across the
            Philippines and beyond.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section style={{ padding: "6rem 2rem" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "4rem",
              alignItems: "center",
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: "2.5rem",
                  marginBottom: "1.5rem",
                  fontWeight: "bold",
                }}
              >
                Our Mission
              </h2>
              <p
                style={{
                  fontSize: "1.2rem",
                  lineHeight: "1.8",
                  color: "#666",
                  marginBottom: "1.5rem",
                }}
              >
                We believe that everyone deserves a fulfilling career. Our mission is
                to make job searching simpler, faster, and more effective by
                connecting job seekers with opportunities that match their skills and
                aspirations.
              </p>
              <p
                style={{
                  fontSize: "1.2rem",
                  lineHeight: "1.8",
                  color: "#666",
                }}
              >
                Founded in 2024, Jobly has grown to become one of the Philippines'
                leading job platforms, helping thousands of professionals find their
                perfect roles and empowering companies to build exceptional teams.
              </p>
            </div>
            <div
              style={{
                position: "relative",
                width: "100%",
                height: "400px",
                borderRadius: "12px",
                overflow: "hidden",
                boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)",
              }}
            >
              <Image
                src="/images/hero-team.jpg"
                alt="Jobly Team"
                fill
                style={{ objectFit: "cover" }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section style={{ padding: "6rem 2rem", backgroundColor: "#f9fafb" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <h2 style={{ fontSize: "2.5rem", marginBottom: "1rem", fontWeight: "bold" }}>
              Our Values
            </h2>
            <p style={{ fontSize: "1.2rem", color: "#666" }}>
              The principles that guide everything we do
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "3rem",
            }}
          >
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
                  fontSize: "2.5rem",
                }}
              >
                💡
              </div>
              <h3 style={{ fontSize: "1.5rem", marginBottom: "1rem", fontWeight: "600" }}>
                Innovation
              </h3>
              <p style={{ color: "#666", lineHeight: "1.6" }}>
                We constantly innovate to provide the best job search experience
                using cutting-edge technology.
              </p>
            </div>

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
                  fontSize: "2.5rem",
                }}
              >
                🤝
              </div>
              <h3 style={{ fontSize: "1.5rem", marginBottom: "1rem", fontWeight: "600" }}>
                Trust
              </h3>
              <p style={{ color: "#666", lineHeight: "1.6" }}>
                We build trust through transparency, verified employers, and
                authentic job opportunities.
              </p>
            </div>

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
                  fontSize: "2.5rem",
                }}
              >
                ❤️
              </div>
              <h3 style={{ fontSize: "1.5rem", marginBottom: "1rem", fontWeight: "600" }}>
                Empowerment
              </h3>
              <p style={{ color: "#666", lineHeight: "1.6" }}>
                We empower job seekers with tools, resources, and support to
                achieve their career goals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{ padding: "6rem 2rem" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <h2 style={{ fontSize: "2.5rem", marginBottom: "1rem", fontWeight: "bold" }}>
              Our Impact
            </h2>
            <p style={{ fontSize: "1.2rem", color: "#666" }}>
              Numbers that reflect our commitment to success
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "3rem",
              textAlign: "center",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "3.5rem",
                  fontWeight: "bold",
                  color: "#0070f3",
                  marginBottom: "0.5rem",
                }}
              >
                50K+
              </div>
              <div style={{ fontSize: "1.1rem", color: "#666" }}>
                Jobs Posted
              </div>
            </div>
            <div>
              <div
                style={{
                  fontSize: "3.5rem",
                  fontWeight: "bold",
                  color: "#0070f3",
                  marginBottom: "0.5rem",
                }}
              >
                10K+
              </div>
              <div style={{ fontSize: "1.1rem", color: "#666" }}>
                Partner Companies
              </div>
            </div>
            <div>
              <div
                style={{
                  fontSize: "3.5rem",
                  fontWeight: "bold",
                  color: "#0070f3",
                  marginBottom: "0.5rem",
                }}
              >
                100K+
              </div>
              <div style={{ fontSize: "1.1rem", color: "#666" }}>
                Active Users
              </div>
            </div>
            <div>
              <div
                style={{
                  fontSize: "3.5rem",
                  fontWeight: "bold",
                  color: "#0070f3",
                  marginBottom: "0.5rem",
                }}
              >
                95%
              </div>
              <div style={{ fontSize: "1.1rem", color: "#666" }}>
                Satisfaction Rate
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        style={{
          padding: "6rem 2rem",
          backgroundColor: "#0070f3",
          color: "white",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "2.5rem", marginBottom: "1.5rem", fontWeight: "bold" }}>
            Join Our Community
          </h2>
          <p style={{ fontSize: "1.2rem", marginBottom: "2rem", opacity: 0.9 }}>
            Be part of the thousands who have found success with Jobly. Start your
            journey today.
          </p>
          <a
            href="/register"
            style={{
              backgroundColor: "white",
              color: "#0070f3",
              padding: "1rem 2.5rem",
              borderRadius: "8px",
              textDecoration: "none",
              fontSize: "1.1rem",
              fontWeight: "600",
              display: "inline-block",
            }}
          >
            Get Started
          </a>
        </div>
      </section>
    </main>
  );
}
