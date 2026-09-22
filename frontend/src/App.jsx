import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { SidebarProvider } from './context/SidebarContext';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import MobileBottomNav from './components/MobileBottomNav';
import ProtectedRoute from './components/ProtectedRoute';

import LandingPage from './pages/LandingPage';
import ElectionsPage from './pages/ElectionsPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import VoterDashboard from './pages/VoterDashboard';
import BallotPage from './pages/BallotPage';
import VerifyReceiptPage from './pages/VerifyReceiptPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminElectionsPage from './pages/AdminElectionsPage';
import AdminVotersPage from './pages/AdminVotersPage';
import AdminAuditLogsPage from './pages/AdminAuditLogsPage';

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <SidebarProvider>
            <BrowserRouter>
              <div className="flex min-h-screen app-container transition-colors duration-200 selection:bg-amber-500/30 selection:text-amber-700 dark:selection:text-amber-300">
                {/* Responsive Portal Sidebar (Desktop Dock + Mobile Drawer) */}
                <Sidebar />

                {/* Main Content Viewport */}
                <div className="flex-1 flex flex-col min-w-0">
                  <Navbar />
                  <main className="flex-1 pb-24 md:pb-8">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/elections" element={<ElectionsPage />} />
                  <Route path="/verify" element={<VerifyReceiptPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/login" element={<LoginPage />} />

                  {/* Voter Protected Routes */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <VoterDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/elections/:id/ballot"
                    element={
                      <ProtectedRoute>
                        <BallotPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Admin Protected Routes */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute requiredRole="ROLE_ADMIN">
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/elections"
                    element={
                      <ProtectedRoute requiredRole="ROLE_ADMIN">
                        <AdminElectionsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/voters"
                    element={
                      <ProtectedRoute requiredRole="ROLE_ADMIN">
                        <AdminVotersPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/audit"
                    element={
                      <ProtectedRoute requiredRole="ROLE_ADMIN">
                        <AdminAuditLogsPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
              <Footer />
              <MobileBottomNav />
            </div>
          </div>
        </BrowserRouter>
      </SidebarProvider>
    </AuthProvider>
  </LanguageProvider>
</ThemeProvider>
  );
}
