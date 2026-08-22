import { Sun, Moon, Menu, Bell, Globe } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import { useStore } from "../../store/useStore.jsx";
import { ProfileModal } from "../settings/ProfileModal.jsx";
import { useWideLayout, daysUntil, formatCurrency } from "../../hooks/useSubscriptions.js";
import { useLanguage } from "../../providers/LanguageProvider.jsx";
import { Icon } from "../ui/Icon.jsx";

function Logo() {
  const { t } = useLanguage();

  return (
    <div className="flex items-center gap-3">
      <svg width="28" height="28" viewBox="0 0 28 28" className="shrink-0">
        <polygon points="14,1 27,14 14,27 1,14" fill="var(--gold)" />
        <text x="14" y="19" textAnchor="middle" fontFamily="Georgia, serif" fontSize="11" fontWeight="700" fill="#080c14">
          S
        </text>
      </svg>
      <div>
        <div className="font-playfair text-xl font-bold text-text tracking-[1px] leading-none">
          {t('app.title')}
        </div>
        <div className="font-plex text-[8px] text-text-faint tracking-[2px] uppercase mt-[3px]">
          {t('app.subtitle')}
        </div>
      </div>
    </div>
  );
}

function MonthBadge() {
  const { language } = useLanguage();
  const now = new Date();
  const locale = language === 'ar' ? 'ar-DZ' : language === 'fr' ? 'fr-DZ' : 'en-US';
  const label = now.toLocaleDateString(locale, { month: "long", year: "numeric" });
  const formatted = label.charAt(0).toUpperCase() + label.slice(1);

  return (
    <div className="font-plex text-[10px] tracking-[1.5px] uppercase border border-border text-gold px-3 py-[5px] rounded-[20px] whitespace-nowrap">
      {formatted}
    </div>
  );
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="w-20" />;

  const isDark = theme === "dark";

  return (
    <div
      className="flex items-center gap-2 cursor-pointer"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      role="switch"
      aria-checked={isDark}
      aria-label="Activer le mode clair/sombre"
    >
      <Sun
        size={14}
        className="text-gold transition-opacity duration-200"
        style={{ opacity: isDark ? 0.3 : 1 }}
      />
      <div className="w-[42px] h-6 rounded-xl border border-border bg-gold-dim relative">
        <div
          className={`w-[18px] h-[18px] rounded-full absolute top-[2px] start-[2px] transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${isDark ? "translate-x-[18px] rtl:-translate-x-[18px]" : "translate-x-0"}`}
          style={{
            backgroundColor: isDark ? "#2dd4bf" : "#0d9488",
          }}
        />
      </div>
      <Moon
        size={14}
        className="text-gold transition-opacity duration-200"
        style={{ opacity: isDark ? 1 : 0.3 }}
      />
    </div>
  );
}

function UserAvatar({ profile, onClick }) {
  return (
    <div
      onClick={onClick}
      title="Modifier le profil"
      className="w-8 h-8 rounded-full flex items-center justify-center font-plex text-xs font-semibold overflow-hidden border border-gold cursor-pointer"
      style={{ background: "var(--gold)", color: "#020d0d" }}
    >
      {profile?.avatarUrl ? (
        <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
      ) : (
        profile?.initials || "U"
      )}
    </div>
  );
}

