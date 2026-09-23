/* ============================================================
   Catatan Lamaran Kerja — app.js
   Local-first job application tracker. No dependencies.
   All user-supplied strings are escaped before rendering.
   ============================================================ */
'use strict';

/* ---------- constants ---------- */
const STORE_KEYS = { apps: 'jat.apps.v2', checklist: 'jat.checklist.v2', theme: 'jat.theme', perPage: 'jat.perPage', lang: 'jat.lang' };
const LEGACY_KEY = 'jobApplications';
const FOLLOWUP_DAYS = 14;

const STATUS_LABELS = { wishlist: 'Wishlist', applied: 'Applied', interview: 'Interview', offer: 'Offer', rejected: 'Rejected' };
const STATUS_ORDER = ['wishlist', 'applied', 'interview', 'offer', 'rejected'];
const STATUS_COLORS = { wishlist: '#e8c84a', applied: '#5b8db8', interview: '#8a63c9', offer: '#4caf50', rejected: '#c96a6a' };
const CURRENCY_SYMBOLS = { IDR: 'Rp', USD: '$', SGD: 'S$', MYR: 'RM', EUR: '€', GBP: '£' };
const PLATFORMS = ['LinkedIn', 'JobStreet', 'Glints', 'Kalibrr', 'Indeed', 'Website Perusahaan', 'Email Langsung', 'Referral', 'Walk-in', 'Lainnya'];

/* ---------- i18n state ----------
   UI_STRINGS / CHECKLIST_I18N / TIPS_I18N / QUOTES_I18N / platformLabel() / t()
   are provided by i18n.js, loaded before this file. */
let lang = I18N_DEFAULT_LANG;
function T(key, vars) { return t(lang, key, vars); }
function localeTag() { return lang === 'id' ? 'id-ID' : 'en-US'; }

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
  if (n === 0) return T('day_today');
  if (n === 1) return T('day_yesterday');
  if (n < 0) return T('day_future_tpl', { n: Math.abs(n) });
  return T('day_past_tpl', { n });
}
function daysBetween(iso, now = new Date()) {
  const d = new Date(iso + 'T00:00:00');
  if (isNaN(d)) return Infinity;
  const mid = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((mid - d) / 86400000);
}
function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso + 'T00:00:00');
  if (isNaN(d)) return iso;
  return d.toLocaleDateString(localeTag(), { day: 'numeric', month: 'long', year: 'numeric' });
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
  if (max) return lang === 'id' ? `s/d ${sym} ${fmtNumber(max)}` : `up to ${sym} ${fmtNumber(max)}`;
  return '';
}
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
function dailySeed() { return new Date().toISOString().slice(0, 10); }
function seededQuote() {
  let h = 0;
  for (const ch of dailySeed()) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const quotes = QUOTES_I18N[lang];
  return quotes[h % quotes.length];
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
    showToast(T('toast_storage_full_msg'), 'error', T('toast_storage_full_title'));
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

  const storedLang = localStorage.getItem(STORE_KEYS.lang);
  lang = (storedLang === 'en' || storedLang === 'id') ? storedLang : I18N_DEFAULT_LANG;
  document.documentElement.lang = lang;
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
    { key: 'total', label: T('stat_total'), value: counts.total, cls: '', filter: null },
    { key: 'applied', label: T('stat_applied'), value: counts.applied, cls: '', filter: { status: 'applied' } },
    { key: 'interview', label: T('stat_interview'), value: counts.interview, cls: '', filter: { status: 'interview' } },
    { key: 'offer', label: T('stat_offer'), value: counts.offer, cls: 'stat-offer', filter: { status: 'offer' } },
    { key: 'rejected', label: T('stat_rejected'), value: counts.rejected, cls: 'stat-rejected', filter: { status: 'rejected' } },
    { key: 'followup', label: T('stat_followup_tpl', { days: FOLLOWUP_DAYS }), value: counts.followup, cls: 'stat-followup', filter: { followupOnly: true } }
  ];
  strip.innerHTML = cards.map(c => `
    <div class="stat ${c.cls} ${c.filter ? 'clickable' : ''}" ${c.filter ? `data-stat-filter='${JSON.stringify(c.filter)}' role="button" tabindex="0" title="${esc(T('stat_filter_title'))}"` : ''}>
      <div class="stat-value">${c.value}</div>
      <div class="stat-label">${esc(c.label)}</div>
    </div>`).join('');

  // follow-up banner
  const fu = followupApps();
  const banner = $('#followup-banner');
  banner.hidden = fu.length === 0;
  if (fu.length) {
    const names = fu.slice(0, 3).map(a => esc(a.company)).join(', ');
    const more = fu.length > 3 ? T('followup_banner_more_tpl', { n: fu.length - 3 }) : '';
    $('#followup-banner-text').textContent = T('followup_banner_tpl', { count: fu.length, days: FOLLOWUP_DAYS, names, more });
  }

  // post-its
  const streak = applications.filter(a => daysBetween(a.date) <= 7 && daysBetween(a.date) >= 0).length;
  $('#postit-streak-body').textContent = streak > 0
    ? T('streak_active_tpl', { n: streak })
    : (applications.length ? T('streak_idle_has_data') : T('streak_idle_empty'));

  const fuPostit = $('#postit-followup');
  fuPostit.hidden = fu.length === 0;
  $('#postit-followup-body').textContent = fu.length ? T('followup_postit_tpl', { n: fu.length }) : '';

  const iv = applications.filter(a => a.status === 'interview');
  const ivPostit = $('#postit-interview');
  ivPostit.hidden = iv.length === 0;
  $('#postit-interview-body').textContent = iv.length ? iv.slice(0, 2).map(a => `${a.company} — ${a.position}`).join(' • ') + (iv.length > 2 ? ` +${iv.length - 1}` : '') : '';

  const cl = checklistProgress();
  $('#postit-checklist-body').textContent = cl.total ? T('checklist_postit_tpl', { done: cl.done, total: cl.total, pct: cl.pct }) : T('postit_checklist_default');

  renderAnalytics();
}

