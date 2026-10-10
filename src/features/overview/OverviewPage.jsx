import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Layers,
  CheckCircle2,
  TrendingDown,
  ArrowRight,
  Clock,
  Download,
  AlertCircle,
  Cpu,
  Palette,
  FileText,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { generationService } from '../../services/generationService';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { TokenGauge } from '../../components/common/TokenGauge';
import { GuardrailBadge } from '../../components/common/GuardrailBadge';
import { Spinner } from '../../components/common/Spinner';

export const OverviewPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [budget, setBudget] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [historyRes, budgetRes] = await Promise.all([
          generationService.getHistory(),
          generationService.getBudgetSummary(),
        ]);
        setHistory(historyRes.items.slice(0, 4));
        setBudget(budgetRes);
      } catch (err) {
        console.error('Failed to load overview data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const stats = [
    {
      title: 'Monthly Generations',
      value: '1,248',
      change: '+18.4% vs last mo',
      trend: 'up',
      icon: Sparkles,
      iconBg: 'bg-brand-tint text-brand',
    },
    {
      title: 'Active Teachers',
      value: '41',
      change: 'Across 3 schools',
      trend: 'neutral',
      icon: Layers,
      iconBg: 'bg-blue-50 text-blue-700',
    },
    {
      title: 'Quality Pass Rate',
      value: '99.4%',
      change: 'Safety guardrails met',
      trend: 'up',
      icon: CheckCircle2,
      iconBg: 'bg-status-success-bg text-status-success',
    },
    {
      title: 'Cost Optimization',
      value: '38.4%',
      change: '$30.15 saved this cycle',
      trend: 'up',
      icon: TrendingDown,
      iconBg: 'bg-emerald-50 text-emerald-700',
    },
  ];

  const getFormatIcon = (category) => {
    switch (category) {
      case 'worksheet':
        return Palette;
      case 'poster':
        return FileText;
      case 'flashcard':
        return Layers;
      default:
        return BookOpen;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-lg border border-border shadow-level-1">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-bold text-ink-heading font-heading">
              Welcome back, {user?.name || 'Educator'}
            </h1>
            <GuardrailBadge level="k-5" />
          </div>
          <p className="text-xs sm:text-sm text-ink-muted">
            {user?.district || 'Lincoln School District'} · All curriculum safety guardrails and autonomous cost-routing active.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/app/history')}
          >
            View All Materials
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Sparkles}
            onClick={() => navigate('/app/studio')}
          >
            Launch Studio
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider font-heading">
                  {stat.title}
                </span>
                <div className={`w-8 h-8 rounded-md flex items-center justify-center ${stat.iconBg}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-ink-heading font-heading tabular-nums">
                  {stat.value}
                </span>
              </div>
              <div className="mt-1 text-xs text-status-success font-medium">
                {stat.change}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Gauge and Model Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {budget && (
            <TokenGauge
              totalBudget={budget.totalAllocatedTokens}
              usedTokens={budget.usedTokens}
              savingsPercent={budget.projectedSavingsPercent}
            />
          )}
        </div>
        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-border pb-3 mb-3">
              <span className="text-xs font-bold text-ink-heading uppercase tracking-wider font-heading">
                Active Inference Routing
              </span>
              <Badge variant="success" dot>Live</Badge>
            </div>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-ink-body">Worksheet Engine:</span>
                <span className="font-semibold text-brand">Imagen 3 Fast</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-body">STEM / Diagram Engine:</span>
                <span className="font-semibold text-brand">Gemini 3 Pro</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-body">Flashcard Prototyping:</span>
                <span className="font-semibold text-brand">SDXL Turbo</span>
              </div>
            </div>
          </div>
          <div className="pt-3 border-t border-border mt-3">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={() => navigate('/app/routing-rules')}
            >
              Configure Routing Rules
            </Button>
          </div>
        </Card>
      </div>

      {/* Recent Generations & Quality Review Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Generated Worksheets */}
        <div className="lg:col-span-2">
          <Card
            title="Recent Visual Generations"
            subtitle="Latest educational materials generated across your classrooms"
            headerAction={
              <Button
                variant="ghost"
                size="sm"
                iconRight={ArrowRight}
                onClick={() => navigate('/app/history')}
              >
                View History
              </Button>
            }
            noPadding
          >
            {loading ? (
              <div className="py-12">
                <Spinner label="Loading recent generation records..." />
              </div>
            ) : history.length === 0 ? (
              <div className="py-10 text-center text-xs text-ink-muted">
                No recent generations found. Click 'Launch Studio' to create your first visual!
              </div>
            ) : (
              <div className="divide-y divide-border">
                {history.map((item) => {
                  const FormatIcon = getFormatIcon(item.category);
                  return (
                    <div
                      key={item.id}
                      className="p-4 hover:bg-surface-hover/60 transition-colors flex items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-surface-canvas border border-border flex items-center justify-center text-brand flex-shrink-0 mt-0.5">
                          <FormatIcon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-ink-heading truncate font-heading">
                            {item.title}
                          </div>
                          <div className="text-xs text-ink-muted truncate max-w-md mt-0.5">
                            {item.prompt}
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-[11px] text-ink-muted">
                            <span className="font-medium text-brand">{item.categoryLabel}</span>
                            <span>•</span>
                            <span>{item.gradeLevel}</span>
                            <span>•</span>
                            <span className="tabular-nums">${item.cost.toFixed(4)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge
                          variant={item.reviewStatus === 'approved' ? 'success' : 'warning'}
                          dot
                        >
                          {item.reviewStatus === 'approved' ? 'Approved' : 'In Review'}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          icon={Download}
                          onClick={() => alert(`Downloading "${item.title}" high-resolution PDF.`)}
                        >
                          PDF
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Quality Review & Safety Summary Widget */}
        <div className="space-y-4">
          <Card
            title="Classroom Safety Hub"
            subtitle="Pedagogical moderation & quality indicators"
          >
            <div className="space-y-3.5 text-xs">
              <div className="p-3 rounded-md bg-emerald-50 border border-emerald-200">
                <div className="flex items-center gap-1.5 font-semibold text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>K-12 Moderation Active</span>
                </div>
                <p className="text-[11px] text-emerald-700 mt-1 leading-relaxed">
                  Automatic filtering flags non-pedagogical, violence, or sensitive terms before model inference.
                </p>
              </div>

              <div className="p-3 rounded-md bg-amber-50 border border-amber-200">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-amber-800">2 Items Awaiting Review</span>
                  <Badge variant="warning">Action Needed</Badge>
                </div>
                <p className="text-[11px] text-amber-700 mt-1">
                  High School anatomy diagrams queued for curriculum accuracy check.
                </p>
                <div className="mt-2.5">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => navigate('/app/quality-review')}
                  >
                    Open Review Queue
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
