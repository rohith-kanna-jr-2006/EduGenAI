import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Wand2,
  History,
  CheckCircle,
  Network,
  Cpu,
  Wallet,
  BarChart3,
  Settings,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const navSections = [
    {
      title: 'Workspace',
      items: [
        { label: 'Overview', to: '/app/overview', icon: LayoutDashboard },
        { label: 'Generation Studio', to: '/app/studio', icon: Wand2, highlight: true },
        { label: 'Generation History', to: '/app/history', icon: History },
        { label: 'Quality Review', to: '/app/quality-review', icon: CheckCircle, badge: '3' },
      ],
    },
    {
      title: 'Control Center',
      items: [
        { label: 'Routing Rules', to: '/app/routing-rules', icon: Network },
        { label: 'Model Library', to: '/app/models', icon: Cpu },
        { label: 'Budget & Usage', to: '/app/budget', icon: Wallet },
        { label: 'Cost Analytics', to: '/app/analytics', icon: BarChart3 },
      ],
    },
    {
      title: 'Preferences',
      items: [
        { label: 'Settings', to: '/app/settings', icon: Settings },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-[#1A1F36]/30 z-30 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* 246px Fixed Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-[246px] bg-white border-r border-border flex flex-col transition-transform duration-200 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-[60px] px-5 flex items-center justify-between border-b border-border">
          <NavLink to="/app/overview" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center text-white shadow-sm">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-bold text-ink-heading tracking-tight leading-none font-heading flex items-center gap-1.5">
                EduGenAI
                <span className="text-[10px] font-semibold px-1.5 py-0.2 bg-brand-tint text-brand rounded border border-brand/20">
                  STUDIO
                </span>
              </div>
              <div className="text-[11px] text-ink-muted leading-tight mt-0.5">
                K-12 Visual Engine
              </div>
            </div>
          </NavLink>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navSections.map((section) => (
            <div key={section.title}>
              <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-ink-muted mb-2 font-heading">
                {section.title}
              </div>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-all group ${
                          isActive
                            ? 'bg-brand-tint text-brand font-semibold shadow-xs'
                            : 'text-ink-body hover:bg-surface-hover hover:text-ink-heading'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <div className="flex items-center gap-2.5">
                            <Icon
                              className={`w-4 h-4 transition-colors ${
                                isActive ? 'text-brand' : 'text-ink-muted group-hover:text-ink-heading'
                              }`}
                            />
                            <span>{item.label}</span>
                          </div>
                          {item.badge && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                              {item.badge}
                            </span>
                          )}
                          {item.highlight && !isActive && (
                            <Sparkles className="w-3 h-3 text-brand opacity-60" />
                          )}
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Safety & Compliance Badge Footer */}
        <div className="p-3 border-t border-border bg-surface-canvas/40 m-2 rounded-lg">
          <div className="flex items-center gap-2 text-xs font-semibold text-ink-heading">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Curriculum Safe</span>
          </div>
          <p className="text-[11px] text-ink-muted mt-1 leading-snug">
            Guardrails active for K-12 classroom standards & COPPA.
          </p>
        </div>
      </aside>
    </>
  );
};
