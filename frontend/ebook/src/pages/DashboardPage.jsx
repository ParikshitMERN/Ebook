import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import API_PATHS from "../utils/apiPaths";
import { useAuth } from "../context/AuthContext";

// ─── Helpers ───────────────────────────────────────────────────
const getInitials = (name = "") =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const COVER_GRADIENTS = [
  "linear-gradient(135deg,#667eea,#764ba2)",
  "linear-gradient(135deg,#f093fb,#f5576c)",
  "linear-gradient(135deg,#4facfe,#00f2fe)",
  "linear-gradient(135deg,#43e97b,#38f9d7)",
  "linear-gradient(135deg,#fa709a,#fee140)",
  "linear-gradient(135deg,#a18cd1,#fbc2eb)",
  "linear-gradient(135deg,#ffecd2,#fcb69f)",
  "linear-gradient(135deg,#84fab0,#8fd3f4)",
];

// ─── Create Book Modal ──────────────────────────────────────────
const CreateBookModal = ({ onClose, onCreated }) => {
  const [form, setForm] = useState({ title: "", subtitle: "", author: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = "Title is required.";
    if (!form.author.trim()) errs.author = "Author is required.";
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
      const res = await axiosInstance.post(API_PATHS.BOOKS.CREATE, {
        title: form.title,
        subtitle: form.subtitle,
        author: form.author,
        chapters: [],
      });
      onCreated(res.data);
      onClose();
    } catch (err) {
      setServerError(err.response?.data?.message || "Failed to create book.");
    } finally {
      setLoading(false);
    }
  };

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
  });

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "1rem",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "16px",
          padding: "2rem",
          width: "100%",
          maxWidth: "460px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1.5rem",
          }}
        >
          <div>
            <h2
              style={{
                fontSize: "1.2rem",
                fontWeight: 700,
                color: "#111827",
                margin: 0,
              }}
            >
              Create new book
            </h2>
            <p
              style={{ fontSize: "13px", color: "#6B7280", margin: "4px 0 0" }}
            >
              Fill in the details to get started
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "#F3F4F6",
              border: "none",
              borderRadius: "8px",
              width: "32px",
              height: "32px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#6B7280",
              fontSize: "18px",
            }}
          >
            ×
          </button>
        </div>

        {serverError && (
          <div
            style={{
              background: "#FEF2F2",
              border: "1px solid #FECACA",
              borderRadius: "8px",
              padding: "10px 14px",
              fontSize: "13px",
              color: "#DC2626",
              marginBottom: "1rem",
            }}
          >
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Title */}
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
              Book title <span style={{ color: "#DC2626" }}>*</span>
            </label>
            <input
              name="title"
              type="text"
              placeholder="e.g. The Art of Digital Minimalism"
              value={form.title}
              onChange={handleChange}
              style={inputStyle(errors.title)}
            />
            {errors.title && (
              <p
                style={{ fontSize: "12px", color: "#DC2626", marginTop: "4px" }}
              >
                {errors.title}
              </p>
            )}
          </div>

          {/* Subtitle */}
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
              Subtitle{" "}
              <span
                style={{ fontSize: "11px", color: "#9CA3AF", fontWeight: 400 }}
              >
                (optional)
              </span>
            </label>
            <input
              name="subtitle"
              type="text"
              placeholder="e.g. A guide to living with less"
              value={form.subtitle}
              onChange={handleChange}
              style={inputStyle(false)}
            />
          </div>

          {/* Author */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "#374151",
                marginBottom: "6px",
                display: "block",
              }}
            >
              Author name <span style={{ color: "#DC2626" }}>*</span>
            </label>
            <input
              name="author"
              type="text"
              placeholder="e.g. John Doe"
              value={form.author}
              onChange={handleChange}
              style={inputStyle(errors.author)}
            />
            {errors.author && (
              <p
                style={{ fontSize: "12px", color: "#DC2626", marginTop: "4px" }}
              >
                {errors.author}
              </p>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                height: "44px",
                borderRadius: "10px",
                border: "1px solid #E5E7EB",
                background: "#fff",
                fontSize: "14px",
                fontWeight: 600,
                color: "#374151",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                height: "44px",
                borderRadius: "10px",
                background: loading ? "#818CF8" : "#4F46E5",
                border: "none",
                fontSize: "14px",
                fontWeight: 600,
                color: "#fff",
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
              }}
            >
              {loading ? (
                <>
                  <svg
                    width="14"
                    height="14"
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
                  Creating...
                </>
              ) : (
                "Create Book"
              )}
            </button>
          </div>
        </form>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

