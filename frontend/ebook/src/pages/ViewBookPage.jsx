import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import API_PATHS from "../utils/apiPaths";

// ─── Helpers ────────────────────────────────────────────────────
const getImageUrl = (coverImage) => {
  if (!coverImage) return null;
  if (coverImage.startsWith("http")) return coverImage;
  if (coverImage.startsWith("/")) return `http://localhost:8000${coverImage}`;
  return `http://localhost:8000/${coverImage}`;
};

const getWordCount = (text = "") => text.split(/\s+/).filter(Boolean).length;

const getTotalWords = (chapters = []) =>
  chapters.reduce((sum, ch) => sum + getWordCount(ch.content), 0);

const getReadTime = (wordCount) => Math.max(1, Math.ceil(wordCount / 200));

// ─── Simple Markdown Renderer ───────────────────────────────────
const renderContent = (content = "") => {
  if (!content.trim()) return null;

  const lines = content.split("\n");
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // H1
    if (line.startsWith("# ")) {
      elements.push(
        <h1
          key={i}
          style={{
            fontSize: "1.6rem",
            fontWeight: 700,
            color: "#111827",
            margin: "2rem 0 1rem",
            lineHeight: 1.3,
          }}
        >
          {line.slice(2)}
        </h1>,
      );
    }
    // H2
    else if (line.startsWith("## ")) {
      elements.push(
        <h2
          key={i}
          style={{
            fontSize: "1.3rem",
            fontWeight: 700,
            color: "#1F2937",
            margin: "1.75rem 0 0.75rem",
            lineHeight: 1.3,
          }}
        >
          {line.slice(3)}
        </h2>,
      );
    }
    // H3
    else if (line.startsWith("### ")) {
      elements.push(
        <h3
          key={i}
          style={{
            fontSize: "1.1rem",
            fontWeight: 700,
            color: "#374151",
            margin: "1.5rem 0 0.5rem",
            lineHeight: 1.3,
          }}
        >
          {line.slice(4)}
        </h3>,
      );
    }
    // Bullet list
    else if (line.startsWith("- ") || line.startsWith("* ")) {
      const items = [];
      while (
        i < lines.length &&
        (lines[i].startsWith("- ") || lines[i].startsWith("* "))
      ) {
        items.push(
          <li key={i} style={{ marginBottom: "6px", lineHeight: 1.8 }}>
            {formatInline(lines[i].slice(2))}
          </li>,
        );
        i++;
      }
      elements.push(
        <ul
          key={`ul-${i}`}
          style={{ paddingLeft: "1.5rem", margin: "1rem 0", color: "#374151" }}
        >
          {items}
        </ul>,
      );
      continue;
    }
    // Numbered list
    else if (/^\d+\.\s/.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(
          <li key={i} style={{ marginBottom: "6px", lineHeight: 1.8 }}>
            {formatInline(lines[i].replace(/^\d+\.\s/, ""))}
          </li>,
        );
        i++;
      }
      elements.push(
        <ol
          key={`ol-${i}`}
          style={{ paddingLeft: "1.5rem", margin: "1rem 0", color: "#374151" }}
        >
          {items}
        </ol>,
      );
      continue;
    }
    // Blockquote
    else if (line.startsWith("> ")) {
      elements.push(
        <blockquote
          key={i}
          style={{
            borderLeft: "4px solid #4F46E5",
            paddingLeft: "1.25rem",
            margin: "1.5rem 0",
            color: "#6B7280",
            fontStyle: "italic",
            fontSize: "1.05rem",
            lineHeight: 1.8,
          }}
        >
          {line.slice(2)}
        </blockquote>,
      );
    }
    // Horizontal rule
    else if (line.trim() === "---" || line.trim() === "***") {
      elements.push(
        <hr
          key={i}
          style={{
            border: "none",
            borderTop: "1px solid #E5E7EB",
            margin: "2rem 0",
          }}
        />,
      );
    }
    // Empty line
    else if (line.trim() === "") {
      elements.push(<div key={i} style={{ height: "0.75rem" }} />);
    }
    // Regular paragraph
    else {
      elements.push(
        <p
          key={i}
          style={{
            fontSize: "1.05rem",
            lineHeight: 1.9,
            color: "#374151",
            margin: "0 0 1rem",
            textAlign: "justify",
            fontFamily: "Georgia, 'Times New Roman', serif",
          }}
        >
          {formatInline(line)}
        </p>,
      );
    }
    i++;
  }

  return elements;
};

