// src/components/layout/AppHeader.jsx

import { Sun, Moon, Menu, Bell } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import { useStore } from "../../store/useStore.jsx";
import { ProfileModal } from "../settings/ProfileModal.jsx";
import { useWideLayout, daysUntil, formatDZD } from "../../hooks/useSubscriptions.js";

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
            fontFamily: "'Playfair Display', serif",
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
            fontFamily: "'IBM Plex Mono', monospace",
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
        fontFamily: "'IBM Plex Mono', monospace",
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
function UserAvatar({ initials = "AK", onClick }) {
  return (
    <div
      onClick={onClick}
      title="Modifier le profil"
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
        fontFamily: "'IBM Plex Mono', monospace",
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

// ── Notification Bell ──────────────────
function NotificationBell() {
  const { subscriptions, categories } = useStore();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const urgent = subscriptions
    .filter((s) => s.status === "active" || s.status === "trial")
    .map((s) => ({ ...s, days: daysUntil(s.renewalDay) }))
    .filter((s) => s.days <= 3)
    .sort((a, b) => a.days - b.days);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          position: "relative",
          background: open ? "var(--bg-3)" : "transparent",
          border: "1px solid var(--border-2)",
          borderRadius: "8px",
          padding: "6px",
          cursor: "pointer",
          color: urgent.length > 0 ? "var(--red)" : "var(--text-faint)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.2s ease",
        }}
        title="Notifications de renouvellement"
      >
        <Bell size={16} />
        {urgent.length > 0 && (
          <div style={{
            position: "absolute",
            top: "-5px",
            right: "-5px",
            width: "16px",
            height: "16px",
            borderRadius: "50%",
            background: "var(--red)",
            color: "#fff",
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: "9px",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "2px solid var(--bg)",
          }}>
            {urgent.length}
          </div>
        )}
      </button>

      {open && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 8px)",
          right: 0,
          width: "280px",
          background: "var(--bg-2)",
          border: "1px solid var(--border)",
          borderRadius: "12px",
          boxShadow: "var(--shadow-card)",
          zIndex: 500,
          overflow: "hidden",
        }}>
          {/* Header */}
          <div style={{
            padding: "12px 14px",
            borderBottom: "1px solid var(--border-2)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--red)", flexShrink: 0 }} />
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "14px", fontWeight: 600, color: "var(--text)" }}>
              Renouvellements proches
            </span>
          </div>

          {urgent.length === 0 ? (
            <div style={{ padding: "16px 14px", fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", color: "var(--text-faint)", textAlign: "center" }}>
              Aucun renouvellement dans 3 jours
            </div>
          ) : (
            <div>
              {urgent.map((s) => {
                const cat = categories.find((c) => c.key === s.category);
                return (
                  <div key={s.id} style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px 14px",
                    borderBottom: "1px solid var(--border-2)",
                  }}>
                    {/* Icon */}
                    <div style={{
                      width: "30px", height: "30px", borderRadius: "7px",
                      background: `${cat?.color ?? "var(--teal)"}18`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "14px", flexShrink: 0,
                    }}>
                      {s.icon}
                    </div>
                    {/* Name + days */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {s.name}
                      </div>
                      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "8px", color: s.days === 0 ? "var(--red)" : "var(--text-faint)", letterSpacing: "1px", marginTop: "2px" }}>
                        {s.days === 0 ? "Aujourd'hui" : s.days === 1 ? "Demain" : `Dans ${s.days} jours`}
                      </div>
                    </div>
                    {/* Amount */}
                    <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", color: "var(--red)", fontWeight: 600, flexShrink: 0 }}>
                      {formatDZD(s.amount)} DZD
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── AppHeader ──────────────────────────
export function AppHeader({ onMenuClick }) {
  const { profile } = useStore();
  const [profileOpen, setProfileOpen] = useState(false);
  const isDesktop = useWideLayout(768);

  return (
    <>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          height: "68px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          backgroundColor: "var(--bg)",
          borderBottom: "1px solid var(--border2)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          gap: "12px",
        }}
      >
        {/* Hamburger — only shown on mobile */}
        {!isDesktop && (
          <button
            onClick={onMenuClick}
            style={{
              background: "transparent",
              border: "1px solid var(--border-2)",
              borderRadius: "8px",
              padding: "6px",
              cursor: "pointer",
              color: "var(--text-faint)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Menu size={18} />
          </button>
        )}

        <Logo />

        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginLeft: "auto" }}>
          {/* Month badge hidden on mobile — saves space */}
          {isDesktop && <MonthBadge />}
          <NotificationBell />
          <ThemeToggle />
          <UserAvatar initials={profile.initials} onClick={() => setProfileOpen(true)} />
        </div>
      </header>

      <ProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
    </>
  );
}
