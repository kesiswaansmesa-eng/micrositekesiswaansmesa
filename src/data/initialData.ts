import { LinkItem, PrestasiItem, SocialLink, ActivityNotification, SchoolProfile, AnalyticsData } from '../types';

export const INITIAL_SCHOOL_PROFILE: SchoolProfile = {
  name: 'SMK Negeri 1 Jember',
  shortName: 'Kesiswaan SMESA',
  tagline: 'Membina Generasi Unggul, Berkarakter Kuat, Mandiri & Berprestasi',
  npsn: '20523847',
  accreditation: 'Akreditasi A (Unggul)',
  address: 'Jl. Jambu No.17 Patrang',
  city: 'Jember',
  postalCode: '68118',
  phone: '(0331) 335041',
  whatsappKesiswaan: '6281233550412',
  email: 'kesiswaansmesa@gmail.com',
  website: 'https://smkn1jember.sch.id',
  totalStudents: 2450,
  totalEkskul: 24,
  headOfKesiswaan: 'Dra. Hj. Sri Wahyuni, M.Pd.',
  headmaster: 'Drs. H. Sri Hartono, M.Pd.',
  logoUrl: 'https://iili.io/nODPK6g.md.png'
};

export const INITIAL_LINKS: LinkItem[] = [
  {
    id: 'link-layanan-kesiswaan',
    title: 'E-Layanan Surat Dispensasi & Legalisir Kesiswaan',
    subtitle: 'Pengajuan surat aktif sekolah, dispensasi lomba, izin kegiatan, & surat rekomendasi',
    url: 'https://layanan.smkn1jember.sch.id',
    category: 'layanan',
    iconName: 'FileText',
    isPinned: true,
    isActive: true,
    clickCount: 1640,
    badgeText: 'Layanan Utama',
    createdAt: '2026-01-10'
  },
  {
    id: 'link-sipres',
    title: 'SIPRES: Sistem Informasi Prestasi Siswa SMESA',
    subtitle: 'Pencatatan sertifikat kejuaraan, portofolio karya, & database prestasi resmi siswa',
    url: 'https://sipres.smkn1jember.sch.id',
    category: 'prestasi',
    iconName: 'Award',
    isPinned: true,
    isActive: true,
    clickCount: 1420,
    badgeText: 'Terverifikasi',
    createdAt: '2026-01-15'
  },
  {
    id: 'link-osis-mpk',
    title: 'Portal Resmi OSIS & MPK SMKN 1 Jember',
    subtitle: 'Informasi 24 organisasi ekstrakurikuler, kepengurusan, & jadwal latihan rutin',
    url: 'https://osis.smkn1jember.sch.id',
    category: 'ekskul',
    iconName: 'Users',
    isPinned: true,
    isActive: true,
    clickCount: 1180,
    badgeText: '24 Ekskul',
    createdAt: '2026-01-20'
  },
  {
    id: 'link-tata-tertib',
    title: 'Buku Pedoman Tata Tertib & Kode Etik Siswa 2026',
    subtitle: 'Aturan kedisiplinan, sistem poin pembinaan karakter, & seragam harian',
    url: 'https://tatib.smkn1jember.sch.id',
    category: 'tata-tertib',
    iconName: 'ShieldCheck',
    isPinned: false,
    isActive: true,
    clickCount: 920,
    createdAt: '2026-02-01'
  },
  {
    id: 'link-beasiswa',
    title: 'Pusat Informasi Beasiswa PIP & Kesejahteraan Siswa',
    subtitle: 'Pengecekan aktivasi rekening Program Indonesia Pintar (PIP) & bantuan afirmasi',
    url: 'https://beasiswa.smkn1jember.sch.id',
    category: 'beasiswa',
    iconName: 'Sparkles',
    isPinned: false,
    isActive: true,
    clickCount: 1040,
    badgeText: 'Update 2026',
    createdAt: '2026-02-15'
  },
  {
    id: 'link-agenda-kesiswaan',
    title: 'Kalender Kegiatan & Agenda Kesiswaan 2026',
    subtitle: 'Jadwal upacara, apel disiplin, classmeeting, peringatan hari besar, & LDKS',
    url: 'https://agenda.smkn1jember.sch.id',
    category: 'kegiatan',
    iconName: 'Calendar',
    isPinned: false,
    isActive: true,
    clickCount: 780,
    createdAt: '2026-03-01'
  },
  {
    id: 'link-ldks',
    title: 'Pendaftaran Latihan Dasar Kepemimpinan Siswa (LDKS)',
    subtitle: 'Kaderisasi pengurus OSIS, MPK, Pramuka, PMR, Paskibra, dan Rohis/Rokris',
    url: 'https://ldks.smkn1jember.sch.id',
    category: 'ekskul',
    iconName: 'BookOpen',
    isPinned: false,
    isActive: true,
    clickCount: 650,
    createdAt: '2026-03-05'
  },
  {
    id: 'link-website-utama',
    title: 'Website Utama SMK Negeri 1 Jember',
    subtitle: 'Portal induk sekolah, profil dewan guru, berita kelembagaan, & galeri kegiatan',
    url: 'https://smkn1jember.sch.id',
    category: 'utama',
    iconName: 'Globe',
    isPinned: false,
    isActive: true,
    clickCount: 1350,
    createdAt: '2026-01-01'
  }
];

