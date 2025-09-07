import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import LoadingSpinner from './components/LoadingSpinner';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import StoreOwnerDashboard from './pages/StoreOwnerDashboard';
import StoreListPage from './pages/StoreListPage';
import './styles/globals.css';

// Protected route component
const ProtectedRoute = ({ children, roles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (roles.length > 0 && !roles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return children;
};

// Public route component (only for non-authenticated users)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

// Dashboard redirect component
const DashboardRedirect = () => {
  const { user } = useAuth();
  
  switch (user?.role) {
    case 'admin':
      return <Navigate to="/admin/dashboard" replace />;
    case 'storeOwner':
      return <Navigate to="/store/dashboard" replace />;
    case 'user':
      return <Navigate to="/user/dashboard" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

// Unauthorized page
const UnauthorizedPage = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="card text-center max-w-md">
      <h1 className="text-2xl font-bold text-neon-blue mb-4">Access Denied</h1>
      <p className="text-text-secondary mb-6">
        You don't have permission to access this page.
      </p>
      <button 
        onClick={() => window.history.back()}
        className="btn btn-primary"
      >
        Go Back
      </button>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen">
          <Navbar />
          <main className="pt-16">
            <Routes>
              {/* Public routes */}
              <Route 
                path="/login" 
                element={
                  <PublicRoute>
                    <LoginPage />
                  </PublicRoute>
                } 
              />
              <Route 
                path="/register" 
                element={
                  <PublicRoute>
                    <RegisterPage />
                  </PublicRoute>
                } 
              />
              
              {/* Protected routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <DashboardRedirect />
                  </ProtectedRoute>
                } 
              />
              
              {/* Admin routes */}
              <Route 
                path="/admin/dashboard" 
                element={
                  <ProtectedRoute roles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              
              {/* User routes */}
              <Route 
                path="/user/dashboard" 
                element={
                  <ProtectedRoute roles={['user']}>
                    <UserDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/stores" 
                element={
                  <ProtectedRoute roles={['user']}>
                    <StoreListPage />
                  </ProtectedRoute>
                } 
              />
              
              {/* Store Owner routes */}
              <Route 
                path="/store/dashboard" 
                element={
                  <ProtectedRoute roles={['storeOwner']}>
                    <StoreOwnerDashboard />
                  </ProtectedRoute>
                } 
              />
              
              {/* Misc routes */}
              <Route path="/unauthorized" element={<UnauthorizedPage />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              
              {/* 404 route */}
              <Route 
                path="*" 
                element={
                  <div className="min-h-screen flex items-center justify-center">
                    <div className="card text-center max-w-md">
                      <h1 className="text-2xl font-bold text-neon-blue mb-4">404 - Page Not Found</h1>
                      <p className="text-text-secondary mb-6">
                        The page you're looking for doesn't exist.
                      </p>
                      <a href="/dashboard" className="btn btn-primary">
                        Go to Dashboard
                      </a>
                    </div>
                  </div>
                } 
              />
            </Routes>
          </main>
          
          {/* Toast notifications */}
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
                borderRadius: '12px'
              },
              success: {
                iconTheme: {
                  primary: '#00ff88',
                  secondary: '#ffffff'
                }
              },
              error: {
                iconTheme: {
                  primary: '#ff006e',
                  secondary: '#ffffff'
                }
              }
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
