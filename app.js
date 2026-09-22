/* ============================================================
   Catatan Lamaran Kerja — app.js
   Local-first job application tracker. No dependencies.
   All user-supplied strings are escaped before rendering.
   ============================================================ */
'use strict';

/* ---------- constants ---------- */
const STORE_KEYS = { apps: 'jat.apps.v2', checklist: 'jat.checklist.v2', theme: 'jat.theme', perPage: 'jat.perPage' };
const LEGACY_KEY = 'jobApplications';
const FOLLOWUP_DAYS = 14;

const STATUS_LABELS = { wishlist: 'Wishlist', applied: 'Applied', interview: 'Interview', offer: 'Offer', rejected: 'Rejected' };
const STATUS_ORDER = ['wishlist', 'applied', 'interview', 'offer', 'rejected'];
const STATUS_COLORS = { wishlist: '#e8c84a', applied: '#5b8db8', interview: '#8a63c9', offer: '#4caf50', rejected: '#c96a6a' };
const CURRENCY_SYMBOLS = { IDR: 'Rp', USD: '$', SGD: 'S$', MYR: 'RM', EUR: '€', GBP: '£' };
const PLATFORMS = ['LinkedIn', 'JobStreet', 'Glints', 'Kalibrr', 'Indeed', 'Website Perusahaan', 'Email Langsung', 'Referral', 'Walk-in', 'Lainnya'];

const MOTIVATIONAL_QUOTES = [
  'Setiap "tidak" membawa kamu lebih dekat ke "ya" yang tepat. 💪',
  'Kesuksesan adalah hasil dari persiapan, kerja keras, dan belajar dari kegagalan.',
  'Karir impian kamu sedang menunggu. Jangan menyerah!',
  'Proses mencari kerja adalah investasi untuk masa depan yang lebih baik.',
  'Tetap semangat! Pekerjaan terbaik kamu belum datang.',
  'Setiap rejection adalah redirect ke tempat yang lebih baik. 🚀',
  'Percaya diri dengan skill kamu. Terus coba dan jangan takut gagal!',
  'Kamu lebih dekat dengan tawaran kerja dari yang kamu kira. Keep going!',
  'Melamar lebih awal beats melamar sempurna. Kirim hari ini!',
  'Catat, tindak lanjuti, ulangi. Konsistensi mengalahkan motivasi.'
];

/* ---------- tiny helpers ---------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

function esc(str) {
  return String(str ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function monthKey(d) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; }
function isoDaysAgo(n) {
  const d = new Date(); d.setDate(d.getDate() - n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function safeUrl(u) {
  const raw = String(u ?? '').trim();
  if (!raw) return '';
  try {
    // Reject anything that looks like a scheme other than http/https/mailto upfront,
    // so `new URL("javascript:alert(1)", origin)` can't be treated as a relative path.
    if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(raw) && !/^(https?|mailto):/i.test(raw)) return '';
    const parsed = new URL(raw, location.origin);
    return ['http:', 'https:', 'mailto:'].includes(parsed.protocol) ? parsed.href : '';
  } catch { return ''; }
}
function relDateText(iso) {
  const n = daysBetween(iso);
  if (n === 0) return '(hari ini)';
  if (n === 1) return '(kemarin)';
  if (n < 0) return `(${Math.abs(n)} hari lagi)`;
  return `(${n} hari lalu)`;
}
function daysBetween(iso, now = new Date()) {
  const d = new Date(iso + 'T00:00:00');
  if (isNaN(d)) return Infinity;
  const mid = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((mid - d) / 86400000);
}
function fmtDateID(iso) {
  if (!iso) return '—';
  const d = new Date(iso + 'T00:00:00');
  if (isNaN(d)) return iso;
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}
function fmtNumber(n) {
  if (n === null || n === undefined || n === '' || isNaN(n)) return '';
  return String(Math.round(Number(n))).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}
function parseFormattedNumber(str) {
  const digits = String(str ?? '').replace(/\D/g, '');
  return digits ? Number(digits) : null;
}
function moneyText(app) {
  const sym = CURRENCY_SYMBOLS[app.currency] || 'Rp';
  const min = app.salaryMin, max = app.salaryMax;
  if (min && max) return `${sym} ${fmtNumber(min)} – ${fmtNumber(max)}`;
  if (min) return `${sym} ${fmtNumber(min)}+`;
  if (max) return `s/d ${sym} ${fmtNumber(max)}`;
  return '';
}
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
function dailySeed() { return new Date().toISOString().slice(0, 10); }
function seededQuote() {
  let h = 0;
  for (const ch of dailySeed()) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return MOTIVATIONAL_QUOTES[h % MOTIVATIONAL_QUOTES.length];
}

/* ---------- state ---------- */
let applications = [];
let checklistState = {};
let editingId = null;
let pendingImport = null;
let deleteTargetId = null;
let currentPage = 1;
let itemsPerPage = 10;

const filters = { keyword: '', status: '', platform: '', dateFrom: '', dateTo: '', followupOnly: false };
let sortBy = 'date-desc';

/* ---------- persistence ---------- */
function saveApps() {
  try {
    localStorage.setItem(STORE_KEYS.apps, JSON.stringify(applications));
  } catch (e) {
    showToast('Gagal menyimpan ke localStorage. Kuota browser mungkin penuh — export JSON untuk backup.', 'error', 'Penyimpanan penuh');
  }
}
function saveChecklist() { localStorage.setItem(STORE_KEYS.checklist, JSON.stringify(checklistState)); }

function migrateLegacy() {
  const legacy = localStorage.getItem(LEGACY_KEY);
  if (!legacy) return null;
  try {
    const arr = JSON.parse(legacy);
    if (!Array.isArray(arr)) return null;
    return arr.map(a => {
      let salaryMin = null, salaryMax = null;
      const s = String(a.salary || '');
      if (s.includes(' - ')) {
        const [lo, hi] = s.split(' - ');
        salaryMin = parseFormattedNumber(lo); salaryMax = parseFormattedNumber(hi);
      } else if (s.startsWith('Up to ')) {
        salaryMax = parseFormattedNumber(s.replace('Up to ', ''));
      } else if (s) {
        salaryMin = parseFormattedNumber(s);
      }
      return {
        id: uid(),
        company: String(a.company || ''), position: String(a.position || ''),
        status: STATUS_ORDER.includes(a.status) ? a.status : 'applied',
        date: a.date || todayISO(), currency: a.currency || 'IDR',
        salaryMin, salaryMax,
        location: a.location || '', platform: a.platform || '',
        contact: '', sourceUrl: '', notes: a.notes || '',
        createdAt: Date.now(), updatedAt: Date.now()
      };
    });
  } catch { return null; }
}

function loadAll() {
  let apps = null;
  try { apps = JSON.parse(localStorage.getItem(STORE_KEYS.apps)); } catch { apps = null; }
  if (!Array.isArray(apps)) {
    const migrated = migrateLegacy();
    apps = migrated || [];
    if (migrated) { localStorage.setItem(STORE_KEYS.apps, JSON.stringify(apps)); localStorage.removeItem(LEGACY_KEY); }
  }
  applications = apps.filter(a => a && a.company && a.position).map(a => ({
    id: a.id || uid(),
    company: String(a.company), position: String(a.position),
    status: STATUS_ORDER.includes(a.status) ? a.status : 'applied',
    date: a.date || todayISO(), currency: a.currency || 'IDR',
    salaryMin: a.salaryMin ?? null, salaryMax: a.salaryMax ?? null,
    location: a.location || '', platform: a.platform || '',
    contact: a.contact || '', sourceUrl: a.sourceUrl || '', notes: a.notes || '',
    createdAt: a.createdAt || Date.now(), updatedAt: a.updatedAt || Date.now()
  }));

  try { checklistState = JSON.parse(localStorage.getItem(STORE_KEYS.checklist)) || {}; } catch { checklistState = {}; }

  const theme = localStorage.getItem(STORE_KEYS.theme);
  if (theme === 'night' || theme === 'day') applyTheme(theme);
  else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) applyTheme('night');

  const pp = localStorage.getItem(STORE_KEYS.perPage);
  if (pp) { itemsPerPage = pp === 'all' ? Infinity : Number(pp) || 10; $('#per-page').value = pp; }
}

/* ---------- follow-up logic ---------- */
function needsFollowup(app) {
  if (!['wishlist', 'applied', 'interview'].includes(app.status)) return false;
  const refTime = Math.max(new Date(app.date + 'T00:00:00').getTime() || 0, app.updatedAt || 0);
  if (isNaN(refTime)) return false;
  const ref = new Date(refTime);
  const refISO = `${ref.getFullYear()}-${String(ref.getMonth() + 1).padStart(2, '0')}-${String(ref.getDate()).padStart(2, '0')}`;
  return daysBetween(refISO) >= FOLLOWUP_DAYS;
}
function followupApps() { return applications.filter(needsFollowup); }

