import { useEffect, useRef, useState } from "react";
import { formatCurrency, useWideLayout, computeSpendPerCategory } from "../../hooks/useSubscriptions.js";
import { useStore } from "../../store/useStore.jsx";
import { useLanguage } from "../../providers/LanguageProvider.jsx";
import { Icon } from "../ui/Icon.jsx";
import { useExchangeRates } from "../../hooks/useExchangeRates.js";

function BudgetBar({ category, used, limit, animate, onEditLimit, currency }) {
  const { t } = useLanguage();
  
  // Cap the progress bar at 100% visually, even if the user overspends,
  // to prevent the bar from breaking out of its container layout.
  const percent = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
  
  const isOverspend = limit > 0 && used > limit;
  // Provide an early warning visual cue when reaching 90% of the budget.
  const isNearLimit = limit > 0 && !isOverspend && percent >= 90;
  
  // Use semantic colors (red for danger, orange for warning) to instantly 
  // alert the user to their spending health, overriding the category color.
  const barColor = isOverspend ? "var(--red)" : isNearLimit ? "var(--orange)" : category.color;

  return (
    <div className="mb-[18px]">
      <div className="flex justify-between items-center mb-[7px]">
        <div className="flex items-center gap-2">
          <div
            className="w-[26px] h-[26px] rounded-md flex items-center justify-center text-xs shrink-0"
            style={{ background: `${category.color}18`, color: category.color }}
          >
            <Icon name={category.icon} size={14} />
          </div>
          <span className="font-plex text-[10px] text-text">{category.label}</span>
        </div>
        <div
          className={`flex items-center gap-1.5 font-plex text-[9px] ${isOverspend ? "text-red" : isNearLimit ? "text-orange" : "text-text-faint"}`}
        >
          {formatCurrency(used, currency)}{" "}
          <span className="text-text-faint">/ {formatCurrency(limit, currency)}</span>
          <button
            onClick={onEditLimit}
            title={t('budget.edit_title')}
            aria-label={t('budget.edit_title')}
            className="bg-transparent border-none cursor-pointer text-text-faint px-[3px] py-px rounded-[3px] text-[10px] leading-none opacity-60 hover:opacity-100"
          >
            ✎
          </button>
        </div>
      </div>
      <div className="h-1 bg-border-2 rounded-sm overflow-hidden">
        <div
          className="h-full rounded-sm transition-[width] duration-[900ms] ease-[cubic-bezier(0.23,1,0.32,1)]"
          style={{ width: animate ? `${percent}%` : "0%", background: barColor }}
        />
      </div>
      {isOverspend && (
        <div className="font-plex text-[8px] text-red mt-1">{t('budget.over')}</div>
      )}
      {isNearLimit && (
        <div className="font-plex text-[8px] text-orange mt-1">{t('budget.near', { percent: Math.round(percent) })}</div>
      )}
    </div>
  );
}

function StatCard({ label, value, sub, color }) {
  return (
    <div className="bg-bg-3 border border-border-2 rounded-[10px] p-3.5">
      <div className="font-plex text-[8px] tracking-[1.5px] uppercase text-text-faint mb-2">
        {label}
      </div>
      <div
        className="font-sans text-[22px] font-bold leading-none mb-0.5"
        style={{ color: color || "var(--text)" }}
      >
        {value}
      </div>
      {sub && (
        <div className="font-plex text-[8px] text-text-faint">{sub}</div>
      )}
    </div>
  );
}

