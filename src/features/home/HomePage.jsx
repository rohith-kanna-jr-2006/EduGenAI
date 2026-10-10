import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  BookOpen,
  Palette,
  Layers,
  FileText,
  ShieldCheck,
  Zap,
  TrendingDown,
  CheckCircle2,
  Cpu,
  Download,
  Filter,
  Check,
} from 'lucide-react';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { GuardrailBadge } from '../../components/common/GuardrailBadge';

export const HomePage = () => {
  const navigate = useNavigate();

  const categories = [
    {
      title: 'Colouring Worksheets',
      desc: 'Clean black-and-white vector line art optimized for printing and classroom coloring exercises.',
      grade: 'Grades K–5',
      sampleTopic: 'Cell Organelles & Photosynthesis',
      icon: Palette,
      badge: 'High Print Contrast',
    },
    {
      title: 'Flashcards & Vocab',
      desc: 'Bilingual and visual paired memory cards designed with clear borders for two-sided printing.',
      grade: 'All Grades',
      sampleTopic: 'Elementary Spanish & Geometry Angles',
      icon: Layers,
      badge: 'Print-Ready Grid',
    },
    {
      title: 'Educational Posters',
      desc: 'High-resolution diagrammatic infographics and charts structured for classroom wall displays.',
      grade: 'Grades 4–12',
      sampleTopic: 'The Water Cycle & Ecosystem Food Web',
      icon: FileText,
      badge: '300 DPI Vector-Clean',
    },
    {
      title: 'Learning Illustrations',
      desc: 'Step-by-step explanatory visual modules depicting historical events, lab safety, and math models.',
      grade: 'Grades 6–12',
      sampleTopic: 'Volcano Cross-Section & Plate Tectonics',
      icon: BookOpen,
      badge: 'Curriculum Aligned',
    },
  ];

  const benefits = [
    {
      title: 'Purpose-Aware AI Model Selection',
      desc: 'Dynamically routes prompts to the ideal model (Imagen 3, Gemini 3 Flash, or SDXL Turbo) based on required visual style and pedagogical criteria.',
      icon: Cpu,
    },
    {
      title: 'Cost-Conscious Image Generation',
      desc: 'Intelligent prompt token pruning and efficient model routing saves districts up to 38.4% on AI inference expenditures.',
      icon: TrendingDown,
    },
    {
      title: 'Classroom Quality & Safety Validation',
      desc: 'Automated multi-stage curriculum moderation flags ambiguous prompts, hallucinated diagrams, and verifies age appropriateness.',
      icon: ShieldCheck,
    },
    {
      title: 'Multiple Educational Output Formats',
      desc: 'Export directly to single-sheet coloring sheets, print-ready 4x6 flashcard grids, wall posters, or transparent PNGs.',
      icon: Download,
    },
  ];

  const steps = [
    {
      step: '01',
      title: 'Enter Lesson Topic & Standard',
      desc: 'Type your curriculum prompt or standard (e.g. "Create a labeled plant cell coloring sheet for 4th grade biology").',
    },
    {
      step: '02',
      title: 'Automated Model Routing & Cost Check',
      desc: 'EduGenAI evaluates the prompt complexity and chooses the most cost-effective and accurate image engine.',
    },
    {
      step: '03',
      title: 'Classroom Guardrails & Review',
      desc: 'Built-in K-12 safety guardrails inspect the generated illustration for pedagogical clarity and age appropriateness.',
    },
    {
      step: '04',
      title: 'Export & Teach',
      desc: 'Download instant high-resolution PDFs or image files ready for classroom printing or digital LMS distribution.',
    },
  ];

  return (
    <div className="min-h-screen bg-surface-canvas flex flex-col font-sans">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden border-b border-border bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-pill bg-brand-tint border border-brand/20 text-brand text-xs font-semibold mb-6 animate-fade-in">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Built on Google Stitch Design System · K-12 Visual Engine</span>
          </div>

          {/* Master Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-ink-heading tracking-tight max-w-4xl mx-auto font-heading leading-tight">
            Turn Any Learning Topic Into a{' '}
            <span className="text-brand">Visual Experience</span>
          </h1>

          {/* Master Supporting Text */}
          <p className="text-base sm:text-lg md:text-xl text-ink-body max-w-2xl mx-auto mt-6 leading-relaxed">
            Generate engaging colouring worksheets, flashcards, educational posters, and classroom learning materials with AI — designed for teachers and students.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Button
              variant="primary"
              size="lg"
              iconRight={ArrowRight}
              onClick={() => navigate('/signup')}
              className="w-full sm:w-auto shadow-md"
            >
              Start Creating Free
            </Button>
            <a href="#examples" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full">
                Explore Examples
              </Button>
            </a>
          </div>

          {/* Guardrails Callout */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <GuardrailBadge level="k-5" />
            <GuardrailBadge level="middle" />
            <GuardrailBadge level="high" />
            <GuardrailBadge level="ferpa" />
          </div>

          {/* Studio UI Preview Mockup */}
          <div className="mt-14 max-w-5xl mx-auto rounded-xl border border-border shadow-level-3 overflow-hidden bg-white text-left">
            <div className="h-10 bg-surface-canvas border-b border-border px-4 flex items-center justify-between text-xs text-ink-muted">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="ml-2 font-medium text-ink-heading font-heading">
                  EduGenAI Generation Studio · Live Preview
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-status-success-bg text-status-success font-semibold text-[10px] border border-status-success-border">
                  Auto Smart-Route Active
                </span>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 bg-surface-canvas/30">
              {/* Studio Left Input Mockup */}
              <div className="md:col-span-5 space-y-4">
                <div className="bg-white p-4 rounded-lg border border-border shadow-level-1">
                  <div className="text-xs font-bold text-ink-heading uppercase tracking-wider mb-2 font-heading">
                    Curriculum Prompt
                  </div>
                  <div className="p-3 bg-surface-canvas rounded border border-border text-xs text-ink-heading font-mono leading-relaxed">
                    "Draw an outline colouring worksheet showing the water cycle with precipitation, condensation, and evaporation labeled for 3rd grade science."
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[11px] text-ink-muted">
                    <span>Est. Cost: <strong className="text-status-success">$0.0032</strong></span>
                    <span>Tokens: <strong className="text-ink-heading">142</strong></span>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-border shadow-level-1 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-ink-muted">Format:</span>
                    <span className="font-semibold text-ink-heading">Colouring Worksheet</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-ink-muted">Target Level:</span>
                    <span className="font-semibold text-emerald-600">Grade 3 (K-5 Safe)</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-ink-muted">Model Chosen:</span>
                    <span className="font-semibold text-brand">Imagen 3 Fast (Line-Art)</span>
                  </div>
                </div>
              </div>

              {/* Studio Right Preview Mockup */}
              <div className="md:col-span-7 bg-white p-5 rounded-lg border border-border shadow-level-1 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-ink-heading">Water Cycle Diagram</span>
                    <span className="px-2 py-0.5 rounded-pill text-[10px] bg-status-success-bg text-status-success font-semibold border border-status-success-border">
                      Verified Safe
                    </span>
                  </div>
                  <span className="text-[11px] text-ink-muted tabular-nums">2048 x 2048 · PNG</span>
                </div>

                {/* SVG Visual Representation */}
                <div className="h-56 bg-surface-canvas rounded-lg border border-dashed border-border flex flex-col items-center justify-center p-4 text-center">
                  <div className="w-16 h-16 rounded-full bg-brand-tint flex items-center justify-center text-brand mb-2">
                    <Palette className="w-8 h-8" />
                  </div>
                  <div className="text-xs font-semibold text-ink-heading font-heading">
                    The Water Cycle — Printable Classroom Outline
                  </div>
                  <div className="text-[11px] text-ink-muted mt-1 max-w-xs">
                    Features clouds, rain arrows, ocean evaporation, and mountain snowmelt ready for student coloring.
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between pt-3 border-t border-border">
                  <span className="text-xs text-status-success font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Quality Review Passed
                  </span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Edit Parameters</Button>
                    <Button variant="primary" size="sm" icon={Download}>Download Sheet</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Educational Content Categories Section */}
      <section id="examples" className="py-20 bg-surface-canvas border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl font-bold text-ink-heading font-heading tracking-tight">
              Four Core Educational Output Formats
            </h2>
            <p className="text-sm text-ink-body mt-3">
              Generate structured, standards-compliant learning materials without generic stock images or messy prompts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((c) => {
              const Icon = c.icon;
              return (
                <Card key={c.title} className="hover:shadow-level-2 transition-shadow flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-lg bg-brand-tint text-brand flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h3 className="text-base font-semibold text-ink-heading font-heading">
                        {c.title}
                      </h3>
                    </div>
                    <p className="text-xs text-ink-body leading-relaxed mb-4">
                      {c.desc}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-border space-y-2 text-xs">
                    <div className="flex items-center justify-between text-ink-muted">
                      <span>Target:</span>
                      <span className="font-semibold text-ink-heading">{c.grade}</span>
                    </div>
                    <div className="flex items-center justify-between text-ink-muted">
                      <span>Sample:</span>
                      <span className="font-medium text-brand truncate max-w-[140px]">{c.sampleTopic}</span>
                    </div>
                    <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 bg-surface-canvas rounded text-ink-muted border border-border">
                      {c.badge}
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Product Benefits Section */}
      <section id="benefits" className="py-20 bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl font-bold text-ink-heading font-heading tracking-tight">
              Engineered Specifically for Classrooms and Districts
            </h2>
            <p className="text-sm text-ink-body mt-3">
              EduGenAI combines high pedagogical standards with institutional cost control.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {benefits.map((b) => {
              const Icon = b.icon;
              return (
                <div
                  key={b.title}
                  className="p-6 rounded-lg border border-border bg-surface-canvas/40 flex items-start gap-4 hover:bg-white hover:shadow-level-1 transition-all"
                >
                  <div className="w-10 h-10 rounded-lg bg-brand text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-ink-heading font-heading mb-1.5">
                      {b.title}
                    </h3>
                    <p className="text-xs text-ink-body leading-relaxed">
                      {b.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-surface-canvas border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl font-bold text-ink-heading font-heading tracking-tight">
              How EduGenAI Works
            </h2>
            <p className="text-sm text-ink-body mt-3">
              A frictionless workflow from lesson planning to printed classroom handouts.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s) => (
              <div key={s.step} className="bg-white p-6 rounded-lg border border-border relative shadow-level-1">
                <span className="text-3xl font-extrabold text-brand/20 font-heading block mb-2">
                  {s.step}
                </span>
                <h3 className="text-sm font-semibold text-ink-heading font-heading mb-2">
                  {s.title}
                </h3>
                <p className="text-xs text-ink-body leading-relaxed">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final Call to Action Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center bg-brand-tint border border-brand/20 rounded-xl p-10 shadow-level-2">
          <h2 className="text-3xl font-extrabold text-ink-heading font-heading tracking-tight">
            Ready to Transform Your Teaching Materials?
          </h2>
          <p className="text-sm text-ink-body mt-3 max-w-xl mx-auto">
            Join curriculum leads, district educators, and STEM teachers building custom classroom visuals with automated cost control and age guardrails.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              variant="primary"
              size="lg"
              iconRight={ArrowRight}
              onClick={() => navigate('/signup')}
              className="shadow-md"
            >
              Start Creating Free
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/login')}
            >
              Sign In to Existing Account
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
