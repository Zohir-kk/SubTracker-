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

function formatK(value) {
  return value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value;
}

function formatDZD(amount) {
  return new Intl.NumberFormat("fr-DZ").format(amount) + " DZD";
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-bg-3 border border-border rounded-lg px-3.5 py-2.5 font-plex">
      <div className="text-[9px] tracking-[2px] uppercase text-text-faint mb-1">
        {label}
      </div>
      <div className="text-sm font-sans font-medium text-gold">
        {formatDZD(payload[0].value)}
      </div>
    </div>
  );
}

export function TrendChart() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-[200px]" />;

  const isDark = theme === "dark";
  const accentColor = isDark ? "#2dd4bf" : "#0d9488";
  const gridColor = isDark ? "rgba(45,212,191,0.06)" : "rgba(13,148,136,0.08)";
  const tickColor = isDark ? "rgba(224,253,248,0.35)" : "rgba(13,38,38,0.4)";
  const gradientTop = isDark ? "rgba(45,212,191,0.20)" : "rgba(13,148,136,0.15)";
  const gradientBottom = isDark ? "rgba(45,212,191,0)" : "rgba(13,148,136,0)";

  return (
    <div className="bg-bg-2 border border-border-2 rounded-[14px] px-[18px] pt-[18px] pb-2.5 mb-4">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-1.5 h-1.5 rounded-full bg-gold shrink-0" />
        <div className="font-sans text-base font-semibold text-text">
          Tendance des dépenses
        </div>
        <div className="ml-auto font-plex text-[9px] tracking-[1.5px] uppercase text-text-faint">
          6 mois
        </div>
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={trendData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={gradientTop} />
              <stop offset="100%" stopColor={gradientBottom} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fill: tickColor, fontFamily: "'IBM Plex Mono', monospace", fontSize: 9 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={formatK}
            tick={{ fill: tickColor, fontFamily: "'IBM Plex Mono', monospace", fontSize: 9 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: accentColor, strokeWidth: 1, strokeDasharray: "4 4" }}
          />
          <Area
            type="monotone"
            dataKey="amount"
            stroke={accentColor}
            strokeWidth={2}
            fill="url(#trendGradient)"
            dot={{ fill: accentColor, strokeWidth: 0, r: 3 }}
            activeDot={{ fill: accentColor, strokeWidth: 0, r: 5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
