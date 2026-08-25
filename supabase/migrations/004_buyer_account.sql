-- =============================================================================
-- 004_buyer_account.sql
-- Favoritos e consultas privadas da area do comprador.
-- =============================================================================

begin;

create table if not exists public.lot_favorites (
  user_id    uuid not null references public.profiles(id) on delete cascade,
  lot_id     uuid not null references public.lots(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, lot_id)
);

create index if not exists idx_lot_favorites_lot_id on public.lot_favorites(lot_id);

alter table public.lot_favorites enable row level security;

 drop policy if exists "lot_favorites_select_own" on public.lot_favorites;
create policy "lot_favorites_select_own"
  on public.lot_favorites for select
  using (user_id = auth.uid());

 drop policy if exists "lot_favorites_insert_own" on public.lot_favorites;
create policy "lot_favorites_insert_own"
  on public.lot_favorites for insert
  with check (user_id = auth.uid());

 drop policy if exists "lot_favorites_delete_own" on public.lot_favorites;
create policy "lot_favorites_delete_own"
  on public.lot_favorites for delete
  using (user_id = auth.uid());

commit;