export const INITIAL_PRESTASI: PrestasiItem[] = [
  {
    id: 'pres-1',
    title: 'Juara 1 Nasional LKS Bidang Web Technologies',
    studentName: 'Muhammad Rizky Pratama',
    studentClass: 'XII PPLG 1',
    major: 'PPLG',
    competitionLevel: 'Nasional',
    rank: 'Juara 1 (Medali Emas)',
    year: 2025,
    eventDate: 'Oktober 2025',
    organizer: 'BPTI - Puspresnas Kemendikbudristek RI',
    description: 'Mengembangkan sistem otomasi logistik terpadu berbasis Next.js, GraphQL, dan Docker dengan arsitektur modern berkinerja tinggi dalam durasi lomba 16 jam.',
    mentorTeacher: 'Ahmad Fauzi, S.Kom., M.T.',
    verificationCode: 'SMESA-LKS-2025-019',
    views: 520
  },
  {
    id: 'pres-2',
    title: 'Juara Umum Olimpiade Akuntansi & Keuangan Se-Jawa Timur',
    studentName: 'Nabila Nur Azizah & Tim AKL',
    studentClass: 'XII AKL 2',
    major: 'AKL',
    competitionLevel: 'Provinsi',
    rank: 'Juara Umum',
    year: 2025,
    eventDate: 'November 2025',
    organizer: 'Fakultas Ekonomi dan Bisnis Universitas Jember (UNEJ)',
    description: 'Menyelesaikan simulasi siklus akuntansi perusahaan dagang & manufaktur serta pelaporan SPT Elektronik (e-Tax) dengan skor memukau 98.7.',
    mentorTeacher: 'Dra. Endang Sulistyowati',
    verificationCode: 'SMESA-OAK-2025-042',
    views: 410
  },
  {
    id: 'pres-3',
    title: 'Medali Emas Graphic Design Technology & Identitas Visual',
    studentName: 'Fajar Aditya Nugroho',
    studentClass: 'XII DKV 1',
    major: 'DKV',
    competitionLevel: 'Provinsi',
    rank: 'Medali Emas',
    year: 2026,
    eventDate: 'Januari 2026',
    organizer: 'Dinas Pendidikan Provinsi Jawa Timur',
    description: 'Menciptakan comprehensive visual identity system untuk produk UMKM lokal kopi robusta pegunungan Hyang Argopuro Jember hingga kemasan ramah lingkungan.',
    mentorTeacher: 'Bambang Trianto, S.Sn.',
    verificationCode: 'SMESA-GDT-2026-008',
    views: 380
  },
  {
    id: 'pres-4',
    title: 'Juara 1 Business Plan & E-Commerce Marketing Challenge',
    studentName: 'Siti Rahmawati & Farhan Maulana',
    studentClass: 'XII Bisnis Digital',
    major: 'Bisnis Digital',
    competitionLevel: 'Nasional',
    rank: 'Juara 1',
    year: 2025,
    eventDate: 'Desember 2025',
    organizer: 'Politeknik Negeri Jember (POLIJE)',
    description: 'Strategi live selling e-commerce dan funnel marketing produk herbal lokal yang menghasilkan omzet nyata Rp 42.000.000 dalam 3 hari kampanye lomba.',
    mentorTeacher: 'Rina Wijayanti, S.E., M.M.',
    verificationCode: 'SMESA-BDC-2025-077',
    views: 330
  },
  {
    id: 'pres-5',
    title: 'Juara 1 Lomba Baris-Berbaris & Ketangkasan Paskibra Jawa Timur',
    studentName: 'Pleton Paskibra SMESA (Satria SMESA)',
    studentClass: 'X & XI Gabungan',
    major: 'Umum / Semua',
    competitionLevel: 'Provinsi',
    rank: 'Juara 1 Utama',
    year: 2026,
    eventDate: 'Februari 2026',
    organizer: 'PPI Provinsi Jawa Timur',
    description: 'Meraih Danton Terbaik, Formasi Variasi Terbaik, dan Juara Umum Piala Bergilir Gubernur Jawa Timur.',
    mentorTeacher: 'Drs. Bambang Suherman',
    verificationCode: 'SMESA-PAS-2026-002',
    views: 450
  },
  {
    id: 'pres-6',
    title: 'Juara 1 Cipta Karya Busana Etnik Kontemporer Jawa Timur',
    studentName: 'Putri Zahra Miranda',
    studentClass: 'XII Tata Busana',
    major: 'Busana',
    competitionLevel: 'Provinsi',
    rank: 'Juara 1',
    year: 2026,
    eventDate: 'Februari 2026',
    organizer: 'Dekranasda Jawa Timur',
    description: 'Memadukan motif batik daun tembakau khas Jember dengan pola potongan haute couture modern siap pakai bernilai jual tinggi.',
    mentorTeacher: 'Nurul Hidayati, S.Pd.',
    verificationCode: 'SMESA-TBS-2026-015',
    views: 290
  }
];

