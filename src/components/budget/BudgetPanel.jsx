import { useEffect, useRef, useState } from "react";
import { formatDZD, useWideLayout, computeSpendPerCategory } from "../../hooks/useSubscriptions.js";
import { useStore } from "../../store/useStore.jsx";

function BudgetBar({ category, used, limit, animate, onEditLimit }) {
  const percent = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
  const isOverspend = percent >= 90;
  const barColor = isOverspend ? "var(--red)" : category.color;

  return (
    <div className="mb-[18px]">
      <div className="flex justify-between items-center mb-[7px]">
        <div className="flex items-center gap-2">
          <div
            className="w-[26px] h-[26px] rounded-md flex items-center justify-center text-xs shrink-0"
            style={{ background: `${category.color}18` }}
          >
            {category.icon}
          </div>
          <span className="font-plex text-[10px] text-text">{category.label}</span>
        </div>
        <div
          className={`flex items-center gap-1.5 font-plex text-[9px] ${isOverspend ? "text-red" : "text-text-faint"}`}
        >
          {formatDZD(used)}{" "}
          <span className="text-text-faint">/ {formatDZD(limit)}</span>
          <button
            onClick={onEditLimit}
            title="Modifier le budget"
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
        <div className="font-plex text-[8px] text-red mt-1">● Budget dépassé</div>
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
        className="font-playfair text-[22px] font-bold leading-none mb-0.5"
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
  const { subscriptions, budgetLimits, categories: CATEGORIES, setBudget } = useStore();
  const spent = computeSpendPerCategory(subscriptions);
  const totalSpent = Object.values(spent).reduce((a, b) => a + b, 0);
  const totalBudget = Object.values(budgetLimits).reduce((a, b) => a + b, 0);
  const savedAmount = subscriptions
    .filter((s) => s.status === "paused")
    .reduce((sum, s) => sum + s.amount, 0);
  const usageRate = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

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
      <div className="flex items-center gap-2 mb-5">
        <div className="w-1.5 h-1.5 rounded-full bg-gold shrink-0" />
        <div className="font-playfair text-base font-semibold text-text">Budget mensuel</div>
        <div
          className={`ml-auto font-plex text-[9px] tracking-[1px] ${usageRate >= 90 ? "text-red" : "text-text-faint"}`}
        >
          {usageRate}% utilisé
        </div>
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
                onEditLimit={() => startEdit(cat.key, budgetLimits[cat.key] || 0)}
              />
              {editingKey === cat.key && (
                <div className="flex items-center gap-2 -mt-2.5 mb-[18px] px-2.5 py-2 bg-bg-3 border border-border rounded-lg">
                  <span className="font-plex text-[9px] text-text-faint whitespace-nowrap">
                    Budget {cat.label} :
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
                  <span className="font-plex text-[9px] text-text-faint">DZD</span>
                  <button
                    onClick={commitEdit}
                    className="bg-gold border-none rounded-[5px] px-2.5 py-1 font-plex text-[9px] font-semibold cursor-pointer"
                    style={{ color: "#020d0d" }}
                  >
                    OK
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2.5 content-start">
          <StatCard label="Total dépensé" value={formatDZD(totalSpent)} sub="DZD ce mois" color="var(--text)" />
          <StatCard label="Budget total" value={formatDZD(totalBudget)} sub="DZD alloué" color="var(--text)" />
          <StatCard label="Économies" value={formatDZD(savedAmount)} sub="DZD en pause" color="var(--green)" />
          <StatCard
            label="Taux utilisation"
            value={`${usageRate}%`}
            sub={usageRate >= 90 ? "⚠ Limite proche" : "dans le budget"}
            color={usageRate >= 90 ? "var(--red)" : "var(--text)"}
          />
        </div>
      </div>
    </div>
  );
}