export function BudgetPanel() {
  const { t } = useLanguage();
  const { subscriptions, budgetLimits, categories: CATEGORIES, profile, monthlyBudget, setBudget, setMonthlyBudget, setProfile } = useStore();
  const { convertToBase } = useExchangeRates();
  
  // The monthly budget limit might have been entered when the user had a different 
  // global currency selected. We convert it from its original currency into the 
  // currently active global currency so the dashboard math stays proportional.
  const convertedMonthlyBudget = monthlyBudget > 0 ? convertToBase(monthlyBudget, profile.budgetCurrency || 'dzd') : 0;
  
  // Compute how much is spent per category. We pass the convertToBase function 
  // so that subscriptions in foreign currencies (e.g. Netflix in USD) are 
  // accurately reflected in the budget limits.
  const spent = computeSpendPerCategory(subscriptions, convertToBase);
  const totalSpent = Object.values(spent).reduce((a, b) => a + b, 0);
  const totalBudget = Object.values(budgetLimits).reduce((a, b) => a + b, 0);
  const effectiveBudget = convertedMonthlyBudget > 0 ? convertedMonthlyBudget : totalBudget;
  const savedAmount = subscriptions
    .filter((s) => s.status === "paused")
    .reduce((sum, s) => sum + convertToBase(s.amount, s.currency), 0);
  const usageRate = effectiveBudget > 0 ? Math.round((totalSpent / effectiveBudget) * 100) : 0;

  // ── Global monthly budget editing ─────────────────────────────
  const [editingMonthly, setEditingMonthly] = useState(false);
  const [monthlyValue, setMonthlyValue] = useState("");
  const monthlyInputRef = useRef(null);

  function startEditMonthly() {
    setMonthlyValue(convertedMonthlyBudget > 0 ? String(Number(convertedMonthlyBudget.toFixed(2))) : "");
    setEditingMonthly(true);
    setTimeout(() => monthlyInputRef.current?.focus(), 0);
  }

  function commitMonthly() {
    const val = Number(monthlyValue);
    if (!isNaN(val) && val >= 0) {
      setMonthlyBudget(val);
      if (val > 0) {
        // We MUST save the active profile currency alongside the budget limit.
        // This acts as an anchor. If the user later switches their global currency, 
        // we use this anchor to accurately convert their budget to the new view.
        setProfile({ budgetCurrency: profile.currency || 'dzd' });
      }
    } else {
      setMonthlyBudget(0);
    }
    setEditingMonthly(false);
  }

  function handleMonthlyKeyDown(e) {
    if (e.key === "Enter") commitMonthly();
    if (e.key === "Escape") setEditingMonthly(false);
  }

  const [animate, setAnimate] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 150);
    return () => clearTimeout(timer);
  }, []);

  const [editingKey, setEditingKey] = useState(null);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef(null);

  function startEdit(key, currentLimit) {
    setEditingKey(key);
    setEditValue(currentLimit > 0 ? String(currentLimit) : "");
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function commitEdit() {
    if (editingKey) {
      const val = Number(editValue);
      setBudget(editingKey, isNaN(val) || val < 0 ? 0 : val);
    }
    setEditingKey(null);
  }

  function handleEditKeyDown(e) {
    if (e.key === "Enter") commitEdit();
    if (e.key === "Escape") setEditingKey(null);
  }

  const isWide = useWideLayout(768);

  return (
    <div className="bg-bg-2 border border-border-2 rounded-[14px] p-[18px] mb-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1.5 h-1.5 rounded-full bg-gold shrink-0" />
        <div className="font-sans text-base font-semibold text-text">{t('budget.title')}</div>
        <div
          className={`ms-auto font-plex text-[9px] tracking-[1px] ${usageRate >= 90 ? "text-red" : "text-text-faint"}`}
        >
          {t('budget.used_rate', { rate: usageRate })}
        </div>
      </div>

      {/* Global monthly budget editor */}
      <div className="flex items-center gap-2 mb-5 px-3 py-2.5 bg-bg-3 border border-border-2 rounded-xl">
        <div className="flex-1 min-w-0">
          <div className="font-plex text-[8px] tracking-[1.5px] uppercase text-text-faint mb-0.5">{t('budget.global')}</div>
          {editingMonthly ? (
            <div className="flex items-center gap-2">
              <input
                ref={monthlyInputRef}
                type="number"
                min="0"
                value={monthlyValue}
                onChange={(e) => setMonthlyValue(e.target.value)}
                onBlur={commitMonthly}
                onKeyDown={handleMonthlyKeyDown}
                placeholder="Ex: 5000"
                className="flex-1 bg-bg border border-gold rounded-md px-2 py-[5px] font-sans text-sm text-text outline-none"
              />
              <span className="font-plex text-[9px] text-text-faint">{profile.currency}</span>
              <button
                onClick={commitMonthly}
                className="bg-gold border-none rounded-[5px] px-2.5 py-1 font-plex text-[9px] font-semibold cursor-pointer shrink-0"
                style={{ color: "#020d0d" }}
              >
                {t('budget.ok')}
              </button>
            </div>
          ) : (
            <div className="font-sans text-lg font-bold text-text leading-none">
              {convertedMonthlyBudget > 0 ? (
                <>{formatCurrency(convertedMonthlyBudget, profile.currency)}</>
              ) : (
                <span className="font-plex text-[10px] text-text-faint">{t('budget.empty')}</span>
              )}
            </div>
          )}
        </div>
        <button
          onClick={startEditMonthly}
          title={t('budget.edit_title')}
          className="bg-transparent border border-border-2 rounded-lg p-1.5 cursor-pointer text-text-faint hover:border-border hover:text-text transition-all duration-200 shrink-0"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
      </div>

      <div
        className="grid gap-6"
        style={{ gridTemplateColumns: isWide ? "1fr 1fr" : "1fr" }}
      >
        <div>
          {CATEGORIES.map((cat) => (
            <div key={cat.key}>
              <BudgetBar
                category={cat}
                used={spent[cat.key] || 0}
                limit={budgetLimits[cat.key] || 0}
                animate={animate}
                currency={profile.currency}
                onEditLimit={() => startEdit(cat.key, budgetLimits[cat.key] || 0)}
              />
              {editingKey === cat.key && (
                <div className="flex items-center gap-2 -mt-2.5 mb-[18px] px-2.5 py-2 bg-bg-3 border border-border rounded-lg">
                  <span className="font-plex text-[9px] text-text-faint whitespace-nowrap">
                    {t('budget.cat_label', { cat: cat.label })}
                  </span>
                  <input
                    ref={inputRef}
                    type="number"
                    min="0"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={commitEdit}
                    onKeyDown={handleEditKeyDown}
                    placeholder="0"
                    className="flex-1 bg-bg border border-gold rounded-md px-2 py-[5px] font-plex text-[11px] text-text outline-none"
                  />
                  <span className="font-plex text-[9px] text-text-faint">{profile.currency}</span>
                  <button
                    onClick={commitEdit}
                    className="bg-gold border-none rounded-[5px] px-2.5 py-1 font-plex text-[9px] font-semibold cursor-pointer"
                    style={{ color: "#020d0d" }}
                  >
                    {t('budget.ok')}
                  </button>
                </div>
              )}
            </div>
          ))}
          {(() => {
            const knownKeys = CATEGORIES.map((c) => c.key);
            const otherAmount = Object.entries(spent).reduce((sum, [key, amt]) => knownKeys.includes(key) ? sum : sum + amt, 0);
            if (otherAmount > 0) {
              return (
                <BudgetBar
                  key="other"
                  category={{ key: "other", label: "Other", color: "var(--text-faint)" }}
                  used={otherAmount}
                  limit={0}
                  animate={animate}
                  currency={profile.currency}
                  onEditLimit={() => {}}
                />
              );
            }
            return null;
          })()}
        </div>

        <div className="grid grid-cols-2 gap-2.5 content-start">
          <StatCard label={t('budget.stat.spent')} value={formatCurrency(totalSpent, profile.currency)} sub={t('budget.stat.spent_sub')} color="var(--text)" />
          <StatCard label={t('budget.stat.total')} value={effectiveBudget > 0 ? formatCurrency(effectiveBudget, profile.currency) : "—"} sub={t('budget.stat.total_sub')} color="var(--text)" />
          <StatCard label={t('budget.stat.saved')} value={formatCurrency(savedAmount, profile.currency)} sub={t('budget.stat.saved_sub')} color="var(--green)" />
          <StatCard
            label={t('budget.stat.rate')}
            value={`${usageRate}%`}
            sub={usageRate >= 90 ? t('budget.stat.rate_near') : t('budget.stat.rate_ok')}
            color={usageRate >= 90 ? "var(--red)" : "var(--text)"}
          />
        </div>
      </div>
    </div>
  );
}
