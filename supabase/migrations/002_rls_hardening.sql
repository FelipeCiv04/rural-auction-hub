-- =============================================================================
-- 002_rls_hardening.sql
-- Reforço de políticas RLS para prevenir escalonamento de privilégios
-- e evitar ações não autorizadas via cliente.
-- Esta migration adiciona / substitui políticas sem alterar dados.
-- =============================================================================

begin;

-- -----------------------------------------------------------------------------
-- 1) Profiles: impedir que um usuário comum eleve seu próprio `role` para 'admin'
--    - `profiles_update_own_or_admin` passa a ter um `WITH CHECK` que garante
--      que usuários não-admin só possam gravar `role = 'user'`.
-- -----------------------------------------------------------------------------

drop policy if exists "profiles_update_own_or_admin" on public.profiles;

create policy "profiles_update_own_or_admin"
  on public.profiles
  for update
  using (id = auth.uid() or public.is_admin())
  with check (
    -- administradores podem atualizar qualquer campo;
    public.is_admin()
    -- usuários comuns só podem atualizar o próprio perfil e não podem
    -- atribuir a si mesmos o role 'admin'. Se o cliente omitir `role`,
    -- coalesce garante valor seguro 'user'.
    or (id = auth.uid() and coalesce(role, 'user') = 'user')
  );

-- -----------------------------------------------------------------------------
-- 2) bid_history: garantir que um usuário autenticado só crie lance com
--    `bidder_id = auth.uid()` (ou null) — cliente não pode gravar em nome
--    de outro usuário. Somente admins podem atualizar/deletar.
-- -----------------------------------------------------------------------------

drop policy if exists "bid_history_insert_authenticated" on public.bid_history;
create policy "bid_history_insert_authenticated"
  on public.bid_history
  for insert
  with check (
    auth.uid() is not null
    and (bidder_id is null or bidder_id = auth.uid() or public.is_admin())
  );

-- Explicitamente permitir apenas admins para update em bid_history
-- (impede alteração de lances por usuários comuns)

drop policy if exists "bid_history_update_admin" on public.bid_history;
create policy "bid_history_update_admin"
  on public.bid_history
  for update
  using (public.is_admin())
  with check (public.is_admin());

-- As demais políticas existentes (select público, delete admin) são mantidas.

commit;
