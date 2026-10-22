import React, { useState } from 'react';
import { AnalyticsData, LinkItem, PrestasiItem } from '../types';
import { X, TrendingUp, Users, MousePointerClick, Download, Smartphone, Monitor, Tablet, ArrowUpRight, BarChart3, Calendar, FileSpreadsheet } from 'lucide-react';

interface AnalyticsDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  analytics: AnalyticsData;
  links: LinkItem[];
  prestasi: PrestasiItem[];
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  isOpen,
  onClose,
  analytics,
  links,
  prestasi
}) => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('7d');

  if (!isOpen) return null;

  const totalClicks = Object.values(analytics.linkClicks).reduce((a, b) => a + b, 0);
  const clickThroughRate = ((totalClicks / analytics.totalViews) * 100).toFixed(1);

  const exportCsv = () => {
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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800">
        
        {/* TOP BAR */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                Dasbor Analitik Trafik & Kunjungan
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pemantauan real-time pengunjung profil & tautan kesiswaan
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportCsv}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Ekspor CSV</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* TIME RANGE SELECTOR */}
        <div className="px-5 py-2.5 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-slate-500 text-xs">
            <Calendar className="w-3.5 h-3.5" />
            <span>Rentang Waktu:</span>
          </div>
          <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setTimeRange('7d')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                timeRange === '7d' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              7 Hari Terakhir
            </button>
            <button
              onClick={() => setTimeRange('30d')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                timeRange === '30d' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              30 Hari
            </button>
            <button
              onClick={() => setTimeRange('all')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                timeRange === 'all' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Semua Waktu
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* KPI CARDS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Kunjungan</span>
                <TrendingUp className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
                {analytics.totalViews.toLocaleString('id-ID')}
              </div>
              <div className="text-[11px] text-emerald-600 flex items-center gap-0.5 mt-1">
                <span>+14.2%</span>
                <span className="text-slate-400">dari minggu lalu</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Pengunjung Unik</span>
                <Users className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
                {analytics.uniqueVisitors.toLocaleString('id-ID')}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Rasio: 1.63 sesi/user
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Klik Tautan</span>
                <MousePointerClick className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
                {totalClicks.toLocaleString('id-ID')}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                CTR Kunjungan: {clickThroughRate}%
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Unduhan Resume</span>
                <Download className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
                {analytics.resumeDownloads.toLocaleString('id-ID')}
              </div>
              <div className="text-[11px] text-emerald-600 mt-1">
                Profil & Portofolio Siswa
              </div>
            </div>
          </div>

          {/* TWO COLUMN ROW: TRAFFIC TIMELINE & DEVICE BREAKDOWN */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            
            {/* DAILY TRAFFIC GRAPH (BARS) */}
            <div className="lg:col-span-2 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    Tren Kunjungan Harian (7 Hari Terakhir)
                  </h4>
                  <p className="text-[11px] text-slate-400">Perbandingan Pageviews vs Klik Tautan</p>
                </div>
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-blue-600"></span> Views</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-emerald-500"></span> Clicks</span>
                </div>
              </div>

              <div className="flex items-end justify-between gap-2 h-40 pt-4 px-2">
                {analytics.dailyViews.map((day, idx) => {
                  const maxVal = 1200;
                  const viewHeight = Math.round((day.views / maxVal) * 100);
                  const clickHeight = Math.round((day.clicks / maxVal) * 100);

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                      <div className="w-full flex items-end justify-center gap-1 h-32">
                        <div
                          style={{ height: `${viewHeight}%` }}
                          className="w-1/2 max-w-[14px] bg-blue-600 hover:bg-blue-700 rounded-t transition-all"
                          title={`${day.date}: ${day.views} Tayangan`}
                        />
                        <div
                          style={{ height: `${clickHeight}%` }}
                          className="w-1/2 max-w-[14px] bg-emerald-500 hover:bg-emerald-600 rounded-t transition-all"
                          title={`${day.date}: ${day.clicks} Klik`}
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono mt-1">{day.date}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* DEVICE & PLATFORM BREAKDOWN */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-1">
                  Distribusi Perangkat Pengunjung
                </h4>
                <p className="text-[11px] text-slate-400 mb-4">Dominasi akses seluler oleh calon pendaftar & recruiter</p>

                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                        <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                        <span>Smartphone / Mobile</span>
                      </span>
                      <span className="font-bold font-mono text-slate-900 dark:text-white">
                        {analytics.deviceBreakdown.mobile}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div style={{ width: `${analytics.deviceBreakdown.mobile}%` }} className="h-full bg-blue-600 rounded-full" />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                        <Monitor className="w-3.5 h-3.5 text-purple-600" />
                        <span>Desktop / Laptop</span>
                      </span>
                      <span className="font-bold font-mono text-slate-900 dark:text-white">
                        {analytics.deviceBreakdown.desktop}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div style={{ width: `${analytics.deviceBreakdown.desktop}%` }} className="h-full bg-purple-600 rounded-full" />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                        <Tablet className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Tablet / iPad</span>
                      </span>
                      <span className="font-bold font-mono text-slate-900 dark:text-white">
                        {analytics.deviceBreakdown.tablet}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div style={{ width: `${analytics.deviceBreakdown.tablet}%` }} className="h-full bg-emerald-600 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500">
                Optimasi tampilan mobile responsif aktif & terverifikasi.
              </div>
            </div>

          </div>

          {/* TWO COLUMN ROW: LINK PERFORMANCE & TRAFFIC SOURCES */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            
            {/* LINK PERFORMANCE TABLE */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-1">
                Kinerja Klik Setiap Tautan
              </h4>
              <p className="text-[11px] text-slate-400 mb-3">Peringkat tautan yang paling banyak diakses pengunjung</p>

              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {links.map((link) => {
                  const clicks = analytics.linkClicks[link.id] || 0;
                  const pct = totalClicks > 0 ? ((clicks / totalClicks) * 100).toFixed(1) : 0;

                  return (
                    <div key={link.id} className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[240px]">
                          {link.title}
                        </span>
                        <span className="font-bold font-mono text-blue-600 dark:text-blue-400 shrink-0 ml-2">
                          {clicks.toLocaleString('id-ID')} klik
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex items-center">
                        <div style={{ width: `${pct}%` }} className="h-full bg-blue-600 rounded-full" />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                        <span className="capitalize">{link.category}</span>
                        <span>{pct}% dari total klik</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* TRAFFIC SOURCES & POPULAR PRESTASI */}
            <div className="space-y-4">
              
              {/* SOURCES */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-2">
                  Kanal Asal Pengunjung (Referrer)
                </h4>
                <div className="space-y-2 text-xs">
                  {Object.entries(analytics.referrerSources).map(([source, percentage]) => (
                    <div key={source} className="flex items-center justify-between">
                      <span className="text-slate-600 dark:text-slate-300">{source}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div style={{ width: `${percentage}%` }} className="h-full bg-indigo-600 rounded-full" />
                        </div>
                        <span className="font-mono font-bold text-slate-900 dark:text-white w-8 text-right">
                          {percentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* POPULAR PRESTASI */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-2">
                  Profil Prestasi Terpopuler Dilihat
                </h4>
                <div className="space-y-1.5 text-xs">
                  {prestasi.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-800 dark:text-slate-200 truncate max-w-[240px]">
                        {item.title}
                      </span>
                      <span className="text-slate-500 font-mono text-[11px] shrink-0">
                        {item.views} tayangan
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
