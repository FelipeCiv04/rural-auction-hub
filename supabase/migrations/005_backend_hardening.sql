-- =============================================================================
-- 005_backend_hardening.sql
-- Corrige insercao de perfis, concorrencia de encerramento e valores monetarios.
-- =============================================================================

begin;

-- Um cliente autenticado nunca pode criar o proprio perfil como admin.
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles
  for insert
  with check (id = auth.uid() and role = 'user');

-- Impede novos valores monetarios negativos sem bloquear a aplicacao caso
-- existam registros antigos que precisem ser saneados separadamente.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'lots_increment_nonnegative'
  ) then
    alter table public.lots
      add constraint lots_increment_nonnegative check (increment >= 0) not valid;
  end if;
  if not exists (
    select 1 from pg_constraint where conname = 'lots_current_bid_nonnegative'
  ) then
    alter table public.lots
      add constraint lots_current_bid_nonnegative check (current_bid is null or current_bid >= 0) not valid;
  end if;
  if not exists (
    select 1 from pg_constraint where conname = 'bid_history_amount_positive'
  ) then
    alter table public.bid_history
      add constraint bid_history_amount_positive check (amount > 0) not valid;
  end if;
end;
$$;

-- A verificacao do status e o registro do lance usam o mesmo lock da linha do
-- leilao, evitando aceitar um lance enquanto o admin o encerra.
create or replace function public.place_bid(p_lot_id uuid, p_amount numeric)
returns public.bid_history
language plpgsql
security definer
set search_path = public
as $$
declare
  locked_lot public.lots%rowtype;
  locked_auction public.auctions%rowtype;
  bidder_profile public.profiles%rowtype;
  inserted_bid public.bid_history%rowtype;
  minimum_amount numeric;
begin
  if auth.uid() is null then
    raise exception 'AUTHENTICATION_REQUIRED' using errcode = '42501';
  end if;

  if p_amount is null or p_amount <= 0 then
    raise exception 'INVALID_BID_AMOUNT' using errcode = '22003';
  end if;

  select * into locked_lot
  from public.lots
  where id = p_lot_id
  for update;

  if not found then
    raise exception 'LOT_NOT_FOUND' using errcode = 'P0002';
  end if;

  select * into locked_auction
  from public.auctions
  where id = locked_lot.auction_id
  for update;

  if not found or locked_auction.status <> 'ao-vivo' then
    raise exception 'AUCTION_NOT_OPEN' using errcode = '55000';
  end if;

  minimum_amount := coalesce(locked_lot.current_bid, 0) + coalesce(locked_lot.increment, 0);
  if p_amount < minimum_amount then
    raise exception 'BID_BELOW_MINIMUM:%', minimum_amount using errcode = '22003';
  end if;

  select * into bidder_profile
  from public.profiles
  where id = auth.uid();

  insert into public.bid_history (lot_id, bidder_id, bidder_alias, amount)
  values (
    locked_lot.id,
    auth.uid(),
    coalesce(nullif(bidder_profile.full_name, ''), 'Participante'),
    p_amount
  )
  returning * into inserted_bid;

  update public.lots
  set current_bid = greatest(coalesce(current_bid, 0), p_amount)
  where id = locked_lot.id;

  return inserted_bid;
end;
$$;

commit;
