# Life Architect App — Setup Guide

Three steps: Supabase (database), Vercel (hosting), then open in Cursor to develop.

---

## Step 1 — Create your Supabase project (5 min)

1. Go to [supabase.com](https://supabase.com) and sign up (free).
2. Click **New project**. Name it `life-architect`. Choose a region close to South Africa (e.g. `eu-west-2` London).
3. Once the project is ready, go to **SQL Editor** (left sidebar).
4. Paste the entire contents of `supabase/schema.sql` into the editor and click **Run**.
5. Go to **Project Settings → API**.
6. Copy the **Project URL** and the **anon public** key.

---

## Step 2 — Configure environment variables

1. In the project root, copy `.env.example` to `.env`:
   ```
   cp .env.example .env
   ```
2. Open `.env` and fill in your values:
   ```
   VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGci...
   ```

---

## Step 3 — Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.
Sign in with your email — you'll get a magic link in your inbox. Click it and you're in.

---

## Step 4 — Deploy to Vercel (so it works on any device)

1. Push this folder to a GitHub repository (public or private).
2. Go to [vercel.com](https://vercel.com) and sign in with GitHub.
3. Click **New Project** → select your repo.
4. In **Environment Variables**, add:
   - `VITE_SUPABASE_URL` → your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` → your anon key
5. Click **Deploy**. Done.

Your app is now live at a `*.vercel.app` URL. Open it on your phone and add it to your home screen (Share → Add to Home Screen on iOS).

---

## Step 5 — Open in Cursor to extend

1. Open Cursor and open this folder as a project.
2. The main files to know:
   - `src/lib/supabase.js` — all data constants (phases, schedule, dates) and DB functions
   - `src/pages/Today.jsx` — the main daily check-in page
   - `src/pages/Journal.jsx` — TSS journal prompts
   - `src/pages/Routine.jsx` — phase ramp and daily schedule
   - `src/pages/Review.jsx` — weekly review
   - `src/pages/Trends.jsx` — charts and insights
   - `src/styles/index.css` — all styling (CSS variables at the top)

3. To change the start date or phases, edit the constants at the top of `src/lib/supabase.js`.

---

## Project structure

```
life-architect-app/
├── index.html
├── package.json
├── vite.config.js
├── .env.example          ← copy to .env and fill in
├── src/
│   ├── main.jsx
│   ├── App.jsx           ← routing + auth
│   ├── lib/
│   │   └── supabase.js   ← data layer + constants
│   ├── styles/
│   │   └── index.css     ← all styling
│   └── pages/
│       ├── Login.jsx
│       ├── Today.jsx     ← daily check-in (main page)
│       ├── Journal.jsx   ← TSS journal prompts
│       ├── Routine.jsx   ← phases + schedule
│       ├── Review.jsx    ← weekly review
│       └── Trends.jsx    ← charts
├── supabase/
│   └── schema.sql        ← run this in Supabase SQL Editor
└── SETUP.md              ← this file
```

---

## Notes

- **Data persistence**: your entries live in Supabase, completely separate from the app code. Updating or redeploying the app never touches your data.
- **Multi-device sync**: any device that opens the same URL and signs in with your email sees the same data.
- **Magic link auth**: no passwords. You enter your email, get a link, click it. Session stays alive for a week.
- **Extending the app**: use Cursor's AI to add features. The codebase is intentionally simple and well-commented.
