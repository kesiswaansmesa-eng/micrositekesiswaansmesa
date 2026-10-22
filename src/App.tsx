import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LinkItem,
  PrestasiItem,
  SocialLink,
  ActivityNotification,
  SchoolProfile,
  AnalyticsData,
  CategoryType
} from './types';
import {
  INITIAL_SCHOOL_PROFILE,
  INITIAL_LINKS,
  INITIAL_PRESTASI,
  INITIAL_SOCIAL_LINKS,
  INITIAL_NOTIFICATIONS,
  INITIAL_ANALYTICS
} from './data/initialData';
import { ResumeModal } from './components/ResumeModal';
import { NotificationManager, triggerSystemPush } from './components/NotificationManager';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { AdminPanel } from './components/AdminPanel';
import {
  getAppsScriptUrl,
  fetchAllFromGoogleSheet,
  syncAllToGoogleSheet,
  trackLinkClickInSheet,
  trackVisitorInSheet,
  isAutoSyncEnabled
} from './services/googleSheetService';

import {
  FileText,
  Award,
  Users,
  ShieldCheck,
  Sparkles,
  Calendar,
  BookOpen,
  Globe,
  Instagram,
  Youtube,
  Video,
  MessageCircle,
  Download,
  Bell,
  Moon,
  Sun,
  Share2,
  Check,
  ChevronRight,
  BarChart3,
  KeyRound,
  FileCode,
  Search,
  ExternalLink,
  Plus,
  ClipboardPaste,
  Pin
} from 'lucide-react';

