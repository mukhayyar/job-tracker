/* ============================================================
   i18n.js — translation data & helpers for Catatan Lamaran Kerja.
   Loaded before app.js. Exposes globals: UI_STRINGS, CHECKLIST_I18N,
   TIPS_I18N, QUOTES_I18N, PLATFORM_LABELS_EN, platformLabel(), t().
   ============================================================ */
'use strict';

const I18N_DEFAULT_LANG = 'id';

/* ---------- short UI chrome strings ---------- */
const UI_STRINGS = {
  id: {
    meta_title: 'Catatan Lamaran Kerja — Job Application Tracker',
    meta_description: 'Tracker lamaran kerja lokal-first: catat status, follow-up, checklist persiapan, dan analytics funnel lamaranmu. Data tersimpan di browser, bisa export/import JSON & CSV.',
    loading_text: 'membuka buku catatan...',
    theme_toggle_label: 'Ganti mode siang/malam',
    lang_toggle_label: 'Ganti bahasa ke Inggris',
    back_top_aria: 'Kembali ke atas',

    postit_streak_title_attr: 'Lihat lamaran terbaru',
    postit_streak_title: '🔥 Ritme Melamar',
    postit_followup_title: '⏰ Perlu Follow-up',
    postit_interview_title: '🎤 Interview Aktif',
    postit_add_title: '✏️ Tambah Lamaran',
    postit_add_body: 'Catat lamaran baru dalam 30 detik',
    postit_quote_title: '💬 Pengingat Hari Ini',
    postit_checklist_title: '✅ Checklist',
    postit_checklist_default: 'Persiapan sebelum melamar',
    postit_analytics_title: '📈 Analytics',
    postit_analytics_body: 'Lihat funnel & tren lamaranmu',

    page_tabs_aria: 'Halaman buku catatan',
    tab_tracker: '📋 Tracker',
    tab_checklist: '✅ Checklist',
    tab_analytics: '📈 Analytics',
    tab_tips: '💡 Tips & Tricks',

    tracker_h1: 'Catatan Lamaran Kerja',
    tracker_subtitle: 'Buku catatanku untuk berburu kerja — semua data tersimpan lokal di browser, tidak dikirim ke mana-mana.',
    btn_add_top: '✏️ Tambah Lamaran',
    followup_banner_stamp: 'FOLLOW UP!',
    btn_show: 'Tampilkan',
    filter_keyword_label: '🔍 Cari',
    filter_keyword_placeholder: 'perusahaan, posisi, lokasi, catatan...',
    filter_status_label: '📊 Status',
    filter_status_all: 'Semua Status',
    filter_platform_label: '🌐 Platform',
    filter_platform_all: 'Semua Platform',
    sort_label: '↕️ Urutkan',
    sort_date_desc: 'Terbaru melamar',
    sort_date_asc: 'Terlama melamar',
    sort_updated_desc: 'Terbaru diubah',
    sort_company_asc: 'Perusahaan A→Z',
    sort_status: 'Status (funnel)',
    adv_filter_summary: 'Filter lanjutan & rentang tanggal',
    filter_date_from_label: '📅 Dari tanggal',
    filter_date_to_label: '📅 Sampai tanggal',
    btn_reset_filters: '↺ Reset semua filter',
    results_showing_tpl: 'Menampilkan <strong>{showing}</strong> dari <strong>{total}</strong> lamaran',
    per_page_label: 'Tampilkan:',
    per_page_all: 'Semua',
    btn_export_csv: '📊 Export CSV',
    btn_print: '🖨️ Print',
    backup_title: '💾 Backup & Restore',
    btn_export_json: '📥 Export JSON',
    btn_import: '📤 Import JSON',
    footer_note: 'Data hanya tersimpan di <code>localStorage</code> browser ini. Export JSON secara berkala sebagai backup — terutama sebelum membersihkan data browser.',

    checklist_h1: 'Checklist Persiapan',
    checklist_subtitle: 'Centang satu per satu — progres tersimpan otomatis di browser.',
    btn_cl_reset: '↺ Reset checklist',

    analytics_h1: 'Analytics Lamaran',
    analytics_subtitle: 'Funnel, tren bulanan, dan distribusi — supaya tahu di tahap mana kamu sering gugur.',
    analytics_empty: 'Belum ada data. Tambahkan lamaran dulu di tab <b>Tracker</b> untuk melihat analytics.',
    analytics_funnel_title: '🪜 Funnel Lamaran',
    analytics_funnel_note: 'Semakin bawah semakin sedikit — normal. Perhatikan konversi antar tahap.',
    analytics_summary_title: '📌 Ringkasan',
    kv_total: 'Total dicatat',
    kv_submitted: 'Benar-benar dikirim',
    kv_wishlist: 'Wishlist (belum dikirim)',
    kv_response_rate: 'Dapat respons (interview/offer/rejected)',
    kv_interview_rate: 'Tembus interview',
    kv_followup: 'Perlu follow-up',
    kv_median_min: 'Median gaji min (IDR)',
    kv_median_max: 'Median gaji max (IDR)',
    kv_offer_salary: 'Offer dengan angka gaji',
    kv_with_salary: 'Lamaran dengan gaji tercatat',
    analytics_trend_title: '📆 Tren 6 Bulan Terakhir',
    analytics_trend_note: 'Konsistensi > ledakan sesaat. Targetkan ritme mingguan yang stabil.',
    analytics_platform_title: '🌐 Distribusi Platform',
    analytics_platform_empty: 'Belum ada platform yang tercatat.',
    analytics_platform_note: 'Platform mana yang paling produktif? Perbanyak di sana.',
    analytics_status_title: '📊 Distribusi Status',
    funnel_total: 'Total dicatat',
    funnel_submitted: 'Dikirim',
    funnel_interview: 'Interview',
    funnel_offer: 'Offer',
    funnel_rate_first: '—',
    funnel_rate_tpl: '{pct}% dari tahap sebelumnya',

    tips_h1: 'Tips & Tricks',
    tips_subtitle: 'Panduan lengkap melamar kerja — klik kategori untuk membuka.',
    tips_search_placeholder: '🔍 Cari di semua tips...',
    btn_tips_expand: 'Buka semua',
    btn_tips_collapse: 'Tutup semua',

    dialog_add_title: '✏️ Tambah Lamaran Baru',
    dialog_edit_title: '✏️ Edit Lamaran',
    btn_save_new: '💾 Simpan Lamaran',
    btn_save_edit: '💾 Simpan Perubahan',
    field_company: 'Nama Perusahaan',
    field_company_placeholder: 'PT Contoh Sejahtera',
    field_position: 'Posisi yang Dilamar',
    field_position_placeholder: 'Frontend Developer',
    field_status: 'Status Lamaran',
    status_opt_wishlist: 'Wishlist — baru tertarik',
    status_opt_applied: 'Applied — sudah kirim',
    status_opt_interview: 'Interview — dipanggil wawancara',
    status_opt_offer: 'Offer — dapat tawaran! 🎉',
    status_opt_rejected: 'Rejected — belum rezeki',
    field_date: 'Tanggal Melamar',
    field_platform: 'Platform Lamaran',
    platform_opt_placeholder: '— pilih (opsional) —',
    field_location: 'Lokasi Kerja',
    field_location_placeholder: 'Surabaya / Remote',
    field_salary: 'Gaji yang Ditawarkan',
    salary_min_aria: 'Gaji minimum',
    salary_min_placeholder: 'minimum',
    salary_max_aria: 'Gaji maksimum',
    salary_max_placeholder: 'maksimum',
    currency_aria: 'Mata uang gaji',
    field_contact: 'Contact Person',
    field_contact_placeholder: 'Nama HRD / recruiter',
    field_source_url: 'Link Lowongan',
    field_notes: 'Catatan Pribadi',
    field_notes_placeholder: 'Tahapan seleksi, kesan interview, hal yang perlu ditindaklanjuti...',
    btn_cancel: 'Batal',

    import_dialog_title: '📤 Import Data',
    import_merge_label: '<b>Gabungkan</b> — tambahkan data baru, lewati duplikat yang identik (aman)',
    import_replace_label: '<b>Timpa semua</b> — ganti seluruh data dengan isi file (hati-hati!)',
    btn_import_now: '📥 Import Sekarang',

    confirm_dialog_title: '🗑️ Hapus Lamaran?',
    btn_confirm_delete: 'Ya, Hapus',

    toast_title_success: 'Berhasil!',
    toast_title_error: 'Error!',
    toast_title_info: 'Info',
    toast_title_warning: 'Perhatian!',
    toast_close_aria: 'Tutup notifikasi',
    undo_label: '↺ Undo',

    stat_total: 'Total Lamaran',
    stat_applied: 'Applied',
    stat_interview: 'Interview',
    stat_offer: 'Offer 🎉',
    stat_rejected: 'Rejected',
    stat_followup_tpl: 'Perlu Follow-up (≥{days} hari)',
    stat_filter_title: 'Klik untuk memfilter',

    followup_banner_tpl: '{count} lamaran belum ada kabar ≥{days} hari: {names}{more}. Kirim pesan tindak lanjut!',
    followup_banner_more_tpl: ' +{n} lainnya',

    streak_active_tpl: '{n} lamaran dicatat 7 hari terakhir. Pertahankan ritmemu!',
    streak_idle_has_data: 'Belum ada lamaran baru minggu ini. Yuk catat satu hari ini!',
    streak_idle_empty: 'Belum ada data. Mulai catat lamaran pertamamu!',
    followup_postit_tpl: '{n} lamaran menunggu ditindaklanjuti. Klik untuk melihat daftar.',
    checklist_postit_tpl: 'Checklist persiapan: {done}/{total} ({pct}%) selesai',

    empty_title_no_apps: 'Yuk, mulai perjalanan karirmu!',
    empty_no_apps_desc: 'Belum ada lamaran yang tercatat. Tambahkan lamaran pertama dan mulai lacak prosesnya.',
    btn_add_first: '✏️ Tambah Lamaran Pertama',
    btn_load_sample: '📚 Muat data contoh',
    empty_title_no_match: 'Tidak ada yang cocok',
    empty_no_match_desc: 'Tidak ada lamaran yang sesuai filter aktif. Coba longgarkan filter.',
    btn_reset_filter_short: '↺ Reset filter',

    followup_stamp: 'FOLLOW UP!',
    followup_stamp_title: 'Belum ada kabar ≥14 hari',
    detail_applied_label: '📅 Melamar:',
    detail_salary_label: '💰 Gaji:',
    detail_contact_label: '👤 Kontak:',
    detail_link_label: '🔗 Lowongan:',
    link_open: 'buka link',
    change_status_label: 'Ubah status:',
    change_status_placeholder: '→ pilih…',
    change_status_aria_tpl: 'Ubah status {company}',
    btn_edit: '✏️ Edit',
    btn_delete: '🗑️ Hapus',
    day_today: '(hari ini)',
    day_yesterday: '(kemarin)',
    day_future_tpl: '({n} hari lagi)',
    day_past_tpl: '({n} hari lalu)',

    pagination_prev: '‹ Prev',
    pagination_next: 'Next ›',

    chip_clear_aria_tpl: 'Hapus filter {label}',
    chip_followup_only: '⏰ hanya perlu follow-up',
    chip_date_from_tpl: '📅 dari {date}',
    chip_date_to_tpl: '📅 s/d {date}',

    salary_warn_min_gt_max: '⚠️ Gaji minimum lebih besar dari maksimum — periksa lagi.',
    salary_hint_range_tpl: 'Rentang: {cur} {min} – {max}',
    salary_hint_min_tpl: 'Minimal: {cur} {min}',
    salary_hint_max_tpl: 'Maksimum: {cur} {max}',

    toast_salary_invalid: 'Gaji minimum lebih besar dari maksimum. Perbaiki dulu ya.',
    toast_required_fields: 'Perusahaan dan posisi wajib diisi.',
    toast_app_updated_tpl: 'Lamaran {company} berhasil diupdate.',
    toast_app_added_tpl: 'Lamaran {company} berhasil ditambahkan!',
    toast_status_changed_title: 'Status diubah',
    toast_status_changed_tpl: '{company}: {old} → {new}',
    toast_deleted_title: 'Terhapus',
    toast_deleted_tpl: 'Lamaran {company} — {position} dihapus.',
    toast_restored: 'Lamaran dipulihkan.',
    confirm_delete_msg_tpl: 'Yakin ingin menghapus lamaran "{company} — {position}"? Masih bisa di-undo setelah dihapus.',

    toast_no_data_export: 'Belum ada data untuk di-export.',
    toast_json_exported_tpl: '{n} lamaran di-export ke JSON.',
    toast_no_data_export_filtered: 'Tidak ada data (sesuai filter) untuk di-export.',
    toast_csv_exported_tpl: '{n} baris di-export ke CSV.',

    csv_header_company: 'Perusahaan',
    csv_header_position: 'Posisi',
    csv_header_status: 'Status',
    csv_header_date: 'Tanggal Melamar',
    csv_header_currency: 'Mata Uang',
    csv_header_salary_min: 'Gaji Min',
    csv_header_salary_max: 'Gaji Max',
    csv_header_location: 'Lokasi',
    csv_header_platform: 'Platform',
    csv_header_contact: 'Contact Person',
    csv_header_link: 'Link Lowongan',
    csv_header_notes: 'Catatan',

    toast_import_invalid_format: 'Format file tidak valid: harus array JSON.',
    toast_import_no_valid: 'Tidak ada data lamaran valid di file ini.',
    import_summary_tpl: 'File "{filename}" berisi {count} lamaran valid. Data kamu sekarang: {current} lamaran. Pilih mode import:',
    toast_import_read_error: 'Gagal membaca file. Pastikan isinya JSON yang valid.',
    toast_import_replaced_tpl: 'Semua data diganti: {n} lamaran dari file.',
    toast_import_complete_title: 'Import selesai',
    toast_import_merged_tpl: '{added} lamaran baru ditambahkan, {skipped} duplikat dilewati.',

    toast_checklist_reset: 'Checklist direset.',
    toast_seed_loaded_tpl: '{n} lamaran contoh dimuat. Coba filter, ubah status, dan analytics!',
    toast_seed_title: 'Data contoh',
    toast_storage_full_title: 'Penyimpanan penuh',
    toast_storage_full_msg: 'Gagal menyimpan ke localStorage. Kuota browser mungkin penuh — export JSON untuk backup.'
  },
  en: {
    meta_title: 'Job Application Notebook — Job Application Tracker',
    meta_description: 'A local-first job application tracker: log status, follow-ups, a prep checklist, and funnel analytics for your job search. Data stays in your browser; export/import JSON & CSV.',
    loading_text: 'opening the notebook...',
    theme_toggle_label: 'Toggle day/night mode',
    lang_toggle_label: 'Switch language to Indonesian',
    back_top_aria: 'Back to top',

    postit_streak_title_attr: 'View latest applications',
    postit_streak_title: '🔥 Application Streak',
    postit_followup_title: '⏰ Needs Follow-up',
    postit_interview_title: '🎤 Active Interviews',
    postit_add_title: '✏️ Add Application',
    postit_add_body: 'Log a new application in 30 seconds',
    postit_quote_title: "💬 Today's Reminder",
    postit_checklist_title: '✅ Checklist',
    postit_checklist_default: 'Preparation before applying',
    postit_analytics_title: '📈 Analytics',
    postit_analytics_body: 'See your funnel & application trends',

    page_tabs_aria: 'Notebook pages',
    tab_tracker: '📋 Tracker',
    tab_checklist: '✅ Checklist',
    tab_analytics: '📈 Analytics',
    tab_tips: '💡 Tips & Tricks',

    tracker_h1: 'Job Application Notebook',
    tracker_subtitle: 'My notebook for the job hunt — everything stays local in your browser, nothing is ever sent anywhere.',
    btn_add_top: '✏️ Add Application',
    followup_banner_stamp: 'FOLLOW UP!',
    btn_show: 'Show',
    filter_keyword_label: '🔍 Search',
    filter_keyword_placeholder: 'company, position, location, notes...',
    filter_status_label: '📊 Status',
    filter_status_all: 'All Statuses',
    filter_platform_label: '🌐 Platform',
    filter_platform_all: 'All Platforms',
    sort_label: '↕️ Sort',
    sort_date_desc: 'Newest applied',
    sort_date_asc: 'Oldest applied',
    sort_updated_desc: 'Recently updated',
    sort_company_asc: 'Company A→Z',
    sort_status: 'Status (funnel)',
    adv_filter_summary: 'Advanced filters & date range',
    filter_date_from_label: '📅 From date',
    filter_date_to_label: '📅 To date',
    btn_reset_filters: '↺ Reset all filters',
    results_showing_tpl: 'Showing <strong>{showing}</strong> of <strong>{total}</strong> applications',
    per_page_label: 'Show:',
    per_page_all: 'All',
    btn_export_csv: '📊 Export CSV',
    btn_print: '🖨️ Print',
    backup_title: '💾 Backup & Restore',
    btn_export_json: '📥 Export JSON',
    btn_import: '📤 Import JSON',
    footer_note: "Data only lives in this browser's <code>localStorage</code>. Export JSON regularly as a backup — especially before clearing your browser data.",

    checklist_h1: 'Preparation Checklist',
    checklist_subtitle: 'Check them off one by one — progress is saved automatically in your browser.',
    btn_cl_reset: '↺ Reset checklist',

    analytics_h1: 'Application Analytics',
    analytics_subtitle: 'Funnel, monthly trends, and distribution — so you know exactly where you tend to drop off.',
    analytics_empty: 'No data yet. Add an application first in the <b>Tracker</b> tab to see analytics.',
    analytics_funnel_title: '🪜 Application Funnel',
    analytics_funnel_note: 'Fewer at each step down is normal — watch the conversion rate between stages.',
    analytics_summary_title: '📌 Summary',
    kv_total: 'Total logged',
    kv_submitted: 'Actually submitted',
    kv_wishlist: 'Wishlist (not sent yet)',
    kv_response_rate: 'Got a response (interview/offer/rejected)',
    kv_interview_rate: 'Reached interview',
    kv_followup: 'Needs follow-up',
    kv_median_min: 'Median min salary (IDR)',
    kv_median_max: 'Median max salary (IDR)',
    kv_offer_salary: 'Offers with a salary figure',
    kv_with_salary: 'Applications with salary logged',
    analytics_trend_title: '📆 Last 6 Months Trend',
    analytics_trend_note: 'Consistency beats a one-time burst. Aim for a stable weekly rhythm.',
    analytics_platform_title: '🌐 Platform Distribution',
    analytics_platform_empty: 'No platform logged yet.',
    analytics_platform_note: 'Which platform is most productive? Do more of that.',
    analytics_status_title: '📊 Status Distribution',
    funnel_total: 'Total logged',
    funnel_submitted: 'Submitted',
    funnel_interview: 'Interview',
    funnel_offer: 'Offer',
    funnel_rate_first: '—',
    funnel_rate_tpl: '{pct}% of the previous stage',

    tips_h1: 'Tips & Tricks',
    tips_subtitle: 'A complete guide to job hunting — click a category to open it.',
    tips_search_placeholder: '🔍 Search all tips...',
    btn_tips_expand: 'Expand all',
    btn_tips_collapse: 'Collapse all',

    dialog_add_title: '✏️ Add New Application',
    dialog_edit_title: '✏️ Edit Application',
    btn_save_new: '💾 Save Application',
    btn_save_edit: '💾 Save Changes',
    field_company: 'Company Name',
    field_company_placeholder: 'Acme Corp',
    field_position: 'Position Applied For',
    field_position_placeholder: 'Frontend Developer',
    field_status: 'Application Status',
    status_opt_wishlist: 'Wishlist — just interested',
    status_opt_applied: 'Applied — already sent',
    status_opt_interview: 'Interview — called for an interview',
    status_opt_offer: 'Offer — got an offer! 🎉',
    status_opt_rejected: 'Rejected — not this time',
    field_date: 'Date Applied',
    field_platform: 'Application Platform',
    platform_opt_placeholder: '— select (optional) —',
    field_location: 'Work Location',
    field_location_placeholder: 'Remote / On-site',
    field_salary: 'Offered Salary',
    salary_min_aria: 'Minimum salary',
    salary_min_placeholder: 'minimum',
    salary_max_aria: 'Maximum salary',
    salary_max_placeholder: 'maximum',
    currency_aria: 'Salary currency',
    field_contact: 'Contact Person',
    field_contact_placeholder: 'HR/recruiter name',
    field_source_url: 'Job Posting Link',
    field_notes: 'Personal Notes',
    field_notes_placeholder: 'Selection stages, interview impressions, things to follow up on...',
    btn_cancel: 'Cancel',

    import_dialog_title: '📤 Import Data',
    import_merge_label: '<b>Merge</b> — add new entries, skip exact duplicates (safe)',
    import_replace_label: '<b>Replace all</b> — overwrite everything with the file contents (careful!)',
    btn_import_now: '📥 Import Now',

    confirm_dialog_title: '🗑️ Delete Application?',
    btn_confirm_delete: 'Yes, Delete',

    toast_title_success: 'Success!',
    toast_title_error: 'Error!',
    toast_title_info: 'Info',
    toast_title_warning: 'Heads up!',
    toast_close_aria: 'Close notification',
    undo_label: '↺ Undo',

    stat_total: 'Total Applications',
    stat_applied: 'Applied',
    stat_interview: 'Interview',
    stat_offer: 'Offer 🎉',
    stat_rejected: 'Rejected',
    stat_followup_tpl: 'Needs Follow-up (≥{days} days)',
    stat_filter_title: 'Click to filter',

    followup_banner_tpl: '{count} applications with no news for ≥{days} days: {names}{more}. Send a follow-up message!',
    followup_banner_more_tpl: ' +{n} more',

    streak_active_tpl: '{n} applications logged in the last 7 days. Keep up the rhythm!',
    streak_idle_has_data: 'No new applications this week. Log one today!',
    streak_idle_empty: "No data yet. Log your first application!",
    followup_postit_tpl: '{n} applications waiting on a follow-up. Click to see the list.',
    checklist_postit_tpl: 'Prep checklist: {done}/{total} ({pct}%) done',

    empty_title_no_apps: "Let's start your career journey!",
    empty_no_apps_desc: 'No applications logged yet. Add your first one and start tracking the process.',
    btn_add_first: '✏️ Add Your First Application',
    btn_load_sample: '📚 Load sample data',
    empty_title_no_match: 'No matches found',
    empty_no_match_desc: 'No applications match the active filters. Try loosening them.',
    btn_reset_filter_short: '↺ Reset filters',

    followup_stamp: 'FOLLOW UP!',
    followup_stamp_title: 'No news for ≥14 days',
    detail_applied_label: '📅 Applied:',
    detail_salary_label: '💰 Salary:',
    detail_contact_label: '👤 Contact:',
    detail_link_label: '🔗 Posting:',
    link_open: 'open link',
    change_status_label: 'Change status:',
    change_status_placeholder: '→ choose…',
    change_status_aria_tpl: 'Change status for {company}',
    btn_edit: '✏️ Edit',
    btn_delete: '🗑️ Delete',
    day_today: '(today)',
    day_yesterday: '(yesterday)',
    day_future_tpl: '(in {n} days)',
    day_past_tpl: '({n} days ago)',

    pagination_prev: '‹ Prev',
    pagination_next: 'Next ›',

    chip_clear_aria_tpl: 'Remove filter {label}',
    chip_followup_only: '⏰ follow-up needed only',
    chip_date_from_tpl: '📅 from {date}',
    chip_date_to_tpl: '📅 to {date}',

    salary_warn_min_gt_max: '⚠️ Minimum salary is greater than maximum — double check.',
    salary_hint_range_tpl: 'Range: {cur} {min} – {max}',
    salary_hint_min_tpl: 'Minimum: {cur} {min}',
    salary_hint_max_tpl: 'Maximum: {cur} {max}',

    toast_salary_invalid: 'Minimum salary is greater than maximum. Please fix it first.',
    toast_required_fields: 'Company and position are required.',
    toast_app_updated_tpl: '{company} application updated successfully.',
    toast_app_added_tpl: '{company} application added successfully!',
    toast_status_changed_title: 'Status changed',
    toast_status_changed_tpl: '{company}: {old} → {new}',
    toast_deleted_title: 'Deleted',
    toast_deleted_tpl: '{company} — {position} application deleted.',
    toast_restored: 'Application restored.',
    confirm_delete_msg_tpl: 'Delete the application "{company} — {position}"? You can still undo it right after.',

    toast_no_data_export: 'No data to export yet.',
    toast_json_exported_tpl: '{n} applications exported to JSON.',
    toast_no_data_export_filtered: 'No data (matching the filter) to export.',
    toast_csv_exported_tpl: '{n} rows exported to CSV.',

    csv_header_company: 'Company',
    csv_header_position: 'Position',
    csv_header_status: 'Status',
    csv_header_date: 'Date Applied',
    csv_header_currency: 'Currency',
    csv_header_salary_min: 'Salary Min',
    csv_header_salary_max: 'Salary Max',
    csv_header_location: 'Location',
    csv_header_platform: 'Platform',
    csv_header_contact: 'Contact Person',
    csv_header_link: 'Job Link',
    csv_header_notes: 'Notes',

    toast_import_invalid_format: 'Invalid file format: must be a JSON array.',
    toast_import_no_valid: 'No valid application data found in this file.',
    import_summary_tpl: 'File "{filename}" contains {count} valid applications. You currently have {current}. Choose an import mode:',
    toast_import_read_error: "Couldn't read the file. Make sure it contains valid JSON.",
    toast_import_replaced_tpl: 'All data replaced: {n} applications from the file.',
    toast_import_complete_title: 'Import complete',
    toast_import_merged_tpl: '{added} new applications added, {skipped} duplicates skipped.',

    toast_checklist_reset: 'Checklist reset.',
    toast_seed_loaded_tpl: '{n} sample applications loaded. Try the filters, change a status, and check analytics!',
    toast_seed_title: 'Sample data',
    toast_storage_full_title: 'Storage full',
    toast_storage_full_msg: "Couldn't save to localStorage. Your browser storage might be full — export JSON as a backup."
  }
};

