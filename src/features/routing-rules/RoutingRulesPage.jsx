import React, { useState, useEffect } from 'react';
import {
  Network,
  Plus,
  Zap,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sliders,
  Shield,
  Trash2,
  Layers,
} from 'lucide-react';
import { generationService } from '../../services/generationService';
import { useNotification } from '../../context/NotificationContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Spinner } from '../../components/common/Spinner';

export const RoutingRulesPage = () => {
  const { success, error: notifyError } = useNotification();

  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // New rule form
  const [newRule, setNewRule] = useState({
    name: '',
    category: 'worksheet',
    targetModel: 'Imagen 3 Fast (Line-Art Pruned)',
    condition: '',
    maxCostCap: '$0.0040',
    latencyTarget: '< 3.0s',
  });

  const loadRules = async () => {
    setLoading(true);
    try {
      const res = await generationService.getRoutingRules();
      setRules(res.rules);
    } catch (err) {
      notifyError('Failed to load routing rules');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRules();
  }, []);

  const handleToggle = async (id, currentStatus) => {
    try {
      await generationService.toggleRuleStatus(id, !currentStatus);
      setRules((prev) =>
        prev.map((r) => (r.id === id ? { ...r, active: !currentStatus } : r))
      );
      success(`Rule ${!currentStatus ? 'activated' : 'disabled'} successfully`);
    } catch (err) {
      notifyError('Failed to toggle rule');
    }
  };

  const handleAddRule = async (e) => {
    e.preventDefault();
    if (!newRule.name || !newRule.condition) {
      notifyError('Please complete all rule fields');
      return;
    }
    try {
      const res = await generationService.addRoutingRule(newRule);
      setRules((prev) => [...prev, res.rule]);
      setModalOpen(false);
      setNewRule({
        name: '',
        category: 'worksheet',
        targetModel: 'Imagen 3 Fast (Line-Art Pruned)',
        condition: '',
        maxCostCap: '$0.0040',
        latencyTarget: '< 3.0s',
      });
      success('Routing rule created successfully!');
    } catch (err) {
      notifyError('Failed to add rule');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold text-ink-heading font-heading">
            Smart Model Routing Rules
          </h1>
          <p className="text-xs text-ink-muted">
            Configure how prompt complexity, subject matter, and grade levels route to image engines for optimal cost and quality.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={() => setModalOpen(true)}
        >
          Add Routing Rule
        </Button>
      </div>

      {/* Overview callout */}
      <div className="p-4 bg-brand-tint/60 rounded-lg border border-brand/20 flex items-start gap-3">
        <Zap className="w-5 h-5 text-brand flex-shrink-0 mt-0.5" />
        <div className="text-xs text-ink-heading">
          <span className="font-semibold text-brand">Autonomous Cost Governor: </span>
          When "Auto Smart-Route" is chosen in Generation Studio, prompts traverse these ordered rules from priority 1 down. The first matching condition dispatches the generation task.
        </div>
      </div>

      {/* Rules Table */}
      {loading ? (
        <Card className="py-20">
          <Spinner label="Loading model routing rules..." />
        </Card>
      ) : (
        <Card noPadding>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-surface-canvas border-b border-border text-ink-muted uppercase font-bold tracking-wider">
                  <th className="py-3 px-4">Priority & Rule Name</th>
                  <th className="py-3 px-4">Trigger Condition</th>
                  <th className="py-3 px-4">Destination Model</th>
                  <th className="py-3 px-4">Cost Cap</th>
                  <th className="py-3 px-4">Target Latency</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-surface-hover/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-brand-tint text-brand font-bold text-[11px] flex items-center justify-center border border-brand/20">
                          {rule.priority}
                        </span>
                        <div>
                          <div className="font-semibold text-ink-heading font-heading">
                            {rule.name}
                          </div>
                          <div className="text-[11px] text-ink-muted capitalize">
                            Format: {rule.category}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-ink-heading max-w-xs">
                      {rule.condition}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-brand">{rule.targetModel}</div>
                    </td>
                    <td className="py-3.5 px-4 tabular-nums font-medium text-ink-heading">
                      {rule.maxCostCap}
                    </td>
                    <td className="py-3.5 px-4 text-ink-muted tabular-nums">
                      {rule.latencyTarget}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleToggle(rule.id, rule.active)}
                        className={`px-3 py-1 rounded-pill text-xs font-semibold transition-colors ${
                          rule.active
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-gray-100 text-gray-600 border border-gray-200'
                        }`}
                      >
                        {rule.active ? 'Active' : 'Disabled'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Add Rule Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create Model Routing Rule"
        subtitle="Define prompt conditions and assign dedicated AI inference engines."
      >
        <form onSubmit={handleAddRule} className="space-y-4 text-xs">
          <Input
            label="Rule Name"
            required
            placeholder="e.g. Elementary Math Grid Optimizer"
            value={newRule.name}
            onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
          />

          <Select
            label="Target Output Format"
            options={[
              { value: 'worksheet', label: 'Colouring Worksheets' },
              { value: 'flashcard', label: 'Flashcards & Vocab' },
              { value: 'poster', label: 'Educational Posters' },
              { value: 'illustration', label: 'Learning Illustrations' },
            ]}
            value={newRule.category}
            onChange={(e) => setNewRule({ ...newRule, category: e.target.value })}
          />

          <Select
            label="Target Engine / Model"
            options={[
              { value: 'Imagen 3 Fast (Line-Art Pruned)', label: 'Imagen 3 Fast ($0.0032/img)' },
              { value: 'Gemini 3 Pro Vision Router', label: 'Gemini 3 Pro Vision ($0.0058/img)' },
              { value: 'SDXL Turbo Education', label: 'SDXL Turbo Education ($0.0024/img)' },
            ]}
            value={newRule.targetModel}
            onChange={(e) => setNewRule({ ...newRule, targetModel: e.target.value })}
          />

          <Input
            label="Trigger Condition (Logic / Keywords)"
            required
            placeholder="e.g. Prompt contains 'fractions' OR grade <= 4"
            value={newRule.condition}
            onChange={(e) => setNewRule({ ...newRule, condition: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Max Cost Cap"
              placeholder="$0.0040"
              value={newRule.maxCostCap}
              onChange={(e) => setNewRule({ ...newRule, maxCostCap: e.target.value })}
            />
            <Input
              label="Target Latency"
              placeholder="< 3.0s"
              value={newRule.latencyTarget}
              onChange={(e) => setNewRule({ ...newRule, latencyTarget: e.target.value })}
            />
          </div>

          <div className="pt-3 border-t border-border flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Routing Rule
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
