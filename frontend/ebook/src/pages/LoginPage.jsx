import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import API_PATHS from "../utils/apiPaths";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const from = location.state?.from?.pathname || "/dashboard";

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Please enter a valid email address.";
    if (!form.password || form.password.length < 6)
      errs.password = "Password must be at least 6 characters.";
    return errs;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
    setServerError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);

    setLoading(true);
    try {
      // POST /api/auth/login returns { message, _id, name, email, token }
      const res = await axiosInstance.post(API_PATHS.AUTH.LOGIN, {
        email: form.email,
        password: form.password,
      });

      // Build user object from response fields
      login(res.data.token, {
        _id: res.data._id,
        name: res.data.name,
        email: res.data.email,
      });

      navigate(from, { replace: true });
    } catch (err) {
      setServerError(
        err.response?.data?.message || "Invalid credentials. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (hasError) => ({
    width: "100%",
    height: "44px",
    padding: "0 14px 0 40px",
    borderRadius: "10px",
    border: `1px solid ${hasError ? "#DC2626" : "#E5E7EB"}`,
    background: "#fff",
    fontSize: "14px",
    fontFamily: "inherit",
    color: "#111827",
    outline: "none",
    transition: "border-color 0.2s",
    boxSizing: "border-box",
  });

  const iconWrap = {
    position: "absolute",
    left: "13px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#9CA3AF",
    display: "flex",
    pointerEvents: "none",
  };

  return (
    <div
      style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        minHeight: "100vh",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      {/* ── Left Panel ── */}
      <div
        style={{
          background: "#0F0E1A",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "2.5rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              background: "#4F46E5",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
          </div>
          <span style={{ fontSize: "1.15rem", fontWeight: 700, color: "#fff" }}>
            Ebookify
          </span>
        </div>

        {/* Body */}
        <div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: "rgba(79,70,229,0.2)",
              border: "0.5px solid rgba(79,70,229,0.4)",
              color: "#818CF8",
              fontSize: "12px",
              fontWeight: 600,
              padding: "5px 12px",
              borderRadius: "999px",
              marginBottom: "1.25rem",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#818CF8">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            AI-Powered Publishing
          </div>

          <h2
            style={{
              fontSize: "clamp(1.5rem, 3vw, 2rem)",
              fontWeight: 700,
              color: "#fff",
              lineHeight: 1.25,
              marginBottom: "1rem",
            }}
          >
            Create Stunning
            <br />
            <span style={{ color: "#818CF8" }}>Ebooks in Minutes</span>
          </h2>

          <p
            style={{
              fontSize: "14px",
              color: "#9CA3AF",
              lineHeight: 1.7,
              marginBottom: "2rem",
              maxWidth: "320px",
            }}
          >
            From idea to published ebook — write, design, and export
            professional-quality books effortlessly with AI.
          </p>

          {/* Mini book cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px",
            }}
          >
            {[
              {
                title: "From Chaos to Clarity",
                pages: "247 pages",
                color: "linear-gradient(135deg,#667eea,#764ba2)",
              },
              {
                title: "Passive Income Blueprint",
                pages: "189 pages",
                color: "linear-gradient(135deg,#f093fb,#f5576c)",
              },
              {
                title: "Digital Minimalism",
                pages: "312 pages",
                color: "linear-gradient(135deg,#4facfe,#00f2fe)",
              },
              {
                title: "Plant-Based on a Budget",
                pages: "156 pages",
                color: "linear-gradient(135deg,#43e97b,#38f9d7)",
              },
            ].map((b) => (
              <div
                key={b.title}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "0.5px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  padding: "12px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "46px",
                    borderRadius: "6px",
                    background: b.color,
                    flexShrink: 0,
                  }}
                />
                <div>
                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#E5E7EB",
                      lineHeight: 1.3,
                    }}
                  >
                    {b.title}
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#6B7280",
                      marginTop: "2px",
                    }}
                  >
                    {b.pages}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ fontSize: "12px", color: "#4B5563" }}>
          © 2025 Ebookify · 50K+ books created
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2.5rem",
          background: "#F9FAFB",
        }}
      >
        <div style={{ width: "100%", maxWidth: "380px" }}>
          {/* Heading */}
          <div style={{ marginBottom: "2rem" }}>
            <div
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "#4F46E5",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "0.5rem",
              }}
            >
              Welcome back
            </div>
            <h1
              style={{
                fontSize: "1.6rem",
                fontWeight: 700,
                color: "#111827",
                marginBottom: "0.3rem",
              }}
            >
              Sign in to Ebookify
            </h1>
            <p style={{ fontSize: "14px", color: "#6B7280" }}>
              Don't have an account?{" "}
              <Link
                to="/signup"
                style={{
                  color: "#4F46E5",
                  fontWeight: 500,
                  textDecoration: "none",
                }}
              >
                Sign up free
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Server error */}
            {serverError && (
              <div
                style={{
                  background: "#FEF2F2",
                  border: "1px solid #FECACA",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  fontSize: "13px",
                  color: "#DC2626",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "1rem",
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#DC2626"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {serverError}
              </div>
            )}

            {/* Email */}
            <div style={{ marginBottom: "1.1rem" }}>
              <label
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#374151",
                  marginBottom: "6px",
                  display: "block",
                }}
              >
                Email address
              </label>
              <div style={{ position: "relative" }}>
                <span style={iconWrap}>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </span>
                <input
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  style={inputStyle(errors.email)}
                />
              </div>
              {errors.email && (
                <p
                  style={{
                    fontSize: "12px",
                    color: "#DC2626",
                    marginTop: "5px",
                  }}
                >
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div style={{ marginBottom: "1rem" }}>
              <label
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#374151",
                  marginBottom: "6px",
                  display: "block",
                }}
              >
                Password
              </label>
              <div style={{ position: "relative" }}>
                <span style={iconWrap}>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  style={{
                    ...inputStyle(errors.password),
                    paddingRight: "40px",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "13px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#9CA3AF",
                    display: "flex",
                    padding: 0,
                  }}
                >
                  {showPassword ? (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p
                  style={{
                    fontSize: "12px",
                    color: "#DC2626",
                    marginTop: "5px",
                  }}
                >
                  {errors.password}
                </p>
              )}
            </div>

            {/* Remember + Forgot */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "1.25rem",
              }}
            >
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "13px",
                  color: "#6B7280",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  style={{
                    accentColor: "#4F46E5",
                    width: "14px",
                    height: "14px",
                  }}
                />
                Remember me
              </label>
              <Link
                to="/forgot-password"
                style={{
                  fontSize: "13px",
                  color: "#4F46E5",
                  fontWeight: 500,
                  textDecoration: "none",
                }}
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                height: "46px",
                borderRadius: "10px",
                background: loading ? "#818CF8" : "#4F46E5",
                color: "#fff",
                fontSize: "15px",
                fontWeight: 600,
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                marginBottom: "1.25rem",
                transition: "background 0.2s",
              }}
            >
              {loading ? (
                <>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ animation: "spin 1s linear infinite" }}
                  >
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  Signing in...
                </>
              ) : (
                <>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                    <polyline points="10 17 15 12 10 7" />
                    <line x1="15" y1="12" x2="3" y2="12" />
                  </svg>
                  Sign in
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "1.25rem",
            }}
          >
            <div style={{ flex: 1, height: "0.5px", background: "#E5E7EB" }} />
            <span style={{ fontSize: "12px", color: "#9CA3AF" }}>
              or continue with
            </span>
            <div style={{ flex: 1, height: "0.5px", background: "#E5E7EB" }} />
          </div>

          {/* Google */}
          <button
            style={{
              width: "100%",
              height: "44px",
              borderRadius: "10px",
              border: "1px solid #E5E7EB",
              background: "#fff",
              fontSize: "14px",
              fontWeight: 500,
              color: "#374151",
              fontFamily: "inherit",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
