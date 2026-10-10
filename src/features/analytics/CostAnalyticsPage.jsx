import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingDown,
  Calendar,
  Filter,
  DollarSign,
  Download,
  Layers,
  Palette,
  FileText,
  BookOpen,
} from 'lucide-react';
import { generationService } from '../../services/generationService';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Select } from '../../components/common/Select';
import { Badge } from '../../components/common/Badge';
import { Spinner } from '../../components/common/Spinner';

export const CostAnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('6m');

  useEffect(() => {
    async function load() {
      try {
        const res = await generationService.getAnalyticsData();
        setData(res);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [dateRange]);

  if (loading) {
    return (
      <Card className="py-24">
        <Spinner label="Loading historical cost analytics..." />
      </Card>
    );
  }

  const maxMonthlySpend = Math.max(...data.monthlyTrends.map((m) => m.spend));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold text-ink-heading font-heading">
            Inference Cost & Usage Analytics
          </h1>
          <p className="text-xs text-ink-muted">
            Detailed tracking of AI model expenditures, token efficiency, and format distribution.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            options={[
              { value: '30d', label: 'Last 30 Days' },
              { value: '6m', label: 'Last 6 Months' },
              { value: '1y', label: 'Current Academic Year' },
            ]}
          />
          <Button
            variant="outline"
            size="sm"
            icon={Download}
            onClick={() => alert('Exporting analytics report as CSV.')}
          >
            Export
          </Button>
        </div>
      </div>

      {/* Headline Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted font-heading">
            Total Incurred Spend
          </span>
          <div className="text-2xl font-bold text-ink-heading font-heading mt-1 tabular-nums">
            ${data.totalSpendUSD.toFixed(2)}
          </div>
          <span className="text-xs text-status-success font-medium mt-1 block">
            Across 1,248 educational visuals
          </span>
        </Card>

        <Card className="p-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted font-heading">
            Average Cost / Visual
          </span>
          <div className="text-2xl font-bold text-brand font-heading mt-1 tabular-nums">
            ${data.averageCostPerImage.toFixed(4)}
          </div>
          <span className="text-xs text-ink-muted mt-1 block">
            Optimized via prompt token pruning
          </span>
        </Card>

        <Card className="p-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted font-heading">
            Autonomous Savings
          </span>
          <div className="text-2xl font-bold text-status-success font-heading mt-1 tabular-nums">
            {data.savingsPercent}%
          </div>
          <span className="text-xs text-ink-muted mt-1 block">
            Compared to unrouted base models
          </span>
        </Card>

        <Card className="p-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted font-heading">
            Total Visual Outputs
          </span>
          <div className="text-2xl font-bold text-ink-heading font-heading mt-1 tabular-nums">
            {data.totalGenerations.toLocaleString()}
          </div>
          <span className="text-xs text-ink-muted mt-1 block">
            Print worksheets & classroom cards
          </span>
        </Card>
      </div>

      {/* Monthly Trend Visualizer Bar Chart */}
      <Card
        title="Monthly Expenditure & Savings Trends"
        subtitle="Tracking direct model costs alongside cost-pruning savings (USD)"
      >
        <div className="mt-4 pt-4 border-t border-border">
          <div className="grid grid-cols-6 gap-3 sm:gap-6 items-end h-56 pt-6">
            {data.monthlyTrends.map((t) => {
              const spendHeight = Math.round((t.spend / maxMonthlySpend) * 100);
              const savingsHeight = Math.round((t.savings / maxMonthlySpend) * 100);
              return (
                <div key={t.month} className="flex flex-col items-center gap-2 h-full justify-end">
                  <div className="w-full flex items-end justify-center gap-1.5 h-44">
                    {/* Incurred spend bar */}
                    <div
                      style={{ height: `${spendHeight}%` }}
                      className="w-1/2 max-w-[28px] bg-brand rounded-t-sm relative group cursor-pointer transition-all hover:bg-brand-hover"
                    >
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-ink-heading text-white text-[10px] py-1 px-1.5 rounded pointer-events-none whitespace-nowrap z-10">
                        Spend: ${t.spend.toFixed(2)}
                      </div>
                    </div>

                    {/* Savings bar */}
                    <div
                      style={{ height: `${savingsHeight}%` }}
                      className="w-1/2 max-w-[28px] bg-emerald-400 rounded-t-sm relative group cursor-pointer transition-all hover:bg-emerald-500"
                    >
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-ink-heading text-white text-[10px] py-1 px-1.5 rounded pointer-events-none whitespace-nowrap z-10">
                        Saved: ${t.savings.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-ink-heading font-heading">
                    {t.month}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-border text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-brand" />
              <span className="text-ink-body font-medium">Incurred Model Spend</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-emerald-400" />
              <span className="text-ink-body font-medium">Smart-Route Savings</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Model & Output Format Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Model Distribution */}
        <Card
          title="Inference Traffic by AI Model"
          subtitle="Breakdown of prompt routing destinations"
        >
          <div className="space-y-4">
            {data.modelDistribution.map((m) => (
              <div key={m.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-ink-heading">{m.name}</span>
                  <div className="space-x-2">
                    <span className="text-ink-muted">{m.count} visuals</span>
                    <strong className="text-brand tabular-nums">{m.percent}%</strong>
                  </div>
                </div>
                <div className="w-full h-2 bg-surface-canvas rounded-full overflow-hidden border border-border">
                  <div
                    style={{ width: `${m.percent}%` }}
                    className="h-full bg-brand rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Output Format Distribution */}
        <Card
          title="Classroom Output Formats"
          subtitle="Share of worksheets, posters, and learning cards"
        >
          <div className="space-y-4">
            {data.formatDistribution.map((f) => (
              <div key={f.format} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-ink-heading">{f.format}</span>
                  <div className="space-x-2">
                    <span className="text-ink-muted">{f.count} items</span>
                    <strong className="text-status-success tabular-nums">{f.percent}%</strong>
                  </div>
                </div>
                <div className="w-full h-2 bg-surface-canvas rounded-full overflow-hidden border border-border">
                  <div
                    style={{ width: `${f.percent}%` }}
                    className="h-full bg-status-success rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
