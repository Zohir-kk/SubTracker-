// src/components/charts/TrendChart.jsx
// ─────────────────────────────────────────────────────────────
// Area chart showing spending over the last 6 months.
// Built with Recharts — reads trendData from subscriptions.js
//
// Features:
//   - Gold/teal gradient fill under the line
//   - Custom tooltip styled to match the dashboard theme
//   - Axis labels formatted as "10k" instead of "10000"
//   - Fully responsive via Recharts' ResponsiveContainer
//   - Colors adapt to dark/light mode via CSS variables
// ─────────────────────────────────────────────────────────────

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { trendData } from "../../data/subscriptions";

// ── HELPER ────────────────────────────────────────────────────

// Formats a number as short thousands — e.g. 10780 → "10.8k"
function formatK(value) {
  return value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value;
}

// Formats DZD with space separator — e.g. 10780 → "10 780 DZD"
function formatDZD(amount) {
  return new Intl.NumberFormat("fr-DZ").format(amount) + " DZD";
}

// ── CUSTOM TOOLTIP ────────────────────────────────────────────
// Recharts calls this component when you hover over a data point.
// We replace the default tooltip with one that matches our design.
// Props are injected automatically by Recharts.
function CustomTooltip({ active, payload, label }) {
  // "active" is true only when the user is hovering over the chart
  if (!active || !payload || !payload.length) return null;

  return (
    <div
      style={{
        background: "var(--bg-3)",
        border: "1px solid var(--border)",
        borderRadius: "8px",
        padding: "10px 14px",
        fontFamily: "'IBM Plex Mono', monospace",
      }}
    >
      {/* Month label at the top of the tooltip */}
      <div
        style={{
          fontSize: "9px",
          letterSpacing: "2px",
          textTransform: "uppercase",
          color: "var(--text-faint)",
          marginBottom: "4px",
        }}
      >
        {label}
      </div>
      {/* The actual amount in teal/gold accent color */}
      <div style={{ fontSize: "14px", fontWeight: 500, color: "var(--gold)" }}>
        {formatDZD(payload[0].value)}
      </div>
    </div>
  );
}

// ── TREND CHART (MAIN EXPORT) ─────────────────────────────────
export function TrendChart() {
  const { theme } = useTheme();

  // We need to know the theme to pick the right hardcoded colors
  // for the Recharts gradient — canvas/SVG can't read CSS variables
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Before mount, render nothing to avoid hydration mismatch
  if (!mounted) return <div style={{ height: "200px" }} />;

  const isDark = theme === "dark";

  // Chart colors — hardcoded because Recharts SVG can't use CSS vars
  const accentColor = isDark ? "#2dd4bf" : "#0d9488"; // teal
  const gridColor = isDark ? "rgba(45,212,191,0.06)" : "rgba(13,148,136,0.08)";
  const tickColor = isDark ? "rgba(224,253,248,0.35)" : "rgba(13,38,38,0.4)";
  const gradientTop = isDark
    ? "rgba(45,212,191,0.20)"
    : "rgba(13,148,136,0.15)";
  const gradientBottom = isDark ? "rgba(45,212,191,0)" : "rgba(13,148,136,0)";

  return (
    <div
      style={{
        background: "var(--bg-2)",
        border: "1px solid var(--border-2)",
        borderRadius: "14px",
        padding: "18px 18px 10px",
        marginBottom: "16px",
      }}
    >
      {/* ── Panel header ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "20px",
        }}
      >
        {/* Teal dot accent */}
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
          Tendance des dépenses
        </div>
        <div
          style={{
            marginLeft: "auto",
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: "9px",
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            color: "var(--text-faint)",
          }}
        >
          6 mois
        </div>
      </div>

      {/* ── Chart area ── */}
      {/* ResponsiveContainer makes the chart fill its parent width */}
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart
          data={trendData}
          margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
        >
          {/* Gradient fill definition — referenced by the Area component below */}
          <defs>
            <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
              {/* Top of gradient = semi-transparent accent color */}
              <stop offset="0%" stopColor={gradientTop} />
              {/* Bottom fades to fully transparent */}
              <stop offset="100%" stopColor={gradientBottom} />
            </linearGradient>
          </defs>

          {/* Horizontal grid lines */}
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={gridColor}
            vertical={false} // only horizontal lines, no verticals
          />

          {/* X axis — month labels (Oct, Nov, etc.) */}
          <XAxis
            dataKey="month"
            tick={{
              fill: tickColor,
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 9,
            }}
            axisLine={false} // hide the axis line itself
            tickLine={false} // hide the tick marks
          />

          {/* Y axis — amount labels formatted as "10k" */}
          <YAxis
            tickFormatter={formatK}
            tick={{
              fill: tickColor,
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 9,
            }}
            axisLine={false}
            tickLine={false}
          />

          {/* Custom tooltip on hover */}
          <Tooltip
            content={<CustomTooltip />}
            cursor={{
              stroke: accentColor,
              strokeWidth: 1,
              strokeDasharray: "4 4",
            }}
          />

          {/* The actual area — line + gradient fill */}
          <Area
            type="monotone" // smooth curve between points
            dataKey="amount" // reads the "amount" field from trendData
            stroke={accentColor} // line color
            strokeWidth={2}
            fill="url(#trendGradient)" // use the gradient defined above
            dot={{ fill: accentColor, strokeWidth: 0, r: 3 }} // data point dots
            activeDot={{ fill: accentColor, strokeWidth: 0, r: 5 }} // larger dot on hover
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
