import React from 'react';
import { SchoolProfile, PrestasiItem } from '../types';
import { Printer, Download, X, Award, CheckCircle, Phone, Mail, Globe, MapPin, Users, BookOpen, ShieldCheck } from 'lucide-react';

interface ResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: SchoolProfile;
  prestasi: PrestasiItem[];
  onDownloadTracked?: () => void;
}

export const ResumeModal: React.FC<ResumeModalProps> = ({
  isOpen,
  onClose,
  profile,
  prestasi,
  onDownloadTracked
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    if (onDownloadTracked) onDownloadTracked();
    window.print();
  };

  const handleDownloadText = () => {
    if (onDownloadTracked) onDownloadTracked();
    const content = `PROFIL & RESUME RESMI KESISWAAN
${profile.name} (${profile.shortName})
NPSN: ${profile.npsn} | ${profile.accreditation}
Alamat: ${profile.address}, ${profile.city}
Telepon: ${profile.phone} | WA Kesiswaan: ${profile.whatsappKesiswaan} | Email: ${profile.email}

VISI & MOTTO KESISWAAN:
${profile.tagline}

STATISTIK KESISWAAN:
- Total Siswa Aktif: ${profile.totalStudents} Siswa
- Organisasi & Ekstrakurikuler: ${profile.totalEkskul} Cabang Ekskul Aktif
- Akreditasi Institusi: ${profile.accreditation}

24 CABANG EKSTRAKURIKULER & ORGANISASI KESISWAAN:
1. Organisasi Inti: OSIS, MPK (Majelis Perwakilan Kelas)
2. Kepanduan & Bela Negara: Gerakan Pramuka Gugus Depan SMESA, Paskibra (Satria SMESA)
3. Kemanusiaan: Palang Merah Remaja (PMR Wira)
4. Kerohanian: Rohis (SKKI), Rokris (Persekutuan Doa Kristen)
5. Olahraga: Futsal, Basket, Bola Voli, Bulutangkis, Pencak Silat, Taekwondo
6. Seni & Budaya: Tari Tradisional, Paduan Suara (Gita SMESA), Teater, Karawitan, Modern Dance
7. Sains, IT & Jurnalistik: Cyber SMESA (Coding & Robotika), Jurnalistik & Mading, Sinematografi, English Debate Club

REKAPITULASI PRESTASI SISWA TERPILIH:
${prestasi.map((p, idx) => `${idx + 1}. [${p.rank}] ${p.title} - ${p.studentName} (${p.major}, ${p.year}) - No. Sertifikat: ${p.verificationCode}`).join('\n')}

LAYANAN ADMINISTRASI KESISWAAN:
1. Surat Keterangan Siswa Aktif & Rekomendasi Lomba
2. Pengelolaan Beasiswa Program Indonesia Pintar (PIP)
3. Dispensasi Kegiatan Lomba & Pelatihan
4. Pembinaan Kedisiplinan & Buku Poin Karakter Siswa
`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Resume_Profil_Kesiswaan_SMKN1_Jember.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white print:static print:inset-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 print:shadow-none print:border-none print:max-h-none print:w-full print:rounded-none">
        
        {/* MODAL HEADER - Hidden in Print */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 no-print">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Dossier Profil Kesiswaan & Portofolio Siswa</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Format resmi profil rekam jejak kesiswaan SMKN 1 Jember</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadText}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5"
              title="Unduh Teks Ringkas"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Unduh TXT</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE DOCUMENT BODY */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-6 text-slate-800 dark:text-slate-200 print:text-black print:overflow-visible print:p-0">
          
          {/* OFFICIAL LETTERHEAD */}
          <div className="border-b-2 border-slate-900 pb-4 text-center relative print:border-black">
            <div className="flex items-center justify-center gap-3 mb-2">
              <img
                src={profile.logoUrl || "https://iili.io/nODPK6g.md.png"}
                alt="Logo SMKN 1 Jember"
                referrerPolicy="no-referrer"
                className="w-14 h-14 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <div className="text-[11px] font-bold tracking-widest text-slate-600 uppercase print:text-black">
              PEMERINTAH PROVINSI JAWA TIMUR · DINAS PENDIDIKAN
            </div>
            <div className="text-[11px] font-medium text-slate-500 uppercase print:text-black">
              CABANG DINAS PENDIDIKAN WILAYAH JEMBER DAN LUMAJANG
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mt-1 print:text-black">
              {profile.name}
            </h2>
            <div className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider print:text-black">
              BIDANG PENGEMBANGAN KESISWAAN & PENDIDIKAN KARAKTER
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 print:text-black mt-1">
              {profile.address} - {profile.city} | Telp: {profile.phone}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 print:text-black font-mono">
              Website: {profile.website} | Email: {profile.email} | NPSN: {profile.npsn} | {profile.accreditation}
            </p>
          </div>

          {/* DOCUMENT TITLE */}
          <div className="text-center py-1">
            <span className="text-xs uppercase font-extrabold tracking-widest text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-md print:bg-transparent print:text-black print:border print:border-black">
              PROFIL KESISWAAN, EKSTRAKURIKULER & REKAPITULASI PRESTASI SISWA
            </span>
            <p className="text-xs text-slate-500 mt-1">Tahun Ajaran 2025/2026</p>
          </div>

          {/* KEY DATA SUMMARY */}
          <div className="grid grid-cols-3 gap-3 text-xs bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 print:bg-white print:border-slate-300">
            <div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Total Siswa Aktif</span>
              <span className="font-bold text-slate-900 dark:text-white font-mono text-base">{profile.totalStudents} Siswa</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Organisasi & Ekskul</span>
              <span className="font-bold text-blue-600 dark:text-blue-400 font-mono text-base">{profile.totalEkskul} Cabang</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Status Akreditasi</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono text-base">{profile.accreditation}</span>
            </div>
          </div>

          {/* 24 EKSTRAKURIKULER & ORGANISASI */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-1.5 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span>Daftar Organisasi Siswa & 24 Ekstrakurikuler Unggulan</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-white dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="font-bold text-slate-900 dark:text-white block mb-0.5">1. Organisasi & Bela Negara</span>
                <p className="text-slate-600 dark:text-slate-400 text-[11px]">OSIS, MPK, Gerakan Pramuka Gudep SMESA, Paskibraka (Satria SMESA), Patroli Keamanan Sekolah (PKS).</p>
              </div>
              <div className="p-3 bg-white dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="font-bold text-slate-900 dark:text-white block mb-0.5">2. Kemanusiaan & Kerohanian</span>
                <p className="text-slate-600 dark:text-slate-400 text-[11px]">PMR (Palang Merah Remaja Wira), Rohani Islam (SKKI SMESA), Rohani Kristen/Katolik (Rokris).</p>
              </div>
              <div className="p-3 bg-white dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="font-bold text-slate-900 dark:text-white block mb-0.5">3. Olahraga Prestasi</span>
                <p className="text-slate-600 dark:text-slate-400 text-[11px]">Futsal SMESA, Bola Basket, Bola Voli, Bulutangkis, Pencak Silat, Taekwondo.</p>
              </div>
              <div className="p-3 bg-white dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="font-bold text-slate-900 dark:text-white block mb-0.5">4. Seni, Budaya & IPTEK</span>
                <p className="text-slate-600 dark:text-slate-400 text-[11px]">Tari Tradisional, Karawitan, Paduan Suara Gita SMESA, Teater, Cyber SMESA (Robotik/Coding), Jurnalistik & Sinematografi.</p>
              </div>
            </div>
          </div>

          {/* STUDENT ACHIEVEMENTS */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-1.5 mb-3 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Daftar Rekam Jejak Prestasi Siswa Terverifikasi</span>
            </h4>
            <div className="space-y-2">
              {prestasi.map(item => (
                <div key={item.id} className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 text-xs flex items-start justify-between gap-3">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>{item.title}</span>
                      <span className="text-[10px] text-blue-600 dark:text-blue-400 font-normal">({item.rank})</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">
                      Siswa: <span className="font-medium text-slate-800 dark:text-slate-200">{item.studentName}</span> ({item.major}) · Tingkat {item.competitionLevel} ({item.year})
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">No. Verifikasi: {item.verificationCode} | Pembimbing: {item.mentorTeacher}</p>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded shrink-0">
                    Terverifikasi
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* PEMBINAAN DISIPLIN & KARAKTER */}
          <div className="p-4 bg-blue-50/70 dark:bg-blue-950/30 rounded-2xl border border-blue-200 dark:border-blue-900 text-xs">
            <h4 className="font-bold text-blue-900 dark:text-blue-300 mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>Layanan Terpadu & Konseling Kesiswaan</span>
            </h4>
            <p className="text-blue-800 dark:text-blue-300 text-[11px] leading-relaxed">
              Kesiswaan SMKN 1 Jember menerapkan pendekatan pembinaan disiplin positif berbasis poin penghargaan prestasi dan restoratif. Layanan meliputi administrasi surat aktif, dispensasi lomba, pengusulan beasiswa PIP, serta pendampingan konseling siswa.
            </p>
            <div className="mt-2.5 flex flex-wrap gap-4 text-[11px] text-blue-900 dark:text-blue-200 font-medium">
              <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> Hotline Kesiswaan: +62 812-3355-0412</span>
              <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> kesiswaansmesa@gmail.com</span>
            </div>
          </div>

          {/* SIGNATURE / LEGAL FOOTER */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-end justify-between text-xs text-slate-600 dark:text-slate-400 print:text-black">
            <div>
              <p className="text-[11px]">Diterbitkan secara digital oleh Biro Kesiswaan SMKN 1 Jember</p>
              <p className="text-[10px] font-mono text-slate-400 print:text-black">ict@kesiswaan20226 · ID: SMESA-KESISWAAN-DOC-{Date.now().toString().slice(-6)}</p>
            </div>
            <div className="text-right">
              <p className="text-[11px]">Jember, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="font-bold text-slate-900 dark:text-white mt-1 print:text-black">Waka Bidang Kesiswaan</p>
              <p className="font-medium text-slate-800 dark:text-slate-200 text-xs mt-8 print:text-black">{profile.headOfKesiswaan}</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
