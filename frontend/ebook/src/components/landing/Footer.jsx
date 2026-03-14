import React, { useState } from "react";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState(false);

  const handleSubscribe = () => {
    if (!email || !email.includes("@")) {
      setError(true);
      setTimeout(() => setError(false), 1500);
      return;
    }
    setSubscribed(true);
    setEmail("");
    setTimeout(() => setSubscribed(false), 3000);
  };

  const productLinks = [
    "Features",
    "Pricing",
    "Templates",
    "AI Writing",
    "Export & Publish",
    "Changelog",
  ];
  const companyLinks = [
    { label: "About Us" },
    { label: "Blog" },
    { label: "Careers", badge: "3 open" },
    { label: "Press Kit" },
    { label: "Affiliates" },
    { label: "Contact" },
  ];
  const resourceLinks = [
    "Help Center",
    "Tutorials",
    "API Docs",
    "Community",
    "Status",
    "Testimonials",
  ];

  const socials = [
    {
      title: "Twitter/X",
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="#D1D5DB">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.738l7.737-8.835L1.254 2.25H8.08l4.259 5.632 5.905-5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      title: "LinkedIn",
      icon: (
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#D1D5DB"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
          <rect x="2" y="9" width="4" height="12" />
          <circle cx="4" cy="4" r="2" />
        </svg>
      ),
    },
    {
      title: "Instagram",
      icon: (
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#D1D5DB"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
      ),
    },
    {
      title: "YouTube",
      icon: (
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#D1D5DB"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
          <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
        </svg>
      ),
    },
  ];

  const styles = {
    footer: {
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      background: "#0F0E1A",
      color: "#fff",
      padding: "4rem 1.5rem 0",
    },
    inner: { maxWidth: "1100px", margin: "0 auto" },
    top: {
      display: "grid",
      gridTemplateColumns: "2fr 1fr 1fr 1fr",
      gap: "3rem",
      paddingBottom: "3rem",
      borderBottom: "0.5px solid rgba(255,255,255,0.08)",
    },
    logoRow: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      marginBottom: "1rem",
    },
    logoIcon: {
      width: "36px",
      height: "36px",
      background: "#4F46E5",
      borderRadius: "10px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    logoName: { fontSize: "1.2rem", fontWeight: 700, color: "#fff" },
    desc: {
      fontSize: "14px",
      color: "#9CA3AF",
      lineHeight: 1.7,
      marginBottom: "1.5rem",
      maxWidth: "280px",
    },
    socialRow: { display: "flex", gap: "10px" },
    colTitle: {
      fontSize: "12px",
      fontWeight: 600,
      color: "#6B7280",
      textTransform: "uppercase",
      letterSpacing: "0.08em",
      marginBottom: "1.2rem",
    },
    colLinks: { display: "flex", flexDirection: "column", gap: "10px" },
    link: {
      fontSize: "14px",
      color: "#D1D5DB",
      textDecoration: "none",
      cursor: "pointer",
    },
    badge: {
      fontSize: "11px",
      background: "#4F46E5",
      color: "#fff",
      padding: "1px 7px",
      borderRadius: "999px",
      marginLeft: "4px",
    },
    badgeRow: {
      display: "flex",
      gap: "8px",
      flexWrap: "wrap",
      marginTop: "1.5rem",
    },
    trustBadge: {
      display: "inline-flex",
      alignItems: "center",
      gap: "5px",
      background: "rgba(255,255,255,0.05)",
      border: "0.5px solid rgba(255,255,255,0.1)",
      borderRadius: "999px",
      padding: "4px 12px",
      fontSize: "12px",
      color: "#D1D5DB",
    },
    dot: {
      width: "6px",
      height: "6px",
      borderRadius: "50%",
      background: "#34D399",
      flexShrink: 0,
    },
    newsletter: {
      marginTop: "2.5rem",
      padding: "2rem",
      background: "rgba(79,70,229,0.1)",
      border: "0.5px solid rgba(79,70,229,0.25)",
      borderRadius: "16px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "2rem",
      flexWrap: "wrap",
    },
    nlForm: { display: "flex", gap: "8px", flex: 1, maxWidth: "380px" },
    nlInput: {
      flex: 1,
      padding: "0 14px",
      height: "40px",
      borderRadius: "8px",
      border: `0.5px solid ${error ? "#F87171" : "rgba(255,255,255,0.15)"}`,
      background: "rgba(255,255,255,0.06)",
      color: "#fff",
      fontSize: "14px",
      fontFamily: "inherit",
      outline: "none",
      transition: "border-color 0.2s",
    },
    nlBtn: {
      padding: "0 18px",
      height: "40px",
      borderRadius: "8px",
      background: subscribed ? "#059669" : "#4F46E5",
      color: "#fff",
      fontSize: "14px",
      fontWeight: 600,
      border: "none",
      cursor: "pointer",
      whiteSpace: "nowrap",
      fontFamily: "inherit",
      transition: "background 0.2s",
    },
    bottom: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: "1rem",
      padding: "1.5rem 0",
      marginTop: "2.5rem",
      borderTop: "0.5px solid rgba(255,255,255,0.08)",
    },
    copy: { fontSize: "13px", color: "#6B7280" },
    accent: { color: "#818CF8" },
    bottomLinks: { display: "flex", gap: "1.5rem" },
    bottomLink: {
      fontSize: "13px",
      color: "#6B7280",
      textDecoration: "none",
      cursor: "pointer",
    },
  };

  return (
    <footer style={styles.footer}>
      <link
        href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      <div style={styles.inner}>
        {/* Top Grid */}
        <div style={styles.top}>
          {/* Brand Column */}
          <div>
            <div style={styles.logoRow}>
              <div style={styles.logoIcon}>
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
              <span style={styles.logoName}>Ebookify</span>
            </div>
            <p style={styles.desc}>
              From idea to published ebook — our AI-powered platform helps you
              write, design, and export professional-quality books effortlessly.
            </p>
            <div style={styles.socialRow}>
              {socials.map((s) => (
                <SocialBtn key={s.title} title={s.title} icon={s.icon} />
              ))}
            </div>
            <div style={styles.badgeRow}>
              {["99.9% Uptime", "SOC 2 Compliant", "GDPR Ready"].map(
                (label) => (
                  <div key={label} style={styles.trustBadge}>
                    <div style={styles.dot} />
                    {label}
                  </div>
                ),
              )}
            </div>
          </div>

          {/* Product */}
          <div>
            <div style={styles.colTitle}>Product</div>
            <div style={styles.colLinks}>
              {productLinks.map((l) => (
                <a key={l} href="#" style={styles.link}>
                  {l}
                </a>
              ))}
            </div>
          </div>

          {/* Company */}
          <div>
            <div style={styles.colTitle}>Company</div>
            <div style={styles.colLinks}>
              {companyLinks.map((l) => (
                <a key={l.label} href="#" style={styles.link}>
                  {l.label}
                  {l.badge && <span style={styles.badge}>{l.badge}</span>}
                </a>
              ))}
            </div>
          </div>

          {/* Resources */}
          <div>
            <div style={styles.colTitle}>Resources</div>
            <div style={styles.colLinks}>
              {resourceLinks.map((l) => (
                <a key={l} href="#" style={styles.link}>
                  {l}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Newsletter */}
        <div style={styles.newsletter}>
          <div>
            <h3
              style={{
                fontSize: "1rem",
                fontWeight: 600,
                color: "#fff",
                marginBottom: "4px",
              }}
            >
              Stay in the loop
            </h3>
            <p style={{ fontSize: "13px", color: "#9CA3AF" }}>
              Get tips, templates & product updates straight to your inbox.
            </p>
          </div>
          <div style={styles.nlForm}>
            <input
              style={styles.nlInput}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubscribe()}
            />
            <button style={styles.nlBtn} onClick={handleSubscribe}>
              {subscribed ? "Subscribed ✓" : "Subscribe"}
            </button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={styles.bottom}>
          <div style={styles.copy}>
            © 2025 <span style={styles.accent}>Ebookify</span>. All rights
            reserved. Made with ♥ for creators.
          </div>
          <div style={styles.bottomLinks}>
            {["Privacy Policy", "Terms of Service", "Cookie Settings"].map(
              (l) => (
                <a key={l} href="#" style={styles.bottomLink}>
                  {l}
                </a>
              ),
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};

const SocialBtn = ({ title, icon }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      title={title}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: "36px",
        height: "36px",
        borderRadius: "8px",
        background: hovered ? "#4F46E5" : "rgba(255,255,255,0.06)",
        border: `0.5px solid ${hovered ? "#4F46E5" : "rgba(255,255,255,0.1)"}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: "background 0.2s, border-color 0.2s",
      }}
    >
      {icon}
    </div>
  );
};

export default Footer;
