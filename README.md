# Catatan Lamaran Kerja — Job Application Tracker

> Rebuild of [job-tracker-work.vercel.app](https://job-tracker-work.vercel.app/) with a [mukhayyar.my.id](https://mukhayyar.my.id/) desk aesthetic.
> Local-first, zero build, zero dependencies. Bilingual (Bahasa Indonesia / English).

## Screenshots

| Desktop | Mobile |
|---|---|
| Desk with post-its, notebook tabs, ruled paper, push pins | Single-column stack, scrollable tabs, touch-friendly dialogs |

## One-line run

No install. Serve the folder as static files:

```bash
python3 -m http.server 8931
# open http://localhost:8931/
```

## Docker

```bash
docker compose up --build -d   # -> http://localhost:8080
PORT=3000 docker compose up --build -d
docker compose down
```

Single-stage `nginx:alpine` image (~15 MB). `nginx.conf` serves `index.html` with `Cache-Control: no-cache` and long-caches `css/js` + gzip. Health check at `/health`.

```bash
docker build -t job-tracker .
docker run -p 8080:80 job-tracker
```

## What this is

- **Tracker:** add/edit/delete applications, quick status change on each card with **Undo**, follow-up detection (≥14 days), live keyword search, status/platform/date-range filters, sortable list (newest/oldest/updated/A–Z/funnel), pagination, filter chips. Data in `localStorage` only.
- **Per-application checklist:** every application gets its own 26-item preparation checklist (documents, online presence, research, interview day, follow-up) with per-app and average progress — open it from the card's `✅ n/26` button or the Checklist tab directory.
- **Job Search (🌐 tab):** search live listings from three free public APIs — [Remotive](https://remotive.com/api/remote-jobs), [Arbeitnow](https://www.arbeitnow.com/api/job-board-api), and [Jobicy](https://jobicy.com/api/v2/remote-jobs) (all key-less, CORS-open). Filter by source, dedupe across sources, and push any listing straight into your tracker with one click (source attribution + job URL preserved in notes).
- **Analytics:** funnel (`Total → Dikirim → Interview → Offer`) with conversion %, 6-month trend bars, platform/status distributions, median salary, response & interview rates.
- **Tips & Tricks:** the original Indonesian tips fully preserved and translated; searchable with expand/collapse all.
- **Backup:** Export JSON (full restore), Export CSV (UTF-8 BOM, Excel-ready, localized headers), Import JSON with **Merge (dedup)** vs **Replace** choice. Auto-migrates legacy `jobApplications` key.
- **i18n:** full Bahasa Indonesia / English toggle (240+ strings, checklist, tips, quotes) — persisted per browser, `lang` attribute and `<title>` follow. Stored data stays canonical, so exports/imports round-trip in either language.
- **Theme:** day/night (desk-lamp) toggle persisted as `jat.theme`; respects `prefers-color-scheme` on first load.
- **Style:** desk (`#d4c9a8`) + ruled notebook (`#fffef9`) + post-its with washi tape + push pins, Caveat + Patrick Hand, pencil cursor that tracks your real cursor tip-first on `pointer: fine` — directly referencing https://mukhayyar.my.id/.

## Files

```
index.html          ~21 KB — structure, dialogs (add/edit, import, delete, checklist), tab system
styles.css          ~35 KB — desk/notebook theme, responsive, day/night, print, reduced-motion
app.js              ~74 KB — logic, ~1,400 lines, 'use strict', no dependencies
i18n.js             ~58 KB — UI_STRINGS (240+ keys), CHECKLIST_I18N, TIPS_I18N, QUOTES_I18N
Dockerfile                 — nginx:alpine static server
nginx.conf                 — cache + gzip + SPA fallback + /health
docker-compose.yml         — ports ${PORT:-8080}:80
wrangler.toml              — Cloudflare Workers static-assets deploy config
```

External requests at runtime: Google Fonts (`Caveat`, `Patrick Hand`) and — only when you click **Search Jobs** — the three job APIs above. Everything else is local.

## Shortcuts

- `Cmd/Ctrl + Enter` — open Add dialog from the tracker.
- `Cmd/Ctrl + K` — focus search.
- `Esc` closes any dialog.

## Storage keys

| Key | Purpose | Value |
|---|---|---|
| `jat.apps.v2` | applications array (each with its own `checklist`) | `App[]` JSON |
| `jat.theme` | day/night | `"day" \| "night"` |
| `jat.lang` | UI language | `"id" \| "en"` |
| `jat.perPage` | pagination | `"10" \| "25" \| "50" \| "all"` |
| `jat.checklist.v2` | *legacy* global checklist | removed on load (superseded by per-app checklists) |
| `jobApplications` | legacy migration source | auto-migrated on first load, then removed |

`App` shape: `{ id, company, position, status, date (YYYY-MM-DD), currency, salaryMin, salaryMax, location, platform, contact, sourceUrl, notes, checklist: Record<string, true>, createdAt, updatedAt }`.

## Deploy

**Cloudflare (Workers static assets — this repo's config):**

```bash
npx wrangler deploy            # local CLI (wrangler.toml included)
```

Or connect the GitHub repo in the Cloudflare dashboard (Workers & Pages → Create → Workers → Connect to Git) with:

```
Build command:    echo build
Deploy command:   npx wrangler deploy
Preview command:  npx wrangler versions upload
```

**Classic Pages** also works: Framework preset = None, Build command empty, Output directory `/`. The hash-routed tabs need no redirect rules.

**Vercel:** Framework preset = Other, Output directory = `.`, Build command = (empty).

**Netlify / GitHub Pages:** publish the repo root; no build step.

## License

[MIT](LICENSE) — © 2025-2026 Muhammad Tsaqif Mukhayyar
