import React, { useState, useEffect, useRef } from "react";

const testimonialsData = [
  {
    id: 1,
    initials: "AJ",
    name: "Alice Johnson",
    role: "Aspiring Author · 3 books published",
    message:
      "Ebookify completely transformed how I publish. What used to take me weeks now takes under 10 minutes. The AI even helped me structure chapters I was stuck on for months!",
    rating: 5,
    featured: true,
    color: { bg: "#EEF0FF", text: "#4F46E5" },
  },
  {
    id: 2,
    initials: "MS",
    name: "Mark Smith",
    role: "Educator · 12 guides created",
    message:
      "The resources and layout tools are incredibly clear. I published my study guide in a single afternoon. My students love the clean, professional format it produces.",
    rating: 5,
    color: { bg: "#FEF3C7", text: "#92400E" },
  },
  {
    id: 3,
    initials: "SL",
    name: "Sofia Lee",
    role: "Writer · 7 ebooks created",
    message:
      "The navigation and design features are so intuitive. I found exactly what I needed on my first try. Highly recommend for any serious writer.",
    rating: 5,
    color: { bg: "#D1FAE5", text: "#065F46" },
  },
  {
    id: 4,
    initials: "RK",
    name: "Riya Kapoor",
    role: "Blogger · 5 ebooks created",
    message:
      "I was skeptical about AI-powered writing tools, but Ebookify won me over. The export quality is pristine — my readers can't believe I built everything myself.",
    rating: 4,
    color: { bg: "#FCE7F3", text: "#9D174D" },
  },
  {
    id: 5,
    initials: "JT",
    name: "James Tran",
    role: "Content Creator · 9 ebooks created",
    message:
      "Turned my raw notes into a 200-page ebook in an afternoon. The AI suggestions for titles and chapter breaks were surprisingly spot-on. This is the future of publishing.",
    rating: 5,
    color: { bg: "#EDE9FE", text: "#5B21B6" },
  },
];

const StarRating = ({ rating }) => (
  <div style={{ display: "flex", gap: "2px", marginBottom: "1rem" }}>
    {[1, 2, 3, 4, 5].map((s) => (
      <span
        key={s}
        style={{ color: s <= rating ? "#F59E0B" : "#E5E7EB", fontSize: "14px" }}
      >
        ★
      </span>
    ))}
  </div>
);

const TestimonialCard = ({ t }) => (
  <div
    style={{
      flex: "0 0 calc(33.333% - 0.85rem)",
      minWidth: "260px",
      background: t.featured
        ? "linear-gradient(145deg, #FAFAFF 0%, #F0F0FF 100%)"
        : "#fff",
      border: t.featured ? "1.5px solid #4F46E5" : "0.5px solid #E5E7EB",
      borderRadius: "16px",
      padding: "1.5rem",
      position: "relative",
      transition: "transform 0.25s, border-color 0.25s",
      cursor: "default",
      boxSizing: "border-box",
    }}
    onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-4px)")}
    onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
  >
    {t.featured && (
      <div
        style={{
          position: "absolute",
          top: "1rem",
          right: "1rem",
          background: "#4F46E5",
          color: "#fff",
          fontSize: "11px",
          fontWeight: 600,
          padding: "3px 10px",
          borderRadius: "999px",
        }}
      >
        Top Review
      </div>
    )}
    <div
      style={{
        fontSize: "2.5rem",
        color: "#C7C9FF",
        lineHeight: 1,
        marginBottom: "0.75rem",
        fontFamily: "Georgia, serif",
      }}
    >
      "
    </div>
    <StarRating rating={t.rating} />
    <p
      style={{
        fontSize: "14.5px",
        color: "#6B7280",
        lineHeight: 1.7,
        marginBottom: "1.25rem",
      }}
    >
      {t.message}
    </p>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        paddingTop: "1rem",
        borderTop: "0.5px solid #E5E7EB",
      }}
    >
      <div
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          background: t.color.bg,
          color: t.color.text,
          fontSize: "13px",
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {t.initials}
      </div>
      <div>
        <div style={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>
          {t.name}
        </div>
        <div style={{ fontSize: "12px", color: "#9CA3AF" }}>{t.role}</div>
      </div>
    </div>
  </div>
);