// ─── Inline formatting (bold, italic, code) ──────────────────────
const formatInline = (text) => {
  const parts = [];
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g;
  let last = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) {
      parts.push(text.slice(last, match.index));
    }
    if (match[2]) {
      parts.push(<strong key={match.index}>{match[2]}</strong>);
    } else if (match[3]) {
      parts.push(<em key={match.index}>{match[3]}</em>);
    } else if (match[4]) {
      parts.push(
        <code
          key={match.index}
          style={{
            background: "#F3F4F6",
            padding: "2px 6px",
            borderRadius: "4px",
            fontSize: "0.9em",
            fontFamily: "monospace",
            color: "#374151",
          }}
        >
          {match[4]}
        </code>,
      );
    }
    last = match.index + match[0].length;
  }

  if (last < text.length) parts.push(text.slice(last));
  return parts.length > 0 ? parts : text;
};

// ─── ViewBookPage ────────────────────────────────────────────────
const ViewBookPage = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [exportType, setExportType] = useState("");
  const [exportError, setExportError] = useState("");
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [readProgress, setReadProgress] = useState(0);
  const contentRef = useRef(null);

  useEffect(() => {
    fetchBook();
  }, [bookId]);

  // Close export menu on outside click
  useEffect(() => {
    const handler = () => setShowExportMenu(false);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  // Track read progress
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      const total = scrollHeight - clientHeight;
      if (total <= 0) return setReadProgress(100);
      setReadProgress(Math.round((scrollTop / total) * 100));
    };
    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, [activeIndex, book]);

  // Reset scroll + progress on chapter change
  useEffect(() => {
    if (contentRef.current) contentRef.current.scrollTop = 0;
    setReadProgress(0);
  }, [activeIndex]);

  const fetchBook = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(API_PATHS.BOOKS.GET_ONE(bookId));
      setBook(res.data);
    } catch (err) {
      console.error("Failed to fetch book:", err);
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type) => {
    setExporting(true);
    setExportType(type);
    setExportError("");
    setShowExportMenu(false);
    try {
      const url =
        type === "pdf"
          ? API_PATHS.EXPORT.PDF(bookId)
          : API_PATHS.EXPORT.DOC(bookId);
      const res = await axiosInstance.get(url, {
        responseType: "blob",
        timeout: 60000,
      });
      const blob = new Blob([res.data], {
        type:
          type === "pdf"
            ? "application/pdf"
            : "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${book?.title?.replace(/[^a-zA-Z0-9]/g, "_") || "book"}.${type === "pdf" ? "pdf" : "docx"}`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (err) {
      setExportError("Export failed. Please try again.");
      setTimeout(() => setExportError(""), 4000);
    } finally {
      setExporting(false);
      setExportType("");
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
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
        Loading book...
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!book) return null;

  const chapters = book.chapters || [];
  const activeChapter = chapters[activeIndex];
  const totalWords = getTotalWords(chapters);
  const totalReadTime = getReadTime(totalWords);
  const activeWordCount = getWordCount(activeChapter?.content);
  const imageUrl = getImageUrl(book.coverImage);

  return (
    <div
      style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#F9FAFB",
        overflow: "hidden",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      {/* ── Read Progress Bar ── */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: `${readProgress}%`,
          height: "3px",
          background: "linear-gradient(90deg, #4F46E5, #7C3AED)",
          zIndex: 200,
          transition: "width 0.1s",
        }}
      />

      {/* ── Navbar ── */}
      <nav
        style={{
          background: "#fff",
          borderBottom: "0.5px solid #E5E7EB",
          padding: "0 1.25rem",
          height: "56px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
          zIndex: 50,
        }}
      >
        {/* Left */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            onClick={() => navigate("/dashboard")}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#6B7280",
              display: "flex",
              alignItems: "center",
              gap: "5px",
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
                width: "28px",
                height: "36px",
                borderRadius: "4px",
                background: imageUrl
                  ? `url(${imageUrl}) center/cover`
                  : "linear-gradient(135deg,#4F46E5,#7C3AED)",
                flexShrink: 0,
              }}
            />
            <div>
              <p
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#111827",
                  margin: 0,
                  lineHeight: 1.2,
                }}
              >
                {book.title}
              </p>
              <p style={{ fontSize: "11px", color: "#9CA3AF", margin: 0 }}>
                by {book.author}
              </p>
            </div>
          </div>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: sidebarOpen ? "#EEF0FF" : "none",
              border: "none",
              cursor: "pointer",
              color: sidebarOpen ? "#4F46E5" : "#9CA3AF",
              padding: "6px",
              borderRadius: "7px",
              display: "flex",
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
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="9" y1="3" x2="9" y2="21" />
            </svg>
          </button>
        </div>

        {/* Right */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* Read progress */}
          <span style={{ fontSize: "12px", color: "#9CA3AF" }}>
            {readProgress}% read
          </span>

          {/* Edit button */}
          <button
            onClick={() => navigate(`/editor/${bookId}`)}
            style={{
              height: "34px",
              padding: "0 14px",
              borderRadius: "8px",
              background: "#fff",
              border: "1px solid #E5E7EB",
              fontSize: "12px",
              fontWeight: 600,
              color: "#374151",
              cursor: "pointer",
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
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

          {/* Export dropdown */}
          <div style={{ position: "relative" }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowExportMenu(!showExportMenu);
              }}
              disabled={exporting}
              style={{
                height: "34px",
                padding: "0 14px",
                borderRadius: "8px",
                background: "#4F46E5",
                border: "none",
                fontSize: "12px",
                fontWeight: 600,
                color: "#fff",
                cursor: exporting ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              {exporting ? (
                <>
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ animation: "spin 1s linear infinite" }}
                  >
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  Exporting {exportType.toUpperCase()}...
                </>
              ) : (
                <>
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
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Export
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </>
              )}
            </button>

            {showExportMenu && (
              <div
                style={{
                  position: "absolute",
                  top: "40px",
                  right: 0,
                  background: "#fff",
                  border: "1px solid #E5E7EB",
                  borderRadius: "10px",
                  padding: "6px",
                  minWidth: "160px",
                  zIndex: 100,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                }}
              >
                {[
                  { label: "Export as PDF", type: "pdf", icon: "📄" },
                  { label: "Export as DOCX", type: "doc", icon: "📝" },
                ].map((item) => (
                  <button
                    key={item.type}
                    onClick={() => handleExport(item.type)}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                      borderRadius: "7px",
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
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ── Body ── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* ── Sidebar ── */}
        {sidebarOpen && (
          <div
            style={{
              width: "260px",
              flexShrink: 0,
              background: "#fff",
              borderRight: "0.5px solid #E5E7EB",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Book info */}
            <div
              style={{
                padding: "1.25rem",
                borderBottom: "0.5px solid #F3F4F6",
              }}
            >
              {/* Cover */}
              <div
                style={{
                  width: "100%",
                  height: "160px",
                  borderRadius: "10px",
                  background: imageUrl
                    ? `url(${imageUrl}) center/cover`
                    : "linear-gradient(135deg,#4F46E5,#7C3AED)",
                  marginBottom: "12px",
                  display: "flex",
                  alignItems: "flex-end",
                }}
              >
                {!imageUrl && (
                  <div style={{ padding: "12px" }}>
                    <p
                      style={{
                        fontSize: "13px",
                        fontWeight: 700,
                        color: "#fff",
                        margin: 0,
                      }}
                    >
                      {book.title}
                    </p>
                  </div>
                )}
              </div>

              <p
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "#111827",
                  margin: "0 0 2px",
                }}
              >
                {book.title}
              </p>
              {book.subtitle && (
                <p
                  style={{
                    fontSize: "12px",
                    color: "#6B7280",
                    margin: "0 0 4px",
                  }}
                >
                  {book.subtitle}
                </p>
              )}
              <p
                style={{
                  fontSize: "12px",
                  color: "#9CA3AF",
                  margin: "0 0 12px",
                }}
              >
                by {book.author}
              </p>

              {/* Stats */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "8px",
                }}
              >
                {[
                  { label: "Chapters", value: chapters.length },
                  { label: "Words", value: totalWords.toLocaleString() },
                  { label: "Read time", value: `~${totalReadTime}m` },
                  {
                    label: "Status",
                    value: book.status === "published" ? "Published" : "Draft",
                    color: book.status === "published" ? "#059669" : "#D97706",
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    style={{
                      background: "#F9FAFB",
                      borderRadius: "8px",
                      padding: "8px 10px",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "11px",
                        color: "#9CA3AF",
                        margin: "0 0 2px",
                      }}
                    >
                      {s.label}
                    </p>
                    <p
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: s.color || "#111827",
                        margin: 0,
                      }}
                    >
                      {s.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Chapter list */}
            <div
              style={{
                padding: "10px 8px",
                borderBottom: "0.5px solid #F3F4F6",
              }}
            >
              <p
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "#9CA3AF",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  padding: "0 6px",
                  margin: "0 0 8px",
                }}
              >
                Contents
              </p>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
              {chapters.length === 0 ? (
                <p
                  style={{
                    fontSize: "13px",
                    color: "#9CA3AF",
                    textAlign: "center",
                    padding: "2rem 1rem",
                  }}
                >
                  No chapters yet.
                </p>
              ) : (
                chapters.map((ch, i) => (
                  <div
                    key={i}
                    onClick={() => setActiveIndex(i)}
                    style={{
                      padding: "9px 12px",
                      borderRadius: "9px",
                      cursor: "pointer",
                      marginBottom: "3px",
                      background: activeIndex === i ? "#EEF0FF" : "transparent",
                      border:
                        activeIndex === i
                          ? "1px solid #C7D2FE"
                          : "1px solid transparent",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      if (activeIndex !== i)
                        e.currentTarget.style.background = "#F9FAFB";
                    }}
                    onMouseLeave={(e) => {
                      if (activeIndex !== i)
                        e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "8px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          color: activeIndex === i ? "#4F46E5" : "#9CA3AF",
                          minWidth: "18px",
                          marginTop: "1px",
                        }}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                          style={{
                            fontSize: "13px",
                            fontWeight: 600,
                            color: activeIndex === i ? "#4F46E5" : "#374151",
                            margin: 0,
                            lineHeight: 1.3,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {ch.title || `Chapter ${i + 1}`}
                        </p>
                        <p
                          style={{
                            fontSize: "11px",
                            color: "#9CA3AF",
                            margin: "3px 0 0",
                          }}
                        >
                          {getWordCount(ch.content).toLocaleString()} words
                        </p>
                      </div>
                      {ch.content && (
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke={activeIndex === i ? "#4F46E5" : "#D1D5DB"}
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          style={{ flexShrink: 0, marginTop: "2px" }}
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ── Main Content ── */}
        <div
          ref={contentRef}
          style={{
            flex: 1,
            overflow: "auto",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {chapters.length === 0 ? (
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "2rem",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "16px",
                  background: "#EEF0FF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1rem",
                }}
              >
                <svg
                  width="28"
                  height="28"
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
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  color: "#111827",
                  marginBottom: "8px",
                }}
              >
                No chapters yet
              </h3>
              <p
                style={{
                  fontSize: "14px",
                  color: "#6B7280",
                  marginBottom: "1.5rem",
                }}
              >
                Go to the editor to add chapters and content.
              </p>
              <button
                onClick={() => navigate(`/editor/${bookId}`)}
                style={{
                  height: "42px",
                  padding: "0 20px",
                  borderRadius: "10px",
                  background: "#4F46E5",
                  border: "none",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#fff",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Open Editor
              </button>
            </div>
          ) : activeChapter ? (
            <div
              style={{
                maxWidth: "740px",
                width: "100%",
                margin: "0 auto",
                padding: "3rem 2rem 4rem",
              }}
            >
              {/* Chapter header */}
              <div style={{ marginBottom: "2.5rem" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "1rem",
                  }}
                >
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#9CA3AF",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    Chapter {activeIndex + 1}
                  </span>
                  <span style={{ color: "#E5E7EB" }}>·</span>
                  <span style={{ fontSize: "12px", color: "#9CA3AF" }}>
                    {activeWordCount.toLocaleString()} words
                  </span>
                  <span style={{ color: "#E5E7EB" }}>·</span>
                  <span style={{ fontSize: "12px", color: "#9CA3AF" }}>
                    ~{getReadTime(activeWordCount)} min read
                  </span>
                </div>

                <h1
                  style={{
                    fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
                    fontWeight: 800,
                    color: "#111827",
                    lineHeight: 1.2,
                    margin: "0 0 12px",
                    fontFamily: "Georgia, serif",
                  }}
                >
                  {activeChapter.title}
                </h1>

                {activeChapter.description && (
                  <p
                    style={{
                      fontSize: "1.1rem",
                      color: "#6B7280",
                      lineHeight: 1.6,
                      fontStyle: "italic",
                      margin: 0,
                      fontFamily: "Georgia, serif",
                    }}
                  >
                    {activeChapter.description}
                  </p>
                )}

                <div
                  style={{
                    height: "3px",
                    width: "48px",
                    background: "linear-gradient(90deg, #4F46E5, #7C3AED)",
                    borderRadius: "999px",
                    marginTop: "1.5rem",
                  }}
                />
              </div>

              {/* Chapter content */}
              <div style={{ minHeight: "300px" }}>
                {activeChapter.content ? (
                  renderContent(activeChapter.content)
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "4rem 1rem",
                      textAlign: "center",
                      background: "#F9FAFB",
                      borderRadius: "12px",
                      border: "1px dashed #E5E7EB",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "14px",
                        color: "#9CA3AF",
                        marginBottom: "12px",
                      }}
                    >
                      This chapter has no content yet.
                    </p>
                    <button
                      onClick={() => navigate(`/editor/${bookId}`)}
                      style={{
                        height: "36px",
                        padding: "0 16px",
                        borderRadius: "8px",
                        background: "#4F46E5",
                        border: "none",
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#fff",
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      Write in Editor
                    </button>
                  </div>
                )}
              </div>

              {/* Chapter navigation */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: "3rem",
                  paddingTop: "2rem",
                  borderTop: "1px solid #F3F4F6",
                }}
              >
                <button
                  onClick={() => setActiveIndex(Math.max(0, activeIndex - 1))}
                  disabled={activeIndex === 0}
                  style={{
                    height: "42px",
                    padding: "0 18px",
                    borderRadius: "10px",
                    border: "1px solid #E5E7EB",
                    background: "#fff",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: activeIndex === 0 ? "#D1D5DB" : "#374151",
                    cursor: activeIndex === 0 ? "not-allowed" : "pointer",
                    fontFamily: "inherit",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
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
                    <line x1="19" y1="12" x2="5" y2="12" />
                    <polyline points="12 19 5 12 12 5" />
                  </svg>
                  {activeIndex > 0 ? (
                    <span
                      style={{
                        maxWidth: "120px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {chapters[activeIndex - 1]?.title || "Previous"}
                    </span>
                  ) : (
                    "Previous"
                  )}
                </button>

                <span style={{ fontSize: "13px", color: "#9CA3AF" }}>
                  {activeIndex + 1} / {chapters.length}
                </span>

                <button
                  onClick={() =>
                    setActiveIndex(
                      Math.min(chapters.length - 1, activeIndex + 1),
                    )
                  }
                  disabled={activeIndex === chapters.length - 1}
                  style={{
                    height: "42px",
                    padding: "0 18px",
                    borderRadius: "10px",
                    border: "1px solid #E5E7EB",
                    background: "#fff",
                    fontSize: "13px",
                    fontWeight: 600,
                    color:
                      activeIndex === chapters.length - 1
                        ? "#D1D5DB"
                        : "#374151",
                    cursor:
                      activeIndex === chapters.length - 1
                        ? "not-allowed"
                        : "pointer",
                    fontFamily: "inherit",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  {activeIndex < chapters.length - 1 ? (
                    <span
                      style={{
                        maxWidth: "120px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {chapters[activeIndex + 1]?.title || "Next"}
                    </span>
                  ) : (
                    "Next"
                  )}
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
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* ── Export error toast ── */}
      {exportError && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            background: "#FEF2F2",
            border: "1px solid #FECACA",
            borderRadius: "10px",
            padding: "12px 16px",
            fontSize: "13px",
            color: "#DC2626",
            zIndex: 200,
            display: "flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
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
          {exportError}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default ViewBookPage;
