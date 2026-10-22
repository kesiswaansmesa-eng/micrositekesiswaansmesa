import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LinkItem,
  PrestasiItem,
  MajorType,
  CategoryType,
  ActivityNotification,
  AnalyticsData,
  SchoolProfile,
  SocialLink
} from '../types';
import { triggerSystemPush } from './NotificationManager';
import { generateSingleFileHtml } from '../utils/htmlGenerator';
import {
  X,
  Lock,
  KeyRound,
  Plus,
  Edit2,
  Trash2,
  Pin,
  Globe,
  Award,
  Bell,
  Save,
  RotateCcw,
  Check,
  ExternalLink,
  Sparkles,
  ClipboardPaste,
  Eye,
  Layers,
  LayoutDashboard,
  BarChart3,
  FileCode,
  Settings,
  Copy,
  Download,
  Smartphone,
  Monitor,
  Tablet,
  TrendingUp,
  FileSpreadsheet,
  CheckCircle2,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Calendar,
  MousePointerClick,
  Users,
  Database,
  RefreshCw,
  Send,
  Wifi,
  WifiOff,
  AlertCircle,
  HelpCircle,
  Code,
  Building2,
  MapPin,
  UserCheck,
  GraduationCap,
  Phone,
  Mail
} from 'lucide-react';
import {
  getAppsScriptUrl,
  setAppsScriptUrl,
  testAppsScriptConnection,
  fetchAllFromGoogleSheet,
  syncAllToGoogleSheet,
  getAppsScriptCode,
  isAutoSyncEnabled,
  setAutoSyncEnabled
} from '../services/googleSheetService';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  links: LinkItem[];
  onUpdateLinks: (links: LinkItem[]) => void;
  prestasi: PrestasiItem[];
  onUpdatePrestasi: (prestasi: PrestasiItem[]) => void;
  onBroadcastNotification: (notification: ActivityNotification) => void;
  onResetData: () => void;
  analytics: AnalyticsData;
  profile: SchoolProfile;
  onUpdateProfile: (profile: SchoolProfile) => void;
  socials: SocialLink[];
  notifications?: ActivityNotification[];
  onUpdateNotifications?: (notifications: ActivityNotification[]) => void;
}

const CATEGORY_LABELS: Record<CategoryType, string> = {
  layanan: 'Layanan Siswa & Dispensasi',
  prestasi: 'Prestasi & SIPRES',
  ekskul: 'Ekstrakurikuler & OSIS',
  'tata-tertib': 'Tata Tertib & Disiplin',
  beasiswa: 'Beasiswa & Kesejahteraan',
  kegiatan: 'Agenda & Event Kesiswaan',
  utama: 'Website Resmi Sekolah'
};

