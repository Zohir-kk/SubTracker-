import {
  useKPI,
  useMediaGrid,
  useWideLayout,
  formatCurrency,
} from "../../hooks/useSubscriptions.js";
import { useStore } from "../../store/useStore.jsx";
import { useLanguage } from "../../providers/LanguageProvider.jsx";

function KPICard({ label, value, sub, accent, delta, deltaUp, compact }) {
  return (
    <div className="bg-bg-2 border border-border-2 rounded-xl px-5 pt-[18px] pb-3.5 relative overflow-hidden cursor-default hover:border-border hover:-translate-y-0.5 transition-[border-color,transform] duration-200">
      {/* Corner accent blob */}
      <div
        className="absolute top-0 end-0 w-20 h-20 rounded-none rounded-se-[12px] rounded-es-[80px] pointer-events-none opacity-[0.08]"
        style={{ background: accent }}
      />
      <div className="font-plex text-[9px] tracking-[2px] uppercase text-text-faint mb-2.5">
        {label}
      </div>
      <div
        className={`font-sans font-bold text-text leading-none mb-1 ${compact ? "text-[22px]" : "text-3xl"}`}
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
  const { subscriptions, profile } = useStore();
  const { total, activeCount, savings, next } = useKPI();
  const cols = useMediaGrid(4);
  const isWide = useWideLayout(768);
  const { t } = useLanguage();

  const cards = [
    {
      label: t('kpi.total.label'),
      value: formatCurrency(total, profile.currency),
      sub: t('kpi.total.sub'),
      accent: "var(--gold)",
      delta: t('kpi.total.delta'),
      deltaUp: true,
    },
    {
      label: t('kpi.active.label'),
      value: activeCount,
      sub: t('kpi.active.sub', { total: subscriptions.length }),
      accent: "var(--teal)",
      delta: t('kpi.active.delta'),
      deltaUp: false,
    },
    {
      label: t('kpi.savings.label'),
      value: savings > 0 ? formatCurrency(savings, profile.currency) : "—",
      sub: savings > 0 ? t('kpi.savings.sub_has') : t('kpi.savings.sub_none'),
      accent: "var(--green)",
      delta: savings > 0 ? t('kpi.savings.delta') : null,
      deltaUp: false,
    },
    {
      label: t('kpi.next.label'),
      value: next
        ? next.days === 0
          ? t('time.today')
          : next.days === 1
            ? t('time.tomorrow')
            : t('time.inDays', { days: next.days })
        : "—",
      sub: next ? `${next.name} — ${formatCurrency(next.amount, profile.currency)}` : null,
      accent: "var(--red)",
      delta: next && next.days <= 3 ? t('kpi.next.delta') : null,
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
