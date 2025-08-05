const { supabaseHelpers } = require('../config/supabase');

class DatabaseController {
    
    // ===== PELANGGAN MANAGEMENT =====
    
    // Ambil semua pelanggan untuk user yang login
    async getAllPelanggan(req, res) {
        try {
            // Get current user
            const { user, error: userError } = await supabaseHelpers.getCurrentUser();
            if (userError || !user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
            }

            // Get pelanggan data with paket info
            const { data, error } = await supabaseHelpers.getData(
                'pelanggan',
                `
                    *,
                    paket:paket_id(
                        id,
                        nama,
                        kecepatan_download,
                        kecepatan_upload,
                        harga
                    )
                `,
                { pengguna_id: user.id }
            );

            if (error) {
                throw error;
            }

            res.json({
                success: true,
                data: data || [],
                total: data?.length || 0
            });

        } catch (error) {
            console.error('Error fetching pelanggan:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch pelanggan data',
                error: error.message
            });
        }
    }

    // Tambah pelanggan baru
    async addPelanggan(req, res) {
        try {
            const { nama_lengkap, nomor_kontak, email, alamat, paket_id } = req.body;

            // Get current user
            const { user, error: userError } = await supabaseHelpers.getCurrentUser();
            if (userError || !user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
            }

            // Insert pelanggan
            const { data, error } = await supabaseHelpers.insertData('pelanggan', {
                pengguna_id: user.id,
                nama_lengkap,
                nomor_kontak,
                email,
                alamat,
                paket_id,
                status_langganan: 'aktif'
            });

            if (error) {
                throw error;
            }

            res.json({
                success: true,
                message: 'Pelanggan berhasil ditambahkan',
                data: data[0]
            });

        } catch (error) {
            console.error('Error adding pelanggan:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to add pelanggan',
                error: error.message
            });
        }
    }

    // ===== PAKET MANAGEMENT =====
    
    // Ambil semua paket untuk user yang login
    async getAllPaket(req, res) {
        try {
            // Get current user
            const { user, error: userError } = await supabaseHelpers.getCurrentUser();
            if (userError || !user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
            }

            // Get paket data
            const { data, error } = await supabaseHelpers.getData(
                'paket',
                '*',
                { pengguna_id: user.id }
            );

            if (error) {
                throw error;
            }

            res.json({
                success: true,
                data: data || [],
                total: data?.length || 0
            });

        } catch (error) {
            console.error('Error fetching paket:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch paket data',
                error: error.message
            });
        }
    }

    // ===== DATA KEUANGAN =====
    
    // Ambil semua tagihan untuk user yang login
    async getAllTagihan(req, res) {
        try {
            // Get current user
            const { user, error: userError } = await supabaseHelpers.getCurrentUser();
            if (userError || !user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
            }

            // Get tagihan data with pelanggan and paket info
            const { data, error } = await supabaseHelpers.getData(
                'tagihan',
                `
                    *,
                    pelanggan:pelanggan_id(
                        id,
                        nama_lengkap,
                        nomor_kontak
                    ),
                    paket:paket_id(
                        id,
                        nama,
                        harga
                    )
                `,
                { pengguna_id: user.id }
            );

            if (error) {
                throw error;
            }

            res.json({
                success: true,
                data: data || [],
                total: data?.length || 0
            });

        } catch (error) {
            console.error('Error fetching tagihan:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch tagihan data',
                error: error.message
            });
        }
    }

    // Ambil summary keuangan untuk user yang login
    async getKeuanganSummary(req, res) {
        try {
            // Get current user
            const { user, error: userError } = await supabaseHelpers.getCurrentUser();
            if (userError || !user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
            }

            // Get pelanggan count
            const { data: pelanggan, error: pelangganError } = await supabaseHelpers.getData(
                'pelanggan',
                'id',
                { pengguna_id: user.id, status_langganan: 'aktif' }
            );

            // Get total pendapatan from pembayaran
            const { data: pembayaran, error: pembayaranError } = await supabaseHelpers.getData(
                'pembayaran',
                'jumlah',
                { pengguna_id: user.id, status: 'success' }
            );

            // Get tagihan belum lunas
            const { data: tagihan, error: tagihanError } = await supabaseHelpers.getData(
                'tagihan',
                'jumlah',
                { pengguna_id: user.id, status: 'belum_lunas' }
            );

            if (pelangganError || pembayaranError || tagihanError) {
                throw new Error('Error fetching summary data');
            }

            const totalPendapatan = pembayaran?.reduce((sum, p) => sum + parseFloat(p.jumlah), 0) || 0;
            const tagihanBelumLunas = tagihan?.reduce((sum, t) => sum + parseFloat(t.jumlah), 0) || 0;
            const totalPelanggan = pelanggan?.length || 0;
            const pelangganAktif = pelanggan?.length || 0;

            const summary = {
                totalPendapatan,
                tagihanBelumLunas,
                totalPelanggan,
                pelangganAktif,
                rataRataPendapatan: totalPelanggan > 0 ? Math.round(totalPendapatan / totalPelanggan) : 0,
                pertumbuhanBulanan: 15.5 // TODO: Calculate from historical data
            };

            res.json({
                success: true,
                data: summary
            });

        } catch (error) {
            console.error('Error fetching keuangan summary:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch keuangan summary',
                error: error.message
            });
        }
    }

    // ===== PAYMENT GATEWAY =====
    
    // Ambil konfigurasi payment gateway untuk user yang login
    async getPaymentGatewayConfig(req, res) {
        try {
            // Get current user
            const { user, error: userError } = await supabaseHelpers.getCurrentUser();
            if (userError || !user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
            }

            // Get payment gateway config
            const { data, error } = await supabaseHelpers.getData(
                'payment_gateway_config',
                '*',
                { pengguna_id: user.id, status: 'aktif' }
            );

            if (error) {
                throw error;
            }

            res.json({
                success: true,
                data: data || []
            });

        } catch (error) {
            console.error('Error fetching payment gateway config:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch payment gateway config',
                error: error.message
            });
        }
    }

    // Update konfigurasi payment gateway
    async updatePaymentGatewayConfig(req, res) {
        try {
            const { id } = req.params;
            const { nama_gateway, api_key, api_secret, merchant_id, callback_url } = req.body;

            // Get current user
            const { user, error: userError } = await supabaseHelpers.getCurrentUser();
            if (userError || !user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
            }

            // Update payment gateway config
            const { data, error } = await supabaseHelpers.updateData(
                'payment_gateway_config',
                id,
                {
                    nama_gateway,
                    api_key,
                    api_secret,
                    merchant_id,
                    callback_url,
                    diperbarui_pada: new Date().toISOString()
                }
            );

            if (error) {
                throw error;
            }

            res.json({
                success: true,
                message: 'Payment gateway config berhasil diperbarui',
                data: data[0]
            });

        } catch (error) {
            console.error('Error updating payment gateway config:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update payment gateway config',
                error: error.message
            });
        }
    }

    // ===== DASHBOARD COMBINED DATA =====
    
    // Ambil data lengkap untuk dashboard (database + mikrotik)
    async getDashboardData(req, res) {
        try {
            // Get current user
            const { user, error: userError } = await supabaseHelpers.getCurrentUser();
            if (userError || !user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
            }

            // Get database data
            const [pelangganData, paketData, tagihanData, pembayaranData] = await Promise.all([
                supabaseHelpers.getData('pelanggan', 'id', { pengguna_id: user.id }),
                supabaseHelpers.getData('paket', 'id', { pengguna_id: user.id }),
                supabaseHelpers.getData('tagihan', 'id', { pengguna_id: user.id }),
                supabaseHelpers.getData('pembayaran', 'jumlah', { pengguna_id: user.id, status: 'success' })
            ]);

            const dbData = {
                totalPelanggan: pelangganData.data?.length || 0,
                totalPaket: paketData.data?.length || 0,
                totalTagihan: tagihanData.data?.length || 0,
                totalPendapatan: pembayaranData.data?.reduce((sum, p) => sum + parseFloat(p.jumlah), 0) || 0
            };

            // TODO: Get Mikrotik data
            const mikrotikData = {
                activeSessions: 18,
                totalDevices: 25,
                resourceUsage: {
                    'cpu-load': 15,
                    'free-memory': 512000000,
                    'total-memory': 1024000000,
                    'uptime': '5d 12h 30m'
                }
            };

            res.json({
                success: true,
                data: {
                    ...dbData,
                    ...mikrotikData
                }
            });

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch dashboard data',
                error: error.message
            });
        }
    }
}

module.exports = new DatabaseController(); 