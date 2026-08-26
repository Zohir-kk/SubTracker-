import { useStore } from "../../store/useStore.jsx";
import { formatCurrency, daysUntil, renewalMonth } from "../../hooks/useSubscriptions.js";
import { useLanguage } from "../../providers/LanguageProvider.jsx";
import { useExchangeRates } from "../../hooks/useExchangeRates.js";
import { Icon } from "../ui/Icon.jsx";

function UpcomingItem({ sub, days, categories, baseCurrency }) {
  const { t } = useLanguage();
  const { convertToBase } = useExchangeRates();
  const isSoon = days <= 7;
  const cat = categories.find((c) => c.key === sub.category);
  const color = cat?.color ?? "var(--teal)";
  const catLabel = cat?.label ?? sub.category;
  const month = renewalMonth(sub.renewalDay);
  
  const originalCurrency = sub.currency || baseCurrency;
  const convertedAmount = convertToBase(sub.amount, originalCurrency);

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-border-2">
      {/* Date block */}
      <div className="text-center min-w-[36px] shrink-0">
        <div
          className="font-sans text-[22px] font-bold leading-none"
          style={{ color: isSoon ? "var(--red)" : "var(--gold)" }}
        >
          {sub.renewalDay}
        </div>
        <div className="font-dm text-[8px] tracking-[1px] uppercase text-text-faint mt-0.5">
          {month}
        </div>
      </div>

      {/* Vertical divider */}
      <div className="w-px h-8 bg-border-2 shrink-0" />

      {/* Name + category */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          {isSoon && (
            <div className="w-[5px] h-[5px] rounded-full bg-red shrink-0 dot-soon" />
          )}
          <div className="font-dm text-[11px] text-text truncate">{sub.name}</div>
        </div>
        <div
          className="font-dm text-[8px] tracking-[1.5px] uppercase"
          style={{ color }}
        >
          {catLabel}
        </div>
      </div>

      {/* Amount */}
      <div className="text-right shrink-0">
        <span className="font-sans text-base font-semibold text-text">
          {formatCurrency(convertedAmount, baseCurrency)}
        </span>
      </div>
    </div>
  );
}

export function UpcomingRenewals() {
  const { t } = useLanguage();
  const { subscriptions, categories, profile } = useStore();

  const upcoming = subscriptions
    .filter((s) => s.status === "active" || s.status === "trial")
    .map((s) => ({ ...s, days: daysUntil(s) }))
    .sort((a, b) => a.days - b.days);

  return (
    <div className="bg-bg-2 border border-border-2 rounded-[14px] p-[18px] h-full box-border">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-1.5 h-1.5 rounded-full bg-gold shrink-0" />
        <div className="font-sans text-base font-semibold text-text">
          {t('upcoming.title')}
        </div>
        <div className="ms-auto font-dm text-[9px] tracking-[1.5px] uppercase text-text-faint">
          {t('upcoming.count', { count: upcoming.length })}
        </div>
      </div>

      <div>
        {upcoming.map((sub, index) => (
          <div key={sub.id} className={index === upcoming.length - 1 ? "[&>div]:border-b-0" : ""}>
            <UpcomingItem sub={sub} days={sub.days} categories={categories} baseCurrency={profile.currency || "DZD"} />
          </div>
        ))}
      </div>
    </div>
  );
}
