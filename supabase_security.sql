-- 1. Aktifkan Row Level Security (RLS) untuk semua tabel sensitif
ALTER TABLE pengguna ENABLE ROW LEVEL SECURITY;
ALTER TABLE pelanggan ENABLE ROW LEVEL SECURITY;
ALTER TABLE router ENABLE ROW LEVEL SECURITY;
ALTER TABLE paket ENABLE ROW LEVEL SECURITY;
ALTER TABLE voucher ENABLE ROW LEVEL SECURITY;
ALTER TABLE tagihan ENABLE ROW LEVEL SECURITY;
ALTER TABLE pembayaran ENABLE ROW LEVEL SECURITY;
ALTER TABLE log_aktivitas ENABLE ROW LEVEL SECURITY;
ALTER TABLE tiket ENABLE ROW LEVEL SECURITY;
ALTER TABLE sesi ENABLE ROW LEVEL SECURITY;
ALTER TABLE neighbor ENABLE ROW LEVEL SECURITY;

-- 2. Policy: Hanya service_role (backend) yang bisa akses (semua operasi)
-- (Policy ini contoh, sesuaikan dengan kebutuhan, misal hanya untuk backend)
CREATE POLICY "Allow service role" ON pengguna
  FOR ALL
  USING (auth.role() = 'service_role');
CREATE POLICY "Allow service role" ON pelanggan
  FOR ALL
  USING (auth.role() = 'service_role');
CREATE POLICY "Allow service role" ON router
  FOR ALL
  USING (auth.role() = 'service_role');
CREATE POLICY "Allow service role" ON paket
  FOR ALL
  USING (auth.role() = 'service_role');
CREATE POLICY "Allow service role" ON voucher
  FOR ALL
  USING (auth.role() = 'service_role');
CREATE POLICY "Allow service role" ON tagihan
  FOR ALL
  USING (auth.role() = 'service_role');
CREATE POLICY "Allow service role" ON pembayaran
  FOR ALL
  USING (auth.role() = 'service_role');
CREATE POLICY "Allow service role" ON log_aktivitas
  FOR ALL
  USING (auth.role() = 'service_role');
CREATE POLICY "Allow service role" ON tiket
  FOR ALL
  USING (auth.role() = 'service_role');
CREATE POLICY "Allow service role" ON sesi
  FOR ALL
  USING (auth.role() = 'service_role');
CREATE POLICY "Allow service role" ON neighbor
  FOR ALL
  USING (auth.role() = 'service_role');

-- 3. Contoh policy hanya user login (authenticated) yang bisa akses data miliknya sendiri
-- (Jika nanti ada fitur multi user, bisa pakai user_id di tabel dan policy seperti ini)
-- CREATE POLICY "User can access own data" ON pelanggan
--   FOR SELECT USING (auth.uid() = user_id);

-- 4. Validasi data dan logging dilakukan di backend (Express.js), bukan di Supabase SQL
-- 5. Jangan expose service_role key ke frontend, hanya gunakan di backend
