// src/components/budget/BudgetPanel.jsx
import { useEffect, useRef, useState } from "react";
import { formatDZD, useWideLayout, computeSpendPerCategory } from "../../hooks/useSubscriptions.js";
import { useStore } from "../../store/useStore.jsx";

function BudgetBar({ category, used, limit, animate, onEditLimit }) {
  const percent = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
  const isOverspend = percent >= 90;
  const barColor = isOverspend ? "var(--red)" : category.color;

  return (
    <div style={{ marginBottom: "18px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "7px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: "26px",
              height: "26px",
              borderRadius: "6px",
              background: `${category.color}18`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
            }}
          >
            {category.icon}
          </div>
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: "10px",
              color: "var(--text)",
            }}
          >
            {category.label}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: "9px",
            color: isOverspend ? "var(--red)" : "var(--text-faint)",
          }}
        >
          {formatDZD(used)}{" "}
          <span style={{ color: "var(--text-faint)" }}>
            / {formatDZD(limit)}
          </span>
          <button
            onClick={onEditLimit}
            title="Modifier le budget"
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "var(--text-faint)",
              padding: "1px 3px",
              borderRadius: "3px",
              fontSize: "10px",
              lineHeight: 1,
              opacity: 0.6,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.6")}
          >
            ✎
          </button>
        </div>
      </div>
      <div
        style={{
          height: "4px",
          background: "var(--border-2)",
          borderRadius: "2px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: animate ? `${percent}%` : "0%",
            background: barColor,
            borderRadius: "2px",
            transition: "width 0.9s cubic-bezier(0.23,1,0.32,1)",
          }}
        />
      </div>
      {isOverspend && (
        <div
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: "8px",
            color: "var(--red)",
            marginTop: "4px",
          }}
        >
          ● Budget dépassé
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, sub, color }) {
  return (
    <div
      style={{
        background: "var(--bg-3)",
        border: "1px solid var(--border-2)",
        borderRadius: "10px",
        padding: "14px",
      }}
    >
      <div
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: "8px",
          letterSpacing: "1.5px",
          textTransform: "uppercase",
          color: "var(--text-faint)",
          marginBottom: "8px",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "22px",
          fontWeight: 700,
          color: color || "var(--text)",
          lineHeight: 1,
          marginBottom: "2px",
        }}
      >
        {value}
      </div>
      {sub && (
        <div
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: "8px",
            color: "var(--text-faint)",
          }}
        >
          {sub}
        </div>
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
  const usageRate =
    totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  const [animate, setAnimate] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 150);
    return () => clearTimeout(timer);
  }, []);

  // ── Inline budget editing ──
  const [editingKey, setEditingKey] = useState(null);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef(null);

  function startEdit(key, currentLimit) {
    setEditingKey(key);
    setEditValue(currentLimit > 0 ? String(currentLimit) : "");
    // focus the input on next render
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
    <div
      style={{
        background: "var(--bg-2)",
        border: "1px solid var(--border-2)",
        borderRadius: "14px",
        padding: "18px",
        marginBottom: "16px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: "var(--gold)",
            flexShrink: 0,
          }}
        />
        <div
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "16px",
            fontWeight: 600,
            color: "var(--text)",
          }}
        >
          Budget mensuel
        </div>
        <div
          style={{
            marginLeft: "auto",
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: "9px",
            color: usageRate >= 90 ? "var(--red)" : "var(--text-faint)",
            letterSpacing: "1px",
          }}
        >
          {usageRate}% utilisé
        </div>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isWide ? "1fr 1fr" : "1fr",
          gap: "24px",
        }}
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
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginTop: "-10px",
                    marginBottom: "18px",
                    padding: "8px 10px",
                    background: "var(--bg-3)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                  }}
                >
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: "var(--text-faint)", whiteSpace: "nowrap" }}>
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
                    style={{
                      flex: 1,
                      background: "var(--bg)",
                      border: "1px solid var(--gold)",
                      borderRadius: "6px",
                      padding: "5px 8px",
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: "11px",
                      color: "var(--text)",
                      outline: "none",
                    }}
                  />
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", color: "var(--text-faint)" }}>DZD</span>
                  <button
                    onClick={commitEdit}
                    style={{
                      background: "var(--gold)",
                      border: "none",
                      borderRadius: "5px",
                      padding: "4px 10px",
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: "9px",
                      fontWeight: 600,
                      color: "#020d0d",
                      cursor: "pointer",
                    }}
                  >
                    OK
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isWide ? "1fr 1fr" : "1fr 1fr",
            gap: "10px",
            alignContent: "start",
          }}
        >
          <StatCard
            label="Total dépensé"
            value={formatDZD(totalSpent)}
            sub="DZD ce mois"
            color="var(--text)"
          />
          <StatCard
            label="Budget total"
            value={formatDZD(totalBudget)}
            sub="DZD alloué"
            color="var(--text)"
          />
          <StatCard
            label="Économies"
            value={formatDZD(savedAmount)}
            sub="DZD en pause"
            color="var(--green)"
          />
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
