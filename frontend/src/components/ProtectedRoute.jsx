import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { RefreshCw } from 'lucide-react';

export default function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-cyan-400">
        <RefreshCw className="w-8 h-8 animate-spin mb-3" />
        <p className="text-xs font-mono tracking-widest uppercase">Authorizing Cryptographic Session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}
