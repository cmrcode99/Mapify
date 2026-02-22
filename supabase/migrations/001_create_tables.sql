-- ============================================
-- Mapify: UIUC Campus Classroom Occupancy
-- Migration 001: Core tables, RLS, triggers
-- ============================================

-- Buildings table (seeded separately)
create table public.buildings (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null,
  latitude float8 not null,
  longitude float8 not null,
  address text
);

alter table public.buildings enable row level security;

create policy "Buildings are viewable by everyone"
  on public.buildings for select
  using (true);

create index idx_buildings_code on public.buildings(code);

-- Profiles table
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text,
  email text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)),
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Checkins table
create table public.checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  building_id uuid not null references public.buildings on delete cascade,
  room_number text not null,
  checked_in_at timestamptz not null default now(),
  checked_out_at timestamptz
);

alter table public.checkins enable row level security;

create policy "Checkins are viewable by authenticated users"
  on public.checkins for select
  to authenticated
  using (true);

create policy "Users can insert own checkins"
  on public.checkins for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own checkins"
  on public.checkins for update
  to authenticated
  using (auth.uid() = user_id);

create index idx_checkins_active on public.checkins(building_id)
  where checked_out_at is null;

create index idx_checkins_user_active on public.checkins(user_id)
  where checked_out_at is null;

create index idx_checkins_timestamps on public.checkins(checked_in_at, checked_out_at);

-- Enable realtime on checkins
alter publication supabase_realtime add table public.checkins;

-- RPC: Get active checkin counts per building
create or replace function public.get_active_checkins()
returns table (
  building_id uuid,
  building_name text,
  building_code text,
  latitude float8,
  longitude float8,
  active_count bigint,
  rooms jsonb,
  address text
) as $$
begin
  return query
  select
    b.id as building_id,
    b.name as building_name,
    b.code as building_code,
    b.latitude,
    b.longitude,
    count(c.id) as active_count,
    coalesce(
      jsonb_agg(
        distinct jsonb_build_object('room', c.room_number, 'count',
          (select count(*) from public.checkins c2
           where c2.building_id = b.id
             and c2.room_number = c.room_number
             and c2.checked_out_at is null))
      ) filter (where c.id is not null),
      '[]'::jsonb
    ) as rooms,
    b.address
  from public.buildings b
  left join public.checkins c
    on c.building_id = b.id
    and c.checked_out_at is null
  group by b.id, b.name, b.code, b.latitude, b.longitude, b.address;
end;
$$ language plpgsql security definer;

-- RPC: Get user's active checkin
create or replace function public.get_my_active_checkin()
returns table (
  checkin_id uuid,
  building_id uuid,
  building_name text,
  room_number text,
  checked_in_at timestamptz
) as $$
begin
  return query
  select
    c.id as checkin_id,
    c.building_id,
    b.name as building_name,
    c.room_number,
    c.checked_in_at
  from public.checkins c
  join public.buildings b on b.id = c.building_id
  where c.user_id = auth.uid()
    and c.checked_out_at is null
  limit 1;
end;
$$ language plpgsql security definer;

-- RPC: Check in (auto-checkout previous)
create or replace function public.perform_checkin(
  p_building_id uuid,
  p_room_number text
)
returns uuid as $$
declare
  new_id uuid;
begin
  -- Auto-checkout any active checkin
  update public.checkins
  set checked_out_at = now()
  where user_id = auth.uid()
    and checked_out_at is null;

  -- Create new checkin
  insert into public.checkins (user_id, building_id, room_number)
  values (auth.uid(), p_building_id, p_room_number)
  returning id into new_id;

  return new_id;
end;
$$ language plpgsql security definer;

-- RPC: Check out
create or replace function public.perform_checkout()
returns void as $$
begin
  update public.checkins
  set checked_out_at = now()
  where user_id = auth.uid()
    and checked_out_at is null;
end;
$$ language plpgsql security definer;

-- RPC: Get hourly trends for a building
create or replace function public.get_building_trends(p_building_id uuid)
returns table (
  day_of_week int,
  hour_of_day int,
  avg_count numeric
) as $$
begin
  return query
  select
    extract(dow from c.checked_in_at)::int as day_of_week,
    extract(hour from c.checked_in_at)::int as hour_of_day,
    count(*)::numeric / greatest(1, count(distinct c.checked_in_at::date)) as avg_count
  from public.checkins c
  where c.building_id = p_building_id
  group by 1, 2
  order by 1, 2;
end;
$$ language plpgsql security definer;

-- RPC: Get overall campus trends (top buildings by total checkins)
create or replace function public.get_campus_trends()
returns table (
  building_id uuid,
  building_name text,
  building_code text,
  total_checkins bigint,
  peak_hour int,
  busiest_day int
) as $$
begin
  return query
  select
    b.id as building_id,
    b.name as building_name,
    b.code as building_code,
    count(c.id) as total_checkins,
    (
      select extract(hour from c2.checked_in_at)::int
      from public.checkins c2
      where c2.building_id = b.id
      group by 1
      order by count(*) desc
      limit 1
    ) as peak_hour,
    (
      select extract(dow from c3.checked_in_at)::int
      from public.checkins c3
      where c3.building_id = b.id
      group by 1
      order by count(*) desc
      limit 1
    ) as busiest_day
  from public.buildings b
  left join public.checkins c on c.building_id = b.id
  group by b.id, b.name, b.code
  having count(c.id) > 0
  order by total_checkins desc;
end;
$$ language plpgsql security definer;

-- Auto-checkout stale checkins (older than 3 hours)
-- Run this with pg_cron: SELECT cron.schedule('auto-checkout', '*/30 * * * *', $$SELECT public.auto_checkout_stale()$$);
create or replace function public.auto_checkout_stale()
returns void as $$
begin
  update public.checkins
  set checked_out_at = now()
  where checked_out_at is null
    and checked_in_at < now() - interval '3 hours';
end;
$$ language plpgsql security definer;