export default function App() {
  // Theme state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('smesa_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Core Data States (persisted in localStorage for real-time reactivity)
  const [profile] = useState<SchoolProfile>(INITIAL_SCHOOL_PROFILE);

  const [links, setLinks] = useState<LinkItem[]>(() => {
    const saved = localStorage.getItem('smesa_links_v3');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_LINKS;
  });

  const [prestasi, setPrestasi] = useState<PrestasiItem[]>(() => {
    const saved = localStorage.getItem('smesa_prestasi_v3');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_PRESTASI;
  });

  const [notifications, setNotifications] = useState<ActivityNotification[]>(() => {
    const saved = localStorage.getItem('smesa_notifs_v3');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_NOTIFICATIONS;
  });

  const [analytics, setAnalytics] = useState<AnalyticsData>(() => {
    const saved = localStorage.getItem('smesa_analytics_v3');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_ANALYTICS;
  });

  // UI Navigation & Modals
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isResumeModalOpen, setIsResumeModalOpen] = useState<boolean>(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState<boolean>(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState<boolean>(false);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [selectedPrestasiDetail, setSelectedPrestasiDetail] = useState<PrestasiItem | null>(null);

  // Link copy feedback state
  const [copiedLink, setCopiedLink] = useState(false);

  // Sync theme to <html> class
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('smesa_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('smesa_theme', 'light');
    }
  }, [darkMode]);

  // Initial Data Fetch from Google Sheet (if configured)
  useEffect(() => {
    const appsScriptUrl = getAppsScriptUrl();
    if (appsScriptUrl) {
      fetchAllFromGoogleSheet().then(result => {
        if (result.success && result.data) {
          if (result.data.links && result.data.links.length > 0) {
            setLinks(result.data.links);
            localStorage.setItem('smesa_links_v3', JSON.stringify(result.data.links));
          }
          if (result.data.prestasi && result.data.prestasi.length > 0) {
            setPrestasi(result.data.prestasi);
            localStorage.setItem('smesa_prestasi_v3', JSON.stringify(result.data.prestasi));
          }
          if (result.data.notifications && result.data.notifications.length > 0) {
            setNotifications(result.data.notifications);
            localStorage.setItem('smesa_notifs_v3', JSON.stringify(result.data.notifications));
          }
        }
      }).catch(() => {});

      // Non-blocking visitor tracking to Google Sheet
      const device = window.innerWidth < 768 ? 'Mobile' : (window.innerWidth < 1024 ? 'Tablet' : 'Desktop');
      trackVisitorInSheet(device, document.referrer);
    }
  }, []);

  // Persist links
  useEffect(() => {
    localStorage.setItem('smesa_links_v3', JSON.stringify(links));
  }, [links]);

  // Persist prestasi
  useEffect(() => {
    localStorage.setItem('smesa_prestasi_v3', JSON.stringify(prestasi));
  }, [prestasi]);

  // Persist notifications
  useEffect(() => {
    localStorage.setItem('smesa_notifs_v3', JSON.stringify(notifications));
  }, [notifications]);

  // Persist analytics
  useEffect(() => {
    localStorage.setItem('smesa_analytics_v3', JSON.stringify(analytics));
  }, [analytics]);

  // Handle Link Click tracking
  const handleLinkClick = (link: LinkItem) => {
    setLinks(prev => prev.map(l => l.id === link.id ? { ...l, clickCount: l.clickCount + 1 } : l));
    setAnalytics(prev => ({
      ...prev,
      linkClicks: {
        ...prev.linkClicks,
        [link.id]: (prev.linkClicks[link.id] || 0) + 1
      }
    }));
    // Real-time track in Google Sheet
    trackLinkClickInSheet(link.id, link.title);
  };

  // Handle Resume Download tracking
  const handleResumeDownloadTracked = () => {
    setAnalytics(prev => ({
      ...prev,
      resumeDownloads: prev.resumeDownloads + 1
    }));
  };

  // Notification read handlers
  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  // Broadcast from admin
  const handleBroadcastNotification = (notif: ActivityNotification) => {
    setNotifications(prev => {
      const updated = [notif, ...prev];
      if (isAutoSyncEnabled() && getAppsScriptUrl()) {
        syncAllToGoogleSheet({
          links,
          prestasi,
          notifications: updated,
          analytics
        }).catch(() => {});
      }
      return updated;
    });
  };

  // Reset to initial data
  const handleResetData = () => {
    setLinks(INITIAL_LINKS);
    setPrestasi(INITIAL_PRESTASI);
    setNotifications(INITIAL_NOTIFICATIONS);
    setAnalytics(INITIAL_ANALYTICS);
    localStorage.removeItem('smesa_links_v3');
    localStorage.removeItem('smesa_prestasi_v3');
    localStorage.removeItem('smesa_notifs_v3');
    localStorage.removeItem('smesa_analytics_v3');
  };

  // Share link
  const handleShareMicrosite = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Microsite Kesiswaan SMKN 1 Jember',
        text: 'Akses tautan resmi kesiswaan, layanan siswa, dan portofolio prestasi SMKN 1 Jember.',
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Unread notifications count
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Filtered links
  const filteredLinks = links
    .filter(l => l.isActive)
    .filter(l => {
      if (activeCategory === 'all') return true;
      return l.category === activeCategory;
    })
    .filter(l => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        l.title.toLowerCase().includes(q) ||
        (l.subtitle && l.subtitle.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));

  // Render Category Icon for Link
  const renderLinkIcon = (iconName: string) => {
    switch (iconName) {
      case 'FileText': return <FileText className="w-5 h-5" />;
      case 'Award': return <Award className="w-5 h-5" />;
      case 'Users': return <Users className="w-5 h-5" />;
      case 'ShieldCheck': return <ShieldCheck className="w-5 h-5" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5" />;
      case 'Calendar': return <Calendar className="w-5 h-5" />;
      case 'BookOpen': return <BookOpen className="w-5 h-5" />;
      default: return <Globe className="w-5 h-5" />;
    }
  };

  const categoriesList = [
    { id: 'all', label: 'Semua Tautan' },
    { id: 'layanan', label: 'Layanan Siswa' },
    { id: 'prestasi', label: 'Prestasi & SIPRES' },
    { id: 'ekskul', label: 'Ekskul & OSIS' },
    { id: 'tata-tertib', label: 'Tata Tertib' },
    { id: 'beasiswa', label: 'Beasiswa PIP' },
    { id: 'kegiatan', label: 'Agenda & Event' }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      
      {/* 1. TOP BAR CONTRACT: Exactly 3 Zones (Brand title - Nav Links - 1 Primary Action) */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-8">
          
          {/* ZONE 1: Brand Wordmark with School Logo */}
          <a
            href="/"
            className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0 flex items-center gap-2.5"
          >
            <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-0.5 flex items-center justify-center shadow-xs overflow-hidden">
              <img
                src={profile.logoUrl || "https://iili.io/nODPK6g.md.png"}
                alt="Logo SMKN 1 Jember"
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <span className="hidden sm:inline">Kesiswaan SMKN 1 Jember</span>
            <span className="sm:hidden">Kesiswaan SMESA</span>
          </a>

          {/* ZONE 2: Concise Nav Links (Clean Public View) */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <a href="#tautan" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap shrink-0">
              Tautan Kesiswaan
            </a>
            <a href="#prestasi" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap shrink-0">
              Prestasi Siswa
            </a>
            <button
              onClick={() => setIsAnalyticsOpen(true)}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Statistik Kunjungan
            </button>
            <button
              onClick={() => setIsAdminOpen(true)}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1 text-blue-600 dark:text-blue-400 font-bold"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>cPanel Admin</span>
            </button>
          </nav>

          {/* ZONE 3: 1 Primary Action + Quick Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            
            {/* Notification Activity Bell */}
            <button
              onClick={() => setIsNotificationOpen(true)}
              className="relative p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              title="Pemberitahuan Kegiatan Kesiswaan"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center font-mono">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              title={darkMode ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* cPanel Admin Button (Password = admin123) */}
            <button
              onClick={() => setIsAdminOpen(true)}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Masuk ke cPanel Manajemen Kesiswaan (Password: admin123)"
            >
              <KeyRound className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">cPanel Admin</span>
              <span className="sm:hidden">cPanel</span>
            </button>

            {/* Primary Action: Unduh / Cetak Resume Kesiswaan */}
            <button
              onClick={() => {
                handleResumeDownloadTracked();
                setIsResumeModalOpen(true);
              }}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Resume Kesiswaan</span>
              <span className="sm:hidden">Resume</span>
            </button>
          </div>

        </div>
      </header>

      {/* 2. MAIN CONTAINER - Optimized, Animated & 100% Responsive to All Screens */}
      <main className="flex-1 max-w-xl mx-auto w-full px-4 sm:px-6 py-6 pb-20">
        
        {/* HERO PROFILE SECTION WITH ANIMATION */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-6"
        >
          {/* LOGO BADGE */}
          <div className="relative inline-block mb-3.5">
            <motion.a
              href="https://freeimage.host/i/nODPK6g"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              className="w-24 h-24 mx-auto rounded-3xl bg-white dark:bg-slate-900 p-2 shadow-md border border-slate-200/80 dark:border-slate-800 flex items-center justify-center overflow-hidden cursor-pointer block"
              title="Logo Resmi Kesiswaan SMK Negeri 1 Jember"
            >
              <img
                src="https://iili.io/nODPK6g.md.png"
                alt="nODPK6g.md.png"
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </motion.a>
            <span
              className="absolute bottom-0 right-0 bg-emerald-500 text-white rounded-full p-1.5 shadow"
              title="Institusi Resmi & Terakreditasi A"
            >
              <Check className="w-3.5 h-3.5" strokeWidth={3} />
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {profile.name}
          </h1>
          <p className="text-xs font-bold text-blue-600 dark:text-blue-400 mt-0.5 uppercase tracking-wide">
            Biro Pengembangan Kesiswaan & Karakter Siswa
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto mt-1.5 leading-relaxed">
            {profile.tagline}
          </p>

          {/* UNBOXED METADATA */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-2.5">
            <span>NPSN {profile.npsn}</span>
            <span aria-hidden="true">·</span>
            <span>{profile.accreditation}</span>
            <span aria-hidden="true">·</span>
            <span>Jl. Jambu No.17 Patrang - Jember</span>
          </div>

          {/* 3-COLUMN QUANTITATIVE RIGOR METRICS */}
          <div className="grid grid-cols-3 gap-2 mt-4 py-3 px-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center shadow-xs">
            <div>
              <div className="text-lg font-bold text-slate-900 dark:text-white font-mono tabular-nums">
                {profile.totalStudents.toLocaleString('id-ID')}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Total Siswa</div>
            </div>
            <div className="border-x border-slate-200 dark:border-slate-800">
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400 font-mono tabular-nums">
                {profile.totalEkskul}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Organisasi & Ekskul</div>
            </div>
            <div>
              <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
                Unggul
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Akreditasi A</div>
            </div>
          </div>

          {/* SOCIAL MEDIA QUICK BAR */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {INITIAL_SOCIAL_LINKS.map(soc => (
              <motion.a
                key={soc.id}
                href={soc.url}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -2, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-300 transition-colors shadow-xs"
                title={soc.name}
              >
                {soc.icon === 'Instagram' && <Instagram className="w-4 h-4" />}
                {soc.icon === 'Youtube' && <Youtube className="w-4 h-4" />}
                {soc.icon === 'Video' && <Video className="w-4 h-4" />}
                {soc.icon === 'MessageCircle' && <MessageCircle className="w-4 h-4 text-emerald-600" />}
              </motion.a>
            ))}
            <motion.button
              onClick={handleShareMicrosite}
              whileHover={{ y: -2, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-300 transition-colors shadow-xs"
              title="Bagikan Tautan Microsite"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            </motion.button>
          </div>
        </motion.div>



        {/* SEARCH & CATEGORY FILTER */}
        <div id="tautan" className="space-y-3 mb-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Cari layanan kesiswaan, tata tertib, beasiswa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs transition-all"
            />
          </div>

          {/* CATEGORY TABS (Interactive filter controls) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            {categoriesList.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-semibold transition-all shrink-0 text-xs cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-blue-400'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* ACTIVE IMPORTANT LINKS LIST WITH FLUID ANIMATIONS */}
        <div className="space-y-2.5 mb-8">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Tautan Fasilitas & Layanan Kesiswaan
            </h3>
            <span className="text-[11px] text-slate-400 font-mono tabular-nums">
              {filteredLinks.length} Tautan Aktif
            </span>
          </div>

          {filteredLinks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-10 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-400"
            >
              Tidak ada tautan kesiswaan yang cocok dengan kata kunci pencarian.
            </motion.div>
          ) : (
            <motion.div layout className="space-y-2.5">
              <AnimatePresence>
                {filteredLinks.map((link, idx) => (
                  <motion.a
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25, delay: idx * 0.03 }}
                    whileHover={{ y: -2, transition: { duration: 0.15 } }}
                    whileTap={{ scale: 0.985 }}
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleLinkClick(link)}
                    className="group block p-3.5 bg-white dark:bg-slate-900 hover:bg-blue-50/50 dark:hover:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 transition-all shadow-xs cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:bg-blue-600 group-hover:text-white transition-all">
                          {renderLinkIcon(link.iconName)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {link.title}
                            </span>
                            {link.isPinned && (
                              <span title="Tautan Disematkan">
                                <Pin className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                              </span>
                            )}
                            {link.badgeText && (
                              <span className="text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 px-2 py-0.5 rounded-md">
                                {link.badgeText}
                              </span>
                            )}
                          </div>
                          {link.subtitle && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                              {link.subtitle}
                            </p>
                          )}
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-1">
                            <span className="capitalize">{link.category}</span>
                            <span>·</span>
                            <span>{link.clickCount.toLocaleString('id-ID')} klik</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors pt-2 shrink-0">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </motion.a>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>

        {/* STUDENT ACHIEVEMENTS SHOWCASE (PRESTASI SISWA) */}
        <section id="prestasi" className="space-y-3 mb-8">
          <div className="flex items-center justify-between px-1">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Portofolio Prestasi Siswa Terkini
              </h3>
              <p className="text-[11px] text-slate-400">Rekam jejak kejuaraan LKS Nasional, Olimpiade, dan DUDI</p>
            </div>
            <span className="text-[11px] text-slate-400 font-mono tabular-nums">
              {prestasi.length} Prestasi
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {prestasi.slice(0, 4).map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                whileHover={{ y: -2 }}
                onClick={() => setSelectedPrestasiDetail(item)}
                className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 transition-all cursor-pointer shadow-xs group"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {item.title}
                  </span>
                  <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-300 px-2 py-0.5 rounded shrink-0">
                    {item.rank}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed mb-2.5">
                  {item.description}
                </p>

                {/* UNBOXED METADATA */}
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-2">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{item.studentName}</span>
                  <span aria-hidden="true">·</span>
                  <span>{item.major}</span>
                  <span aria-hidden="true">·</span>
                  <span>Tingkat {item.competitionLevel} ({item.year})</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono text-[10px] text-slate-400">{item.verificationCode}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* OFFICIAL FOOTER */}
        <footer className="text-center pt-6 border-t border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 space-y-2">
          <div className="flex items-center justify-center gap-4 text-xs font-medium">
            <button onClick={() => setIsAnalyticsOpen(true)} className="hover:underline cursor-pointer">
              Statistik Trafik
            </button>
            <span>·</span>
            <button onClick={() => setIsAdminOpen(true)} className="hover:underline cursor-pointer text-blue-600 dark:text-blue-400 font-semibold">
              cPanel Admin Kesiswaan
            </button>
            <span>·</span>
            <button onClick={() => setIsResumeModalOpen(true)} className="hover:underline cursor-pointer">
              Cetak Resume Kesiswaan
            </button>
          </div>

          <p className="text-xs font-mono font-medium text-slate-600 dark:text-slate-300">
            ict@kesiswaan20226
          </p>
          <p className="text-[11px] leading-relaxed">
            &copy; 2026 Biro Kesiswaan SMK Negeri 1 Jember (SMESA).<br/>
            Jl. Jambu No.17 Patrang - Jember | NPSN: {profile.npsn}
          </p>
        </footer>

      </main>

      {/* MODAL 1: RESUME & TALENT DOSSIER MODAL */}
      <ResumeModal
        isOpen={isResumeModalOpen}
        onClose={() => setIsResumeModalOpen(false)}
        profile={profile}
        prestasi={prestasi}
        onDownloadTracked={handleResumeDownloadTracked}
      />

      {/* DRAWER 1: PUSH NOTIFICATION & ACTIVITY FEED */}
      <NotificationManager
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
      />

      {/* MODAL 2: IN-DEPTH ANALYTICS DASHBOARD */}
      <AnalyticsDashboard
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
        analytics={analytics}
        links={links}
        prestasi={prestasi}
      />

      {/* MODAL 3: CPANEL ADMIN KESISWAAN (ALL MANAGEMENT PANELS IN ONE HUB) */}
      <AdminPanel
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        links={links}
        onUpdateLinks={setLinks}
        prestasi={prestasi}
        onUpdatePrestasi={setPrestasi}
        onBroadcastNotification={handleBroadcastNotification}
        onResetData={handleResetData}
        analytics={analytics}
        profile={profile}
        socials={INITIAL_SOCIAL_LINKS}
        notifications={notifications}
        onUpdateNotifications={setNotifications}
      />

      {/* MODAL 5: DETAIL PRESTASI SISWA POPUP */}
      <AnimatePresence>
        {selectedPrestasiDetail && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    {selectedPrestasiDetail.rank} · Tingkat {selectedPrestasiDetail.competitionLevel}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                    {selectedPrestasiDetail.title}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedPrestasiDetail(null)}
                  className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {selectedPrestasiDetail.description}
              </p>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Nama Siswa:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{selectedPrestasiDetail.studentName} ({selectedPrestasiDetail.studentClass})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Kompetensi Keahlian:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{selectedPrestasiDetail.major}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Penyelenggara:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{selectedPrestasiDetail.organizer}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Guru Pembimbing:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{selectedPrestasiDetail.mentorTeacher}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 dark:border-slate-700 pt-1.5">
                  <span className="text-slate-500">Kode Sertifikat:</span>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{selectedPrestasiDetail.verificationCode}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setSelectedPrestasiDetail(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold"
                >
                  Tutup
                </button>
                <button
                  onClick={() => {
                    setSelectedPrestasiDetail(null);
                    setIsResumeModalOpen(true);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold"
                >
                  Cetak di Dokumen Resume
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
