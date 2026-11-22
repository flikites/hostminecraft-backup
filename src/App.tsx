import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { ToastProvider } from './components/ui/Toast';
import { AuthProviderWrapper, useAuth } from './hooks/useAuth';
import { ScrollToTop } from './components/ScrollToTop';
import { NetworkStatus } from './components/ui/NetworkStatus';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { HomePageOriginal } from './pages/HomePageOriginal';
import { HomePage2 } from './pages/HomePage2';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { BillingPage } from './pages/BillingPage';
import { SuccessPage } from './pages/SuccessPage';
import { PasswordResetPage } from './pages/PasswordResetPage';
import { PasswordChangePage } from './pages/PasswordChangePage';
import { SettingsPage } from './pages/SettingsPage';
import { DocumentationPage } from './pages/DocumentationPage';
import { FAQPage } from './pages/FAQPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-grass-50 to-dirt-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
}

function PersonalizedLandingPage() {
  const { subdomainPrefix } = useParams<{ subdomainPrefix: string }>();
  return <HomePage prefilledSubdomain={subdomainPrefix} />;
}
function AppContent() {
  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      <NetworkStatus />
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/start/:subdomainPrefix" element={<PersonalizedLandingPage />} />
          <Route path="/original" element={<HomePageOriginal />} />
          <Route path="/home2" element={<HomePage2 />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/password-reset" element={<PasswordResetPage />} />
          <Route path="/password-change" element={<PasswordChangePage />} />
          <Route path="/docs" element={<DocumentationPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing"
            element={
              <ProtectedRoute>
                <BillingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProviderWrapper>
        <ToastProvider>
        <AppContent />
        </ToastProvider>
      </AuthProviderWrapper>
    </Router>
  );
}

export default App;