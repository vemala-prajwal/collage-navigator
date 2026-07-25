# Campus Navigation & Feedback Web App

## Architecture summary
- The app now uses Supabase for shared campus data and real-time updates.
- The admin portal is the only place that can create, edit, or delete locations and canteen items.
- Public users can view data and submit feedback.

## Supabase setup
1. Create a Supabase project at https://supabase.com.
2. In the SQL editor, run:

```sql
create extension if not exists "uuid-ossp";

create table if not exists public.locations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  type text not null default 'classroom',
  building text not null,
  floor integer not null default 1,
  description text,
  coordinates jsonb not null default '{"x": 50, "y": 50}'::jsonb,
  status text not null default 'available',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.canteen_items (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  category text not null,
  price numeric not null,
  status text not null default 'available',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.feedback (
  id uuid primary key default uuid_generate_v4(),
  target_type text not null,
  target_id uuid not null,
  rating integer not null check (rating between 1 and 5),
  comment text,
  user_name text not null default 'Anonymous',
  created_at timestamptz not null default now()
);
```

3. Open Project Settings → API and copy the Project URL and anon/public key.
4. Create a client environment file:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

5. Start the app:

```bash
npm install
npm run dev
```

## Admin editing rules
- Only the admin portal can create, update, or delete content.
- Public users can view locations, canteen items, and submit feedback.
- Supabase Realtime keeps the admin and public views in sync without manual refresh.

## Verification
- npm --prefix client run build
