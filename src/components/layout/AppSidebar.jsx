// src/components/layout/AppSidebar.jsx
// ─────────────────────────────────────────────────────────────
// Collapsible left navigation sidebar.
// Matches the dashboard's inline CSS style — no Tailwind classes.
// Collapses to icon-only mode when the chevron is clicked.
//
// Nav items scroll to sections by ID in the page.
// Theme toggle mirrors the one in AppHeader.
// ─────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useStore } from "../../store/useStore.jsx";
import { useWideLayout } from "../../hooks/useSubscriptions.js";
import {
  LayoutDashboard,
  CreditCard,
  BarChart3,
  TrendingUp,
  ChevronLeft,
  Moon,
  Sun,
  User,
  Settings,
} from "lucide-react";

// ── NAV CONFIG ────────────────────────────────────────────────
// Each item maps to a section ID in App.jsx via scrollToSection.
// To add a new page, add an entry here and add id="..." to the
// matching section in App.jsx.
const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", id: "dashboard" },
  { icon: CreditCard, label: "Abonnements", id: "abonnements" },
  { icon: TrendingUp, label: "Tendances", id: "tendances" },
  { icon: BarChart3, label: "Budget", id: "budget" },
  { icon: Settings, label: "Paramètres", id: "settings" },
];

// ── NAV ITEM ──────────────────────────────────────────────────
// A single navigation button. Active state gets teal border + color.
function NavItem({ item, isActive, isCollapsed, onClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: isCollapsed ? "10px" : "10px 12px",
        borderRadius: "10px",
        cursor: "pointer",
        justifyContent: isCollapsed ? "center" : "flex-start",
        // Active: teal border + teal text. Hover: bg-3. Default: transparent.
        background: isActive || hovered ? "var(--bg-3)" : "transparent",
        border: isActive
          ? "1px solid var(--border-2)"
          : "1px solid transparent",
        color: isActive
          ? "var(--gold)"
          : hovered
            ? "var(--text)"
            : "var(--text-faint)",
        transition: "all 0.2s ease",
        marginBottom: "4px",
      }}
    >
      <item.icon size={18} style={{ flexShrink: 0 }} />
      {/* Label hidden when sidebar is collapsed */}
      {!isCollapsed && (
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: "10px",
            letterSpacing: "2px",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
          }}
        >
          {item.label}
        </span>
      )}
    </div>
  );
}