const Testimonials = () => {
  const [current, setCurrent] = useState(0);
  const trackRef = useRef(null);
  const autoRef = useRef(null);

  const getVisible = () => {
    if (typeof window === "undefined") return 3;
    if (window.innerWidth < 500) return 1;
    if (window.innerWidth < 820) return 2;
    return 3;
  };

  const totalSlides = () => testimonialsData.length - getVisible() + 1;

  const goTo = (idx) => {
    const clamped = Math.max(0, Math.min(totalSlides() - 1, idx));
    setCurrent(clamped);
  };

  const slide = (dir) => goTo(current + dir);

  useEffect(() => {
    autoRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % totalSlides());
    }, 4000);
    return () => clearInterval(autoRef.current);
  }, []);

  useEffect(() => {
    if (!trackRef.current) return;
    const cards = trackRef.current.querySelectorAll(".t-card");
    if (!cards.length) return;
    const cardW = cards[0].offsetWidth;
    trackRef.current.style.transform = `translateX(-${current * (cardW + 20)}px)`;
  }, [current]);

  const pauseAuto = () => clearInterval(autoRef.current);
  const resumeAuto = () => {
    autoRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % totalSlides());
    }, 4000);
  };

  return (
    <section
      style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        padding: "4rem 1.5rem",
        background: "#F9FAFB",
      }}
      id="testimonials"
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "#EEF0FF",
                color: "#4F46E5",
                fontSize: "13px",
                fontWeight: 600,
                padding: "6px 14px",
                borderRadius: "999px",
                marginBottom: "0.75rem",
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#4F46E5"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              Reader Stories
            </div>
            <h2
              style={{
                fontSize: "clamp(1.6rem, 4vw, 2.4rem)",
                fontWeight: 700,
                color: "#111827",
                marginBottom: "0.3rem",
                lineHeight: 1.2,
              }}
            >
              Loved by <span style={{ color: "#4F46E5" }}>50,000+</span>{" "}
              creators
            </h2>
            <p style={{ fontSize: "15px", color: "#6B7280" }}>
              See what authors and readers say about Ebookify.
            </p>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            {["←", "→"].map((arrow, i) => (
              <button
                key={arrow}
                onClick={() => slide(i === 0 ? -1 : 1)}
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  border: "1.5px solid #D1D5DB",
                  background: "#fff",
                  cursor: "pointer",
                  fontSize: "18px",
                  color: "#6B7280",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#4F46E5";
                  e.currentTarget.style.color = "#4F46E5";
                  e.currentTarget.style.background = "#EEF0FF";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#D1D5DB";
                  e.currentTarget.style.color = "#6B7280";
                  e.currentTarget.style.background = "#fff";
                }}
              >
                {arrow}
              </button>
            ))}
          </div>
        </div>

        {/* Carousel */}
        <div
          style={{ overflow: "hidden" }}
          onMouseEnter={pauseAuto}
          onMouseLeave={resumeAuto}
        >
          <div
            ref={trackRef}
            style={{
              display: "flex",
              gap: "1.25rem",
              transition: "transform 0.4s cubic-bezier(0.4,0,0.2,1)",
            }}
          >
            {testimonialsData.map((t) => (
              <div
                key={t.id}
                className="t-card"
                style={{
                  flex: "0 0 calc(33.333% - 0.85rem)",
                  minWidth: "260px",
                  boxSizing: "border-box",
                }}
              >
                <TestimonialCard t={t} />
              </div>
            ))}
          </div>
        </div>

        {/* Dots */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "6px",
            marginTop: "1.5rem",
          }}
        >
          {Array.from({ length: totalSlides() }).map((_, i) => (
            <div
              key={i}
              onClick={() => goTo(i)}
              style={{
                width: i === current ? "22px" : "6px",
                height: "6px",
                borderRadius: "999px",
                background: i === current ? "#4F46E5" : "#D1D5DB",
                transition: "all 0.3s",
                cursor: "pointer",
              }}
            />
          ))}
        </div>

        {/* Stats */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: "1rem",
            marginTop: "3rem",
            paddingTop: "2rem",
            borderTop: "0.5px solid #E5E7EB",
          }}
        >
          {[
            ["50K+", "Books Created"],
            ["4.9/5", "User Rating"],
            ["10min", "Avg. Creation"],
          ].map(([num, label], i, arr) => (
            <React.Fragment key={label}>
              <div style={{ textAlign: "center", padding: "0 1.5rem" }}>
                <div
                  style={{
                    fontSize: "1.6rem",
                    fontWeight: 700,
                    color: "#4F46E5",
                  }}
                >
                  {num}
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    color: "#9CA3AF",
                    marginTop: "2px",
                  }}
                >
                  {label}
                </div>
              </div>
              {i < arr.length - 1 && (
                <div
                  style={{
                    width: "0.5px",
                    background: "#E5E7EB",
                    alignSelf: "stretch",
                  }}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
