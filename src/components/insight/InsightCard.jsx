// src/components/insight/InsightCard.jsx
import { useStore } from "../../store/useStore.jsx";
import { formatDZD } from "../../hooks/useSubscriptions.js";


function computeInsight(subscriptions) {
  const vodSubs = subscriptions.filter(
    (s) =>
      s.category === "vod" && (s.status === "active" || s.status === "trial"),
  );
  if (vodSubs.length >= 2) {
    const sorted = [...vodSubs].sort((a, b) => a.amount - b.amount);
    const cheaper = sorted[0];
    const pricier = sorted[1];
    return {
      title: "Abonnements VOD en doublon détectés",
      before: `${cheaper.name} et ${pricier.name} se chevauchent à ~60%. Tu pourrais économiser `,
      amount: cheaper.amount,
      after: " DZD/mois en ne gardant qu'un seul service.",
      cta: `Gérer ${cheaper.name} →`,
    };
  }
  const pausedSubs = subscriptions.filter((s) => s.status === "paused");
  if (pausedSubs.length > 0) {
    const sub = pausedSubs[0];
    return {
      title: "Abonnement en pause détecté",
      before: `${sub.name} est en pause. Si tu ne l'utilises plus, tu économises `,
      amount: sub.amount,
      after: " DZD/mois en le supprimant définitivement.",
      cta: `Gérer ${sub.name} →`,
    };
  }
  return {
    title: "Conseil du mois",
    before:
      "Tous tes abonnements semblent optimisés. Pense à vérifier tes offres ",
    amount: null,
    after: "annuelles pour réduire tes coûts jusqu'à 20%.",
    cta: "Voir les offres →",
  };
}

export function InsightCard() {
  const { subscriptions } = useStore();
  const insight = computeInsight(subscriptions);
  return (
    <div
      style={{
        background: "var(--bg-3)",
        border: "1px solid var(--border)",
        borderRadius: "10px",
        padding: "14px",
        display: "flex",
        gap: "10px",
        alignItems: "flex-start",
      }}
    >
      <div style={{ fontSize: "16px", flexShrink: 0, marginTop: "1px" }}>
        💡
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: "10px",
            fontWeight: 500,
            color: "var(--text)",
            marginBottom: "5px",
          }}
        >
          {insight.title}
        </div>
        <div
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: "9px",
            color: "var(--text-muted)",
            lineHeight: 1.7,
            overflowWrap: "break-word",
          }}
        >
          {insight.before}
          {insight.amount && (
            <span style={{ color: "var(--gold)", fontWeight: 500 }}>
              {formatDZD(insight.amount)}
            </span>
          )}
          {insight.after}
        </div>
        {/* BUG FIXED: var(--text2) doesn't exist in tokens — changed to var(--text-muted) */}
        <div
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: "9px",
            color: "var(--gold)",
            marginTop: "8px",
            cursor: "pointer",
          }}
        >
          {insight.cta}
        </div>
      </div>
    </div>
  );
}
