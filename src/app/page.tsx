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

      {/* Content Section */}
      <section
        style={{
          padding: "4rem 2rem",
          maxWidth: "1200px",
          margin: "0 auto",
          backgroundColor: "#f9fafb",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h2 style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>
            Why Choose Jobly?
          </h2>
          <p style={{ fontSize: "1.2rem", color: "#666" }}>
            The complete solution for managing your jobs and team
          </p>
        </div>
      </section>
    </main>
  );
}
