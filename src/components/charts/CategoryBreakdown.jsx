import { useEffect, useState } from "react";
import { useStore } from "../../store/useStore.jsx";
import { formatDZD, computeBreakdown } from "../../hooks/useSubscriptions.js";

function BreakdownRow({ item, animate }) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <div
        className="w-8 h-8 rounded-[7px] flex items-center justify-center text-sm shrink-0"
        style={{ background: `${item.color}18` }}
      >
        {item.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline mb-1.5">
          <span className="font-plex text-[10px] text-text">{item.label}</span>
          <span
            className="font-playfair text-sm font-semibold"
            style={{ color: item.color }}
          >
            {formatDZD(item.amount)}
          </span>
        </div>
        <div className="h-[3px] bg-border-2 rounded-sm overflow-hidden">
          <div
            className="h-full rounded-sm transition-[width] duration-[900ms] ease-[cubic-bezier(0.23,1,0.32,1)]"
            style={{
              width: animate ? `${item.percent}%` : "0%",
              background: item.color,
            }}
          />
        </div>
      </div>
      <div className="font-plex text-[9px] text-text-faint min-w-[30px] text-right shrink-0">
        {item.percent}%
      </div>
    </div>
  );
}

export function CategoryBreakdown() {
  const { subscriptions, categories: CATEGORIES } = useStore();
  const breakdown = computeBreakdown(subscriptions, CATEGORIES);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 150);
    return () => clearTimeout(timer);
  }, []);

  const total = breakdown.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="bg-bg-2 border border-border-2 rounded-[14px] p-[18px]">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-1.5 h-1.5 rounded-full bg-gold shrink-0" />
        <div className="font-playfair text-base font-semibold text-text">Par catégorie</div>
        <div className="ml-auto font-plex text-[9px] text-text-faint tracking-[1px]">
          {formatDZD(total)} DZD
        </div>
      </div>
      {breakdown.map((item) => (
        <BreakdownRow key={item.key} item={item} animate={animate} />
      ))}
    </div>
  );
}
