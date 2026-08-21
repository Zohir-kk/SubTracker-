import { Sun, Moon, Menu, Bell } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import { useStore } from "../../store/useStore.jsx";
import { ProfileModal } from "../settings/ProfileModal.jsx";
import { useWideLayout, daysUntil, formatDZD } from "../../hooks/useSubscriptions.js";

function Logo() {
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
          SubDz
        </div>
        <div className="font-plex text-[8px] text-text-faint tracking-[2px] uppercase mt-[3px]">
          Gestionnaire d'abonnements
        </div>
      </div>
    </div>
  );
}

function MonthBadge() {
  const now = new Date();
  const label = now.toLocaleDateString("fr-DZ", { month: "long", year: "numeric" });
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
          className="w-[18px] h-[18px] rounded-full absolute top-[2px] left-[2px] transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
          style={{
            backgroundColor: isDark ? "#2dd4bf" : "#0d9488",
            transform: isDark ? "translateX(18px)" : "translateX(0px)",
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

function UserAvatar({ initials = "AK", onClick }) {
  return (
    <div
      onClick={onClick}
      title="Modifier le profil"
      className="w-[34px] h-[34px] min-w-[34px] rounded-full bg-gold flex items-center justify-center font-plex text-[11px] font-medium cursor-pointer select-none"
      style={{ color: "#080c14" }}
    >
      {initials}
    </div>
  );
}

function NotificationBell() {
  const { subscriptions, categories } = useStore();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const urgent = subscriptions
    .filter((s) => s.status === "active" || s.status === "trial")
    .map((s) => ({ ...s, days: daysUntil(s.renewalDay) }))
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
          <div className="absolute -top-[5px] -right-[5px] w-4 h-4 rounded-full bg-red font-plex text-[9px] font-semibold flex items-center justify-center border-2 border-bg"
            style={{ color: "#fff" }}>
            {urgent.length}
          </div>
        )}
      </button>

      {open && (
        <div className="absolute top-[calc(100%+8px)] right-0 w-[280px] bg-bg-2 border border-border rounded-xl shadow-card z-[500] overflow-hidden">
          <div className="px-3.5 py-3 border-b border-border-2 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-red shrink-0" />
            <span className="font-sans text-sm font-semibold text-text">
              Renouvellements proches
            </span>
          </div>

          {urgent.length === 0 ? (
            <div className="px-3.5 py-4 font-plex text-[10px] text-text-faint text-center">
              Aucun renouvellement dans 3 jours
            </div>
          ) : (
            <div>
              {urgent.map((s) => {
                const cat = categories.find((c) => c.key === s.category);
                return (
                  <div key={s.id} className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-border-2">
                    <div
                      className="w-[30px] h-[30px] rounded-[7px] flex items-center justify-center text-sm shrink-0"
                      style={{ background: `${cat?.color ?? "var(--teal)"}18` }}
                    >
                      {s.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-plex text-[10px] text-text truncate">{s.name}</div>
                      <div
                        className="font-plex text-[8px] tracking-[1px] mt-0.5"
                        style={{ color: s.days === 0 ? "var(--red)" : "var(--text-faint)" }}
                      >
                        {s.days === 0 ? "Aujourd'hui" : s.days === 1 ? "Demain" : `Dans ${s.days} jours`}
                      </div>
                    </div>
                    <div className="font-plex text-[10px] text-red font-semibold shrink-0">
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

        <div className="flex items-center gap-3 ml-auto">
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
