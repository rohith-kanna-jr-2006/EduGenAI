import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  Download,
  Trash2,
  Eye,
  RotateCcw,
  LayoutGrid,
  List,
  Palette,
  FileText,
  Layers,
  BookOpen,
  Calendar,
} from 'lucide-react';
import { generationService } from '../../services/generationService';
import { useNotification } from '../../context/NotificationContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Pagination } from '../../components/common/Pagination';
import { Modal } from '../../components/common/Modal';
import { Spinner } from '../../components/common/Spinner';
import { EmptyState } from '../../components/common/EmptyState';

export const HistoryPage = () => {
  const { success, error: notifyError } = useNotification();
  const [searchParams] = useSearchParams();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState(null);

  const pageSize = 5;

  const loadHistory = async () => {
    setLoading(true);
    try {
      const res = await generationService.getHistory({
        search: searchTerm,
        category: selectedCategory,
        status: selectedStatus,
      });
      setItems(res.items);
      setCurrentPage(1);
    } catch (err) {
      notifyError('Failed to load generation history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [selectedCategory, selectedStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadHistory();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this generation record?')) return;
    try {
      await generationService.deleteGeneration(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      if (selectedItem?.id === id) setSelectedItem(null);
      success('Record deleted successfully');
    } catch (err) {
      notifyError('Failed to delete item');
    }
  };

  // Pagination calculation
  const totalPages = Math.ceil(items.length / pageSize);
  const paginatedItems = items.slice((currentPage - 1) * pageSize, currentPage * pageSize);

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
      {/* Page Title & View Toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold text-ink-heading font-heading">
            Generation History
          </h1>
          <p className="text-xs text-ink-muted">
            Archive of all educational visual materials synthesized for your classrooms.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Table / Grid view switcher */}
          <div className="flex items-center bg-white border border-border rounded-md p-0.5">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'table' ? 'bg-surface-canvas text-brand font-bold' : 'text-ink-muted hover:text-ink-heading'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'grid' ? 'bg-surface-canvas text-brand font-bold' : 'text-ink-muted hover:text-ink-heading'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-5">
            <Input
              label="Search Prompts or Titles"
              placeholder="Filter by keyword (e.g. 'water cycle', 'mitosis')..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={Search}
            />
          </div>
          <div className="sm:col-span-3">
            <Select
              label="Format"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              options={[
                { value: 'all', label: 'All Output Formats' },
                { value: 'worksheet', label: 'Colouring Worksheets' },
                { value: 'flashcard', label: 'Flashcards' },
                { value: 'poster', label: 'Educational Posters' },
                { value: 'illustration', label: 'Learning Illustrations' },
              ]}
            />
          </div>
          <div className="sm:col-span-2">
            <Select
              label="Review Status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'approved', label: 'Approved Only' },
                { value: 'pending', label: 'In Review' },
              ]}
            />
          </div>
          <div className="sm:col-span-2 flex gap-2">
            <Button type="submit" variant="primary" size="md" className="w-full">
              Apply
            </Button>
            {(searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all') && (
              <Button
                variant="outline"
                size="md"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setSelectedStatus('all');
                }}
              >
                Reset
              </Button>
            )}
          </div>
        </form>
      </Card>

      {/* Content Rendering: Table or Grid */}
      {loading ? (
        <Card className="py-20">
          <Spinner label="Loading generation archive records..." />
        </Card>
      ) : items.length === 0 ? (
        <Card className="py-12">
          <EmptyState
            title="No generation records found"
            description="Try modifying your keyword search or filter options, or generate a new visual in the Studio."
            actionLabel="Go to Generation Studio"
            onAction={() => (window.location.href = '/app/studio')}
          />
        </Card>
      ) : viewMode === 'table' ? (
        /* Table Layout */
        <Card noPadding>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-surface-canvas border-b border-border text-ink-muted uppercase font-bold tracking-wider">
                  <th className="py-3 px-4">Title & Lesson Prompt</th>
                  <th className="py-3 px-4">Format & Grade</th>
                  <th className="py-3 px-4">Engine / Model</th>
                  <th className="py-3 px-4">Cost & Tokens</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedItems.map((item) => {
                  const FormatIcon = getFormatIcon(item.category);
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-surface-hover/60 transition-colors cursor-pointer"
                      onClick={() => setSelectedItem(item)}
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-surface-canvas border border-border flex items-center justify-center text-brand flex-shrink-0">
                            <FormatIcon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-semibold text-ink-heading font-heading">
                              {item.title}
                            </div>
                            <div className="text-[11px] text-ink-muted truncate max-w-xs sm:max-w-md">
                              {item.prompt}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-ink-heading">{item.categoryLabel}</div>
                        <div className="text-[11px] text-ink-muted">{item.gradeLevel}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-ink-body">
                        {item.modelUsed}
                      </td>
                      <td className="py-3.5 px-4 tabular-nums">
                        <div className="font-semibold text-ink-heading">${item.cost.toFixed(4)}</div>
                        <div className="text-[11px] text-ink-muted">{item.tokensUsed} tokens</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant={item.reviewStatus === 'approved' ? 'success' : 'warning'} dot>
                          {item.reviewStatus === 'approved' ? 'Approved' : 'In Review'}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedItem(item)}
                            className="p-1.5 rounded text-ink-muted hover:text-ink-heading hover:bg-surface-canvas"
                            title="Inspect details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => alert(`Downloading "${item.title}" file.`)}
                            className="p-1.5 rounded text-brand hover:text-brand-dark hover:bg-brand-tint"
                            title="Download PDF"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 rounded text-status-danger hover:bg-status-danger-bg"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={items.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </Card>
      ) : (
        /* Grid Layout */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedItems.map((item) => {
              const FormatIcon = getFormatIcon(item.category);
              return (
                <Card
                  key={item.id}
                  className="hover:shadow-level-2 transition-shadow cursor-pointer flex flex-col justify-between"
                  onClick={() => setSelectedItem(item)}
                >
                  <div>
                    <div className="h-40 bg-surface-canvas rounded-md border border-dashed border-border flex flex-col items-center justify-center p-4 text-center mb-3">
                      <FormatIcon className="w-10 h-10 text-brand mb-2" />
                      <div className="text-xs font-semibold text-ink-heading font-heading">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-ink-muted mt-1">{item.dimensions}</div>
                    </div>

                    <div className="flex items-center justify-between mb-2">
                      <Badge variant={item.reviewStatus === 'approved' ? 'success' : 'warning'} dot>
                        {item.reviewStatus === 'approved' ? 'Approved' : 'In Review'}
                      </Badge>
                      <span className="text-[11px] text-ink-muted">{item.gradeLevel}</span>
                    </div>

                    <p className="text-xs text-ink-body line-clamp-2 mb-3">
                      {item.prompt}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-ink-muted">
                    <span className="tabular-nums font-semibold text-ink-heading">
                      ${item.cost.toFixed(4)}
                    </span>
                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="outline"
                        size="sm"
                        icon={Download}
                        onClick={() => alert(`Exporting ${item.title}`)}
                      >
                        PDF
                      </Button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 text-status-danger hover:bg-status-danger-bg rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={items.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Details Inspection Modal */}
      <Modal
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        title={selectedItem?.title}
        subtitle={`${selectedItem?.categoryLabel} · ${selectedItem?.gradeLevel}`}
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setSelectedItem(null)}>
              Close
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Download}
              onClick={() => alert(`Downloading ${selectedItem?.title}`)}
            >
              Download Printable Visual
            </Button>
          </>
        }
      >
        {selectedItem && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-surface-canvas rounded-md border border-border">
              <span className="font-bold uppercase tracking-wider text-ink-muted block mb-1">
                Full Educational Prompt
              </span>
              <p className="text-ink-heading leading-relaxed font-mono">
                {selectedItem.prompt}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white rounded border border-border">
                <span className="text-ink-muted block mb-0.5">Model Engine</span>
                <span className="font-semibold text-brand">{selectedItem.modelUsed}</span>
              </div>
              <div className="p-3 bg-white rounded border border-border">
                <span className="text-ink-muted block mb-0.5">Inference Cost</span>
                <span className="font-semibold text-ink-heading tabular-nums">${selectedItem.cost.toFixed(4)}</span>
              </div>
              <div className="p-3 bg-white rounded border border-border">
                <span className="text-ink-muted block mb-0.5">Tokens Consumed</span>
                <span className="font-semibold text-ink-heading tabular-nums">{selectedItem.tokensUsed}</span>
              </div>
              <div className="p-3 bg-white rounded border border-border">
                <span className="text-ink-muted block mb-0.5">Pedagogical Guardrail</span>
                <span className="font-semibold text-emerald-700">{selectedItem.guardrailStatus}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
