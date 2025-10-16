import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { tokenManager } from './services/tokenManager';
import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Analysis from './pages/Analysis';
import Reports from './pages/Reports';
import ReportDetail from './pages/ReportDetail';
import ReportView from './pages/ReportView';
import Schedules from './pages/Schedules';
import Settings from './pages/Settings';

const App: React.FC = () => {
  const { isAuthenticated, fetchCurrentUser, loading } = useAuth();

  useEffect(() => {
    // Initialize token manager with token from localStorage
    const token = localStorage.getItem('token');
    if (token) {
      tokenManager.setToken(token);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCurrentUser();
    }
  }, [isAuthenticated, fetchCurrentUser]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <Routes>
        {/* Public routes */}
        <Route 
          path="/login" 
          element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" replace />} 
        />
        <Route 
          path="/register" 
          element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" replace />} 
        />
        
        {/* Protected routes */}
        <Route 
          path="/*" 
          element={
            isAuthenticated ? (
              <Layout>
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/analysis" element={<Analysis />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/reports/:id" element={<ReportDetail />} />
                  <Route path="/report/:id" element={<ReportView />} />
                  <Route path="/schedules" element={<Schedules />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
      </Routes>
    </div>
  );
};

export default App;
