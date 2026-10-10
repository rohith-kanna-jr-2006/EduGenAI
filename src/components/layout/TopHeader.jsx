import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Building2,
  Bell,
  ChevronDown,
  User,
  LogOut,
  Settings as SettingsIcon,
  Menu,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

export const TopHeader = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { info } = useNotification();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [districtOpen, setDistrictOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const profileRef = useRef(null);
  const districtRef = useRef(null);

  const districts = [
    'Lincoln Public Schools (District #4)',
    'North Valley STEM Academy',
    'Oakridge Unified District',
  ];
  const [selectedDistrict, setSelectedDistrict] = useState(districts[0]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
      if (districtRef.current && !districtRef.current.contains(e.target)) {
        setDistrictOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/app/history?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    info('Successfully signed out');
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-20 h-[60px] bg-white border-b border-border px-4 lg:px-6 flex items-center justify-between gap-4">
      {/* Left: Mobile hamburger & District Selector */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-1.5 rounded-md text-ink-muted hover:text-ink-heading hover:bg-surface-hover lg:hidden"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* District Selector Dropdown */}
        <div className="relative" ref={districtRef}>
          <button
            onClick={() => setDistrictOpen(!districtOpen)}
            className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-border hover:bg-surface-hover text-xs font-medium text-ink-heading transition-colors"
          >
            <Building2 className="w-3.5 h-3.5 text-brand" />
            <span className="max-w-[180px] truncate">{selectedDistrict}</span>
            <ChevronDown className="w-3.5 h-3.5 text-ink-muted" />
          </button>

          {districtOpen && (
            <div className="absolute left-0 mt-1.5 w-64 bg-white rounded-lg border border-border shadow-level-2 py-1 z-30 animate-fade-in">
              <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-ink-muted border-b border-border">
                Select Active District
              </div>
              {districts.map((d) => (
                <button
                  key={d}
                  onClick={() => {
                    setSelectedDistrict(d);
                    setDistrictOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-surface-hover transition-colors flex items-center justify-between ${
                    selectedDistrict === d ? 'text-brand font-semibold bg-brand-tint' : 'text-ink-body'
                  }`}
                >
                  <span>{d}</span>
                  {selectedDistrict === d && <CheckCircle2 className="w-3.5 h-3.5 text-brand" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Center: Global Prompt & Asset Search */}
      <div className="flex-1 max-w-md hidden md:block">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-ink-muted pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search generated worksheets, prompts, or model rules..."
            className="w-full bg-surface-canvas text-xs rounded-md border border-border pl-9 pr-4 py-2 placeholder:text-ink-muted outline-none focus:bg-white focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all"
          />
        </form>
      </div>

      {/* Right: Operational Status, Quick Studio CTA, Notification, User Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Real-time Status Badge */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-pill bg-status-success-bg border border-status-success-border text-[11px] font-medium text-status-success">
          <span className="w-1.5 h-1.5 rounded-full bg-status-success animate-pulse" />
          <span>Operational · 99.98%</span>
        </div>

        {/* Quick Studio CTA */}
        <button
          onClick={() => navigate('/app/studio')}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand text-white rounded-md text-xs font-semibold hover:bg-brand-hover shadow-xs transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>New Visual</span>
        </button>

        {/* Notifications */}
        <button
          onClick={() => navigate('/app/quality-review')}
          className="relative p-2 rounded-md text-ink-muted hover:text-ink-heading hover:bg-surface-hover transition-colors"
          title="Notifications & Reviews"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500" />
        </button>

        {/* User Profile Menu */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 p-1.5 rounded-md hover:bg-surface-hover border border-transparent hover:border-border transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-brand-tint text-brand border border-brand/20 flex items-center justify-center font-bold text-xs">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'E'}
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-semibold text-ink-heading leading-tight truncate max-w-[120px]">
                {user?.name || 'Educator'}
              </div>
              <div className="text-[10px] text-ink-muted leading-tight">
                {user?.role || 'Curriculum Lead'}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-ink-muted hidden sm:block" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-1.5 w-56 bg-white rounded-lg border border-border shadow-level-2 py-1 z-30 animate-fade-in">
              <div className="px-4 py-2.5 border-b border-border bg-surface-canvas/50">
                <div className="text-xs font-bold text-ink-heading">{user?.name || 'Educator'}</div>
                <div className="text-[11px] text-ink-muted truncate">{user?.email || 'educator@district.edu'}</div>
              </div>
              <button
                onClick={() => {
                  setProfileOpen(false);
                  navigate('/app/settings');
                }}
                className="w-full text-left px-4 py-2 text-xs text-ink-body hover:bg-surface-hover hover:text-ink-heading transition-colors flex items-center gap-2"
              >
                <User className="w-4 h-4 text-ink-muted" />
                <span>Account Profile</span>
              </button>
              <button
                onClick={() => {
                  setProfileOpen(false);
                  navigate('/app/settings');
                }}
                className="w-full text-left px-4 py-2 text-xs text-ink-body hover:bg-surface-hover hover:text-ink-heading transition-colors flex items-center gap-2"
              >
                <SettingsIcon className="w-4 h-4 text-ink-muted" />
                <span>Platform Settings</span>
              </button>
              <div className="border-t border-border my-1" />
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-xs text-status-danger hover:bg-status-danger-bg transition-colors flex items-center gap-2 font-medium"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