/* ---------- rendering: applications ---------- */
function renderApplications() {
  const filtered = currentFiltered();
  const totalPages = itemsPerPage === Infinity ? 1 : Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  if (currentPage > totalPages) currentPage = totalPages;

  const start = itemsPerPage === Infinity ? 0 : (currentPage - 1) * itemsPerPage;
  const pageApps = filtered.slice(start, itemsPerPage === Infinity ? undefined : start + itemsPerPage);

  $('#results-summary').innerHTML = T('results_showing_tpl', { showing: pageApps.length, total: applications.length });

  const list = $('#apps-list');
  if (applications.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🎯</div>
        <div class="empty-title">${esc(T('empty_title_no_apps'))}</div>
        <div class="empty-quote">${esc(seededQuote())}</div>
        <p>${esc(T('empty_no_apps_desc'))}</p>
        <div style="margin-top:14px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
          <button class="btn btn-primary" data-action="add">${esc(T('btn_add_first'))}</button>
          <button class="btn" data-action="seed">${esc(T('btn_load_sample'))}</button>
        </div>
      </div>`;
  } else if (filtered.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🔍</div>
        <div class="empty-title">${esc(T('empty_title_no_match'))}</div>
        <p>${esc(T('empty_no_match_desc'))}</p>
        <div style="margin-top:14px"><button class="btn" data-action="reset-filters">${esc(T('btn_reset_filter_short'))}</button></div>
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
  const pinColors = ['pin-red', 'pin-blue', 'pin-green', 'pin-yellow'];
  const quickStatuses = STATUS_ORDER.filter(s => s !== app.status);
  const platformDisplay = platformLabel(app.platform, lang);

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
          ${fu ? `<span class="followup-stamp" title="${esc(T('followup_stamp_title'))}">${esc(T('followup_stamp'))}</span>` : ''}
        </div>
        <div class="badge-row">
          ${app.platform ? `<span class="meta-badge">🌐 ${esc(platformDisplay)}</span>` : ''}
          ${app.location ? `<span class="meta-badge">📍 ${esc(app.location)}</span>` : ''}
        </div>
      </div>
    </div>
    <div class="app-details">
      <div class="detail-item"><span class="detail-label">${esc(T('detail_applied_label'))}</span>${fmtDate(app.date)} <span class="app-updated">${relDateText(app.date)}</span></div>
      ${moneyText(app) ? `<div class="detail-item"><span class="detail-label">${esc(T('detail_salary_label'))}</span>${esc(moneyText(app))}</div>` : ''}
      ${app.contact ? `<div class="detail-item"><span class="detail-label">${esc(T('detail_contact_label'))}</span>${esc(app.contact)}</div>` : ''}
      ${safeUrl(app.sourceUrl) ? `<div class="detail-item"><span class="detail-label">${esc(T('detail_link_label'))}</span><a href="${esc(safeUrl(app.sourceUrl))}" target="_blank" rel="noopener noreferrer">${esc(T('link_open'))}</a></div>` : ''}
    </div>
    ${app.notes ? `<div class="app-notes">📝 ${esc(app.notes)}</div>` : ''}
    <div class="app-actions">
      <label style="display:flex;align-items:center;gap:6px;margin:0;font-size:.85em">
        <span style="color:var(--ink-faint)">${esc(T('change_status_label'))}</span>
        <select class="status-quick" data-action="quick-status" aria-label="${esc(T('change_status_aria_tpl', { company: app.company }))}">
          <option value="">${esc(T('change_status_placeholder'))}</option>
          ${quickStatuses.map(s => `<option value="${s}">${STATUS_LABELS[s]}</option>`).join('')}
        </select>
      </label>
      <span class="spacer"></span>
      <button class="btn btn-small" data-action="edit" type="button">${esc(T('btn_edit'))}</button>
      <button class="btn btn-small btn-danger" data-action="delete" type="button">${esc(T('btn_delete'))}</button>
    </div>
  </div>`;
}

function renderPagination(total, totalPages) {
  const c = $('#pagination-container');
  if (totalPages <= 1) { c.innerHTML = ''; return; }
  let html = `<div class="pagination"><button data-page="${currentPage - 1}" ${currentPage === 1 ? 'disabled' : ''}>${esc(T('pagination_prev'))}</button>`;
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
      html += `<button data-page="${i}" class="${i === currentPage ? 'active' : ''}">${i}</button>`;
    } else if (i === currentPage - 3 || i === currentPage + 3) {
      html += '<span class="dots">…</span>';
    }
  }
  html += `<button data-page="${currentPage + 1}" ${currentPage === totalPages ? 'disabled' : ''}>${esc(T('pagination_next'))}</button></div>`;
  c.innerHTML = html;
}

