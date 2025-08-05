// Mikrotik API Client untuk Frontend
class MikrotikApiClient {
    constructor() {
        this.baseUrl = '/api/mikrotik';
    }

    // Helper method untuk API calls
    async apiCall(endpoint, options = {}) {
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API call failed:', error);
            throw error;
        }
    }

    // ===== SESSION MANAGEMENT =====
    
    // Ambil data session
    async getSessions() {
        return this.apiCall('/sessions');
    }

    // Disconnect session
    async disconnectSession(sessionId) {
        return this.apiCall(`/sessions/${sessionId}/disconnect`, {
            method: 'POST'
        });
    }

    // ===== NETWORK DEVICES =====
    
    // Ambil data perangkat
    async getDevices() {
        return this.apiCall('/devices');
    }

    // ===== DASHBOARD =====
    
    // Ambil data dashboard
    async getDashboardData() {
        return this.apiCall('/dashboard');
    }

    // ===== ROUTER STATUS =====
    
    // Ambil status router
    async getRouterStatus() {
        return this.apiCall('/router/status');
    }

    // Ambil traffic interface
    async getInterfaceTraffic(interfaceName) {
        return this.apiCall(`/router/traffic/${interfaceName}`);
    }
}

// Global instance
const mikrotikApi = new MikrotikApiClient();

// ===== UI UPDATE FUNCTIONS =====

// Update dashboard dengan data real-time
async function updateDashboard() {
    try {
        const response = await mikrotikApi.getDashboardData();
        const data = response.data;

        // Update stats cards
        updateStatsCard('active-sessions', data.activeSessions);
        updateStatsCard('total-devices', data.totalLeases);
        updateStatsCard('cpu-usage', data.resourceUsage['cpu-load'] + '%');
        updateStatsCard('memory-usage', Math.round((data.resourceUsage['total-memory'] - data.resourceUsage['free-memory']) / data.resourceUsage['total-memory'] * 100) + '%');

        // Update session table jika ada
        if (data.sessions && data.sessions.length > 0) {
            updateSessionTable(data.sessions);
        }

    } catch (error) {
        console.error('Failed to update dashboard:', error);
        showError('Gagal memperbarui dashboard');
    }
}

// Update session management page
async function updateSessionManagement() {
    try {
        const response = await mikrotikApi.getSessions();
        const sessions = response.data;

        // Update stats
        updateStatsCard('active-sessions', sessions.length);
        updateStatsCard('total-traffic', formatBytes(sessions.reduce((sum, s) => sum + s.upload + s.download, 0)));

        // Update table
        updateSessionTable(sessions);

    } catch (error) {
        console.error('Failed to update session management:', error);
        showError('Gagal memperbarui data session');
    }
}

// Update network neighbors page
async function updateNetworkNeighbors() {
    try {
        const response = await mikrotikApi.getDevices();
        const devices = response.data;
        const stats = response.stats;

        // Update stats
        updateStatsCard('total-devices', stats.totalDevices);
        updateStatsCard('wifi-devices', stats.wifiDevices);
        updateStatsCard('wired-devices', stats.wiredDevices);
        updateStatsCard('online-devices', stats.onlineDevices);

        // Update table
        updateDeviceTable(devices);

    } catch (error) {
        console.error('Failed to update network neighbors:', error);
        showError('Gagal memperbarui data perangkat');
    }
}

// ===== HELPER FUNCTIONS =====

// Update stats card
function updateStatsCard(cardId, value) {
    const card = document.querySelector(`[data-stat="${cardId}"]`);
    if (card) {
        const valueElement = card.querySelector('.stat-value');
        if (valueElement) {
            valueElement.textContent = value;
        }
    }
}

// Update session table
function updateSessionTable(sessions) {
    const tbody = document.querySelector('#session-table tbody');
    if (!tbody) return;

    tbody.innerHTML = sessions.map(session => `
        <tr>
            <td>${session.id}</td>
            <td>${session.customerName}</td>
            <td>${session.router}</td>
            <td>${session.ipAddress}</td>
            <td>${session.macAddress}</td>
            <td>${session.startTime}</td>
            <td>${session.duration}</td>
            <td>${formatBytes(session.upload)}</td>
            <td>${formatBytes(session.download)}</td>
            <td><span class="badge badge-${session.status === 'Aktif' ? 'success' : 'danger'}">${session.status}</span></td>
            <td>
                <button class="btn btn-sm btn-info" onclick="viewSession('${session.id}')"><i class="fas fa-eye"></i></button>
                <button class="btn btn-sm btn-warning" onclick="pauseSession('${session.id}')"><i class="fas fa-pause"></i></button>
                <button class="btn btn-sm btn-danger" onclick="disconnectSession('${session.id}')"><i class="fas fa-stop"></i></button>
            </td>
        </tr>
    `).join('');
}

// Update device table
function updateDeviceTable(devices) {
    const tbody = document.querySelector('#device-table tbody');
    if (!tbody) return;

    tbody.innerHTML = devices.map(device => `
        <tr>
            <td>${device.id}</td>
            <td>${device.name}</td>
            <td>${device.ipAddress}</td>
            <td>${device.macAddress}</td>
            <td>${device.router}</td>
            <td><span class="badge badge-${device.type === 'WiFi' ? 'info' : 'primary'}">${device.type}</span></td>
            <td>${device.vendor}</td>
            <td>${device.lastSeen}</td>
            <td><span class="badge badge-${device.status === 'Online' ? 'success' : 'danger'}">${device.status}</span></td>
            <td>
                <button class="btn btn-sm btn-info" onclick="viewDevice('${device.id}')"><i class="fas fa-eye"></i></button>
                <button class="btn btn-sm btn-warning" onclick="blockDevice('${device.id}')"><i class="fas fa-ban"></i></button>
                <button class="btn btn-sm btn-danger" onclick="removeDevice('${device.id}')"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

// Format bytes to human readable
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Show error message
function showError(message) {
    // Implement error display (toast, alert, etc.)
    console.error(message);
}

// ===== ACTION FUNCTIONS =====

// Disconnect session
async function disconnectSession(sessionId) {
    if (confirm('Yakin ingin memutuskan session ini?')) {
        try {
            await mikrotikApi.disconnectSession(sessionId);
            showSuccess('Session berhasil diputuskan');
            updateSessionManagement();
        } catch (error) {
            showError('Gagal memutuskan session');
        }
    }
}

// Show success message
function showSuccess(message) {
    // Implement success display
    console.log(message);
}

// ===== AUTO REFRESH =====

// Auto refresh setiap 30 detik
function startAutoRefresh() {
    setInterval(() => {
        const currentPage = window.location.pathname;
        
        if (currentPage === '/dashboard') {
            updateDashboard();
        } else if (currentPage === '/session-management') {
            updateSessionManagement();
        } else if (currentPage === '/network-neighbors') {
            updateNetworkNeighbors();
        }
    }, 30000); // 30 detik
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Start auto refresh
    startAutoRefresh();
    
    // Initial update based on current page
    const currentPage = window.location.pathname;
    
    if (currentPage === '/dashboard') {
        updateDashboard();
    } else if (currentPage === '/session-management') {
        updateSessionManagement();
    } else if (currentPage === '/network-neighbors') {
        updateNetworkNeighbors();
    }
}); 