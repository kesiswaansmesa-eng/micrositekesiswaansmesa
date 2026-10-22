/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Google Sheets & Apps Script Backend Integration Service
 * Digunakan untuk menghubungkan Microsite Kesiswaan SMKN 1 Jember
 * langsung ke Google Sheets sebagai Database Relasional/NoSQL Real-Time.
 */

import { LinkItem, PrestasiItem, ActivityNotification, AnalyticsData, SchoolProfile } from '../types';

export const APPS_SCRIPT_STORAGE_KEY = 'smesa_apps_script_url';
export const APPS_SCRIPT_AUTO_SYNC_KEY = 'smesa_apps_script_auto_sync';

export interface AppsScriptResponse<T = any> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
  timestamp?: string;
}

/**
 * Mengambil URL Google Apps Script yang tersimpan
 */
export function getAppsScriptUrl(): string {
  return localStorage.getItem(APPS_SCRIPT_STORAGE_KEY) || '';
}

/**
 * Menyimpan URL Google Apps Script
 */
export function setAppsScriptUrl(url: string): void {
  const cleanUrl = url.trim();
  if (cleanUrl) {
    localStorage.setItem(APPS_SCRIPT_STORAGE_KEY, cleanUrl);
  } else {
    localStorage.removeItem(APPS_SCRIPT_STORAGE_KEY);
  }
}

/**
 * Cek apakah auto-sync aktif
 */
export function isAutoSyncEnabled(): boolean {
  return localStorage.getItem(APPS_SCRIPT_AUTO_SYNC_KEY) !== 'false';
}

export function setAutoSyncEnabled(enabled: boolean): void {
  localStorage.setItem(APPS_SCRIPT_AUTO_SYNC_KEY, enabled ? 'true' : 'false');
}

/**
 * Menguji koneksi ke endpoint Google Apps Script
 */