/* ---------- filtering & sorting ---------- */
function currentFiltered() {
  const kw = filters.keyword.trim().toLowerCase();
  let list = applications.filter(app => {
    if (kw) {
      const hay = [app.company, app.position, app.location, app.notes, app.contact, app.platform].join(' ').toLowerCase();
      if (!hay.includes(kw)) return false;
    }
    if (filters.status && app.status !== filters.status) return false;
    if (filters.platform && app.platform !== filters.platform) return false;
    if (filters.dateFrom && app.date < filters.dateFrom) return false;
    if (filters.dateTo && app.date > filters.dateTo) return false;
    if (filters.followupOnly && !needsFollowup(app)) return false;
    return true;
  });

  const cmp = {
    'date-desc': (a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt,
    'date-asc': (a, b) => a.date.localeCompare(b.date) || a.createdAt - b.createdAt,
    'updated-desc': (a, b) => (b.updatedAt || 0) - (a.updatedAt || 0),
    'company-asc': (a, b) => a.company.localeCompare(b.company, 'id'),
    'status': (a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status) || b.date.localeCompare(a.date)
  }[sortBy];
  return list.sort(cmp);
}

/* ---------- stats ---------- */
function updateStats() {
  const counts = { total: applications.length };
  for (const s of STATUS_ORDER) counts[s] = applications.filter(a => a.status === s).length;
  counts.followup = followupApps().length;

  const strip = $('#stats-strip');
  const cards = [
    { key: 'total', label: 'Total Lamaran', value: counts.total, cls: '', filter: null },
    { key: 'applied', label: 'Applied', value: counts.applied, cls: '', filter: { status: 'applied' } },
    { key: 'interview', label: 'Interview', value: counts.interview, cls: '', filter: { status: 'interview' } },
    { key: 'offer', label: 'Offer 🎉', value: counts.offer, cls: 'stat-offer', filter: { status: 'offer' } },
    { key: 'rejected', label: 'Rejected', value: counts.rejected, cls: 'stat-rejected', filter: { status: 'rejected' } },
    { key: 'followup', label: `Perlu Follow-up (≥${FOLLOWUP_DAYS} hari)`, value: counts.followup, cls: 'stat-followup', filter: { followupOnly: true } }
  ];
  strip.innerHTML = cards.map(c => `
    <div class="stat ${c.cls} ${c.filter ? 'clickable' : ''}" ${c.filter ? `data-stat-filter='${JSON.stringify(c.filter)}' role="button" tabindex="0" title="Klik untuk memfilter"` : ''}>
      <div class="stat-value">${c.value}</div>
      <div class="stat-label">${esc(c.label)}</div>
    </div>`).join('');

  // follow-up banner
  const fu = followupApps();
  const banner = $('#followup-banner');
  banner.hidden = fu.length === 0;
  if (fu.length) {
    const names = fu.slice(0, 3).map(a => esc(a.company)).join(', ');
    $('#followup-banner-text').textContent = `${fu.length} lamaran belum ada kabar ≥${FOLLOWUP_DAYS} hari: ${names}${fu.length > 3 ? ` +${fu.length - 3} lainnya` : ''}. Kirim pesan tindak lanjut!`;
  }

  // post-its
  const streak = applications.filter(a => daysBetween(a.date) <= 7 && daysBetween(a.date) >= 0).length;
  $('#postit-streak-body').textContent = streak > 0
    ? `${streak} lamaran dicatat 7 hari terakhir. Pertahankan ritmemu!`
    : (applications.length ? 'Belum ada lamaran baru minggu ini. Yuk catat satu hari ini!' : 'Belum ada data. Mulai catat lamaran pertamamu!');

  const fuPostit = $('#postit-followup');
  fuPostit.hidden = fu.length === 0;
  $('#postit-followup-body').textContent = fu.length ? `${fu.length} lamaran menunggu ditindaklanjuti. Klik untuk melihat daftar.` : '';

  const iv = applications.filter(a => a.status === 'interview');
  const ivPostit = $('#postit-interview');
  ivPostit.hidden = iv.length === 0;
  $('#postit-interview-body').textContent = iv.length ? iv.slice(0, 2).map(a => `${a.company} — ${a.position}`).join(' • ') + (iv.length > 2 ? ` +${iv.length - 1}` : '') : '';

  const cl = checklistProgress();
  $('#postit-checklist-body').textContent = cl.total ? `Checklist persiapan: ${cl.done}/${cl.total} (${cl.pct}%) selesai` : 'Persiapan sebelum melamar';

  renderAnalytics();
}

/* ---------- rendering: applications ---------- */
function renderApplications() {
  const filtered = currentFiltered();
  const totalPages = itemsPerPage === Infinity ? 1 : Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  if (currentPage > totalPages) currentPage = totalPages;

  const start = itemsPerPage === Infinity ? 0 : (currentPage - 1) * itemsPerPage;
  const pageApps = filtered.slice(start, itemsPerPage === Infinity ? undefined : start + itemsPerPage);

  $('#total-count').textContent = applications.length;
  $('#showing-count').textContent = pageApps.length;

  const list = $('#apps-list');
  if (applications.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🎯</div>
        <div class="empty-title">Yuk, mulai perjalanan karirmu!</div>
        <div class="empty-quote">${esc(seededQuote())}</div>
        <p>Belum ada lamaran yang tercatat. Tambahkan lamaran pertama dan mulai lacak prosesnya.</p>
        <div style="margin-top:14px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
          <button class="btn btn-primary" data-action="add">✏️ Tambah Lamaran Pertama</button>
          <button class="btn" data-action="seed">📚 Muat data contoh</button>
        </div>
      </div>`;
  } else if (filtered.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🔍</div>
        <div class="empty-title">Tidak ada yang cocok</div>
        <p>Tidak ada lamaran yang sesuai filter aktif. Coba longgarkan filter.</p>
        <div style="margin-top:14px"><button class="btn" data-action="reset-filters">↺ Reset filter</button></div>
      </div>`;
  } else {
    list.innerHTML = pageApps.map((app, i) => renderAppCard(app, i)).join('');
  }

  renderPagination(filtered.length, totalPages);
  renderActiveFilters();
  updateStats();
}

function renderAppCard(app, idx) {
  const fu = needsFollowup(app);
  const updated = app.updatedAt ? new Date(app.updatedAt) : null;
  const pinColors = ['pin-red', 'pin-blue', 'pin-green', 'pin-yellow'];
  const quickStatuses = STATUS_ORDER.filter(s => s !== app.status);

  return `
  <div class="app-card reveal" data-id="${esc(app.id)}">
    <div class="pin ${pinColors[idx % 4]} card-pin" aria-hidden="true"></div>
    <div class="app-head">
      <div class="app-title">
        <div class="app-company">${esc(app.company)}</div>
        <div class="app-position">${esc(app.position)}</div>
      </div>
      <div class="app-badges">
        <div class="badge-row">
          <span class="status-badge status-${esc(app.status)}">${STATUS_LABELS[app.status]}</span>
          ${fu ? '<span class="followup-stamp" title="Belum ada kabar ≥14 hari">FOLLOW UP!</span>' : ''}
        </div>
        <div class="badge-row">
          ${app.platform ? `<span class="meta-badge">🌐 ${esc(app.platform)}</span>` : ''}
          ${app.location ? `<span class="meta-badge">📍 ${esc(app.location)}</span>` : ''}
        </div>
      </div>
    </div>
    <div class="app-details">
      <div class="detail-item"><span class="detail-label">📅 Melamar:</span>${fmtDateID(app.date)} <span class="app-updated">${relDateText(app.date)}</span></div>
      ${moneyText(app) ? `<div class="detail-item"><span class="detail-label">💰 Gaji:</span>${esc(moneyText(app))}</div>` : ''}
      ${app.contact ? `<div class="detail-item"><span class="detail-label">👤 Kontak:</span>${esc(app.contact)}</div>` : ''}
      ${safeUrl(app.sourceUrl) ? `<div class="detail-item"><span class="detail-label">🔗 Lowongan:</span><a href="${esc(safeUrl(app.sourceUrl))}" target="_blank" rel="noopener noreferrer">buka link</a></div>` : ''}
    </div>
    ${app.notes ? `<div class="app-notes">📝 ${esc(app.notes)}</div>` : ''}
    <div class="app-actions">
      <label style="display:flex;align-items:center;gap:6px;margin:0;font-size:.85em">
        <span style="color:var(--ink-faint)">Ubah status:</span>
        <select class="status-quick" data-action="quick-status" aria-label="Ubah status ${esc(app.company)}">
          <option value="">→ pilih…</option>
          ${quickStatuses.map(s => `<option value="${s}">${STATUS_LABELS[s]}</option>`).join('')}
        </select>
      </label>
      <span class="spacer"></span>
      <button class="btn btn-small" data-action="edit" type="button">✏️ Edit</button>
      <button class="btn btn-small btn-danger" data-action="delete" type="button">🗑️ Hapus</button>
    </div>
  </div>`;
}

function renderPagination(total, totalPages) {
  const c = $('#pagination-container');
  if (totalPages <= 1) { c.innerHTML = ''; return; }
  let html = `<div class="pagination"><button data-page="${currentPage - 1}" ${currentPage === 1 ? 'disabled' : ''}>‹ Prev</button>`;
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
      html += `<button data-page="${i}" class="${i === currentPage ? 'active' : ''}">${i}</button>`;
    } else if (i === currentPage - 3 || i === currentPage + 3) {
      html += '<span class="dots">…</span>';
    }
  }
  html += `<button data-page="${currentPage + 1}" ${currentPage === totalPages ? 'disabled' : ''}>Next ›</button></div>`;
  c.innerHTML = html;
}

function renderActiveFilters() {
  const chips = [];
  if (filters.keyword) chips.push(['keyword', `🔍 "${filters.keyword}"`]);
  if (filters.status) chips.push(['status', `📊 ${STATUS_LABELS[filters.status]}`]);
  if (filters.platform) chips.push(['platform', `🌐 ${filters.platform}`]);
  if (filters.dateFrom) chips.push(['dateFrom', `📅 dari ${fmtDateID(filters.dateFrom)}`]);
  if (filters.dateTo) chips.push(['dateTo', `📅 s/d ${fmtDateID(filters.dateTo)}`]);
  if (filters.followupOnly) chips.push(['followupOnly', `⏰ hanya perlu follow-up`]);
  const box = $('#active-filters');
  box.innerHTML = chips.map(([key, label]) =>
    `<span class="filter-chip">${esc(label)}<button type="button" data-clear-filter="${key}" aria-label="Hapus filter ${esc(label)}">×</button></span>`
  ).join('');
}

