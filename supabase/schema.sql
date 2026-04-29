-- ============================================================
-- SAJ AL-REEF — Supabase Schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- Menu items
create table if not exists menu_items (
  id        bigint primary key generated always as identity,
  name      text    not null,
  description text,
  price     integer not null default 0,
  category  text    not null default 'm',
  emoji     text    default '🍽️',
  hot       boolean default false
);

-- Orders
create table if not exists orders (
  id         text    primary key,
  table_ref  text    not null default 'T1',
  items      text    not null,
  time       text    not null,
  status     text    not null default 'new',
  created_at timestamptz default now()
);

-- Smart-call alerts
create table if not exists alerts (
  id         bigint  primary key generated always as identity,
  table_ref  text    not null,
  type       text    not null,
  emoji      text    default '👨‍🍽️',
  time       text    not null,
  created_at timestamptz default now()
);

-- Reservations
create table if not exists reservations (
  id        bigint primary key generated always as identity,
  time      text   not null,
  table_ref text   not null,
  name      text   not null,
  confirmed boolean default false
);

-- Waiter queue
create table if not exists queue (
  id        text primary key,
  table_ref text not null,
  items     text not null,
  waiter    text not null,
  status    text not null default 'assigned'
);

-- Restaurant floor tables
create table if not exists restaurant_tables (
  n      integer primary key,
  status text    not null default 'f'
);

-- Offers / promotions
create table if not exists offers (
  id          bigint primary key generated always as identity,
  title       text   not null,
  description text,
  active      boolean default true
);

-- Admin notifications feed
create table if not exists notifications (
  id         bigint primary key generated always as identity,
  table_ref  text   not null,
  message    text   not null,
  time       text   not null,
  color      text   not null default '#DCA95C',
  created_at timestamptz default now()
);

-- ── Enable Realtime ──────────────────────────────────────────
alter publication supabase_realtime add table orders;
alter publication supabase_realtime add table alerts;
alter publication supabase_realtime add table restaurant_tables;
alter publication supabase_realtime add table offers;
alter publication supabase_realtime add table notifications;

-- ── Row Level Security (permissive for anon — restaurant kiosk) ──
alter table menu_items         enable row level security;
alter table orders             enable row level security;
alter table alerts             enable row level security;
alter table reservations       enable row level security;
alter table queue              enable row level security;
alter table restaurant_tables  enable row level security;
alter table offers             enable row level security;
alter table notifications      enable row level security;

create policy "public read-write" on menu_items        for all to anon using (true) with check (true);
create policy "public read-write" on orders            for all to anon using (true) with check (true);
create policy "public read-write" on alerts            for all to anon using (true) with check (true);
create policy "public read-write" on reservations      for all to anon using (true) with check (true);
create policy "public read-write" on queue             for all to anon using (true) with check (true);
create policy "public read-write" on restaurant_tables for all to anon using (true) with check (true);
create policy "public read-write" on offers            for all to anon using (true) with check (true);
create policy "public read-write" on notifications     for all to anon using (true) with check (true);