export const INITIAL_SOCIAL_LINKS: SocialLink[] = [
  {
    id: 'soc-ig-kesiswaan',
    name: 'Instagram Kesiswaan',
    handle: '@kesiswaan_smesajbr',
    url: 'https://instagram.com/kesiswaan_smesajbr',
    icon: 'Instagram',
    colorClass: 'hover:text-pink-600 dark:hover:text-pink-400'
  },
  {
    id: 'soc-ig-school',
    name: 'Instagram Resmi Sekolah',
    handle: '@smkn1jember_official',
    url: 'https://instagram.com/smkn1jember_official',
    icon: 'Instagram',
    colorClass: 'hover:text-rose-600 dark:hover:text-rose-400'
  },
  {
    id: 'soc-yt',
    name: 'YouTube Kesiswaan & Sekolah',
    handle: 'SMK Negeri 1 Jember Official',
    url: 'https://youtube.com/@smkn1jemberofficial',
    icon: 'Youtube',
    colorClass: 'hover:text-red-600 dark:hover:text-red-400'
  },
  {
    id: 'soc-tiktok',
    name: 'TikTok Kesiswaan SMESA',
    handle: '@smesajbr',
    url: 'https://tiktok.com/@smesajbr',
    icon: 'Video',
    colorClass: 'hover:text-slate-900 dark:hover:text-slate-100'
  },
  {
    id: 'soc-wa-kesiswaan',
    name: 'WhatsApp Layanan Kesiswaan',
    handle: '+62 812-3355-0412',
    url: 'https://wa.me/6281233550412?text=Halo%20Admin%20Kesiswaan%20SMKN%201%20Jember,%20saya%20ingin%20berkonsultasi%20layanan%20siswa',
    icon: 'MessageCircle',
    colorClass: 'hover:text-emerald-600 dark:hover:text-emerald-400'
  }
];

export const INITIAL_NOTIFICATIONS: ActivityNotification[] = [
  {
    id: 'notif-1',
    title: 'Penyaluran Bantuan PIP Tahap I Tahun 2026 Telah Dibuka',
    message: 'Bagi siswa yang terdaftar sebagai penerima manfaat Program Indonesia Pintar (PIP), harap segera melakukan verifikasi berkas di ruang Kesiswaan SMESA.',
    category: 'beasiswa',
    timestamp: '1 jam yang lalu',
    isRead: false,
    actionUrl: 'https://beasiswa.smkn1jember.sch.id'
  },
  {
    id: 'notif-2',
    title: 'Selamat! Siswa SMESA Juara 1 Nasional LKS Web Technologies',
    message: 'Apresiasi setinggi-tingginya kepada ananda Muhammad Rizky Pratama (XII PPLG 1) atas prestasi gemilang medali emas tingkat nasional.',
    category: 'prestasi',
    timestamp: 'Kemarin',
    isRead: false
  },
  {
    id: 'notif-3',
    title: 'Apel Akbar & Sosialisasi Tata Tertib Siswa Semester Genap',
    message: 'Wajib diikuti oleh seluruh siswa kelas X, XI, dan XII pada hari Senin pukul 06.45 WIB berseragam lengkap.',
    category: 'kegiatan',
    timestamp: '3 hari yang lalu',
    isRead: true
  }
];

export const INITIAL_ANALYTICS: AnalyticsData = {
  totalViews: 7420,
  uniqueVisitors: 4560,
  resumeDownloads: 920,
  linkClicks: {
    'link-layanan-kesiswaan': 1640,
    'link-sipres': 1420,
    'link-osis-mpk': 1180,
    'link-tata-tertib': 920,
    'link-beasiswa': 1040,
    'link-agenda-kesiswaan': 780,
    'link-ldks': 650,
    'link-website-utama': 1350
  },
  deviceBreakdown: {
    mobile: 82,
    desktop: 14,
    tablet: 4
  },
  referrerSources: {
    'Instagram Bio Kesiswaan': 52,
    'WhatsApp Grup Kelas & OSIS': 30,
    'Direct / QR Code Mading Sekolah': 12,
    'Google Search': 6
  },
  dailyViews: [
    { date: '16 Mar', views: 920, clicks: 680 },
    { date: '17 Mar', views: 1050, clicks: 760 },
    { date: '18 Mar', views: 980, clicks: 710 },
    { date: '19 Mar', views: 1180, clicks: 890 },
    { date: '20 Mar', views: 1240, clicks: 940 },
    { date: '21 Mar', views: 1110, clicks: 820 },
    { date: '22 Mar', views: 1210, clicks: 910 }
  ]
};
