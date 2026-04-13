// src/components/charts/CategoryBreakdown.jsx
import { useEffect, useState } from "react";
import { subscriptions, CATEGORIES } from "../../data/subscriptions.js";
import { formatDZD, computeBreakdown } from "../../hooks/useSubscriptions.js";

function BreakdownRow({ item, animate }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        marginBottom: "16px",
      }}
    >
      <div
        style={{
          width: "32px",
          height: "32px",
          borderRadius: "7px",
          background: `${item.color}18`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "14px",
          flexShrink: 0,
        }}
      >
        {item.icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: "6px",
          }}
        >
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: "10px",
              color: "var(--text)",
            }}
          >
            {item.label}
          </span>
          <span
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "14px",
              fontWeight: 600,
              color: item.color,
            }}
          >
            {formatDZD(item.amount)}
          </span>
        </div>
        <div
          style={{
            height: "3px",
            background: "var(--border-2)",
            borderRadius: "2px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: animate ? `${item.percent}%` : "0%",
              background: item.color,
              borderRadius: "2px",
              transition: "width 0.9s cubic-bezier(0.23,1,0.32,1)",
            }}
          />
        </div>
      </div>
      <div
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: "9px",
          color: "var(--text-faint)",
          minWidth: "30px",
          textAlign: "right",
          flexShrink: 0,
        }}
      >
        {item.percent}%
      </div>
    </div>
  );
}

export function CategoryBreakdown() {
  const breakdown = computeBreakdown(subscriptions, CATEGORIES);
  const [animate, setAnimate] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 150);
    return () => clearTimeout(timer);
  }, []);
  const total = breakdown.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div
      style={{
        background: "var(--bg-2)",
        border: "1px solid var(--border-2)",
        borderRadius: "14px",
        padding: "18px",
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
          Par catégorie
        </div>
        <div
          style={{
            marginLeft: "auto",
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: "9px",
            color: "var(--text-faint)",
            letterSpacing: "1px",
          }}
        >
          {formatDZD(total)} DZD
        </div>
      </div>
      {breakdown.map((item) => (
        <BreakdownRow key={item.key} item={item} animate={animate} />
      ))}
    </div>
  );
}
