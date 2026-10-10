import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Menu, X, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-border transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-brand flex items-center justify-center text-white shadow-sm">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-bold text-ink-heading font-heading tracking-tight">
              EduGenAI
            </span>
            <span className="text-[10px] ml-1.5 font-semibold px-1.5 py-0.5 rounded bg-brand-tint text-brand border border-brand/20">
              STUDIO
            </span>
          </div>
        </Link>

        {/* Desktop Nav Items */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-ink-body">
          <a href="#features" className="hover:text-brand transition-colors">
            Features
          </a>
          <a href="#examples" className="hover:text-brand transition-colors">
            Classroom Examples
          </a>
          <a href="#how-it-works" className="hover:text-brand transition-colors">
            How It Works
          </a>
          <a href="#benefits" className="hover:text-brand transition-colors">
            Why EduGenAI
          </a>
        </nav>

        {/* Right Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <Button
              variant="primary"
              size="sm"
              iconRight={ArrowRight}
              onClick={() => navigate('/app/overview')}
            >
              Go to Studio
            </Button>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-ink-heading hover:text-brand px-3 py-2 rounded-md transition-colors"
              >
                Sign In
              </Link>
              <Button
                variant="primary"
                size="sm"
                iconRight={Sparkles}
                onClick={() => navigate('/signup')}
              >
                Get Started Free
              </Button>
            </>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-md text-ink-muted hover:text-ink-heading md:hidden"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-white px-4 pt-2 pb-6 space-y-3 animate-fade-in">
          <a
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium py-2 text-ink-heading"
          >
            Features
          </a>
          <a
            href="#examples"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium py-2 text-ink-heading"
          >
            Classroom Examples
          </a>
          <a
            href="#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium py-2 text-ink-heading"
          >
            How It Works
          </a>
          <a
            href="#benefits"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium py-2 text-ink-heading"
          >
            Why EduGenAI
          </a>
          <div className="pt-3 border-t border-border flex flex-col gap-2">
            {isAuthenticated ? (
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/app/overview');
                }}
              >
                Go to Studio
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/login');
                  }}
                >
                  Sign In
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/signup');
                  }}
                >
                  Get Started Free
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
