import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield, Bell, Globe, Sun, Moon, Volume2, VolumeX, LogOut, User, CheckCircle, AlertTriangle, Menu, X, ChevronRight, Vote, ShieldCheck, LayoutDashboard, PanelLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage, SUPPORTED_LANGUAGES } from '../context/LanguageContext';
import { useSidebar } from '../context/SidebarContext';
import api from '../services/api';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { lang, changeLanguage, t, speak, voiceEnabled, setVoiceEnabled } = useLanguage();
  const { toggleMobileSidebar, toggleCollapse, isCollapsed, isMobileOpen } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSidebarToggle = () => {
    if (window.innerWidth >= 1024) {
      toggleCollapse();
    } else {
      toggleMobileSidebar();
    }
  };

  const [notifications, setNotifications] = useState([]);
  const [showNotifDrawer, setShowNotifDrawer] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  // Close extra drawers on route change
  useEffect(() => {
    setShowNotifDrawer(false);
    setLangDropdownOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 20000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data?.success) {
        setNotifications(res.data.data);
        setUnreadCount(res.data.data.filter((n) => !n.read).length);
      }
    } catch (e) {
      console.warn('Could not fetch notifications:', e.message);
    }
  };

  const markNotificationRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/90 border-b border-orange-500/20 shadow-lg transition-colors">
      {/* Subtle National Tricolor Accent Top Stripe */}
      <div className="h-1 w-full flex">
        <div className="h-full flex-1 bg-amber-500" />
        <div className="h-full flex-1 bg-white/90" />
        <div className="h-full flex-1 bg-emerald-600" />
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Sidebar Toggle Button & Brand Logo */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={handleSidebarToggle}
              className="p-2 rounded-xl bg-slate-900/60 dark:bg-slate-900/80 border border-slate-700/60 text-slate-300 hover:text-amber-400 hover:border-amber-400/40 transition shadow-sm"
              title="Toggle Portal Sidebar"
              aria-label="Toggle Portal Sidebar"
            >
              <PanelLeft className="w-5 h-5 text-amber-500" />
            </button>

            <Link to="/" className="flex items-center space-x-2.5 sm:space-x-3 group">
            <div className="relative p-2 rounded-xl bg-gradient-to-br from-amber-500/20 via-blue-600/20 to-emerald-500/20 border border-amber-500/30 group-hover:border-amber-400 transition-all shadow-sm shrink-0">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 group-hover:scale-105 transition-transform" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-1.5">
                <span className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-1">
                  <span>SMARTVOTE</span>
                  <span className="text-amber-400">BHARAT</span>
                </span>
                <span className="text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 font-bold uppercase tracking-wider">
                  ECI Verified
                </span>
              </div>
              <span className="text-[8px] sm:text-[9px] text-slate-400 tracking-wider uppercase font-medium">
                भारत निर्वाचन • National Digital E-Voting Portal
              </span>
            </div>
          </Link>
        </div>

          {/* Center Links (Laptop & Desktop) */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              to="/"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                isActive('/') ? 'text-amber-400 bg-amber-500/10 border border-amber-500/30' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              {t('nav_home')}
            </Link>
            <Link
              to="/elections"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                isActive('/elections') ? 'text-amber-400 bg-amber-500/10 border border-amber-500/30' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              {t('nav_elections')}
            </Link>
            <Link
              to="/verify"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                isActive('/verify') ? 'text-amber-400 bg-amber-500/10 border border-amber-500/30' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              {t('nav_verify')}
            </Link>

            {isAuthenticated && !isAdmin && (
              <Link
                to="/dashboard"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  isActive('/dashboard') ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/30' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                {t('nav_dashboard')}
              </Link>
            )}

            {isAuthenticated && isAdmin && (
              <Link
                to="/admin"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  isActive('/admin') ? 'text-purple-400 bg-purple-500/10 border border-purple-500/30' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                {t('nav_admin')}
              </Link>
            )}
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-1.5 sm:space-x-2.5">
            {/* Indian Languages Selector (Laptop) */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/80 border border-slate-700/80 text-slate-200 hover:border-amber-400 transition text-xs font-semibold"
                title="Select Indian Language"
              >
                <Globe className="w-3.5 h-3.5 text-amber-400" />
                <span>{SUPPORTED_LANGUAGES.find((l) => l.code === lang)?.nativeName || 'English'}</span>
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 py-1.5 bg-slate-900/95 border border-amber-500/30 rounded-xl shadow-2xl z-50 backdrop-blur-xl">
                  <div className="px-3 py-1 text-[10px] font-bold text-amber-400 uppercase tracking-wider border-b border-slate-800">
                    Indian Languages (भारतीय भाषाएं)
                  </div>
                  {SUPPORTED_LANGUAGES.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        changeLanguage(l.code);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition ${
                        lang === l.code ? 'text-amber-400 font-bold bg-amber-500/10' : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span>{l.nativeName}</span>
                      <span className="text-[10px] font-mono uppercase text-slate-500">{l.code}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Voice Accessibility Toggle */}
            <button
              onClick={() => {
                const next = !voiceEnabled;
                setVoiceEnabled(next);
                if (next) speak("Voice accessibility assistance activated. SmartVote Bharat official e-voting portal.");
              }}
              className={`p-2 rounded-lg border transition ${
                voiceEnabled ? 'bg-amber-500/20 border-amber-400 text-amber-400' : 'bg-slate-900/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
              }`}
              title="Voice Accessibility Reader"
            >
              {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-slate-900/60 border border-slate-700/60 text-slate-300 hover:text-amber-400 transition"
              title="Toggle Theme"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Notifications (if authenticated) */}
            {isAuthenticated && (
              <div className="relative">
                <button
                  onClick={() => setShowNotifDrawer(!showNotifDrawer)}
                  className="p-2 rounded-lg bg-slate-900/60 border border-slate-700/60 text-slate-300 hover:text-amber-400 transition relative"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-slate-950 font-bold text-[10px] rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifDrawer && (
                  <div className="absolute right-0 mt-3 w-72 sm:w-88 bg-slate-900/95 border border-amber-500/30 rounded-2xl shadow-2xl p-3 sm:p-4 z-50 backdrop-blur-2xl">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2 sm:mb-3">
                      <h4 className="text-xs sm:text-sm font-semibold text-white flex items-center gap-2">
                        <Bell className="w-4 h-4 text-amber-400" /> Electoral Alerts
                      </h4>
                      <span className="text-[10px] sm:text-xs text-slate-400">{notifications.length} notices</span>
                    </div>
                    <div className="max-h-60 sm:max-h-72 overflow-y-auto space-y-2">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-4">No electoral notifications yet</p>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => markNotificationRead(n.id)}
                            className={`p-2 sm:p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                              n.read
                                ? 'bg-slate-800/40 border-slate-700/40 text-slate-400'
                                : 'bg-amber-950/30 border-amber-500/30 text-slate-200 hover:border-amber-400'
                            }`}
                          >
                            <div className="font-semibold text-amber-300 mb-0.5 text-[11px] sm:text-xs">{n.title}</div>
                            <p className="text-slate-300 text-[10px] sm:text-[11px] leading-relaxed">{n.message}</p>
                            <span className="text-[8px] sm:text-[9px] text-slate-500 block mt-1 font-mono">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} IST
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Profile / Auth buttons (Laptop) */}
            {isAuthenticated ? (
              <div className="hidden sm:flex items-center space-x-2 pl-2 border-l border-slate-200 dark:border-slate-800">
                <Link
                  to={isAdmin ? '/admin' : '/dashboard'}
                  className="flex items-center space-x-2 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900/80 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 transition"
                  title="View Portal Dashboard"
                >
                  <div className="w-6 h-6 rounded-full overflow-hidden border border-amber-400 shrink-0">
                    <img
                      src={user?.faceImageUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80'}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 max-w-[110px] truncate">
                    {user?.fullName?.split(' ')[0]}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 active:bg-rose-500/30 border border-rose-500/30 text-rose-600 dark:text-rose-400 font-bold text-xs shadow-sm transition cursor-pointer"
                  title={t('nav_logout')}
                  aria-label={t('nav_logout')}
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  <span>{t('nav_logout')}</span>
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 transition"
                >
                  {t('nav_login')}
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 shadow-sm transition"
                >
                  {t('nav_register')}
                </Link>
              </div>
            )}

            {/* Mobile Navigation Drawer Toggle */}
            <button
              onClick={toggleMobileSidebar}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-amber-500 md:hidden transition shadow-sm"
              aria-label="Toggle mobile menu"
            >
              {isMobileOpen ? <X className="w-5 h-5 text-amber-500" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
