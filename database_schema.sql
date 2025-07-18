-- PENGGUNA
CREATE TABLE pengguna (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nama_pengguna VARCHAR(50) UNIQUE NOT NULL,
    sandi_hash TEXT NOT NULL,
    peran VARCHAR(20) NOT NULL DEFAULT 'Admin',
    dibuat_pada TIMESTAMP DEFAULT now()
);

-- ROUTER
CREATE TABLE router (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nama VARCHAR(100) NOT NULL,
    alamat_ip VARCHAR(50) NOT NULL,
    lokasi VARCHAR(100),
    status VARCHAR(20),
    dibuat_pada TIMESTAMP DEFAULT now()
);

-- PELANGGAN
CREATE TABLE pelanggan (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nama VARCHAR(100) NOT NULL,
    alamat TEXT,
    telepon VARCHAR(20),
    email VARCHAR(100),
    paket_id uuid REFERENCES paket(id),
    status VARCHAR(20),
    dibuat_pada TIMESTAMP DEFAULT now()
);

-- PAKET
CREATE TABLE paket (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nama VARCHAR(100) NOT NULL,
    kecepatan VARCHAR(50),
    harga NUMERIC(12,2),
    deskripsi TEXT
);

-- VOUCHER
CREATE TABLE voucher (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    kode VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(20) NOT NULL,
    pelanggan_id uuid REFERENCES pelanggan(id),
    dibuat_pada TIMESTAMP DEFAULT now(),
    kadaluarsa TIMESTAMP
);

-- TAGIHAN
CREATE TABLE tagihan (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    pelanggan_id uuid REFERENCES pelanggan(id),
    jumlah NUMERIC(12,2) NOT NULL,
    jatuh_tempo DATE,
    status VARCHAR(20),
    dibuat_pada TIMESTAMP DEFAULT now()
);

-- PEMBAYARAN
CREATE TABLE pembayaran (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tagihan_id uuid REFERENCES tagihan(id),
    jumlah NUMERIC(12,2) NOT NULL,
    tanggal_bayar TIMESTAMP,
    metode VARCHAR(50)
);

-- LOG_AKTIVITAS
CREATE TABLE log_aktivitas (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    pengguna_id uuid REFERENCES pengguna(id),
    aksi VARCHAR(100),
    deskripsi TEXT,
    dibuat_pada TIMESTAMP DEFAULT now()
);

-- TIKET
CREATE TABLE tiket (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    pelanggan_id uuid REFERENCES pelanggan(id),
    subjek VARCHAR(100),
    deskripsi TEXT,
    status VARCHAR(20),
    dibuat_pada TIMESTAMP DEFAULT now()
);

-- SESI
CREATE TABLE sesi (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    router_id uuid REFERENCES router(id),
    pelanggan_id uuid REFERENCES pelanggan(id),
    mulai TIMESTAMP,
    selesai TIMESTAMP,
    status VARCHAR(20)
);

-- NEIGHBOR
CREATE TABLE neighbor (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    router_id uuid REFERENCES router(id),
    nama VARCHAR(100),
    alamat_ip VARCHAR(50),
    alamat_mac VARCHAR(50),
    status VARCHAR(20)
);