/* ---------- platform display labels (stored value stays canonical/ID) ---------- */
const PLATFORM_LABELS_EN = {
  'Website Perusahaan': 'Company Website',
  'Email Langsung': 'Direct Email',
  'Lainnya': 'Other'
};
function platformLabel(platform, lang) {
  if (!platform) return '';
  if (lang === 'en' && PLATFORM_LABELS_EN[platform]) return PLATFORM_LABELS_EN[platform];
  return platform;
}

/* ---------- translation helper ---------- */
function t(lang, key, vars) {
  const dict = UI_STRINGS[lang] || UI_STRINGS[I18N_DEFAULT_LANG];
  let str = dict[key] ?? UI_STRINGS[I18N_DEFAULT_LANG][key] ?? key;
  if (vars) for (const k in vars) str = str.split(`{${k}}`).join(String(vars[k]));
  return str;
}

/* ============================================================
   Checklist content (id/en)
   ============================================================ */
const CHECKLIST_I18N = {
  id: [
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
  ],
  en: [
    { id: 'dokumen', title: '📄 Documents', items: [
      ['cv', "Up-to-date CV/resume tailored to the position you're applying for"],
      ['cover', 'Personalized cover letter for the target company'],
      ['portfolio', 'Portfolio/work samples (if relevant to your field)'],
      ['certs', 'Certificates, diploma, and other supporting documents'],
      ['references', 'List of references (if requested)']
    ]},
    { id: 'online', title: '🌐 Online Presence', items: [
      ['linkedin', 'LinkedIn profile optimized and up to date'],
      ['photo', 'Professional profile photo on LinkedIn'],
      ['headline', 'Clear, compelling LinkedIn headline'],
      ['social', 'Social media cleaned up of unprofessional content'],
      ['github', 'Active GitHub/online portfolio (for tech roles)']
    ]},
    { id: 'riset', title: '🎯 Research & Preparation', items: [
      ['company', 'Company research (products, culture, recent news)'],
      ['jobdesc', 'Understand the job description in detail'],
      ['skills', 'List skills and experience matching the requirements'],
      ['questions', 'Prepare answers for common interview questions'],
      ['stories', 'Prepare 3-5 achievement stories using the STAR method'],
      ['ask', 'Prepare at least 5 questions for the interviewer']
    ]},
    { id: 'interview', title: '💼 Interview Day', items: [
      ['outfit', 'Interview outfit ready and matching the dress code'],
      ['location', 'Interview location checked (or Zoom link saved)'],
      ['reminder', 'Set a reminder 1 hour before the interview'],
      ['print', 'Printed CV and important documents (for in-person interviews)'],
      ['tech', 'Test internet connection, camera, and mic (for virtual interviews)'],
      ['background', 'Set up a tidy background and good lighting (for virtual interviews)']
    ]},
    { id: 'followup', title: '📧 Follow Up', items: [
      ['thankyou', 'Send a thank-you email within 24 hours after the interview'],
      ['review', 'Note key takeaways from the interview for review'],
      ['tracker', 'Update the status in your application tracker'],
      ['followup-reminder', 'Set a follow-up reminder (if no response after 1-2 weeks)']
    ]}
  ]
};