function renderActiveFilters() {
  const chips = [];
  if (filters.keyword) chips.push(['keyword', `🔍 "${filters.keyword}"`]);
  if (filters.status) chips.push(['status', `📊 ${STATUS_LABELS[filters.status]}`]);
  if (filters.platform) chips.push(['platform', `🌐 ${platformLabel(filters.platform, lang)}`]);
  if (filters.dateFrom) chips.push(['dateFrom', T('chip_date_from_tpl', { date: fmtDate(filters.dateFrom) })]);
  if (filters.dateTo) chips.push(['dateTo', T('chip_date_to_tpl', { date: fmtDate(filters.dateTo) })]);
  if (filters.followupOnly) chips.push(['followupOnly', T('chip_followup_only')]);
  const box = $('#active-filters');
  box.innerHTML = chips.map(([key, label]) =>
    `<span class="filter-chip">${esc(label)}<button type="button" data-clear-filter="${key}" aria-label="${esc(T('chip_clear_aria_tpl', { label }))}">×</button></span>`
  ).join('');
}

/* ---------- postit quote ---------- */
function renderQuote() { $('#postit-quote-body').textContent = seededQuote(); }

/* ---------- toasts ---------- */
function showToast(message, type = 'success', title = '', action = null) {
  const container = $('#toast-container');
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  const titles = { success: T('toast_title_success'), error: T('toast_title_error'), info: T('toast_title_info'), warning: T('toast_title_warning') };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <div class="toast-icon">${icons[type] || 'ℹ️'}</div>
    <div class="toast-content">
      <div class="toast-title">${esc(title || titles[type] || '')}</div>
      <div class="toast-message">${esc(message)}</div>
    </div>
    ${action ? `<button class="toast-action" type="button">${esc(action.label)}</button>` : ''}
    <button class="toast-close" type="button" aria-label="${esc(T('toast_close_aria'))}">×</button>`;
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
  $('#dialog-title').textContent = T('dialog_add_title');
  $('#btn-dialog-save').textContent = T('btn_save_new');
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
  $('#dialog-title').textContent = T('dialog_edit_title');
  $('#btn-dialog-save').textContent = T('btn_save_edit');
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
  if (min && max && min > max) { hint.textContent = T('salary_warn_min_gt_max'); hint.style.color = 'var(--rose)'; }
  else if (min || max) {
    hint.textContent = min && max ? T('salary_hint_range_tpl', { cur, min: fmtNumber(min), max: fmtNumber(max) })
      : min ? T('salary_hint_min_tpl', { cur, min: fmtNumber(min) })
      : T('salary_hint_max_tpl', { cur, max: fmtNumber(max) });
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
  if (min && max && min > max) { showToast(T('toast_salary_invalid'), 'warning'); return; }

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
  if (!data.company || !data.position) { showToast(T('toast_required_fields'), 'warning'); return; }

  if (editingId !== null) {
    const i = applications.findIndex(a => a.id === editingId);
    if (i !== -1) applications[i] = { ...applications[i], ...data };
    showToast(T('toast_app_updated_tpl', { company: data.company }), 'success');
  } else {
    applications.push({ ...data, id: uid(), createdAt: Date.now() });
    showToast(T('toast_app_added_tpl', { company: data.company }), 'success');
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
  showToast(T('toast_status_changed_tpl', { company: app.company, old: STATUS_LABELS[old], new: STATUS_LABELS[newStatus] }), 'success', T('toast_status_changed_title'), {
    label: T('undo_label'),
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
  showToast(T('toast_deleted_tpl', { company: removed.company, position: removed.position }), 'info', T('toast_deleted_title'), {
    label: T('undo_label'),
    onClick: () => { applications.splice(idx, 0, removed); saveApps(); renderApplications(); showToast(T('toast_restored'), 'success'); }
  });
});

function askDelete(id) {
  const app = applications.find(a => a.id === id);
  if (!app) return;
  deleteTargetId = id;
  $('#confirm-message').textContent = T('confirm_delete_msg_tpl', { company: app.company, position: app.position });
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
  if (!applications.length) { showToast(T('toast_no_data_export'), 'warning'); return; }
  download(`job-applications-${todayISO()}.json`, JSON.stringify(applications, null, 2), 'application/json');
  showToast(T('toast_json_exported_tpl', { n: applications.length }), 'success');
}

function exportCSV() {
  const rows = currentFiltered();
  if (!rows.length) { showToast(T('toast_no_data_export_filtered'), 'warning'); return; }
  const headers = [T('csv_header_company'), T('csv_header_position'), T('csv_header_status'), T('csv_header_date'), T('csv_header_currency'), T('csv_header_salary_min'), T('csv_header_salary_max'), T('csv_header_location'), T('csv_header_platform'), T('csv_header_contact'), T('csv_header_link'), T('csv_header_notes')];
  const cell = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const lines = [headers.map(cell).join(',')];
  for (const a of rows) {
    lines.push([a.company, a.position, STATUS_LABELS[a.status], a.date, a.currency || 'IDR',
      a.salaryMin ?? '', a.salaryMax ?? '', a.location, a.platform, a.contact, a.sourceUrl, a.notes].map(cell).join(','));
  }
  download(`job-applications-${todayISO()}.csv`, '\ufeff' + lines.join('\r\n'), 'text/csv;charset=utf-8;');
  showToast(T('toast_csv_exported_tpl', { n: rows.length }), 'success');
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
      if (!Array.isArray(data)) { showToast(T('toast_import_invalid_format'), 'error'); return; }
      const valid = data.filter(a => a && (a.company || a.perusahaan) && (a.position || a.posisi));
      if (!valid.length) { showToast(T('toast_import_no_valid'), 'error'); return; }
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
      $('#import-summary').textContent = T('import_summary_tpl', { filename: file.name, count: pendingImport.length, current: applications.length });
      importDialog.showModal();
    } catch {
      showToast(T('toast_import_read_error'), 'error');
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
    showToast(T('toast_import_replaced_tpl', { n: applications.length }), 'success', T('toast_import_complete_title'));
  } else {
    const sig = a => [a.company, a.position, a.status, a.date, a.platform].join('|').toLowerCase();
    const existing = new Set(applications.map(sig));
    let added = 0;
    for (const a of pendingImport) { if (!existing.has(sig(a))) { applications.push(a); existing.add(sig(a)); added++; } }
    showToast(T('toast_import_merged_tpl', { added, skipped: pendingImport.length - added }), 'success', T('toast_import_complete_title'));
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
    { company: 'PT Teknologi Nusantara', position: 'Frontend Developer', status: 'interview', date: iso(16), platform: 'LinkedIn', location: 'Jakarta (Hybrid)', currency: 'IDR', salaryMin: 12000000, salaryMax: 18000000, contact: 'Rina — HRD', notesId: 'Interview tahap 2 dengan user. Siapkan cerita STAR tentang proyek dashboard.', notesEn: 'Round 2 interview with the hiring manager. Prepare a STAR story about the dashboard project.', updatedAt: Date.now() - 16 * 86400000 },
    { company: 'Glints Startup ABC', position: 'Fullstack Engineer', status: 'applied', date: iso(20), platform: 'Glints', location: 'Remote', currency: 'IDR', salaryMin: 10000000, salaryMax: null, notesId: 'Sudah kirim portofolio. Belum ada kabar — perlu follow-up!', notesEn: 'Portfolio sent. No response yet — needs a follow-up!', updatedAt: Date.now() - 20 * 86400000 },
    { company: 'Bank Maju Jaya', position: 'Data Analyst', status: 'rejected', date: iso(35), platform: 'Website Perusahaan', location: 'Surabaya', currency: 'IDR', salaryMin: null, salaryMax: null, notesId: 'Gugur di tahap tes teknis SQL. Pelajari lagi window functions.', notesEn: 'Rejected at the SQL technical test stage. Review window functions again.', updatedAt: Date.now() - 30 * 86400000 },
    { company: 'Startup Edukasi XYZ', position: 'Backend Developer', status: 'offer', date: iso(10), platform: 'Referral', location: 'Remote', currency: 'IDR', salaryMin: 15000000, salaryMax: 20000000, contact: 'Pak Dimas', notesId: 'Offer via telepon! Negosiasi sebelum tanda tangan. 🎉', notesEn: 'Offer received by phone! Negotiate before signing. 🎉', updatedAt: Date.now() - 2 * 86400000 },
    { company: 'Konsultan Data Global', position: 'Junior Data Scientist', status: 'wishlist', date: iso(2), platform: 'JobStreet', location: 'Singapore', currency: 'SGD', salaryMin: 4000, salaryMax: 5500, sourceUrl: 'https://example.com/loker', notesId: 'Perbaiki CV versi bahasa Inggris dulu sebelum melamar.', notesEn: 'Polish the English CV before applying.', updatedAt: Date.now() - 2 * 86400000 },
    { company: 'PT Retail Digital', position: 'Mobile Developer', status: 'applied', date: iso(5), platform: 'Kalibrr', location: 'Bandung', currency: 'IDR', salaryMin: 9000000, salaryMax: 14000000, updatedAt: Date.now() - 5 * 86400000 },
    { company: 'Agency Kreatif Senja', position: 'UI Engineer', status: 'applied', date: iso(8), platform: 'LinkedIn', location: 'Yogyakarta', currency: 'IDR', salaryMin: null, salaryMax: null, updatedAt: Date.now() - 8 * 86400000 }
  ];
  for (const s of samples) {
    const { notesId, notesEn, ...rest } = s;
    const notes = (lang === 'en' ? notesEn : notesId) || '';
    applications.push({ id: uid(), createdAt: Date.now(), updatedAt: Date.now(), contact: '', sourceUrl: '', notes, location: '', salaryMin: null, salaryMax: null, ...rest, notes });
  }
  saveApps();
  currentPage = 1;
  renderApplications();
  showToast(T('toast_seed_loaded_tpl', { n: samples.length }), 'success', T('toast_seed_title'));
}

/* ---------- checklist ---------- */

function checklistProgress() {
  let done = 0, total = 0;
  for (const cat of CHECKLIST_I18N[lang]) for (const [id] of cat.items) { total++; if (checklistState[`${cat.id}.${id}`]) done++; }
  return { done, total, pct: total ? Math.round(done / total * 100) : 0 };
}

function renderChecklist() {
  const container = $('#checklist-container');
  container.innerHTML = CHECKLIST_I18N[lang].map(cat => {
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
  const data = CHECKLIST_I18N[lang].find(c => c.id === catId);
  const done = data.items.filter(([id]) => checklistState[`${catId}.${id}`]).length;
  const pct = Math.round(done / data.items.length * 100);
  $('.cl-cat-count', cat).textContent = `${done}/${data.items.length}`;
  $('.cl-cat-fill', cat).style.width = `${pct}%`;
  const p = checklistProgress();
  $('#cl-percent').textContent = `${p.pct}%`;
  $('#cl-progress').style.width = `${p.pct}%`;
  $('#postit-checklist-body').textContent = T('checklist_postit_tpl', { done: p.done, total: p.total, pct: p.pct });
});

$('#btn-cl-reset').addEventListener('click', () => {
  checklistState = {};
  saveChecklist();
  renderChecklist();
  showToast(T('toast_checklist_reset'), 'info');
});

/* ---------- analytics ---------- */
function renderAnalytics() {
  const c = $('#analytics-container');
  const n = applications.length;
  if (!n) {
    c.innerHTML = `<div class="panel full"><p>${T('analytics_empty')}</p></div>`;
    return;
  }

  const count = s => applications.filter(a => a.status === s).length;
  const applied = count('applied'), interview = count('interview'), offer = count('offer'), rejected = count('rejected'), wishlist = count('wishlist');
  const submitted = applied + interview + offer + rejected; // actually submitted
  const reachedInterview = interview + offer;
  const pct = (a, b) => b ? Math.round(a / b * 100) : 0;

  // funnel
  const funnelSteps = [
    { label: T('funnel_total'), value: n, color: '#e8c84a' },
    { label: T('funnel_submitted'), value: submitted, color: '#5b8db8' },
    { label: T('funnel_interview'), value: reachedInterview, color: '#8a63c9' },
    { label: T('funnel_offer'), value: offer, color: '#4caf50' }
  ];
  const funnelHTML = funnelSteps.map((s, i) => {
    const w = Math.max(2, pct(s.value, n));
    const rate = i === 0 ? T('funnel_rate_first') : T('funnel_rate_tpl', { pct: pct(s.value, funnelSteps[i - 1].value) });
    return `
    <div class="funnel-step">
      <span class="funnel-label">${esc(s.label)}</span>
      <div class="funnel-bar-wrap"><div class="funnel-bar" style="width:${w}%;background:${s.color}">${s.value}</div></div>
      <span class="funnel-rate">${esc(rate)}</span>
    </div>`;
  }).join('');

  // platform distribution
  const byPlatform = {};
  for (const a of applications) if (a.platform) byPlatform[a.platform] = (byPlatform[a.platform] || 0) + 1;
  const platformEntries = Object.entries(byPlatform).sort((x, y) => y[1] - x[1]);
  const platformHTML = platformEntries.length ? platformEntries.map(([p, v]) => `
    <div class="bar-row">
      <span class="bar-label" title="${esc(platformLabel(p, lang))}">${esc(platformLabel(p, lang))}</span>
      <div class="bar-track"><div class="bar-fill" style="width:${pct(v, platformEntries[0][1])}%"></div></div>
      <span class="bar-value">${v}</span>
    </div>`).join('') : `<p class="panel-note">${esc(T('analytics_platform_empty'))}</p>`;

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
    months.push({ key: monthKey(d), label: d.toLocaleDateString(localeTag(), { month: 'short' }), count: 0 });
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
      <span class="trend-month">${esc(m.label)}</span>
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
      <h3>${T('analytics_funnel_title')}</h3>
      <div class="funnel">${funnelHTML}</div>
      <p class="panel-note">${esc(T('analytics_funnel_note'))}</p>
    </div>
    <div class="panel">
      <h3>${T('analytics_summary_title')}</h3>
      <div class="kv-list">
        <div class="kv"><span>${esc(T('kv_total'))}</span><b>${n}</b></div>
        <div class="kv"><span>${esc(T('kv_submitted'))}</span><b>${submitted}</b></div>
        <div class="kv"><span>${esc(T('kv_wishlist'))}</span><b>${wishlist}</b></div>
        <div class="kv"><span>${esc(T('kv_response_rate'))}</span><b>${responseRate}%</b></div>
        <div class="kv"><span>${esc(T('kv_interview_rate'))}</span><b>${interviewRate}%</b></div>
        <div class="kv"><span>${esc(T('kv_followup'))}</span><b>${avgFollowup}</b></div>
        <div class="kv"><span>${esc(T('kv_median_min'))}</span><b>${idrMin ? 'Rp ' + fmtNumber(idrMin) : '—'}</b></div>
        <div class="kv"><span>${esc(T('kv_median_max'))}</span><b>${idrMax ? 'Rp ' + fmtNumber(idrMax) : '—'}</b></div>
        <div class="kv"><span>${esc(T('kv_offer_salary'))}</span><b>${offerSalaries.length}</b></div>
        <div class="kv"><span>${esc(T('kv_with_salary'))}</span><b>${withSalary.length}</b></div>
      </div>
    </div>
    <div class="panel">
      <h3>${T('analytics_trend_title')}</h3>
      <div class="trend">${trendHTML}</div>
      <p class="panel-note">${esc(T('analytics_trend_note'))}</p>
    </div>
    <div class="panel">
      <h3>${T('analytics_platform_title')}</h3>
      ${platformHTML}
      <p class="panel-note">${esc(T('analytics_platform_note'))}</p>
    </div>
    <div class="panel full">
      <h3>${T('analytics_status_title')}</h3>
      ${statusHTML}
    </div>`;
}

