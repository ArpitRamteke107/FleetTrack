import React from 'react';
import { Route, Routes, BrowserRouter as Router, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import { Toaster } from './components/ui/sonner';
import ScrollToTop from './components/ScrollToTop.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import OwnerDashboard from './pages/OwnerDashboard.jsx';
import DriverDashboard from './pages/DriverDashboard.jsx';
import TripLogging from './pages/TripLogging.jsx';
import FuelLogging from './pages/FuelLogging.jsx';
import VehicleManagement from './pages/VehicleManagement.jsx';
import DriverManagement from './pages/DriverManagement.jsx';
import ExpenseManagement from './pages/ExpenseManagement.jsx';
import RevenueTracking from './pages/RevenueTracking.jsx';
import ReportsPage from './pages/ReportsPage.jsx';

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          
          <Route 
            path="/owner-dashboard" 
            element={
              <ProtectedRoute requiredRole="owner">
                <OwnerDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/driver-dashboard" 
            element={
              <ProtectedRoute requiredRole="driver">
                <DriverDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/vehicles" 
            element={
              <ProtectedRoute requiredRole="owner">
                <VehicleManagement />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/drivers" 
            element={
              <ProtectedRoute requiredRole="owner">
                <DriverManagement />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/trips" 
            element={
              <ProtectedRoute>
                <TripLogging />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/fuel" 
            element={
              <ProtectedRoute>
                <FuelLogging />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/expenses" 
            element={
              <ProtectedRoute requiredRole="owner">
                <ExpenseManagement />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/revenue" 
            element={
              <ProtectedRoute requiredRole="owner">
                <RevenueTracking />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/reports" 
            element={
              <ProtectedRoute requiredRole="owner">
                <ReportsPage />
              </ProtectedRoute>
            } 
          />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster />
      </Router>
    </AuthProvider>
  );
}

export default App;