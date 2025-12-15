import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

// Lazy load pages for better performance
const HomePage = React.lazy(() => import('../pages/HomePage'));
const ServicesPage = React.lazy(() => import('../pages/ServicesPage'));
const ServiceDetailPage = React.lazy(() => import('../pages/ServiceDetailPage'));
const LoginPage = React.lazy(() => import('../pages/auth/LoginPage'));
const RegisterPage = React.lazy(() => import('../pages/auth/RegisterPage'));
const OTPVerificationPage = React.lazy(() => import('../pages/auth/OTPVerificationPage'));
const AddServicePage = React.lazy(() => import('../pages/services/AddServicePage'));
const ProfilePage = React.lazy(() => import('../pages/ProfilePage'));
const DashboardPage = React.lazy(() => import('../pages/DashboardPage'));
const NotFoundPage = React.lazy(() => import('../pages/NotFoundPage'));
const AdminDashboard = React.lazy(() => import('../pages/admin/AdminDashboard'));
const MessagesPage = React.lazy(() => import('../pages/MessagesPage'));
const NotificationsPage = React.lazy(() => import('../pages/NotificationsPage'));
const SecurityPage = React.lazy(() => import('../pages/SecurityPage'));
const SubscriptionPage = React.lazy(() => import('../pages/SubscriptionPage'));
const SubscriptionManagement = React.lazy(() => import('../pages/admin/SubscriptionManagement'));
const SafetyDashboard = React.lazy(() => import('../pages/admin/SafetyDashboard'));
const PolicyPage = React.lazy(() => import('../pages/PolicyPage'));
const AppealPage = React.lazy(() => import('../pages/AppealPage'));
const CategoriesPage = React.lazy(() => import('../pages/CategoriesPage'));
const AboutPage = React.lazy(() => import('../pages/AboutPage'));
const ContactPage = React.lazy(() => import('../pages/ContactPage'));
const HelpPage = React.lazy(() => import('../pages/HelpPage'));
const SettingsPage = React.lazy(() => import('../pages/SettingsPage'));
const VerifyAccountPage = React.lazy(() => import('../pages/auth/VerifyAccountPage'));
const ForgotPasswordPage = React.lazy(() => import('../pages/auth/ForgotPasswordPage'));

const AppRoutes: React.FC = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      }
    >
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/services/:slug" element={<ServiceDetailPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/policies/:policyType" element={<PolicyPage />} />
        <Route path="/terms" element={<Navigate to="/policies/terms" replace />} />
        <Route path="/privacy" element={<Navigate to="/policies/privacy" replace />} />
        
        {/* Authentication Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/verify-phone" element={<OTPVerificationPage />} />
        <Route path="/verify-account" element={<VerifyAccountPage />} />
        
        {/* Protected Routes */}
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/add-service" 
          element={
            <ProtectedRoute >
              <AddServicePage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/messages" 
          element={
            <ProtectedRoute>
              <MessagesPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/notifications" 
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/security" 
          element={
            // <ProtectedRoute>
              <SecurityPage />
            // </ProtectedRoute>
          } 
        />
        <Route
          path="/subscription"
          element={
            <ProtectedRoute>
              <SubscriptionPage />
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

        {/* Admin Routes */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute requireRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/subscriptions" 
          element={
            <ProtectedRoute requireRole="admin">
              <SubscriptionManagement />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/safety" 
          element={
            <ProtectedRoute requireRole="admin">
              <SafetyDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Appeal Routes */}
        <Route
          path="/appeal/:actionId"
          element={
            <ProtectedRoute>
              <AppealPage />
            </ProtectedRoute>
          }
        />
        
        {/* 404 Page */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;