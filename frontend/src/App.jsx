import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
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
          <BrowserRouter>
            <div className="flex flex-col min-h-screen bg-[#030712] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-300">
              <Navbar />
              <main className="flex-1">
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
            </div>
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
