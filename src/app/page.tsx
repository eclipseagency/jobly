import Image from "next/image";

export default function Home() {
  return (
    <main>
      {/* Hero Section */}
      <section
        style={{
          position: "relative",
          height: "600px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 0,
          }}
        >
          <Image
            src="/images/hero-team.jpg"
            alt="Jobly Team"
            fill
            style={{ objectFit: "cover" }}
            priority
          />
          {/* Overlay */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.4)",
            }}
          />
        </div>

        {/* Hero Content */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            textAlign: "center",
            color: "white",
            padding: "2rem",
            maxWidth: "800px",
          }}
        >
          <h1
            style={{
              fontSize: "3.5rem",
              fontWeight: "bold",
              marginBottom: "1rem",
              textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
            }}
          >
            Welcome to Jobly
          </h1>
          <p
            style={{
              fontSize: "1.5rem",
              marginBottom: "2rem",
              textShadow: "1px 1px 2px rgba(0, 0, 0, 0.5)",
            }}
          >
            Streamline your job management and grow your business
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
            <a
              href="/register"
              style={{
                backgroundColor: "#0070f3",
                color: "white",
                padding: "1rem 2rem",
                borderRadius: "8px",
                textDecoration: "none",
                fontSize: "1.1rem",
                fontWeight: "500",
                display: "inline-block",
                transition: "background-color 0.3s",
              }}
            >
              Get Started
            </a>
            <a
              href="#features"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                color: "white",
                padding: "1rem 2rem",
                borderRadius: "8px",
                textDecoration: "none",
                fontSize: "1.1rem",
                fontWeight: "500",
                display: "inline-block",
                border: "2px solid white",
                transition: "background-color 0.3s",
              }}
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section style={{ padding: "4rem 2rem", maxWidth: "1200px", margin: "0 auto" }}>
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
