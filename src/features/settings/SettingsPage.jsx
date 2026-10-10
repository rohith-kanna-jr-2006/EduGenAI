import React, { useState } from 'react';
import {
  User,
  ShieldCheck,
  Bell,
  Key,
  Save,
  CheckCircle2,
  LogOut,
  Building2,
  Lock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Checkbox } from '../../components/common/Checkbox';

export const SettingsPage = () => {
  const { user, updateProfile, logout } = useAuth();
  const { success, error: notifyError } = useNotification();

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'guardrails' | 'api' | 'notifications'
  const [loading, setLoading] = useState(false);

  // Profile State
  const [profileData, setProfileData] = useState({
    name: user?.name || 'Eleanor Vance',
    email: user?.email || 'eleanor.vance@lincoln.edu',
    role: user?.role || 'Curriculum Director',
    district: user?.district || 'Lincoln School District',
  });

  // Guardrails State
  const [guardrailData, setGuardrailData] = useState({
    defaultGradeFilter: 'Grade 5 (Elementary)',
    strictProfanityCheck: true,
    blockNonPedagogicalPrompts: true,
    ferpaComplianceLock: true,
  });

  // Notification State
  const [notifyData, setNotifyData] = useState({
    notifyBatchCompletion: true,
    notifyBudgetThreshold80: true,
    notifyQualityReviewQueue: true,
  });

  // API Configuration State
  const [apiKeys, setApiKeys] = useState({
    googleStitchKey: '••••••••••••••••••••••••••••••••',
    imagenApiKey: '••••••••••••••••••••••••••••••••',
  });

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      updateProfile(profileData);
      setLoading(false);
      success('Educator profile updated successfully');
    }, 600);
  };

  const handleSaveGuardrails = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      success('Classroom guardrails & safety policies updated');
    }, 600);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title */}
      <div className="pb-2 border-b border-border">
        <h1 className="text-2xl font-bold text-ink-heading font-heading">
          Settings & Institutional Governance
        </h1>
        <p className="text-xs text-ink-muted">
          Manage your educator profile, classroom safety parameters, and district model keys.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-3">
        {[
          { id: 'profile', label: 'Educator Profile', icon: User },
          { id: 'guardrails', label: 'Safety & Guardrails', icon: ShieldCheck },
          { id: 'notifications', label: 'Notifications & Alerts', icon: Bell },
          { id: 'api', label: 'Model API Keys', icon: Key },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-brand text-white shadow-xs font-semibold'
                  : 'bg-white text-ink-body hover:bg-surface-hover hover:text-ink-heading border border-border'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <Card title="Profile & District Affiliation" subtitle="Your institutional credentials and academic title">
          <form onSubmit={handleSaveProfile} className="space-y-4 max-w-xl">
            <Input
              label="Full Name"
              value={profileData.name}
              onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
            />
            <Input
              label="Verified School Email"
              type="email"
              value={profileData.email}
              disabled
              helperText="Managed by your district's single-sign on administrator."
            />
            <Input
              label="Academic Role / Title"
              value={profileData.role}
              onChange={(e) => setProfileData({ ...profileData, role: e.target.value })}
            />
            <Input
              label="School or District Name"
              value={profileData.district}
              onChange={(e) => setProfileData({ ...profileData, district: e.target.value })}
            />

            <div className="pt-3 flex gap-3">
              <Button type="submit" variant="primary" size="md" loading={loading} icon={Save}>
                Save Changes
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Guardrails Tab */}
      {activeTab === 'guardrails' && (
        <Card title="Classroom Safety & Policy Guardrails" subtitle="Enforce FERPA, COPPA, and age-appropriate content filters">
          <form onSubmit={handleSaveGuardrails} className="space-y-5 max-w-xl">
            <Select
              label="Default Grade Level Filter"
              options={[
                { value: 'Pre-K - Kindergarten', label: 'Pre-K - Kindergarten (High-Contrast Outlines)' },
                { value: 'Grade 1-2', label: 'Grade 1-2 (Early Primary)' },
                { value: 'Grade 5 (Elementary)', label: 'Grade 3-5 (Elementary General)' },
                { value: 'Grade 6-8', label: 'Grade 6-8 (Middle School STEM)' },
                { value: 'Grade 9-12', label: 'Grade 9-12 (High School Advanced)' },
              ]}
              value={guardrailData.defaultGradeFilter}
              onChange={(e) => setGuardrailData({ ...guardrailData, defaultGradeFilter: e.target.value })}
            />

            <div className="space-y-3 pt-2">
              <Checkbox
                checked={guardrailData.strictProfanityCheck}
                onChange={(val) => setGuardrailData({ ...guardrailData, strictProfanityCheck: val })}
                label="Strict K-12 Vocabulary Guardrail"
                description="Immediately drops non-pedagogical words, sensitive terms, or adult concepts before model routing."
              />

              <Checkbox
                checked={guardrailData.blockNonPedagogicalPrompts}
                onChange={(val) => setGuardrailData({ ...guardrailData, blockNonPedagogicalPrompts: val })}
                label="Block Entertainment & Non-Educational Generation"
                description="Ensures tokens are strictly applied to curriculum worksheets, flashcards, posters, and diagrams."
              />

              <Checkbox
                checked={guardrailData.ferpaComplianceLock}
                onChange={(val) => setGuardrailData({ ...guardrailData, ferpaComplianceLock: val })}
                label="FERPA & Student Privacy Data Redaction"
                description="Never includes student names or personal identifying information in inference prompts."
              />
            </div>

            <div className="pt-3">
              <Button type="submit" variant="primary" size="md" loading={loading} icon={Save}>
                Update Safety Guardrails
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <Card title="Notification & Alert Thresholds" subtitle="Configure automated alerts for batch jobs and budget limits">
          <div className="space-y-4 max-w-xl text-xs">
            <Checkbox
              checked={notifyData.notifyBatchCompletion}
              onChange={(val) => setNotifyData({ ...notifyData, notifyBatchCompletion: val })}
              label="Visual Synthesis Completion Alert"
              description="Receive in-app notification when multi-image worksheet batches complete rendering."
            />

            <Checkbox
              checked={notifyData.notifyBudgetThreshold80}
              onChange={(val) => setNotifyData({ ...notifyData, notifyBudgetThreshold80: val })}
              label="80% Token Quota Warning"
              description="Alert curriculum leads when department token usage exceeds 80% of quarterly allocation."
            />

            <Checkbox
              checked={notifyData.notifyQualityReviewQueue}
              onChange={(val) => setNotifyData({ ...notifyData, notifyQualityReviewQueue: val })}
              label="Quality Review Queue Notification"
              description="Notify when diagrams or flashcards are flagged for teacher safety confirmation."
            />

            <div className="pt-3">
              <Button
                variant="primary"
                size="md"
                onClick={() => success('Notification preferences saved')}
              >
                Save Notification Settings
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* API Keys Tab */}
      {activeTab === 'api' && (
        <Card title="Model Provider & MCP Credentials" subtitle="Active district API keys connecting to Google Stitch and inference models">
          <div className="space-y-4 max-w-xl text-xs">
            <Input
              label="Google Stitch MCP Integration Key"
              type="password"
              value={apiKeys.googleStitchKey}
              disabled
              helperText="Active in global mcp_config.json configuration."
            />

            <Input
              label="Google Cloud Vertex / Imagen API Key"
              type="password"
              value={apiKeys.imagenApiKey}
              disabled
              helperText="Managed by district IT department via environment variables."
            />

            <div className="p-3 bg-surface-canvas rounded-md border border-border text-ink-muted">
              API credentials are kept server-side in accordance with district security requirements. To update district credentials, contact your IT Administrator.
            </div>
          </div>
        </Card>
      )}

      {/* Session Sign Out */}
      <Card title="Session & Account Management" className="border-red-200">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-ink-heading">Sign Out of Workspace</div>
            <p className="text-xs text-ink-muted mt-0.5">
              Securely end your active educator session on this computer.
            </p>
          </div>
          <Button
            variant="destructive"
            size="sm"
            icon={LogOut}
            onClick={() => {
              logout();
              window.location.href = '/login';
            }}
          >
            Sign Out
          </Button>
        </div>
      </Card>
    </div>
  );
};
