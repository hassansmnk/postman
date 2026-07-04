# The Post-Date Debrief

A mobile-first vibe quiz built with **Vite**, **Vanilla JavaScript (ES Modules)**, and **Supabase**. Twenty questions, three rounds, one legally non-binding verdict.

![v1.0 — no science](https://img.shields.io/badge/v1.0-no%20science-CBB8FF)

## Features

- Exact UI preserved from the original single-file HTML (layout, colors, fonts, animations)
- Supabase persistence for every submission (answers, scores, verdict, checklist, metadata)
- Autosave to `localStorage` + debounced Supabase draft sync
- Resume after refresh (local first, Supabase fallback)
- Duplicate submission prevention per session
- Loading / error status toast (non-intrusive overlay)
- GitHub Pages deployment via GitHub Actions

## Project structure

```
post-date-debrief/
├── index.html
├── package.json
├── vite.config.js
├── .env.example
├── .github/workflows/deploy.yml
├── supabase/schema.sql
├── public/
└── src/
    ├── css/styles.css
    └── js/
        ├── main.js
        ├── quiz.js
        ├── questions.js
        ├── storage.js
        ├── supabase-client.js
        └── submission.js
```

## Quick start

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/post-date-debrief.git
cd post-date-debrief
npm install
```

### 2. Configure Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** and run the full script in [`supabase/schema.sql`](supabase/schema.sql).
3. Copy `.env.example` to `.env`:

   ```bash
   cp .env.example .env
   ```

4. Fill in your credentials from **Project Settings → API**:

   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### 4. Build for production

```bash
npm run build
npm run preview
```

## Supabase data model

Each row in `debrief_submissions` stores:

| Column | Description |
|--------|-------------|
| `session_id` | Unique browser session UUID |
| `answers` | JSON array of selected option indices (0=A, 1=B, 2=C) |
| `scores` | `{ "A": n, "B": n, "C": n }` counts |
| `verdict_key` | `"A"`, `"B"`, or `"C"` |
| `verdict_title` / `verdict_body` | Final verdict copy |
| `checklist_choice` | Selected “signature” option on results screen |
| `current_question` | Last viewed question index (for drafts) |
| `completed` | `true` after final verdict |
| `metadata` | User agent, viewport, timezone, referrer, etc. |
| `submitted_at` | ISO timestamp when quiz was completed |

Row Level Security allows anonymous insert/update/select for public quiz use. See comments in `schema.sql` for production hardening options.

## GitHub Pages deployment

1. Push this repo to GitHub as `post-date-debrief` (or update `base` in `vite.config.js` to match your repo name).
2. Go to **Settings → Pages → Build and deployment** and select **GitHub Actions**.
3. Add repository secrets:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Push to `main` — the workflow in [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) builds and deploys automatically.

Your site will be live at:

```
https://YOUR_USERNAME.github.io/post-date-debrief/
```

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | Yes (for sync) | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes (for sync) | Supabase anonymous/public key |
| `GITHUB_PAGES` | CI only | Set to `true` during Pages build for correct asset paths |

Without Supabase credentials the quiz runs fully offline with local autosave only.

## License

MIT — use responsibly, peer-review optional.