// ─── Delete Confirm Modal ───────────────────────────────────────
const DeleteModal = ({ book, onClose, onDeleted }) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await axiosInstance.delete(API_PATHS.BOOKS.DELETE(book._id));
      onDeleted(book._id);
      onClose();
    } catch {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "1rem",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "16px",
          padding: "2rem",
          width: "100%",
          maxWidth: "400px",
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "12px",
            background: "#FEF2F2",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "1rem",
          }}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#DC2626"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
          </svg>
        </div>
        <h3
          style={{
            fontSize: "1.1rem",
            fontWeight: 700,
            color: "#111827",
            marginBottom: "8px",
          }}
        >
          Delete "{book.title}"?
        </h3>
        <p
          style={{
            fontSize: "14px",
            color: "#6B7280",
            marginBottom: "1.5rem",
            lineHeight: 1.6,
          }}
        >
          This will permanently delete the book and all its chapters. This
          action cannot be undone.
        </p>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              height: "44px",
              borderRadius: "10px",
              border: "1px solid #E5E7EB",
              background: "#fff",
              fontSize: "14px",
              fontWeight: 600,
              color: "#374151",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            style={{
              flex: 1,
              height: "44px",
              borderRadius: "10px",
              background: loading ? "#FCA5A5" : "#DC2626",
              border: "none",
              fontSize: "14px",
              fontWeight: 600,
              color: "#fff",
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "inherit",
            }}
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Book Card ──────────────────────────────────────────────────
const BookCard = ({ book, index, onDelete, onEdit, onView, onExport }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const gradient = COVER_GRADIENTS[index % COVER_GRADIENTS.length];
  const chapterCount = book.chapters?.length || 0;

  const handleExport = async (type) => {
    setExporting(true);
    setMenuOpen(false);
    try {
      const url =
        type === "pdf"
          ? API_PATHS.EXPORT.PDF(book._id)
          : API_PATHS.EXPORT.DOC(book._id);
      const res = await axiosInstance.get(url, { responseType: "blob" });
      const blob = new Blob([res.data], {
        type:
          type === "pdf"
            ? "application/pdf"
            : "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${book.title.replace(/[^a-zA-Z0-9]/g, "_")}.${type === "pdf" ? "pdf" : "docx"}`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div
      style={{
        background: "#fff",
        border: "0.5px solid #E5E7EB",
        borderRadius: "16px",
        overflow: "hidden",
        transition: "transform 0.2s, box-shadow 0.2s",
        position: "relative",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Cover */}
      <div
        style={{
          height: "160px",
          background: book.coverImage
            ? `url(${
                book.coverImage.startsWith("http")
                  ? book.coverImage
                  : `http://localhost:8000${book.coverImage}`
              }) center/cover no-repeat`
            : gradient,
          position: "relative",
        }}
      >
        {/* Status badge */}
        <div
          style={{
            position: "absolute",
            top: "10px",
            left: "10px",
            background: book.status === "published" ? "#ECFDF5" : "#FFF7ED",
            color: book.status === "published" ? "#065F46" : "#92400E",
            fontSize: "11px",
            fontWeight: 600,
            padding: "3px 10px",
            borderRadius: "999px",
          }}
        >
          {book.status === "published" ? "Published" : "Draft"}
        </div>

        {/* Menu button */}
        <div style={{ position: "absolute", top: "10px", right: "10px" }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
            style={{
              width: "30px",
              height: "30px",
              borderRadius: "8px",
              background: "rgba(255,255,255,0.9)",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#374151",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="12" cy="19" r="1.5" />
            </svg>
          </button>

          {/* Dropdown menu */}
          {menuOpen && (
            <div
              style={{
                position: "absolute",
                top: "36px",
                right: 0,
                background: "#fff",
                border: "1px solid #E5E7EB",
                borderRadius: "12px",
                padding: "6px",
                minWidth: "160px",
                zIndex: 100,
                boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
              }}
            >
              {[
                {
                  label: "Edit book",
                  icon: "✏️",
                  action: () => {
                    onEdit(book);
                    setMenuOpen(false);
                  },
                },
                {
                  label: "View book",
                  icon: "👁️",
                  action: () => {
                    onView(book._id);
                    setMenuOpen(false);
                  },
                },
                {
                  label: "Export PDF",
                  icon: "📄",
                  action: () => handleExport("pdf"),
                },
                {
                  label: "Export DOCX",
                  icon: "📝",
                  action: () => handleExport("doc"),
                },
                {
                  label: "Delete",
                  icon: "🗑️",
                  action: () => {
                    onDelete(book);
                    setMenuOpen(false);
                  },
                  danger: true,
                },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={item.action}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "13px",
                    fontWeight: 500,
                    color: item.danger ? "#DC2626" : "#374151",
                    textAlign: "left",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = item.danger
                      ? "#FEF2F2"
                      : "#F9FAFB")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "none")
                  }
                >
                  <span style={{ fontSize: "14px" }}>{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Export loading overlay */}
        {exporting && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="24"
              height="24"
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
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: "1rem" }}>
        <h3
          style={{
            fontSize: "15px",
            fontWeight: 700,
            color: "#111827",
            marginBottom: "4px",
            lineHeight: 1.3,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {book.title}
        </h3>
        {book.subtitle && (
          <p
            style={{
              fontSize: "12px",
              color: "#9CA3AF",
              marginBottom: "8px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {book.subtitle}
          </p>
        )}
        <p style={{ fontSize: "12px", color: "#6B7280", marginBottom: "12px" }}>
          by {book.author}
        </p>

        {/* Stats row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            paddingTop: "10px",
            borderTop: "0.5px solid #F3F4F6",
            marginBottom: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#9CA3AF"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
            <span style={{ fontSize: "12px", color: "#6B7280" }}>
              {chapterCount} {chapterCount === 1 ? "chapter" : "chapters"}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#9CA3AF"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span style={{ fontSize: "12px", color: "#6B7280" }}>
              {formatDate(book.updatedAt)}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => onEdit(book)}
            style={{
              flex: 1,
              height: "36px",
              borderRadius: "8px",
              background: "#4F46E5",
              border: "none",
              fontSize: "13px",
              fontWeight: 600,
              color: "#fff",
              cursor: "pointer",
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "5px",
            }}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Edit
          </button>
          <button
            onClick={() => onView(book._id)}
            style={{
              flex: 1,
              height: "36px",
              borderRadius: "8px",
              background: "#F3F4F6",
              border: "none",
              fontSize: "13px",
              fontWeight: 600,
              color: "#374151",
              cursor: "pointer",
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "5px",
            }}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            View
          </button>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

// ─── Empty State ────────────────────────────────────────────────
const EmptyState = ({ onCreateClick }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "5rem 1rem",
      textAlign: "center",
    }}
  >
    <div
      style={{
        width: "80px",
        height: "80px",
        borderRadius: "20px",
        background: "#EEF0FF",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: "1.5rem",
      }}
    >
      <svg
        width="36"
        height="36"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#4F46E5"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    </div>
    <h3
      style={{
        fontSize: "1.2rem",
        fontWeight: 700,
        color: "#111827",
        marginBottom: "8px",
      }}
    >
      No books yet
    </h3>
    <p
      style={{
        fontSize: "14px",
        color: "#6B7280",
        marginBottom: "1.5rem",
        maxWidth: "320px",
      }}
    >
      Create your first ebook and start your publishing journey with AI.
    </p>
    <button
      onClick={onCreateClick}
      style={{
        height: "44px",
        padding: "0 24px",
        borderRadius: "10px",
        background: "#4F46E5",
        border: "none",
        fontSize: "14px",
        fontWeight: 600,
        color: "#fff",
        cursor: "pointer",
        fontFamily: "inherit",
        display: "flex",
        alignItems: "center",
        gap: "8px",
      }}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
      Create your first book
    </button>
  </div>
);

// ─── Dashboard Page ─────────────────────────────────────────────
const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [profileMenu, setProfileMenu] = useState(false);

  // Fetch all books on mount
  useEffect(() => {
    fetchBooks();
  }, []);

  // Close profile menu on outside click
  useEffect(() => {
    const handler = () => setProfileMenu(false);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(API_PATHS.BOOKS.GET_ALL);
      setBooks(res.data);
    } catch (err) {
      console.error("Failed to fetch books:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Filter + search
  const filteredBooks = books.filter((b) => {
    const matchSearch =
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "all" ||
      (filter === "draft" && b.status === "draft") ||
      (filter === "published" && b.status === "published");
    return matchSearch && matchFilter;
  });

  const stats = {
    total: books.length,
    published: books.filter((b) => b.status === "published").length,
    draft: books.filter((b) => b.status === "draft").length,
    chapters: books.reduce((sum, b) => sum + (b.chapters?.length || 0), 0),
  };

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
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "34px",
              height: "34px",
              background: "#4F46E5",
              borderRadius: "9px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="18"
              height="18"
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
          <span
            style={{ fontSize: "1.1rem", fontWeight: 700, color: "#111827" }}
          >
            Ebookify
          </span>
        </div>

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            onClick={() => setShowCreate(true)}
            style={{
              height: "38px",
              padding: "0 16px",
              borderRadius: "9px",
              background: "#4F46E5",
              border: "none",
              fontSize: "13px",
              fontWeight: 600,
              color: "#fff",
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
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Book
          </button>

          {/* Profile dropdown */}
          <div style={{ position: "relative" }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setProfileMenu(!profileMenu);
              }}
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "50%",
                background: "#4F46E5",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "13px",
                fontWeight: 700,
                color: "#fff",
              }}
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt=""
                  style={{
                    width: "38px",
                    height: "38px",
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                getInitials(user?.name || "U")
              )}
            </button>

            {profileMenu && (
              <div
                style={{
                  position: "absolute",
                  top: "46px",
                  right: 0,
                  background: "#fff",
                  border: "1px solid #E5E7EB",
                  borderRadius: "12px",
                  padding: "8px",
                  minWidth: "200px",
                  zIndex: 100,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                }}
              >
                <div
                  style={{
                    padding: "8px 10px 12px",
                    borderBottom: "0.5px solid #F3F4F6",
                    marginBottom: "6px",
                  }}
                >
                  <p
                    style={{
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "#111827",
                      margin: 0,
                    }}
                  >
                    {user?.name}
                  </p>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#9CA3AF",
                      margin: "2px 0 0",
                    }}
                  >
                    {user?.email}
                  </p>
                </div>
                {[
                  {
                    label: "My Profile",
                    icon: "👤",
                    action: () => navigate("/profile"),
                  },
                  {
                    label: "Settings",
                    icon: "⚙️",
                    action: () => navigate("/profile"),
                  },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={item.action}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "13px",
                      fontWeight: 500,
                      color: "#374151",
                      textAlign: "left",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#F9FAFB")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "none")
                    }
                  >
                    <span style={{ fontSize: "14px" }}>{item.icon}</span>
                    {item.label}
                  </button>
                ))}
                <div
                  style={{
                    borderTop: "0.5px solid #F3F4F6",
                    marginTop: "6px",
                    paddingTop: "6px",
                  }}
                >
                  <button
                    onClick={handleLogout}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "13px",
                      fontWeight: 500,
                      color: "#DC2626",
                      textAlign: "left",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#FEF2F2")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "none")
                    }
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
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ── Main Content ── */}
      <main
        style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem 1.5rem" }}
      >
        {/* Page header */}
        <div style={{ marginBottom: "2rem" }}>
          <h1
            style={{
              fontSize: "1.6rem",
              fontWeight: 700,
              color: "#111827",
              marginBottom: "4px",
            }}
          >
            My Books
          </h1>
          <p style={{ fontSize: "14px", color: "#6B7280" }}>
            Welcome back, {user?.name?.split(" ")[0] || "there"}! Here are all
            your ebooks.
          </p>
        </div>

        {/* Stats cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          {[
            {
              label: "Total Books",
              value: stats.total,
              color: "#4F46E5",
              bg: "#EEF0FF",
            },
            {
              label: "Published",
              value: stats.published,
              color: "#059669",
              bg: "#ECFDF5",
            },
            {
              label: "Drafts",
              value: stats.draft,
              color: "#D97706",
              bg: "#FFF7ED",
            },
            {
              label: "Total Chapters",
              value: stats.chapters,
              color: "#7C3AED",
              bg: "#F5F3FF",
            },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                background: "#fff",
                border: "0.5px solid #E5E7EB",
                borderRadius: "12px",
                padding: "1.25rem",
              }}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "9px",
                  background: s.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "10px",
                }}
              >
                <span
                  style={{ fontSize: "18px", fontWeight: 700, color: s.color }}
                >
                  {s.value}
                </span>
              </div>
              <p style={{ fontSize: "13px", color: "#6B7280", margin: 0 }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* Search + Filter bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "1.5rem",
            flexWrap: "wrap",
          }}
        >
          {/* Search */}
          <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
            <span
              style={{
                position: "absolute",
                left: "13px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#9CA3AF",
                display: "flex",
              }}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search books or authors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                height: "42px",
                padding: "0 14px 0 40px",
                borderRadius: "10px",
                border: "1px solid #E5E7EB",
                background: "#fff",
                fontSize: "14px",
                fontFamily: "inherit",
                color: "#111827",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Filter tabs */}
          <div
            style={{
              display: "flex",
              background: "#fff",
              border: "1px solid #E5E7EB",
              borderRadius: "10px",
              padding: "3px",
              gap: "2px",
            }}
          >
            {["all", "draft", "published"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  height: "34px",
                  padding: "0 14px",
                  borderRadius: "7px",
                  border: "none",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  background: filter === f ? "#4F46E5" : "transparent",
                  color: filter === f ? "#fff" : "#6B7280",
                  transition: "all 0.15s",
                  textTransform: "capitalize",
                }}
              >
                {f === "all"
                  ? `All (${stats.total})`
                  : f === "draft"
                    ? `Drafts (${stats.draft})`
                    : `Published (${stats.published})`}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "5rem",
              gap: "12px",
              color: "#6B7280",
              fontSize: "14px",
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#4F46E5"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ animation: "spin 1s linear infinite" }}
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            Loading your books...
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : filteredBooks.length === 0 && search === "" && filter === "all" ? (
          <EmptyState onCreateClick={() => setShowCreate(true)} />
        ) : filteredBooks.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "4rem 1rem",
              color: "#6B7280",
              fontSize: "14px",
            }}
          >
            No books match your search. Try a different keyword.
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: "1.25rem",
            }}
          >
            {filteredBooks.map((book, index) => (
              <BookCard
                key={book._id}
                book={book}
                index={index}
                onDelete={(b) => setDeleteTarget(b)}
                onEdit={(b) => navigate(`/editor/${b._id}`)}
                onView={(id) => navigate(`/view-book/${id}`)}
                onExport={() => {}}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      {showCreate && (
        <CreateBookModal
          onClose={() => setShowCreate(false)}
          onCreated={(newBook) => setBooks((prev) => [newBook, ...prev])}
        />
      )}
      {deleteTarget && (
        <DeleteModal
          book={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={(id) =>
            setBooks((prev) => prev.filter((b) => b._id !== id))
          }
        />
      )}
    </div>
  );
};

export default DashboardPage;
