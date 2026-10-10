import React from 'react';
import { Zap, TrendingDown } from 'lucide-react';

export const TokenGauge = ({
  totalBudget = 50000,
  usedTokens = 14250,
  savingsPercent = 38.4,
  className = '',
}) => {
  const percentUsed = Math.min(100, Math.round((usedTokens / totalBudget) * 100));

  return (
    <div className={`p-4 bg-white border border-border rounded-lg shadow-level-1 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-ink-heading uppercase tracking-wider">
          <Zap className="w-3.5 h-3.5 text-brand" />
          <span>District Token & Budget Gauge</span>
        </div>
        <div className="flex items-center gap-1 text-xs font-medium text-status-success bg-status-success-bg px-2 py-0.5 rounded-pill border border-status-success-border">
          <TrendingDown className="w-3 h-3" />
          <span>{savingsPercent}% Smart-Route Savings</span>
        </div>
      </div>

      {/* Multi-segment progress track */}
      <div className="w-full h-2.5 bg-surface-canvas rounded-full overflow-hidden flex border border-border/80 my-2.5">
        <div
          style={{ width: `${percentUsed}%` }}
          className="bg-brand transition-all duration-500 rounded-l-full"
        />
        <div
          style={{ width: `${Math.min(100 - percentUsed, 15)}%` }}
          className="bg-amber-400 opacity-60"
        />
      </div>

      <div className="flex items-center justify-between text-xs text-ink-muted">
        <div className="tabular-nums">
          Used: <span className="font-semibold text-ink-heading">{usedTokens.toLocaleString()}</span> tokens ({percentUsed}%)
        </div>
        <div className="tabular-nums">
          Remaining: <span className="font-semibold text-status-success">{(totalBudget - usedTokens).toLocaleString()}</span> / {totalBudget.toLocaleString()}
        </div>
      </div>
    </div>
  );
};