/* ---------- postit quote ---------- */
function renderQuote() { $('#postit-quote-body').textContent = seededQuote(); }

/* ---------- toasts ---------- */
function showToast(message, type = 'success', title = '', action = null) {
  const container = $('#toast-container');
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  const titles = { success: 'Berhasil!', error: 'Error!', info: 'Info', warning: 'Perhatian!' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <div class="toast-icon">${icons[type] || 'ℹ️'}</div>
    <div class="toast-content">
      <div class="toast-title">${esc(title || titles[type] || '')}</div>
      <div class="toast-message">${esc(message)}</div>
    </div>
    ${action ? `<button class="toast-action" type="button">${esc(action.label)}</button>` : ''}
    <button class="toast-close" type="button" aria-label="Tutup notifikasi">×</button>`;
  container.appendChild(toast);

  const remove = () => {
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 300);
  };
  const timer = setTimeout(remove, action ? 7000 : 4000);
  $('.toast-close', toast).addEventListener('click', () => { clearTimeout(timer); remove(); });
  if (action) {
    $('.toast-action', toast).addEventListener('click', () => { clearTimeout(timer); remove(); action.onClick(); });
  }
}

/* ---------- dialog: add/edit ---------- */
const appDialog = $('#app-dialog');

function openAddDialog() {
  editingId = null;
  $('#dialog-title').textContent = '✏️ Tambah Lamaran Baru';
  $('#btn-dialog-save').textContent = '💾 Simpan Lamaran';
  $('#job-form').reset();
  $('#f-date').value = todayISO();
  $('#f-currency').value = 'IDR';
  updateSalaryHint();
  appDialog.showModal();
  setTimeout(() => $('#f-company').focus(), 60);
}

function openEditDialog(id) {
  const app = applications.find(a => a.id === id);
  if (!app) return;
  editingId = id;
  $('#dialog-title').textContent = '✏️ Edit Lamaran';
  $('#btn-dialog-save').textContent = '💾 Simpan Perubahan';
  $('#f-company').value = app.company;
  $('#f-position').value = app.position;
  $('#f-status').value = app.status;
  $('#f-date').value = app.date;
  $('#f-platform').value = app.platform;
  $('#f-location').value = app.location;
  $('#f-currency').value = app.currency || 'IDR';
  $('#f-salary-min').value = app.salaryMin ? fmtNumber(app.salaryMin) : '';
  $('#f-salary-max').value = app.salaryMax ? fmtNumber(app.salaryMax) : '';
  $('#f-contact').value = app.contact || '';
  $('#f-source-url').value = app.sourceUrl || '';
  $('#f-notes').value = app.notes || '';
  updateSalaryHint();
  appDialog.showModal();
}

function updateSalaryHint() {
  const min = parseFormattedNumber($('#f-salary-min').value);
  const max = parseFormattedNumber($('#f-salary-max').value);
  const cur = CURRENCY_SYMBOLS[$('#f-currency').value] || 'Rp';
  const hint = $('#salary-hint');
  if (min && max && min > max) { hint.textContent = '⚠️ Gaji minimum lebih besar dari maksimum — periksa lagi.'; hint.style.color = 'var(--rose)'; }
  else if (min || max) {
    hint.textContent = min && max ? `Rentang: ${cur} ${fmtNumber(min)} – ${fmtNumber(max)}` : min ? `Minimal: ${cur} ${fmtNumber(min)}` : `Maksimum: ${cur} ${fmtNumber(max)}`;
    hint.style.color = '';
  } else hint.textContent = '';
}

function autoFormatSalary(input) {
  input.addEventListener('input', () => {
    const pos = input.selectionStart;
    const before = input.value;
    const digits = before.replace(/\D/g, '');
    input.value = digits ? digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '';
    if (pos !== null && input.value.length < before.length) input.setSelectionRange(input.value.length, input.value.length);
    updateSalaryHint();
  });
}

$('#job-form').addEventListener('submit', e => {
  e.preventDefault();
  const min = parseFormattedNumber($('#f-salary-min').value);
  const max = parseFormattedNumber($('#f-salary-max').value);
  if (min && max && min > max) { showToast('Gaji minimum lebih besar dari maksimum. Perbaiki dulu ya.', 'warning'); return; }

  const data = {
    company: $('#f-company').value.trim(),
    position: $('#f-position').value.trim(),
    status: $('#f-status').value,
    date: $('#f-date').value || todayISO(),
    currency: $('#f-currency').value,
    salaryMin: min, salaryMax: max,
    location: $('#f-location').value.trim(),
    platform: $('#f-platform').value,
    contact: $('#f-contact').value.trim(),
    sourceUrl: $('#f-source-url').value.trim(),
    notes: $('#f-notes').value.trim(),
    updatedAt: Date.now()
  };
  if (!data.company || !data.position) { showToast('Perusahaan dan posisi wajib diisi.', 'warning'); return; }

  if (editingId !== null) {
    const i = applications.findIndex(a => a.id === editingId);
    if (i !== -1) applications[i] = { ...applications[i], ...data };
    showToast(`Lamaran ${data.company} berhasil diupdate.`, 'success');
  } else {
    applications.push({ ...data, id: uid(), createdAt: Date.now() });
    showToast(`Lamaran ${data.company} berhasil ditambahkan!`, 'success');
  }
  editingId = null;
  saveApps();
  renderApplications();
  appDialog.close();
});

$('#btn-dialog-cancel').addEventListener('click', () => { editingId = null; appDialog.close(); });

/* ---------- quick status ---------- */
function quickStatus(id, newStatus) {
  const app = applications.find(a => a.id === id);
  if (!app || app.status === newStatus) return;
  const old = app.status;
  app.status = newStatus;
  app.updatedAt = Date.now();
  saveApps();
  renderApplications();
  showToast(`${app.company}: ${STATUS_LABELS[old]} → ${STATUS_LABELS[newStatus]}`, 'success', 'Status diubah', {
    label: '↺ Undo',
    onClick: () => {
      const a = applications.find(x => x.id === id);
      if (a) { a.status = old; a.updatedAt = Date.now(); saveApps(); renderApplications(); }
    }
  });
}

/* ---------- delete with undo ---------- */
const confirmDialog = $('#confirm-dialog');
$('#btn-confirm-cancel').addEventListener('click', () => { deleteTargetId = null; confirmDialog.close(); });
$('#btn-confirm-ok').addEventListener('click', () => {
  const id = deleteTargetId;
  confirmDialog.close();
  deleteTargetId = null;
  const idx = applications.findIndex(a => a.id === id);
  if (idx === -1) return;
  const [removed] = applications.splice(idx, 1);
  saveApps();
  renderApplications();
  showToast(`Lamaran ${removed.company} — ${removed.position} dihapus.`, 'info', 'Terhapus', {
    label: '↺ Undo',
    onClick: () => { applications.splice(idx, 0, removed); saveApps(); renderApplications(); showToast('Lamaran dipulihkan.', 'success'); }
  });
});

function askDelete(id) {
  const app = applications.find(a => a.id === id);
  if (!app) return;
  deleteTargetId = id;
  $('#confirm-message').textContent = `Yakin ingin menghapus lamaran "${app.company} — ${app.position}"? Masih bisa di-undo setelah dihapus.`;
  confirmDialog.showModal();
}

/* ---------- export ---------- */
function download(filename, content, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function exportJSON() {
  if (!applications.length) { showToast('Belum ada data untuk di-export.', 'warning'); return; }
  download(`job-applications-${todayISO()}.json`, JSON.stringify(applications, null, 2), 'application/json');
  showToast(`${applications.length} lamaran di-export ke JSON.`, 'success');
}

function exportCSV() {
  const rows = currentFiltered();
  if (!rows.length) { showToast('Tidak ada data (sesuai filter) untuk di-export.', 'warning'); return; }
  const headers = ['Perusahaan', 'Posisi', 'Status', 'Tanggal Melamar', 'Mata Uang', 'Gaji Min', 'Gaji Max', 'Lokasi', 'Platform', 'Contact Person', 'Link Lowongan', 'Catatan'];
  const cell = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const lines = [headers.map(cell).join(',')];
  for (const a of rows) {
    lines.push([a.company, a.position, STATUS_LABELS[a.status], a.date, a.currency || 'IDR',
      a.salaryMin ?? '', a.salaryMax ?? '', a.location, a.platform, a.contact, a.sourceUrl, a.notes].map(cell).join(','));
  }
  download(`job-applications-${todayISO()}.csv`, '\ufeff' + lines.join('\r\n'), 'text/csv;charset=utf-8;');
  showToast(`${rows.length} baris di-export ke CSV.`, 'success');
}

/* ---------- import ---------- */
const importDialog = $('#import-dialog');
$('#btn-import').addEventListener('click', () => $('#import-file').click());
$('#import-file').addEventListener('change', e => {
  const file = e.target.files[0];
  e.target.value = '';
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const data = JSON.parse(ev.target.result);
      if (!Array.isArray(data)) { showToast('Format file tidak valid: harus array JSON.', 'error'); return; }
      const valid = data.filter(a => a && (a.company || a.perusahaan) && (a.position || a.posisi));
      if (!valid.length) { showToast('Tidak ada data lamaran valid di file ini.', 'error'); return; }
      pendingImport = valid.map(a => ({
        id: uid(),
        company: String(a.company || a.perusahaan), position: String(a.position || a.posisi),
        status: STATUS_ORDER.includes(a.status) ? a.status : 'applied',
        date: a.date || todayISO(), currency: a.currency || 'IDR',
        salaryMin: a.salaryMin ?? null, salaryMax: a.salaryMax ?? null,
        location: a.location || '', platform: a.platform || '',
        contact: a.contact || '', sourceUrl: a.sourceUrl || '', notes: a.notes || '',
        createdAt: a.createdAt || Date.now(), updatedAt: a.updatedAt || Date.now()
      }));
      $('#import-summary').textContent = `File "${file.name}" berisi ${pendingImport.length} lamaran valid. Data kamu sekarang: ${applications.length} lamaran. Pilih mode import:`;
      importDialog.showModal();
    } catch {
      showToast('Gagal membaca file. Pastikan isinya JSON yang valid.', 'error');
    }
  };
  reader.readAsText(file);
});
$('#btn-import-cancel').addEventListener('click', () => { pendingImport = null; importDialog.close(); });
$('#btn-import-confirm').addEventListener('click', () => {
  if (!pendingImport) return;
  const mode = $('input[name="import-mode"]:checked').value;
  const before = applications.length;
  if (mode === 'replace') {
    applications = pendingImport;
    showToast(`Semua data diganti: ${applications.length} lamaran dari file.`, 'success', 'Import selesai');
  } else {
    const sig = a => [a.company, a.position, a.status, a.date, a.platform].join('|').toLowerCase();
    const existing = new Set(applications.map(sig));
    let added = 0;
    for (const a of pendingImport) { if (!existing.has(sig(a))) { applications.push(a); existing.add(sig(a)); added++; } }
    showToast(`${added} lamaran baru ditambahkan, ${pendingImport.length - added} duplikat dilewati.`, 'success', 'Import selesai');
  }
  pendingImport = null;
  importDialog.close();
  saveApps();
  currentPage = 1;
  renderApplications();
});

/* ---------- filters wiring ---------- */
let kwTimer = null;
$('#filter-keyword').addEventListener('input', e => {
  clearTimeout(kwTimer);
  kwTimer = setTimeout(() => { filters.keyword = e.target.value; currentPage = 1; renderApplications(); }, 250);
});
$('#filter-status').addEventListener('change', e => { filters.status = e.target.value; currentPage = 1; renderApplications(); });
$('#filter-platform').addEventListener('change', e => { filters.platform = e.target.value; currentPage = 1; renderApplications(); });
$('#filter-date-from').addEventListener('change', e => { filters.dateFrom = e.target.value; currentPage = 1; renderApplications(); });
$('#filter-date-to').addEventListener('change', e => { filters.dateTo = e.target.value; currentPage = 1; renderApplications(); });
$('#sort-by').addEventListener('change', e => { sortBy = e.target.value; renderApplications(); });
$('#per-page').addEventListener('change', e => {
  const v = e.target.value;
  itemsPerPage = v === 'all' ? Infinity : Number(v);
  localStorage.setItem(STORE_KEYS.perPage, v);
  currentPage = 1;
  renderApplications();
});

function resetFilters() {
  Object.assign(filters, { keyword: '', status: '', platform: '', dateFrom: '', dateTo: '', followupOnly: false });
  $('#filter-keyword').value = ''; $('#filter-status').value = ''; $('#filter-platform').value = '';
  $('#filter-date-from').value = ''; $('#filter-date-to').value = '';
  currentPage = 1;
  renderApplications();
}
$('#btn-reset-filters').addEventListener('click', resetFilters);
$('#btn-filter-followup').addEventListener('click', () => {
  filters.followupOnly = true; currentPage = 1; renderApplications();
  $('#apps-list').scrollIntoView({ behavior: 'smooth', block: 'start' });
});

/* ---------- event delegation ---------- */
document.addEventListener('click', e => {
  const target = e.target.closest('[data-action], [data-page], [data-clear-filter], [data-stat-filter], [data-goto]');
  if (!target) return;

  const goto = target.dataset.goto;
  if (goto) { switchTab(goto); return; }

  const statFilter = target.dataset.statFilter;
  if (statFilter) {
    const f = JSON.parse(statFilter);
    resetFilters();
    Object.assign(filters, f);
    if (f.status) $('#filter-status').value = f.status;
    renderApplications();
    $('#apps-list').scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }

  const clearKey = target.dataset.clearFilter;
  if (clearKey) {
    filters[clearKey] = clearKey === 'followupOnly' ? false : '';
    if (clearKey === 'keyword') $('#filter-keyword').value = '';
    if (clearKey === 'status') $('#filter-status').value = '';
    if (clearKey === 'platform') $('#filter-platform').value = '';
    if (clearKey === 'dateFrom') $('#filter-date-from').value = '';
    if (clearKey === 'dateTo') $('#filter-date-to').value = '';
    currentPage = 1;
    renderApplications();
    return;
  }

  if (target.dataset.page) {
    const p = Number(target.dataset.page);
    if (!isNaN(p) && p >= 1) {
      currentPage = p;
      renderApplications();
      $('#apps-list').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    return;
  }

  const action = target.dataset.action;
  if (!action) return;
  const card = target.closest('.app-card');
  const id = card ? card.dataset.id : null;

  switch (action) {
    case 'add': openAddDialog(); break;
    case 'seed': seedSampleData(); break;
    case 'edit': if (id) openEditDialog(id); break;
    case 'delete': if (id) askDelete(id); break;
    case 'reset-filters': resetFilters(); break;
  }
});

document.addEventListener('change', e => {
  const quick = e.target.closest('[data-action="quick-status"]');
  if (!quick || !quick.value) return;
  const card = quick.closest('.app-card');
  if (card) quickStatus(card.dataset.id, quick.value);
});

document.addEventListener('keydown', e => {
  const stat = e.target.closest && e.target.closest('[data-stat-filter]');
  if (stat && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); stat.click(); }
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); switchTab('tracker'); $('#filter-keyword').focus(); }
  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && !appDialog.open && $('#page-tracker').classList.contains('active')) {
    const inField = e.target.closest('input, textarea, select');
    if (!inField) { e.preventDefault(); openAddDialog(); }
  }
});

/* ---------- seed sample data ---------- */
function seedSampleData() {
  const iso = isoDaysAgo;
  const samples = [
    { company: 'PT Teknologi Nusantara', position: 'Frontend Developer', status: 'interview', date: iso(16), platform: 'LinkedIn', location: 'Jakarta (Hybrid)', currency: 'IDR', salaryMin: 12000000, salaryMax: 18000000, contact: 'Rina — HRD', notes: 'Interview tahap 2 dengan user. Siapkan cerita STAR tentang proyek dashboard.', updatedAt: Date.now() - 16 * 86400000 },
    { company: 'Glints Startup ABC', position: 'Fullstack Engineer', status: 'applied', date: iso(20), platform: 'Glints', location: 'Remote', currency: 'IDR', salaryMin: 10000000, salaryMax: null, notes: 'Sudah kirim portofolio. Belum ada kabar — perlu follow-up!', updatedAt: Date.now() - 20 * 86400000 },
    { company: 'Bank Maju Jaya', position: 'Data Analyst', status: 'rejected', date: iso(35), platform: 'Website Perusahaan', location: 'Surabaya', currency: 'IDR', salaryMin: null, salaryMax: null, notes: 'Gugur di tahap tes teknis SQL. Pelajari lagi window functions.', updatedAt: Date.now() - 30 * 86400000 },
    { company: 'Startup Edukasi XYZ', position: 'Backend Developer', status: 'offer', date: iso(10), platform: 'Referral', location: 'Remote', currency: 'IDR', salaryMin: 15000000, salaryMax: 20000000, contact: 'Pak Dimas', notes: 'Offer via telepon! Negosiasi sebelum tanda tangan. 🎉', updatedAt: Date.now() - 2 * 86400000 },
    { company: 'Konsultan Data Global', position: 'Junior Data Scientist', status: 'wishlist', date: iso(2), platform: 'JobStreet', location: 'Singapore', currency: 'SGD', salaryMin: 4000, salaryMax: 5500, sourceUrl: 'https://example.com/loker', notes: 'Perbaiki CV versi bahasa Inggris dulu sebelum melamar.', updatedAt: Date.now() - 2 * 86400000 },
    { company: 'PT Retail Digital', position: 'Mobile Developer', status: 'applied', date: iso(5), platform: 'Kalibrr', location: 'Bandung', currency: 'IDR', salaryMin: 9000000, salaryMax: 14000000, updatedAt: Date.now() - 5 * 86400000 },
    { company: 'Agency Kreatif Senja', position: 'UI Engineer', status: 'applied', date: iso(8), platform: 'LinkedIn', location: 'Yogyakarta', currency: 'IDR', salaryMin: null, salaryMax: null, updatedAt: Date.now() - 8 * 86400000 }
  ];
  for (const s of samples) applications.push({ id: uid(), createdAt: Date.now(), updatedAt: Date.now(), contact: '', sourceUrl: '', notes: '', location: '', salaryMin: null, salaryMax: null, ...s });
  saveApps();
  currentPage = 1;
  renderApplications();
  showToast(`${samples.length} lamaran contoh dimuat. Coba filter, ubah status, dan analytics!`, 'success', 'Data contoh');
}

/* ---------- checklist ---------- */
const CHECKLIST_DATA = [
  { id: 'dokumen', title: '📄 Dokumen', items: [
    ['cv', 'CV/Resume terbaru dan sudah disesuaikan dengan posisi yang dilamar'],
    ['cover', 'Cover letter yang dipersonalisasi untuk perusahaan target'],
    ['portfolio', 'Portfolio/work samples (jika relevan dengan bidang kamu)'],
    ['certs', 'Sertifikat, ijazah, dan dokumen pendukung lainnya'],
    ['references', 'Daftar referensi (jika diminta)']
  ]},
  { id: 'online', title: '🌐 Online Presence', items: [
    ['linkedin', 'LinkedIn profile sudah dioptimasi dan up-to-date'],
    ['photo', 'Foto profil profesional di LinkedIn'],
    ['headline', 'LinkedIn headline yang menarik dan jelas'],
    ['social', 'Social media dibersihkan dari konten yang tidak profesional'],
    ['github', 'GitHub/portfolio online aktif (untuk tech roles)']
  ]},
  { id: 'riset', title: '🎯 Riset & Persiapan', items: [
    ['company', 'Riset perusahaan (produk, kultur, berita terbaru)'],
    ['jobdesc', 'Pahami job description dengan detail'],
    ['skills', 'List skills dan pengalaman yang match dengan requirements'],
    ['questions', 'Siapkan jawaban untuk pertanyaan interview umum'],
    ['stories', 'Siapkan 3-5 achievement stories dengan metode STAR'],
    ['ask', 'Siapkan minimal 5 pertanyaan untuk interviewer']
  ]},
  { id: 'interview', title: '💼 Interview Day', items: [
    ['outfit', 'Pakaian interview disiapkan sesuai dress code'],
    ['location', 'Lokasi interview dicek (atau link Zoom disimpan)'],
    ['reminder', 'Set reminder 1 jam sebelum interview'],
    ['print', 'Print CV dan dokumen penting (untuk offline interview)'],
    ['tech', 'Test koneksi internet, kamera, dan mic (untuk virtual)'],
    ['background', 'Atur background dan lighting yang baik (untuk virtual)']
  ]},
  { id: 'followup', title: '📧 Follow Up', items: [
    ['thankyou', 'Kirim thank-you email dalam 24 jam setelah interview'],
    ['review', 'Catat hal-hal penting dari interview untuk review'],
    ['tracker', 'Update status di tracker lamaran'],
    ['followup-reminder', 'Set reminder follow-up (jika belum ada kabar 1-2 minggu)']
  ]}
];

function checklistProgress() {
  let done = 0, total = 0;
  for (const cat of CHECKLIST_DATA) for (const [id] of cat.items) { total++; if (checklistState[`${cat.id}.${id}`]) done++; }
  return { done, total, pct: total ? Math.round(done / total * 100) : 0 };
}

function renderChecklist() {
  const container = $('#checklist-container');
  container.innerHTML = CHECKLIST_DATA.map(cat => {
    const done = cat.items.filter(([id]) => checklistState[`${cat.id}.${id}`]).length;
    const pct = Math.round(done / cat.items.length * 100);
    return `
    <div class="cl-category" data-cat="${cat.id}">
      <div class="cl-cat-head">
        <h3>${esc(cat.title)}</h3>
        <span class="cl-cat-count">${done}/${cat.items.length}</span>
      </div>
      <div class="cl-cat-track"><div class="cl-cat-fill" style="width:${pct}%"></div></div>
      ${cat.items.map(([id, text]) => `
        <div class="checklist-item">
          <input type="checkbox" id="cl-${cat.id}-${id}" data-cl="${cat.id}.${id}" ${checklistState[`${cat.id}.${id}`] ? 'checked' : ''}>
          <label for="cl-${cat.id}-${id}">${esc(text)}</label>
        </div>`).join('')}
    </div>`;
  }).join('');

  const p = checklistProgress();
  $('#cl-percent').textContent = `${p.pct}%`;
  $('#cl-progress').style.width = `${p.pct}%`;
}

document.addEventListener('change', e => {
  const box = e.target.closest('[data-cl]');
  if (!box) return;
  checklistState[box.dataset.cl] = box.checked;
  if (!box.checked) delete checklistState[box.dataset.cl];
  saveChecklist();
  const cat = box.closest('.cl-category');
  const catId = cat.dataset.cat;
  const data = CHECKLIST_DATA.find(c => c.id === catId);
  const done = data.items.filter(([id]) => checklistState[`${catId}.${id}`]).length;
  const pct = Math.round(done / data.items.length * 100);
  $('.cl-cat-count', cat).textContent = `${done}/${data.items.length}`;
  $('.cl-cat-fill', cat).style.width = `${pct}%`;
  const p = checklistProgress();
  $('#cl-percent').textContent = `${p.pct}%`;
  $('#cl-progress').style.width = `${p.pct}%`;
  $('#postit-checklist-body').textContent = `Checklist persiapan: ${p.done}/${p.total} (${p.pct}%) selesai`;
});

$('#btn-cl-reset').addEventListener('click', () => {
  checklistState = {};
  saveChecklist();
  renderChecklist();
  showToast('Checklist direset.', 'info');
});

/* ---------- analytics ---------- */
function renderAnalytics() {
  const c = $('#analytics-container');
  const n = applications.length;
  if (!n) {
    c.innerHTML = `<div class="panel full"><p>Belum ada data. Tambahkan lamaran dulu di tab <b>Tracker</b> untuk melihat analytics.</p></div>`;
    return;
  }

  const count = s => applications.filter(a => a.status === s).length;
  const applied = count('applied'), interview = count('interview'), offer = count('offer'), rejected = count('rejected'), wishlist = count('wishlist');
  const submitted = applied + interview + offer + rejected; // benar-benar dikirim
  const reachedInterview = interview + offer;
  const pct = (a, b) => b ? Math.round(a / b * 100) : 0;

  // funnel
  const funnelSteps = [
    { label: 'Total dicatat', value: n, color: '#e8c84a' },
    { label: 'Dikirim', value: submitted, color: '#5b8db8' },
    { label: 'Interview', value: reachedInterview, color: '#8a63c9' },
    { label: 'Offer', value: offer, color: '#4caf50' }
  ];
  const funnelHTML = funnelSteps.map((s, i) => {
    const w = Math.max(2, pct(s.value, n));
    const rate = i === 0 ? '—' : `${pct(s.value, funnelSteps[i - 1].value)}% dari tahap sebelumnya`;
    return `
    <div class="funnel-step">
      <span class="funnel-label">${s.label}</span>
      <div class="funnel-bar-wrap"><div class="funnel-bar" style="width:${w}%;background:${s.color}">${s.value}</div></div>
      <span class="funnel-rate">${rate}</span>
    </div>`;
  }).join('');

  // platform distribution
  const byPlatform = {};
  for (const a of applications) if (a.platform) byPlatform[a.platform] = (byPlatform[a.platform] || 0) + 1;
  const platformEntries = Object.entries(byPlatform).sort((x, y) => y[1] - x[1]);
  const platformHTML = platformEntries.length ? platformEntries.map(([p, v]) => `
    <div class="bar-row">
      <span class="bar-label" title="${esc(p)}">${esc(p)}</span>
      <div class="bar-track"><div class="bar-fill" style="width:${pct(v, platformEntries[0][1])}%"></div></div>
      <span class="bar-value">${v}</span>
    </div>`).join('') : '<p class="panel-note">Belum ada platform yang tercatat.</p>';

  // status distribution
  const statusHTML = STATUS_ORDER.map(s => {
    const v = count(s);
    return `
    <div class="bar-row">
      <span class="bar-label">${STATUS_LABELS[s]}</span>
      <div class="bar-track"><div class="bar-fill" style="width:${pct(v, n)}%;background:${STATUS_COLORS[s]}"></div></div>
      <span class="bar-value">${v}</span>
    </div>`;
  }).join('');

  // monthly trend (last 6 months incl. current)
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ key: monthKey(d), label: d.toLocaleDateString('id-ID', { month: 'short' }), count: 0 });
  }
  for (const a of applications) {
    const k = (a.date || '').slice(0, 7);
    const m = months.find(x => x.key === k);
    if (m) m.count++;
  }
  const maxMonth = Math.max(1, ...months.map(m => m.count));
  const trendHTML = months.map(m => `
    <div class="trend-col">
      <span class="trend-count">${m.count || ''}</span>
      <div class="trend-bar" style="height:${Math.max(2, m.count / maxMonth * 100)}%"></div>
      <span class="trend-month">${m.label}</span>
    </div>`).join('');

  // salary stats
  const withSalary = applications.filter(a => a.salaryMin || a.salaryMax);
  const median = arr => { if (!arr.length) return null; const s = [...arr].sort((x, y) => x - y); const mid = s.length >> 1; return s.length % 2 ? s[mid] : Math.round((s[mid - 1] + s[mid]) / 2); };
  const idrMin = median(applications.filter(a => a.currency === 'IDR' && a.salaryMin).map(a => a.salaryMin));
  const idrMax = median(applications.filter(a => a.currency === 'IDR' && a.salaryMax).map(a => a.salaryMax));
  const offerSalaries = applications.filter(a => a.status === 'offer' && (a.salaryMin || a.salaryMax));
  const responseRate = submitted ? pct(interview + offer + rejected, submitted) : 0;
  const interviewRate = submitted ? pct(reachedInterview, submitted) : 0;
  const avgFollowup = followupApps().length;

  c.innerHTML = `
    <div class="panel">
      <h3>🪜 Funnel Lamaran</h3>
      <div class="funnel">${funnelHTML}</div>
      <p class="panel-note">Semakin bawah semakin sedikit — normal. Perhatikan konversi antar tahap.</p>
    </div>
    <div class="panel">
      <h3>📌 Ringkasan</h3>
      <div class="kv-list">
        <div class="kv"><span>Total dicatat</span><b>${n}</b></div>
        <div class="kv"><span>Benar-benar dikirim</span><b>${submitted}</b></div>
        <div class="kv"><span>Wishlist (belum dikirim)</span><b>${wishlist}</b></div>
        <div class="kv"><span>Dapat respons (interview/offer/rejected)</span><b>${responseRate}%</b></div>
        <div class="kv"><span>Tembus interview</span><b>${interviewRate}%</b></div>
        <div class="kv"><span>Perlu follow-up</span><b>${avgFollowup}</b></div>
        <div class="kv"><span>Median gaji min (IDR)</span><b>${idrMin ? 'Rp ' + fmtNumber(idrMin) : '—'}</b></div>
        <div class="kv"><span>Median gaji max (IDR)</span><b>${idrMax ? 'Rp ' + fmtNumber(idrMax) : '—'}</b></div>
        <div class="kv"><span>Offer dengan angka gaji</span><b>${offerSalaries.length}</b></div>
        <div class="kv"><span>Lamaran dengan gaji tercatat</span><b>${withSalary.length}</b></div>
      </div>
    </div>
    <div class="panel">
      <h3>📆 Tren 6 Bulan Terakhir</h3>
      <div class="trend">${trendHTML}</div>
      <p class="panel-note">Konsistensi > ledakan sesaat. Targetkan ritme mingguan yang stabil.</p>
    </div>
    <div class="panel">
      <h3>🌐 Distribusi Platform</h3>
      ${platformHTML}
      <p class="panel-note">Platform mana yang paling produktif? Perbanyak di sana.</p>
    </div>
    <div class="panel full">
      <h3>📊 Distribusi Status</h3>
      ${statusHTML}
    </div>`;
}

/* ---------- tips ---------- */
const TIPS_DATA = [
  { title: '📝 Tips Membuat CV/Resume', tips: [
    { t: 'Format yang Rapi dan Profesional', p: ['Gunakan format yang bersih, mudah dibaca, dan maksimal 2 halaman. Pilih jenis huruf profesional seperti Arial, Calibri, atau Times New Roman dengan ukuran 10-12pt.'] },
    { t: 'Sesuaikan dengan Posisi yang Dilamar', p: ['Jangan pakai CV yang sama untuk semua lamaran. Tonjolkan pengalaman dan keahlian yang relevan dengan deskripsi pekerjaan. Gunakan kata kunci dari lowongan.'] },
    { t: 'Tunjukkan Achievement, Bukan Hanya Job Desc', p: ['Jangan cuma list tugas kamu. Tunjukkan hasil kerja dengan angka konkret. Contoh: "Meningkatkan penjualan 30% dalam 6 bulan" lebih powerful daripada "Bertanggung jawab atas penjualan".', '<strong>Kalau belum bisa kasih angka?</strong> Fokus ke dampak dan cakupan kerja:'], ul: ['"Memimpin tim 5 orang untuk mendesain ulang website perusahaan"', '"Mengelola proyek dari perencanaan hingga peluncuran dalam 3 bulan"', '"Menerapkan sistem baru yang mempercepat proses kerja tim"', '"Berhasil menyelesaikan proyek tepat waktu meskipun dengan sumber daya terbatas"', '"Menciptakan SOP baru yang diadopsi oleh seluruh departemen"'], p2: ['Intinya: tunjukkan <strong>dampak</strong> yang kamu buat, bukan cuma <strong>aktivitas</strong> yang kamu lakukan!'] },
    { t: 'Kata Kerja yang Kuat', p: ['Mulai kalimat dengan kata kerja yang kuat seperti: Memimpin, Mengembangkan, Meningkatkan, Menganalisis, Merancang, Mengelola, Menciptakan, Mengimplementasikan.'] },
    { t: 'Cek Kesalahan Ketik dan Tata Bahasa', p: ['Kesalahan ketik di CV bisa memberi kesan kurang teliti, padahal isinya mungkin bagus. Minta teman atau keluarga ikut mengecek sebelum dikirim, lalu gunakan alat bantu seperti Grammarly untuk memastikan tidak ada yang terlewat.'] }
  ]},
  { title: '✉️ Tips Surat Lamaran', tips: [
    { t: 'Personalisasi untuk Setiap Perusahaan', p: ['Riset tentang perusahaan dan posisi yang kamu lamar. Sebutkan kenapa kamu tertarik dengan perusahaan tersebut secara spesifik.'] },
    { t: 'Struktur yang Jelas', ul: ['<strong>Pembukaan:</strong> Posisi yang dilamar dan dari mana kamu tahu lowongan ini', '<strong>Isi:</strong> Pengalaman dan keahlian yang relevan, pencapaian konkret', '<strong>Penutup:</strong> Antusiasme untuk wawancara dan terima kasih'] },
    { t: 'Tunjukkan Nilai yang Bisa Kamu Berikan', p: ['Fokus ke "apa yang bisa kamu lakukan untuk perusahaan" bukan cuma "apa yang kamu inginkan".'] },
    { t: 'Maksimal 1 Halaman', p: ['Perekrut menangani banyak lamaran sekaligus, jadi waktu mereka terbatas. 3-4 paragraf umumnya sudah cukup untuk menyampaikan poin utama tanpa bertele-tele.'] }
  ]},
  { title: '🎯 Tips Melamar Kerja', tips: [
    { t: 'Lamar Sedini Mungkin', p: ['Jangan tunggu batas waktu! Banyak perusahaan mereview aplikasi berdasarkan siapa yang melamar duluan. Lamar di hari pertama atau kedua lowongan dibuka.'] },
    { t: 'Ikuti Instruksi dengan Teliti', p: ['Baca posting lowongan dengan detail. Kalau diminta kirim dengan subjek tertentu atau format file khusus, IKUTI! Ini tes pertama apakah kamu teliti.'] },
    { t: 'Manfaatkan Jaringan Pertemanan', p: ['Banyak posisi terisi lewat jalur referensi. Bangun koneksi dengan orang-orang di perusahaan yang kamu incar melalui LinkedIn — dari sana kamu bisa mencari referensi atau informasi dari orang dalam.'] },
    { t: 'Tindak Lanjut (Tapi Jangan Spam)', p: ['Tunggu 1-2 minggu setelah melamar, baru tindak lanjut dengan email yang sopan. Tunjukkan antusiasme tapi tetap profesional.'] },
    { t: 'Catat Semua Lamaran Kamu', p: ['Gunakan aplikasi ini! Catat tanggal melamar, status, dan contact person. Ini bantu kamu tetap terorganisir dan tahu kapan harus menindaklanjuti.'] }
  ]},
  { title: '🌍 Bahasa Inggris untuk Mencari Kerja', tips: [
    { t: 'Kenapa Bahasa Inggris Penting?', p: ['Bahasa Inggris dasar akan sangat membantu proses mencari kerja kamu, bahkan untuk posisi yang tidak membutuhkan Bahasa Inggris:'], ul: ['Banyak lowongan kerja (terutama di perusahaan multinasional) ditulis dalam Bahasa Inggris', 'Format CV internasional lebih umum digunakan', 'Wawancara kadang menyertakan pertanyaan dalam Bahasa Inggris', 'Akses ke sumber belajar dan panduan mencari kerja yang lebih banyak', 'Membuka peluang kerja jarak jauh untuk perusahaan luar negeri'] },
    { t: 'Yang Perlu Dikuasai (Level Dasar)', p: ['Kamu tidak perlu lancar! Yang penting bisa:'], ul: ['<strong>Membaca:</strong> Pahami deskripsi pekerjaan, persyaratan, dan profil perusahaan', '<strong>Menulis:</strong> Bikin CV dan surat lamaran dalam Bahasa Inggris (walau sederhana)', '<strong>Berbicara:</strong> Perkenalan diri, jelaskan pengalaman kerja, dan jawab pertanyaan dasar', '<strong>Kosakata:</strong> Istilah-istilah umum di bidang kamu dan dunia kerja'] },
    { t: 'Tips Belajar Bahasa Inggris untuk Mencari Kerja', ul: ['<strong>Baca posting lowongan dalam Bahasa Inggris:</strong> cara paling praktis belajar kosakata yang relevan', '<strong>Bikin CV versi Bahasa Inggris:</strong> terjemahkan CV kamu (bisa pakai bantuan AI, tapi tinjau lagi)', '<strong>Latihan perkenalan diri:</strong> "Ceritakan tentang diri kamu" dalam 2-3 menit', '<strong>Nonton video tips wawancara di YouTube:</strong> dapat kosakata dan cara menjawab sekaligus', '<strong>Ikut komunitas online:</strong> grup LinkedIn, Discord, atau forum di bidang kamu', '<strong>Latihan dengan AI:</strong> ngobrol dengan chatbot untuk latihan wawancara'] },
    { t: 'Jangan Takut Tata Bahasanya Kurang Sempurna!', p: ['Yang terpenting: <strong>komunikatif dan jelas</strong>. Penutur asli pun sering tata bahasanya tidak sempurna dalam percakapan. Fokus ke:'], ul: ['Sampaikan pesan dengan jelas', 'Percaya diri waktu berbicara (walaupun ada kesalahan)', 'Terus belajar dari masukan'], p2: ['Ingat: "Selesai lebih baik daripada sempurna". Mulai dari sekarang dengan Bahasa Inggris seadanya, nanti akan meningkat seiring waktu!'] }
  ]},
  { title: '🎤 Tips Wawancara Kerja', tips: [
    { t: 'Persiapan adalah Kunci', ul: ['Riset perusahaan: produk, budaya, berita terbaru', 'Pahami deskripsi pekerjaan dengan detail', 'Siapkan jawaban untuk pertanyaan umum (kelebihan/kekurangan, kenapa tertarik, dll)', 'Siapkan pertanyaan untuk pewawancara (minimal 3-5 pertanyaan)'] },
    { t: 'Metode STAR untuk Pertanyaan Behavioral', p: ['Jawab dengan struktur STAR:'], ul: ['<strong>S</strong>ituasi: Jelaskan konteks/situasi', '<strong>T</strong>ugas: Apa tanggung jawab kamu', '<strong>A</strong>ksi: Apa yang kamu lakukan', '<strong>R</strong>esult/Hasil: Hasilnya apa, kalau bisa dengan angka'] },
    { t: 'Kode Berpakaian dan Penampilan', p: ['Lebih baik berpakaian terlalu formal daripada terlalu kasual. Kalau tidak yakin, tanya HRD. Kesan pertama sangat penting!'] },
    { t: 'Bahasa Tubuh yang Positif', ul: ['Kontak mata: tunjukkan kepercayaan diri', 'Senyum: ramah dan mudah didekati', 'Postur tegak: jangan bungkuk', 'Jabat tangan yang tegas (untuk wawancara tatap muka)'] },
    { t: 'Untuk Wawancara Virtual', ul: ['Tes koneksi internet dan perangkat sehari sebelumnya', 'Pilih latar belakang yang rapi dan pencahayaan yang baik', 'Tatap kamera, bukan layar (meniru kontak mata)', 'Kurangi gangguan dan notifikasi', 'Berpakaian profesional dari atas sampai bawah'] },
    { t: 'Pertanyaan yang Bisa Kamu Tanyakan', ul: ['"Seperti apa hari-hari biasa di posisi ini?"', '"Apa tantangan terbesar yang akan dihadapi di peran ini?"', '"Bagaimana budaya tim dan cara kerja sehari-hari?"', '"Apa langkah selanjutnya dalam proses rekrutmen ini?"', '"Apa yang membuat Anda senang bekerja di sini?"'] },
    { t: 'Setelah Wawancara: Email Terima Kasih', p: ['Kirim email terima kasih dalam 24 jam. Sampaikan rasa terima kasih, tegaskan kembali minat kamu, dan sebutkan 1-2 hal spesifik dari wawancara yang berkesan.'] }
  ]},
  { title: '💼 Optimasi LinkedIn agar Dilirik Perekrut', tips: [
    { t: 'Kenapa LinkedIn Penting?', p: ['LinkedIn adalah tempat pertama perekrut mencari kandidat. Profil LinkedIn yang optimal bisa membuat kamu dihubungi untuk peluang kerja tanpa perlu melamar!'] },
    { t: 'Foto Profil yang Profesional', ul: ['Pakai foto dekat, fokus ke wajah (bukan foto seluruh tubuh)', 'Latar belakang sederhana dan terang', 'Senyum dan tatap mata ke kamera', 'Pakaian profesional (sesuai industri kamu)', 'Hindari: foto selfie, foto dengan orang lain, foto liburan'] },
    { t: 'Judul yang Menarik Perhatian', p: ['Jangan cuma tulis "Mencari peluang kerja". Buat judul yang menunjukkan nilai:'], ul: ['<strong>Buruk:</strong> "Lulusan Baru | Mencari Pekerjaan"', '<strong>Bagus:</strong> "Lulusan Marketing | Pembuat Konten | Passionate tentang Strategi Digital"', '<strong>Lebih Baik:</strong> "Spesialis Marketing Digital | Membantu 10+ Brand Berkembang di Media Sosial 50% | Terbuka untuk Peluang"'], p2: ['Gunakan kata kunci yang sering dicari perekrut di bidang kamu!'] },
    { t: 'Bagian Ringkasan/Tentang yang Menarik', p: ['Ini kesempatan kamu untuk "bercerita". Sertakan:'], ul: ['Siapa kamu dan apa yang kamu lakukan', 'Passion dan motivasi kamu', 'Pencapaian utama (dengan angka kalau bisa)', 'Keahlian dan expertise utama', 'Apa yang kamu cari / tujuan karir', 'Ajakan bertindak (misal: "Jangan ragu menghubungi saya untuk kolaborasi")'], p2: ['Tulis dalam sudut pandang orang pertama ("Saya" bukan "Dia") supaya lebih personal!'] },
    { t: 'Bagian Pengalaman: Detail itu Penting', ul: ['Jangan cuma list judul pekerjaan dan perusahaan', 'Tulis 3-5 poin per peran tentang pencapaian dan tanggung jawab', 'Gunakan kata kerja aktif (Memimpin, Mengembangkan, Meningkatkan, Mengelola)', 'Sertakan hasil/dampak dengan angka konkret', 'Tambah media: foto, video, dokumen, atau link ke proyek kamu'] },
    { t: 'Bagian Keahlian dengan Endorsement', ul: ['Tambahkan minimal 10-15 keahlian yang relevan dengan tujuan karirmu', 'Prioritaskan 3 keahlian utama (yang paling penting di atas)', 'Sertakan campuran keahlian teknis dan soft skill', 'Minta endorsement dari rekan kerja, atasan, atau teman', 'Ikuti Skill Assessment LinkedIn untuk memvalidasi keahlian kamu'] },
    { t: 'Rekomendasi itu Penting!', p: ['Rekomendasi dari atasan atau rekan kerja adalah bukti sosial yang kuat.'], ul: ['Minta rekomendasi dari 2-3 orang (mantan atasan, rekan kerja, atau klien)', 'Spesifik lebih baik: minta mereka ceritakan proyek/pencapaian konkret', 'Beri rekomendasi untuk menerima: bantu orang lain dulu!'] },
    { t: 'Set Profil ke "Terbuka untuk Pekerjaan"', ul: ['Aktifkan fitur "Open to Work" (bisa privat atau publik)', 'Tentukan judul pekerjaan, lokasi, dan jenis pekerjaan yang kamu cari', 'Ini sinyal ke perekrut bahwa kamu tersedia dan tertarik'] },
    { t: 'Aktif: Posting & Berinteraksi!', p: ['Algoritma LinkedIn menyukai pengguna yang aktif. Cara mudah:'], ul: ['Bagikan artikel atau wawasan tentang industri kamu (1-2x seminggu)', 'Komentar pada postingan dari orang di jaringan kamu', 'Beri reaksi pada pencapaian orang lain', 'Bagikan kemenangan dan pembelajaran kamu sendiri', 'Ikut grup LinkedIn di bidang kamu dan berpartisipasi'], p2: ['Konsistensi lebih penting dari frekuensi. Lebih baik posting 1x per minggu konsisten daripada 10 postingan sekaligus terus hilang!'] },
    { t: 'Membangun Jaringan Secara Strategis', ul: ['Terhubung dengan koneksi tingkat kedua (teman dari teman)', 'Tambahkan perekrut di perusahaan target kamu', 'Terhubung dengan alumni dari sekolah/universitas kamu', 'Personalisasi permintaan koneksi (jangan generik)', 'Ikuti perusahaan yang kamu minati'] },
    { t: 'Kata Kunci untuk Pencarian Perekrut', p: ['Taburkan kata kunci di seluruh profil kamu:'], ul: ['Judul pekerjaan yang kamu targetkan (misal: "Manajer Produk", "Analis Data")', 'Keahlian teknis (misal: "Python", "Google Analytics", "Figma")', 'Istilah industri (misal: "SaaS", "E-commerce", "Fintech")', 'Sertifikasi (misal: "Bersertifikat PMP", "Bersertifikat Google Ads")'], p2: ['Tips: cek posting lowongan yang kamu minati, lihat kata kunci apa yang sering muncul!'] },
    { t: 'Update Secara Teratur', p: ['Profil yang tidak pernah diupdate kurang menarik. Update minimal:'], ul: ['Setiap dapat pencapaian baru', 'Setiap menyelesaikan proyek penting', 'Setiap dapat keahlian atau sertifikasi baru', 'Minimal 1x per bulan (walau cuma update kecil)'], p2: ['Setiap kali kamu update, profil kamu muncul di feed jaringanmu = visibilitas gratis!'] }
  ]},
  { title: '⚠️ Hal yang Harus Dihindari', tips: [
    { t: 'Jangan Bicara Buruk tentang Perusahaan Sebelumnya', p: ['Meskipun pengalamanmu buruk, tetap profesional. Fokus ke "kesempatan belajar" atau "mencari tantangan baru" bukan menjelek-jelekkan.'] },
    { t: 'Jangan Fokus Cuma ke Gaji di Awal', p: ['Pertanyaan pertama jangan soal gaji atau tunjangan. Tunjukkan dulu minat ke peran dan perusahaan. Tunggu mereka yang buka topik kompensasi.'] },
    { t: 'Jangan Datang Tanpa Persiapan', p: ['"Saya tidak tahu tentang perusahaan ini" = penolakan langsung. Lakukan riset!'] },
    { t: 'Jangan Berbohong atau Melebih-lebihkan', p: ['Keahlian yang kamu klaim harus bisa kamu buktikan. Background check itu nyata. Kejujuran adalah kebijakan terbaik.'] },
    { t: 'Jangan Terlambat', p: ['Untuk wawancara tatap muka, datang 10-15 menit lebih awal. Untuk online, bergabung 5 menit sebelum jadwal. Terlambat = tidak menghargai waktu orang lain.'] }
  ]},
  { title: '💪 Mindset untuk Mencari Kerja', tips: [
    { t: 'Penolakan itu Normal', p: ['Rata-rata orang butuh puluhan hingga ratusan lamaran untuk dapat 1 tawaran. Setiap "tidak" membawa kamu lebih dekat ke "ya". Jangan ambil hati!'] },
    { t: 'Konsisten dan Disiplin', p: ['Tetapkan target harian: misalnya 3-5 lamaran per hari. Perlakukan mencari kerja seperti pekerjaan penuh waktu. Konsistensi adalah kunci!'] },
    { t: 'Merawat Diri Tetap Penting', p: ['Mencari kerja itu melelahkan secara mental. Jangan lupa istirahat, olahraga, dan waktu untuk diri sendiri. Kelelahan tidak akan membantu prosesmu.'] },
    { t: 'Belajar dari Setiap Wawancara', p: ['Setelah wawancara, tulis catatan tentang pertanyaan yang ditanya dan bagaimana kamu menjawab. Identifikasi area perbaikan untuk wawancara berikutnya.'] },
    { t: 'Waktu yang Tepat akan Datang', p: ['Kadang bukan tentang kamu, tapi tentang waktu. Perusahaan bisa membekukan perekrutan, atau ada kandidat internal. Terus lanjutkan, peluangmu akan datang!'] }
  ]}
];

function renderTips() {
  const c = $('#tips-container');
  c.innerHTML = TIPS_DATA.map((cat, ci) => `
    <details class="tips-cat" data-cat-idx="${ci}" ${ci === 0 ? 'open' : ''}>
      <summary>${esc(cat.title)} <span style="font-size:.7em;color:var(--ink-faint)">(${cat.tips.length})</span></summary>
      <div class="tips-body">
        ${cat.tips.map(tip => `
          <div class="tip-item">
            <h4>${esc(tip.t)}</h4>
            ${(tip.p || []).map(x => `<p>${x}</p>`).join('')}
            ${tip.ul ? `<ul>${tip.ul.map(x => `<li>${x}</li>`).join('')}</ul>` : ''}
            ${(tip.p2 || []).map(x => `<p>${x}</p>`).join('')}
          </div>`).join('')}
      </div>
    </details>`).join('');
}

$('#btn-tips-expand').addEventListener('click', () => $$('#tips-container details').forEach(d => d.open = true));
$('#btn-tips-collapse').addEventListener('click', () => $$('#tips-container details').forEach(d => d.open = false));
$('#tips-search').addEventListener('input', e => {
  const kw = e.target.value.trim().toLowerCase();
  for (const det of $$('#tips-container details')) {
    const items = $$('.tip-item', det);
    let catVisible = 0;
    for (const item of items) {
      const match = !kw || item.textContent.toLowerCase().includes(kw);
      item.style.display = match ? '' : 'none';
      if (match) catVisible++;
    }
    det.style.display = catVisible ? '' : 'none';
    if (kw && catVisible) det.open = true;
    if (!kw) det.open = det.dataset.catIdx === '0';
  }
});

/* ---------- tabs ---------- */
function switchTab(name) {
  $$('.page-tab').forEach(t => {
    const active = t.dataset.page === name;
    t.classList.toggle('active', active);
    t.setAttribute('aria-selected', String(active));
  });
  $$('.page').forEach(p => p.classList.remove('active', 'page-flip-enter'));
  const page = $(`#page-${name}`);
  if (page) {
    page.classList.add('active', 'page-flip-enter');
    setTimeout(() => page.classList.remove('page-flip-enter'), 400);
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (name === 'analytics') renderAnalytics();
  if (name === 'checklist') renderChecklist();
  try { history.replaceState(null, '', `#${name}`); } catch {}
}
$$('.page-tab').forEach(tab => {
  tab.addEventListener('click', () => switchTab(tab.dataset.page));
  tab.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); switchTab(tab.dataset.page); } });
});

