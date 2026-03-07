import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import RiderDashboard from './pages/RiderDashboard';
import DriverDashboard from './pages/DriverDashboard';
import RideTrackingPage from './pages/RideTrackingPage';
import RideHistoryPage from './pages/RideHistoryPage';
import { useAuth } from './context/AuthContext';

function AppRoutes() {
  const { isAuthenticated, isRider, isDriver } = useAuth();

  return (
    <>
      <Navbar />
      <Routes>
        {/* Public routes */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to={isRider ? '/rider/dashboard' : '/driver/dashboard'} replace />
            ) : (
              <LandingPage />
            )
          }
        />
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to={isRider ? '/rider/dashboard' : '/driver/dashboard'} replace />
            ) : (
              <LoginPage />
            )
          }
        />
        <Route
          path="/register"
          element={
            isAuthenticated ? (
              <Navigate to={isRider ? '/rider/dashboard' : '/driver/dashboard'} replace />
            ) : (
              <RegisterPage />
            )
          }
        />

        {/* Rider routes */}
        <Route
          path="/rider/dashboard"
          element={
            <ProtectedRoute role="RIDER">
              <RiderDashboard />
            </ProtectedRoute>
          }
        />

        {/* Driver routes */}
        <Route
          path="/driver/dashboard"
          element={
            <ProtectedRoute role="DRIVER">
              <DriverDashboard />
            </ProtectedRoute>
          }
        />

        {/* Shared routes */}
        <Route
          path="/ride/tracking"
          element={
            <ProtectedRoute>
              <RideTrackingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/rider/history"
          element={
            <ProtectedRoute>
              <RideHistoryPage />
            </ProtectedRoute>
          }
        />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1c2333',
            color: '#f9fafb',
            border: '1px solid #374151',
            borderRadius: '12px',
          },
          success: {
            iconTheme: { primary: '#f88a0b', secondary: '#fff' },
          },
        }}
      />
      <AppRoutes />
    </Router>
  );
}

export default App;