export async function testAppsScriptConnection(customUrl?: string): Promise<{ success: boolean; message: string }> {
  const endpoint = (customUrl || getAppsScriptUrl()).trim();
  if (!endpoint) {
    return { success: false, message: 'URL Google Apps Script belum dimasukkan.' };
  }

  try {
    const url = new URL(endpoint);
    url.searchParams.set('action', 'ping');
    url.searchParams.set('t', Date.now().toString());

    const response = await fetch(url.toString(), {
      method: 'GET',
      mode: 'cors',
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
    }

    const json: AppsScriptResponse = await response.json();
    if (json.status === 'success') {
      return { 
        success: true, 
        message: json.message || 'Koneksi ke Google Apps Script & Google Sheet berhasil!' 
      };
    } else {
      return { 
        success: false, 
        message: json.message || 'Apps Script merespons dengan status error.' 
      };
    }
  } catch (err: any) {
    // Fallback detection: Apps Script Web App redirects are sometimes handled with no-cors or JSONP if needed,
    // but modern Apps Script standard Web Apps with Anyone access work with fetch.
    return { 
      success: false, 
      message: `Gagal terhubung: ${err.message || 'Periksa apakah URL Web App sudah diset ke "Siapa saja (Anyone)"'}` 
    };
  }
}

/**
 * Mengambil seluruh data (Links, Prestasi, Notifikasi, Analitik) dari Google Sheet
 */
export async function fetchAllFromGoogleSheet(): Promise<{
  success: boolean;
  data?: {
    links?: LinkItem[];
    prestasi?: PrestasiItem[];
    notifications?: ActivityNotification[];
    analytics?: Partial<AnalyticsData>;
    profile?: SchoolProfile;
  };
  message?: string;
}> {
  const endpoint = getAppsScriptUrl().trim();
  if (!endpoint) {
    return { success: false, message: 'URL Apps Script belum dikonfigurasi.' };
  }

  try {
    const url = new URL(endpoint);
    url.searchParams.set('action', 'getAll');
    url.searchParams.set('t', Date.now().toString());

    const res = await fetch(url.toString(), {
      method: 'GET',
      mode: 'cors',
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const result: AppsScriptResponse = await res.json();
    if (result.status === 'success' && result.data) {
      return {
        success: true,
        data: result.data,
        message: 'Data berhasil ditarik dari Google Sheet!'
      };
    }
    return { success: false, message: result.message || 'Gagal memproses data Google Sheet' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Terjadi kesalahan saat sinkronisasi Google Sheet' };
  }
}

/**
 * Mengirim dan menyinkronkan seluruh data ke Google Sheet Database
 */
export async function syncAllToGoogleSheet(payload: {
  links: LinkItem[];
  prestasi: PrestasiItem[];
  notifications: ActivityNotification[];
  analytics?: AnalyticsData;
  profile?: SchoolProfile;
}): Promise<{ success: boolean; message: string }> {
  const endpoint = getAppsScriptUrl().trim();
  if (!endpoint) {
    return { success: false, message: 'URL Apps Script belum dikonfigurasi.' };
  }

  try {
    // Gunakan POST dengan text/plain payload agar tidak memicu preflight CORS OPTIONS yang rumit di Apps Script
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        action: 'syncAll',
        data: payload,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();
    if (result.status === 'success') {
      return { success: true, message: result.message || 'Data berhasil disinkronkan ke Google Sheet!' };
    }
    return { success: false, message: result.message || 'Gagal menyimpan data ke Google Sheet' };
  } catch (err: any) {
    return { success: false, message: `Gagal mengirim ke Google Sheet: ${err.message}` };
  }
}

/**
 * Mencatat klik link ke Google Sheet di latar belakang (non-blocking)
 */
export function trackLinkClickInSheet(linkId: string, linkTitle: string): void {
  const endpoint = getAppsScriptUrl().trim();
  if (!endpoint) return;

  try {
    // Menggunakan navigator.sendBeacon atau fetch non-blocking
    const payload = JSON.stringify({
      action: 'trackClick',
      linkId,
      linkTitle,
      timestamp: new Date().toISOString(),
    });

    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: 'text/plain;charset=utf-8' });
      navigator.sendBeacon(endpoint, blob);
    } else {
      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    }
  } catch (e) {
    // Silent catch
  }
}

/**
 * Mencatat kunjungan pengunjung ke Google Sheet di latar belakang
 */
export function trackVisitorInSheet(device: string, referrer: string): void {
  const endpoint = getAppsScriptUrl().trim();
  if (!endpoint) return;

  try {
    const payload = JSON.stringify({
      action: 'trackVisit',
      device,
      referrer: referrer || 'Direct / Browser',
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    });

    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  } catch (e) {}
}

/**
 * Memberikan kode sumber Google Apps Script (Code.gs) lengkap
 * yang siap disalin oleh Admin untuk dipasang di Google Sheets.
 */
export function getAppsScriptCode(): string {
  return `/**
 * ====================================================================
 * BACKEND GOOGLE APPS SCRIPT - KESISWAAN SMK NEGERI 1 JEMBER (SMESA)
 * ====================================================================
 * Database Relasional / JSON API untuk Microsite Profil & Kesiswaan
 * Sekolah: SMK Negeri 1 Jember (Jl. Jambu No.17 Patrang - Jember)
 * Akun Pengelola: kesiswaansmesa@gmail.com
 * Hak Cipta: ict@kesiswaan20226
 * 
 * PETUNJUK PENERAPAN (DEPLOYMENT):
 * 1. Buka spreadsheet baru di https://sheets.new (Beri nama: "Database Kesiswaan SMESA").
 * 2. Klik menu: Ekstensi (Extensions) > Apps Script.
 * 3. Hapus semua kode bawaan, lalu tempelkan (Paste) seluruh kode ini.
 * 4. Klik ikon Disket (Simpan / Save).
 * 5. Jalankan fungsi "setupDatabaseSheets" satu kali untuk membuat tab otomatis.
 * 6. Klik tombol "Terapkan" (Deploy) di kanan atas > "Penerapan Baru" (New Deployment).
 * 7. Pilih jenis: "Aplikasi Web" (Web App).
 *    - Deskripsi: API Kesiswaan SMESA v1
 *    - Jalankan sebagai (Execute as): Saya (kesiswaansmesa@gmail.com)
 *    - Siapa yang memiliki akses (Who has access): Siapa saja (Anyone) -> WAJIB!
 * 8. Klik "Terapkan" (Deploy) dan salin "URL Aplikasi Web".
 * 9. Tempelkan URL tersebut ke cPanel Admin Microsite Kesiswaan.
 * ====================================================================
 */

// Nama Tab Sheet Database
var SHEET_LINKS = "Links";
var SHEET_PRESTASI = "Prestasi";
var SHEET_NOTIFIKASI = "Notifikasi";
var SHEET_ANALITIK = "Analitik";
var SHEET_VISITORS = "Log_Pengunjung";
var SHEET_PROFIL = "Profil_Sekolah";

/**
 * Handle Request GET (Ambil Data)
 */
function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : "getAll";
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ensureSheetsExist(ss);

  var response = {};

  try {
    if (action === "ping") {
      response = {
        status: "success",
        message: "Koneksi Google Apps Script & Database Sheet Aktif!",
        timestamp: new Date().toISOString()
      };
    } else if (action === "getAll") {
      response = {
        status: "success",
        data: {
          links: getSheetDataAsJson(ss.getSheetByName(SHEET_LINKS)),
          prestasi: getSheetDataAsJson(ss.getSheetByName(SHEET_PRESTASI)),
          notifications: getSheetDataAsJson(ss.getSheetByName(SHEET_NOTIFIKASI)),
          analytics: getAnalyticsSummary(ss),
          profile: getProfileData(ss.getSheetByName(SHEET_PROFIL))
        },
        timestamp: new Date().toISOString()
      };
    } else if (action === "getLinks") {
      response = {
        status: "success",
        data: getSheetDataAsJson(ss.getSheetByName(SHEET_LINKS))
      };
    } else if (action === "getPrestasi") {
      response = {
        status: "success",
        data: getSheetDataAsJson(ss.getSheetByName(SHEET_PRESTASI))
      };
    } else if (action === "getNotifications") {
      response = {
        status: "success",
        data: getSheetDataAsJson(ss.getSheetByName(SHEET_NOTIFIKASI))
      };
    } else if (action === "getProfile") {
      response = {
        status: "success",
        data: getProfileData(ss.getSheetByName(SHEET_PROFIL))
      };
    } else {
      response = {
        status: "error",
        message: "Aksi tidak dikenal: " + action
      };
    }
  } catch (err) {
    response = {
      status: "error",
      message: err.toString()
    };
  }

  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handle Request POST (Simpan / Sinkron Data / Tracking)
 */
function doPost(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ensureSheetsExist(ss);

  var response = {};

  try {
    var raw = e.postData ? e.postData.contents : "";
    var body = raw ? JSON.parse(raw) : {};
    var action = body.action || "syncAll";

    if (action === "syncAll") {
      var data = body.data || {};
      if (data.links && Array.isArray(data.links)) {
        saveJsonToSheet(ss.getSheetByName(SHEET_LINKS), data.links);
      }
      if (data.prestasi && Array.isArray(data.prestasi)) {
        saveJsonToSheet(ss.getSheetByName(SHEET_PRESTASI), data.prestasi);
      }
      if (data.notifications && Array.isArray(data.notifications)) {
        saveJsonToSheet(ss.getSheetByName(SHEET_NOTIFIKASI), data.notifications);
      }
      if (data.profile) {
        saveProfileToSheet(ss.getSheetByName(SHEET_PROFIL), data.profile);
      }
      if (data.analytics) {
        updateAnalyticsSummary(ss, data.analytics);
      }

      response = {
        status: "success",
        message: "Seluruh data kesiswaan berhasil disinkronkan ke Google Sheet!",
        timestamp: new Date().toISOString()
      };
    } else if (action === "trackClick") {
      incrementLinkClick(ss, body.linkId, body.linkTitle);
      response = { status: "success", message: "Klik tercatat" };
    } else if (action === "trackVisit") {
      recordVisitor(ss, body);
      response = { status: "success", message: "Kunjungan tercatat" };
    } else {
      response = { status: "error", message: "Aksi POST tidak valid" };
    }
  } catch (err) {
    response = {
      status: "error",
      message: err.toString()
    };
  }

  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Konversi baris sheet menjadi Array of Object (JSON)
 */
function getSheetDataAsJson(sheet) {
  if (!sheet) return [];
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  var headers = data[0];
  var rows = [];

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var obj = {};
    var hasValue = false;
    for (var j = 0; j < headers.length; j++) {
      var key = headers[j];
      var val = row[j];
      if (val !== "" && val !== null) hasValue = true;
      
      // Auto parsing boolean & number
      if (val === "TRUE" || val === true) val = true;
      if (val === "FALSE" || val === false) val = false;
      obj[key] = val;
    }
    if (hasValue && (obj.id || obj.title)) {
      rows.push(obj);
    }
  }
  return rows;
}

/**
 * Menyimpan Array of Object ke Sheet secara aman
 */
function saveJsonToSheet(sheet, items) {
  if (!sheet || !items) return;
  sheet.clearContents();

  if (items.length === 0) return;

  var headers = Object.keys(items[0]);
  var rows = [headers];

  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    var row = [];
    for (var j = 0; j < headers.length; j++) {
      var val = item[headers[j]];
      if (typeof val === "object" && val !== null) {
        val = JSON.stringify(val);
      }
      row.push(val !== undefined ? val : "");
    }
    rows.push(row);
  }

  sheet.getRange(1, 1, rows.length, headers.length).setValues(rows);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#e2e8f0");
}

/**
 * Menambahkan catatan log pengunjung
 */
function recordVisitor(ss, body) {
  var sheet = ss.getSheetByName(SHEET_VISITORS);
  if (!sheet) return;

  sheet.appendRow([
    new Date(),
    body.device || "Unknown",
    body.referrer || "Direct",
    body.userAgent || ""
  ]);

  // Update total di sheet analitik
  var aSheet = ss.getSheetByName(SHEET_ANALITIK);
  if (aSheet) {
    var totalViewsCell = aSheet.getRange("B2");
    var current = Number(totalViewsCell.getValue()) || 0;
    totalViewsCell.setValue(current + 1);
  }
}

/**
 * Menambah counter klik link
 */
function incrementLinkClick(ss, linkId, linkTitle) {
  var sheet = ss.getSheetByName(SHEET_LINKS);
  if (!sheet) return;
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return;

  var idCol = 0;
  var clickCol = -1;

  for (var j = 0; j < data[0].length; j++) {
    if (data[0][j] === "id") idCol = j;
    if (data[0][j] === "clickCount") clickCol = j;
  }

  if (clickCol !== -1) {
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][idCol]) === String(linkId)) {
        var current = Number(data[i][clickCol]) || 0;
        sheet.getRange(i + 1, clickCol + 1).setValue(current + 1);
        break;
      }
    }
  }
}

/**
 * Ringkasan analitik
 */
function getAnalyticsSummary(ss) {
  var sheet = ss.getSheetByName(SHEET_ANALITIK);
  if (!sheet) return { totalViews: 0 };
  var vals = sheet.getDataRange().getValues();
  var summary = {};
  for (var i = 1; i < vals.length; i++) {
    if (vals[i][0]) {
      summary[vals[i][0]] = vals[i][1];
    }
  }
  return summary;
}

function updateAnalyticsSummary(ss, analytics) {
  var sheet = ss.getSheetByName(SHEET_ANALITIK);
  if (!sheet) return;
  sheet.clearContents();
  var rows = [
    ["Metrik", "Nilai", "Terakhir Diperbarui"],
    ["totalViews", analytics.totalViews || 0, new Date()],
    ["uniqueVisitors", analytics.uniqueVisitors || 0, new Date()],
    ["resumeDownloads", analytics.resumeDownloads || 0, new Date()]
  ];
  sheet.getRange(1, 1, rows.length, 3).setValues(rows);
  sheet.getRange(1, 1, 1, 3).setFontWeight("bold").setBackground("#e2e8f0");
}

/**
 * Otomatis membuat struktur Sheet & Header bila belum ada
 */
function setupDatabaseSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ensureSheetsExist(ss);
  SpreadsheetApp.getUi().alert("Database Kesiswaan SMKN 1 Jember berhasil diinisialisasi!");
}

function ensureSheetsExist(ss) {
  // 1. Tab Links
  var lSheet = ss.getSheetByName(SHEET_LINKS);
  if (!lSheet) {
    lSheet = ss.insertSheet(SHEET_LINKS);
    lSheet.appendRow(["id", "title", "subtitle", "url", "category", "iconName", "isPinned", "isActive", "clickCount", "badgeText", "createdAt"]);
    lSheet.getRange(1, 1, 1, 11).setFontWeight("bold").setBackground("#e2e8f0");
  }

  // 2. Tab Prestasi
  var pSheet = ss.getSheetByName(SHEET_PRESTASI);
  if (!pSheet) {
    pSheet = ss.insertSheet(SHEET_PRESTASI);
    pSheet.appendRow(["id", "title", "studentName", "studentClass", "major", "competitionLevel", "rank", "year", "eventDate", "organizer", "description", "mentorTeacher", "verificationCode", "views"]);
    pSheet.getRange(1, 1, 1, 14).setFontWeight("bold").setBackground("#e2e8f0");
  }

  // 3. Tab Notifikasi
  var nSheet = ss.getSheetByName(SHEET_NOTIFIKASI);
  if (!nSheet) {
    nSheet = ss.insertSheet(SHEET_NOTIFIKASI);
    nSheet.appendRow(["id", "title", "message", "category", "timestamp", "isRead", "actionUrl"]);
    nSheet.getRange(1, 1, 1, 7).setFontWeight("bold").setBackground("#e2e8f0");
  }

  // 4. Tab Analitik
  var aSheet = ss.getSheetByName(SHEET_ANALITIK);
  if (!aSheet) {
    aSheet = ss.insertSheet(SHEET_ANALITIK);
    aSheet.appendRow(["Metrik", "Nilai", "Terakhir Diperbarui"]);
    aSheet.appendRow(["totalViews", 1450, new Date()]);
    aSheet.appendRow(["uniqueVisitors", 980, new Date()]);
    aSheet.appendRow(["resumeDownloads", 320, new Date()]);
    aSheet.getRange(1, 1, 1, 3).setFontWeight("bold").setBackground("#e2e8f0");
  }

  // 5. Tab Log_Pengunjung
  var vSheet = ss.getSheetByName(SHEET_VISITORS);
  if (!vSheet) {
    vSheet = ss.insertSheet(SHEET_VISITORS);
    vSheet.appendRow(["Timestamp", "Device", "Referrer", "UserAgent"]);
    vSheet.getRange(1, 1, 1, 4).setFontWeight("bold").setBackground("#e2e8f0");
  }

  // 6. Tab Profil_Sekolah
  var profSheet = ss.getSheetByName(SHEET_PROFIL);
  if (!profSheet) {
    profSheet = ss.insertSheet(SHEET_PROFIL);
    profSheet.appendRow(["name", "shortName", "tagline", "npsn", "accreditation", "address", "city", "postalCode", "phone", "whatsappKesiswaan", "email", "website", "headOfKesiswaan", "headmaster", "totalStudents", "totalEkskul", "logoUrl"]);
    profSheet.appendRow(["SMK Negeri 1 Jember", "Kesiswaan SMESA", "Membina Generasi Unggul, Berkarakter Kuat, Mandiri & Berprestasi", "20523847", "Akreditasi A (Unggul)", "Jl. Jambu No.17 Patrang", "Jember", "68118", "(0331) 335041", "6281233550412", "kesiswaansmesa@gmail.com", "https://smkn1jember.sch.id", "Dra. Hj. Sri Wahyuni, M.Pd.", "Drs. H. Sri Hartono, M.Pd.", 2450, 24, "https://iili.io/nODPK6g.md.png"]);
    profSheet.getRange(1, 1, 1, 17).setFontWeight("bold").setBackground("#e2e8f0");
  }
}

function getProfileData(sheet) {
  if (!sheet) return null;
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return null;
  var headers = data[0];
  var values = data[1];
  var prof = {};
  for (var i = 0; i < headers.length; i++) {
    prof[headers[i]] = values[i];
  }
  return prof;
}

function saveProfileToSheet(sheet, profile) {
  if (!sheet || !profile) return;
  var headers = ["name", "shortName", "tagline", "npsn", "accreditation", "address", "city", "postalCode", "phone", "whatsappKesiswaan", "email", "website", "headOfKesiswaan", "headmaster", "totalStudents", "totalEkskul", "logoUrl"];
  var row = headers.map(function(h) { return profile[h] !== undefined ? profile[h] : ""; });
  sheet.clearContents();
  sheet.appendRow(headers);
  sheet.appendRow(row);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#e2e8f0");
}
`;
}
