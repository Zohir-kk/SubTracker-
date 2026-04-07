// src/components/layout/AppHeader.jsx

import { Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

// ── Logo ──────────────────────────────
function Logo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      {/* Diamond — SVG for reliable cross-browser rendering */}
      <svg width="28" height="28" viewBox="0 0 28 28" style={{ flexShrink: 0 }}>
        <polygon points="14,1 27,14 14,27 1,14" fill="var(--gold)" />
        <text
          x="14"
          y="19"
          textAnchor="middle"
          fontFamily="Georgia, serif"
          fontSize="11"
          fontWeight="700"
          fill="#080c14"
        >
          S
        </text>
      </svg>

      <div>
        <div
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "20px",
            fontWeight: 700,
            color: "var(--text)",
            letterSpacing: "1px",
            lineHeight: 1,
          }}
        >
          SubDz
        </div>
        <div
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: "8px",
            color: "var(--text-faint)",
            letterSpacing: "2px",
            textTransform: "uppercase",
            marginTop: "3px",
          }}
        >
          Gestionnaire d'abonnements
        </div>
      </div>
    </div>
  );
}

// ── Month Badge ────────────────────────
function MonthBadge() {
  const now = new Date();
  const label = now.toLocaleDateString("fr-DZ", {
    month: "long",
    year: "numeric",
  });
  const formatted = label.charAt(0).toUpperCase() + label.slice(1);

  return (
    <div
      style={{
        fontFamily: "'DM Mono', monospace",
        fontSize: "10px",
        letterSpacing: "1.5px",
        textTransform: "uppercase",
        border: "1px solid var(--border)",
        color: "var(--gold)",
        padding: "5px 12px",
        borderRadius: "20px",
        whiteSpace: "nowrap",
      }}
    >
      {formatted}
    </div>
  );
}

// ── Theme Toggle ───────────────────────
function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return <div style={{ width: "80px" }} />;

  const isDark = theme === "dark";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        cursor: "pointer",
      }}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      role="switch"
      aria-checked={isDark}
      aria-label="Activer le mode clair/sombre"
    >
      <Sun
        size={14}
        style={{
          opacity: isDark ? 0.3 : 1,
          color: "var(--gold)",
          transition: "opacity 0.2s ease",
        }}
      />

      <div
        style={{
          width: "42px",
          height: "24px",
          borderRadius: "12px",
          border: "1px solid var(--border)",
          backgroundColor: "var(--gold-dim)",
          position: "relative",
        }}
      >
        {/* Thumb — hardcoded hex so it always shows correctly */}
        <div
          style={{
            width: "18px",
            height: "18px",
            borderRadius: "50%",
            backgroundColor: isDark ? "#2dd4bf" : "#0d9488",
            position: "absolute",
            top: "2px",
            left: "2px",
            transform: isDark ? "translateX(18px)" : "translateX(0px)",
            transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
      </div>

      <Moon
        size={14}
        style={{
          opacity: isDark ? 1 : 0.3,
          color: "var(--gold)",
          transition: "opacity 0.2s ease",
        }}
      />
    </div>
  );
}

// ── User Avatar ────────────────────────
function UserAvatar({ initials = "AK" }) {
  return (
    <div
      style={{
        width: "34px",
        height: "34px",
        minWidth: "34px",
        borderRadius: "50%",
        backgroundColor: "var(--gold)",
        color: "#080c14",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'DM Mono', monospace",
        fontSize: "11px",
        fontWeight: 500,
        cursor: "pointer",
        userSelect: "none",
      }}
    >
      {initials}
    </div>
  );
}

// ── AppHeader ──────────────────────────
export function AppHeader({ userInitials = "AK" }) {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        height: "68px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        backgroundColor: "var(--bg)",
        borderBottom: "1px solid var(--border2)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      <Logo />

      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <MonthBadge />
        <ThemeToggle />
        <UserAvatar initials={userInitials} />
      </div>
    </header>
  );
}
