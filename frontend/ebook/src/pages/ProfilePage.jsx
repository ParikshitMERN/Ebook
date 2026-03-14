import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import API_PATHS from "../utils/apiPaths";
import { useAuth } from "../context/AuthContext";

// ─── Helpers ────────────────────────────────────────────────────
const getImageUrl = (avatar) => {
  if (!avatar) return null;
  if (avatar.startsWith("http")) return avatar;
  if (avatar.startsWith("/")) return `http://localhost:8000${avatar}`;
  return `http://localhost:8000/${avatar}`;
};

const getInitials = (name = "") =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

const formatDate = (dateStr) => {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
};

// ─── ProfilePage ────────────────────────────────────────────────
const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, setUser, logout } = useAuth();
  const avatarRef = useRef(null);

  // Name edit
  const [name, setName] = useState(user?.name || "");
  const [nameLoading, setNameLoading] = useState(false);
  const [nameSuccess, setNameSuccess] = useState(false);
  const [nameError, setNameError] = useState("");

  // Avatar
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState("");

  // Password
  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwError, setPwError] = useState("");
  const [showPw, setShowPw] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Stats
  const [stats, setStats] = useState({ total: 0, published: 0, draft: 0 });

  useEffect(() => {
    setName(user?.name || "");
    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    try {
      const res = await axiosInstance.get(API_PATHS.BOOKS.GET_ALL);
      const books = res.data;
      setStats({
        total: books.length,
        published: books.filter((b) => b.status === "published").length,
        draft: books.filter((b) => b.status === "draft").length,
      });
    } catch {
      // silently fail
    }
  };

  // ── Update name ──
  const handleUpdateName = async (e) => {
    e.preventDefault();
    if (!name.trim()) return setNameError("Name cannot be empty.");
    if (name.trim() === user?.name) return setNameError("No changes made.");

    setNameLoading(true);
    setNameError("");
    setNameSuccess(false);
    try {
      const res = await axiosInstance.put(API_PATHS.AUTH.UPDATE_PROFILE, {
        name: name.trim(),
      });
      setUser({ ...user, name: res.data.name });
      setNameSuccess(true);
      setTimeout(() => setNameSuccess(false), 3000);
    } catch (err) {
      setNameError(err.response?.data?.message || "Failed to update name.");
    } finally {
      setNameLoading(false);
    }
  };

  // ── Upload avatar ──
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setAvatarError("Please upload an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError("Image must be under 5MB.");
      return;
    }

    setAvatarUploading(true);
    setAvatarError("");
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const res = await axiosInstance.put(
        API_PATHS.AUTH.UPLOAD_AVATAR,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      setUser({ ...user, avatar: res.data.avatar });
    } catch (err) {
      setAvatarError(err.response?.data?.message || "Upload failed.");
    } finally {
      setAvatarUploading(false);
      if (avatarRef.current) avatarRef.current.value = "";
    }
  };

  // ── Change password ──
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwError("");
    setPwSuccess(false);

    if (!pwForm.currentPassword)
      return setPwError("Current password is required.");
    if (!pwForm.newPassword || pwForm.newPassword.length < 6)
      return setPwError("New password must be at least 6 characters.");
    if (pwForm.newPassword !== pwForm.confirmPassword)
      return setPwError("Passwords do not match.");
    if (pwForm.currentPassword === pwForm.newPassword)
      return setPwError("New password must be different from current.");

    setPwLoading(true);
    try {
      await axiosInstance.put(API_PATHS.AUTH.UPDATE_PROFILE, {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      setPwSuccess(true);
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setPwSuccess(false), 3000);
    } catch (err) {
      setPwError(err.response?.data?.message || "Failed to change password.");
    } finally {
      setPwLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const avatarUrl = getImageUrl(user?.avatar);

  const inputStyle = (hasError) => ({
    width: "100%",
    height: "44px",
    padding: "0 14px",
    borderRadius: "10px",
    border: `1px solid ${hasError ? "#DC2626" : "#E5E7EB"}`,
    background: "#fff",
    fontSize: "14px",
    fontFamily: "inherit",
    color: "#111827",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  });

  const pwInputStyle = (field) => ({
    ...inputStyle(false),
    paddingRight: "44px",
  });

  return (
    <div
      style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        minHeight: "100vh",
        background: "#F9FAFB",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      {/* ── Navbar ── */}
      <nav
        style={{
          background: "#fff",
          borderBottom: "0.5px solid #E5E7EB",
          padding: "0 1.5rem",
          height: "60px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            onClick={() => navigate("/dashboard")}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#6B7280",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "13px",
              fontWeight: 500,
              padding: "6px 8px",
              borderRadius: "8px",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#F3F4F6")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Dashboard
          </button>
          <div
            style={{ width: "0.5px", height: "20px", background: "#E5E7EB" }}
          />
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: "#4F46E5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
                fontWeight: 700,
                color: "#fff",
                overflow: "hidden",
              }}
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                getInitials(user?.name)
              )}
            </div>
            <span
              style={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}
            >
              My Profile
            </span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          style={{
            height: "36px",
            padding: "0 14px",
            borderRadius: "8px",
            background: "#FEF2F2",
            border: "1px solid #FECACA",
            fontSize: "13px",
            fontWeight: 600,
            color: "#DC2626",
            cursor: "pointer",
            fontFamily: "inherit",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Sign out
        </button>
      </nav>

      {/* ── Main ── */}
      <main
        style={{
          maxWidth: "760px",
          margin: "0 auto",
          padding: "2.5rem 1.5rem",
        }}
      >
        {/* ── Profile Header Card ── */}
        <div
          style={{
            background: "#fff",
            border: "0.5px solid #E5E7EB",
            borderRadius: "16px",
            padding: "2rem",
            marginBottom: "1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "1.5rem",
            flexWrap: "wrap",
          }}
        >
          {/* Avatar */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div
              style={{
                width: "88px",
                height: "88px",
                borderRadius: "50%",
                background: "#EEF0FF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.6rem",
                fontWeight: 700,
                color: "#4F46E5",
                overflow: "hidden",
                border: "3px solid #fff",
                boxShadow: "0 0 0 2px #E5E7EB",
              }}
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={user?.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              ) : (
                getInitials(user?.name)
              )}
            </div>

            {/* Upload button overlay */}
            <button
              onClick={() => avatarRef.current?.click()}
              disabled={avatarUploading}
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                background: avatarUploading ? "#9CA3AF" : "#4F46E5",
                border: "2px solid #fff",
                cursor: avatarUploading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              title="Change avatar"
            >
              {avatarUploading ? (
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ animation: "spin 1s linear infinite" }}
                >
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
              ) : (
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              )}
            </button>

            <input
              type="file"
              ref={avatarRef}
              accept="image/*"
              onChange={handleAvatarUpload}
              style={{ display: "none" }}
            />
          </div>

          {/* User info */}
          <div style={{ flex: 1 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                flexWrap: "wrap",
              }}
            >
              <h1
                style={{
                  fontSize: "1.3rem",
                  fontWeight: 700,
                  color: "#111827",
                  margin: 0,
                }}
              >
                {user?.name}
              </h1>
              {user?.isPro && (
                <span
                  style={{
                    background: "linear-gradient(135deg,#4F46E5,#7C3AED)",
                    color: "#fff",
                    fontSize: "11px",
                    fontWeight: 700,
                    padding: "3px 10px",
                    borderRadius: "999px",
                  }}
                >
                  PRO
                </span>
              )}
            </div>
            <p
              style={{
                fontSize: "14px",
                color: "#6B7280",
                margin: "4px 0 12px",
              }}
            >
              {user?.email}
            </p>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              <span
                style={{
                  background: "#F3F4F6",
                  color: "#6B7280",
                  fontSize: "12px",
                  padding: "4px 10px",
                  borderRadius: "999px",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                Member since {formatDate(user?.createdAt)}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div
            style={{
              display: "flex",
              gap: "1rem",
              padding: "1rem",
              background: "#F9FAFB",
              borderRadius: "12px",
              flexShrink: 0,
            }}
          >
            {[
              { label: "Books", value: stats.total, color: "#4F46E5" },
              { label: "Published", value: stats.published, color: "#059669" },
              { label: "Drafts", value: stats.draft, color: "#D97706" },
            ].map((s, i, arr) => (
              <div
                key={s.label}
                style={{
                  textAlign: "center",
                  paddingRight: i < arr.length - 1 ? "1rem" : 0,
                  borderRight:
                    i < arr.length - 1 ? "0.5px solid #E5E7EB" : "none",
                }}
              >
                <p
                  style={{
                    fontSize: "1.4rem",
                    fontWeight: 700,
                    color: s.color,
                    margin: 0,
                  }}
                >
                  {s.value}
                </p>
                <p
                  style={{
                    fontSize: "12px",
                    color: "#9CA3AF",
                    margin: "2px 0 0",
                  }}
                >
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {avatarError && (
          <div
            style={{
              background: "#FEF2F2",
              border: "1px solid #FECACA",
              borderRadius: "10px",
              padding: "10px 14px",
              fontSize: "13px",
              color: "#DC2626",
              marginBottom: "1.5rem",
            }}
          >
            {avatarError}
          </div>
        )}

        {/* ── Edit Name ── */}
        <div
          style={{
            background: "#fff",
            border: "0.5px solid #E5E7EB",
            borderRadius: "16px",
            padding: "1.5rem",
            marginBottom: "1.5rem",
          }}
        >
          <h2
            style={{
              fontSize: "15px",
              fontWeight: 700,
              color: "#111827",
              margin: "0 0 4px",
            }}
          >
            Personal information
          </h2>
          <p
            style={{
              fontSize: "13px",
              color: "#9CA3AF",
              margin: "0 0 1.25rem",
            }}
          >
            Update your display name
          </p>

          <form onSubmit={handleUpdateName}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
                marginBottom: "1rem",
              }}
            >
              {/* Name */}
              <div>
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
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setNameError("");
                  }}
                  placeholder="Your full name"
                  style={inputStyle(nameError)}
                />
              </div>

              {/* Email — read only */}
              <div>
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
                  <span
                    style={{
                      marginLeft: "6px",
                      fontSize: "11px",
                      color: "#9CA3AF",
                      fontWeight: 400,
                    }}
                  >
                    (cannot be changed)
                  </span>
                </label>
                <input
                  type="email"
                  value={user?.email || ""}
                  readOnly
                  style={{
                    ...inputStyle(false),
                    background: "#F9FAFB",
                    color: "#9CA3AF",
                    cursor: "not-allowed",
                  }}
                />
              </div>
            </div>

            {nameError && (
              <p
                style={{
                  fontSize: "12px",
                  color: "#DC2626",
                  marginBottom: "10px",
                }}
              >
                {nameError}
              </p>
            )}

            {nameSuccess && (
              <div
                style={{
                  background: "#ECFDF5",
                  border: "1px solid #6EE7B7",
                  borderRadius: "8px",
                  padding: "8px 14px",
                  fontSize: "13px",
                  color: "#065F46",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  marginBottom: "10px",
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#059669"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Name updated successfully!
              </div>
            )}

            <button
              type="submit"
              disabled={nameLoading}
              style={{
                height: "40px",
                padding: "0 20px",
                borderRadius: "9px",
                background: nameLoading ? "#818CF8" : "#4F46E5",
                border: "none",
                fontSize: "13px",
                fontWeight: 600,
                color: "#fff",
                cursor: nameLoading ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                display: "flex",
                alignItems: "center",
                gap: "7px",
              }}
            >
              {nameLoading ? (
                <>
                  <svg
                    width="13"
                    height="13"
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
                  Saving...
                </>
              ) : (
                "Save changes"
              )}
            </button>
          </form>
        </div>

        {/* ── Change Password ── */}
        <div
          style={{
            background: "#fff",
            border: "0.5px solid #E5E7EB",
            borderRadius: "16px",
            padding: "1.5rem",
            marginBottom: "1.5rem",
          }}
        >
          <h2
            style={{
              fontSize: "15px",
              fontWeight: 700,
              color: "#111827",
              margin: "0 0 4px",
            }}
          >
            Change password
          </h2>
          <p
            style={{
              fontSize: "13px",
              color: "#9CA3AF",
              margin: "0 0 1.25rem",
            }}
          >
            Use a strong password with at least 6 characters
          </p>

          <form onSubmit={handleChangePassword}>
            {/* Current password */}
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
                Current password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPw.current ? "text" : "password"}
                  value={pwForm.currentPassword}
                  onChange={(e) => {
                    setPwForm({ ...pwForm, currentPassword: e.target.value });
                    setPwError("");
                  }}
                  placeholder="Enter current password"
                  style={pwInputStyle("current")}
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPw({ ...showPw, current: !showPw.current })
                  }
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
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {showPw.current ? (
                      <>
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </>
                    ) : (
                      <>
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </>
                    )}
                  </svg>
                </button>
              </div>
            </div>

            {/* New + Confirm in grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
                marginBottom: "1rem",
              }}
            >
              {[
                {
                  key: "new",
                  label: "New password",
                  placeholder: "Min. 6 characters",
                },
                {
                  key: "confirm",
                  label: "Confirm password",
                  placeholder: "Repeat new password",
                },
              ].map((f) => (
                <div key={f.key}>
                  <label
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#374151",
                      marginBottom: "6px",
                      display: "block",
                    }}
                  >
                    {f.label}
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPw[f.key] ? "text" : "password"}
                      value={
                        pwForm[
                          f.key === "new" ? "newPassword" : "confirmPassword"
                        ]
                      }
                      onChange={(e) => {
                        const key =
                          f.key === "new" ? "newPassword" : "confirmPassword";
                        setPwForm({ ...pwForm, [key]: e.target.value });
                        setPwError("");
                      }}
                      placeholder={f.placeholder}
                      style={pwInputStyle(f.key)}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPw({ ...showPw, [f.key]: !showPw[f.key] })
                      }
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
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        {showPw[f.key] ? (
                          <>
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                            <line x1="1" y1="1" x2="23" y2="23" />
                          </>
                        ) : (
                          <>
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </>
                        )}
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {pwError && (
              <div
                style={{
                  background: "#FEF2F2",
                  border: "1px solid #FECACA",
                  borderRadius: "8px",
                  padding: "8px 14px",
                  fontSize: "13px",
                  color: "#DC2626",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  marginBottom: "10px",
                }}
              >
                <svg
                  width="14"
                  height="14"
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
                {pwError}
              </div>
            )}

            {pwSuccess && (
              <div
                style={{
                  background: "#ECFDF5",
                  border: "1px solid #6EE7B7",
                  borderRadius: "8px",
                  padding: "8px 14px",
                  fontSize: "13px",
                  color: "#065F46",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  marginBottom: "10px",
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#059669"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Password changed successfully!
              </div>
            )}

            <button
              type="submit"
              disabled={pwLoading}
              style={{
                height: "40px",
                padding: "0 20px",
                borderRadius: "9px",
                background: pwLoading ? "#818CF8" : "#4F46E5",
                border: "none",
                fontSize: "13px",
                fontWeight: 600,
                color: "#fff",
                cursor: pwLoading ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                display: "flex",
                alignItems: "center",
                gap: "7px",
              }}
            >
              {pwLoading ? (
                <>
                  <svg
                    width="13"
                    height="13"
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
                  Updating...
                </>
              ) : (
                "Update password"
              )}
            </button>
          </form>
        </div>

        {/* ── Danger Zone ── */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #FECACA",
            borderRadius: "16px",
            padding: "1.5rem",
          }}
        >
          <h2
            style={{
              fontSize: "15px",
              fontWeight: 700,
              color: "#DC2626",
              margin: "0 0 4px",
            }}
          >
            Sign out
          </h2>
          <p
            style={{
              fontSize: "13px",
              color: "#9CA3AF",
              margin: "0 0 1.25rem",
            }}
          >
            You will be signed out of your account on this device.
          </p>
          <button
            onClick={handleLogout}
            style={{
              height: "40px",
              padding: "0 20px",
              borderRadius: "9px",
              background: "#FEF2F2",
              border: "1px solid #FECACA",
              fontSize: "13px",
              fontWeight: 600,
              color: "#DC2626",
              cursor: "pointer",
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              gap: "7px",
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign out
          </button>
        </div>
      </main>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default ProfilePage;
