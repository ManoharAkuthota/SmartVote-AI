import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Vote, ShieldCheck, User, LayoutDashboard, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function MobileBottomNav() {
  const location = useLocation();
  const { isAuthenticated, isAdmin } = useAuth();
  const { t } = useLanguage();

  const isActive = (path) => location.pathname === path;

  const dashboardPath = !isAuthenticated ? '/login' : isAdmin ? '/admin' : '/dashboard';
  const dashboardLabel = !isAuthenticated ? 'Sign In' : isAdmin ? 'Admin' : 'Voter Hub';

  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-slate-950/90 backdrop-blur-2xl border-t border-cyan-500/20 px-3 py-2 pb-safe shadow-[0_-10px_25px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* Home */}
        <Link
          to="/"
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition ${
            isActive('/') ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-lg ${isActive('/') ? 'bg-cyan-500/15 shadow-neon-cyan' : ''}`}>
            <Home className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5">{t('nav_home')}</span>
        </Link>

        {/* Elections */}
        <Link
          to="/elections"
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition ${
            isActive('/elections') ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-lg ${isActive('/elections') ? 'bg-cyan-500/15 shadow-neon-cyan' : ''}`}>
            <Vote className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5">{t('nav_elections')}</span>
        </Link>

        {/* Verify Receipt */}
        <Link
          to="/verify"
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition ${
            isActive('/verify') ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-lg ${isActive('/verify') ? 'bg-cyan-500/15 shadow-neon-cyan' : ''}`}>
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5">Verify</span>
        </Link>

        {/* User Hub / Admin / Login */}
        <Link
          to={dashboardPath}
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition ${
            location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/admin') || isActive('/login')
              ? isAdmin ? 'text-purple-400 font-bold' : 'text-cyan-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-lg ${
            location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/admin') || isActive('/login')
              ? isAdmin ? 'bg-purple-500/15 shadow-neon-purple' : 'bg-cyan-500/15 shadow-neon-cyan'
              : ''
          }`}>
            {isAdmin ? <Shield className="w-5 h-5" /> : isAuthenticated ? <LayoutDashboard className="w-5 h-5" /> : <User className="w-5 h-5" />}
          </div>
          <span className="text-[10px] mt-0.5">{dashboardLabel}</span>
        </Link>
      </div>
    </div>
  );
}