const ICON_OPTIONS = [
  'FileText', 'Award', 'Users', 'ShieldCheck', 'Sparkles', 'Calendar', 'BookOpen', 'Globe', 'Briefcase', 'TrendingUp'
];

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  links,
  onUpdateLinks,
  prestasi,
  onUpdatePrestasi,
  onBroadcastNotification,
  onResetData,
  analytics,
  profile,
  onUpdateProfile,
  socials,
  notifications = [],
  onUpdateNotifications
}) => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('smesa_admin_authed') === 'true';
  });
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // Profile Form state (Pengaturan Sistem)
  const [profileForm, setProfileForm] = useState<SchoolProfile>(profile);
  const [profileSavedNotice, setProfileSavedNotice] = useState(false);

  // Sync profileForm if profile updates
  useEffect(() => {
    setProfileForm(profile);
  }, [profile]);

  // Active cPanel Tab
  const [activeTab, setActiveTab] = useState<
    'overview' | 'links' | 'prestasi' | 'broadcast' | 'analytics' | 'export' | 'googlesheet' | 'settings'
  >('overview');

  // Google Sheets & Apps Script State
  const [sheetUrl, setSheetUrl] = useState(() => getAppsScriptUrl());
  const [isTestingSheet, setIsTestingSheet] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isSyncingSheet, setIsSyncingSheet] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [autoSync, setAutoSync] = useState(() => isAutoSyncEnabled());
  const [copiedScript, setCopiedScript] = useState(false);
  const [sheetSubTab, setSheetSubTab] = useState<'guide' | 'code' | 'schema'>('guide');

  // Link Form state
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [linkFormData, setLinkFormData] = useState<Partial<LinkItem>>({
    title: '',
    subtitle: '',
    url: 'https://',
    category: 'layanan',
    iconName: 'FileText',
    isPinned: false,
    isActive: true,
    badgeText: ''
  });

  // Quick Paste URL feedback
  const [pasteNotice, setPasteNotice] = useState<string | null>(null);

  // Prestasi Form state
  const [isAddingPrestasi, setIsAddingPrestasi] = useState(false);
  const [editingPrestasiId, setEditingPrestasiId] = useState<string | null>(null);
  const [prestasiFormData, setPrestasiFormData] = useState<Partial<PrestasiItem>>({
    title: '',
    studentName: '',
    studentClass: '',
    major: 'PPLG',
    competitionLevel: 'Provinsi',
    rank: 'Juara 1',
    year: new Date().getFullYear(),
    eventDate: 'Maret 2026',
    organizer: '',
    description: '',
    mentorTeacher: '',
    verificationCode: `SMESA-${Date.now().toString().slice(-4)}`
  });

  // Broadcast state
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastCategory, setBroadcastCategory] = useState<'kegiatan' | 'prestasi' | 'pengumuman' | 'beasiswa'>('kegiatan');
  const [broadcastUrl, setBroadcastUrl] = useState('');
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  // Export 1-File HTML state
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [exportTab, setExportTab] = useState<'guide' | 'code'>('guide');

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === 'admin123') {
      setIsAuthenticated(true);
      localStorage.setItem('smesa_admin_authed', 'true');
      setPinError(false);
      setPinInput('');
    } else {
      setPinError(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('smesa_admin_authed');
  };

  // QUICK PASTE CLIPBOARD HELPER
  const handleQuickPasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && (text.startsWith('http://') || text.startsWith('https://'))) {
        setLinkFormData(prev => ({
          ...prev,
          url: text,
          title: prev.title || generateDefaultTitleFromUrl(text)
        }));
        setPasteNotice(`URL berhasil ditempelkan: ${text}`);
        setTimeout(() => setPasteNotice(null), 3500);
      } else {
        setPasteNotice('Clipboard tidak memuat URL yang valid (harus berawalan https:// atau http://).');
        setTimeout(() => setPasteNotice(null), 3500);
      }
    } catch (err) {
      setPasteNotice('Silakan paste / tempelkan URL secara manual pada kolom Target URL.');
      setTimeout(() => setPasteNotice(null), 3500);
    }
  };

  const generateDefaultTitleFromUrl = (url: string) => {
    try {
      const parsed = new URL(url);
      const host = parsed.hostname.replace('www.', '');
      return `Layanan ${host}`;
    } catch (e) {
      return 'Tautan Baru Kesiswaan';
    }
  };

  // BACKGROUND AUTO-SYNC TO GOOGLE SHEET
  const triggerBackgroundSync = (
    currentLinks = links,
    currentPrestasi = prestasi,
    currentNotifs = notifications
  ) => {
    if (autoSync && sheetUrl) {
      syncAllToGoogleSheet({
        links: currentLinks,
        prestasi: currentPrestasi,
        notifications: currentNotifs,
        analytics
      }).catch(() => {});
    }
  };

  // LINK HANDLERS
  const handleSaveLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkFormData.title || !linkFormData.url) return;

    if (editingLinkId) {
      const updated = links.map(l => l.id === editingLinkId ? {
        ...l,
        ...linkFormData
      } as LinkItem : l);
      onUpdateLinks(updated);
      triggerBackgroundSync(updated);
      setEditingLinkId(null);
    } else {
      const newLink: LinkItem = {
        id: `link-${Date.now()}`,
        title: linkFormData.title!,
        subtitle: linkFormData.subtitle || '',
        url: linkFormData.url!,
        category: (linkFormData.category as CategoryType) || 'layanan',
        iconName: linkFormData.iconName || 'FileText',
        isPinned: !!linkFormData.isPinned,
        isActive: linkFormData.isActive !== false,
        clickCount: 0,
        badgeText: linkFormData.badgeText || '',
        createdAt: new Date().toISOString().slice(0, 10)
      };
      const updated = [newLink, ...links];
      onUpdateLinks(updated);
      triggerBackgroundSync(updated);
      setIsAddingLink(false);
    }

    setLinkFormData({
      title: '',
      subtitle: '',
      url: 'https://',
      category: 'layanan',
      iconName: 'FileText',
      isPinned: false,
      isActive: true,
      badgeText: ''
    });
  };

  const handleEditLink = (item: LinkItem) => {
    setEditingLinkId(item.id);
    setLinkFormData(item);
    setIsAddingLink(true);
  };

  const handleDeleteLink = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus tautan kesiswaan ini?')) {
      const updated = links.filter(l => l.id !== id);
      onUpdateLinks(updated);
      triggerBackgroundSync(updated);
    }
  };

  const handleTogglePinLink = (id: string) => {
    const updated = links.map(l => l.id === id ? { ...l, isPinned: !l.isPinned } : l);
    onUpdateLinks(updated);
    triggerBackgroundSync(updated);
  };

  const handleToggleActiveLink = (id: string) => {
    const updated = links.map(l => l.id === id ? { ...l, isActive: !l.isActive } : l);
    onUpdateLinks(updated);
    triggerBackgroundSync(updated);
  };

  // PRESTASI HANDLERS
  const handleSavePrestasi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prestasiFormData.title || !prestasiFormData.studentName) return;

    if (editingPrestasiId) {
      const updated = prestasi.map(p => p.id === editingPrestasiId ? {
        ...p,
        ...prestasiFormData
      } as PrestasiItem : p);
      onUpdatePrestasi(updated);
      triggerBackgroundSync(links, updated);
      setEditingPrestasiId(null);
    } else {
      const newPrestasi: PrestasiItem = {
        id: `pres-${Date.now()}`,
        title: prestasiFormData.title!,
        studentName: prestasiFormData.studentName!,
        studentClass: prestasiFormData.studentClass || 'XII',
        major: (prestasiFormData.major as MajorType) || 'PPLG',
        competitionLevel: (prestasiFormData.competitionLevel as PrestasiItem['competitionLevel']) || 'Provinsi',
        rank: prestasiFormData.rank || 'Juara 1',
        year: Number(prestasiFormData.year) || new Date().getFullYear(),
        eventDate: prestasiFormData.eventDate || '2026',
        organizer: prestasiFormData.organizer || 'Dinas Pendidikan Jatim',
        description: prestasiFormData.description || '',
        mentorTeacher: prestasiFormData.mentorTeacher || 'Guru Pembimbing',
        verificationCode: prestasiFormData.verificationCode || `SMESA-${Date.now().toString().slice(-4)}`,
        views: 0
      };
      const updated = [newPrestasi, ...prestasi];
      onUpdatePrestasi(updated);
      triggerBackgroundSync(links, updated);
      setIsAddingPrestasi(false);
    }

    setPrestasiFormData({
      title: '',
      studentName: '',
      studentClass: '',
      major: 'PPLG',
      competitionLevel: 'Provinsi',
      rank: 'Juara 1',
      year: new Date().getFullYear(),
      eventDate: 'Maret 2026',
      organizer: '',
      description: '',
      mentorTeacher: '',
      verificationCode: `SMESA-${Date.now().toString().slice(-4)}`
    });
  };

  const handleEditPrestasi = (item: PrestasiItem) => {
    setEditingPrestasiId(item.id);
    setPrestasiFormData(item);
    setIsAddingPrestasi(true);
  };

  const handleDeletePrestasi = (id: string) => {
    if (confirm('Hapus entri prestasi siswa ini?')) {
      const updated = prestasi.filter(p => p.id !== id);
      onUpdatePrestasi(updated);
      triggerBackgroundSync(links, updated);
    }
  };

  // BROADCAST NOTIFICATION HANDLER
  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMessage) return;

    const notif: ActivityNotification = {
      id: `notif-${Date.now()}`,
      title: broadcastTitle,
      message: broadcastMessage,
      category: broadcastCategory,
      timestamp: 'Baru saja',
      isRead: false,
      actionUrl: broadcastUrl || undefined
    };

    onBroadcastNotification(notif);
    triggerSystemPush(broadcastTitle, broadcastMessage, broadcastUrl || undefined);
    triggerBackgroundSync(links, prestasi, [notif, ...notifications]);

    setBroadcastSuccess(true);
    setBroadcastTitle('');
    setBroadcastMessage('');
    setBroadcastUrl('');
    setTimeout(() => setBroadcastSuccess(false), 3000);
  };

  // EXPORT CSV
  const exportCsv = () => {
    const totalClicks = Object.values(analytics.linkClicks).reduce((a, b) => a + b, 0);
    const headers = ['ID Tautan', 'Judul Tautan', 'Kategori', 'Jumlah Klik', 'Persentase'];
    const rows = links.map(l => {
      const clicks = analytics.linkClicks[l.id] || 0;
      const pct = totalClicks > 0 ? ((clicks / totalClicks) * 100).toFixed(1) : '0';
      return [l.id, `"${l.title.replace(/"/g, '""')}"`, l.category, clicks, `${pct}%`];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + 
      [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Analitik_Trafik_SMESA_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // EXPORT 1-FILE HTML (Supports Live Google Sheets Sync!)
  const singleFileHtmlContent = generateSingleFileHtml(profile, links, prestasi, socials, sheetUrl);

  const handleCopyHtml = () => {
    navigator.clipboard.writeText(singleFileHtmlContent);
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2500);
  };

  const handleDownloadHtmlFile = () => {
    const blob = new Blob([singleFileHtmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `microsite-kesiswaan-smkn1jember.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // GOOGLE SHEETS & APPS SCRIPT ACTION HANDLERS
  const handleSaveSheetUrl = () => {
    setAppsScriptUrl(sheetUrl);
    setTestResult({ success: true, message: 'URL Google Apps Script berhasil disimpan!' });
    setTimeout(() => setTestResult(null), 3000);
  };

  const handleClearSheetUrl = () => {
    if (confirm('Hapus konfigurasi URL Google Apps Script? (Aplikasi akan beralih ke penyimpanan lokal browser)')) {
      setAppsScriptUrl('');
      setSheetUrl('');
      setTestResult(null);
      setSyncFeedback(null);
    }
  };

  const handleTestConnection = async () => {
    setIsTestingSheet(true);
    setTestResult(null);
    const res = await testAppsScriptConnection(sheetUrl);
    setIsTestingSheet(false);
    setTestResult(res);
  };

  const handlePullFromSheet = async () => {
    setIsSyncingSheet(true);
    setSyncFeedback(null);
    const res = await fetchAllFromGoogleSheet();
    setIsSyncingSheet(false);
    if (res.success && res.data) {
      if (res.data.links && res.data.links.length > 0) {
        onUpdateLinks(res.data.links);
      }
      if (res.data.prestasi && res.data.prestasi.length > 0) {
        onUpdatePrestasi(res.data.prestasi);
      }
      if (res.data.profile) {
        onUpdateProfile(res.data.profile);
      }
      if (res.data.notifications && res.data.notifications.length > 0 && onUpdateNotifications) {
        onUpdateNotifications(res.data.notifications);
      }
      setSyncFeedback({ success: true, message: 'Berhasil menarik data tautan, profil & prestasi terbaru dari Google Sheet!' });
    } else {
      setSyncFeedback({ success: false, message: res.message || 'Gagal memuat data dari Google Sheet' });
    }
    setTimeout(() => setSyncFeedback(null), 5000);
  };

  const handlePushToSheet = async () => {
    setIsSyncingSheet(true);
    setSyncFeedback(null);
    const res = await syncAllToGoogleSheet({
      links,
      prestasi,
      notifications,
      analytics,
      profile: profileForm
    });
    setIsSyncingSheet(false);
    setSyncFeedback(res);
    setTimeout(() => setSyncFeedback(null), 5000);
  };

  // Profile Save & Reset Handlers
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(profileForm);
    setProfileSavedNotice(true);
    setTimeout(() => setProfileSavedNotice(false), 3500);

    if (isAutoSyncEnabled() && getAppsScriptUrl()) {
      syncAllToGoogleSheet({
        links,
        prestasi,
        notifications,
        analytics,
        profile: profileForm
      }).catch(() => {});
    }
  };

  const handleResetProfileForm = () => {
    setProfileForm(profile);
  };

  const handleToggleAutoSync = () => {
    const nextVal = !autoSync;
    setAutoSync(nextVal);
    setAutoSyncEnabled(nextVal);
  };

  const handleCopyScriptCode = () => {
    navigator.clipboard.writeText(getAppsScriptCode());
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  const totalClicks = Object.values(analytics.linkClicks).reduce((a, b) => a + b, 0);
  const clickThroughRate = ((totalClicks / analytics.totalViews) * 100).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.22 }}
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-5xl w-full max-h-[94vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
      >
        
        {/* CPANEL TOP BAR */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-xs tracking-wider shadow-sm">
              <LayoutDashboard className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold leading-tight">cPanel Manajemen Kesiswaan</h3>
                <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-400/30 px-1.5 py-0.2 rounded font-mono">
                  v2.6
                </span>
              </div>
              <p className="text-[11px] text-slate-400">{profile.name} · {profile.address}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="px-2.5 py-1 text-xs text-slate-400 hover:text-red-400 transition-colors flex items-center gap-1.5"
                title="Keluar / Kunci cPanel"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Kunci Sesi</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl transition-colors"
              title="Tutup cPanel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* AUTH SCREEN IF NOT AUTHENTICATED */}
        {!isAuthenticated ? (
          <div className="p-8 sm:p-14 text-center max-w-md mx-auto my-auto space-y-4">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center shadow-xs">
              <Lock className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">Akses Masuk cPanel Admin Kesiswaan</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Halaman ini khusus untuk pengelola Kesiswaan SMKN 1 Jember dalam mengatur seluruh tautan, menempelkan URL, dan memperbarui portofolio siswa.
              </p>
              <div className="mt-2 text-xs text-slate-400">
                Password: <code className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-mono font-bold text-blue-600">admin123</code>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-3 pt-2">
              <div>
                <input
                  type="password"
                  autoFocus
                  placeholder="Masukkan Password (admin123)"
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError(false);
                  }}
                  className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-center text-sm font-mono tracking-widest focus:outline-none focus:ring-2 ${
                    pinError
                      ? 'border-red-500 ring-red-500/20'
                      : 'border-slate-200 dark:border-slate-700 focus:ring-blue-500/20 focus:border-blue-500'
                  }`}
                />
                {pinError && (
                  <p className="text-xs text-red-500 mt-1 font-medium">Password salah. Masukkan password yang benar: admin123</p>
                )}
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                Masuk ke cPanel Manajemen
              </button>
            </form>
          </div>
        ) : (
          /* AUTHENTICATED CPANEL LAYOUT WITH SIDEBAR + MAIN CONTENT */
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            
            {/* CPANEL SIDEBAR NAVIGATION */}
            <aside className="w-full md:w-56 shrink-0 bg-slate-50 dark:bg-slate-950/60 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 p-2 sm:p-3 overflow-x-auto md:overflow-y-auto no-scrollbar flex md:flex-col gap-1 text-xs">
              
              <div className="hidden md:block px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Navigasi cPanel
              </div>

              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-medium transition-all text-left whitespace-nowrap cursor-pointer ${
                  activeTab === 'overview'
                    ? 'bg-blue-600 text-white shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 shrink-0" />
                <span>Ringkasan Dasbor</span>
              </button>

              <button
                onClick={() => { setActiveTab('links'); setIsAddingLink(false); setEditingLinkId(null); }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition-all text-left whitespace-nowrap cursor-pointer ${
                  activeTab === 'links'
                    ? 'bg-blue-600 text-white shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Globe className="w-4 h-4 shrink-0" />
                  <span>Kelola & Tempel Link</span>
                </div>
                <span className="text-[10px] opacity-75 font-mono">{links.length}</span>
              </button>

              <button
                onClick={() => { setActiveTab('prestasi'); setIsAddingPrestasi(false); setEditingPrestasiId(null); }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition-all text-left whitespace-nowrap cursor-pointer ${
                  activeTab === 'prestasi'
                    ? 'bg-blue-600 text-white shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Award className="w-4 h-4 shrink-0" />
                  <span>Prestasi Siswa</span>
                </div>
                <span className="text-[10px] opacity-75 font-mono">{prestasi.length}</span>
              </button>

              <button
                onClick={() => setActiveTab('broadcast')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-medium transition-all text-left whitespace-nowrap cursor-pointer ${
                  activeTab === 'broadcast'
                    ? 'bg-blue-600 text-white shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
                }`}
              >
                <Bell className="w-4 h-4 shrink-0" />
                <span>Siaran Push Notifikasi</span>
              </button>

              <button
                onClick={() => setActiveTab('analytics')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-medium transition-all text-left whitespace-nowrap cursor-pointer ${
                  activeTab === 'analytics'
                    ? 'bg-blue-600 text-white shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
                }`}
              >
                <BarChart3 className="w-4 h-4 shrink-0" />
                <span>Analitik Pengunjung</span>
              </button>

              <button
                onClick={() => setActiveTab('googlesheet')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition-all text-left whitespace-nowrap cursor-pointer ${
                  activeTab === 'googlesheet'
                    ? 'bg-blue-600 text-white shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Database className="w-4 h-4 shrink-0 text-emerald-500" />
                  <span>Google Sheet & Backend</span>
                </div>
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    sheetUrl ? 'bg-emerald-500 ring-2 ring-emerald-500/20' : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                  title={sheetUrl ? 'Terhubung ke Google Sheet' : 'Penyimpanan Lokal'}
                />
              </button>

              <button
                onClick={() => setActiveTab('export')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-medium transition-all text-left whitespace-nowrap cursor-pointer ${
                  activeTab === 'export'
                    ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                    : 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                }`}
              >
                <FileCode className="w-4 h-4 shrink-0" />
                <span>Ekspor 1-File HTML</span>
              </button>

              <div className="hidden md:block my-2 border-t border-slate-200 dark:border-slate-800"></div>

              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium transition-all text-left whitespace-nowrap cursor-pointer ${
                  activeTab === 'settings'
                    ? 'bg-blue-600 text-white shadow-xs font-semibold'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Settings className="w-4 h-4 shrink-0" />
                <span>Pengaturan Sistem</span>
              </button>
            </aside>

            {/* CPANEL MAIN CONTENT AREA */}
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-white dark:bg-slate-900">
              
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Ringkasan Dasbor Kesiswaan SMKN 1 Jember
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Statistik live performa tautan, kegiatan siswa, dan status kesiswaan
                    </p>
                  </div>

                  {/* KPI STATS */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] text-slate-500 font-medium">Tautan Aktif</span>
                        <Globe className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
                        {links.filter(l => l.isActive).length} <span className="text-xs text-slate-400 font-normal">/ {links.length}</span>
                      </div>
                      <span className="text-[10px] text-emerald-600 mt-1 block">Live di halaman publik</span>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] text-slate-500 font-medium">Prestasi Siswa</span>
                        <Award className="w-4 h-4 text-amber-500" />
                      </div>
                      <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
                        {prestasi.length}
                      </div>
                      <span className="text-[10px] text-amber-600 mt-1 block">Tersertifikasi SIPRES</span>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] text-slate-500 font-medium">Total Klik Tautan</span>
                        <MousePointerClick className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
                        {totalClicks.toLocaleString('id-ID')}
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 block">CTR: {clickThroughRate}%</span>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] text-slate-500 font-medium">Total Kunjungan</span>
                        <TrendingUp className="w-4 h-4 text-purple-600" />
                      </div>
                      <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
                        {analytics.totalViews.toLocaleString('id-ID')}
                      </div>
                      <span className="text-[10px] text-purple-600 mt-1 block">{analytics.uniqueVisitors} Unik</span>
                    </div>
                  </div>

                  {/* QUICK SHORTCUTS STRIP */}
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800/80 dark:to-slate-800/40 rounded-2xl border border-blue-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block">Aksi Cepat Pengelolaan</span>
                      <p className="text-slate-600 dark:text-slate-300 text-[11px] mt-0.5">
                        Tempel tautan baru atau siarkan pengumuman apel/beasiswa ke browser siswa.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { setActiveTab('links'); setIsAddingLink(true); }}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tempel Link Baru</span>
                      </button>
                      <button
                        onClick={() => setActiveTab('broadcast')}
                        className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-semibold border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Bell className="w-3.5 h-3.5 text-blue-600" />
                        <span>Kirim Siaran</span>
                      </button>
                    </div>
                  </div>

                  {/* RECENT TOP LINKS */}
                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                      Top 5 Tautan Kesiswaan Paling Sering Diakses
                    </h5>
                    <div className="space-y-2">
                      {links.slice(0, 5).map((l, idx) => (
                        <div key={l.id} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2.5 truncate">
                            <span className="font-mono text-slate-400 font-bold w-4">{idx + 1}.</span>
                            <span className="font-semibold text-slate-900 dark:text-white truncate">{l.title}</span>
                          </div>
                          <span className="font-mono font-bold text-blue-600 dark:text-blue-400 shrink-0 ml-2">
                            {l.clickCount.toLocaleString('id-ID')} klik
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: LINK SITE MANAGER */}
              {activeTab === 'links' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        Manajemen Tautan Kesiswaan
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Tempelkan link website baru, edit URL, atur prioritas sematan (Pin), dan aktifkan link
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setIsAddingLink(true);
                          setEditingLinkId(null);
                          setLinkFormData({
                            title: '',
                            subtitle: '',
                            url: 'https://',
                            category: 'layanan',
                            iconName: 'FileText',
                            isPinned: false,
                            isActive: true,
                            badgeText: ''
                          });
                          handleQuickPasteClipboard();
                        }}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer"
                        title="Tempel URL langsung dari clipboard"
                      >
                        <ClipboardPaste className="w-3.5 h-3.5 text-blue-600" />
                        <span>Tempel dari Clipboard</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsAddingLink(!isAddingLink);
                          setEditingLinkId(null);
                          setLinkFormData({
                            title: '',
                            subtitle: '',
                            url: 'https://',
                            category: 'layanan',
                            iconName: 'FileText',
                            isPinned: false,
                            isActive: true,
                            badgeText: ''
                          });
                        }}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{isAddingLink ? 'Tutup Form' : '+ Tambah Link Baru'}</span>
                      </button>
                    </div>
                  </div>

                  {pasteNotice && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-2.5 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 rounded-xl text-xs border border-blue-200 dark:border-blue-900 flex items-center gap-2"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{pasteNotice}</span>
                    </motion.div>
                  )}

                  {/* ADD/EDIT FORM */}
                  <AnimatePresence>
                    {isAddingLink && (
                      <motion.form
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        onSubmit={handleSaveLink}
                        className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-blue-200 dark:border-blue-900 space-y-3.5"
                      >
                        <div className="flex items-center justify-between">
                          <h5 className="text-xs font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                            <Plus className="w-4 h-4 text-blue-600" />
                            <span>{editingLinkId ? 'Edit Tautan Kesiswaan' : 'Form Menempelkan / Menambah Link Baru'}</span>
                          </h5>
                          <button
                            type="button"
                            onClick={() => { setIsAddingLink(false); setEditingLinkId(null); }}
                            className="text-slate-400 hover:text-slate-600 text-xs"
                          >
                            ✕
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div>
                            <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                              Judul Tautan / Nama Layanan *
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="Contoh: Pengajuan Beasiswa PIP SMESA 2026"
                              value={linkFormData.title || ''}
                              onChange={(e) => setLinkFormData({ ...linkFormData, title: e.target.value })}
                              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                              Target URL (Link Situs) *
                            </label>
                            <div className="relative">
                              <input
                                type="url"
                                required
                                placeholder="https://..."
                                value={linkFormData.url || ''}
                                onChange={(e) => setLinkFormData({ ...linkFormData, url: e.target.value })}
                                className="w-full pl-3 pr-8 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono focus:ring-1 focus:ring-blue-500 focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={handleQuickPasteClipboard}
                                className="absolute right-2 top-2 text-slate-400 hover:text-blue-600 cursor-pointer"
                                title="Tempel URL dari clipboard"
                              >
                                <ClipboardPaste className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                          <div>
                            <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                              Kategori Kesiswaan
                            </label>
                            <select
                              value={linkFormData.category || 'layanan'}
                              onChange={(e) => setLinkFormData({ ...linkFormData, category: e.target.value as CategoryType })}
                              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                            >
                              <option value="layanan">Layanan Siswa & Dispensasi</option>
                              <option value="prestasi">Prestasi & SIPRES</option>
                              <option value="ekskul">Ekstrakurikuler & OSIS</option>
                              <option value="tata-tertib">Tata Tertib & Disiplin</option>
                              <option value="beasiswa">Beasiswa & Kesejahteraan</option>
                              <option value="kegiatan">Agenda & Event Kesiswaan</option>
                              <option value="utama">Website Resmi Sekolah</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                              Badge Teks (Opsional)
                            </label>
                            <input
                              type="text"
                              placeholder="Contoh: Baru / Populer / Wajib"
                              value={linkFormData.badgeText || ''}
                              onChange={(e) => setLinkFormData({ ...linkFormData, badgeText: e.target.value })}
                              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                              Pilih Ikon
                            </label>
                            <select
                              value={linkFormData.iconName || 'FileText'}
                              onChange={(e) => setLinkFormData({ ...linkFormData, iconName: e.target.value })}
                              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                            >
                              {ICON_OPTIONS.map(icon => (
                                <option key={icon} value={icon}>{icon}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="text-xs">
                          <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                            Keterangan / Subjudul Penjelas
                          </label>
                          <input
                            type="text"
                            placeholder="Deskripsi singkat untuk membantu siswa memahami fungsi link..."
                            value={linkFormData.subtitle || ''}
                            onChange={(e) => setLinkFormData({ ...linkFormData, subtitle: e.target.value })}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                          />
                        </div>

                        <div className="flex flex-wrap items-center gap-6 text-xs pt-1">
                          <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
                            <input
                              type="checkbox"
                              checked={!!linkFormData.isPinned}
                              onChange={(e) => setLinkFormData({ ...linkFormData, isPinned: e.target.checked })}
                              className="rounded text-blue-600 focus:ring-blue-500"
                            />
                            <span>Sematkan di Urutan Teratas (Pin)</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
                            <input
                              type="checkbox"
                              checked={linkFormData.isActive !== false}
                              onChange={(e) => setLinkFormData({ ...linkFormData, isActive: e.target.checked })}
                              className="rounded text-blue-600 focus:ring-blue-500"
                            />
                            <span>Tampilkan di Halaman Publik (Aktif)</span>
                          </label>
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                          <button
                            type="button"
                            onClick={() => { setIsAddingLink(false); setEditingLinkId(null); }}
                            className="px-3.5 py-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                          >
                            Batal
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>Simpan Tautan</span>
                          </button>
                        </div>
                      </motion.form>
                    )}
                  </AnimatePresence>

                  {/* LINK LIST */}
                  <div className="space-y-2">
                    {links.map((link) => (
                      <div
                        key={link.id}
                        className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 text-xs ${
                          link.isActive
                            ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800/40 border-dashed border-slate-300 dark:border-slate-700 opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-3 truncate">
                          <button
                            onClick={() => handleTogglePinLink(link.id)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${link.isPinned ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/60' : 'text-slate-300 hover:text-slate-500'}`}
                            title={link.isPinned ? 'Lepas Sematan (Pin)' : 'Sematkan ke urutan teratas'}
                          >
                            <Pin className="w-4 h-4" />
                          </button>

                          <div className="truncate">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 dark:text-white truncate">{link.title}</span>
                              {link.badgeText && (
                                <span className="text-[10px] bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded font-semibold">
                                  {link.badgeText}
                                </span>
                              )}
                              <span className="text-[10px] text-slate-400 capitalize">· {CATEGORY_LABELS[link.category] || link.category}</span>
                            </div>
                            <span className="text-[11px] text-slate-400 font-mono truncate block mt-0.5">{link.url}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg transition-colors cursor-pointer"
                            title="Buka / Uji Tautan"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => handleToggleActiveLink(link.id)}
                            className={`text-[10px] px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                              link.isActive
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : 'bg-slate-200 text-slate-600 dark:bg-slate-800'
                            }`}
                          >
                            {link.isActive ? 'Aktif' : 'Nonaktif'}
                          </button>
                          <button
                            onClick={() => handleEditLink(link)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteLink(link.id)}
                            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: PRESTASI MANAGER */}
              {activeTab === 'prestasi' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        Manajemen Prestasi Siswa (SIPRES)
                      </h4>
                      <p className="text-[11px] text-slate-400">Pembaruan kejuaraan LKS, olimpiade, dan kompetensi keahlian</p>
                    </div>
                    <button
                      onClick={() => {
                        setIsAddingPrestasi(!isAddingPrestasi);
                        setEditingPrestasiId(null);
                        setPrestasiFormData({
                          title: '',
                          studentName: '',
                          studentClass: '',
                          major: 'PPLG',
                          competitionLevel: 'Provinsi',
                          rank: 'Juara 1',
                          year: new Date().getFullYear(),
                          eventDate: 'Maret 2026',
                          organizer: '',
                          description: '',
                          mentorTeacher: '',
                          verificationCode: `SMESA-${Date.now().toString().slice(-4)}`
                        });
                      }}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{isAddingPrestasi ? 'Batal' : '+ Tambah Prestasi Baru'}</span>
                    </button>
                  </div>

                  {isAddingPrestasi && (
                    <motion.form
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      onSubmit={handleSavePrestasi}
                      className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-blue-200 dark:border-blue-900 space-y-3"
                    >
                      <h5 className="text-xs font-bold text-blue-900 dark:text-blue-300">
                        {editingPrestasiId ? 'Edit Prestasi Siswa' : 'Entri Prestasi Siswa Baru'}
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="text-[11px] text-slate-500 block mb-1">Nama Lomba / Kejuaraan *</label>
                          <input
                            type="text"
                            required
                            placeholder="Contoh: Juara 1 LKS Web Technologies"
                            value={prestasiFormData.title || ''}
                            onChange={(e) => setPrestasiFormData({ ...prestasiFormData, title: e.target.value })}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-slate-500 block mb-1">Nama Siswa / Tim *</label>
                          <input
                            type="text"
                            required
                            placeholder="Nama Lengkap Siswa"
                            value={prestasiFormData.studentName || ''}
                            onChange={(e) => setPrestasiFormData({ ...prestasiFormData, studentName: e.target.value })}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div>
                          <label className="text-[11px] text-slate-500 block mb-1">Jurusan</label>
                          <select
                            value={prestasiFormData.major || 'PPLG'}
                            onChange={(e) => setPrestasiFormData({ ...prestasiFormData, major: e.target.value as MajorType })}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                          >
                            <option value="PPLG">PPLG</option>
                            <option value="DKV">DKV</option>
                            <option value="AKL">AKL</option>
                            <option value="Bisnis Digital">Bisnis Digital</option>
                            <option value="MPLB">MPLB</option>
                            <option value="Kuliner">Kuliner</option>
                            <option value="Busana">Busana</option>
                            <option value="Umum / Semua">Umum / Semua</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[11px] text-slate-500 block mb-1">Tingkat</label>
                          <select
                            value={prestasiFormData.competitionLevel || 'Provinsi'}
                            onChange={(e) => setPrestasiFormData({ ...prestasiFormData, competitionLevel: e.target.value as PrestasiItem['competitionLevel'] })}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                          >
                            <option value="Internasional">Internasional</option>
                            <option value="Nasional">Nasional</option>
                            <option value="Provinsi">Provinsi</option>
                            <option value="Kabupaten/Kota">Kabupaten/Kota</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[11px] text-slate-500 block mb-1">Peringkat / Medali</label>
                          <input
                            type="text"
                            placeholder="Contoh: Juara 1 / Emas"
                            value={prestasiFormData.rank || ''}
                            onChange={(e) => setPrestasiFormData({ ...prestasiFormData, rank: e.target.value })}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-slate-500 block mb-1">Tahun Lomba</label>
                          <input
                            type="number"
                            value={prestasiFormData.year || 2026}
                            onChange={(e) => setPrestasiFormData({ ...prestasiFormData, year: Number(e.target.value) })}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                          />
                        </div>
                      </div>

                      <div className="text-xs">
                        <label className="text-[11px] text-slate-500 block mb-1">Deskripsi Capaian Lomba</label>
                        <textarea
                          rows={2}
                          placeholder="Jelaskan detail karya atau pencapaian..."
                          value={prestasiFormData.description || ''}
                          onChange={(e) => setPrestasiFormData({ ...prestasiFormData, description: e.target.value })}
                          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="text-[11px] text-slate-500 block mb-1">Guru Pembimbing</label>
                          <input
                            type="text"
                            placeholder="Nama Guru Pembimbing"
                            value={prestasiFormData.mentorTeacher || ''}
                            onChange={(e) => setPrestasiFormData({ ...prestasiFormData, mentorTeacher: e.target.value })}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-slate-500 block mb-1">Nomor Sertifikat</label>
                          <input
                            type="text"
                            placeholder="SMESA-XXX-2026"
                            value={prestasiFormData.verificationCode || ''}
                            onChange={(e) => setPrestasiFormData({ ...prestasiFormData, verificationCode: e.target.value })}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => { setIsAddingPrestasi(false); setEditingPrestasiId(null); }}
                          className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
                        >
                          Simpan Prestasi
                        </button>
                      </div>
                    </motion.form>
                  )}

                  <div className="space-y-2">
                    {prestasi.map((item) => (
                      <div
                        key={item.id}
                        className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs shadow-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-white">{item.title}</span>
                            <span className="text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-2 py-0.5 rounded font-semibold">
                              {item.rank}
                            </span>
                            <span className="text-[10px] text-slate-400">· {item.competitionLevel} ({item.year})</span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            {item.studentName} · {item.major} · No: <span className="font-mono">{item.verificationCode}</span>
                          </p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleEditPrestasi(item)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePrestasi(item.id)}
                            className="p-1.5 text-slate-500 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: BROADCAST NOTIFICATION */}
              {activeTab === 'broadcast' && (
                <div className="max-w-xl mx-auto space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Pusat Siaran Push Notifikasi Kesiswaan
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Pemberitahuan akan langsung disiarkan ke browser siswa & tersimpan di daftar pengumuman kesiswaan
                    </p>
                  </div>

                  {broadcastSuccess && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-3 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      <span>Notifikasi berhasil disiarkan secara real-time ke seluruh pengunjung!</span>
                    </motion.div>
                  )}

                  <form onSubmit={handleSendBroadcast} className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="text-xs">
                      <label className="text-[11px] text-slate-500 block mb-1">Judul Siaran Pengumuman *</label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Seleksi Berkas Beasiswa PIP Tahap I Telah Dibuka"
                        value={broadcastTitle}
                        onChange={(e) => setBroadcastTitle(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div className="text-xs">
                      <label className="text-[11px] text-slate-500 block mb-1">Kategori Pengumuman</label>
                      <select
                        value={broadcastCategory}
                        onChange={(e) => setBroadcastCategory(e.target.value as any)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                      >
                        <option value="kegiatan">Kegiatan & Agenda Kesiswaan</option>
                        <option value="prestasi">Prestasi & Kejuaraan Siswa</option>
                        <option value="beasiswa">Beasiswa & Kesejahteraan Siswa</option>
                        <option value="pengumuman">Pengumuman Penting</option>
                      </select>
                    </div>

                    <div className="text-xs">
                      <label className="text-[11px] text-slate-500 block mb-1">Pesan Lengkap *</label>
                      <textarea
                        rows={3}
                        required
                        placeholder="Tuliskan isi pengumuman atau instruksi untuk siswa..."
                        value={broadcastMessage}
                        onChange={(e) => setBroadcastMessage(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div className="text-xs">
                      <label className="text-[11px] text-slate-500 block mb-1">Tautan Lampiran (Opsional)</label>
                      <input
                        type="url"
                        placeholder="https://..."
                        value={broadcastUrl}
                        onChange={(e) => setBroadcastUrl(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <Bell className="w-4 h-4" />
                      <span>Kirim Siaran Notifikasi Sekarang</span>
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 5: ANALYTICS (Integrated in cPanel) */}
              {activeTab === 'analytics' && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        Analisis Trafik & Kunjungan Kesiswaan
                      </h4>
                      <p className="text-[11px] text-slate-400">Statistik real-time akses siswa dan wali murid</p>
                    </div>
                    <button
                      onClick={exportCsv}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Unduh Laporan CSV</span>
                    </button>
                  </div>

                  {/* KPI METRICS */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
                      <span className="text-[11px] text-slate-500 block">Total Kunjungan</span>
                      <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">{analytics.totalViews.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
                      <span className="text-[11px] text-slate-500 block">Pengunjung Unik</span>
                      <span className="text-xl font-bold font-mono text-purple-600">{analytics.uniqueVisitors.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
                      <span className="text-[11px] text-slate-500 block">Total Klik Link</span>
                      <span className="text-xl font-bold font-mono text-emerald-600">{totalClicks.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
                      <span className="text-[11px] text-slate-500 block">Unduhan Resume</span>
                      <span className="text-xl font-bold font-mono text-amber-600">{analytics.resumeDownloads.toLocaleString('id-ID')}</span>
                    </div>
                  </div>

                  {/* DEVICE DISTRIBUTION */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white mb-3">Distribusi Perangkat Pengunjung</h5>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                        <Smartphone className="w-5 h-5 mx-auto text-blue-600 mb-1" />
                        <span className="text-xs font-bold font-mono">{analytics.deviceBreakdown.mobile}%</span>
                        <span className="text-[10px] text-slate-400 block">Smartphone / Mobile</span>
                      </div>
                      <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                        <Monitor className="w-5 h-5 mx-auto text-purple-600 mb-1" />
                        <span className="text-xs font-bold font-mono">{analytics.deviceBreakdown.desktop}%</span>
                        <span className="text-[10px] text-slate-400 block">Desktop / PC</span>
                      </div>
                      <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                        <Tablet className="w-5 h-5 mx-auto text-emerald-600 mb-1" />
                        <span className="text-xs font-bold font-mono">{analytics.deviceBreakdown.tablet}%</span>
                        <span className="text-[10px] text-slate-400 block">Tablet</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: EXPORT 1-FILE HTML TOOL (Stored exclusively inside cPanel!) */}
              {activeTab === 'export' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <FileCode className="w-4 h-4 text-emerald-600" />
                        <span>Alat Ekspor 1-File HTML Mandiri (Google Sites & Blogspot)</span>
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Hasil ekspor 1 file HTML tanpa server eksternal, siap disalin atau diunggah seketika
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleCopyHtml}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                      >
                        {copiedHtml ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedHtml ? 'Tersalin ke Clipboard!' : 'Salin Kode HTML'}</span>
                      </button>
                      <button
                        onClick={handleDownloadHtmlFile}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Unduh .HTML</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs">
                    <button
                      onClick={() => setExportTab('guide')}
                      className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                        exportTab === 'guide' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Panduan Google Sites & Blogger
                    </button>
                    <button
                      onClick={() => setExportTab('code')}
                      className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                        exportTab === 'code' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Pratinjau Kode Sumber
                    </button>
                  </div>

                  {exportTab === 'guide' ? (
                    <div className="space-y-4 text-xs text-slate-700 dark:text-slate-300">
                      <div className="p-4 bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                        <h5 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                          <Monitor className="w-4 h-4 text-blue-600" />
                          <span>Cara Pasang di Google Sites:</span>
                        </h5>
                        <ol className="list-decimal list-inside space-y-1.5 text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
                          <li>Buka halaman editor situs Google Sites sekolah Anda.</li>
                          <li>Klik menu <strong>Sisipkan (Insert)</strong> di sisi kanan &gt; pilih <strong>Sematkan (Embed)</strong>.</li>
                          <li>Pilih tab <strong>Sematkan Kode (Embed Code)</strong>.</li>
                          <li>Klik tombol hijau <strong>"Salin Kode HTML"</strong> di atas, lalu tempel (Ctrl+V) ke dalam kotak kode.</li>
                          <li>Klik <strong>Berikutnya &gt; Sisipkan</strong>. Atur ukuran frame, lalu klik <strong>Publikasikan</strong>.</li>
                        </ol>
                      </div>

                      <div className="p-4 bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                        <h5 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                          <Globe className="w-4 h-4 text-amber-600" />
                          <span>Cara Pasang di Blogger / Blogspot:</span>
                        </h5>
                        <ol className="list-decimal list-inside space-y-1.5 text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
                          <li>Buka dasbor Blogger.com sekolah &gt; pilih menu <strong>Halaman (Pages)</strong> &gt; buat <strong>Halaman Baru</strong>.</li>
                          <li>Ubah mode editor dari <em>Tampilan Menulis</em> menjadi <strong>Tampilan HTML</strong> (ikon pena).</li>
                          <li>Tempelkan seluruh kode HTML yang telah disalin.</li>
                          <li>Beri judul halaman, lalu klik tombol <strong>Publikasikan</strong>.</li>
                        </ol>
                      </div>
                    </div>
                  ) : (
                    <pre className="p-4 bg-slate-900 text-slate-100 rounded-2xl text-xs font-mono overflow-x-auto max-h-96 border border-slate-800 leading-relaxed">
                      <code>{singleFileHtmlContent}</code>
                    </pre>
                  )}
                </div>
              )}

              {/* TAB: GOOGLE SHEETS & APPS SCRIPT BACKEND */}
              {activeTab === 'googlesheet' && (
                <div className="space-y-5">
                  {/* HEADER */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Database className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>Database Google Sheet & Backend Apps Script</span>
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Sinkronisasi cloud database kesiswaan tanpa server, terhubung ke spreadsheet Google Drive sekolah
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                        sheetUrl
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                      }`}>
                        {sheetUrl ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
                        <span>{sheetUrl ? 'Google Sheet Aktif' : 'Penyimpanan Lokal'}</span>
                      </span>
                    </div>
                  </div>

                  {/* ENDPOINT CONFIGURATION BOX */}
                  <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                        <span>URL Aplikasi Web Google Apps Script (Web App Endpoint)</span>
                      </label>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Target Akun: kesiswaansmesa@gmail.com
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="url"
                        value={sheetUrl}
                        onChange={(e) => setSheetUrl(e.target.value)}
                        placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                        className="flex-1 px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={handleSaveSheetUrl}
                          className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                          title="Simpan URL Endpoint"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>Simpan</span>
                        </button>
                        <button
                          type="button"
                          disabled={!sheetUrl || isTestingSheet}
                          onClick={handleTestConnection}
                          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                          title="Uji apakah endpoint Apps Script merespons"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isTestingSheet ? 'animate-spin' : ''}`} />
                          <span>{isTestingSheet ? 'Menguji...' : 'Uji Koneksi'}</span>
                        </button>
                        {sheetUrl && (
                          <button
                            type="button"
                            onClick={handleClearSheetUrl}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors cursor-pointer"
                            title="Hapus URL"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Test Result Message */}
                    {testResult && (
                      <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                        testResult.success
                          ? 'bg-emerald-100/70 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                          : 'bg-red-100/70 text-red-800 dark:bg-red-950/60 dark:text-red-300 border border-red-300 dark:border-red-800'
                      }`}>
                        {testResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                        <span>{testResult.message}</span>
                      </div>
                    )}
                  </div>

                  {/* DUAL SYNC CONTROLS */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Pull from Google Sheet */}
                    <div className="p-4 bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600">
                            <Download className="w-4 h-4" />
                          </div>
                          <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                            Tarik Data dari Google Sheet (Pull)
                          </h5>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                          Muat pembaruan tautan kesiswaan, prestasi siswa, dan notifikasi yang telah diedit langsung oleh staf di spreadsheet.
                        </p>
                      </div>

                      <button
                        type="button"
                        disabled={!sheetUrl || isSyncingSheet}
                        onClick={handlePullFromSheet}
                        className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isSyncingSheet ? 'animate-spin' : ''}`} />
                        <span>{isSyncingSheet ? 'Sinkronisasi...' : 'Tarik Data dari Google Sheet'}</span>
                      </button>
                    </div>

                    {/* Push to Google Sheet */}
                    <div className="p-4 bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600">
                            <Send className="w-4 h-4" />
                          </div>
                          <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                            Kirim / Sinkronkan ke Google Sheet (Push)
                          </h5>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                          Kirim {links.length} tautan, {prestasi.length} portofolio prestasi, dan ringkasan trafik saat ini untuk disimpan ke sheet database.
                        </p>
                      </div>

                      <button
                        type="button"
                        disabled={!sheetUrl || isSyncingSheet}
                        onClick={handlePushToSheet}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Kirim Seluruh Data ke Sheet</span>
                      </button>
                    </div>
                  </div>

                  {/* Sync Feedback Message */}
                  {syncFeedback && (
                    <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                      syncFeedback.success
                        ? 'bg-emerald-100/70 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                        : 'bg-red-100/70 text-red-800 dark:bg-red-950/60 dark:text-red-300 border border-red-300 dark:border-red-800'
                    }`}>
                      {syncFeedback.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                      <span>{syncFeedback.message}</span>
                    </div>
                  )}

                  {/* AUTO-SYNC TOGGLE BAR */}
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white block">
                        Sinkronisasi Otomatis Real-time
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        Otomatis mengirim data ke Google Sheet setiap kali Anda menambah atau mengedit tautan & prestasi
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleToggleAutoSync}
                      className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                        autoSync ? 'bg-emerald-600 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'
                      }`}
                    >
                      <div className="w-4 h-4 rounded-full bg-white shadow-md"></div>
                    </button>
                  </div>

                  {/* SUB-TABS: GUIDE vs CODE vs SCHEMA */}
                  <div className="border-b border-slate-200 dark:border-slate-800 pb-2 flex items-center gap-2 text-xs overflow-x-auto">
                    <button
                      type="button"
                      onClick={() => setSheetSubTab('guide')}
                      className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                        sheetSubTab === 'guide'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>1. Panduan Penerapan (1 Menit)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSheetSubTab('code')}
                      className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                        sheetSubTab === 'code'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Code className="w-3.5 h-3.5" />
                      <span>2. Kode Apps Script (Code.gs)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSheetSubTab('schema')}
                      className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                        sheetSubTab === 'schema'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>3. Struktur Tabel Database</span>
                    </button>
                  </div>

                  {/* SUB-TAB 1: GUIDE */}
                  {sheetSubTab === 'guide' && (
                    <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
                      <div className="p-4 bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                        <h5 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Langkah-Langkah Membuat Database Google Sheet Gratis:</span>
                        </h5>

                        <ol className="list-decimal list-inside space-y-2 text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
                          <li>
                            Buka browser dan kunjungi <a href="https://sheets.new" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-semibold">sheets.new</a> menggunakan akun Google sekolah (misal: <strong>kesiswaansmesa@gmail.com</strong>).
                          </li>
                          <li>
                            Beri nama spreadsheet Anda di pojok kiri atas: <strong>Database Kesiswaan SMESA</strong>.
                          </li>
                          <li>
                            Klik menu atas: <strong>Ekstensi (Extensions) &gt; Apps Script</strong>.
                          </li>
                          <li>
                            Di editor Apps Script yang terbuka, hapus kode <code>function myFunction() &#123;&#125;</code> bawaan.
                          </li>
                          <li>
                            Buka tab kedua di atas (<strong>2. Kode Apps Script</strong>), klik tombol <strong>"Salin Seluruh Kode Apps Script"</strong>, lalu tempelkan (Ctrl+V) ke editor Apps Script.
                          </li>
                          <li>
                            Klik ikon <strong>Simpan (Disket)</strong> di toolbar atas.
                          </li>
                          <li>
                            Klik tombol biru <strong>Terapkan (Deploy)</strong> di pojok kanan atas &gt; pilih <strong>Penerapan baru (New deployment)</strong>.
                          </li>
                          <li>
                            Klik ikon gerigi di sebelah kiri jenis penerapan &gt; pilih <strong>Aplikasi web (Web app)</strong>:
                            <ul className="list-disc list-inside ml-4 mt-1 space-y-0.5 text-slate-500 dark:text-slate-400">
                              <li>Deskripsi: <code>API Kesiswaan SMESA v1</code></li>
                              <li>Jalankan sebagai: <strong>Saya (kesiswaansmesa@gmail.com)</strong></li>
                              <li>Siapa yang memiliki akses: <strong className="text-emerald-600">Siapa saja (Anyone)</strong> (Penting agar web kesiswaan dapat membaca data tanpa error login)</li>
                            </ul>
                          </li>
                          <li>
                            Klik <strong>Terapkan (Deploy)</strong>. Jika muncul perizinan Google, klik <em>Beri Izin (Authorize access) &gt; Advanced &gt; Go to Untitled project (unsafe) &gt; Allow</em>.
                          </li>
                          <li>
                            Salin <strong>URL Aplikasi Web (Web App URL)</strong> yang berakhiran <code>/exec</code>, lalu tempelkan ke kolom URL di bagian atas halaman cPanel ini dan klik <strong>Simpan</strong>!
                          </li>
                        </ol>
                      </div>
                    </div>
                  )}

                  {/* SUB-TAB 2: CODE.GS */}
                  {sheetSubTab === 'code' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                          File: <code>Code.gs</code> (Siap pakai, sudah dilengkapi auto-setup tabel)
                        </span>
                        <button
                          type="button"
                          onClick={handleCopyScriptCode}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                        >
                          {copiedScript ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedScript ? 'Kode Tersalin!' : 'Salin Seluruh Kode Apps Script'}</span>
                        </button>
                      </div>

                      <pre className="p-4 bg-slate-900 text-slate-100 rounded-2xl text-[11px] font-mono overflow-x-auto max-h-[380px] border border-slate-800 leading-relaxed selection:bg-emerald-600 selection:text-white">
                        <code>{getAppsScriptCode()}</code>
                      </pre>
                    </div>
                  )}

                  {/* SUB-TAB 3: DATABASE SCHEMA */}
                  {sheetSubTab === 'schema' && (
                    <div className="space-y-3 text-xs">
                      <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                        Saat script dijalankan pertama kali, Google Apps Script akan secara otomatis membuat 5 tab sheet berikut dengan header kolom yang rapi:
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="p-3 bg-white dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                          <span className="font-bold text-slate-900 dark:text-white block mb-1">
                            📄 Tab 1: Links (Daftar Tautan)
                          </span>
                          <p className="text-[10px] text-slate-500 font-mono break-words leading-relaxed">
                            id, title, subtitle, url, category, iconName, isPinned, isActive, clickCount, badgeText, createdAt
                          </p>
                        </div>

                        <div className="p-3 bg-white dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                          <span className="font-bold text-slate-900 dark:text-white block mb-1">
                            🏆 Tab 2: Prestasi (SIPRES Siswa)
                          </span>
                          <p className="text-[10px] text-slate-500 font-mono break-words leading-relaxed">
                            id, title, studentName, studentClass, major, competitionLevel, rank, year, eventDate, organizer, mentorTeacher, verificationCode, views
                          </p>
                        </div>

                        <div className="p-3 bg-white dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                          <span className="font-bold text-slate-900 dark:text-white block mb-1">
                            🔔 Tab 3: Notifikasi (Kegiatan & Agenda)
                          </span>
                          <p className="text-[10px] text-slate-500 font-mono break-words leading-relaxed">
                            id, title, message, category, timestamp, isRead, actionUrl
                          </p>
                        </div>

                        <div className="p-3 bg-white dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                          <span className="font-bold text-slate-900 dark:text-white block mb-1">
                            📊 Tab 4 & 5: Analitik & Log_Pengunjung
                          </span>
                          <p className="text-[10px] text-slate-500 font-mono break-words leading-relaxed">
                            Analitik: totalViews, uniqueVisitors, resumeDownloads<br/>
                            Log_Pengunjung: Timestamp, Device, Referrer, UserAgent
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 7: SETTINGS & IDENTITAS LEMBAGA (EDIT FASILITAS) */}
              {activeTab === 'settings' && (
                <div className="max-w-3xl mx-auto space-y-6">
                  
                  {/* HEADER */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-blue-600" />
                        <span>Pengaturan Sistem & Identitas Lembaga</span>
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Kelola keterangan nama sekolah/lembaga, alamat resmi, nama Wakil Kepala Sekolah bidang kesiswaan, dan kontak.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2 py-1 rounded-lg font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Tersinkronisasi Real-Time</span>
                      </span>
                    </div>
                  </div>

                  {/* SUCCESS NOTIFICATION BANNER */}
                  <AnimatePresence>
                    {profileSavedNotice && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="p-3.5 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-700 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-200 shadow-xs"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div className="flex-1">
                          <span className="font-bold">Berhasil Disimpan!</span> Data identitas lembaga, alamat, dan pejabat kesiswaan telah diperbarui dan diterapkan ke seluruh tampilan microsite serta dokumen resume siswa.
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* EDIT FORM */}
                  <form onSubmit={handleSaveProfile} className="space-y-6">
                    
                    {/* BAGIAN 1: IDENTITAS LEMBAGA & PEJABAT RESMI */}
                    <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700/60 pb-2">
                        <GraduationCap className="w-4 h-4 text-blue-600" />
                        <span>1. Nama Lembaga & Pejabat Kesiswaan</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Nama Lembaga / Sekolah Resmi *
                          </label>
                          <input
                            type="text"
                            required
                            value={profileForm.name}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Contoh: SMK Negeri 1 Jember"
                            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          />
                          <span className="text-[10px] text-slate-400 mt-0.5 block">
                            Ditampilkan pada judul utama microsite dan kop dokumen.
                          </span>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Nama Singkat / Brand Lembaga *
                          </label>
                          <input
                            type="text"
                            required
                            value={profileForm.shortName}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, shortName: e.target.value }))}
                            placeholder="Contoh: Kesiswaan SMESA"
                            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          />
                          <span className="text-[10px] text-slate-400 mt-0.5 block">
                            Singkatan sekolah (misal: SMESA) untuk tampilan mobile & badge.
                          </span>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-bold text-blue-700 dark:text-blue-300 mb-1 flex items-center gap-1.5">
                            <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                            <span>Nama Wakil Kepala Sekolah Bidang Kesiswaan (Waka Kesiswaan) *</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={profileForm.headOfKesiswaan}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, headOfKesiswaan: e.target.value }))}
                            placeholder="Contoh: Dra. Hj. Sri Wahyuni, M.Pd."
                            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-blue-300 dark:border-blue-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 shadow-xs"
                          />
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
                            Nama pejabat resmi ini akan tercetak sebagai penandatangan pada dokumen <strong>Resume Kesiswaan</strong> dan rekam jejak sertifikat prestasi siswa.
                          </span>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Nama Kepala Sekolah
                          </label>
                          <input
                            type="text"
                            value={profileForm.headmaster}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, headmaster: e.target.value }))}
                            placeholder="Contoh: Drs. H. Sri Hartono, M.Pd."
                            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Slogan / Visi Pembinaan Kesiswaan
                          </label>
                          <input
                            type="text"
                            value={profileForm.tagline}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, tagline: e.target.value }))}
                            placeholder="Contoh: Membina Generasi Unggul, Berkarakter Kuat..."
                            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* BAGIAN 2: KETERANGAN ALAMAT LENGKAP */}
                    <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700/60 pb-2">
                        <MapPin className="w-4 h-4 text-emerald-600" />
                        <span>2. Keterangan Alamat Sekolah</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div className="sm:col-span-3">
                          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Alamat Lengkap / Nama Jalan & Nomor *
                          </label>
                          <input
                            type="text"
                            required
                            value={profileForm.address}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, address: e.target.value }))}
                            placeholder="Contoh: Jl. Jambu No.17 Patrang"
                            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                          />
                          <span className="text-[10px] text-slate-400 mt-0.5 block">
                            Dicantumkan pada header halaman publik dan footer hak cipta microsite.
                          </span>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Kota / Kabupaten *
                          </label>
                          <input
                            type="text"
                            required
                            value={profileForm.city}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, city: e.target.value }))}
                            placeholder="Contoh: Jember"
                            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Kode Pos
                          </label>
                          <input
                            type="text"
                            value={profileForm.postalCode}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, postalCode: e.target.value }))}
                            placeholder="68118"
                            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* BAGIAN 3: KONTAK & MEDIA RESMI KESISWAAN */}
                    <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700/60 pb-2">
                        <Phone className="w-4 h-4 text-purple-600" />
                        <span>3. Kontak Resmi & Kanal Layanan Siswa</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                            No. WhatsApp Layanan Kesiswaan
                          </label>
                          <input
                            type="text"
                            value={profileForm.whatsappKesiswaan}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, whatsappKesiswaan: e.target.value }))}
                            placeholder="Contoh: 6281233550412"
                            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Email Resmi Kesiswaan
                          </label>
                          <input
                            type="email"
                            value={profileForm.email}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                            placeholder="Contoh: kesiswaansmesa@gmail.com"
                            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Nomor Telepon Sekolah
                          </label>
                          <input
                            type="text"
                            value={profileForm.phone}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                            placeholder="Contoh: (0331) 335041"
                            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Alamat Website Sekolah
                          </label>
                          <input
                            type="url"
                            value={profileForm.website}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, website: e.target.value }))}
                            placeholder="https://smkn1jember.sch.id"
                            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* BAGIAN 4: LEGALITAS, STATISTIK & LOGO SEKOLAH */}
                    <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700/60 pb-2">
                        <ShieldCheck className="w-4 h-4 text-amber-500" />
                        <span>4. Legalitas, Metrik & URL Logo Sekolah</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                            NPSN Sekolah
                          </label>
                          <input
                            type="text"
                            value={profileForm.npsn}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, npsn: e.target.value }))}
                            placeholder="20523847"
                            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Akreditasi Sekolah
                          </label>
                          <input
                            type="text"
                            value={profileForm.accreditation}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, accreditation: e.target.value }))}
                            placeholder="Akreditasi A (Unggul)"
                            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Total Siswa Aktif
                          </label>
                          <input
                            type="number"
                            value={profileForm.totalStudents}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, totalStudents: parseInt(e.target.value) || 0 }))}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Total Ekskul & Organisasi
                          </label>
                          <input
                            type="number"
                            value={profileForm.totalEkskul}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, totalEkskul: parseInt(e.target.value) || 0 }))}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                          />
                        </div>

                        {/* URL LOGO WITH LIVE PREVIEW */}
                        <div className="sm:col-span-4 pt-1">
                          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                            URL Gambar Logo Sekolah (PNG / SVG)
                          </label>
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-1 flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
                              <img
                                src={profileForm.logoUrl || "https://iili.io/nODPK6g.md.png"}
                                alt="Pratinjau Logo"
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            </div>
                            <input
                              type="url"
                              value={profileForm.logoUrl || ''}
                              onChange={(e) => setProfileForm(prev => ({ ...prev, logoUrl: e.target.value }))}
                              placeholder="https://iili.io/nODPK6g.md.png"
                              className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                          </div>
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            Logo bawaan: <code className="bg-slate-200/60 dark:bg-slate-800 px-1 py-0.5 rounded text-[10px]">https://iili.io/nODPK6g.md.png</code>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* LIVE PREVIEW BOX */}
                    <div className="p-4 bg-gradient-to-br from-blue-50/80 to-indigo-50/80 dark:from-slate-800/60 dark:to-slate-800/30 rounded-2xl border border-blue-200 dark:border-slate-700 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5 text-blue-600" />
                          <span>Pratinjau Langsung Identitas & Tanda Tangan:</span>
                        </span>
                        <span className="text-[10px] text-slate-500">Live Render</span>
                      </div>

                      <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1 flex items-center justify-center shrink-0">
                            <img
                              src={profileForm.logoUrl || "https://iili.io/nODPK6g.md.png"}
                              alt="Logo"
                              className="w-full h-full object-contain"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">
                              {profileForm.name} <span className="text-slate-400 font-normal">({profileForm.shortName})</span>
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {profileForm.address} - {profileForm.city}
                            </div>
                          </div>
                        </div>

                        <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 dark:border-slate-800 w-full sm:w-auto">
                          <span className="text-[10px] text-slate-400 block">Waka Bidang Kesiswaan:</span>
                          <span className="font-bold text-blue-600 dark:text-blue-400 text-xs">
                            {profileForm.headOfKesiswaan}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                          type="submit"
                          className="flex-1 sm:flex-none px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                        >
                          <Save className="w-4 h-4" />
                          <span>Simpan Perubahan Identitas Lembaga</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleResetProfileForm}
                          className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                          title="Batal dan pulihkan ke data tersimpan"
                        >
                          Batal
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (confirm('Kembalikan semua data (link, prestasi, notifikasi, dan profil sekolah) ke setelan awal resmi SMKN 1 Jember?')) {
                            onResetData();
                            alert('Semua data kesiswaan berhasil dipulihkan ke bawaan awal SMESA!');
                          }
                        }}
                        className="w-full sm:w-auto px-3.5 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-red-200 dark:border-red-900/50"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset ke Data Awal SMESA</span>
                      </button>
                    </div>

                  </form>

                </div>
              )}

            </main>

          </div>
        )}

      </motion.div>
    </div>
  );
};
