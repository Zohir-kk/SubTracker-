import {
  useKPI,
  useMediaGrid,
  useWideLayout,
  formatDZD,
} from "../../hooks/useSubscriptions.js";
import { useStore } from "../../store/useStore.jsx";

function KPICard({ label, value, sub, accent, delta, deltaUp, compact }) {
  return (
    <div className="bg-bg-2 border border-border-2 rounded-xl px-5 pt-[18px] pb-3.5 relative overflow-hidden cursor-default hover:border-border hover:-translate-y-0.5 transition-[border-color,transform] duration-200">
      {/* Corner accent blob */}
      <div
        className="absolute top-0 right-0 w-20 h-20 rounded-[0_12px_0_80px] pointer-events-none opacity-[0.08]"
        style={{ background: accent }}
      />
      <div className="font-plex text-[9px] tracking-[2px] uppercase text-text-faint mb-2.5">
        {label}
      </div>
      <div
        className={`font-playfair font-bold text-text leading-none mb-1 ${compact ? "text-[22px]" : "text-3xl"}`}
      >
        {value}
      </div>
      {sub && (
        <div className="font-plex text-[9px] text-text-faint mb-2">{sub}</div>
      )}
      {delta && (
        <div
          className={`font-plex text-[10px] mt-1.5 ${deltaUp ? "text-red" : "text-green"}`}
        >
          {delta}
        </div>
      )}
    </div>
  );
}

export function KPIRow() {
  const { subscriptions } = useStore();
  const { total, activeCount, savings, next } = useKPI();
  const cols = useMediaGrid(4);
  const isWide = useWideLayout(768);

  const cards = [
    {
      label: "Total mensuel",
      value: formatDZD(total),
      sub: "DZD / mois",
      accent: "var(--gold)",
      delta: "▲ abonnements actifs + essai",
      deltaUp: true,
    },
    {
      label: "Abonnements actifs",
      value: activeCount,
      sub: `sur ${subscriptions.length} au total`,
      accent: "var(--teal)",
      delta: "— stable ce mois",
      deltaUp: false,
    },
    {
      label: "Économies possibles",
      value: savings > 0 ? formatDZD(savings) : "—",
      sub: savings > 0 ? "DZD en abonnements pausés" : "aucun abonnement pausé",
      accent: "var(--green)",
      delta: savings > 0 ? "▼ abonnements en pause" : null,
      deltaUp: false,
    },
    {
      label: "Prochain renouvellement",
      value: next
        ? next.days === 0
          ? "Aujourd'hui"
          : next.days === 1
            ? "Demain"
            : `Dans ${next.days}j`
        : "—",
      sub: next ? `${next.name} — ${formatDZD(next.amount)} DZD` : null,
      accent: "var(--red)",
      delta: next && next.days <= 3 ? "● Renouvellement imminent" : null,
      deltaUp: true,
    },
  ];

  return (
    <div
      className="grid gap-[14px] pb-4 mb-5"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {cards.map((card) => (
        <KPICard key={card.label} {...card} compact={!isWide} />
      ))}
    </div>
  );
}
