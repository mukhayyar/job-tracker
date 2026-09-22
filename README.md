# Catatan Lamaran Kerja — Job Application Tracker

> Rebuild of [job-tracker-work.vercel.app](https://job-tracker-work.vercel.app/) with a [mukhayyar.my.id](https://mukhayyar.my.id/) desk aesthetic.
> Local-first, zero build, zero dependencies.
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

- Tracker: add/edit/delete applications, quick status change on each card with **Undo**, follow-up detection (≥14 days), live keyword search, status/platform/date-range filters, sortable list (terbaru/terlama/updated/A–Z/funnel), pagination, filter chips. Data in `localStorage` only.
- Checklist: 26-item preparation checklist with per-category and global progress, persisted as `jat.checklist.v2`.
- Analytics: funnel (`Total → Dikirim → Interview → Offer`) with conversion %, 6-month trend bars, platform/status distributions, median salary, response & interview rates.
- Tips & Tricks: all original Indonesian tips preserved; searchable with expand/collapse all.
- Backup: Export JSON (full restore), Export CSV (UTF-8 BOM, Excel-ready), Import JSON with **Merge (dedup)** vs **Replace** choice. Auto-migrates legacy `jobApplications` key.
- Theme: day/night (desk-lamp) toggle persisted as `jat.theme`; respects `prefers-color-scheme` on first load.
- Style: desk (`#d4c9a8`) + ruled notebook (`#fffef9`) + post-its with washi tape + push pins, Caveat + Patrick Hand, pencil cursor on `pointer: fine` — directly referencing https://mukhayyar.my.id/.

## Files

```
index.html          ~16 KB — structure, dialogs (add/edit, import, delete), tab system
styles.css          ~33 KB — desk/notebook theme, responsive, day/night, print, reduced-motion
app.js              ~70 KB — logic, ~1,200 lines, 'use strict', no dependencies
Dockerfile                 — nginx:alpine static server
nginx.conf                 — cache + gzip + SPA fallback + /health
docker-compose.yml         — ports ${PORT:-8080}:80
```

External requests at runtime: Google Fonts (`Caveat`, `Patrick Hand`) only. Everything else is local. Fonts can be self-hosted by vendoring `styles.css`'s `@import` if offline is required.

## Shortcuts

- `Cmd/Ctrl + Enter` — open Add dialog from the tracker.
- `Cmd/Ctrl + K` — focus search.
- `Esc` closes any dialog.

## Storage keys

| Key | Purpose | Value |
|---|---|---|
| `jat.apps.v2` | applications array | `App[]` JSON |
| `jat.checklist.v2` | checklist ticks | `Record<string, boolean>` |
| `jat.theme` | day/night | `"day" \| "night"` |
| `jat.perPage` | pagination | `"10" \| "25" \| "50" \| "all"` |
| `jobApplications` | legacy migration source | auto-migrated on first load, then removed |

`App` shape: `{ id, company, position, status, date (YYYY-MM-DD), currency, salaryMin, salaryMax, location, platform, contact, sourceUrl, notes, createdAt, updatedAt }`.

## Deploy

**Cloudflare Pages (recommended):**

```bash
# via Wrangler
npx wrangler pages deploy . --project-name=job-tracker
# or: connect the GitHub repo at dash.cloudflare.com → Pages → Create → Connect to Git
# Build settings: Framework preset = None, Build command = (empty), Output directory = /
```

No build step — the repo root is the output. All four tabs are hash-routed, so no redirect rules needed. The `Dockerfile` is ignored by Pages (only used for self-hosting).

**Vercel:** Framework preset = Other, Output directory = `.`, Build command = (empty).

**Netlify / GitHub Pages:** publish the repo root; no build step.
