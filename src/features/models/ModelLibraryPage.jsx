import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Search,
  CheckCircle2,
  Clock,
  Coins,
  ShieldCheck,
  Zap,
  Filter,
} from 'lucide-react';
import { generationService } from '../../services/generationService';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Input } from '../../components/common/Input';
import { Spinner } from '../../components/common/Spinner';

export const ModelLibraryPage = () => {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const res = await generationService.getModels();
        setModels(res.models);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = models.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.provider.toLowerCase().includes(search.toLowerCase()) ||
      m.specialty.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold text-ink-heading font-heading">
            AI Model Library & Benchmarks
          </h1>
          <p className="text-xs text-ink-muted">
            Verified multimodal image generation engines connected to the EduGenAI inference cluster.
          </p>
        </div>

        <div className="w-full sm:w-64">
          <Input
            placeholder="Search models or providers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={Search}
          />
        </div>
      </div>

      {loading ? (
        <Card className="py-20">
          <Spinner label="Loading model benchmarks..." />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((m) => (
            <Card key={m.id} className="flex flex-col justify-between hover:shadow-level-2 transition-shadow">
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-brand-tint text-brand flex items-center justify-center">
                      <Cpu className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-ink-heading font-heading">
                        {m.name}
                      </h3>
                      <span className="text-xs text-ink-muted">{m.provider}</span>
                    </div>
                  </div>
                  <Badge variant="success" dot>Operational</Badge>
                </div>

                <p className="text-xs text-ink-body mb-4 leading-relaxed">
                  {m.specialty}
                </p>

                {/* Benchmark details */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3 rounded-lg bg-surface-canvas text-xs mb-3">
                  <div>
                    <span className="text-ink-muted block text-[11px]">Cost / Image</span>
                    <span className="font-semibold text-status-success font-heading">{m.costPerImage}</span>
                  </div>
                  <div>
                    <span className="text-ink-muted block text-[11px]">Avg Latency</span>
                    <span className="font-semibold text-ink-heading">{m.latency}</span>
                  </div>
                  <div>
                    <span className="text-ink-muted block text-[11px]">Safety Rating</span>
                    <span className="font-semibold text-emerald-700">{m.rating}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-border flex flex-wrap items-center justify-between text-[11px] text-ink-muted gap-2">
                <span>Optimized Formats: <strong className="text-ink-heading">{m.supportedCategories.join(', ')}</strong></span>
                <span>Context: <strong className="text-ink-heading">{m.contextWindow}</strong></span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
