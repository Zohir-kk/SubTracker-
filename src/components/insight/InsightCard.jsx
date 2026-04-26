import { useStore } from "../../store/useStore.jsx";
import { formatDZD } from "../../hooks/useSubscriptions.js";

function computeInsight(subscriptions) {
  const vodSubs = subscriptions.filter(
    (s) => s.category === "vod" && (s.status === "active" || s.status === "trial"),
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
    before: "Tous tes abonnements semblent optimisés. Pense à vérifier tes offres ",
    amount: null,
    after: "annuelles pour réduire tes coûts jusqu'à 20%.",
    cta: "Voir les offres →",
  };
}

export function InsightCard() {
  const { subscriptions } = useStore();
  const insight = computeInsight(subscriptions);

  return (
    <div className="bg-bg-3 border border-border rounded-[10px] p-3.5 flex gap-2.5 items-start">
      <div className="text-base shrink-0 mt-px">💡</div>
      <div className="flex-1 min-w-0">
        <div className="font-plex text-[10px] font-medium text-text mb-[5px]">
          {insight.title}
        </div>
        <div className="font-plex text-[9px] text-text-muted leading-[1.7] break-words">
          {insight.before}
          {insight.amount && (
            <span className="text-gold font-medium">{formatDZD(insight.amount)}</span>
          )}
          {insight.after}
        </div>
        <div className="font-plex text-[9px] text-gold mt-2 cursor-pointer">
          {insight.cta}
        </div>
      </div>
    </div>
  );
}