// ── APP SIDEBAR (MAIN EXPORT) ─────────────────────────────────
export function AppSidebar({ isOpen, onClose }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const { profile } = useStore();
  const isDesktop = useWideLayout(768);

  // On mobile: sidebar is a fixed overlay driven by isOpen prop
  // On desktop: sidebar is always visible in the layout flow
  const isMobileOverlay = !isDesktop;

  // Avoid hydration mismatch for theme — same pattern as AppHeader
  useEffect(() => setMounted(true), []);

  const isDark = theme === "dark";

  // Scrolls to a section by its HTML id attribute.
  // Sections in App.jsx need matching id="dashboard", id="budget" etc.
  function scrollToSection(id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveSection(id);
    if (isMobileOverlay) onClose();
  }

  const width = isCollapsed ? "68px" : "220px";

  const sidebar = (
    <aside
      style={{
        width: isMobileOverlay ? "240px" : width,
        minWidth: isMobileOverlay ? "240px" : width,
        height: "100vh",
        position: isMobileOverlay ? "fixed" : "sticky",
        top: 0,
        left: 0,
        display: "flex",
        flexDirection: "column",
        background: "var(--bg-2)",
        borderRight: "1px solid var(--border-2)",
        transition: isMobileOverlay
          ? "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
          : "width 0.3s cubic-bezier(0.4, 0, 0.2, 1), min-width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        transform: isMobileOverlay
          ? isOpen ? "translateX(0)" : "translateX(-100%)"
          : "none",
        overflow: "hidden",
        zIndex: 200,
        fontFamily: "'IBM Plex Mono', monospace",
      }}
    >
      {/* ── Header: logo + single toggle button ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: isCollapsed ? "18px 8px 14px" : "20px 12px 16px 16px",
          borderBottom: "1px solid var(--border-2)",
          marginBottom: "8px",
          minHeight: "64px",
        }}
      >
        {/* Logo diamond + wordmark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            style={{ flexShrink: 0 }}
          >
            <polygon points="12,1 23,12 12,23 1,12" fill="var(--gold)" />
            <text
              x="12"
              y="17"
              textAnchor="middle"
              fontFamily="Georgia"
              fontSize="10"
              fontWeight="700"
              fill="#020d0d"
            >
              S
            </text>
          </svg>
          {!isCollapsed && (
            <span
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "18px",
                fontWeight: 700,
                color: "var(--text)",
                letterSpacing: "1px",
                whiteSpace: "nowrap",
              }}
            >
              SubDz
            </span>
          )}
        </div>

        {/* Single toggle button — always in flow, no absolute positioning */}
        {!isMobileOverlay && (
          <button
            onClick={() => setIsCollapsed((v) => !v)}
            style={{
              background: "transparent",
              border: "1px solid var(--border-2)",
              borderRadius: "6px",
              padding: "4px",
              cursor: "pointer",
              color: "var(--text-faint)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.color = "var(--text)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border-2)";
              e.currentTarget.style.color = "var(--text-faint)";
            }}
          >
            <ChevronLeft
              size={14}
              style={{
                transform: isCollapsed ? "rotate(180deg)" : "none",
                transition: "transform 0.3s ease",
              }}
            />
          </button>
        )}

        {/* Mobile: close button */}
        {isMobileOverlay && (
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "1px solid var(--border-2)",
              borderRadius: "6px",
              padding: "4px",
              cursor: "pointer",
              color: "var(--text-faint)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <ChevronLeft size={14} />
          </button>
        )}
      </div>

      {/* ── Navigation items ── */}
      <nav style={{ flex: 1, padding: "0 10px", overflowY: "auto" }}>
        {NAV_ITEMS.map((item) => (
          <NavItem
            key={item.id}
            item={item}
            isActive={activeSection === item.id}
            isCollapsed={isCollapsed}
            onClick={() => scrollToSection(item.id)}
          />
        ))}
      </nav>

      {/* ── Footer: theme toggle + user badge ── */}
      <div
        style={{
          padding: "12px 10px",
          borderTop: "1px solid var(--border-2)",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        {/* Theme toggle button */}
        {mounted && (
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "8px 10px",
              borderRadius: "8px",
              border: "1px solid transparent",
              background: "transparent",
              cursor: "pointer",
              color: "var(--text-faint)",
              width: "100%",
              justifyContent: isCollapsed ? "center" : "flex-start",
              transition: "all 0.2s ease",
              fontFamily: "'IBM Plex Mono', monospace",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "var(--bg-3)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            {isDark ? (
              <Sun size={16} style={{ color: "var(--gold)", flexShrink: 0 }} />
            ) : (
              <Moon size={16} style={{ color: "var(--gold)", flexShrink: 0 }} />
            )}
            {!isCollapsed && (
              <span
                style={{
                  fontSize: "9px",
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                }}
              >
                Mode {isDark ? "Clair" : "Sombre"}
              </span>
            )}
          </button>
        )}

        {/* User badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "8px 10px",
            borderRadius: "8px",
            background: "var(--bg-3)",
            border: "1px solid var(--border-2)",
            justifyContent: isCollapsed ? "center" : "flex-start",
          }}
        >
          {/* Avatar circle */}
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              background: "var(--gold)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              color: "#020d0d",
              fontSize: "10px",
              fontWeight: 500,
            }}
          >
            {profile.initials}
          </div>
          {!isCollapsed && (
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: "10px",
                  color: "var(--text)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {profile.name}
              </div>
              <div
                style={{
                  fontSize: "8px",
                  color: "var(--text-faint)",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                }}
              >
                Admin
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );

  if (isMobileOverlay) {
    return (
      <>
        {/* Backdrop — tapping it closes the sidebar */}
        <div
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 199,
            opacity: isOpen ? 1 : 0,
            pointerEvents: isOpen ? "auto" : "none",
            transition: "opacity 0.3s ease",
          }}
        />
        {sidebar}
      </>
    );
  }

  return sidebar;
}
