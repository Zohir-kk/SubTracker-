/**
 * Formats the user's subscription data into a plain-text block
 * that gets injected into the AI system prompt on every request.
 */
export function buildContext(subscriptions, budgetLimits, categories) {
  const active = subscriptions.filter((s) => s.status !== 'paused');
  const paused = subscriptions.filter((s) => s.status === 'paused');

  const totalSpent = active.reduce((sum, s) => sum + s.amount, 0);
  const totalBudget = Object.values(budgetLimits).reduce((sum, v) => sum + v, 0);

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  function nextRenewal(day) {
    let d = new Date(today.getFullYear(), today.getMonth(), day);
    if (d < today) {
      d = new Date(today.getFullYear(), today.getMonth() + 1, day);
    }
    return d.toISOString().split('T')[0];
  }

  function catLabel(key) {
    return categories.find((c) => c.key === key)?.label ?? key;
  }

  const lines = ['USER SUBSCRIPTIONS (active):'];

  for (const s of active) {
    const tag = s.status === 'trial' ? ' [trial]' : '';
    lines.push(
      `- ${s.name}: ${s.amount.toLocaleString('fr-DZ')} DZD/month, ` +
      `category: ${catLabel(s.category)}${tag}, renews ${nextRenewal(s.renewalDay)}`
    );
  }

  if (paused.length > 0) {
    lines.push('');
    lines.push('PAUSED SUBSCRIPTIONS:');
    for (const s of paused) {
      lines.push(
        `- ${s.name}: ${s.amount.toLocaleString('fr-DZ')} DZD/month, ` +
        `category: ${catLabel(s.category)} [paused]`
      );
    }
  }

  lines.push('');
  lines.push(`MONTHLY TOTAL (active + trial): ${totalSpent.toLocaleString('fr-DZ')} DZD`);
  lines.push(`TOTAL MONTHLY BUDGET: ${totalBudget.toLocaleString('fr-DZ')} DZD`);
  lines.push(`BUDGET REMAINING: ${(totalBudget - totalSpent).toLocaleString('fr-DZ')} DZD`);

  lines.push('');
  lines.push('BUDGET BY CATEGORY:');
  for (const cat of categories) {
    const spent = active
      .filter((s) => s.category === cat.key)
      .reduce((sum, s) => sum + s.amount, 0);
    const limit = budgetLimits[cat.key] ?? 0;
    if (spent > 0 || limit > 0) {
      const pct = limit > 0 ? Math.round((spent / limit) * 100) : 0;
      lines.push(`- ${cat.label}: ${spent.toLocaleString('fr-DZ')} / ${limit.toLocaleString('fr-DZ')} DZD (${pct}% used)`);
    }
  }

  return lines.join('\n');
}
