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
    <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800 px-3 py-2 pb-safe shadow-lg">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* Home */}
        <Link
          to="/"
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition ${
            isActive('/') ? 'text-blue-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-lg ${isActive('/') ? 'bg-blue-600/15' : ''}`}>
            <Home className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5">{t('nav_home')}</span>
        </Link>

        {/* Elections */}
        <Link
          to="/elections"
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition ${
            isActive('/elections') ? 'text-blue-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-lg ${isActive('/elections') ? 'bg-blue-600/15' : ''}`}>
            <Vote className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5">{t('nav_elections')}</span>
        </Link>

        {/* Verify Receipt */}
        <Link
          to="/verify"
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition ${
            isActive('/verify') ? 'text-blue-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-lg ${isActive('/verify') ? 'bg-blue-600/15' : ''}`}>
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5">Verify</span>
        </Link>

        {/* User Hub / Admin / Login */}
        <Link
          to={dashboardPath}
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition ${
            location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/admin') || isActive('/login')
              ? isAdmin ? 'text-purple-400 font-semibold' : 'text-blue-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-lg ${
            location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/admin') || isActive('/login')
              ? isAdmin ? 'bg-purple-600/15' : 'bg-blue-600/15'
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
