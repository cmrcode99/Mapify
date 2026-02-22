# Mapify - UIUC Campus Classroom Occupancy

Real-time classroom occupancy tracker for UIUC students. See where people are on campus, check into classrooms, and view heatmaps and trends.

## Features

- **Interactive Map** -- Mapbox GL map centered on UIUC campus with building markers
- **Real-time Heatmap** -- Live heatmap overlay showing classroom density (green → yellow → red)
- **Check-in System** -- Search for a building or tap a marker, enter a room number, and check in
- **Live Counts** -- Pin badges show how many people are in each building right now
- **Trends** -- Historical charts showing busiest hours and days for each building
- **Auth** -- Email/password authentication via Supabase

## Tech Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- Mapbox GL JS via react-map-gl
- Supabase (Postgres, Auth, Realtime)
- Recharts for trend visualizations

## Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd mapify
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Run the migration in the SQL editor: copy the contents of `supabase/migrations/001_create_tables.sql`
3. Run the seed data: copy the contents of `supabase/seed.sql`
4. Copy your project URL and anon key from Settings → API

### 3. Set up Mapbox

1. Create an account at [mapbox.com](https://www.mapbox.com)
2. Copy your default public token from Account → Tokens

### 4. Configure environment

```bash
cp .env.example .env.local
```

Fill in your Supabase URL, anon key, and Mapbox token.

### 5. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 6. (Optional) Auto-checkout cron

If you have pg_cron enabled on your Supabase instance, run:

```sql
SELECT cron.schedule('auto-checkout', '*/30 * * * *', $$SELECT public.auto_checkout_stale()$$);
```

This auto-checks out users after 3 hours of inactivity.

## Project Structure

```
src/
  app/           -- Next.js pages (login, signup, main map, trends)
  components/
    auth/        -- Login/signup forms
    checkin/     -- Check-in panel, building search combobox
    map/         -- Map components (markers, heatmap, popup)
    ui/          -- shadcn/ui components
  hooks/         -- Realtime subscriptions, data fetching
  lib/           -- Supabase clients, types, map utilities
supabase/
  migrations/    -- Database schema, RLS policies, RPC functions
  seed.sql       -- UIUC building data (~80 buildings)
```
