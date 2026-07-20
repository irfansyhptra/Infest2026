-- Row Level Security untuk seluruh tabel aplikasi.
--
-- Aturannya diverifikasi oleh src/libs/scripts/verify-rls.ts (npm run verify:rls),
-- yang login sungguhan sebagai anon / peserta / admin lomba / super admin lalu
-- mengecek apa yang bisa dibaca dan ditulis. Kalau policy di sini diubah,
-- jalankan skrip itu lagi.
--
-- Ringkasnya:
--   anon          : hanya baca tabel competitions (landing page), tanpa tulis.
--   peserta       : profil sendiri + rekan setim, pendaftaran timnya sendiri.
--   admin lomba   : peserta & pendaftaran lombanya saja, tanpa tulis competitions.
--   super admin   : semuanya.
--
-- Semua helper di bawah SECURITY DEFINER. Bukan gaya-gayaan: policy dievaluasi
-- sebagai user pemanggil, jadi policy user_profiles yang membaca user_profiles
-- akan rekursif tanpa batas, dan policy yang membaca admin_users akan terhalang
-- policy admin_users itu sendiri.

begin;

-- ── bersihkan policy lama ────────────────────────────────────────────────────
-- File ini satu-satunya sumber kebenaran RLS untuk kelima tabel di bawah, jadi
-- semua policy yang sudah ada dihapus dulu. Bukan sekadar rapi-rapi: policy
-- sisa yang RESTRICTIVE harus lolos SEMUANYA (yang PERMISSIVE cukup lolos
-- salah satu), jadi satu sisa restrictive dari migrasi lama sanggup menolak
-- semua tulisan di sini tanpa jejak yang jelas.

do $$
declare p record;
begin
  for p in
    select policyname, tablename from pg_policies
    where schemaname = 'public'
      and tablename in ('competitions', 'user_profiles', 'teams',
                        'competition_registrations', 'admin_users')
  loop
    execute format('drop policy %I on public.%I', p.policyname, p.tablename);
  end loop;
end $$;

-- ── helper ───────────────────────────────────────────────────────────────────

create or replace function public.is_super_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from admin_users
    where id = auth.uid() and is_active and role = 'SUPER_ADMIN'
  );
$$;

-- NULL kalau bukan admin, atau admin tanpa lomba (super admin).
create or replace function public.admin_competition()
returns uuid language sql stable security definer set search_path = public as $$
  select admin_competition_id from admin_users
  where id = auth.uid() and is_active;
$$;

create or replace function public.my_team_id()
returns uuid language sql stable security definer set search_path = public as $$
  select team_id from user_profiles where id = auth.uid();
$$;

create or replace function public.am_team_leader()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(
    (select is_team_leader from user_profiles where id = auth.uid()),
    false
  );
$$;

