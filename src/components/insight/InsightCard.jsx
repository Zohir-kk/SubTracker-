import { useState, useEffect } from "react";
import { useStore } from "../../store/useStore.jsx";
import { formatCurrency } from "../../hooks/useSubscriptions.js";
import { useLanguage } from "../../providers/LanguageProvider.jsx";
import { Skeleton } from "../ui/Skeleton.jsx";
import { buildContext } from "../../lib/buildContext.js";

const CACHE_KEY = "subtracker_ai_insights";
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

export function InsightCard() {
  const { t, language } = useLanguage();
  const { subscriptions, budgetLimits, categories, profile } = useStore();
  
  const [insights, setInsights] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInsights() {
      if (!subscriptions || subscriptions.length === 0) {
        setLoading(false);
        return;
      }
      
      const cachedStr = localStorage.getItem(CACHE_KEY);
      if (cachedStr) {
        try {
          const cached = JSON.parse(cachedStr);
          if (Date.now() - cached.timestamp < CACHE_TTL && cached.lang === language) {
            setInsights(cached.data);
            setLoading(false);
            return;
          }
        } catch (e) {}
      }

      setLoading(true);
      const context = buildContext(subscriptions, budgetLimits, categories);

      try {
        const res = await fetch("/api/insight", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ context, lang: language }),
        });
        
        if (res.ok) {
          const data = await res.json();
          if (data && data.insights && data.insights.length > 0) {
            setInsights(data.insights);
            localStorage.setItem(CACHE_KEY, JSON.stringify({
              timestamp: Date.now(),
              lang: language,
              data: data.insights
            }));
          }
        }
      } catch (err) {
        console.error("Failed to fetch insights", err);
      } finally {
        setLoading(false);
      }
    }

    fetchInsights();
  }, [subscriptions, budgetLimits, categories, language]);

  // Rotate insights every 10 seconds
  useEffect(() => {
    if (insights.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % insights.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [insights]);

  if (loading) {
    return (
      <div className="bg-bg-3 border border-border rounded-[10px] p-3.5 flex gap-2.5 items-start">
        <Skeleton className="w-5 h-5 rounded-full shrink-0" />
        <div className="flex-1">
          <Skeleton className="w-2/3 h-3 mb-2 rounded" />
          <Skeleton className="w-full h-3 mb-1.5 rounded" />
          <Skeleton className="w-4/5 h-3 rounded" />
        </div>
      </div>
    );
  }

  // Fallback if AI fails or no subscriptions
  const insight = insights.length > 0 ? insights[currentIndex] : {
    title: t('insight.tip.title') || "Tip",
    before: t('insight.tip.before') || "Add subscriptions to get personalized advice.",
    amount: null,
    after: t('insight.tip.after') || "",
    cta: t('insight.tip.cta') || ""
  };

  return (
    <div className="bg-bg-3 border border-border rounded-[10px] p-3.5 flex gap-2.5 items-start transition-all duration-300">
      <div className="text-base shrink-0 mt-px">💡</div>
      <div className="flex-1 min-w-0 animate-in fade-in zoom-in-95 duration-500" key={currentIndex}>
        <div className="font-plex text-[10px] font-medium text-text mb-[5px]">
          {insight.title}
        </div>
        <div className="font-plex text-[9px] text-text-muted leading-[1.7] break-words">
          {insight.before}
          {insight.amount != null && profile?.currency && (
            <span className="text-gold font-medium px-1">{formatCurrency(insight.amount, profile.currency)}</span>
          )}
          {insight.after}
        </div>
        {insight.cta && (
          <div className="font-plex text-[9px] text-gold mt-2 cursor-pointer hover:underline">
            {insight.cta}
          </div>
        )}
      </div>
    </div>
  );
}
