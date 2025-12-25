export default function LoginPage() {
  return (
    <main
      style={{
        minHeight: "calc(100vh - 80px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f9fafb",
        padding: "2rem",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "3rem",
          borderRadius: "12px",
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
          maxWidth: "450px",
          width: "100%",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: "bold",
              marginBottom: "0.5rem",
              color: "#1a1a1a",
            }}
          >
            Welcome Back
          </h1>
          <p style={{ color: "#666" }}>
            Sign in to your Jobly account
          </p>
        </div>

        <form>
          {/* Email Field */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label
              htmlFor="email"
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: "500",
                color: "#374151",
              }}
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              placeholder="you@example.com"
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "1rem",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Password Field */}
          <div style={{ marginBottom: "1rem" }}>
            <label
              htmlFor="password"
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: "500",
                color: "#374151",
              }}
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              placeholder="Enter your password"
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "1rem",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Remember Me & Forgot Password */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1.5rem",
            }}
          >
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <input type="checkbox" name="remember" />
              <span style={{ fontSize: "0.9rem", color: "#666" }}>Remember me</span>
            </label>
            <a
              href="#"
              style={{
                fontSize: "0.9rem",
                color: "#0070f3",
                textDecoration: "none",
              }}
            >
              Forgot password?
            </a>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            style={{
              width: "100%",
              backgroundColor: "#0070f3",
              color: "white",
              padding: "0.875rem",
              border: "none",
              borderRadius: "8px",
              fontSize: "1rem",
              fontWeight: "600",
              cursor: "pointer",
              marginBottom: "1.5rem",
            }}
          >
            Sign In
          </button>

          {/* Divider */}
          <div
            style={{
              position: "relative",
              textAlign: "center",
              marginBottom: "1.5rem",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: 0,
                right: 0,
                borderTop: "1px solid #e5e7eb",
              }}
            />
            <span
              style={{
                position: "relative",
                backgroundColor: "white",
                padding: "0 1rem",
                color: "#666",
                fontSize: "0.9rem",
              }}
            >
              Or continue with
            </span>
          </div>

          {/* Social Login Buttons */}
          <div style={{ display: "grid", gap: "1rem", marginBottom: "1.5rem" }}>
            <button
              type="button"
              style={{
                width: "100%",
                backgroundColor: "white",
                color: "#374151",
                padding: "0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "1rem",
                fontWeight: "500",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
              }}
            >
              <span>🔵</span>
              Continue with Google
            </button>
            <button
              type="button"
              style={{
                width: "100%",
                backgroundColor: "white",
                color: "#374151",
                padding: "0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "1rem",
                fontWeight: "500",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
              }}
            >
              <span>📘</span>
              Continue with Facebook
            </button>
          </div>

          {/* Sign Up Link */}
          <div style={{ textAlign: "center", color: "#666", fontSize: "0.95rem" }}>
            Don't have an account?{" "}
            <a
              href="/register"
              style={{
                color: "#0070f3",
                textDecoration: "none",
                fontWeight: "600",
              }}
            >
              Sign up
            </a>
          </div>
        </form>
      </div>
    </main>
  );
}
