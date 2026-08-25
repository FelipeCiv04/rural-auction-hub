-- =============================================================================
-- 003_bid_atomic_operation.sql
-- Registro atomico de lances com validacao no banco.
-- =============================================================================

begin;

-- Lances somente podem ser criados pela funcao atomica abaixo.
drop policy if exists "bid_history_insert_authenticated" on public.bid_history;

create or replace function public.place_bid(p_lot_id uuid, p_amount numeric)
returns public.bid_history
language plpgsql
security definer
set search_path = public
as $$
declare
  locked_lot public.lots%rowtype;
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

  if not exists (
    select 1 from public.auctions
    where id = locked_lot.auction_id and status = 'ao-vivo'
  ) then
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

revoke all on function public.place_bid(uuid, numeric) from public;
grant execute on function public.place_bid(uuid, numeric) to authenticated;

commit;
