import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield, Bell, Globe, Sun, Moon, Volume2, VolumeX, LogOut, User, CheckCircle, AlertTriangle, Menu, X, ChevronRight, Vote, ShieldCheck, LayoutDashboard, PanelLeft, Sparkles, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage, SUPPORTED_LANGUAGES } from '../context/LanguageContext';
import { useSidebar } from '../context/SidebarContext';
import api from '../services/api';

const DEFAULT_PUBLIC_NOTICES = [
  {
    id: 'pub-1',
    title: '18th Lok Sabha General Elections 2026',
    message: 'Polling stations and secret digital ballots are active under Article 324 of the Constitution of India.',
    createdAt: new Date().toISOString(),
    read: false,
    type: 'INFO'
  },
  {
    id: 'pub-2',
    title: 'Voter Roll Verification & Form 6 Active',
    message: 'New voters aged 18+ can apply for digital electoral roll enrollment with instant Aadhaar verification.',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    read: false,
    type: 'SUCCESS'
  },
  {
    id: 'pub-3',
    title: 'National Voter Helpline Toll-Free 1950',
    message: 'Official bilingual 24x7 voter assistance and grievance portal is operational across all constituencies.',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    read: true,
    type: 'INFO'
  }
];

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

  const [notifications, setNotifications] = useState(DEFAULT_PUBLIC_NOTICES);
  const [showNotifDrawer, setShowNotifDrawer] = useState(false);
  const [unreadCount, setUnreadCount] = useState(2);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [activePopup, setActivePopup] = useState(null);

  const prevNotifIdsRef = useRef(new Set(DEFAULT_PUBLIC_NOTICES.map((n) => n.id)));
  const initialPopupFiredRef = useRef(false);

  // Close extra drawers on route change
  useEffect(() => {
    setShowNotifDrawer(false);
    setLangDropdownOpen(false);
  }, [location.pathname]);

  // Fetch notifications periodically
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Demo initial pop-up after 3.5 seconds to show live functionality
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!initialPopupFiredRef.current) {
        initialPopupFiredRef.current = true;
        triggerNotificationPopup({
          id: 'welcome-popup',
          title: 'Electoral Security Alert',
          message: 'SmartVote Bharat portal is operational under Article 324. AI facial security & OTP verification active.',
          createdAt: new Date().toISOString(),
          read: false
        });
      }
    }, 3500);
    return () => clearTimeout(timer);
  }, []);

  // Escape key closes notification drawer & pop-up
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowNotifDrawer(false);
        setActivePopup(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const triggerNotificationPopup = (notif) => {
    setActivePopup(notif);
    if (voiceEnabled) {
      speak('New alert: ' + notif.title);
    }
    // Auto-dismiss after 8 seconds
    setTimeout(() => {
      setActivePopup((curr) => (curr?.id === notif.id ? null : curr));
    }, 8000);
  };

  const fetchNotifications = async () => {
    try {
      if (isAuthenticated) {
        const res = await api.get('/notifications');
        if (res.data?.success && res.data.data.length > 0) {
          const fetched = res.data.data;
          
          // Check for brand new unread notifications to trigger pop-up
          fetched.forEach((n) => {
            if (!prevNotifIdsRef.current.has(n.id) && !n.read) {
              triggerNotificationPopup(n);
            }
          });

          prevNotifIdsRef.current = new Set(fetched.map((n) => n.id));
          setNotifications(fetched);
          setUnreadCount(fetched.filter((n) => !n.read).length);
          return;
        }
      }
      // If not authenticated or backend returned empty list, maintain public notices
      setNotifications((prev) => (prev.length > 0 ? prev : DEFAULT_PUBLIC_NOTICES));
      setUnreadCount((prev) => notifications.filter((n) => !n.read).length);
    } catch (e) {
      console.warn('Could not fetch notifications:', e.message);
    }
  };

  const markNotificationRead = async (id) => {
    try {
      if (typeof id === 'number' && isAuthenticated) {
        await api.patch(`/notifications/${id}/read`).catch(() => {});
      }
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (e) {
      console.error(e);
    }
  };

  const markAllNotificationsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    if (isAuthenticated) {
      notifications.forEach((n) => {
        if (!n.read && typeof n.id === 'number') {
          api.patch(`/notifications/${n.id}/read`).catch(() => {});
        }
      });
    }
  };

  const handleSimulateAlert = () => {
    const alertId = 'sim-' + Date.now();
    const newAlert = {
      id: alertId,
      title: 'Real-Time Electoral Roll Notice',
      message: 'Constituency polling roster updated by Chief Election Returning Officer.',
      createdAt: new Date().toISOString(),
      read: false,
      type: 'INFO'
    };
    setNotifications((prev) => [newAlert, ...prev]);
    setUnreadCount((c) => c + 1);
    prevNotifIdsRef.current.add(alertId);
    triggerNotificationPopup(newAlert);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/95 dark:bg-slate-950/90 border-b border-slate-200 dark:border-orange-500/20 shadow-sm dark:shadow-lg transition-colors">
      {/* Subtle National Tricolor Accent Top Stripe */}
      <div className="h-1 w-full flex">
        <div className="h-full flex-1 bg-amber-500" />
        <div className="h-full flex-1 bg-white/90" />
        <div className="h-full flex-1 bg-emerald-600" />
      </div>

      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Sidebar Toggle Button & Brand Logo */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={handleSidebarToggle}
              className="hidden lg:flex p-2 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 transition shadow-sm shrink-0"
              title="Toggle Portal Sidebar"
              aria-label="Toggle Portal Sidebar"
            >
              <PanelLeft className="w-5 h-5 text-amber-600 dark:text-amber-500" />
            </button>

            <Link to="/" className="flex items-center space-x-2 sm:space-x-2.5 group min-w-0">
              <div className="relative p-1.5 sm:p-2 rounded-xl bg-gradient-to-br from-amber-500/20 via-blue-600/20 to-emerald-500/20 border border-amber-500/30 group-hover:border-amber-400 transition-all shadow-sm shrink-0">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500 group-hover:scale-105 transition-transform" />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center space-x-1 sm:space-x-1.5">
                  <span className="text-sm sm:text-lg font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-1">
                    <span>SMARTVOTE</span>
                    <span className="text-amber-600 dark:text-amber-400">BHARAT</span>
                  </span>
                  <span className="hidden sm:inline-block text-[8px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 rounded bg-emerald-600/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 font-bold uppercase tracking-wider">
                    ECI Verified
                  </span>
                </div>
                <span className="hidden sm:inline-block text-[7px] sm:text-[9px] text-slate-500 dark:text-slate-400 tracking-wider uppercase font-medium truncate">
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
                isActive('/') ? 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/30 font-semibold' : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
              }`}
            >
              {t('nav_home')}
            </Link>
            <Link
              to="/elections"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                isActive('/elections') ? 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/30 font-semibold' : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
              }`}
            >
              {t('nav_elections')}
            </Link>
            <Link
              to="/verify"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                isActive('/verify') ? 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/30 font-semibold' : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
              }`}
            >
              {t('nav_verify')}
            </Link>

            {isAuthenticated && !isAdmin && (
              <Link
                to="/dashboard"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  isActive('/dashboard') ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 font-semibold' : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
                }`}
              >
                {t('nav_dashboard')}
              </Link>
            )}

            {isAuthenticated && isAdmin && (
              <Link
                to="/admin"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  isActive('/admin') ? 'text-purple-600 dark:text-purple-400 bg-purple-500/10 border border-purple-500/30 font-semibold' : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
                }`}
              >
                {t('nav_admin')}
              </Link>
            )}
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* Indian Languages Selector (Laptop) */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 hover:border-amber-400 transition text-xs font-semibold"
                title="Select Indian Language"
              >
                <Globe className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                <span>{SUPPORTED_LANGUAGES.find((l) => l.code === lang)?.nativeName || 'English'}</span>
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 py-1.5 bg-white dark:bg-slate-900/95 border border-amber-500/30 rounded-xl shadow-2xl z-50 backdrop-blur-xl">
                  <div className="px-3 py-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
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
                        lang === l.code ? 'text-amber-600 dark:text-amber-400 font-bold bg-amber-500/10' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span>{l.nativeName}</span>
                      <span className="text-[10px] font-mono uppercase text-slate-400 dark:text-slate-500">{l.code}</span>
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
              className={`hidden sm:inline-flex p-1.5 sm:p-2 rounded-lg border transition ${
                voiceEnabled ? 'bg-amber-500/20 border-amber-400 text-amber-500' : 'bg-slate-100 dark:bg-slate-900/60 border-slate-300 dark:border-slate-700/60 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title="Voice Accessibility Reader"
            >
              {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:text-amber-500 transition"
              title="Toggle Theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-purple-600" />}
            </button>

            {/* Electoral Notifications Bell & Drawer */}
            <div className="relative">
              <button
                onClick={() => setShowNotifDrawer(!showNotifDrawer)}
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:text-amber-500 transition relative"
                title={`Notifications (${unreadCount} unread)`}
                aria-label={`Notifications (${unreadCount} unread)`}
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-amber-500 text-slate-950 font-bold text-[10px] rounded-full flex items-center justify-center animate-pulse shadow-sm">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown / Small Modal Screen */}
              {showNotifDrawer && (
                <>
                  {/* Backdrop overlay to cancel/close on outside click */}
                  <div
                    className="fixed inset-0 z-40 bg-black/25 backdrop-blur-[1px]"
                    onClick={() => setShowNotifDrawer(false)}
                    aria-hidden="true"
                  />

                  <div className="fixed sm:absolute right-2 sm:right-0 top-18 sm:top-full mt-2 w-[calc(100vw-1rem)] sm:w-96 max-w-sm sm:max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-amber-500/30 rounded-2xl shadow-2xl p-3.5 sm:p-4 z-50 backdrop-blur-2xl transition-all">
                    {/* Header with Title, Count Badges, and Cancel/Close Button */}
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5 mb-2.5">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400">
                          <Bell className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
                            Electoral Alerts
                          </h4>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300">
                              {unreadCount} Unread
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                              • {notifications.length} Total
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Header Cancel / Close Button */}
                      <button
                        onClick={() => setShowNotifDrawer(false)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition"
                        title="Cancel / Close notifications"
                        aria-label="Cancel and close notifications"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Notification Items List */}
                    <div className="max-h-64 sm:max-h-72 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                      {notifications.length === 0 ? (
                        <div className="text-center py-6 text-slate-400 text-xs">
                          No electoral notifications at this time.
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => markNotificationRead(n.id)}
                            className={`p-2.5 rounded-xl border text-xs cursor-pointer transition relative group ${
                              n.read
                                ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                                : 'bg-amber-500/10 dark:bg-amber-950/40 border-amber-500/40 text-slate-900 dark:text-slate-100 hover:border-amber-500'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <span className="font-bold text-amber-700 dark:text-amber-300 text-xs flex items-center gap-1.5">
                                {!n.read && (
                                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
                                )}
                                {n.title}
                              </span>
                              <span className="text-[9px] text-slate-500 dark:text-slate-400 whitespace-nowrap font-mono shrink-0">
                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} IST
                              </span>
                            </div>
                            <p className="text-[11px] leading-relaxed text-slate-700 dark:text-slate-300">
                              {n.message}
                            </p>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Footer Actions: Mark all read + Cancel button */}
                    <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-2.5 mt-2.5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={markAllNotificationsRead}
                          disabled={unreadCount === 0}
                          className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 hover:underline disabled:opacity-40 disabled:hover:no-underline"
                        >
                          Mark all read
                        </button>
                        <span className="text-slate-300 dark:text-slate-700">•</span>
                        <button
                          onClick={handleSimulateAlert}
                          className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                          title="Simulate receiving a new live notification"
                        >
                          + Test Alert
                        </button>
                      </div>

                      {/* Explicit Cancel Button */}
                      <button
                        onClick={() => setShowNotifDrawer(false)}
                        className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition border border-slate-300 dark:border-slate-700 shadow-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Mobile Navigation Drawer Toggle */}
            <button
              onClick={toggleMobileSidebar}
              className="p-1.5 sm:p-2 rounded-lg bg-slate-100 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-amber-500 md:hidden transition shadow-sm"
              aria-label="Toggle mobile menu"
            >
              {isMobileOpen ? <X className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" /> : <Menu className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>

            {/* TOP RIGHT CORNER: Sovereign Authentication Controls */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-1.5 sm:space-x-2 pl-1 sm:pl-2 border-l border-slate-200 dark:border-slate-800">
                <Link
                  to={isAdmin ? '/admin' : '/dashboard'}
                  className="flex items-center space-x-1.5 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900/80 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 transition"
                  title="View Portal Dashboard"
                >
                  <div className="w-6 h-6 rounded-full overflow-hidden border border-amber-400 shrink-0">
                    <img
                      src={user?.faceImageUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80'}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="hidden xs:inline-block text-xs font-semibold text-slate-800 dark:text-slate-200 max-w-[80px] sm:max-w-[110px] truncate">
                    {user?.fullName?.split(' ')[0]}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 sm:space-x-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 active:bg-rose-500/30 border border-rose-500/30 text-rose-600 dark:text-rose-400 font-bold text-xs shadow-sm transition cursor-pointer"
                  title={t('nav_logout')}
                  aria-label={t('nav_logout')}
                >
                  <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                  <span className="hidden xs:inline-block">{t('nav_logout')}</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <Link
                  to="/register"
                  className="hidden md:inline-flex px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 transition"
                >
                  {t('nav_register')}
                </Link>
                <Link
                  to="/login"
                  className="flex items-center gap-1 sm:gap-1.5 px-2.5 py-1.5 sm:px-3.5 sm:py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 shadow-md shadow-amber-600/20 active:scale-95 transition shrink-0"
                  title={t('nav_login')}
                >
                  <User className="w-3.5 h-3.5 shrink-0" />
                  <span className="whitespace-nowrap sm:hidden">Sign In</span>
                  <span className="whitespace-nowrap hidden sm:inline">{t('nav_login')}</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>

    {/* Live Notification Pop-up Toast */}
    {activePopup && (
      <div
        role="alert"
        aria-live="assertive"
        className="fixed top-20 right-3 sm:right-6 z-[100] max-w-sm sm:max-w-md w-[calc(100vw-1.5rem)] bg-white dark:bg-slate-900 border-2 border-amber-500 rounded-2xl shadow-2xl p-4 backdrop-blur-2xl animate-bounce-short transition-all"
      >
        {/* Tricolor accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1 flex rounded-t-2xl overflow-hidden">
          <div className="h-full flex-1 bg-amber-500" />
          <div className="h-full flex-1 bg-white" />
          <div className="h-full flex-1 bg-emerald-600" />
        </div>

        <div className="flex items-start gap-3 mt-1">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 animate-pulse">
            <Bell className="w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                New Electoral Alert
              </span>
              <span className="text-[10px] font-mono text-slate-500">Just now</span>
            </div>

            <h5 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm mt-1 leading-snug">
              {activePopup.title}
            </h5>

            <p className="text-slate-600 dark:text-slate-300 text-[11px] sm:text-xs mt-1 leading-relaxed line-clamp-2">
              {activePopup.message}
            </p>

            <div className="flex items-center justify-end gap-2 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => {
                  setShowNotifDrawer(true);
                  markNotificationRead(activePopup.id);
                  setActivePopup(null);
                }}
                className="px-2.5 py-1 rounded-lg text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 transition shadow-sm"
              >
                View in Notices
              </button>
              <button
                onClick={() => setActivePopup(null)}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition border border-slate-200 dark:border-slate-700"
              >
                Cancel
              </button>
            </div>
          </div>

          <button
            onClick={() => setActivePopup(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition -mr-1 -mt-1"
            aria-label="Cancel notification popup"
            title="Cancel / Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    )}
  </>
  );
}
