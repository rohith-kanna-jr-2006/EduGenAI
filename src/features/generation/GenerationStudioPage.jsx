import React, { useState } from 'react';
import {
  Wand2,
  Sparkles,
  Layers,
  Palette,
  FileText,
  BookOpen,
  Download,
  RotateCcw,
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertCircle,
  Cpu,
  Share2,
  Sliders,
} from 'lucide-react';
import { generationService } from '../../services/generationService';
import { useNotification } from '../../context/NotificationContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Select } from '../../components/common/Select';
import { Badge } from '../../components/common/Badge';
import { GuardrailBadge } from '../../components/common/GuardrailBadge';
import { Spinner } from '../../components/common/Spinner';

export const GenerationStudioPage = () => {
  const { success, error: notifyError } = useNotification();

  const [prompt, setPrompt] = useState(
    'Draw a high-contrast printable black-and-white outline colouring worksheet of the human respiratory system with lungs, trachea, and bronchi labeled for 5th grade science.'
  );
  const [category, setCategory] = useState('worksheet');
  const [gradeLevel, setGradeLevel] = useState('Grade 5 (Elementary)');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [modelMode, setModelMode] = useState('auto'); // 'auto' | 'manual'
  const [manualModel, setManualModel] = useState('imagen-3-fast');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressStep, setProgressStep] = useState('');
  const [generatedVisual, setGeneratedVisual] = useState(null);

  // Approximate token calculation
  const tokenCount = Math.max(1, Math.round(prompt.length / 4));
  const estimatedCost = modelMode === 'auto' ? 0.0032 : manualModel === 'gemini-3-pro' ? 0.0058 : 0.0032;

  const categories = [
    { value: 'worksheet', label: 'Colouring Worksheet (Print Line-Art)', icon: Palette },
    { value: 'flashcard', label: 'Flashcards & Vocab Cards (Print Grid)', icon: Layers },
    { value: 'poster', label: 'Educational Poster (Classroom Infographic)', icon: FileText },
    { value: 'illustration', label: 'Learning Illustration (STEM / Historical)', icon: BookOpen },
  ];

  const gradeOptions = [
    { value: 'Early Childhood (Pre-K - K)', label: 'Early Childhood (Pre-K - K)' },
    { value: 'Grades 1-2 (Early Elementary)', label: 'Grades 1-2 (Early Elementary)' },
    { value: 'Grade 5 (Elementary)', label: 'Grade 3-5 (Elementary)' },
    { value: 'Grades 6-8 (Middle School)', label: 'Grades 6-8 (Middle School)' },
    { value: 'Grades 9-12 (High School)', label: 'Grades 9-12 (High School)' },
  ];

  const aspectOptions = [
    { value: '1:1', label: '1:1 Square (Worksheet & Anatomy)' },
    { value: '16:9', label: '16:9 Landscape (Wall Poster)' },
    { value: '2:3', label: '2:3 Vertical (Flashcard Paired)' },
  ];

  const manualModelOptions = [
    { value: 'imagen-3-fast', label: 'Imagen 3 Fast ($0.0032 · High-Contrast Vector)' },
    { value: 'gemini-3-pro', label: 'Gemini 3 Pro Vision ($0.0058 · STEM & Text)' },
    { value: 'sdxl-turbo', label: 'SDXL Turbo Education ($0.0024 · Fast Flashcards)' },
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      notifyError('Please enter a lesson topic or prompt.');
      return;
    }

    setIsGenerating(true);
    setProgressStep('Evaluating pedagogical safety & grade guardrails...');
    try {
      setTimeout(() => {
        setProgressStep('Autonomous model routing & token pruning...');
      }, 500);

      setTimeout(() => {
        setProgressStep('Synthesizing high-contrast classroom line-art...');
      }, 1000);

      const res = await generationService.generateVisual({
        prompt,
        category,
        gradeLevel,
        aspectRatio,
        modelMode,
        selectedModelId: manualModel,
        selectedModel: manualModelOptions.find((m) => m.value === manualModel)?.label,
      });

      setGeneratedVisual(res.data);
      success('Educational visual generated and verified successfully!');
    } catch (err) {
      notifyError('Generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
      setProgressStep('');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Studio Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold text-ink-heading font-heading">
            Generation Studio
          </h1>
          <p className="text-xs text-ink-muted">
            Create high-contrast print worksheets, flashcard sets, and infographics with automated model routing.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <GuardrailBadge level="k-5" />
          <Badge variant="brand" dot>Smart-Router Online</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Parameter Configuration & Prompt Box (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Prompt Generator Box */}
          <Card
            title="Curriculum Prompt"
            subtitle="Describe the lesson topic, grade level, and visual labels required"
          >
            <div className="space-y-3">
              <div className="relative">
                <textarea
                  rows={6}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. Draw a printable outline colouring worksheet showing the water cycle with precipitation, condensation, and evaporation..."
                  className="w-full bg-white text-ink-heading text-xs sm:text-sm rounded-md border border-border p-3 pb-8 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all resize-none leading-relaxed placeholder:text-ink-muted"
                />
                {/* Anchored token & cost chip */}
                <div className="absolute bottom-2.5 right-3 flex items-center gap-2 text-[11px] text-ink-muted bg-surface-canvas/90 px-2 py-0.5 rounded border border-border">
                  <span className="tabular-nums">Tokens: <strong className="text-ink-heading">{tokenCount}</strong></span>
                  <span>·</span>
                  <span className="tabular-nums">Est: <strong className="text-status-success">${estimatedCost.toFixed(4)}</strong></span>
                </div>
              </div>

              {/* Quick Prompt Presets */}
              <div>
                <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider block mb-1.5 font-heading">
                  Curriculum Quick Presets
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Plant Cell Organelles (5th Grade)',
                    'Water Cycle Outline (3rd Grade)',
                    'Fractions Pie Chart (4th Grade)',
                    'Plate Tectonics Fault Lines (8th Grade)',
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setPrompt(`Create a printable classroom visual of ${preset} with clear labels and student worksheet layout.`)}
                      className="text-[11px] px-2 py-1 rounded bg-surface-canvas hover:bg-surface-hover text-ink-body hover:text-ink-heading border border-border transition-colors text-left"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Educational Parameters */}
          <Card title="Format & Guardrails" subtitle="Configure pedagogical layout and output dimension">
            <div className="space-y-4">
              <Select
                label="Educational Output Format"
                options={categories}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Select
                  label="Target Grade Level"
                  options={gradeOptions}
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(e.target.value)}
                />
                <Select
                  label="Aspect Ratio / Dimensions"
                  options={aspectOptions}
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value)}
                />
              </div>

              {/* Model Selection: Auto vs Manual */}
              <div className="pt-2 border-t border-border">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-ink-heading">
                    Model Selection Strategy
                  </label>
                  <div className="flex items-center gap-1 bg-surface-canvas p-0.5 rounded border border-border text-xs">
                    <button
                      type="button"
                      onClick={() => setModelMode('auto')}
                      className={`px-2 py-0.5 rounded font-medium transition-colors ${
                        modelMode === 'auto'
                          ? 'bg-brand text-white shadow-xs'
                          : 'text-ink-body hover:text-ink-heading'
                      }`}
                    >
                      Auto Smart-Route
                    </button>
                    <button
                      type="button"
                      onClick={() => setModelMode('manual')}
                      className={`px-2 py-0.5 rounded font-medium transition-colors ${
                        modelMode === 'manual'
                          ? 'bg-brand text-white shadow-xs'
                          : 'text-ink-body hover:text-ink-heading'
                      }`}
                    >
                      Manual
                    </button>
                  </div>
                </div>

                {modelMode === 'auto' ? (
                  <div className="p-3 bg-brand-tint/60 rounded-md border border-brand/20 text-xs text-brand-dark flex items-start gap-2">
                    <Zap className="w-4 h-4 text-brand flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold">Autonomous Least-Cost Routing Active</div>
                      <div className="text-[11px] text-ink-body mt-0.5 leading-snug">
                        EduGenAI selects the most cost-effective image engine matching your pedagogical standards and output format.
                      </div>
                    </div>
                  </div>
                ) : (
                  <Select
                    label="Specific Inference Model"
                    options={manualModelOptions}
                    value={manualModel}
                    onChange={(e) => setManualModel(e.target.value)}
                  />
                )}
              </div>

              {/* Action Button */}
              <div className="pt-3">
                <Button
                  variant="primary"
                  size="lg"
                  loading={isGenerating}
                  onClick={handleGenerate}
                  className="w-full shadow-md font-semibold"
                  icon={Wand2}
                >
                  {isGenerating ? 'Generating Visual...' : 'Generate Educational Visual'}
                </Button>
                {isGenerating && (
                  <div className="mt-2 text-center text-xs text-brand animate-pulse font-medium">
                    {progressStep}
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Generation Canvas & Result Preview (7 cols) */}
        <div className="lg:col-span-7">
          <Card
            title={generatedVisual ? generatedVisual.title : 'Live Generation Canvas'}
            subtitle={
              generatedVisual
                ? `${generatedVisual.categoryLabel} · ${generatedVisual.gradeLevel}`
                : 'Your generated learning material preview will appear here'
            }
            headerAction={
              generatedVisual && (
                <div className="flex items-center gap-2">
                  <Badge variant="success" dot>Safe & Verified</Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Download}
                    onClick={() => alert(`Downloading "${generatedVisual.title}" print-ready file.`)}
                  >
                    Export
                  </Button>
                </div>
              )
            }
          >
            {isGenerating ? (
              <div className="h-96 flex flex-col items-center justify-center p-8 bg-surface-canvas/50 rounded-lg border border-dashed border-border text-center">
                <Spinner size="lg" />
                <h3 className="text-base font-semibold text-ink-heading mt-4 font-heading">
                  Synthesizing Educational Material
                </h3>
                <p className="text-xs text-ink-muted mt-1 max-w-sm">
                  {progressStep || 'Please hold on while the model completes vector rendering and K-12 guardrail verification...'}
                </p>
              </div>
            ) : generatedVisual ? (
              <div className="space-y-4">
                {/* Visual Preview Container */}
                <div className="relative rounded-lg border border-border bg-white overflow-hidden shadow-level-1">
                  {/* Decorative Banner */}
                  <div className="p-8 sm:p-12 bg-gradient-to-b from-surface-canvas to-white flex flex-col items-center justify-center text-center min-h-[340px] border-b border-border">
                    <div className="w-20 h-20 rounded-full bg-brand-tint text-brand flex items-center justify-center shadow-sm mb-4">
                      {category === 'worksheet' ? (
                        <Palette className="w-10 h-10" />
                      ) : category === 'poster' ? (
                        <FileText className="w-10 h-10" />
                      ) : (
                        <Layers className="w-10 h-10" />
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-ink-heading font-heading max-w-md">
                      {generatedVisual.title}
                    </h3>
                    <p className="text-xs text-ink-body max-w-lg mt-2 leading-relaxed">
                      "{generatedVisual.prompt}"
                    </p>

                    <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {generatedVisual.guardrailStatus}
                      </span>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-brand-tint text-brand border border-brand/20">
                        {generatedVisual.modelUsed}
                      </span>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-surface-canvas text-ink-heading border border-border">
                        {generatedVisual.dimensions}
                      </span>
                    </div>
                  </div>

                  {/* Footer metadata breakdown */}
                  <div className="p-4 bg-surface-canvas/60 flex flex-wrap items-center justify-between text-xs text-ink-muted gap-2">
                    <div className="flex items-center gap-3">
                      <span>Inference Cost: <strong className="text-status-success tabular-nums">${generatedVisual.cost.toFixed(4)}</strong></span>
                      <span>·</span>
                      <span>Tokens: <strong className="text-ink-heading tabular-nums">{generatedVisual.tokensUsed}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        icon={RotateCcw}
                        onClick={handleGenerate}
                      >
                        Regenerate
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        icon={Download}
                        onClick={() => alert(`Exporting ${generatedVisual.title} as 300 DPI PDF.`)}
                      >
                        Download PDF
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Educational Next Actions */}
                <div className="p-4 rounded-lg bg-surface-canvas border border-border text-xs text-ink-body space-y-2">
                  <div className="font-semibold text-ink-heading font-heading">
                    Recommended Next Classroom Actions:
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-ink-muted text-xs">
                    <li>Export to Google Classroom or Canvas as an interactive assignment.</li>
                    <li>Print 25 copies formatted for standard 8.5x11 classroom paper.</li>
                    <li>Add to District Curriculum Archive for school-wide sharing.</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="h-96 flex flex-col items-center justify-center p-8 bg-surface-canvas/40 rounded-lg border border-dashed border-border text-center">
                <div className="w-14 h-14 rounded-full bg-brand-tint text-brand flex items-center justify-center mb-3">
                  <Sparkles className="w-7 h-7" />
                </div>
                <h3 className="text-base font-semibold text-ink-heading font-heading">
                  Canvas Ready for Synthesis
                </h3>
                <p className="text-xs text-ink-body mt-1 max-w-sm">
                  Customize the prompt and educational parameters on the left, then click <strong>Generate Educational Visual</strong> to create print-ready materials.
                </p>
                <div className="mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleGenerate}
                  >
                    Generate Sample Worksheet
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
