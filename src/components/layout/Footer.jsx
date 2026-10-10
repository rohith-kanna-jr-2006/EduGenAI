import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, ShieldCheck, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="md:col-span-1 space-y-3">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center text-white">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="text-base font-bold text-ink-heading font-heading">
                EduGenAI
              </span>
            </Link>
            <p className="text-xs text-ink-muted leading-relaxed">
              Purpose-aware educational visual generation platform engineered for K-12 educators, schools, and academic districts.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 w-fit">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>FERPA & COPPA Aligned</span>
            </div>
          </div>

          {/* Educational Formats */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-ink-heading font-heading mb-3">
              Output Formats
            </h4>
            <ul className="space-y-2 text-xs text-ink-body">
              <li>Colouring Worksheets</li>
              <li>Flashcards & Vocab Cards</li>
              <li>Educational Infographic Posters</li>
              <li>Curriculum Illustrations</li>
              <li>STEM Diagram Modules</li>
            </ul>
          </div>

          {/* Platform & Governance */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-ink-heading font-heading mb-3">
              Platform & Control
            </h4>
            <ul className="space-y-2 text-xs text-ink-body">
              <li><Link to="/app/routing-rules" className="hover:text-brand">Smart Model Router</Link></li>
              <li><Link to="/app/models" className="hover:text-brand">Model Cost Benchmark</Link></li>
              <li><Link to="/app/budget" className="hover:text-brand">District Token Allocator</Link></li>
              <li><Link to="/app/quality-review" className="hover:text-brand">Safety Moderation Engine</Link></li>
              <li><Link to="/app/analytics" className="hover:text-brand">Cost Analytics</Link></li>
            </ul>
          </div>

          {/* Quick Access */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-ink-heading font-heading mb-3">
              Get Started
            </h4>
            <ul className="space-y-2 text-xs text-ink-body">
              <li><Link to="/login" className="hover:text-brand">Teacher Login</Link></li>
              <li><Link to="/signup" className="hover:text-brand">Create District Account</Link></li>
              <li><Link to="/app/studio" className="hover:text-brand">Launch Generation Studio</Link></li>
              <li><Link to="/app/settings" className="hover:text-brand">Privacy Policy & Terms</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="border-t border-border mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-ink-muted gap-4">
          <div>
            © {new Date().getFullYear()} EduGenAI Studio. Built with Google Stitch Design System. All rights reserved.
          </div>
          <div className="flex items-center gap-1">
            Engineered for educators and students worldwide.
          </div>
        </div>
      </div>
    </footer>
  );
};
