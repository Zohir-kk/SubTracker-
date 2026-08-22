import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useStore } from "../../store/useStore.jsx";
import { useWideLayout } from "../../hooks/useSubscriptions.js";
import { useLanguage } from "../../providers/LanguageProvider.jsx";
import { cn } from "../../lib/utils.js";
import {
  LayoutDashboard,
  CreditCard,
  BarChart3,
  TrendingUp,
  ChevronLeft,
  Moon,
  Sun,
  Settings,
} from "lucide-react";

const NAV_ITEMS = [
  { icon: LayoutDashboard, labelKey: "nav.dashboard", id: "dashboard" },
  { icon: CreditCard, labelKey: "nav.abonnements", id: "abonnements" },
  { icon: TrendingUp, labelKey: "nav.tendances", id: "tendances" },
  { icon: BarChart3, labelKey: "nav.budget", id: "budget" },
  { icon: Settings, labelKey: "nav.settings", id: "settings" },
];

function NavItem({ item, isActive, isCollapsed, onClick }) {
  const { t } = useLanguage();
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center gap-2.5 rounded-[10px] cursor-pointer mb-1 border transition-all duration-200",
        isCollapsed ? "p-2.5 justify-center" : "px-3 py-2.5 justify-start",
        isActive
          ? "bg-bg-3 border-border-2 text-gold"
          : "border-transparent text-text-faint hover:bg-bg-3 hover:text-text",
      )}
    >
      <item.icon size={18} className="shrink-0" />
      {!isCollapsed && (
        <span className="font-plex text-[10px] tracking-[2px] uppercase whitespace-nowrap">
          {t(item.labelKey)}
        </span>
      )}
    </div>
  );
}

const PAGE_ITEMS = new Set(["settings"]);

export function AppSidebar({ isOpen, onClose, currentPage, onNavigate }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const { profile } = useStore();
  const { t, language } = useLanguage();
  const isDesktop = useWideLayout(768);
  const isMobileOverlay = !isDesktop;

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (currentPage === "settings") setActiveSection("settings");
    else if (currentPage === "dashboard") setActiveSection("dashboard");
  }, [currentPage]);

  const isDark = theme === "dark";

  function scrollToSection(id) {
    if (PAGE_ITEMS.has(id)) {
      onNavigate(id);
      setActiveSection(id);
      if (isMobileOverlay) onClose();
      return;
    }
    if (currentPage !== "dashboard") onNavigate("dashboard");
    setActiveSection(id);
    if (isMobileOverlay) onClose();
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  const width = isCollapsed ? "68px" : "220px";

  const sidebar = (
    <aside
      className={cn(
        "h-screen flex flex-col bg-bg-2 border-r border-border-2 overflow-hidden z-[200] font-plex",
        isMobileOverlay ? "fixed top-0 start-0" : "sticky top-0",
      )}
      style={{
        width: isMobileOverlay ? "240px" : width,
        minWidth: isMobileOverlay ? "240px" : width,
        transition: isMobileOverlay
          ? "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
          : "width 0.3s cubic-bezier(0.4, 0, 0.2, 1), min-width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        transform: isMobileOverlay
          ? isOpen ? "translateX(0)" : (language === 'ar' ? "translateX(100%)" : "translateX(-100%)")
          : "none",
      }}
    >
      {/* Header */}
      <div
        className={cn(
          "flex items-center justify-between border-b border-border-2 mb-2 min-h-[64px]",
          isCollapsed ? "px-2 py-[18px]" : "ps-4 pe-3 py-5",
        )}
      >
        <div className="flex items-center gap-2.5 overflow-hidden shrink-0">
          <svg width="24" height="24" viewBox="0 0 24 24" className="shrink-0">
            <polygon points="12,1 23,12 12,23 1,12" fill="var(--gold)" />
            <text x="12" y="17" textAnchor="middle" fontFamily="Georgia" fontSize="10" fontWeight="700" fill="#020d0d">
              S
            </text>
          </svg>
          {!isCollapsed && (
            <span className="font-playfair text-lg font-bold text-text tracking-[1px] whitespace-nowrap">
              SubDz
            </span>
          )}
        </div>

        {!isMobileOverlay && (
          <button
            onClick={() => setIsCollapsed((v) => !v)}
            className="bg-transparent border border-border-2 rounded-md p-1 cursor-pointer text-text-faint flex items-center justify-center shrink-0 hover:border-border hover:text-text transition-all duration-200"
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

        {isMobileOverlay && (
          <button
            onClick={onClose}
            className="bg-transparent border border-border-2 rounded-md p-1 cursor-pointer text-text-faint flex items-center justify-center shrink-0"
          >
            <ChevronLeft size={14} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2.5 overflow-y-auto">
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

      {/* Footer */}
      <div className="px-2.5 py-3 border-t border-border-2 flex flex-col gap-2">
        {mounted && (
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className={cn(
              "flex items-center gap-2.5 px-2.5 py-2 rounded-lg border border-transparent bg-transparent cursor-pointer text-text-faint w-full hover:bg-bg-3 transition-all duration-200 font-plex",
              isCollapsed ? "justify-center" : "justify-start",
            )}
          >
            {isDark ? (
              <Sun size={16} className="text-gold shrink-0" />
            ) : (
              <Moon size={16} className="text-gold shrink-0" />
            )}
            {!isCollapsed && (
              <span className="text-[9px] tracking-[1.5px] uppercase whitespace-nowrap">
                {isDark ? t('theme.light') : t('theme.dark')}
              </span>
            )}
          </button>
        )}

        {/* User badge */}
        <div
          className={cn(
            "flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-bg-3 border border-border-2",
            isCollapsed ? "justify-center" : "justify-start",
          )}
        >
          <div
            className="w-7 h-7 rounded-full bg-gold flex items-center justify-center shrink-0 text-[10px] font-medium"
            style={{ color: "#020d0d" }}
          >
            {profile.initials}
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <div className="text-[10px] text-text whitespace-nowrap overflow-hidden text-ellipsis">
                {profile.name}
              </div>
              <div className="text-[8px] text-text-faint tracking-[1px] uppercase">{t('role.admin')}</div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );

  if (isMobileOverlay) {
    return (
      <>
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/50 z-[199] pointer-events-auto transition-opacity duration-300"
          style={{ opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? "auto" : "none" }}
        />
        {sidebar}
      </>
    );
  }

  return sidebar;
}
