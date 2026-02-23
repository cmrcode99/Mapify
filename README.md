# Mapify - UIUC Campus Occupancy Intelligence

Mapify is a real-time campus occupancy platform for UIUC students. It combines live check-ins, map visualization, trend analytics, room recommendations, and an interactive 3D building viewer.

## Features

- **Interactive campus map** with live building markers and occupancy badges.
- **Heatmap mode** for fast visual scanning of crowded vs low-traffic zones.
- **Check-in flow** to claim a building/room and update availability in real time.
- **Recommended rooms** ranked by blended availability + energy-efficiency scoring.
- **3D building viewer (ECEB)** with room-level status (`available` vs `in-use`), floor toggles, and room detail panels.
- **Class schedule overlay** used with check-ins to infer room usage in the 3D viewer.
- **Trends dashboard** with occupancy patterns and recommendations.
- **Authentication** via Supabase email/password auth.
- **Foot-traffic enrichment** via BestTime API with deterministic synthetic fallback.
- **Synthetic occupancy fallback** so maps remain useful even when live check-in data is sparse.

## Tech Stack

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript
- **UI:** Tailwind CSS 4, shadcn/ui, Lucide icons
- **Maps:** Mapbox GL JS (`react-map-gl`)
- **3D:** Three.js
- **Backend:** Supabase (Postgres, Auth, Realtime, RPC, RLS)
- **Charts:** Recharts

## Prerequisites

- Node.js 18+ (Node.js 20 recommended)
- npm
- A Supabase project
- A Mapbox access token

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Run `supabase/migrations/001_create_tables.sql` in the SQL editor.
3. Run `supabase/seed.sql` to insert building data.
4. Copy your project URL and anon key from **Settings > API**.

### 3. Configure Mapbox

1. Create an account at [mapbox.com](https://www.mapbox.com).
2. Copy a public token from **Account > Tokens**.

### 4. Configure environment variables

Create `.env.local` in the project root:

```bash
cat > .env.local <<'EOF'
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
BESTTIME_API_KEY=your_besttime_private_key
EOF
```

Notes:
- `BESTTIME_API_KEY` is optional. If omitted, the app uses deterministic synthetic foot-traffic data.
- Do not commit real credentials.

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 6. (Optional) Configure stale check-in auto-checkout

If `pg_cron` is enabled on your Supabase instance:

```sql
SELECT cron.schedule('auto-checkout', '*/30 * * * *', $$SELECT public.auto_checkout_stale()$$);
```

This calls `auto_checkout_stale()` every 30 minutes and checks out sessions older than 3 hours.

## Data and Realtime Model

- `buildings`: campus building metadata (name/code/lat/lng/address).
- `profiles`: user profile rows linked to `auth.users` (auto-created by trigger).
- `checkins`: user check-ins with `checked_in_at` and nullable `checked_out_at`.
- Realtime updates come from `checkins` via Supabase Realtime subscriptions.
- RLS ensures users can only insert/update their own profile/check-ins.

## Floor Plan Pipeline (ECEB + SC)

The repository includes scripts that transform floor grid data into room-level assets:

- Region extraction via flood-fill (`scripts/identify-rooms*.mjs`).
- Room mapping and room ID grids (`scripts/generate-room-map*.mjs`).
- Generated artifacts in `public/`:
  - `room-map.json`, `room-ids.json`
  - `room-map-sc.json`, `room-ids-sc.json`
  - `floors.json`, `floors-sc.json`

These assets power clickable room rendering and room labels in the 3D viewer.

## Project Structure

```text
src/
  app/
    page.tsx                  # main authenticated map dashboard
    trends/page.tsx           # trends analytics dashboard
    recommended/page.tsx      # recommendation dashboard
    api/floors/route.ts       # floor data endpoint
    api/foot-traffic/route.ts # BestTime + synthetic fallback endpoint
  components/
    map/                      # map layers, markers, popups, charts
    checkin/                  # check-in UI and building search
    building-viewer/          # Three.js 3D viewer + room details
    recommended/              # ranking logic + recommendation UI
    auth/                     # login/signup forms
  hooks/                      # Supabase data and realtime hooks
  lib/                        # shared types, schedules, synthetic occupancy, helpers
scripts/                      # floor/room generation tooling
supabase/
  migrations/                # schema, RLS policies, RPC functions
  seed.sql                   # UIUC building seed data
public/
  floors*.json               # floor geometry for 3D viewer
  room-map*.json             # room metadata
  room-ids*.json             # per-cell room lookup grids
```
