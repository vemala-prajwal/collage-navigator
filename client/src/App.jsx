import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import LocationDetailPage from './pages/LocationDetailPage';
import CanteenPage from './pages/CanteenPage';
import MapSearchPage from './pages/MapSearchPage';
import AdminPage from './pages/AdminPage';
import EmergencyContactsPage from './pages/EmergencyContactsPage';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ErrorBoundary>
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/map-search" element={<MapSearchPage />} />
              <Route path="/locations/:id" element={<LocationDetailPage />} />
              <Route path="/canteen" element={<CanteenPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/emergency-contacts" element={<EmergencyContactsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <Toaster
              position="top-right"
              toastOptions={{
                 className: 'toast-surface !border !shadow-elevated',
              }}
            />
          </Layout>
        </ErrorBoundary>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
