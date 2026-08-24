-- =============================================================================
-- Rural Auction Hub — Schema Inicial
-- =============================================================================
-- Execute este script no Supabase SQL Editor ou via CLI (supabase db push).
-- Compatível com Supabase (PostgreSQL 15+).
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 0. Funções auxiliares
-- ---------------------------------------------------------------------------

-- Trigger genérico para atualizar updated_at
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Função para verificar se o usuário atual é admin
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

-- ---------------------------------------------------------------------------
-- 1. profiles (vinculado ao auth.users)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text        not null default '',
  document    text,
  phone       text,
  role        text        not null default 'user'
                          check (role in ('user', 'admin')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table  public.profiles            is 'Perfil público do usuário, vinculado ao auth.users.';
comment on column public.profiles.document   is 'CPF ou CNPJ do usuário.';
comment on column public.profiles.role       is 'Papel do usuário: user ou admin.';

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at();

-- ---------------------------------------------------------------------------
-- 2. auctions (leilões)
-- ---------------------------------------------------------------------------
create table public.auctions (
  id          uuid primary key default gen_random_uuid(),
  code        text unique not null,
  title       text        not null,
  status      text        not null default 'agendado'
                          check (status in ('ao-vivo', 'agendado', 'encerrado')),
  starts_at   timestamptz not null,
  location    text        not null default '',
  offer       text        not null default '',
  promoter    text        not null default '',
  cover_url   text,
  summary     text        not null default '',
  terms       text[]      not null default '{}',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table  public.auctions          is 'Leilões cadastrados na plataforma.';
comment on column public.auctions.code     is 'Código visual do leilão (ex: 42).';
comment on column public.auctions.status   is 'Estado atual: ao-vivo, agendado ou encerrado.';
comment on column public.auctions.terms    is 'Condições de venda do leilão (array de texto).';

create index idx_auctions_status on public.auctions(status);

create trigger auctions_updated_at
  before update on public.auctions
  for each row execute function public.update_updated_at();

-- ---------------------------------------------------------------------------
-- 3. lots (lotes)
-- ---------------------------------------------------------------------------
create table public.lots (
  id           uuid primary key default gen_random_uuid(),
  auction_id   uuid        not null references public.auctions(id) on delete cascade,
  number       text        not null,
  title        text        not null,
  category     text        not null default 'comercial'
                           check (category in ('elite', 'comercial', 'imovel')),
  image_url    text,
  current_bid  numeric,
  bid_label    text        not null default 'Lance Atual',
  increment    numeric     not null default 0,
  description  text        not null default '',
  seller       text        not null default '',
  is_featured  boolean     not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

comment on table  public.lots              is 'Lotes oferecidos em cada leilão.';
comment on column public.lots.auction_id   is 'FK para o leilão ao qual este lote pertence.';
comment on column public.lots.category     is 'Categoria: elite, comercial ou imovel.';
comment on column public.lots.is_featured  is 'Lote em destaque na página inicial.';

create index idx_lots_auction_id on public.lots(auction_id);
create index idx_lots_category   on public.lots(category);
create index idx_lots_featured   on public.lots(is_featured) where is_featured = true;

create trigger lots_updated_at
  before update on public.lots
  for each row execute function public.update_updated_at();

-- ---------------------------------------------------------------------------
-- 4. lot_specs (especificações técnicas de cada lote)
-- ---------------------------------------------------------------------------
create table public.lot_specs (
  id         uuid primary key default gen_random_uuid(),
  lot_id     uuid not null references public.lots(id) on delete cascade,
  label      text not null,
  value      text not null,
  sort_order int  not null default 0
);

comment on table public.lot_specs is 'Especificações técnicas de um lote (raça, peso, etc.).';

create index idx_lot_specs_lot_id on public.lot_specs(lot_id);

-- ---------------------------------------------------------------------------
-- 5. lot_images (imagens adicionais de lotes)
-- ---------------------------------------------------------------------------
create table public.lot_images (
  id         uuid primary key default gen_random_uuid(),
  lot_id     uuid not null references public.lots(id) on delete cascade,
  url        text not null,
  alt        text,
  sort_order int  not null default 0
);

comment on table public.lot_images is 'Galeria de imagens adicionais de um lote.';

create index idx_lot_images_lot_id on public.lot_images(lot_id);

-- ---------------------------------------------------------------------------
-- 6. bid_history (histórico de lances)
-- ---------------------------------------------------------------------------
create table public.bid_history (
  id            uuid primary key default gen_random_uuid(),
  lot_id        uuid        not null references public.lots(id) on delete cascade,
  bidder_id     uuid        references public.profiles(id),
  bidder_alias  text        not null,
  amount        numeric     not null,
  created_at    timestamptz not null default now()
);

comment on table  public.bid_history             is 'Registro de lances realizados em cada lote.';
comment on column public.bid_history.bidder_id    is 'FK opcional para o perfil do arrematante (null = anônimo/legado).';
comment on column public.bid_history.bidder_alias is 'Nome público do arrematante (ex: Comprador 214).';

create index idx_bid_history_lot_id  on public.bid_history(lot_id);
create index idx_bid_history_bidder  on public.bid_history(bidder_id);

-- =============================================================================
-- 7. Row Level Security (RLS)
-- =============================================================================

-- Habilitar RLS em todas as tabelas
alter table public.profiles    enable row level security;
alter table public.auctions    enable row level security;
alter table public.lots        enable row level security;
alter table public.lot_specs   enable row level security;
alter table public.lot_images  enable row level security;
alter table public.bid_history enable row level security;

-- -------------------------
-- profiles
-- -------------------------
create policy "profiles_select_own_or_admin"
  on public.profiles for select
  using (id = auth.uid() or public.is_admin());

create policy "profiles_update_own_or_admin"
  on public.profiles for update
  using (id = auth.uid() or public.is_admin());

-- Insert é feito via trigger/function do auth, não pelo frontend diretamente.
-- Se necessário, habilite uma policy de insert para o próprio usuário:
create policy "profiles_insert_own"
  on public.profiles for insert
  with check (id = auth.uid());

-- -------------------------
-- auctions (leitura pública, escrita admin)
-- -------------------------
create policy "auctions_select_public"
  on public.auctions for select
  using (true);

create policy "auctions_insert_admin"
  on public.auctions for insert
  with check (public.is_admin());

create policy "auctions_update_admin"
  on public.auctions for update
  using (public.is_admin());

create policy "auctions_delete_admin"
  on public.auctions for delete
  using (public.is_admin());

-- -------------------------
-- lots (leitura pública, escrita admin)
-- -------------------------
create policy "lots_select_public"
  on public.lots for select
  using (true);

create policy "lots_insert_admin"
  on public.lots for insert
  with check (public.is_admin());

create policy "lots_update_admin"
  on public.lots for update
  using (public.is_admin());

create policy "lots_delete_admin"
  on public.lots for delete
  using (public.is_admin());

-- -------------------------
-- lot_specs (leitura pública, escrita admin)
-- -------------------------
create policy "lot_specs_select_public"
  on public.lot_specs for select
  using (true);

create policy "lot_specs_insert_admin"
  on public.lot_specs for insert
  with check (public.is_admin());

create policy "lot_specs_update_admin"
  on public.lot_specs for update
  using (public.is_admin());

create policy "lot_specs_delete_admin"
  on public.lot_specs for delete
  using (public.is_admin());

-- -------------------------
-- lot_images (leitura pública, escrita admin)
-- -------------------------
create policy "lot_images_select_public"
  on public.lot_images for select
  using (true);

create policy "lot_images_insert_admin"
  on public.lot_images for insert
  with check (public.is_admin());

create policy "lot_images_update_admin"
  on public.lot_images for update
  using (public.is_admin());

create policy "lot_images_delete_admin"
  on public.lot_images for delete
  using (public.is_admin());

-- -------------------------
-- bid_history (leitura pública, insert por autenticado, delete admin)
-- -------------------------
create policy "bid_history_select_public"
  on public.bid_history for select
  using (true);

create policy "bid_history_insert_authenticated"
  on public.bid_history for insert
  with check (auth.uid() is not null);

create policy "bid_history_delete_admin"
  on public.bid_history for delete
  using (public.is_admin());

-- =============================================================================
-- 8. Trigger para criar perfil automaticamente ao registrar usuário
-- =============================================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