create or replace function public.team_in_competition(p_team uuid, p_comp uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select p_team is not null and p_comp is not null and exists (
    select 1 from competition_registrations
    where team_id = p_team and competition_id = p_comp
  );
$$;

-- ── competitions ─────────────────────────────────────────────────────────────
-- Dibaca publik (daftar lomba di landing page). Nomor rekening pembayaran ada
-- di tabel ini, jadi tulisnya khusus super admin — admin lomba pun tidak boleh.

alter table public.competitions enable row level security;

drop policy if exists competitions_read_all on public.competitions;
create policy competitions_read_all on public.competitions
  for select to anon, authenticated using (true);

drop policy if exists competitions_write_super_admin on public.competitions;
create policy competitions_write_super_admin on public.competitions
  for all to authenticated
  using (public.is_super_admin()) with check (public.is_super_admin());

-- ── user_profiles ────────────────────────────────────────────────────────────
-- Data pribadi peserta (nama, kota, kontak). Terlihat oleh diri sendiri, rekan
-- setim, admin lomba yang timnya terdaftar di lombanya, dan super admin.

alter table public.user_profiles enable row level security;

drop policy if exists user_profiles_read on public.user_profiles;
create policy user_profiles_read on public.user_profiles
  for select to authenticated using (
    id = auth.uid()
    or (team_id is not null and team_id = public.my_team_id())
    or public.is_super_admin()
    or public.team_in_competition(team_id, public.admin_competition())
  );

drop policy if exists user_profiles_insert_self on public.user_profiles;
create policy user_profiles_insert_self on public.user_profiles
  for insert to authenticated with check (id = auth.uid());

-- Ketua tim ikut boleh menulis baris anggotanya: mengeluarkan anggota
-- (team_id -> null) dan mewariskan is_team_leader saat ketua keluar. Karena
-- team_id boleh dikosongkan, WITH CHECK tidak bisa menuntut baris hasil masih
-- setim — cukup pastikan yang menulis memang dirinya sendiri atau ketua.
drop policy if exists user_profiles_update on public.user_profiles;
create policy user_profiles_update on public.user_profiles
  for update to authenticated
  using (
    id = auth.uid()
    or (team_id is not null and team_id = public.my_team_id() and public.am_team_leader())
    or public.is_super_admin()
  )
  with check (
    id = auth.uid()
    or public.am_team_leader()
    or public.is_super_admin()
  );

-- ── teams ────────────────────────────────────────────────────────────────────
-- SELECT sengaja terbuka untuk semua yang sudah login: fitur gabung tim mencari
-- tim lewat kode undangan, jadi peserta harus bisa melihat tim yang belum jadi
-- timnya. Isi tim (anggotanya) tetap terlindungi oleh policy user_profiles.

alter table public.teams enable row level security;

drop policy if exists teams_read_authenticated on public.teams;
create policy teams_read_authenticated on public.teams
  for select to authenticated using (true);

drop policy if exists teams_insert_own on public.teams;
create policy teams_insert_own on public.teams
  for insert to authenticated with check (created_by = auth.uid());

drop policy if exists teams_update_leader on public.teams;
create policy teams_update_leader on public.teams
  for update to authenticated
  using (
    created_by = auth.uid()
    or (id = public.my_team_id() and public.am_team_leader())
    or public.is_super_admin()
  )
  with check (
    created_by = auth.uid()
    or (id = public.my_team_id() and public.am_team_leader())
    or public.is_super_admin()
  );

-- createTeam menghapus timnya sendiri kalau langkah berikutnya gagal.
drop policy if exists teams_delete_own on public.teams;
create policy teams_delete_own on public.teams
  for delete to authenticated
  using (created_by = auth.uid() or public.is_super_admin());

-- ── competition_registrations ────────────────────────────────────────────────
-- Berisi bukti pembayaran. Terlihat oleh timnya sendiri, admin lomba terkait,
-- dan super admin.

alter table public.competition_registrations enable row level security;

drop policy if exists registrations_read on public.competition_registrations;
create policy registrations_read on public.competition_registrations
  for select to authenticated using (
    (team_id is not null and team_id = public.my_team_id())
    or public.is_super_admin()
    or competition_id = public.admin_competition()
  );

drop policy if exists registrations_insert_own_team on public.competition_registrations;
create policy registrations_insert_own_team on public.competition_registrations
  for insert to authenticated
  with check (team_id is not null and team_id = public.my_team_id());

-- Peserta mengunggah ulang bukti bayar; admin lomba mengubah status verifikasi.
drop policy if exists registrations_update on public.competition_registrations;
create policy registrations_update on public.competition_registrations
  for update to authenticated
  using (
    (team_id is not null and team_id = public.my_team_id())
    or public.is_super_admin()
    or competition_id = public.admin_competition()
  )
  with check (
    (team_id is not null and team_id = public.my_team_id())
    or public.is_super_admin()
    or competition_id = public.admin_competition()
  );

drop policy if exists registrations_delete_super_admin on public.competition_registrations;
create policy registrations_delete_super_admin on public.competition_registrations
  for delete to authenticated using (public.is_super_admin());

-- ── admin_users ──────────────────────────────────────────────────────────────
-- Admin lomba hanya boleh melihat barisnya sendiri (daftar akun admin bukan
-- urusannya). Pembuatan/penghapusan akun admin lewat route server dengan
-- service role key, jadi tidak butuh policy tulis di sini.

alter table public.admin_users enable row level security;

drop policy if exists admin_users_read on public.admin_users;
create policy admin_users_read on public.admin_users
  for select to authenticated
  using (id = auth.uid() or public.is_super_admin());

-- ── helper untuk kick member ──────────────────────────────────────────────────
-- Karena sesudah team_id diset ke NULL, baris peserta tidak lagi memenuhi policy
-- SELECT si leader. Jadi update langsung dari client-side PostgREST akan ditolak
-- dengan error RLS. Dengan SECURITY DEFINER, operasi update ini dijalankan dengan
-- hak akses pembuat function (bypassing RLS).
create or replace function public.kick_member(
  p_member_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_leader_id uuid;
  v_leader_team_id uuid;
  v_leader_is_leader boolean;
  v_member_team_id uuid;
  v_member_is_leader boolean;
  v_has_approved boolean;
begin
  -- Ambil ID user yang sedang login
  v_leader_id := auth.uid();
  
  if v_leader_id is null then
    raise exception 'Unauthorized.';
  end if;

  -- 1. Verifikasi data leader
  select team_id, is_team_leader into v_leader_team_id, v_leader_is_leader
  from user_profiles
  where id = v_leader_id;

  if v_leader_team_id is null or not coalesce(v_leader_is_leader, false) then
    raise exception 'Anda tidak memiliki izin untuk mengeluarkan anggota.';
  end if;

  -- 2. Cek apakah tim memiliki pendaftaran yang sudah disetujui (approved)
  select exists (
    select 1 from competition_registrations
    where team_id = v_leader_team_id and status = 'approved'
  ) into v_has_approved;

  if v_has_approved then
    raise exception 'Tim sudah terdaftar untuk kompetisi. Anggota tim tidak dapat dikeluarkan.';
  end if;

  -- 3. Verifikasi data member
  select team_id, is_team_leader into v_member_team_id, v_member_is_leader
  from user_profiles
  where id = p_member_id;

  if v_member_team_id is null or v_member_team_id <> v_leader_team_id then
    raise exception 'Anggota tidak ditemukan dalam tim Anda.';
  end if;

  if coalesce(v_member_is_leader, false) then
    raise exception 'Tidak dapat mengeluarkan leader tim.';
  end if;

  -- 4. Lakukan kick
  update user_profiles
  set team_id = null,
      is_team_leader = false
  where id = p_member_id;
end;
$$;

commit;
