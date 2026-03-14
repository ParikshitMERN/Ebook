import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import API_PATHS from "../utils/apiPaths";
import { useAuth } from "../context/AuthContext";

const getPasswordStrength = (password) => {
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password) && /[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const colors = ["#EF4444", "#F59E0B", "#3B82F6", "#10B981"];
  const labels = ["Weak", "Fair", "Good", "Strong"];
  return {
    score,
    color: colors[score - 1] || "#E5E7EB",
    label:
      password.length === 0 ? "Enter a password" : labels[score - 1] || "Weak",
  };
};

const SignupPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const strength = getPasswordStrength(form.password);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Full name is required.";
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Please enter a valid email address.";
    if (!form.password || form.password.length < 6)
      errs.password = "Password must be at least 6 characters.";
    if (!termsAccepted) errs.terms = "You must accept the Terms of Service.";
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
      // POST /api/auth/register returns { message, token } only
      const res = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
        name: form.name,
        email: form.email,
        password: form.password,
      });

      // Store token so axiosInstance interceptor can use it for next request
      localStorage.setItem("token", res.data.token);

      // Fetch full profile since register doesn't return user data
      // GET /api/auth/profile returns { _id, name, email, avatar, isPro }
      const profileRes = await axiosInstance.get(API_PATHS.AUTH.GET_PROFILE);
      login(res.data.token, profileRes.data);

      navigate("/dashboard");
    } catch (err) {
      setServerError(
        err.response?.data?.message ||
          "Something went wrong. Please try again.",
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
            Get started for free
          </div>

          <h2
            style={{
              fontSize: "clamp(1.4rem, 2.5vw, 1.9rem)",
              fontWeight: 700,
              color: "#fff",
              lineHeight: 1.25,
              marginBottom: "1rem",
            }}
          >
            Start Publishing
            <br />
            <span style={{ color: "#818CF8" }}>Your First Ebook Today</span>
          </h2>

          <p
            style={{
              fontSize: "14px",
              color: "#9CA3AF",
              lineHeight: 1.7,
              marginBottom: "1.75rem",
              maxWidth: "300px",
            }}
          >
            Join 50,000+ creators already writing, designing, and publishing
            ebooks with AI — no experience needed.
          </p>

          {/* Steps */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "14px" }}
          >
            {[
              {
                n: 1,
                title: "Create your account",
                sub: "Free forever, no credit card required",
              },
              {
                n: 2,
                title: "Describe your ebook idea",
                sub: "AI generates your outline in seconds",
              },
              {
                n: 3,
                title: "Write, design & export",
                sub: "Professional PDF or EPUB in minutes",
              },
            ].map((s) => (
              <div
                key={s.n}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    background: "#4F46E5",
                    color: "#fff",
                    fontSize: "12px",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: "2px",
                  }}
                >
                  {s.n}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#E5E7EB",
                    }}
                  >
                    {s.title}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#6B7280",
                      marginTop: "2px",
                    }}
                  >
                    {s.sub}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ fontSize: "12px", color: "#4B5563" }}>
          © 2025 Ebookify · Trusted by 50K+ creators
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem 2.5rem",
          background: "#F9FAFB",
        }}
      >
        <div style={{ width: "100%", maxWidth: "400px" }}>
          {/* Heading */}
          <div style={{ marginBottom: "1.5rem" }}>
            <div
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "#4F46E5",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "0.4rem",
              }}
            >
              Create account
            </div>
            <h1
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                color: "#111827",
                marginBottom: "0.3rem",
              }}
            >
              Join Ebookify for free
            </h1>
            <p style={{ fontSize: "14px", color: "#6B7280" }}>
              Already have an account?{" "}
              <Link
                to="/login"
                style={{
                  color: "#4F46E5",
                  fontWeight: 500,
                  textDecoration: "none",
                }}
              >
                Sign in
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

            {/* Full name */}
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
                Full name
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
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </span>
                <input
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={handleChange}
                  style={inputStyle(errors.name)}
                />
              </div>
              {errors.name && (
                <p
                  style={{
                    fontSize: "12px",
                    color: "#DC2626",
                    marginTop: "4px",
                  }}
                >
                  {errors.name}
                </p>
              )}
            </div>

            {/* Email */}
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
                    marginTop: "4px",
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
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 6 characters"
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

              {/* Password strength bars */}
              {form.password.length > 0 && (
                <>
                  <div
                    style={{ display: "flex", gap: "4px", marginTop: "8px" }}
                  >
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        style={{
                          flex: 1,
                          height: "3px",
                          borderRadius: "999px",
                          background:
                            i <= strength.score ? strength.color : "#E5E7EB",
                          transition: "background 0.3s",
                        }}
                      />
                    ))}
                  </div>
                  <p
                    style={{
                      fontSize: "11px",
                      color: strength.color,
                      marginTop: "4px",
                    }}
                  >
                    {strength.label}
                  </p>
                </>
              )}
              {errors.password && (
                <p
                  style={{
                    fontSize: "12px",
                    color: "#DC2626",
                    marginTop: "4px",
                  }}
                >
                  {errors.password}
                </p>
              )}
            </div>

            {/* Terms */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "8px",
                marginBottom: "1.25rem",
              }}
            >
              <input
                type="checkbox"
                id="terms"
                checked={termsAccepted}
                onChange={(e) => {
                  setTermsAccepted(e.target.checked);
                  setErrors({ ...errors, terms: "" });
                }}
                style={{
                  accentColor: "#4F46E5",
                  width: "14px",
                  height: "14px",
                  marginTop: "2px",
                  flexShrink: 0,
                }}
              />
              <label
                htmlFor="terms"
                style={{ fontSize: "13px", color: "#6B7280", lineHeight: 1.5 }}
              >
                I agree to the{" "}
                <Link
                  to="/terms"
                  style={{
                    color: "#4F46E5",
                    fontWeight: 500,
                    textDecoration: "none",
                  }}
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  to="/privacy"
                  style={{
                    color: "#4F46E5",
                    fontWeight: 500,
                    textDecoration: "none",
                  }}
                >
                  Privacy Policy
                </Link>
              </label>
            </div>
            {errors.terms && (
              <p
                style={{
                  fontSize: "12px",
                  color: "#DC2626",
                  marginTop: "-0.75rem",
                  marginBottom: "0.75rem",
                }}
              >
                {errors.terms}
              </p>
            )}

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
                  Creating account...
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
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="8.5" cy="7" r="4" />
                    <line x1="20" y1="8" x2="20" y2="14" />
                    <line x1="23" y1="11" x2="17" y2="11" />
                  </svg>
                  Create free account
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
              or sign up with
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

export default SignupPage;
