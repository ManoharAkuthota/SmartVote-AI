import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Vote,
  ShieldCheck,
  Users,
  Activity,
  FileText,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  LogOut,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Shield,
  LayoutDashboard,
  Globe,
  PanelLeftClose,
  PanelLeft,
  X,
  Sparkles,
  Award
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage, SUPPORTED_LANGUAGES } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useSidebar } from '../context/SidebarContext';

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { t, lang, changeLanguage, speak } = useLanguage();
  const { theme, toggleTheme, isDark } = useTheme();
  const {
    isMobileOpen,
    closeMobileSidebar,
    isCollapsed,
    toggleCollapse,
    isDesktopVisible,
  } = useSidebar();

  // Close mobile sidebar on route change
  useEffect(() => {
    closeMobileSidebar();
  }, [location.pathname]);

  // Lock background scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileOpen]);

  const handleLogout = () => {
    closeMobileSidebar();
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  // Nav item list configuration
  const citizenLinks = [
    { to: '/dashboard', label: t('nav_dashboard'), icon: LayoutDashboard, badge: null },
    { to: '/elections', label: t('nav_elections'), icon: Vote, badge: 'Active' },
    { to: '/verify', label: t('nav_verify'), icon: ShieldCheck, badge: 'Public' },
  ];

  const adminLinks = [
    { to: '/admin', label: t('nav_admin_overview'), icon: Activity, badge: 'Live' },
    { to: '/admin/elections', label: t('nav_admin_elections'), icon: Vote, badge: null },
    { to: '/admin/voters', label: t('nav_admin_voters'), icon: Users, badge: null },
    { to: '/admin/audit', label: t('nav_admin_audit'), icon: FileText, badge: 'Ledger' },
  ];

  // Don't render desktop sidebar on public landing / login / register unless user is logged in
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <>
      {/* =========================================================================
          1. MOBILE SIDEBAR DRAWER (Slide-in drawer with backdrop blur)
          ========================================================================= */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          {/* Backdrop overlay */}
          <div
            onClick={closeMobileSidebar}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
            aria-hidden="true"
          />

          {/* Drawer content */}
          <div
            className="fixed inset-y-0 left-0 z-[101] w-80 max-w-[85vw] h-full bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col transform transition-transform duration-300 ease-out overflow-y-auto"
            role="dialog"
            aria-modal="true"
          >
            {/* National Tricolor Top Accent */}
            <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-white to-emerald-600 shrink-0" />

            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <Link
                to="/"
                onClick={closeMobileSidebar}
                className="flex items-center space-x-2.5"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-sm font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-1">
                    SMARTVOTE <span className="text-amber-600 dark:text-amber-400">BHARAT</span>
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">
                    भारत निर्वाचन आयोग (ECI Standard)
                  </span>
                </div>
              </Link>

              <button
                onClick={closeMobileSidebar}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Authenticated User Identity Banner */}
            {isAuthenticated ? (
              <div className="p-4 m-3 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center space-x-3">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden border-2 border-amber-500 shrink-0 bg-slate-100 dark:bg-slate-950">
                    <img
                      src={user?.faceImageUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {user?.fullName}
                    </div>
                    <div className="text-[11px] font-mono text-amber-600 dark:text-amber-400 font-medium truncate">
                      {isAdmin ? 'CHIEF ELECTION COMMISSIONER' : `EPIC: ${user?.voterIdNumber || 'IND-DL-8941205'}`}
                    </div>
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                      <CheckCircle2 className="w-3 h-3" /> Facial Security Enrolled
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 m-3 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-500/30">
                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                  Sign in to access your digital electoral constituency ballot.
                </p>
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <Link
                    to="/login"
                    onClick={closeMobileSidebar}
                    className="py-2 px-3 text-center text-xs font-bold rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 transition"
                  >
                    {t('nav_login')}
                  </Link>
                  <Link
                    to="/register"
                    onClick={closeMobileSidebar}
                    className="py-2 px-3 text-center text-xs font-bold rounded-xl bg-amber-600 text-white hover:bg-amber-500 shadow-sm transition"
                  >
                    {t('nav_register')}
                  </Link>
                </div>
              </div>
            )}

            {/* Navigation Sections */}
            <div className="flex-1 px-3 py-2 space-y-5">
              {/* Citizen Navigation */}
              <div>
                <span className="px-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  CITIZEN VOTER HUB
                </span>
                <div className="mt-1 space-y-1">
                  <Link
                    to="/"
                    onClick={closeMobileSidebar}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                      isActive('/') && location.pathname === '/'
                        ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Home className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                      <span>{t('nav_home')}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </Link>

                  {citizenLinks.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={closeMobileSidebar}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                        isActive(item.to)
                          ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <item.icon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Admin Section (when authorized) */}
              {isAuthenticated && isAdmin && (
                <div>
                  <span className="px-3 text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                    ELECTION COMMISSIONER DESK
                  </span>
                  <div className="mt-1 space-y-1">
                    {adminLinks.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={closeMobileSidebar}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                          isActive(item.to)
                            ? 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/40 font-bold'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <item.icon className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-600 dark:text-purple-300">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Indian Language Selector */}
              <div>
                <span className="px-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-amber-500" /> भारतीय भाषाएं (7 Official Languages)
                </span>
                <div className="mt-2 grid grid-cols-4 gap-1.5 px-1">
                  {(SUPPORTED_LANGUAGES || []).map((l) => (
                    <button
                      key={l.code}
                      onClick={() => changeLanguage(l.code)}
                      className={`py-1.5 px-1 rounded-lg text-xs font-semibold border transition text-center ${
                        lang === l.code
                          ? 'bg-amber-500/15 border-amber-500 text-amber-700 dark:text-amber-400 font-bold'
                          : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                      }`}
                    >
                      <span className="block text-[11px] leading-tight truncate">{l.name}</span>
                      <span className="text-[9px] text-slate-400 uppercase">{l.code}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme & Audio Controls */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={toggleTheme}
                  className="flex items-center justify-center space-x-2 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-purple-600" />}
                  <span>{isDark ? 'Light Theme' : 'Dark Theme'}</span>
                </button>
                <button
                  onClick={() => speak("SmartVote Bharat voice assist active.")}
                  className="flex items-center justify-center space-x-2 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <Volume2 className="w-4 h-4 text-amber-500" />
                  <span>Voice Assist</span>
                </button>
              </div>
            </div>

            {/* Mobile Drawer Footer: Prominent Sign Out Button */}
            {isAuthenticated && (
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                <button
                  onClick={handleLogout}
                  className="w-full py-3 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 active:bg-rose-500/30 border border-rose-500/30 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center space-x-2 shadow-sm transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t('nav_logout')} (Sign Out of Account)</span>
                </button>
                <div className="text-[10px] text-center text-slate-400 mt-2 font-mono">
                  ECI National Voter Helpline: 1950
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          2. DESKTOP PERMANENT / COLLAPSIBLE SIDEBAR
          ========================================================================= */}
      {isDesktopVisible && !isAuthPage && (
        <aside
          className={`hidden lg:flex flex-col border-r border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950 transition-all duration-300 ease-in-out shrink-0 sticky top-0 h-screen z-30 ${
            isCollapsed ? 'w-20' : 'w-64'
          }`}
        >
          {/* National Tricolor Top Stripe */}
          <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-white to-emerald-600 shrink-0" />

          {/* Sidebar Top Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
            {!isCollapsed && (
              <Link to="/" className="flex items-center space-x-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 flex items-center justify-center text-white shadow-md shadow-amber-500/20 shrink-0">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-black tracking-tight text-slate-900 dark:text-white truncate">
                    SMARTVOTE <span className="text-amber-600 dark:text-amber-400">BHARAT</span>
                  </div>
                  <span className="text-[9px] text-slate-500 dark:text-slate-400 font-mono block truncate">
                    ECI Standard Portal
                  </span>
                </div>
              </Link>
            )}

            {/* Collapse / Expand Toggle Button */}
            <button
              onClick={toggleCollapse}
              className={`p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition ${
                isCollapsed ? 'mx-auto' : ''
              }`}
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isCollapsed ? <PanelLeft className="w-4 h-4 text-amber-500" /> : <PanelLeftClose className="w-4 h-4" />}
            </button>
          </div>

          {/* User Profile Snippet (when authenticated) */}
          {isAuthenticated && (
            <div className={`p-3 border-b border-slate-200 dark:border-slate-800/80 ${isCollapsed ? 'text-center' : ''}`}>
              {isCollapsed ? (
                <div className="relative w-10 h-10 mx-auto rounded-xl overflow-hidden border-2 border-amber-500 bg-slate-100 dark:bg-slate-900 group">
                  <img
                    src={user?.faceImageUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80'}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
                </div>
              ) : (
                <div className="flex items-center space-x-3 p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <div className="relative w-9 h-9 rounded-lg overflow-hidden border border-amber-500 shrink-0 bg-slate-100 dark:bg-slate-950">
                    <img
                      src={user?.faceImageUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80'}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 rounded-full ring-1 ring-white dark:ring-slate-900" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {user?.fullName}
                    </div>
                    <div className="text-[10px] text-amber-600 dark:text-amber-400 font-mono truncate">
                      {isAdmin ? 'COMMISSIONER' : user?.voterIdNumber || 'IND-DL-8941205'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Desktop Navigation Links */}
          <div className="flex-1 overflow-y-auto px-2.5 py-4 space-y-6">
            {/* Citizen Links */}
            <div>
              {!isCollapsed && (
                <span className="px-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
                  CITIZEN VOTER
                </span>
              )}
              <div className="space-y-1">
                <Link
                  to="/"
                  className={`flex items-center ${isCollapsed ? 'justify-center p-2.5' : 'space-x-3 px-3 py-2'} rounded-xl text-xs font-semibold transition ${
                    isActive('/') && location.pathname === '/'
                      ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
                  }`}
                  title={isCollapsed ? t('nav_home') : undefined}
                >
                  <Home className="w-4 h-4 shrink-0" />
                  {!isCollapsed && <span>{t('nav_home')}</span>}
                </Link>

                {citizenLinks.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex items-center ${isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2'} rounded-xl text-xs font-semibold transition ${
                      isActive(item.to)
                        ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
                    }`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon className="w-4 h-4 shrink-0" />
                      {!isCollapsed && <span>{item.label}</span>}
                    </div>
                    {!isCollapsed && item.badge && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>

            {/* Admin Desk Links */}
            {isAuthenticated && isAdmin && (
              <div>
                {!isCollapsed && (
                  <span className="px-2 text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider block mb-1">
                    ADMIN DESK
                  </span>
                )}
                <div className="space-y-1">
                  {adminLinks.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`flex items-center ${isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2'} rounded-xl text-xs font-semibold transition ${
                        isActive(item.to)
                          ? 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30 font-bold'
                          : 'text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-300 hover:bg-slate-100 dark:hover:bg-slate-900'
                      }`}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <div className="flex items-center space-x-3">
                        <item.icon className="w-4 h-4 shrink-0 text-purple-500 dark:text-purple-400" />
                        {!isCollapsed && <span>{item.label}</span>}
                      </div>
                      {!isCollapsed && item.badge && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-600 dark:text-purple-300">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Desktop Sidebar Bottom Controls & LOGOUT BUTTON */}
          <div className="p-3 border-t border-slate-200 dark:border-slate-800/80 space-y-2 bg-slate-50/50 dark:bg-slate-950">
            {/* Quick Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center p-2' : 'justify-between px-3 py-2'} rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 transition`}
              title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            >
              <div className="flex items-center space-x-2">
                {isDark ? <Sun className="w-4 h-4 text-amber-400 shrink-0" /> : <Moon className="w-4 h-4 text-purple-600 shrink-0" />}
                {!isCollapsed && <span>{isDark ? 'Light Theme' : 'Dark Theme'}</span>}
              </div>
            </button>

            {/* PROMINENT LOGOUT BUTTON */}
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className={`w-full flex items-center ${isCollapsed ? 'justify-center p-2' : 'space-x-2 px-3 py-2.5'} rounded-xl bg-rose-500/10 hover:bg-rose-500/20 active:bg-rose-500/30 border border-rose-500/30 text-rose-600 dark:text-rose-400 font-bold text-xs transition shadow-sm cursor-pointer`}
                title={t('nav_logout')}
                aria-label={t('nav_logout')}
              >
                <LogOut className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span>{t('nav_logout')}</span>}
              </button>
            ) : (
              <Link
                to="/login"
                className={`w-full flex items-center ${isCollapsed ? 'justify-center p-2' : 'justify-center space-x-2 px-3 py-2'} rounded-xl bg-amber-600 text-white font-bold text-xs hover:bg-amber-500 transition shadow-sm`}
                title={t('nav_login')}
              >
                {!isCollapsed ? <span>{t('nav_login')}</span> : <Shield className="w-4 h-4" />}
              </Link>
            )}
          </div>
        </aside>
      )}
    </>
  );
}
