import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useStore } from "../../store/useStore.jsx";
import { useWideLayout, useKPI, formatCurrency } from "../../hooks/useSubscriptions.js";
import { useLanguage } from "../../providers/LanguageProvider.jsx";
import { cn } from "../../lib/utils.js";
import {
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
  Settings,
  Plus,
  Sparkles,
} from "lucide-react";

/**
 * AppSidebar (The Command Center)
 * 
 * A unified sidebar navigation component that adapts between desktop and mobile.
 * - On Desktop: It functions as a floating, sticky left-hand panel that can be collapsed.
 * - On Mobile: It transforms into a full-height drawer overlay that slides in.
 * 
 * It contains core actions (Add Subscription, Ask AI, Settings) and a quick
 * Budget Health widget to give users a snapshot of their spending.
 */
export function AppSidebar({ isOpen, onClose, currentPage, onNavigate }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const { profile, monthlyBudget } = useStore();
  const { t, language } = useLanguage();
  const { total, activeCount, next } = useKPI();
  
  const isDesktop = useWideLayout(768);
  const isMobileOverlay = !isDesktop;

  useEffect(() => setMounted(true), []);

  const isDark = theme === "dark";

  function handleAdd() {
    if (currentPage !== "dashboard") {
      onNavigate("dashboard");
      // Give the dashboard a moment to mount before dispatching the modal event
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('open-add-subscription'));
      }, 100);
    } else {
      window.dispatchEvent(new CustomEvent('open-add-subscription'));
    }
    if (isMobileOverlay) onClose();
  }

  function handleSettings() {
    onNavigate("settings");
    if (isMobileOverlay) onClose();
  }
  
  function handleAskAI() {
    window.dispatchEvent(new CustomEvent('open-ask-ai'));
    if (isMobileOverlay) onClose();
  }

  const width = isCollapsed ? "68px" : "240px";

  const sidebar = (
    <aside
      className={cn(
        "flex flex-col border border-border-2 z-[200] font-plex shadow-card transition-all duration-300",
        isMobileOverlay
          ? "fixed top-0 start-0 h-screen bg-bg-2 rounded-none border-r rtl:border-l rtl:border-r-0"
          : "sticky top-4 h-[calc(100vh-32px)] bg-bg-2/60 backdrop-blur-2xl rounded-2xl ms-4 my-4",
      )}
      style={{
        width: isMobileOverlay ? "260px" : width,
        minWidth: isMobileOverlay ? "260px" : width,
        transform: isMobileOverlay
          ? isOpen ? "translateX(0)" : (language === 'ar' ? "translateX(100%)" : "translateX(-100%)")
          : "none",
      }}
    >
      {/* Header */}
      <div
        className={cn(
          "flex items-center justify-between min-h-[64px]",
          isCollapsed ? "px-2 py-[18px]" : "ps-5 pe-3 py-6",
        )}
      >
        <div 
          className="flex items-center gap-2.5 overflow-hidden shrink-0 cursor-pointer" 
          onClick={() => {
            onNavigate("dashboard");
            if (isMobileOverlay) onClose();
          }}
        >
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

        {!isMobileOverlay ? (
          <button
            onClick={() => setIsCollapsed((v) => !v)}
            className="bg-transparent border border-border-2 rounded-md p-1 cursor-pointer text-text-faint flex items-center justify-center shrink-0 hover:border-border hover:text-text transition-all duration-200"
          >
            {isCollapsed ? <ChevronRight size={14} className="rtl:rotate-180" /> : <ChevronLeft size={14} className="rtl:rotate-180" />}
          </button>
        ) : (
          <button
            onClick={onClose}
            className="bg-transparent border border-border-2 rounded-md p-1 cursor-pointer text-text-faint flex items-center justify-center shrink-0"
          >
            <ChevronRight size={14} className="rtl:rotate-180" />
          </button>
        )}
      </div>

      {/* Primary Actions */}
      <div className={cn("px-4 py-2 flex flex-col gap-3", isCollapsed && "items-center px-2")}>
        <button
          onClick={handleAdd}
          className={cn(
            "flex items-center justify-center gap-2 rounded-xl border border-gold bg-gold text-bg-2 cursor-pointer font-semibold transition-all hover:bg-gold-2 hover:border-gold-2",
            isCollapsed ? "w-10 h-10 p-0" : "w-full py-2.5 px-4"
          )}
          title={t('subs.add')}
        >
          <Plus size={18} className="shrink-0" />
          {!isCollapsed && <span className="font-plex text-[10px] tracking-[1.5px] uppercase whitespace-nowrap">{t('subs.add')}</span>}
        </button>

        <button
          onClick={handleAskAI}
          className={cn(
            "flex items-center justify-center gap-2 rounded-xl border border-border-2 bg-bg-3 text-text cursor-pointer transition-all hover:border-gold hover:text-gold",
            isCollapsed ? "w-10 h-10 p-0" : "w-full py-2.5 px-4"
          )}
          title={t('sidebar.ai.btn')}
        >
          <Sparkles size={16} className="shrink-0" />
          {!isCollapsed && <span className="font-plex text-[10px] tracking-[1.5px] uppercase whitespace-nowrap">{t('sidebar.ai.btn')}</span>}
        </button>
      </div>

      {/* Quick Stats Widget */}
      {!isCollapsed && (
        <div className="px-4 mb-4">
          <div className="bg-bg-3/50 rounded-xl p-4 border border-border-2 backdrop-blur-sm shadow-sm transition-all hover:border-border">
            <div className="mb-3">
              <div className="font-plex text-[8px] tracking-[1.5px] uppercase text-text-faint mb-3">
                {t('sidebar.budget.title')}
              </div>
              
              {monthlyBudget > 0 ? (
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <div className="font-sans text-xl leading-none font-bold text-text">
                      {Math.round((total / monthlyBudget) * 100)}%
                    </div>
                    <div className="font-plex text-[10px] text-text-muted mb-0.5">
                      / {formatCurrency(monthlyBudget, profile.currency)}
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="h-1.5 w-full bg-border-2 rounded-full overflow-hidden mb-2">
                    <div 
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        total > monthlyBudget ? "bg-red" : total > monthlyBudget * 0.8 ? "bg-gold" : "bg-teal"
                      )}
                      style={{ width: `${Math.min(100, (total / monthlyBudget) * 100)}%` }}
                    />
                  </div>
                  
                  <div className="font-plex text-[9px] text-text-faint">
                    {total > monthlyBudget 
                      ? `${t('sidebar.budget.over')} ${formatCurrency(total - monthlyBudget, profile.currency)}` 
                      : `${t('sidebar.budget.remaining')} ${formatCurrency(monthlyBudget - total, profile.currency)}`}
                  </div>
                </div>
              ) : (
                <div 
                  className="bg-bg border border-border-2 rounded-lg p-3 cursor-pointer hover:border-gold transition-colors group"
                  onClick={handleSettings}
                >
                  <div className="font-sans text-xs font-semibold text-text mb-1 group-hover:text-gold transition-colors">
                    {t('sidebar.budget.none')}
                  </div>
                  <div className="font-plex text-[9px] text-text-muted leading-relaxed">
                    {t('sidebar.budget.set_limit')}
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-4 pt-4 border-t border-border-2/50">
              <div className="flex justify-between items-center">
                <div className="font-plex text-[8px] tracking-[1.5px] uppercase text-text-faint">
                  {t('nav.abonnements')}
                </div>
                <div className="font-sans text-[11px] font-semibold text-text-muted bg-bg px-2 py-0.5 rounded-full border border-border-2">
                  {activeCount} {activeCount === 1 ? t('sidebar.subs.active_single') : t('sidebar.subs.active_plural')}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Settings & User */}
      <div className="mt-auto px-3 py-4 border-t border-border-2 flex flex-col gap-2">
        <button
          onClick={handleSettings}
          className={cn(
            "flex items-center gap-2.5 px-3 py-2 rounded-xl border border-transparent bg-transparent cursor-pointer transition-all duration-200 font-plex",
            currentPage === "settings" ? "bg-bg-3 border-border-2 text-gold" : "text-text-faint hover:bg-bg-3 hover:text-text",
            isCollapsed ? "justify-center" : "justify-start",
          )}
          title={t('nav.settings')}
        >
          <Settings size={18} className="shrink-0" />
          {!isCollapsed && (
            <span className="text-[10px] tracking-[1.5px] uppercase whitespace-nowrap">
              {t('nav.settings')}
            </span>
          )}
        </button>

        {mounted && (
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className={cn(
              "flex items-center gap-2.5 px-3 py-2 rounded-xl border border-transparent bg-transparent cursor-pointer text-text-faint w-full hover:bg-bg-3 transition-all duration-200 font-plex",
              isCollapsed ? "justify-center" : "justify-start",
            )}
            title={isDark ? t('theme.light') : t('theme.dark')}
          >
            {isDark ? (
              <Sun size={18} className="text-gold shrink-0" />
            ) : (
              <Moon size={18} className="text-gold shrink-0" />
            )}
            {!isCollapsed && (
              <span className="text-[10px] tracking-[1.5px] uppercase whitespace-nowrap">
                {isDark ? t('theme.light') : t('theme.dark')}
              </span>
            )}
          </button>
        )}

        {/* User badge */}
        <div
          className={cn(
            "flex items-center gap-2.5 px-3 py-2 rounded-xl mt-1 border border-transparent",
            isCollapsed ? "justify-center" : "justify-start",
          )}
        >
          <div
            className="w-8 h-8 rounded-full bg-gold flex items-center justify-center shrink-0 text-[11px] font-semibold overflow-hidden"
            style={{ color: "#020d0d" }}
          >
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              profile.initials
            )}
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <div className="text-[11px] text-text whitespace-nowrap overflow-hidden text-ellipsis font-medium">
                {profile.name}
              </div>
              <div className="text-[8px] text-text-faint tracking-[1px] uppercase font-plex">{profile.currency}</div>
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
          className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-[199] pointer-events-auto transition-all duration-300"
          style={{ opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? "auto" : "none" }}
        />
        {sidebar}
      </>
    );
  }

  return sidebar;
}