/* ---------- theme ---------- */
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  $('#theme-toggle').textContent = theme === 'night' ? '☀️' : '🌙';
}
$('#theme-toggle').addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'night' ? 'day' : 'night';
  applyTheme(next);
  localStorage.setItem(STORE_KEYS.theme, next);
});

/* ---------- pencil cursor ---------- */
function initPencilCursor() {
  const pencil = $('#pencil-cursor');
  if (!window.matchMedia('(pointer: fine)').matches || window.innerWidth <= 900) return;
  let raf = null;
  document.addEventListener('mousemove', e => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      pencil.style.transform = `translate(${e.clientX + 6}px, ${e.clientY + 4}px) rotate(-8deg)`;
      pencil.classList.add('visible');
      raf = null;
    });
  });
  document.addEventListener('mouseleave', () => pencil.classList.remove('visible'));
}

/* ---------- desk decorations ---------- */
function initDeskDecor() {
  if (window.innerWidth <= 900) return;
  const desk = $('#desk');
  const decos = [
    { cls: 'pin pin-red', style: 'top:28px;left:calc(50% - 400px)' },
    { cls: 'pin pin-blue', style: 'top:28px;left:calc(50% + 385px)' },
    { cls: 'pin pin-green', style: 'bottom:120px;left:calc(50% - 420px)' },
    { cls: 'coffee-ring', style: 'bottom:80px;left:25px' },
    { cls: 'coffee-ring', style: 'top:150px;right:15px;width:60px;height:60px' },
    { cls: 'tape', style: 'top:45px;right:35px;--tape-rot:-6deg' },
    { cls: 'tape', style: 'bottom:250px;left:10px;--tape-rot:10deg;width:55px' },
    { cls: 'paper-clip', style: 'top:200px;right:20px', html: '<svg width="18" height="45" viewBox="0 0 20 50"><path d="M5 0v35a7 7 0 0014 0V10a5 5 0 00-10 0v25" fill="none" stroke="#aaa" stroke-width="1.5"/></svg>' },
    { cls: 'paper-clip', style: 'top:420px;left:5px;transform:rotate(15deg)', html: '<svg width="18" height="45" viewBox="0 0 20 50"><path d="M5 0v35a7 7 0 0014 0V10a5 5 0 00-10 0v25" fill="none" stroke="#c0a060" stroke-width="1.5"/></svg>' },
    { cls: 'doodle', style: 'top:100px;right:55px;transform:rotate(12deg)', html: '&#9733;' },
    { cls: 'doodle', style: 'bottom:350px;left:55px;transform:rotate(-8deg)', html: '&#9786;' },
    { cls: 'doodle', style: 'top:550px;right:25px;font-size:1.5em', html: '&#10084;' }
  ];
  for (const d of decos) {
    const el = document.createElement('div');
    el.className = d.cls;
    el.setAttribute('style', d.style);
    if (d.html) el.innerHTML = d.html;
    desk.appendChild(el);
  }
}

