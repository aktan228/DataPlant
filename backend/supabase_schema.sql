create table if not exists public.scans (
  id uuid primary key default gen_random_uuid(),
  crop text not null,
  disease_name text not null,
  confidence integer not null check (confidence >= 0 and confidence <= 100),
  severity text not null check (severity in ('Low', 'Moderate', 'High')),
  recommendation text,
  reco_description text,
  reco_timing text,
  action_required text,
  priority text check (priority in ('Low', 'Medium', 'High')),
  source text not null default 'cloud',
  synced boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.scans enable row level security;

drop policy if exists "Backend service role can manage scans" on public.scans;
create policy "Backend service role can manage scans"
on public.scans
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');
