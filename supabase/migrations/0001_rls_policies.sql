-- ============================================================================
-- Row Level Security untuk data peserta, tim, pendaftaran, dan admin.
--
-- Sebelum ini: user_profiles / teams / competition_registrations / competitions
-- bisa DIBACA *dan DITULIS* oleh siapa pun yang punya anon key — dan anon key
-- itu publik, dikirim ke browser setiap pengunjung. Artinya data pribadi
-- peserta terbuka, dan nomor rekening pembayaran di tabel competitions bisa
-- diubah orang luar.
--
-- Aturan yang diterapkan:
--   peserta      -> hanya datanya sendiri + rekan satu tim
--   admin lomba  -> data pribadi peserta HANYA untuk lombanya sendiri
--   super admin  -> semua data + kelola akun admin + ubah data kompetisi
--
-- Idempoten: aman dijalankan ulang.
-- ============================================================================

begin;

-- ── Helper ──────────────────────────────────────────────────────────────────
-- SECURITY DEFINER wajib di sini. Fungsi-fungsi ini dipanggil dari dalam policy
-- yang menempel pada tabel yang mereka baca sendiri (admin_users, user_profiles).
-- Tanpa DEFINER — yang berjalan sebagai pemilik fungsi sehingga melewati RLS —
-- referensi itu menjadi rekursi tak terbatas dan Postgres menolak query-nya.

create or replace function public.app_is_super_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.admin_users
    where id = auth.uid() and is_active and role = 'SUPER_ADMIN'
  );
$$;

-- id kompetisi yang dipegang admin lomba. NULL untuk super admin & non-admin.
create or replace function public.app_admin_competition_id()
returns uuid language sql stable security definer set search_path = public as $$
  select admin_competition_id from public.admin_users
  where id = auth.uid() and is_active and role = 'ADMIN'
  limit 1;
$$;

create or replace function public.app_my_team_id()
returns uuid language sql stable security definer set search_path = public as $$
  select team_id from public.user_profiles where id = auth.uid() limit 1;
$$;

create or replace function public.app_is_team_leader()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(
    (select is_team_leader from public.user_profiles where id = auth.uid() limit 1),
    false
  );
$$;

