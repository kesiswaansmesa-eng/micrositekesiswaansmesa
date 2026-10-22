import { LinkItem, PrestasiItem, SchoolProfile, SocialLink } from '../types';

export function generateSingleFileHtml(
  profile: SchoolProfile,
  links: LinkItem[],
  prestasi: PrestasiItem[],
  socials: SocialLink[],
  appsScriptUrl?: string
): string {
  const activeLinks = links.filter(l => l.isActive);
  const activePrestasi = prestasi.slice(0, 6);

  return `<!DOCTYPE html>
<html lang="id" class="light">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Microsite Resmi Kesiswaan ${escapeHtml(profile.name)} (${escapeHtml(profile.shortName)})</title>
  <meta name="description" content="Pusat Tautan Resmi, Layanan Siswa, Ekstrakurikuler & Portofolio Prestasi ${escapeHtml(profile.name)}" />
  
  <!-- Tailwind CSS CDN for 100% Standalone Compatibility on Google Sites & Blogger -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            smesa: {
              50: '#eff6ff',
              100: '#dbeafe',
              500: '#1d4ed8',
              600: '#1e40af',
              700: '#1e3a8a',
              900: '#0f172a',
            }
          }
        }
      }
    }
  </script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      scroll-behavior: smooth;
    }
    .font-mono { font-family: 'JetBrains Mono', monospace; }

    /* Fluid Micro-Animations */
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(12px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .animate-fade-in-up {
      animation: fadeInUp 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    .link-card {
      transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .link-card:hover {
      transform: translateY(-2px);
    }
    .link-card:active {
      transform: scale(0.985);
    }

    @media print {
      body { background: white !important; color: black !important; }
      .no-print { display: none !important; }
      .print-only { display: block !important; }
    }
  </style>
</head>
<body class="bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 min-h-screen transition-colors duration-200 antialiased selection:bg-blue-600 selection:text-white">
  
  <!-- TOP BAR -->
  <header class="sticky top-0 z-40 w-full backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 transition-colors">
    <div class="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
      <div class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
          SMESA
        </div>
        <div>
          <h1 class="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">BIRO KESISWAAN SMESA</h1>
          <p class="text-[10px] text-slate-500 dark:text-slate-400">SMK Negeri 1 Jember</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <button id="themeToggle" class="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors" title="Ubah Tema Gelap/Terang">
          <span id="themeIcon">🌙</span>
        </button>
        <button onclick="window.print()" class="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          <span class="hidden sm:inline">Cetak Resume</span>
        </button>
      </div>
    </div>
  </header>

  <!-- MAIN CONTAINER (Mobile-First Biolink Hub) -->
  <main class="max-w-xl mx-auto px-4 py-8 pb-16 animate-fade-in-up">
    
    <!-- PROFILE HEADER CARD -->
    <div class="text-center mb-6">
      <div class="relative inline-block mb-3.5">
        <a href="https://freeimage.host/i/nODPK6g" target="_blank" rel="noopener noreferrer" class="w-24 h-24 mx-auto rounded-3xl bg-white dark:bg-slate-900 p-2 shadow-md border border-slate-200/80 dark:border-slate-800 flex items-center justify-center overflow-hidden block" title="Logo SMKN 1 Jember">
          <img
            src="${escapeHtml(profile.logoUrl || "https://iili.io/nODPK6g.md.png")}"
            alt="nODPK6g.md.png"
            border="0"
            referrerPolicy="no-referrer"
            class="w-full h-full object-contain"
            onerror="this.style.display='none'"
          />
        </a>
        <span class="absolute bottom-0 right-0 bg-emerald-500 text-white rounded-full p-1.5 shadow" title="Terverifikasi Resmi">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
        </span>
      </div>

      <h2 class="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">${escapeHtml(profile.name)}</h2>
      <p class="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-0.5">Biro Pengembangan Kesiswaan & Karakter</p>
      <p class="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto mt-1.5 leading-relaxed">
        ${escapeHtml(profile.tagline)}
      </p>

      <!-- UNBOXED METADATA -->
      <div class="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-2.5">
        <span>NPSN ${profile.npsn}</span>
        <span aria-hidden="true">·</span>
        <span>${profile.accreditation}</span>
        <span aria-hidden="true">·</span>
        <span>${escapeHtml(profile.address)} - ${escapeHtml(profile.city)}</span>
      </div>

      <!-- QUICK STATS -->
      <div class="grid grid-cols-3 gap-2 mt-4 py-3 px-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center shadow-xs">
        <div>
          <div class="text-base font-bold text-slate-900 dark:text-white font-mono">${profile.totalStudents.toLocaleString('id-ID')}</div>
          <div class="text-[11px] text-slate-500 dark:text-slate-400">Total Siswa</div>
        </div>
        <div class="border-x border-slate-200 dark:border-slate-800">
          <div class="text-base font-bold text-blue-600 dark:text-blue-400 font-mono">${profile.totalEkskul}</div>
          <div class="text-[11px] text-slate-500 dark:text-slate-400">Organisasi & Ekskul</div>
        </div>
        <div>
          <div class="text-base font-bold text-emerald-600 dark:text-emerald-400 font-mono">Unggul</div>
          <div class="text-[11px] text-slate-500 dark:text-slate-400">Akreditasi A</div>
        </div>
      </div>
    </div>

    <!-- KESISWAAN HOTLINE BANNER -->
    <div class="mb-6 p-4 rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 text-white shadow-sm">
      <div class="flex items-center justify-between gap-3 mb-1.5">
        <span class="text-[10px] uppercase font-bold tracking-wider text-blue-100">Hotline Kesiswaan</span>
        <span class="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded font-medium">Layanan Cepat</span>
      </div>
      <h3 class="text-sm font-bold">Konsultasi Layanan & Dispensasi Siswa</h3>
      <p class="text-xs text-blue-100 mt-1 mb-3">
        Layanan resmi surat aktif sekolah, dispensasi lomba, verifikasi beasiswa PIP, dan informasi organisasi kesiswaan SMKN 1 Jember.
      </p>
      <a href="https://wa.me/${profile.whatsappKesiswaan}?text=Halo%20Admin%20Kesiswaan%20SMKN%201%20Jember,%20saya%20ingin%20berkonsultasi" target="_blank" rel="noopener" class="w-full py-2 px-3 bg-white hover:bg-slate-100 text-blue-700 text-xs font-bold rounded-xl text-center transition-colors block shadow-xs">
        Hubungi WhatsApp Kesiswaan SMESA
      </a>
    </div>

    <!-- LINKS LIST -->
    <div class="space-y-2.5 mb-8">
      <div class="flex items-center justify-between px-1 mb-1">
        <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Fasilitas & Layanan Kesiswaan</h3>
        <span class="text-[11px] text-slate-400 font-mono">${activeLinks.length} Tautan Aktif</span>
      </div>

      ${activeLinks.map(link => `
        <a href="${escapeHtml(link.url)}" target="_blank" rel="noopener" onclick="recordClick('${link.id}')" class="link-card block p-3.5 bg-white dark:bg-slate-900 hover:bg-blue-50/50 dark:hover:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 shadow-xs">
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-start gap-3">
              <div class="w-9 h-9 rounded-xl bg-blue-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <span class="text-sm font-bold text-slate-900 dark:text-white">${escapeHtml(link.title)}</span>
                  ${link.badgeText ? `<span class="text-[10px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 px-1.5 py-0.5 rounded">${escapeHtml(link.badgeText)}</span>` : ''}
                </div>
                ${link.subtitle ? `<p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">${escapeHtml(link.subtitle)}</p>` : ''}
              </div>
            </div>
            <div class="text-slate-400 pt-1 shrink-0">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </div>
          </div>
        </a>
      `).join('')}
    </div>

    <!-- PRESTASI SISWA SHOWCASE -->
    <div id="prestasiSection" class="mb-8 space-y-3">
      <div class="flex items-center justify-between px-1">
        <div>
          <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Prestasi Siswa Terkini</h3>
          <p class="text-[11px] text-slate-400">Rekam jejak kejuaraan LKS Nasional & Olimpiade</p>
        </div>
      </div>

      <div class="space-y-2.5">
        ${activePrestasi.map(item => `
          <div class="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div class="flex items-start justify-between gap-2 mb-1">
              <span class="text-xs font-bold text-slate-900 dark:text-white">${escapeHtml(item.title)}</span>
              <span class="text-[10px] font-semibold text-amber-700 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-300 px-2 py-0.5 rounded shrink-0">${escapeHtml(item.rank)}</span>
            </div>
            <p class="text-xs text-slate-600 dark:text-slate-300 mb-2 leading-relaxed">${escapeHtml(item.description)}</p>
            <div class="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/60 pt-2">
              <span class="font-medium text-slate-800 dark:text-slate-200">${escapeHtml(item.studentName)}</span>
              <span>·</span>
              <span>${escapeHtml(item.major)}</span>
              <span>·</span>
              <span>Tingkat ${escapeHtml(item.competitionLevel)} (${item.year})</span>
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- SOCIAL MEDIA FOOTER -->
    <div class="text-center pt-6 border-t border-slate-200 dark:border-slate-800">
      <p class="text-xs text-slate-500 dark:text-slate-400 mb-3">Tautan Media Sosial Resmi Kesiswaan:</p>
      <div class="flex items-center justify-center gap-2 mb-6">
        ${socials.map(soc => `
          <a href="${escapeHtml(soc.url)}" target="_blank" rel="noopener" class="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-400 text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors shadow-xs" title="${escapeHtml(soc.name)}">
            <span class="text-xs font-semibold">${escapeHtml(soc.name.split(' ')[0])}</span>
          </a>
        `).join('')}
      </div>

      <p class="text-xs font-mono font-medium text-slate-500 dark:text-slate-400 mb-1">
        ict@kesiswaan20226
      </p>
      <p class="text-[11px] text-slate-400 leading-relaxed">
        &copy; 2026 Biro Kesiswaan ${escapeHtml(profile.name)} (${escapeHtml(profile.shortName)}).<br/>
        ${escapeHtml(profile.address)} - ${escapeHtml(profile.city)} | NPSN: ${profile.npsn}
      </p>
    </div>

  </main>

  <script>
    // Theme toggle handling
    const html = document.documentElement;
    const themeToggleBtn = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    
    const savedTheme = localStorage.getItem('smesa_theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    if (savedTheme === 'dark') {
      html.classList.add('dark');
      themeIcon.textContent = '☀️';
    } else {
      html.classList.remove('dark');
      themeIcon.textContent = '🌙';
    }

    themeToggleBtn.addEventListener('click', () => {
      const isDark = html.classList.toggle('dark');
      localStorage.setItem('smesa_theme', isDark ? 'dark' : 'light');
      themeIcon.textContent = isDark ? '☀️' : '🌙';
    });

    // Google Apps Script Real-Time Cloud Integration
    const APPS_SCRIPT_URL = "${escapeHtml(appsScriptUrl || '')}";

    function recordClick(id, title) {
      try {
        let stats = JSON.parse(localStorage.getItem('smesa_link_clicks') || '{}');
        stats[id] = (stats[id] || 0) + 1;
        localStorage.setItem('smesa_link_clicks', JSON.stringify(stats));
        
        if (APPS_SCRIPT_URL) {
          fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ action: 'trackClick', linkId: id, linkTitle: title || id }),
            keepalive: true
          }).catch(function() {});
        }
      } catch (e) {}
    }

    if (APPS_SCRIPT_URL) {
      try {
        fetch(APPS_SCRIPT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'trackVisit',
            device: window.innerWidth < 768 ? 'Mobile' : (window.innerWidth < 1024 ? 'Tablet' : 'Desktop'),
            referrer: document.referrer || 'Direct'
          }),
          keepalive: true
        }).catch(function() {});
      } catch (e) {}
    }
  </script>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
