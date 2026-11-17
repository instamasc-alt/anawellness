-- Painel do dono. Rode no SQL Editor do Supabase, depois de a conta do dono existir.
-- A pessoa comum continua vendo só o próprio plano. A lista inteira sai pela função, só se o usuário estiver em admins.

create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);

create table if not exists public.training_states (
  user_id uuid primary key references auth.users (id) on delete cascade,
  state jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.admins enable row level security;
alter table public.training_states enable row level security;

drop policy if exists training_states_select_own on public.training_states;
drop policy if exists training_states_insert_own on public.training_states;
drop policy if exists training_states_update_own on public.training_states;

create policy training_states_select_own
  on public.training_states
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy training_states_insert_own
  on public.training_states
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy training_states_update_own
  on public.training_states
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

insert into public.admins (user_id)
select id
from auth.users
where id = '8ab65dfc-7fc6-45ea-ad84-e1d270e34d36'
   or lower(email) = 'conelheiros@gmail.com'
on conflict (user_id) do nothing;

create or replace function public.validator_board()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  result jsonb;
begin
  if not exists (select 1 from public.admins where user_id = auth.uid()) then
    raise exception 'not allowed' using errcode = '42501';
  end if;

  select coalesce(jsonb_agg(item order by item->>'created_at' desc), '[]'::jsonb)
  into result
  from (
    select jsonb_build_object(
      'id', u.id,
      'email', u.email,
      'created_at', u.created_at,
      'confirmed', u.email_confirmed_at is not null,
      'name', coalesce(nullif(u.raw_user_meta_data->>'name', ''), nullif(plan->>'name', ''), ''),
      'onboarded', coalesce(plan->>'onboarded' = 'true', false),
      'gender', plan->>'gender',
      'week', case when coalesce(plan->>'week', '') ~ '^[0-9]+$' then (plan->>'week')::int else 0 end,
      'level', case when coalesce(plan->>'level', '') ~ '^[0-9]+$' then (plan->>'level')::int else 1 end,
      'sessions_done', case when coalesce(plan->>'sessionsDone', '') ~ '^[0-9]+$' then (plan->>'sessionsDone')::int else 0 end,
      'pull', plan->>'pull',
      'last_session', plan->>'lastSessionDate',
      'updated_at', coalesce(t.updated_at, u.created_at)
    ) as item
    from auth.users u
    left join public.training_states t on t.user_id = u.id
    cross join lateral (
      select coalesce(t.state, u.raw_user_meta_data->'plan', '{}'::jsonb) as plan
    ) p
  ) rows;

  return result;
end;
$$;

revoke all on function public.validator_board() from public;
revoke all on function public.validator_board() from anon;
grant execute on function public.validator_board() to authenticated;
