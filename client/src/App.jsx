import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LocationDetailPage from './pages/LocationDetailPage';
import CanteenPage from './pages/CanteenPage';
import MapSearchPage from './pages/MapSearchPage';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/map-search" element={<MapSearchPage />} />
            <Route path="/locations/:id" element={<LocationDetailPage />} />
            <Route path="/canteen" element={<CanteenPage />} />
          </Routes>
          <Toaster
            position="top-right"
            toastOptions={{
              className: '!bg-surface !text-foreground !border !border-border !shadow-elevated',
            }}
          />
        </Layout>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
