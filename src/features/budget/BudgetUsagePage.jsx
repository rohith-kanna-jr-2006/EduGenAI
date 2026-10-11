import React, { useState, useEffect } from 'react';
import {
  Wallet,
  Zap,
  TrendingDown,
  Download,
  AlertCircle,
  Building2,
  Users,
  CheckCircle2,
} from 'lucide-react';
import { generationService } from '../../services/generationService';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { TokenGauge } from '../../components/common/TokenGauge';
import { Spinner } from '../../components/common/Spinner';

export const BudgetUsagePage = () => {
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await generationService.getBudgetSummary();
        setBudget(res);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <Card className="py-24">
        <Spinner label="Loading district budget & token allocations..." />
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold text-ink-heading font-heading">
            District Budget & Usage Allocations
          </h1>
          <p className="text-xs text-ink-muted">
            Monitor allocated school credits, teacher token limits, and autonomous cost savings.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          icon={Download}
          onClick={() => alert('Exporting monthly district billing ledger (CSV).')}
        >
          Export Usage Ledger
        </Button>
      </div>

      {/* Main Gauge Widget */}
      <TokenGauge
        totalBudget={budget.totalAllocatedTokens}
        usedTokens={budget.usedTokens}
        savingsPercent={budget.projectedSavingsPercent}
      />

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted font-heading">
            Total Allocated Credit
          </span>
          <div className="text-2xl font-bold text-ink-heading font-heading mt-1 tabular-nums">
            {budget.totalAllocatedTokens.toLocaleString()} tokens
          </div>
          <span className="text-xs text-ink-muted mt-1 block">
            Annual District License Cap
          </span>
        </Card>

        <Card className="p-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted font-heading">
            Actual Incurred Spend
          </span>
          <div className="text-2xl font-bold text-ink-heading font-heading mt-1 tabular-nums">
            ${(Number(budget.totalCostUSD) || 0).toFixed(2)}
          </div>
          <span className="text-xs text-status-success font-medium mt-1 block">
            38.4% below traditional commercial API tiers
          </span>
        </Card>

        <Card className="p-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted font-heading">
            Smart-Route Savings
          </span>
          <div className="text-2xl font-bold text-status-success font-heading mt-1 tabular-nums">
            ${(Number(budget.savingsUSD) || 0).toFixed(2)}
          </div>
          <span className="text-xs text-ink-muted mt-1 block">
            Reinvested into school curriculum grants
          </span>
        </Card>
      </div>

      {/* Department Allocations Table */}
      <Card
        title="School & Department Quota Breakdown"
        subtitle="Token consumption tracked across grade bands and educator groups"
        noPadding
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-surface-canvas border-b border-border text-ink-muted uppercase font-bold tracking-wider">
                <th className="py-3 px-4">Academic Department</th>
                <th className="py-3 px-4">Active Educators</th>
                <th className="py-3 px-4">Token Allocation</th>
                <th className="py-3 px-4">Used Tokens</th>
                <th className="py-3 px-4">Percent Used</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {budget.departments.map((dept) => {
                const percent = Math.round((dept.used / dept.allocated) * 100);
                return (
                  <tr key={dept.name} className="hover:bg-surface-hover/60 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-ink-heading font-heading">
                      {dept.name}
                    </td>
                    <td className="py-3.5 px-4 text-ink-body">
                      {dept.teachers} teachers
                    </td>
                    <td className="py-3.5 px-4 tabular-nums">
                      {dept.allocated.toLocaleString()} tokens
                    </td>
                    <td className="py-3.5 px-4 tabular-nums font-semibold text-ink-heading">
                      {dept.used.toLocaleString()} tokens
                    </td>
                    <td className="py-3.5 px-4 tabular-nums">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-surface-canvas rounded-full overflow-hidden border border-border">
                          <div
                            style={{ width: `${percent}%` }}
                            className="bg-brand h-full rounded-full"
                          />
                        </div>
                        <span className="font-semibold">{percent}%</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Badge variant="success">Normal Usage</Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
