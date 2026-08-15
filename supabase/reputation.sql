-- ALÔ ID 0.3.0 - Reputação e Comunidade
-- Executar no SQL Editor do Supabase.

create table if not exists public.phone_reputation (
  phone_id uuid primary key references public.phone_numbers(id) on delete cascade,
  community_score integer not null default 0 check (community_score between 0 and 100),
  total_reports integer not null default 0 check (total_reports >= 0),
  total_positive integer not null default 0 check (total_positive >= 0),
  total_negative integer not null default 0 check (total_negative >= 0),
  dominant_category text,
  updated_at timestamptz not null default now()
);

alter table public.phone_reputation enable row level security;

drop policy if exists phone_reputation_select_public on public.phone_reputation;
create policy phone_reputation_select_public
on public.phone_reputation
for select
to anon, authenticated
using (true);

alter table public.phone_reports
  drop constraint if exists phone_reports_category_check;

alter table public.phone_reports
  add constraint phone_reports_category_check
  check (
    category in (
      'spam','telemarketing','golpe','cobranca','robocall',
      'pesquisa','entrega','empresa','pessoal','confiavel','outros'
    )
  );

create index if not exists idx_phone_reports_phone_category
  on public.phone_reports(phone_id, category);

create index if not exists idx_phone_reputation_score
  on public.phone_reputation(community_score);

create or replace function public.recalculate_phone_reputation(target_phone_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_total integer := 0;
  v_positive integer := 0;
  v_negative integer := 0;
  v_score integer := 0;
  v_dominant text;
begin
  select count(*) into v_total
  from public.phone_reports
  where phone_id = target_phone_id;

  select count(*) into v_positive
  from public.phone_reports
  where phone_id = target_phone_id
    and category in ('confiavel','empresa','entrega');

  select count(*) into v_negative
  from public.phone_reports
  where phone_id = target_phone_id
    and category in ('spam','telemarketing','golpe','cobranca','robocall');

  select category into v_dominant
  from public.phone_reports
  where phone_id = target_phone_id
  group by category
  order by count(*) desc, category asc
  limit 1;

  if v_total = 0 then
    v_score := 0;
  else
    v_score := greatest(
      0,
      least(
        100,
        round(((v_positive::numeric + 1) / (v_total::numeric + 2)) * 100)
      )
    );
  end if;

  insert into public.phone_reputation (
    phone_id, community_score, total_reports, total_positive,
    total_negative, dominant_category, updated_at
  )
  values (
    target_phone_id, v_score, v_total, v_positive,
    v_negative, v_dominant, now()
  )
  on conflict (phone_id)
  do update set
    community_score = excluded.community_score,
    total_reports = excluded.total_reports,
    total_positive = excluded.total_positive,
    total_negative = excluded.total_negative,
    dominant_category = excluded.dominant_category,
    updated_at = now();
end;
$$;

revoke all on function public.recalculate_phone_reputation(uuid) from public;
grant execute on function public.recalculate_phone_reputation(uuid) to service_role;