/* ============================================================
   Motivational quotes (id/en)
   ============================================================ */
const QUOTES_I18N = {
  id: [
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
  ],
  en: [
    'Every "no" brings you closer to the right "yes". 💪',
    'Success comes from preparation, hard work, and learning from failure.',
    "Your dream career is waiting. Don't give up!",
    'The job search is an investment in a better future.',
    "Stay motivated! Your best job hasn't come yet.",
    'Every rejection is a redirect to somewhere better. 🚀',
    "Trust your skills. Keep trying and don't be afraid to fail!",
    "You're closer to an offer than you think. Keep going!",
    'Applying early beats applying perfectly. Send it today!',
    'Log it, follow up, repeat. Consistency beats motivation.'
  ]
};

/* ============================================================
   Tips & Tricks content (id/en) — 8 categories
   ============================================================ */
const TIPS_I18N = {
  id: [
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
  ],
  en: [
    { title: '📝 Resume/CV Tips', tips: [
      { t: 'Clean, Professional Formatting', p: ['Use a clean, easy-to-read format, max 2 pages. Choose a professional font like Arial, Calibri, or Times New Roman at 10-12pt.'] },
      { t: 'Tailor It to the Position', p: ["Don't use the same resume for every application. Highlight experience and skills relevant to the job description, and use keywords from the posting."] },
      { t: 'Show Achievements, Not Just Job Duties', p: ['Don\'t just list your duties. Show results with concrete numbers. Example: "Increased sales 30% in 6 months" is more powerful than "Responsible for sales".', "<strong>Can't put a number on it yet?</strong> Focus on the impact and scope of your work:"], ul: ['"Led a team of 5 to redesign the company website"', '"Managed a project from planning to launch in 3 months"', '"Implemented a new system that sped up the team\'s workflow"', '"Delivered a project on time despite limited resources"', '"Created a new SOP adopted department-wide"'], p2: ['Bottom line: show the <strong>impact</strong> you made, not just the <strong>activities</strong> you did!'] },
      { t: 'Strong Action Verbs', p: ['Start sentences with strong verbs like: Led, Developed, Increased, Analyzed, Designed, Managed, Created, Implemented.'] },
      { t: 'Proofread for Typos and Grammar', p: ['Typos in a resume can make it look careless, even if the content is strong. Ask a friend or family member to review it before sending, then run it through a tool like Grammarly to catch anything you missed.'] }
    ]},
    { title: '✉️ Cover Letter Tips', tips: [
      { t: 'Personalize for Each Company', p: ["Research the company and the role you're applying for. Mention specifically why you're interested in that company."] },
      { t: 'Clear Structure', ul: ["<strong>Opening:</strong> The role you're applying for and where you heard about it", '<strong>Body:</strong> Relevant experience and skills, concrete achievements', '<strong>Closing:</strong> Enthusiasm for an interview and a thank you'] },
      { t: 'Show the Value You Bring', p: ['Focus on "what you can do for the company", not just "what you want".'] },
      { t: 'Keep It to 1 Page', p: ["Recruiters handle many applications at once, so their time is limited. 3-4 paragraphs are usually enough to make your point without rambling."] }
    ]},
    { title: '🎯 Job Application Tips', tips: [
      { t: 'Apply as Early as Possible', p: ["Don't wait for the deadline! Many companies review applications on a first-come basis. Apply within the first day or two of the posting going live."] },
      { t: 'Follow Instructions Carefully', p: ["Read the job posting carefully. If asked to use a specific subject line or file format, FOLLOW IT! It's the first test of your attention to detail."] },
      { t: 'Leverage Your Network', p: ['Many positions are filled through referrals. Build connections with people at your target companies on LinkedIn — from there you can seek a referral or insider information.'] },
      { t: "Follow Up (But Don't Spam)", p: ['Wait 1-2 weeks after applying before following up with a polite email. Show enthusiasm while staying professional.'] },
      { t: 'Track Every Application', p: ['Use this app! Log the date applied, status, and contact person. It keeps you organized and helps you know when to follow up.'] }
    ]},
    { title: '🌍 English for the Job Search', tips: [
      { t: 'Why Does English Matter?', p: ["Basic English will genuinely help your job search, even for roles that don't formally require it:"], ul: ['Many job postings (especially at multinational companies) are written in English', 'International resume formats are more widely used', 'Interviews sometimes include questions in English', 'Access to far more learning resources and job-search guides', 'Opens up remote opportunities with companies abroad'] },
      { t: 'What You Need (Basic Level)', p: ["You don't need to be fluent! What matters is being able to:"], ul: ['<strong>Read:</strong> Understand job descriptions, requirements, and company profiles', '<strong>Write:</strong> Put together a CV and cover letter in English (even a simple one)', '<strong>Speak:</strong> Introduce yourself, describe your work experience, and answer basic questions', '<strong>Vocabulary:</strong> Common terms in your field and the working world'] },
      { t: 'Tips for Learning Job-Search English', ul: ['<strong>Read job postings in English:</strong> the most practical way to learn relevant vocabulary', '<strong>Make an English version of your CV:</strong> translate it (AI tools can help, but review it afterward)', '<strong>Practice introducing yourself:</strong> answer "Tell me about yourself" in 2-3 minutes', '<strong>Watch interview-tip videos on YouTube:</strong> pick up vocabulary and answering techniques at once', '<strong>Join online communities:</strong> LinkedIn groups, Discord, or forums in your field', '<strong>Practice with AI:</strong> chat with a chatbot to rehearse interviews'] },
      { t: "Don't Be Afraid of Imperfect Grammar!", p: ['What matters most: being <strong>clear and communicative</strong>. Even native speakers often have imperfect grammar in conversation. Focus on:'], ul: ['Getting your message across clearly', 'Speaking with confidence (even with mistakes)', 'Continuously learning from feedback'], p2: ['Remember: "Done is better than perfect." Start now with the English you have — it will improve over time!'] }
    ]},
    { title: '🎤 Interview Tips', tips: [
      { t: 'Preparation Is Key', ul: ['Research the company: products, culture, recent news', 'Understand the job description in detail', "Prepare answers for common questions (strengths/weaknesses, why you're interested, etc.)", 'Prepare questions for the interviewer (at least 3-5)'] },
      { t: 'The STAR Method for Behavioral Questions', p: ['Answer using the STAR structure:'], ul: ['<strong>S</strong>ituation: Describe the context', '<strong>T</strong>ask: What was your responsibility', '<strong>A</strong>ction: What you did', '<strong>R</strong>esult: What happened, ideally with numbers'] },
      { t: 'Dress Code and Appearance', p: ["It's better to be overdressed than too casual. If unsure, ask HR. First impressions matter a lot!"] },
      { t: 'Positive Body Language', ul: ['Eye contact: shows confidence', 'Smile: friendly and approachable', "Upright posture: don't slouch", 'A firm handshake (for in-person interviews)'] },
      { t: 'For Virtual Interviews', ul: ['Test your internet connection and devices the day before', 'Choose a tidy background and good lighting', 'Look at the camera, not the screen (to simulate eye contact)', 'Minimize distractions and notifications', 'Dress professionally from head to toe'] },
      { t: 'Questions You Can Ask', ul: ['"What does a typical day look like in this role?"', '"What\'s the biggest challenge someone in this role would face?"', '"What\'s the team culture and day-to-day way of working like?"', '"What are the next steps in this hiring process?"', '"What do you enjoy about working here?"'] },
      { t: 'After the Interview: Thank-You Email', p: ['Send a thank-you email within 24 hours. Express gratitude, reaffirm your interest, and mention 1-2 specific things from the interview that stood out.'] }
    ]},
    { title: '💼 Optimizing LinkedIn to Get Noticed by Recruiters', tips: [
      { t: 'Why Does LinkedIn Matter?', p: ['LinkedIn is the first place recruiters look for candidates. An optimized profile can get you contacted about opportunities without ever applying!'] },
      { t: 'A Professional Profile Photo', ul: ['Use a close-up shot focused on your face (not a full-body photo)', 'A simple, well-lit background', 'Smile and look at the camera', 'Professional attire (matching your industry)', 'Avoid: selfies, photos with other people, vacation photos'] },
      { t: 'A Headline That Grabs Attention', p: ['Don\'t just write "Looking for opportunities". Write a headline that shows your value:'], ul: ['<strong>Weak:</strong> "Recent Graduate | Job Seeking"', '<strong>Better:</strong> "Marketing Graduate | Content Creator | Passionate About Digital Strategy"', '<strong>Best:</strong> "Digital Marketing Specialist | Helped 10+ Brands Grow 50% on Social Media | Open to Opportunities"'], p2: ["Use keywords recruiters in your field are actually searching for!"] },
      { t: 'A Compelling About/Summary Section', p: ['This is your chance to tell your story. Include:'], ul: ['Who you are and what you do', 'Your passion and motivation', 'Key achievements (with numbers if possible)', 'Your core skills and expertise', "What you're looking for / career goals", 'A call to action (e.g., "Feel free to reach out for collaboration")'], p2: ['Write in first person ("I", not "he/she") to make it more personal!'] },
      { t: 'The Experience Section: Details Matter', ul: ["Don't just list job titles and company names", 'Write 3-5 bullet points per role covering achievements and responsibilities', 'Use active verbs (Led, Developed, Increased, Managed)', 'Include results/impact with concrete numbers', 'Add media: photos, videos, documents, or links to your projects'] },
      { t: 'Skills Section with Endorsements', ul: ['Add at least 10-15 skills relevant to your career goals', 'Prioritize your top 3 skills (put the most important ones first)', 'Include a mix of technical and soft skills', 'Ask colleagues, managers, or friends for endorsements', 'Take LinkedIn Skill Assessments to validate your skills'] },
      { t: 'Recommendations Matter!', p: ['Recommendations from managers or colleagues are strong social proof.'], ul: ['Ask 2-3 people for a recommendation (former managers, colleagues, or clients)', 'Specific is better: ask them to describe a concrete project/achievement', 'Give recommendations to receive them: help others first!'] },
      { t: 'Set Your Profile to "Open to Work"', ul: ['Turn on the "Open to Work" feature (can be private or public)', "Specify the job titles, locations, and job types you're looking for", "It signals to recruiters that you're available and interested"] },
      { t: 'Stay Active: Post & Engage!', p: ["LinkedIn's algorithm favors active users. Easy ways to do this:"], ul: ['Share articles or insights about your industry (1-2x a week)', 'Comment on posts from people in your network', "React to other people's achievements", 'Share your own wins and lessons learned', 'Join LinkedIn groups in your field and participate'], p2: ['Consistency matters more than frequency. Better to post once a week consistently than 10 posts at once and then disappear!'] },
      { t: 'Building Your Network Strategically', ul: ['Connect with 2nd-degree connections (friends of friends)', 'Add recruiters at your target companies', 'Connect with alumni from your school/university', "Personalize connection requests (don't use a generic message)", "Follow companies you're interested in"] },
      { t: 'Keywords for Recruiter Search', p: ['Sprinkle keywords throughout your profile:'], ul: ['Job titles you\'re targeting (e.g., "Product Manager", "Data Analyst")', 'Technical skills (e.g., "Python", "Google Analytics", "Figma")', 'Industry terms (e.g., "SaaS", "E-commerce", "Fintech")', 'Certifications (e.g., "PMP Certified", "Google Ads Certified")'], p2: ["Tip: check job postings you're interested in and see which keywords keep showing up!"] },
      { t: 'Update Regularly', p: ["A profile that's never updated is less compelling. Update it at least:"], ul: ['Every time you achieve something new', 'Every time you finish an important project', 'Every time you gain a new skill or certification', 'At least once a month (even a small update)'], p2: ["Every time you update, your profile shows up in your network's feed — free visibility!"] }
    ]},
    { title: '⚠️ Things to Avoid', tips: [
      { t: "Don't Badmouth Your Previous Company", p: ['Even if your experience was bad, stay professional. Frame it as a "learning opportunity" or "seeking new challenges" rather than trashing anyone.'] },
      { t: "Don't Lead With Salary", p: ["Your first question shouldn't be about salary or benefits. Show interest in the role and company first. Let them bring up compensation."] },
      { t: "Don't Show Up Unprepared", p: ['"I don\'t know much about this company" is an instant rejection. Do your research!'] },
      { t: "Don't Lie or Exaggerate", p: ['Any skill you claim should be something you can back up. Background checks are real. Honesty is the best policy.'] },
      { t: "Don't Be Late", p: ["For in-person interviews, arrive 10-15 minutes early. For online ones, join 5 minutes before the scheduled time. Being late signals you don't respect others' time."] }
    ]},
    { title: '💪 Job-Search Mindset', tips: [
      { t: 'Rejection Is Normal', p: ['Most people need dozens to hundreds of applications to land one offer. Every "no" brings you closer to a "yes". Don\'t take it personally!'] },
      { t: 'Consistency and Discipline', p: ['Set a daily target, e.g., 3-5 applications a day. Treat job hunting like a full-time job. Consistency is key!'] },
      { t: 'Self-Care Still Matters', p: ["Job hunting is mentally exhausting. Don't forget to rest, exercise, and make time for yourself. Burnout won't help your process."] },
      { t: 'Learn From Every Interview', p: ['After each interview, jot down the questions asked and how you answered. Identify areas to improve for next time.'] },
      { t: 'The Right Timing Will Come', p: ["Sometimes it's not about you — it's about timing. A company might freeze hiring, or have an internal candidate. Keep going, your opportunity will come!"] }
    ]}
  ]
};
