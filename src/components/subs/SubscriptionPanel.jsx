import { useState, useEffect } from "react";
import { useStore } from "../../store/useStore.jsx";
import { formatCurrency, daysUntil } from "../../hooks/useSubscriptions.js";
import { SubscriptionOverlay } from "../subscription/SubscriptionOverlay.jsx";
import { cn } from "../../lib/utils.js";
import { useLanguage } from "../../providers/LanguageProvider.jsx";
import { useExchangeRates } from "../../hooks/useExchangeRates.js";
import { Icon } from "../ui/Icon.jsx";

function getCatInfo(categories, key) {
  const cat = categories.find((c) => c.key === key);
  return { color: cat?.color ?? "var(--teal)", label: cat?.label ?? key };
}

function StatusBadge({ status }) {
  const { t } = useLanguage();
  const cls = {
    active: "bg-[rgba(74,222,128,0.10)] text-green border border-[rgba(74,222,128,0.20)]",
    paused: "bg-[rgba(248,113,113,0.10)] text-red border border-[rgba(248,113,113,0.20)]",
    trial:  "bg-[rgba(45,212,191,0.10)] text-teal border border-[rgba(45,212,191,0.20)]",
  };
  const labels = { active: t('subs.status.active'), paused: t('subs.status.paused'), trial: t('subs.status.trial') };

  return (
    <div className={cn("font-plex text-[8px] tracking-[1px] uppercase px-2 py-[3px] rounded", cls[status])}>
      {labels[status]}
    </div>
  );
}

function RenewalBar({ renewalDay, color }) {
  const today = new Date();
  const currentDay = today.getDate();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

  let progress;
  if (currentDay <= renewalDay) {
    progress = ((currentDay + (daysInMonth - renewalDay)) / daysInMonth) * 100;
  } else {
    progress = ((currentDay - renewalDay) / daysInMonth) * 100;
  }
  progress = Math.min(100, Math.max(5, progress));

  return (
    <div className="h-[3px] bg-border-2 rounded-sm mt-2.5 overflow-hidden">
      <div
        className="h-full rounded-sm transition-[width] duration-[800ms] ease-[cubic-bezier(0.23,1,0.32,1)]"
        style={{ width: `${progress}%`, background: color }}
      />
    </div>
  );
}

function SubscriptionCard({ sub, onClick, categories, baseCurrency }) {
  const { t } = useLanguage();
  const { convertToBase } = useExchangeRates();
  const { color, label: catLabel } = getCatInfo(categories, sub.category);
  const days = daysUntil(sub);
  const isSoon = days <= 7;
  
  const originalCurrency = sub.currency || baseCurrency;
  const convertedAmount = convertToBase(sub.amount, originalCurrency);

  const renewalText =
    days === 0
      ? t('subs.renewal.today')
      : days === 1
        ? t('subs.renewal.tomorrow')
        : t('subs.renewal.days', { day: sub.renewalDay, days: days });

  return (
    <div
      className="bg-bg-3 border border-border-2 rounded-[10px] p-3.5 cursor-pointer hover:border-border hover:-translate-y-px transition-[border-color,transform] duration-200"
      style={{ opacity: sub.status === "paused" ? 0.7 : 1 }}
      onClick={onClick}
    >
      {/* Top row */}
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-11 h-11 rounded-[12px] flex items-center justify-center shadow-sm"
          style={{
            background: `linear-gradient(135deg, ${color}20, ${color}05)`,
            color: color,
            border: `1px solid ${color}10`,
          }}
        >
          <Icon name={sub.icon} size={22} />
        </div>
        <StatusBadge status={sub.status} />
      </div>

      {/* Name + category */}
      <div className="font-plex text-[11px] text-text mb-0.5">{sub.name}</div>
      <div
        className="font-plex text-[8px] tracking-[1.5px] uppercase mb-2.5"
        style={{ color }}
      >
        {catLabel}
      </div>

      {/* Amount */}
      <div className="flex items-baseline gap-[5px]">
        <span className="font-sans text-[22px] font-bold text-text">
          {formatCurrency(convertedAmount, baseCurrency)}
        </span>
      </div>

      {/* Renewal date */}
      <div className="flex items-center gap-1.5 mt-1.5 font-plex text-[9px] text-text-faint">
        {isSoon && (
          <div className="w-[5px] h-[5px] rounded-full bg-red shrink-0 dot-soon" />
        )}
        <span>{renewalText}</span>
      </div>

      <RenewalBar renewalDay={sub.renewalDay} color={color} />
    </div>
  );
}