/* ---------- back to top + reveals ---------- */
function initScrollUI() {
  const backTop = $('#back-top');
  const onScroll = () => backTop.classList.toggle('show', window.scrollY > 500);
  window.addEventListener('scroll', onScroll, { passive: true });
  backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  backTop.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); } });

  const io = new IntersectionObserver(entries => {
    for (const en of entries) if (en.isIntersecting) { en.target.classList.add('active'); io.unobserve(en.target); }
  }, { rootMargin: '0px 0px -40px 0px' });
  window.__revealObserver = io;
  observeReveals();
}
function observeReveals() {
  const io = window.__revealObserver;
  if (!io) return;
  for (const el of $$('.reveal:not(.active)')) io.observe(el);
}

/* ---------- platform filter options ---------- */
function initPlatformOptions() {
  const sel = $('#filter-platform');
  for (const p of PLATFORMS) {
    const opt = document.createElement('option');
    opt.value = p; opt.textContent = p;
    sel.appendChild(opt);
  }
}

/* ---------- init ---------- */
function init() {
  initPlatformOptions();
  loadAll();
  renderQuote();
  renderChecklist();
  renderTips();
  renderApplications();
  initDeskDecor();
  initPencilCursor();
  initScrollUI();
  observeReveals();

  $('#btn-add-top').addEventListener('click', openAddDialog);
  $('#postit-add').addEventListener('click', openAddDialog);
  $('#postit-streak').addEventListener('click', () => { switchTab('tracker'); });
  $('#postit-followup').addEventListener('click', () => { switchTab('tracker'); $('#btn-filter-followup').click(); });
  $('#postit-interview').addEventListener('click', () => {
    switchTab('tracker');
    filters.status = 'interview'; $('#filter-status').value = 'interview';
    currentPage = 1; renderApplications();
  });

  $('#btn-export-json').addEventListener('click', exportJSON);
  $('#btn-export-csv').addEventListener('click', exportCSV);
  $('#btn-print').addEventListener('click', () => window.print());

  autoFormatSalary($('#f-salary-min'));
  autoFormatSalary($('#f-salary-max'));

  // restore tab from hash
  const hash = location.hash.slice(1);
  if (['tracker', 'checklist', 'analytics', 'tips'].includes(hash)) switchTab(hash);

  // re-observe reveals after list renders
  const mo = new MutationObserver(() => observeReveals());
  mo.observe($('#apps-list'), { childList: true });

  setTimeout(() => $('#loading').classList.add('done'), 250);
}

document.addEventListener('DOMContentLoaded', init);
