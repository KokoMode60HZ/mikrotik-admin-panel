const MikroTikApi = require('../utils/mikrotikApi');

class MikroTikController {
    
    // ===== SESSION MANAGEMENT =====
    
    // Ambil data session dari Mikrotik dan gabungkan dengan data pelanggan dari database
    async getSessionData(req, res) {
        try {
            // Ambil data dari Mikrotik
            const mikrotikSessions = await MikroTikApi.getSessionWithIpInfo();
            
            // TODO: Ambil data pelanggan dari database berdasarkan username
            // const customers = await db.query('SELECT * FROM pelanggan WHERE pengguna_id = $1', [req.user.id]);
            
            // Gabungkan data
            const sessionsWithCustomerInfo = mikrotikSessions.map(session => {
                // TODO: Match dengan data pelanggan dari database
                const customer = {
                    nama_lengkap: session.name, // Temporary, should match with database
                    paket: 'Paket Basic' // Temporary
                };
                
                return {
                    id: session.id,
                    customerName: customer.nama_lengkap,
                    username: session.name,
                    ipAddress: session.ipAddress,
                    macAddress: session.macAddress,
                    router: 'Router-001', // TODO: Get from database
                    startTime: session['uptime'],
                    duration: session['uptime'],
                    upload: session['bytes-in'] || 0,
                    download: session['bytes-out'] || 0,
                    status: session.running ? 'Aktif' : 'Disconnected',
                    package: customer.paket
                };
            });
            
            res.json({
                success: true,
                data: sessionsWithCustomerInfo,
                total: sessionsWithCustomerInfo.length
            });
            
        } catch (error) {
            console.error('Error fetching session data:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch session data',
                error: error.message
            });
        }
    }
    
    // Disconnect session
    async disconnectSession(req, res) {
        try {
            const { sessionId } = req.params;
            await MikroTikApi.disconnectSession(sessionId);
            
            res.json({
                success: true,
                message: 'Session disconnected successfully'
            });
            
        } catch (error) {
            console.error('Error disconnecting session:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to disconnect session',
                error: error.message
            });
        }
    }
    
    // ===== NETWORK NEIGHBORS =====
    
    // Ambil data perangkat yang terhubung
    async getNetworkDevices(req, res) {
        try {
            // Ambil DHCP leases dari Mikrotik
            const dhcpLeases = await MikroTikApi.getDhcpLeases();
            
            // Ambil wireless clients jika ada
            let wirelessClients = [];
            try {
                wirelessClients = await MikroTikApi.getWirelessClients();
            } catch (error) {
                console.log('No wireless clients found');
            }
            
            // Gabungkan dan format data
            const devices = dhcpLeases.map(lease => {
                const wirelessClient = wirelessClients.find(wc => wc['mac-address'] === lease['mac-address']);
                
                return {
                    id: lease.id,
                    name: lease['host-name'] || 'Unknown Device',
                    ipAddress: lease.address,
                    macAddress: lease['mac-address'],
                    router: 'Router-001', // TODO: Get from database
                    type: wirelessClient ? 'WiFi' : 'Wired',
                    vendor: 'Unknown', // TODO: Use getVendorByMac
                    lastSeen: lease['last-seen'],
                    status: lease.active ? 'Online' : 'Offline'
                };
            });
            
            res.json({
                success: true,
                data: devices,
                total: devices.length,
                stats: {
                    totalDevices: devices.length,
                    wifiDevices: devices.filter(d => d.type === 'WiFi').length,
                    wiredDevices: devices.filter(d => d.type === 'Wired').length,
                    onlineDevices: devices.filter(d => d.status === 'Online').length
                }
            });
            
        } catch (error) {
            console.error('Error fetching network devices:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch network devices',
                error: error.message
            });
        }
    }
    
    // ===== DASHBOARD DATA =====
    
    // Ambil data lengkap untuk dashboard
    async getDashboardData(req, res) {
        try {
            const dashboardData = await MikroTikApi.getDashboardData();
            
            // TODO: Ambil data dari database
            const dbData = {
                totalCustomers: 0, // TODO: Count from database
                totalPackages: 0,  // TODO: Count from database
                totalInvoices: 0,  // TODO: Count from database
                revenue: 0         // TODO: Sum from database
            };
            
            res.json({
                success: true,
                data: {
                    ...dashboardData,
                    ...dbData
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
    
    // ===== ROUTER STATUS =====
    
    // Ambil status router dari Mikrotik
    async getRouterStatus(req, res) {
        try {
            const [resourceUsage, interfaceStatus] = await Promise.all([
                MikroTikApi.getResourceUsage(),
                MikroTikApi.getInterfaceStatus()
            ]);
            
            res.json({
                success: true,
                data: {
                    resourceUsage,
                    interfaceStatus,
                    uptime: resourceUsage['uptime'],
                    cpuLoad: resourceUsage['cpu-load'],
                    freeMemory: resourceUsage['free-memory'],
                    totalMemory: resourceUsage['total-memory']
                }
            });
            
        } catch (error) {
            console.error('Error fetching router status:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch router status',
                error: error.message
            });
        }
    }
    
    // ===== TRAFFIC MONITORING =====
    
    // Ambil traffic data untuk interface tertentu
    async getInterfaceTraffic(req, res) {
        try {
            const { interfaceName } = req.params;
            const traffic = await MikroTikApi.getInterfaceTraffic(interfaceName);
            
            res.json({
                success: true,
                data: traffic
            });
            
        } catch (error) {
            console.error('Error fetching interface traffic:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch interface traffic',
                error: error.message
            });
        }
    }
}

module.exports = new MikroTikController(); 