function NotificationBell() {
  const { subscriptions, categories, profile } = useStore();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const urgent = subscriptions
    .filter((s) => s.status === "active" || s.status === "trial")
    .map((s) => ({ ...s, days: daysUntil(s) }))
    .filter((s) => s.days <= 3)
    .sort((a, b) => a.days - b.days);

  useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`relative border border-border-2 rounded-lg p-1.5 cursor-pointer flex items-center justify-center transition-all duration-200 ${
          open ? "bg-bg-3" : "bg-transparent"
        } ${urgent.length > 0 ? "text-red" : "text-text-faint"}`}
        title="Notifications de renouvellement"
      >
        <Bell size={16} />
        {urgent.length > 0 && (
          <div className="absolute -top-[5px] -end-[5px] w-4 h-4 rounded-full bg-red font-plex text-[9px] font-semibold flex items-center justify-center border-2 border-bg"
            style={{ color: "#fff" }}>
            {urgent.length}
          </div>
        )}
      </button>

      {open && (
        <div className="absolute top-[calc(100%+8px)] end-0 w-[280px] bg-bg-2 border border-border rounded-xl shadow-card z-[500] overflow-hidden">
          <div className="px-3.5 py-3 border-b border-border-2 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-red shrink-0" />
            <span className="font-sans text-sm font-semibold text-text">
              {t('notifications.title')}
            </span>
          </div>

          {urgent.length === 0 ? (
            <div className="px-3.5 py-4 font-plex text-[10px] text-text-faint text-center">
              {t('notifications.empty')}
            </div>
          ) : (
            <div>
              {urgent.map((s) => {
                const cat = categories.find((c) => c.key === s.category);
                return (
                  <div key={s.id} className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-border-2">
                    <div
                      className="w-[30px] h-[30px] rounded-[7px] flex items-center justify-center shrink-0"
                      style={{ background: `${cat?.color ?? "var(--teal)"}18`, color: cat?.color ?? "var(--teal)" }}
                    >
                      <Icon name={s.icon} size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-plex text-[10px] text-text truncate">{s.name}</div>
                      <div
                        className="font-plex text-[8px] tracking-[1px] mt-0.5"
                        style={{ color: s.days === 0 ? "var(--red)" : "var(--text-faint)" }}
                      >
                        {s.days === 0 ? t('time.today') : s.days === 1 ? t('time.tomorrow') : t('time.inDays', { days: s.days })}
                      </div>
                    </div>
                    <div className="font-plex text-[10px] text-red font-semibold shrink-0">
                      {formatCurrency(s.amount, profile.currency)}
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

function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const languages = [
    { code: 'fr', label: 'Français' },
    { code: 'en', label: 'English' },
    { code: 'ar', label: 'العربية' },
  ];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`relative border border-border-2 rounded-lg p-1.5 cursor-pointer flex items-center justify-center transition-all duration-200 ${
          open ? "bg-bg-3" : "bg-transparent"
        } text-text-faint`}
        title="Changer de langue"
      >
        <Globe size={16} />
      </button>

      {open && (
        <div className="absolute top-[calc(100%+8px)] end-0 w-[140px] bg-bg-2 border border-border rounded-xl shadow-card z-[500] overflow-hidden py-1">
          {languages.map((lng) => (
            <button
              key={lng.code}
              onClick={() => {
                setLanguage(lng.code);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm font-sans flex items-center gap-2 hover:bg-bg-3 transition-colors ${
                language === lng.code ? 'text-gold font-medium' : 'text-text'
              }`}
            >
              {lng.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function AppHeader({ onMenuClick }) {
  const { profile } = useStore();
  const [profileOpen, setProfileOpen] = useState(false);
  const isDesktop = useWideLayout(768);

  return (
    <>
      <header className="sticky top-0 z-[100] h-[68px] flex items-center justify-between px-4 bg-bg border-b border-border-2 backdrop-blur-md gap-3">
        {!isDesktop && (
          <button
            onClick={onMenuClick}
            className="bg-transparent border border-border-2 rounded-lg p-1.5 cursor-pointer text-text-faint flex items-center justify-center shrink-0"
          >
            <Menu size={18} />
          </button>
        )}

        <Logo />

        <div className="flex items-center gap-3 ms-auto">
          {isDesktop && <MonthBadge />}
          <LanguageSwitcher />
          <NotificationBell />
          <ThemeToggle />
          <UserAvatar initials={profile.initials} onClick={() => setProfileOpen(true)} />
        </div>
      </header>

      <ProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
    </>
  );
}
