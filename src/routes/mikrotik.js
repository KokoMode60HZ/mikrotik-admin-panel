const express = require('express');
const router = express.Router();
const MikroTikController = require('../controllers/mikrotikController');

// ===== SESSION MANAGEMENT ROUTES =====

// GET /api/mikrotik/sessions - Ambil semua session aktif
router.get('/sessions', MikroTikController.getSessionData);

// POST /api/mikrotik/sessions/:sessionId/disconnect - Disconnect session
router.post('/sessions/:sessionId/disconnect', MikroTikController.disconnectSession);

// ===== NETWORK NEIGHBORS ROUTES =====

// GET /api/mikrotik/devices - Ambil semua perangkat yang terhubung
router.get('/devices', MikroTikController.getNetworkDevices);

// ===== DASHBOARD ROUTES =====

// GET /api/mikrotik/dashboard - Ambil data lengkap untuk dashboard
router.get('/dashboard', MikroTikController.getDashboardData);

// ===== ROUTER STATUS ROUTES =====

// GET /api/mikrotik/router/status - Ambil status router
router.get('/router/status', MikroTikController.getRouterStatus);

// GET /api/mikrotik/router/traffic/:interfaceName - Ambil traffic interface
router.get('/router/traffic/:interfaceName', MikroTikController.getInterfaceTraffic);

module.exports = router; 