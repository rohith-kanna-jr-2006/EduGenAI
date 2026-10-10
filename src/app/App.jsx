import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { NotificationProvider } from '../context/NotificationContext';

// Layout
import { DashboardLayout } from '../components/layout/DashboardLayout';

// Public Pages
import { HomePage } from '../features/home/HomePage';
import { LoginPage } from '../features/auth/LoginPage';
import { SignupPage } from '../features/auth/SignupPage';

// Authenticated Dashboard Pages
import { OverviewPage } from '../features/overview/OverviewPage';
import { GenerationStudioPage } from '../features/generation/GenerationStudioPage';
import { HistoryPage } from '../features/history/HistoryPage';
import { QualityReviewPage } from '../features/quality-review/QualityReviewPage';
import { RoutingRulesPage } from '../features/routing-rules/RoutingRulesPage';
import { ModelLibraryPage } from '../features/models/ModelLibraryPage';
import { BudgetUsagePage } from '../features/budget/BudgetUsagePage';
import { CostAnalyticsPage } from '../features/analytics/CostAnalyticsPage';
import { SettingsPage } from '../features/settings/SettingsPage';
import { Spinner } from '../components/common/Spinner';

// Protected Route Guard
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-canvas">
        <Spinner size="lg" label="Verifying educator credentials..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            {/* Public Marketing & Authentication Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* Authenticated Application Shell */}
            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/app/overview" replace />} />
              <Route path="overview" element={<OverviewPage />} />
              <Route path="studio" element={<GenerationStudioPage />} />
              <Route path="history" element={<HistoryPage />} />
              <Route path="quality-review" element={<QualityReviewPage />} />
              <Route path="routing-rules" element={<RoutingRulesPage />} />
              <Route path="models" element={<ModelLibraryPage />} />
              <Route path="budget" element={<BudgetUsagePage />} />
              <Route path="analytics" element={<CostAnalyticsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* Catch-all Wildcard Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};
