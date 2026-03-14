import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import API_PATHS from "../utils/apiPaths";

// ─── Helpers ────────────────────────────────────────────────────
const STYLES = [
  "neutral",
  "formal",
  "casual",
  "academic",
  "storytelling",
  "motivational",
];

const debounce = (fn, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

// ─── Sidebar Chapter Item ────────────────────────────────────────
const ChapterItem = ({
  chapter,
  index,
  isActive,
  onClick,
  onDelete,
  isGenerating,
}) => (
  <div
    onClick={onClick}
    style={{
      padding: "10px 12px",
      borderRadius: "10px",
      cursor: "pointer",
      background: isActive ? "#EEF0FF" : "transparent",
      border: isActive ? "1px solid #C7D2FE" : "1px solid transparent",
      marginBottom: "4px",
      transition: "all 0.15s",
      display: "flex",
      alignItems: "flex-start",
      gap: "10px",
    }}
    onMouseEnter={(e) => {
      if (!isActive) e.currentTarget.style.background = "#F9FAFB";
    }}
    onMouseLeave={(e) => {
      if (!isActive) e.currentTarget.style.background = "transparent";
    }}
  >
    <div
      style={{
        width: "22px",
        height: "22px",
        borderRadius: "6px",
        flexShrink: 0,
        background: isActive ? "#4F46E5" : "#E5E7EB",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "11px",
        fontWeight: 700,
        color: isActive ? "#fff" : "#6B7280",
      }}
    >
      {isGenerating ? (
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ animation: "spin 1s linear infinite" }}
        >
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
      ) : (
        index + 1
      )}
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <p
        style={{
          fontSize: "13px",
          fontWeight: 600,
          color: isActive ? "#4F46E5" : "#374151",
          margin: 0,
          lineHeight: 1.3,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {chapter.title || `Chapter ${index + 1}`}
      </p>
      <p style={{ fontSize: "11px", color: "#9CA3AF", margin: "3px 0 0" }}>
        {chapter.content
          ? `${chapter.content.split(" ").length} words`
          : "No content yet"}
      </p>
    </div>
    <button
      onClick={(e) => {
        e.stopPropagation();
        onDelete(index);
      }}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        color: "#D1D5DB",
        padding: "2px",
        borderRadius: "4px",
        display: "flex",
        flexShrink: 0,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.color = "#EF4444")}
      onMouseLeave={(e) => (e.currentTarget.style.color = "#D1D5DB")}
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </button>
  </div>
);

