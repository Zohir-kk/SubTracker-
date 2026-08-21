import { useState, useEffect } from "react";
import { useStore } from "../../store/useStore.jsx";
import { formatDZD, daysUntil } from "../../hooks/useSubscriptions.js";
import { SubscriptionModal } from "../subscription/SubscriptionModal.jsx";
import { cn } from "../../lib/utils.js";

function getCatInfo(categories, key) {
  const cat = categories.find((c) => c.key === key);
  return { color: cat?.color ?? "var(--teal)", label: cat?.label ?? key };
}

function StatusBadge({ status }) {
  const cls = {
    active: "bg-[rgba(74,222,128,0.10)] text-green border border-[rgba(74,222,128,0.20)]",
    paused: "bg-[rgba(248,113,113,0.10)] text-red border border-[rgba(248,113,113,0.20)]",
    trial:  "bg-[rgba(45,212,191,0.10)] text-teal border border-[rgba(45,212,191,0.20)]",
  };
  const labels = { active: "Actif", paused: "Pausé", trial: "Essai" };

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

function SubscriptionCard({ sub, onClick, categories }) {
  const { color, label: catLabel } = getCatInfo(categories, sub.category);
  const days = daysUntil(sub.renewalDay);
  const isSoon = days <= 7;

  const renewalText =
    days === 0
      ? "Renouvellement aujourd'hui"
      : days === 1
        ? "Renouvellement demain"
        : `Le ${sub.renewalDay} du mois — dans ${days}j`;

  return (
    <div
      className="bg-bg-3 border border-border-2 rounded-[10px] p-3.5 cursor-pointer hover:border-border hover:-translate-y-px transition-[border-color,transform] duration-200"
      style={{ opacity: sub.status === "paused" ? 0.7 : 1 }}
      onClick={onClick}
    >
      {/* Top row */}
      <div className="flex justify-between items-start mb-2.5">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center text-base"
          style={{ background: `${color}18` }}
        >
          {sub.icon}
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
          {formatDZD(sub.amount)}
        </span>
        <span className="font-plex text-[9px] text-text-faint">DZD/mois</span>
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
  const tabs = [
    { value: "all", label: "Tous" },
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
  const { subscriptions, categories } = useStore();
  const [activeTab, setActiveTab] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSub, setModalSub] = useState(null);

  function openAdd() { setModalSub(null); setModalOpen(true); }
  function openEdit(sub) { setModalSub(sub); setModalOpen(true); }

  const filtered =
    activeTab === "all"
      ? subscriptions
      : subscriptions.filter((s) => s.category === activeTab);

  return (
    <div className="bg-bg-2 border border-border-2 rounded-[14px] p-[18px] mb-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1.5 h-1.5 rounded-full bg-gold shrink-0" />
        <div className="font-sans text-base font-semibold text-text">Mes Abonnements</div>
        <div className="ml-auto flex items-center gap-3">
          <div className="font-plex text-[9px] tracking-[1.5px] uppercase text-text-faint">
            {filtered.length} / {subscriptions.length}
          </div>
          <button
            onClick={openAdd}
            className="font-plex text-[9px] tracking-[1px] uppercase px-3 py-[5px] rounded-md cursor-pointer bg-gold border border-gold font-semibold"
            style={{ color: "#020d0d" }}
          >
            + Ajouter
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
          />
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-10 flex flex-col items-center gap-3">
          <div className="font-plex text-[10px] tracking-[1.5px] uppercase text-text-faint">
            {activeTab === "all"
              ? "Aucun abonnement pour l'instant"
              : "Aucun abonnement dans cette catégorie"}
          </div>
          {activeTab === "all" && (
            <button
              onClick={openAdd}
              className="font-plex text-[9px] tracking-[1px] uppercase px-4 py-[7px] rounded-lg cursor-pointer bg-gold border border-gold font-semibold"
              style={{ color: "#020d0d" }}
            >
              + Ajouter un abonnement
            </button>
          )}
        </div>
      )}

      <SubscriptionModal
        isOpen={modalOpen}
        sub={modalSub}
        onClose={() => { setModalOpen(false); setModalSub(null); }}
      />
    </div>
  );
}