-- Apakah tim `t` terdaftar di lomba yang dipegang admin yang sedang login.
-- Dibungkus DEFINER supaya policy user_profiles tidak ikut memicu RLS
-- competition_registrations (cascade yang bikin policy sulit dinalar).
create or replace function public.app_team_in_my_competition(t uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select t is not null
     and public.app_admin_competition_id() is not null
     and exists (
       select 1 from public.competition_registrations cr
       where cr.team_id = t
         and cr.competition_id = public.app_admin_competition_id()
     );
$$;

-- Buang policy lama supaya skrip ini idempoten dan tidak menumpuk aturan
-- permisif yang justru membatalkan pembatasan di bawah (policy PERMISSIVE
-- bersifat OR — satu saja yang longgar, semuanya jadi longgar).
do $$
declare r record;
begin
  for r in
    select tablename, policyname from pg_policies
    where schemaname = 'public'
      and tablename in ('user_profiles','teams','competition_registrations',
                        'competitions','admin_users')
  loop
    execute format('drop policy if exists %I on public.%I', r.policyname, r.tablename);
  end loop;
end $$;

alter table public.user_profiles             enable row level security;
alter table public.teams                     enable row level security;
alter table public.competition_registrations enable row level security;
alter table public.competitions              enable row level security;
alter table public.admin_users               enable row level security;

-- ── user_profiles: di sinilah data pribadinya ───────────────────────────────
-- Baca: diri sendiri, rekan satu tim (halaman tim menampilkan anggota),
-- admin lomba terkait, dan super admin.
create policy user_profiles_select on public.user_profiles
for select to authenticated using (
  id = auth.uid()
  or (team_id is not null and team_id = public.app_my_team_id())
  or public.app_is_super_admin()
  or public.app_team_in_my_competition(team_id)
);

-- Daftar akun baru: profil dibuat klien tepat setelah signUp. Project ini
-- auto-confirm, jadi sesi sudah ada dan auth.uid() terisi (sudah diverifikasi).
create policy user_profiles_insert on public.user_profiles
for insert to authenticated with check (id = auth.uid());

-- Ubah: profil sendiri, atau ketua tim mengubah anggotanya (kick / keluar /
-- alih kepemimpinan menulis ke baris user lain). WITH CHECK sengaja tidak
-- menuntut tim tetap sama — kick justru mengosongkan team_id.
create policy user_profiles_update on public.user_profiles
for update to authenticated
using (
  id = auth.uid()
  or public.app_is_super_admin()
  or (team_id is not null and team_id = public.app_my_team_id() and public.app_is_team_leader())
)
with check (
  id = auth.uid()
  or public.app_is_super_admin()
  or public.app_is_team_leader()
);

-- ── teams ───────────────────────────────────────────────────────────────────
-- Baca terbuka untuk yang sudah login: gabung-tim mencari tim lewat kode, jadi
-- user harus bisa membaca tim yang belum ia ikuti. Tabel ini tidak memuat data
-- pribadi. Anon tetap diblokir. (Catatan: ini berarti user login masih bisa
-- meng-enumerasi kode tim; menutupnya perlu ubah joinTeam jadi RPC — lihat
-- catatan tindak lanjut.)
create policy teams_select on public.teams
for select to authenticated using (true);

create policy teams_insert on public.teams
for insert to authenticated with check (created_by = auth.uid());

create policy teams_update on public.teams
for update to authenticated
using (
  created_by = auth.uid()
  or (id = public.app_my_team_id() and public.app_is_team_leader())
  or public.app_is_super_admin()
);

create policy teams_delete on public.teams
for delete to authenticated
using (created_by = auth.uid() or public.app_is_super_admin());

-- ── competition_registrations ───────────────────────────────────────────────
create policy registrations_select on public.competition_registrations
for select to authenticated using (
  team_id = public.app_my_team_id()
  or public.app_is_super_admin()
  or competition_id = public.app_admin_competition_id()
);

create policy registrations_insert on public.competition_registrations
for insert to authenticated with check (team_id = public.app_my_team_id());

-- Peserta mengunggah proposal/orisinalitas/bukti bayar; admin memverifikasi.
create policy registrations_update on public.competition_registrations
for update to authenticated
using (
  team_id = public.app_my_team_id()
  or public.app_is_super_admin()
  or competition_id = public.app_admin_competition_id()
)
with check (
  team_id = public.app_my_team_id()
  or public.app_is_super_admin()
  or competition_id = public.app_admin_competition_id()
);

create policy registrations_delete on public.competition_registrations
for delete to authenticated using (public.app_is_super_admin());

-- ── competitions ────────────────────────────────────────────────────────────
-- Tetap bisa dibaca publik: landing page menampilkannya tanpa login.
-- Tulis: super admin saja — tabel ini memuat nomor rekening pembayaran.
create policy competitions_select on public.competitions
for select to anon, authenticated using (true);

create policy competitions_write on public.competitions
for all to authenticated
using (public.app_is_super_admin())
with check (public.app_is_super_admin());

-- ── admin_users ─────────────────────────────────────────────────────────────
-- Sebelumnya semua user login bisa membaca seluruh daftar admin (bocornya
-- email admin ke peserta biasa). Sekarang: baris sendiri, atau super admin.
create policy admin_users_select on public.admin_users
for select to authenticated
using (id = auth.uid() or public.app_is_super_admin());

create policy admin_users_write on public.admin_users
for all to authenticated
using (public.app_is_super_admin())
with check (public.app_is_super_admin());

commit;

-- ── View ────────────────────────────────────────────────────────────────────
-- View berjalan dengan hak pembuatnya, jadi tanpa ini teams_with_member_count
-- akan melewati policy teams di atas dan tetap terbuka untuk anon.
-- security_invoker butuh Postgres 15+.
do $$
begin
  execute 'alter view public.teams_with_member_count set (security_invoker = on)';
exception when others then
  raise notice 'Gagal set security_invoker (Postgres < 15?): %. Jalankan: revoke all on public.teams_with_member_count from anon;', sqlerrm;
end $$;