function CategoryTabs({ activeTab, onChange, categories }) {
  const { t } = useLanguage();
  const tabs = [
    { value: "all", label: t('subs.tabs.all') },
    ...categories.map((c) => ({ value: c.key, label: c.label })),
  ];

  return (
    <div className="flex gap-1.5 flex-wrap mb-3.5">
      {tabs.map((tab) => {
        const isActive = tab.value === activeTab;
        return (
          <button
            key={tab.value}
            onClick={() => onChange(tab.value)}
            className={cn(
              "font-plex text-[9px] tracking-[1px] uppercase px-3 py-[5px] rounded-md cursor-pointer transition-all duration-200 border",
              isActive
                ? "border-gold text-gold bg-gold-dim"
                : "border-border-2 text-text-faint bg-transparent hover:border-gold hover:text-gold",
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

export function SubscriptionPanel() {
  const { t } = useLanguage();
  const { subscriptions, categories, profile } = useStore();
  const [activeTab, setActiveTab] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSub, setModalSub] = useState(null);

  function openAdd() { setModalSub(null); setModalOpen(true); }
  function openEdit(sub) { setModalSub(sub); setModalOpen(true); }

  useEffect(() => {
    const handleOpenAdd = () => openAdd();
    window.addEventListener('open-add-subscription', handleOpenAdd);
    return () => window.removeEventListener('open-add-subscription', handleOpenAdd);
  }, []);

  const filtered =
    activeTab === "all"
      ? subscriptions
      : subscriptions.filter((s) => s.category === activeTab);

  return (
    <div className="bg-bg-2 border border-border-2 rounded-[14px] p-[18px] mb-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1.5 h-1.5 rounded-full bg-gold shrink-0" />
        <div className="font-sans text-base font-semibold text-text">{t('subs.title')}</div>
        <div className="ms-auto flex items-center gap-3">
          <div className="font-plex text-[9px] tracking-[1.5px] uppercase text-text-faint">
            {filtered.length} / {subscriptions.length}
          </div>
          <button
            onClick={openAdd}
            className="font-plex text-[9px] tracking-[1px] uppercase px-3 py-[5px] rounded-md cursor-pointer bg-gold border border-gold font-semibold"
            style={{ color: "#020d0d" }}
          >
            {t('subs.add')}
          </button>
        </div>
      </div>

      <CategoryTabs activeTab={activeTab} onChange={setActiveTab} categories={categories} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {filtered.map((sub) => (
          <SubscriptionCard
            key={sub.id}
            sub={sub}
            onClick={() => openEdit(sub)}
            categories={categories}
            baseCurrency={profile.currency || "DZD"}
          />
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-10 flex flex-col items-center gap-3">
          <div className="font-plex text-[10px] tracking-[1.5px] uppercase text-text-faint">
            {activeTab === "all"
              ? t('subs.empty.all')
              : t('subs.empty.cat')}
          </div>
          {activeTab === "all" && (
            <button
              onClick={openAdd}
              className="font-plex text-[9px] tracking-[1px] uppercase px-4 py-[7px] rounded-lg cursor-pointer bg-gold border border-gold font-semibold"
              style={{ color: "#020d0d" }}
            >
              {t('subs.add_btn')}
            </button>
          )}
        </div>
      )}

      <SubscriptionOverlay
        isOpen={modalOpen}
        sub={modalSub}
        defaultCategory={activeTab === "all" ? null : activeTab}
        onClose={() => { setModalOpen(false); setModalSub(null); }}
      />
    </div>
  );
}
