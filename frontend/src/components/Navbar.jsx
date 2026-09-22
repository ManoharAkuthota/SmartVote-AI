import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield, Bell, Globe, Sun, Moon, Volume2, VolumeX, LogOut, User, CheckCircle, AlertTriangle, Menu, X, ChevronRight, Vote, ShieldCheck, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { lang, changeLanguage, t, speak, voiceEnabled, setVoiceEnabled } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [notifications, setNotifications] = useState([]);
  const [showNotifDrawer, setShowNotifDrawer] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setShowNotifDrawer(false);
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
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/85 border-b border-cyan-500/20 shadow-lg transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-2.5 sm:space-x-3 group">
            <div className="relative p-2 rounded-xl bg-blue-600/15 border border-blue-500/30 group-hover:border-blue-400 transition-all shadow-sm shrink-0">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 group-hover:scale-105 transition-transform" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-1.5">
                <span className="text-lg sm:text-xl font-black tracking-tight text-white">
                  SMARTVOTE
                </span>
                <span className="text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded bg-blue-600/20 text-blue-400 border border-blue-500/30 font-bold uppercase tracking-wider">
                  Official
                </span>
              </div>
              <span className="text-[8px] sm:text-[9px] text-slate-400 tracking-wider uppercase font-medium">
                National Digital Voting System
              </span>
            </div>
          </Link>

          {/* Center Links (Laptop & Desktop) */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              to="/"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                isActive('/') ? 'text-blue-400 bg-blue-500/10 border border-blue-500/30' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              {t('nav_home')}
            </Link>
            <Link
              to="/elections"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                isActive('/elections') ? 'text-blue-400 bg-blue-500/10 border border-blue-500/30' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              {t('nav_elections')}
            </Link>
            <Link
              to="/verify"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                isActive('/verify') ? 'text-blue-400 bg-blue-500/10 border border-blue-500/30' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              {t('nav_verify')}
            </Link>

            {isAuthenticated && !isAdmin && (
              <Link
                to="/dashboard"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  isActive('/dashboard') ? 'text-blue-400 bg-blue-500/10 border border-blue-500/30' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
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
            {/* Language Selector (Laptop) */}
            <div className="relative group hidden sm:block">
              <button
                className="p-2 rounded-lg bg-slate-900/60 border border-slate-700/60 text-slate-300 hover:text-cyan-400 transition"
                title="Change Language"
              >
                <Globe className="w-4 h-4" />
              </button>
              <div className="absolute right-0 mt-2 w-32 py-1 bg-slate-900 border border-cyan-500/30 rounded-xl shadow-2xl hidden group-hover:block z-50 backdrop-blur-xl">
                <button onClick={() => changeLanguage('en')} className={`w-full text-left px-3 py-1.5 text-xs ${lang === 'en' ? 'text-cyan-400 font-bold' : 'text-slate-300'} hover:bg-cyan-500/10`}>English</button>
                <button onClick={() => changeLanguage('es')} className={`w-full text-left px-3 py-1.5 text-xs ${lang === 'es' ? 'text-cyan-400 font-bold' : 'text-slate-300'} hover:bg-cyan-500/10`}>Español</button>
                <button onClick={() => changeLanguage('hi')} className={`w-full text-left px-3 py-1.5 text-xs ${lang === 'hi' ? 'text-cyan-400 font-bold' : 'text-slate-300'} hover:bg-cyan-500/10`}>हिन्दी</button>
                <button onClick={() => changeLanguage('fr')} className={`w-full text-left px-3 py-1.5 text-xs ${lang === 'fr' ? 'text-cyan-400 font-bold' : 'text-slate-300'} hover:bg-cyan-500/10`}>Français</button>
              </div>
            </div>

            {/* Voice Accessibility Toggle */}
            <button
              onClick={() => {
                const next = !voiceEnabled;
                setVoiceEnabled(next);
                if (next) speak("Voice accessibility assistance activated.");
              }}
              className={`p-2 rounded-lg border transition ${
                voiceEnabled ? 'bg-cyan-500/20 border-cyan-400 text-cyan-400' : 'bg-slate-900/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
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
                  className="p-2 rounded-lg bg-slate-900/60 border border-slate-700/60 text-slate-300 hover:text-cyan-400 transition relative"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-500 text-slate-950 font-bold text-[10px] rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifDrawer && (
                  <div className="absolute right-0 mt-3 w-72 sm:w-88 bg-slate-900/95 border border-cyan-500/30 rounded-2xl shadow-2xl p-3 sm:p-4 z-50 backdrop-blur-2xl">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2 sm:mb-3">
                      <h4 className="text-xs sm:text-sm font-semibold text-white flex items-center gap-2">
                        <Bell className="w-4 h-4 text-cyan-400" /> Notifications
                      </h4>
                      <span className="text-[10px] sm:text-xs text-slate-400">{notifications.length} alerts</span>
                    </div>
                    <div className="max-h-60 sm:max-h-72 overflow-y-auto space-y-2">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-4">No notifications yet</p>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => markNotificationRead(n.id)}
                            className={`p-2 sm:p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                              n.read
                                ? 'bg-slate-800/40 border-slate-700/40 text-slate-400'
                                : 'bg-cyan-950/30 border-cyan-500/30 text-slate-200 hover:border-cyan-400'
                            }`}
                          >
                            <div className="font-semibold text-cyan-300 mb-0.5 text-[11px] sm:text-xs">{n.title}</div>
                            <p className="text-slate-300 text-[10px] sm:text-[11px] leading-relaxed">{n.message}</p>
                            <span className="text-[8px] sm:text-[9px] text-slate-500 block mt-1">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
              <div className="hidden sm:flex items-center space-x-2 pl-2 border-l border-slate-800">
                <div className="flex items-center space-x-2 px-2.5 py-1 rounded-lg bg-slate-900/80 border border-cyan-500/20">
                  <div className="w-6 h-6 rounded-full overflow-hidden border border-cyan-400">
                    <img
                      src={user?.faceImageUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-xs font-medium text-slate-200 max-w-[90px] truncate">
                    {user?.fullName?.split(' ')[0]}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg bg-rose-950/30 border border-rose-500/30 text-rose-400 hover:bg-rose-900/40 transition"
                  title={t('nav_logout')}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-200 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition"
                >
                  {t('nav_login')}
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition"
                >
                  {t('nav_register')}
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Menu Toggle (Visible on Mobile) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-900/80 border border-slate-700 text-slate-200 hover:text-cyan-400 md:hidden transition"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer / Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950/95 backdrop-blur-2xl px-4 pt-3 pb-6 space-y-3 animate-fadeIn">
          {/* User Info on Mobile if authenticated */}
          {isAuthenticated ? (
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/70 border border-cyan-500/20">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-cyan-400 shadow-neon-cyan shrink-0">
                  <img
                    src={user?.faceImageUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{user?.fullName}</div>
                  <div className="text-[11px] text-cyan-400 font-mono">{user?.voterIdNumber || (isAdmin ? 'SYSTEM ADMINISTRATOR' : 'VERIFIED VOTER')}</div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-400 hover:bg-rose-900/50 text-xs flex items-center gap-1"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 pt-1 pb-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 rounded-xl text-center text-xs font-bold text-slate-200 bg-slate-900 border border-slate-700 hover:bg-slate-800 transition"
              >
                {t('nav_login')}
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 rounded-xl text-center text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition"
              >
                {t('nav_register')}
              </Link>
            </div>
          )}

          {/* Navigation Links */}
          <div className="space-y-1 pt-1">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                isActive('/') ? 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/30' : 'text-slate-300 hover:bg-slate-900'
              }`}
            >
              <span>{t('nav_home')}</span>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </Link>
            <Link
              to="/elections"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                isActive('/elections') ? 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/30' : 'text-slate-300 hover:bg-slate-900'
              }`}
            >
              <span>{t('nav_elections')}</span>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </Link>
            <Link
              to="/verify"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                isActive('/verify') ? 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/30' : 'text-slate-300 hover:bg-slate-900'
              }`}
            >
              <span>{t('nav_verify')}</span>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </Link>

            {isAuthenticated && !isAdmin && (
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive('/dashboard') ? 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/30' : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                <span>{t('nav_dashboard')}</span>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </Link>
            )}

            {isAuthenticated && isAdmin && (
              <div className="space-y-1 pt-1 border-t border-slate-800/80">
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition ${
                    isActive('/admin') ? 'text-purple-400 bg-purple-500/10 border border-purple-500/30' : 'text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <span>Admin Overview</span>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </Link>
                <Link
                  to="/admin/elections"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition ${
                    isActive('/admin/elections') ? 'text-purple-400 bg-purple-500/10 border border-purple-500/30' : 'text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <span>Manage Elections</span>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </Link>
                <Link
                  to="/admin/voters"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition ${
                    isActive('/admin/voters') ? 'text-purple-400 bg-purple-500/10 border border-purple-500/30' : 'text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <span>Voter Registry</span>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </Link>
                <Link
                  to="/admin/audit"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition ${
                    isActive('/admin/audit') ? 'text-purple-400 bg-purple-500/10 border border-purple-500/30' : 'text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <span>Cryptographic Audit</span>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </Link>
              </div>
            )}
          </div>

          {/* Language Selector on Mobile */}
          <div className="pt-2 border-t border-slate-800">
            <div className="text-[11px] font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-cyan-400" /> Select Language
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { code: 'en', label: 'EN' },
                { code: 'es', label: 'ES' },
                { code: 'hi', label: 'HI' },
                { code: 'fr', label: 'FR' },
              ].map((l) => (
                <button
                  key={l.code}
                  onClick={() => changeLanguage(l.code)}
                  className={`py-1.5 rounded-lg text-xs font-semibold border transition ${
                    lang === l.code
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {/* Theme & Voice Accessibility Controls on Mobile */}
          <div className="pt-3 border-t border-slate-800 grid grid-cols-2 gap-2">
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center space-x-2 p-2 rounded-xl border border-slate-800 bg-slate-900/60 text-xs font-semibold text-slate-300 hover:text-amber-400 transition"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-purple-400" />}
              <span>{isDark ? 'Light Theme' : 'Dark Theme'}</span>
            </button>

            <button
              onClick={() => {
                const next = !voiceEnabled;
                setVoiceEnabled(next);
                if (next) speak("Voice accessibility assistance activated.");
              }}
              className={`flex items-center justify-center space-x-2 p-2 rounded-xl border text-xs font-semibold transition ${
                voiceEnabled ? 'bg-cyan-500/20 border-cyan-400 text-cyan-400' : 'bg-slate-900/60 border-slate-800 text-slate-400'
              }`}
            >
              {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span>{voiceEnabled ? 'Voice On' : 'Voice Off'}</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