/* ---------- tips ---------- */
function renderTips() {
  const c = $('#tips-container');
  c.innerHTML = TIPS_I18N[lang].map((cat, ci) => `
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

/* ---------- language ---------- */
function applyStaticI18n() {
  document.documentElement.lang = lang;
  $('#doc-title').textContent = T('meta_title');
  $('#meta-description').setAttribute('content', T('meta_description'));
  $('#lang-toggle').textContent = lang === 'id' ? 'EN' : 'ID';

  $$('[data-i18n]').forEach(el => { el.textContent = T(el.dataset.i18n); });
  $$('[data-i18n-html]').forEach(el => { el.innerHTML = T(el.dataset.i18nHtml); });
  $$('[data-i18n-ph]').forEach(el => { el.placeholder = T(el.dataset.i18nPh); });
  $$('[data-i18n-aria]').forEach(el => { el.setAttribute('aria-label', T(el.dataset.i18nAria)); });
  $$('[data-i18n-title]').forEach(el => { el.setAttribute('title', T(el.dataset.i18nTitle)); });
  $$('[data-i18n-platform]').forEach(el => { el.textContent = platformLabel(el.dataset.i18nPlatform, lang); });
}

function setLang(next) {
  lang = next;
  localStorage.setItem(STORE_KEYS.lang, lang);
  applyStaticI18n();
  renderQuote();
  renderChecklist();
  renderTips();
  renderApplications();
  if ($('#page-analytics').classList.contains('active')) renderAnalytics();
}
$('#lang-toggle').addEventListener('click', () => setLang(lang === 'id' ? 'en' : 'id'));

/* ---------- pencil cursor ----------
   The SVG's drawing tip sits at local (3.5px, 24.5px) inside the 28x28 icon
   (viewBox point ~3,21 scaled by 28/24). CSS pins transform-origin there, so
   `rotate()` always pivots on the tip regardless of angle. To land the tip
   exactly at the real cursor (with a small up-left nudge, not down-right),
   translate by (mouse - tipOffset - nudge). */
function initPencilCursor() {
  const pencil = $('#pencil-cursor');
  if (!window.matchMedia('(pointer: fine)').matches || window.innerWidth <= 900) return;
  const TIP_X = 3.5, TIP_Y = 24.5;
  const NUDGE_X = 3, NUDGE_Y = 3; // small offset up-and-left of the real cursor
  const inertSelector = 'a, button, input, textarea, select, summary, label, [role="button"], [tabindex], dialog';
  let raf = null;
  document.addEventListener('mousemove', e => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      const dialogOpen = !!document.querySelector('dialog[open]');
      const overInteractive = !dialogOpen && !!e.target.closest?.(inertSelector);
      if (dialogOpen || overInteractive) {
        pencil.classList.remove('visible');
      } else {
        const tx = e.clientX - TIP_X - NUDGE_X;
        const ty = e.clientY - TIP_Y - NUDGE_Y;
        pencil.style.transform = `translate(${tx}px, ${ty}px) rotate(-8deg)`;
        pencil.classList.add('visible');
      }
      raf = null;
    });
  });
  document.addEventListener('mouseleave', () => pencil.classList.remove('visible'));
  document.addEventListener('mouseout', e => { if (!e.relatedTarget) pencil.classList.remove('visible'); });
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
  sel.querySelectorAll('option[data-dynamic]').forEach(o => o.remove());
  for (const p of PLATFORMS) {
    const opt = document.createElement('option');
    opt.value = p; opt.textContent = platformLabel(p, lang);
    opt.dataset.dynamic = '1';
    if (PLATFORM_LABELS_EN[p]) opt.dataset.i18nPlatform = p;
    sel.appendChild(opt);
  }
}

/* ---------- init ---------- */
function init() {
  loadAll();
  applyStaticI18n();
  initPlatformOptions();
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
