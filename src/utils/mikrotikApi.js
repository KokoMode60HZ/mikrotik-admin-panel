const axios = require('axios');

class MikroTikApi {
    constructor(config) {
        this.baseUrl = `http://${config.ip}:${config.port || 8728}/api`;
        this.username = config.username;
        this.password = config.password;
        this.token = null;
    }

    // Authentication
    async login() {
        try {
            const response = await axios.post(`${this.baseUrl}/login`, {
                name: this.username,
                password: this.password
            });
            this.token = response.data.token;
            return this.token;
        } catch (error) {
            throw new Error(`Login failed: ${error.message}`);
        }
    }

    // Helper method untuk request dengan auth
    async request(method, endpoint, data = null) {
        try {
            if (!this.token) {
                await this.login();
            }

            const config = {
                method,
                url: `${this.baseUrl}${endpoint}`,
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            };

            if (data) {
                config.data = data;
            }

            const response = await axios(config);
            return response.data;
        } catch (error) {
            if (error.response?.status === 401) {
                // Token expired, try login again
                await this.login();
                return this.request(method, endpoint, data);
            }
            throw new Error(`API request failed: ${error.message}`);
        }
    }

    // ===== SESSION MANAGEMENT =====
    
    // Ambil semua session aktif
    async getActiveSessions() {
        return this.request('GET', '/ppp/active');
    }

    // Ambil session berdasarkan username
    async getSessionByUsername(username) {
        const sessions = await this.getActiveSessions();
        return sessions.find(session => session.name === username);
    }

    // Disconnect session
    async disconnectSession(sessionId) {
        return this.request('POST', `/ppp/active/remove`, { id: sessionId });
    }

    // ===== DHCP LEASES =====
    
    // Ambil semua DHCP leases (IP address yang diberikan)
    async getDhcpLeases() {
        return this.request('GET', '/ip/dhcp-server/lease');
    }

    // Ambil lease berdasarkan IP
    async getLeaseByIp(ipAddress) {
        const leases = await this.getDhcpLeases();
        return leases.find(lease => lease.address === ipAddress);
    }

    // ===== INTERFACE MONITORING =====
    
    // Ambil status interface
    async getInterfaceStatus() {
        return this.request('GET', '/interface');
    }

    // Ambil traffic monitoring
    async getInterfaceTraffic(interfaceName) {
        return this.request('GET', `/interface/monitor-traffic`, {
            interface: interfaceName,
            once: true
        });
    }

    // ===== RESOURCE MONITORING =====
    
    // Ambil resource usage (CPU, Memory, Disk)
    async getResourceUsage() {
        return this.request('GET', '/system/resource');
    }

    // Ambil system health
    async getSystemHealth() {
        return this.request('GET', '/system/health');
    }

    // ===== HOTSPOT USERS =====
    
    // Ambil user hotspot aktif
    async getHotspotActiveUsers() {
        return this.request('GET', '/ip/hotspot/active');
    }

    // ===== FIREWALL CONNECTIONS =====
    
    // Ambil koneksi firewall (untuk monitoring traffic)
    async getFirewallConnections() {
        return this.request('GET', '/ip/firewall/connection');
    }

    // ===== WIRELESS CLIENTS =====
    
    // Ambil client wireless
    async getWirelessClients() {
        return this.request('GET', '/interface/wireless/registration-table');
    }

    // ===== COMBINED DATA METHODS =====
    
    // Gabungkan data session dengan DHCP leases
    async getSessionWithIpInfo() {
        const [sessions, leases] = await Promise.all([
            this.getActiveSessions(),
            this.getDhcpLeases()
        ]);

        return sessions.map(session => {
            const lease = leases.find(l => l['mac-address'] === session['caller-id']);
            return {
                ...session,
                ipAddress: lease?.address,
                macAddress: session['caller-id'],
                leaseInfo: lease
            };
        });
    }

    // Ambil data lengkap untuk dashboard
    async getDashboardData() {
        const [
            sessions,
            leases,
            resourceUsage,
            interfaceStatus
        ] = await Promise.all([
            this.getActiveSessions(),
            this.getDhcpLeases(),
            this.getResourceUsage(),
            this.getInterfaceStatus()
        ]);

        return {
            activeSessions: sessions.length,
            totalLeases: leases.length,
            resourceUsage,
            interfaceStatus,
            sessions: await this.getSessionWithIpInfo()
        };
    }

    // ===== VENDOR LOOKUP =====
    
    // Lookup vendor berdasarkan MAC address (menggunakan API eksternal)
    async getVendorByMac(macAddress) {
        try {
            const cleanMac = macAddress.replace(/:/g, '').toUpperCase();
            const response = await axios.get(`https://api.macvendors.com/${cleanMac}`);
            return response.data;
        } catch (error) {
            return 'Unknown';
        }
    }
}

// Export instance dengan config default
const mikrotikConfig = {
    ip: process.env.MIKROTIK_IP || '192.168.1.1',
    port: process.env.MIKROTIK_PORT || 8728,
    username: process.env.MIKROTIK_USERNAME || 'admin',
    password: process.env.MIKROTIK_PASSWORD || 'password'
};

module.exports = new MikroTikApi(mikrotikConfig);