// ─── Cover Upload ────────────────────────────────────────────────
// ─── Cover Upload ────────────────────────────────────────────────
const CoverUpload = ({ book, bookId, onUpdated }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef(null);

  const getImageUrl = (coverImage) => {
    if (!coverImage) return null;
    if (coverImage.startsWith("http")) return coverImage;
    if (coverImage.startsWith("/")) return `http://localhost:8000${coverImage}`;
    return `http://localhost:8000/${coverImage}`;
  };

  const imageUrl = getImageUrl(book?.coverImage);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB.");
      return;
    }
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("coverImage", file);
      const res = await axiosInstance.put(
        API_PATHS.BOOKS.UPLOAD_COVER(bookId),
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      onUpdated(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed. Try again.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div
      style={{
        background: "#fff",
        border: "0.5px solid #E5E7EB",
        borderRadius: "14px",
        padding: "1.25rem",
        marginBottom: "1.25rem",
      }}
    >
      <p
        style={{
          fontSize: "12px",
          fontWeight: 600,
          color: "#6B7280",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          margin: "0 0 12px",
        }}
      >
        Cover Image
      </p>

      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        {/* Preview */}
        <div
          style={{
            width: "90px",
            height: "120px",
            borderRadius: "10px",
            border: `1px ${imageUrl ? "solid #E5E7EB" : "dashed #D1D5DB"}`,
            overflow: "hidden",
            flexShrink: 0,
            background: "#F9FAFB",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Book cover"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
              onError={(e) => {
                e.target.style.display = "none";
                e.target.parentNode.querySelector(
                  ".cover-placeholder",
                ).style.display = "flex";
              }}
            />
          ) : null}
          <div
            className="cover-placeholder"
            style={{
              display: imageUrl ? "none" : "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: "100%",
              position: imageUrl ? "absolute" : "relative",
              inset: 0,
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#D1D5DB"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
        </div>

        {/* Controls */}
        <div style={{ flex: 1 }}>
          <p
            style={{
              fontSize: "13px",
              color: "#374151",
              fontWeight: 500,
              margin: "0 0 4px",
            }}
          >
            {imageUrl ? "Cover image uploaded ✓" : "Upload a cover image"}
          </p>
          <p style={{ fontSize: "12px", color: "#9CA3AF", margin: "0 0 12px" }}>
            JPG, PNG or WEBP · Max 5MB · Recommended 400×550px
          </p>

          {error && (
            <p
              style={{ fontSize: "12px", color: "#DC2626", margin: "0 0 8px" }}
            >
              {error}
            </p>
          )}

          <input
            type="file"
            ref={fileRef}
            accept="image/*"
            onChange={handleUpload}
            style={{ display: "none" }}
          />

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              style={{
                height: "36px",
                padding: "0 16px",
                borderRadius: "8px",
                background: uploading ? "#F3F4F6" : "#fff",
                border: "1px solid #E5E7EB",
                fontSize: "13px",
                fontWeight: 600,
                color: uploading ? "#9CA3AF" : "#374151",
                cursor: uploading ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                display: "flex",
                alignItems: "center",
                gap: "7px",
              }}
            >
              {uploading ? (
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
                  Uploading...
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
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  {imageUrl ? "Change image" : "Upload image"}
                </>
              )}
            </button>

            {imageUrl && (
              <button
                onClick={() => onUpdated({ ...book, coverImage: "" })}
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
                }}
              >
                Remove
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Generate Outline Modal ──────────────────────────────────────
const OutlineModal = ({ onClose, onGenerated, bookTitle }) => {
  const [form, setForm] = useState({
    topic: bookTitle || "",
    style: "neutral",
    numChapters: 5,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!form.topic.trim()) return setError("Topic is required.");
    setLoading(true);
    setError("");
    try {
      const res = await axiosInstance.post(
        API_PATHS.AI.GENERATE_OUTLINE,
        {
          topic: form.topic,
          style: form.style,
          numChapters: Number(form.numChapters),
        },
        { timeout: 60000 },
      );
      onGenerated(res.data.outline);
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Failed to generate outline. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    height: "44px",
    padding: "0 14px",
    borderRadius: "10px",
    border: "1px solid #E5E7EB",
    background: "#fff",
    fontSize: "14px",
    fontFamily: "inherit",
    color: "#111827",
    outline: "none",
    boxSizing: "border-box",
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
          maxWidth: "480px",
        }}
      >
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
                fontSize: "1.15rem",
                fontWeight: 700,
                color: "#111827",
                margin: 0,
              }}
            >
              Generate outline with AI
            </h2>
            <p
              style={{ fontSize: "13px", color: "#6B7280", margin: "4px 0 0" }}
            >
              AI will create chapter titles and descriptions
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

        {error && (
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
            {error}
          </div>
        )}

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
            Book topic
          </label>
          <input
            type="text"
            placeholder="e.g. Productivity for remote workers"
            value={form.topic}
            onChange={(e) => setForm({ ...form, topic: e.target.value })}
            style={inputStyle}
          />
        </div>

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
            Writing style
          </label>
          <select
            value={form.style}
            onChange={(e) => setForm({ ...form, style: e.target.value })}
            style={inputStyle}
          >
            {STYLES.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>

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
            Number of chapters:{" "}
            <span style={{ color: "#4F46E5" }}>{form.numChapters}</span>
          </label>
          <input
            type="range"
            min="3"
            max="15"
            step="1"
            value={form.numChapters}
            onChange={(e) =>
              setForm({ ...form, numChapters: Number(e.target.value) })
            }
            style={{ width: "100%", accentColor: "#4F46E5" }}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "11px",
              color: "#9CA3AF",
              marginTop: "4px",
            }}
          >
            <span>3</span>
            <span>15</span>
          </div>
        </div>

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
            onClick={handleGenerate}
            disabled={loading}
            style={{
              flex: 2,
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
              gap: "8px",
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
                Generating...
              </>
            ) : (
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
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                Generate Outline
              </>
            )}
          </button>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

// ─── Editor Page ─────────────────────────────────────────────────
const EditorPage = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();

  const [book, setBook] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [generatingChapter, setGeneratingChapter] = useState(null);
  const [generationError, setGenerationError] = useState("");
  const [showOutlineModal, setShowOutlineModal] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [bookStyle, setBookStyle] = useState("neutral");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // ── Fetch book ──
  useEffect(() => {
    fetchBook();
  }, [bookId]);

  // ── Close export menu on outside click ──
  useEffect(() => {
    const handler = () => setShowExportMenu(false);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  const fetchBook = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(API_PATHS.BOOKS.GET_ONE(bookId));
      setBook(res.data);
      setChapters(res.data.chapters || []);
      if (res.data.chapters?.length > 0) setActiveIndex(0);
    } catch (err) {
      console.error("Failed to fetch book:", err);
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  // ── Auto-save (debounced 1.5s) ──
  const autoSave = useCallback(
    debounce(async (updatedChapters, updatedBook) => {
      setSaving(true);
      setSaveError(false);
      try {
        await axiosInstance.put(API_PATHS.BOOKS.UPDATE(bookId), {
          ...updatedBook,
          chapters: updatedChapters,
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } catch (err) {
        console.error("Auto-save failed:", err);
        setSaveError(true);
        setTimeout(() => setSaveError(false), 3000);
      } finally {
        setSaving(false);
      }
    }, 1500),
    [bookId],
  );

  // ── Update chapter field ──
  const updateChapter = (index, field, value) => {
    const updated = chapters.map((ch, i) =>
      i === index ? { ...ch, [field]: value } : ch,
    );
    setChapters(updated);
    autoSave(updated, book);
  };

  // ── Update book meta ──
  const updateBookField = (field, value) => {
    const updated = { ...book, [field]: value };
    setBook(updated);
    autoSave(chapters, updated);
  };

  // ── Add chapter ──
  const addChapter = () => {
    const newChapter = {
      title: `Chapter ${chapters.length + 1}`,
      description: "",
      content: "",
    };
    const updated = [...chapters, newChapter];
    setChapters(updated);
    setActiveIndex(updated.length - 1);
    autoSave(updated, book);
  };

  // ── Delete chapter ──
  const deleteChapter = (index) => {
    const updated = chapters.filter((_, i) => i !== index);
    setChapters(updated);
    setActiveIndex(Math.max(0, Math.min(activeIndex, updated.length - 1)));
    autoSave(updated, book);
  };

  // ── AI: Generate outline ──
  const handleOutlineGenerated = (outline) => {
    const newChapters = outline.map((ch) => ({
      title: ch.title,
      description: ch.description,
      content: "",
    }));
    setChapters(newChapters);
    setActiveIndex(0);
    autoSave(newChapters, book);
  };

  // ── AI: Generate chapter content (with retry) ──
  const generateContent = async (index, retryCount = 0) => {
    const chapter = chapters[index];
    if (!chapter?.title) return;

    setGeneratingChapter(index);
    setGenerationError("");

    try {
      const res = await axiosInstance.post(
        API_PATHS.AI.GENERATE_CHAPTER_CONTENT,
        {
          chapterTitle: chapter.title,
          chapterDescription: chapter.description || "",
          style: bookStyle,
        },
        { timeout: 120000 }, // ← 2 min timeout for AI
      );

      // Use functional update to get latest chapters state
      setChapters((prev) => {
        const updated = prev.map((ch, i) =>
          i === index ? { ...ch, content: res.data.content } : ch,
        );
        autoSave(updated, book);
        return updated;
      });
    } catch (err) {
      if (retryCount < 1) {
        console.warn(
          `Generation failed, retrying... (attempt ${retryCount + 1})`,
        );
        // Wait 2s before retry
        await new Promise((resolve) => setTimeout(resolve, 2000));
        await generateContent(index, retryCount + 1);
        return;
      }
      const msg =
        err.code === "ECONNABORTED"
          ? "Request timed out. Please try again."
          : err.response?.data?.error || "Generation failed. Please try again.";
      setGenerationError(msg);
      setTimeout(() => setGenerationError(""), 5000);
    } finally {
      setGeneratingChapter(null);
    }
  };

  // ── Generate all empty chapters sequentially ──
  const generateAllContent = async () => {
    for (let i = 0; i < chapters.length; i++) {
      if (!chapters[i].content) {
        await generateContent(i);
      }
    }
  };

  // ── Export ──
  const handleExport = async (type) => {
    setExporting(true);
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
      link.download = `${
        book?.title?.replace(/[^a-zA-Z0-9]/g, "_") || "book"
      }.${type === "pdf" ? "pdf" : "docx"}`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (err) {
      setExportError("Export failed. Please try again.");
      setTimeout(() => setExportError(""), 4000);
    } finally {
      setExporting(false);
    }
  };

  // ── Manual save ──
  const handleManualSave = async () => {
    setSaving(true);
    setSaveError(false);
    try {
      await axiosInstance.put(API_PATHS.BOOKS.UPDATE(bookId), {
        ...book,
        chapters,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setSaveError(true);
      setTimeout(() => setSaveError(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const activeChapter = chapters[activeIndex];
  const wordCount = activeChapter?.content
    ? activeChapter.content.split(/\s+/).filter(Boolean).length
    : 0;

  // ── Save status label ──
  const saveLabel = saveError
    ? "Save failed ✕"
    : saving
      ? "Saving..."
      : saved
        ? "Saved ✓"
        : "Auto-save on";

  const saveColor = saveError
    ? "#DC2626"
    : saving
      ? "#F59E0B"
      : saved
        ? "#059669"
        : "#9CA3AF";

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
        Loading editor...
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

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

      {/* ── Top Navbar ── */}
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
              whiteSpace: "nowrap",
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

          <input
            type="text"
            value={book?.title || ""}
            onChange={(e) => updateBookField("title", e.target.value)}
            style={{
              border: "none",
              background: "transparent",
              fontSize: "14px",
              fontWeight: 700,
              color: "#111827",
              outline: "none",
              fontFamily: "inherit",
              minWidth: "100px",
              maxWidth: "240px",
            }}
            placeholder="Book title..."
          />

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title="Toggle sidebar"
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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: "12px", color: saveColor }}>
            {saveLabel}
          </span>

          <select
            value={bookStyle}
            onChange={(e) => setBookStyle(e.target.value)}
            style={{
              height: "34px",
              padding: "0 10px",
              borderRadius: "8px",
              border: "1px solid #E5E7EB",
              background: "#fff",
              fontSize: "12px",
              fontFamily: "inherit",
              color: "#374151",
              outline: "none",
              cursor: "pointer",
            }}
          >
            {STYLES.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowOutlineModal(true)}
            style={{
              height: "34px",
              padding: "0 12px",
              borderRadius: "8px",
              background: "#F5F3FF",
              border: "1px solid #DDD6FE",
              fontSize: "12px",
              fontWeight: 600,
              color: "#7C3AED",
              cursor: "pointer",
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              gap: "5px",
              whiteSpace: "nowrap",
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
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            AI Outline
          </button>

          <button
            onClick={handleManualSave}
            disabled={saving}
            style={{
              height: "34px",
              padding: "0 14px",
              borderRadius: "8px",
              background: "#fff",
              border: "1px solid #E5E7EB",
              fontSize: "12px",
              fontWeight: 600,
              color: "#374151",
              cursor: saving ? "not-allowed" : "pointer",
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
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            Save
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
              ) : (
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
              )}
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

      {/* ── Error toasts ── */}
      {(exportError || generationError) && (
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
            maxWidth: "320px",
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
            style={{ flexShrink: 0 }}
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {exportError || generationError}
        </div>
      )}

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
            <div
              style={{
                padding: "12px 12px 8px",
                borderBottom: "0.5px solid #F3F4F6",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                }}
              >
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#6B7280",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  Chapters ({chapters.length})
                </span>
                <button
                  onClick={addChapter}
                  title="Add chapter"
                  style={{
                    background: "#EEF0FF",
                    border: "none",
                    borderRadius: "6px",
                    width: "26px",
                    height: "26px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#4F46E5",
                  }}
                >
                  <svg
                    width="13"
                    height="13"
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
                </button>
              </div>

              {chapters.length > 0 && (
                <button
                  onClick={generateAllContent}
                  disabled={generatingChapter !== null}
                  style={{
                    width: "100%",
                    height: "32px",
                    borderRadius: "8px",
                    background:
                      generatingChapter !== null ? "#F5F3FF" : "#EDE9FE",
                    border: "none",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#7C3AED",
                    cursor:
                      generatingChapter !== null ? "not-allowed" : "pointer",
                    fontFamily: "inherit",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
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
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  {generatingChapter !== null
                    ? "Generating..."
                    : "Generate all content"}
                </button>
              )}
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
              {chapters.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "2rem 1rem",
                    color: "#9CA3AF",
                    fontSize: "13px",
                  }}
                >
                  <p style={{ marginBottom: "8px" }}>No chapters yet.</p>
                  <p>Use AI Outline or add manually.</p>
                </div>
              ) : (
                chapters.map((ch, i) => (
                  <ChapterItem
                    key={i}
                    chapter={ch}
                    index={i}
                    isActive={activeIndex === i}
                    onClick={() => setActiveIndex(i)}
                    onDelete={deleteChapter}
                    isGenerating={generatingChapter === i}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {/* ── Main Editor Area ── */}
        <div
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
                  width: "72px",
                  height: "72px",
                  borderRadius: "18px",
                  background: "#EEF0FF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1.25rem",
                }}
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#4F46E5"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
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
                Start writing your book
              </h3>
              <p
                style={{
                  fontSize: "14px",
                  color: "#6B7280",
                  marginBottom: "1.5rem",
                  maxWidth: "320px",
                }}
              >
                Generate a full outline with AI or add chapters manually.
              </p>
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                  justifyContent: "center",
                }}
              >
                <button
                  onClick={() => setShowOutlineModal(true)}
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
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  Generate with AI
                </button>
                <button
                  onClick={addChapter}
                  style={{
                    height: "42px",
                    padding: "0 20px",
                    borderRadius: "10px",
                    background: "#fff",
                    border: "1px solid #E5E7EB",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#374151",
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
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Add chapter manually
                </button>
              </div>
            </div>
          ) : activeChapter ? (
            <div
              style={{
                maxWidth: "800px",
                width: "100%",
                margin: "0 auto",
                padding: "2rem 1.5rem",
              }}
            >
              {/* ── Cover Upload ── */}
              <CoverUpload
                book={book}
                bookId={bookId}
                onUpdated={(updatedBook) => setBook(updatedBook)}
              />

              {/* ── Chapter meta ── */}
              <div
                style={{
                  background: "#fff",
                  border: "0.5px solid #E5E7EB",
                  borderRadius: "14px",
                  padding: "1.25rem",
                  marginBottom: "1.25rem",
                }}
              >
                <input
                  type="text"
                  value={activeChapter.title}
                  onChange={(e) =>
                    updateChapter(activeIndex, "title", e.target.value)
                  }
                  placeholder="Chapter title..."
                  style={{
                    width: "100%",
                    border: "none",
                    background: "transparent",
                    fontSize: "1.3rem",
                    fontWeight: 700,
                    color: "#111827",
                    outline: "none",
                    fontFamily: "inherit",
                    marginBottom: "10px",
                    boxSizing: "border-box",
                  }}
                />

                <textarea
                  value={activeChapter.description}
                  onChange={(e) =>
                    updateChapter(activeIndex, "description", e.target.value)
                  }
                  placeholder="Brief description of this chapter (used by AI to generate content)..."
                  rows={2}
                  style={{
                    width: "100%",
                    border: "none",
                    background: "#F9FAFB",
                    borderRadius: "8px",
                    padding: "10px 12px",
                    fontSize: "13px",
                    color: "#6B7280",
                    outline: "none",
                    fontFamily: "inherit",
                    resize: "none",
                    boxSizing: "border-box",
                    lineHeight: 1.6,
                  }}
                />

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginTop: "10px",
                  }}
                >
                  <span style={{ fontSize: "12px", color: "#9CA3AF" }}>
                    {wordCount > 0
                      ? `${wordCount.toLocaleString()} words`
                      : "No content yet"}
                  </span>
                  <button
                    onClick={() => generateContent(activeIndex)}
                    disabled={generatingChapter !== null}
                    style={{
                      height: "32px",
                      padding: "0 14px",
                      borderRadius: "8px",
                      background:
                        generatingChapter === activeIndex
                          ? "#F5F3FF"
                          : "#EDE9FE",
                      border: "none",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#7C3AED",
                      cursor:
                        generatingChapter !== null ? "not-allowed" : "pointer",
                      fontFamily: "inherit",
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    {generatingChapter === activeIndex ? (
                      <>
                        <svg
                          width="12"
                          height="12"
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
                        Generating...
                      </>
                    ) : (
                      <>
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
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        Generate with AI
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* ── Content editor ── */}
              <div
                style={{
                  background: "#fff",
                  border: "0.5px solid #E5E7EB",
                  borderRadius: "14px",
                  overflow: "hidden",
                }}
              >
                {generatingChapter === activeIndex ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "5rem",
                      gap: "12px",
                      color: "#6B7280",
                    }}
                  >
                    <svg
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#7C3AED"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ animation: "spin 1s linear infinite" }}
                    >
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    <p style={{ fontSize: "14px", fontWeight: 500, margin: 0 }}>
                      AI is writing your chapter...
                    </p>
                    <p
                      style={{ fontSize: "13px", color: "#9CA3AF", margin: 0 }}
                    >
                      This may take 15–30 seconds
                    </p>
                  </div>
                ) : (
                  <textarea
                    value={activeChapter.content}
                    onChange={(e) =>
                      updateChapter(activeIndex, "content", e.target.value)
                    }
                    placeholder="Start writing here, or click 'Generate with AI' to auto-generate content..."
                    style={{
                      width: "100%",
                      minHeight: "500px",
                      border: "none",
                      padding: "1.5rem",
                      fontSize: "15px",
                      lineHeight: 1.8,
                      color: "#374151",
                      fontFamily: "Georgia, serif",
                      outline: "none",
                      resize: "none",
                      boxSizing: "border-box",
                      background: "transparent",
                    }}
                  />
                )}
              </div>

              {/* ── Chapter navigation ── */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: "1.25rem",
                  paddingBottom: "2rem",
                }}
              >
                <button
                  onClick={() => setActiveIndex(Math.max(0, activeIndex - 1))}
                  disabled={activeIndex === 0}
                  style={{
                    height: "36px",
                    padding: "0 14px",
                    borderRadius: "8px",
                    border: "1px solid #E5E7EB",
                    background: "#fff",
                    fontSize: "13px",
                    fontWeight: 500,
                    color: activeIndex === 0 ? "#D1D5DB" : "#374151",
                    cursor: activeIndex === 0 ? "not-allowed" : "pointer",
                    fontFamily: "inherit",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
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
                    <line x1="19" y1="12" x2="5" y2="12" />
                    <polyline points="12 19 5 12 12 5" />
                  </svg>
                  Previous
                </button>

                <span style={{ fontSize: "13px", color: "#9CA3AF" }}>
                  Chapter {activeIndex + 1} of {chapters.length}
                </span>

                <button
                  onClick={() =>
                    setActiveIndex(
                      Math.min(chapters.length - 1, activeIndex + 1),
                    )
                  }
                  disabled={activeIndex === chapters.length - 1}
                  style={{
                    height: "36px",
                    padding: "0 14px",
                    borderRadius: "8px",
                    border: "1px solid #E5E7EB",
                    background: "#fff",
                    fontSize: "13px",
                    fontWeight: 500,
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
                    gap: "6px",
                  }}
                >
                  Next
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
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* ── Modals ── */}
      {showOutlineModal && (
        <OutlineModal
          onClose={() => setShowOutlineModal(false)}
          onGenerated={handleOutlineGenerated}
          bookTitle={book?.title}
        />
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default EditorPage;
