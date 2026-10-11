import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  ShieldCheck,
  AlertTriangle,
  Eye,
  Check,
  X,
  FileCheck,
  Palette,
  Layers,
  BookOpen,
} from 'lucide-react';
import { generationService } from '../../services/generationService';
import { useNotification } from '../../context/NotificationContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Spinner } from '../../components/common/Spinner';
import { Modal } from '../../components/common/Modal';

export const QualityReviewPage = () => {
  const { success, warning, error: notifyError } = useNotification();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'approved'
  const [selectedReview, setSelectedReview] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');

  const loadReviews = async () => {
    setLoading(true);
    try {
      const res = await generationService.getQualityReviews();
      const pending = Array.isArray(res?.pending) ? res.pending : [];
      const approved = Array.isArray(res?.approved) ? res.approved : [];
      setReviews(pending.concat(approved));
    } catch (err) {
      notifyError('Failed to load quality reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleAction = async (id, newStatus) => {
    try {
      await generationService.updateReviewStatus(id, newStatus, feedbackText);
      setReviews((prev) =>
        prev.map((item) => (item.id === id ? { ...item, reviewStatus: newStatus } : item))
      );
      if (newStatus === 'approved') {
        success('Classroom visual approved for district distribution!');
      } else if (newStatus === 'rejected') {
        warning('Visual rejected and flagged for curriculum remediation.');
      }
      setSelectedReview(null);
      setFeedbackText('');
    } catch (err) {
      notifyError('Action failed. Please try again.');
    }
  };

  const filteredItems = reviews.filter((r) =>
    activeTab === 'pending' ? r.reviewStatus === 'pending' : r.reviewStatus === 'approved'
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold text-ink-heading font-heading">
            Quality & Safety Review
          </h1>
          <p className="text-xs text-ink-muted">
            Curriculum validation workflow verifying K-12 pedagogical standards, COPPA, and visual accuracy.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1 bg-white border border-border p-1 rounded-md text-xs">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${
              activeTab === 'pending'
                ? 'bg-amber-100 text-amber-900 font-semibold'
                : 'text-ink-muted hover:text-ink-heading'
            }`}
          >
            Needs Review ({reviews.filter((r) => r.reviewStatus === 'pending').length})
          </button>
          <button
            onClick={() => setActiveTab('approved')}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${
              activeTab === 'approved'
                ? 'bg-emerald-100 text-emerald-900 font-semibold'
                : 'text-ink-muted hover:text-ink-heading'
            }`}
          >
            Approved Archive ({reviews.filter((r) => r.reviewStatus === 'approved').length})
          </button>
        </div>
      </div>

      {/* Safety Policy Callout */}
      <div className="p-4 bg-white rounded-lg border border-border shadow-level-1 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs">
          <div className="font-semibold text-ink-heading">Classroom Moderation Protocol</div>
          <div className="text-ink-muted mt-0.5 leading-relaxed">
            All visual outputs generated for grade levels K-8 automatically inherit high-contrast filtering and age-appropriate anatomical representations. You can review items that require secondary teacher confirmation below.
          </div>
        </div>
      </div>

      {/* Review Queue Grid */}
      {loading ? (
        <Card className="py-20">
          <Spinner label="Loading quality review items..." />
        </Card>
      ) : filteredItems.length === 0 ? (
        <Card className="py-16 text-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-ink-heading font-heading">
            {activeTab === 'pending' ? 'All Items Reviewed!' : 'No Approved Items Yet'}
          </h3>
          <p className="text-xs text-ink-muted mt-1 max-w-sm mx-auto">
            {activeTab === 'pending'
              ? 'Your district visual generation queue has zero pending moderation flags.'
              : 'Approved learning visuals will appear here.'}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item) => (
            <Card
              key={item.id}
              className="flex flex-col justify-between hover:shadow-level-2 transition-shadow"
            >
              <div>
                {/* Visual Representation Container */}
                <div className="h-44 bg-surface-canvas rounded-md border border-border flex flex-col items-center justify-center p-4 text-center mb-3">
                  <div className="w-12 h-12 rounded-full bg-brand-tint text-brand flex items-center justify-center mb-2">
                    {item.category === 'worksheet' ? (
                      <Palette className="w-6 h-6" />
                    ) : (
                      <BookOpen className="w-6 h-6" />
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-ink-heading font-heading">
                    {item.title}
                  </h4>
                  <span className="text-[11px] text-ink-muted mt-1">{item.dimensions}</span>
                </div>

                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-brand">{item.categoryLabel}</span>
                  <Badge variant={item.reviewStatus === 'approved' ? 'success' : 'warning'}>
                    {item.reviewStatus === 'approved' ? 'Passed Quality' : 'Awaiting Review'}
                  </Badge>
                </div>

                <p className="text-xs text-ink-body line-clamp-2 mb-3">
                  "{item.prompt}"
                </p>

                <div className="p-2.5 rounded bg-surface-canvas text-[11px] space-y-1 mb-3">
                  <div className="flex justify-between">
                    <span className="text-ink-muted">Grade Standard:</span>
                    <span className="font-semibold text-ink-heading">{item.gradeLevel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-muted">Safety Score:</span>
                    <span className="font-semibold text-emerald-600">{item.qualityScore}% Compliant</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => setSelectedReview(item)}
                >
                  Review Details
                </Button>
                {item.reviewStatus === 'pending' && (
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full text-xs"
                    icon={Check}
                    onClick={() => handleAction(item.id, 'approved')}
                  >
                    Approve
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Review Modal */}
      <Modal
        isOpen={!!selectedReview}
        onClose={() => setSelectedReview(null)}
        title="Classroom Material Inspection"
        subtitle={selectedReview?.title}
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setSelectedReview(null)}>
              Cancel
            </Button>
            {selectedReview?.reviewStatus === 'pending' && (
              <>
                <Button
                  variant="destructive"
                  size="sm"
                  icon={X}
                  onClick={() => handleAction(selectedReview.id, 'rejected')}
                >
                  Reject & Flag
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  icon={Check}
                  onClick={() => handleAction(selectedReview.id, 'approved')}
                >
                  Approve for Classroom
                </Button>
              </>
            )}
          </>
        }
      >
        {selectedReview && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-surface-canvas rounded border border-border">
              <span className="font-bold text-ink-muted uppercase block mb-1">Lesson Prompt</span>
              <p className="text-ink-heading font-mono">{selectedReview.prompt}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-2.5 bg-white rounded border border-border">
                <span className="text-ink-muted block">Grade Level</span>
                <span className="font-semibold text-ink-heading">{selectedReview.gradeLevel}</span>
              </div>
              <div className="p-2.5 bg-white rounded border border-border">
                <span className="text-ink-muted block">Safety Rating</span>
                <span className="font-semibold text-emerald-600">{selectedReview.qualityScore}% (High)</span>
              </div>
            </div>

            {selectedReview.reviewStatus === 'pending' && (
              <div>
                <label className="font-semibold text-ink-heading block mb-1">
                  Educator Review Notes (Optional):
                </label>
                <textarea
                  rows={3}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Add notes for curriculum director or teacher re-generation..."
                  className="w-full p-2.5 rounded border border-border text-xs outline-none focus:border-brand"
                />
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
