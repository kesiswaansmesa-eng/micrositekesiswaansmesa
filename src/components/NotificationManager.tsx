import React, { useState, useEffect } from 'react';
import { ActivityNotification } from '../types';
import { Bell, Check, ExternalLink, X, ShieldAlert, Sparkles, Volume2 } from 'lucide-react';

interface NotificationManagerProps {
  notifications: ActivityNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  isOpen: boolean;
  onClose: () => void;
}

// Gentle pleasant synth chime using browser Web Audio API
export function playNotificationTone() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch (e) {
    // Audio might be blocked before first user gesture
  }
}

export function triggerSystemPush(title: string, body: string, url?: string) {
  playNotificationTone();

  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      const notif = new Notification(title, {
        body: body,
        icon: '/favicon.ico',
        tag: 'smesa-activity-update'
      });
      if (url) {
        notif.onclick = () => {
          window.focus();
          window.open(url, '_blank');
        };
      }
    } catch (e) {
      console.log('Push notification in iframe fallback');
    }
  }
}

export const NotificationManager: React.FC<NotificationManagerProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  isOpen,
  onClose
}) => {
  const [permissionState, setPermissionState] = useState<NotificationPermission>('default');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  useEffect(() => {
    if ('Notification' in window) {
      setPermissionState(Notification.permission);
    }
  }, []);

  const requestPushPermission = async () => {
    if (!('Notification' in window)) {
      alert('Browser Anda tidak mendukung Web Notification API.');
      return;
    }

    try {
      const result = await Notification.requestPermission();
      setPermissionState(result);
      if (result === 'granted') {
        triggerSystemPush(
          'Kesiswaan SMKN 1 Jember',
          'Notifikasi pembaruan kegiatan dan info rekrutmen aktif!'
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  const filtered = notifications.filter(n => 
    filterCategory === 'all' ? true : n.category === filterCategory
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800">
        
        {/* HEADER */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                Pembaruan Kegiatan Kesiswaan
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pemberitahuan push & agenda resmi SMKN 1 Jember
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PUSH PERMISSION BANNER */}
        {permissionState !== 'granted' && (
          <div className="p-3.5 bg-blue-50 dark:bg-blue-950/40 border-b border-blue-200 dark:border-blue-900 text-xs">
            <div className="flex items-start gap-2.5">
              <Volume2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold text-blue-900 dark:text-blue-200 block">
                  Aktifkan Notifikasi Langsung di Perangkat
                </span>
                <p className="text-blue-800/80 dark:text-blue-300 text-[11px] mt-0.5">
                  Dapatkan info seketika saat lowongan kerja, beasiswa, atau kabar kejuaraan siswa diumumkan.
                </p>
                <button
                  onClick={requestPushPermission}
                  className="mt-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-semibold transition-colors"
                >
                  Izinkan Notifikasi Web
                </button>
              </div>
            </div>
          </div>
        )}

        {/* FILTER & ACTIONS */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {['all', 'beasiswa', 'prestasi', 'kegiatan'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-medium capitalize transition-colors ${
                  filterCategory === cat
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat === 'all' ? 'Semua' : cat}
              </button>
            ))}
          </div>
          <button
            onClick={onMarkAllAsRead}
            className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline shrink-0 ml-2"
          >
            Tandai Dibaca
          </button>
        </div>

        {/* NOTIFICATION FEED */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              Belum ada pemberitahuan baru di kategori ini.
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => onMarkAsRead(item.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  item.isRead
                    ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-80'
                    : 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900 shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                      item.category === 'beasiswa'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : item.category === 'prestasi'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                    }`}>
                      {item.category}
                    </span>
                    {!item.isRead && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">{item.timestamp}</span>
                </div>

                <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-2">
                  {item.message}
                </p>

                {item.actionUrl && (
                  <a
                    href={item.actionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    <span>Buka Tautan Acara</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            ))
          )}
        </div>

        {/* FOOTER */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 text-center text-[11px] text-slate-500">
          Sistem Pengumuman Terpadu Kesiswaan SMESA Jember
        </div>

      </div>
    </div>
  );
};
