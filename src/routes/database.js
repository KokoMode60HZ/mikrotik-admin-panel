const express = require('express');
const router = express.Router();
const DatabaseController = require('../controllers/databaseController');

// ===== PELANGGAN ROUTES =====

// GET /api/database/pelanggan - Ambil semua pelanggan
router.get('/pelanggan', DatabaseController.getAllPelanggan);

// POST /api/database/pelanggan - Tambah pelanggan baru
router.post('/pelanggan', DatabaseController.addPelanggan);

// ===== PAKET ROUTES =====

// GET /api/database/paket - Ambil semua paket
router.get('/paket', DatabaseController.getAllPaket);

// ===== KEUANGAN ROUTES =====

// GET /api/database/tagihan - Ambil semua tagihan
router.get('/tagihan', DatabaseController.getAllTagihan);

// GET /api/database/keuangan/summary - Ambil summary keuangan
router.get('/keuangan/summary', DatabaseController.getKeuanganSummary);

// ===== PAYMENT GATEWAY ROUTES =====

// GET /api/database/payment-gateway - Ambil konfigurasi payment gateway
router.get('/payment-gateway', DatabaseController.getPaymentGatewayConfig);

// PUT /api/database/payment-gateway/:id - Update konfigurasi payment gateway
router.put('/payment-gateway/:id', DatabaseController.updatePaymentGatewayConfig);

// ===== DASHBOARD ROUTES =====

// GET /api/database/dashboard - Ambil data dashboard (database + mikrotik)
router.get('/dashboard', DatabaseController.getDashboardData);

module.exports = router; 