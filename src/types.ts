export type CategoryType = 
  | 'layanan' 
  | 'prestasi' 
  | 'ekskul' 
  | 'tata-tertib' 
  | 'beasiswa' 
  | 'kegiatan' 
  | 'utama';

export interface LinkItem {
  id: string;
  title: string;
  subtitle?: string;
  url: string;
  category: CategoryType;
  iconName: string;
  isPinned?: boolean;
  isActive: boolean;
  clickCount: number;
  badgeText?: string;
  createdAt: string;
}

export type MajorType = 
  | 'PPLG' 
  | 'DKV' 
  | 'AKL' 
  | 'Bisnis Digital' 
  | 'MPLB' 
  | 'Kuliner' 
  | 'Busana'
  | 'Umum / Semua';

export interface PrestasiItem {
  id: string;
  title: string;
  studentName: string;
  studentClass: string;
  major: MajorType;
  competitionLevel: 'Internasional' | 'Nasional' | 'Provinsi' | 'Kabupaten/Kota';
  rank: string;
  year: number;
  eventDate: string;
  organizer: string;
  description: string;
  mentorTeacher: string;
  verificationCode: string;
  views: number;
}

export interface SocialLink {
  id: string;
  name: string;
  handle: string;
  url: string;
  icon: string;
  colorClass: string;
}

export interface ActivityNotification {
  id: string;
  title: string;
  message: string;
  category: 'kegiatan' | 'prestasi' | 'pengumuman' | 'beasiswa';
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
}

export interface AnalyticsData {
  totalViews: number;
  uniqueVisitors: number;
  resumeDownloads: number;
  linkClicks: Record<string, number>;
  deviceBreakdown: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
  referrerSources: Record<string, number>;
  dailyViews: { date: string; views: number; clicks: number }[];
}

export interface SchoolProfile {
  name: string;
  shortName: string;
  tagline: string;
  npsn: string;
  accreditation: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
  whatsappKesiswaan: string;
  email: string;
  website: string;
  totalStudents: number;
  totalEkskul: number;
  headOfKesiswaan: string;
  headmaster: string;
  logoUrl?: string;
}
