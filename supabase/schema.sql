-- Move Tudo: initial Supabase schema
-- Run this file in Supabase Dashboard > SQL Editor.
-- Never put the Supabase service_role key in frontend code.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  phone text not null default '',
  role text not null default 'client' check (role in ('client', 'driver')),
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'phone', ''),
    case when new.raw_user_meta_data ->> 'role' = 'driver' then 'driver' else 'client' end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Prevent a user from changing their own role from client to driver or vice versa.
create or replace function public.prevent_profile_role_change()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.role is distinct from old.role and coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'Profile role cannot be changed directly';
  end if;
  return new;
end;
$$;

drop trigger if exists protect_profile_role on public.profiles;
create trigger protect_profile_role
  before update on public.profiles
  for each row execute procedure public.prevent_profile_role_change();

create table if not exists public.freight_requests (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id) on delete cascade,
  cargo text not null,
  origin text not null,
  destination text not null,
  distance_km integer not null check (distance_km between 1 and 1000),
  requested_date date not null,
  contact_phone text not null,
  details text not null default '',
  status text not null default 'open' check (status in ('open', 'accepted', 'in_progress', 'completed', 'cancelled')),
  created_at timestamptz not null default now()
);

create table if not exists public.freight_proposals (
  id uuid primary key default gen_random_uuid(),
  freight_request_id uuid not null references public.freight_requests(id) on delete cascade,
  driver_id uuid not null references public.profiles(id) on delete cascade,
  price numeric(10,2) not null check (price > 0),
  message text not null default '',
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected', 'withdrawn')),
  created_at timestamptz not null default now(),
  unique (freight_request_id, driver_id)
);

create index if not exists freight_requests_status_date_idx
  on public.freight_requests (status, requested_date);
create index if not exists freight_requests_client_idx
  on public.freight_requests (client_id);
create index if not exists freight_proposals_request_idx
  on public.freight_proposals (freight_request_id);
create index if not exists freight_proposals_driver_idx
  on public.freight_proposals (driver_id);

alter table public.profiles enable row level security;
alter table public.freight_requests enable row level security;
alter table public.freight_proposals enable row level security;

drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()));

drop policy if exists "Users can update their own contact details" on public.profiles;
create policy "Users can update their own contact details"
  on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

drop policy if exists "Clients can create their own freight requests" on public.freight_requests;
create policy "Clients can create their own freight requests"
  on public.freight_requests for insert to authenticated
  with check (
    client_id = (select auth.uid())
    and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'client')
  );

drop policy if exists "Clients and drivers can view relevant freight requests" on public.freight_requests;
create policy "Clients and drivers can view relevant freight requests"
  on public.freight_requests for select to authenticated
  using (
    client_id = (select auth.uid())
    or (
      status = 'open'
      and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'driver')
    )
  );

drop policy if exists "Clients can cancel their own open requests" on public.freight_requests;
create policy "Clients can cancel their own open requests"
  on public.freight_requests for update to authenticated
  using (client_id = (select auth.uid()) and status = 'open')
  with check (client_id = (select auth.uid()) and status in ('open', 'cancelled'));

drop policy if exists "Clients and drivers can view relevant proposals" on public.freight_proposals;
create policy "Clients and drivers can view relevant proposals"
  on public.freight_proposals for select to authenticated
  using (
    driver_id = (select auth.uid())
    or exists (
      select 1 from public.freight_requests r
      where r.id = freight_request_id and r.client_id = (select auth.uid())
    )
  );

drop policy if exists "Drivers can submit proposals for open requests" on public.freight_proposals;
create policy "Drivers can submit proposals for open requests"
  on public.freight_proposals for insert to authenticated
  with check (
    driver_id = (select auth.uid())
    and exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'driver')
    and exists (select 1 from public.freight_requests r where r.id = freight_request_id and r.status = 'open')
  );

drop policy if exists "Drivers can update their own pending proposals" on public.freight_proposals;
create policy "Drivers can update their own pending proposals"
  on public.freight_proposals for update to authenticated
  using (driver_id = (select auth.uid()) and status = 'pending')
  with check (driver_id = (select auth.uid()) and status in ('pending', 'withdrawn'));
