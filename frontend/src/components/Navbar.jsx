import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield, Bell, Globe, Sun, Moon, Volume2, VolumeX, LogOut, User, CheckCircle, AlertTriangle } from 'lucide-react';
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
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-cyan-500/20 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative p-2 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-600/20 border border-cyan-400/40 group-hover:border-cyan-400 transition-all shadow-neon-cyan">
              <Shield className="w-6 h-6 text-cyan-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-cyan-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
                SMARTVOTE<span className="text-xs ml-1 px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">AI</span>
              </span>
              <span className="text-[10px] text-slate-400 tracking-widest uppercase">Biometric Ledger</span>
            </div>
          </Link>

          {/* Center Links */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              to="/"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                isActive('/') ? 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/30' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              {t('nav_home')}
            </Link>
            <Link
              to="/elections"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                isActive('/elections') ? 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/30' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              {t('nav_elections')}
            </Link>
            <Link
              to="/verify"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                isActive('/verify') ? 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/30' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              {t('nav_verify')}
            </Link>

            {isAuthenticated && !isAdmin && (
              <Link
                to="/dashboard"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  isActive('/dashboard') ? 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/30' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
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
          <div className="flex items-center space-x-3">
            {/* Language Selector */}
            <div className="relative group">
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
                if (next) speak("Voice accessibility assistance activated. Directing biometric voting prompts.");
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
                  <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-slate-900/95 border border-cyan-500/30 rounded-2xl shadow-2xl p-4 z-50 backdrop-blur-2xl">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                      <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                        <Bell className="w-4 h-4 text-cyan-400" /> Notifications
                      </h4>
                      <span className="text-xs text-slate-400">{notifications.length} alerts</span>
                    </div>
                    <div className="max-h-72 overflow-y-auto space-y-2">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-4">No notifications yet</p>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => markNotificationRead(n.id)}
                            className={`p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                              n.read
                                ? 'bg-slate-800/40 border-slate-700/40 text-slate-400'
                                : 'bg-cyan-950/30 border-cyan-500/30 text-slate-200 hover:border-cyan-400'
                            }`}
                          >
                            <div className="font-semibold text-cyan-300 mb-0.5">{n.title}</div>
                            <p className="text-slate-300 text-[11px] leading-relaxed">{n.message}</p>
                            <span className="text-[9px] text-slate-500 block mt-1">
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

            {/* User Profile / Auth buttons */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
                <div className="flex items-center space-x-2 px-2.5 py-1 rounded-lg bg-slate-900/80 border border-cyan-500/20">
                  <div className="w-6 h-6 rounded-full overflow-hidden border border-cyan-400">
                    <img
                      src={user?.faceImageUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="hidden sm:inline text-xs font-medium text-slate-200 max-w-[100px] truncate">
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
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-200 hover:text-white bg-slate-800/80 hover:bg-slate-700 transition"
                >
                  {t('nav_login')}
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-purple-400 hover:opacity-90 shadow-neon-cyan transition"
                >
                  {t('nav_register')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
