import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import AppLayout from './layouts/AppLayout';
import ErrorBoundary from './components/ErrorBoundary';

const HomePage = lazy(() => import('./pages/HomePage'));
const HowToUsePage = lazy(() => import('./pages/HowToUsePage'));
const NavigatePage = lazy(() => import('./pages/NavigatePage'));
const CanteenPage = lazy(() => import('./pages/CanteenPage'));
const FeedbackPage = lazy(() => import('./pages/FeedbackPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const LocationDetailPage = lazy(() => import('./pages/LocationDetailPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const EmergencyContactsPage = lazy(() => import('./pages/EmergencyContactsPage'));

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ErrorBoundary>
          <AppLayout>
            <Suspense fallback={<div className="section-container py-20 text-center text-foreground-muted">Loading page…</div>}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/how-to-use" element={<HowToUsePage />} />
                <Route path="/navigate" element={<NavigatePage />} />
                <Route path="/map-search" element={<Navigate to="/navigate" replace />} />
                <Route path="/canteen" element={<CanteenPage />} />
                <Route path="/feedback" element={<FeedbackPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/locations/:id" element={<LocationDetailPage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/emergency-contacts" element={<EmergencyContactsPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
            <Toaster
              position="top-right"
              toastOptions={{
                className: 'toast-surface !border !shadow-elevated',
              }}
            />
          </AppLayout>
        </ErrorBoundary>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
