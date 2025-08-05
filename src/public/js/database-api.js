// Database API Client untuk Frontend
class DatabaseApiClient {
    constructor() {
        this.baseUrl = '/api/database';
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
            console.error('Database API call failed:', error);
            throw error;
        }
    }

    // ===== PELANGGAN API =====
    
    // Ambil semua pelanggan
    async getPelanggan() {
        return this.apiCall('/pelanggan');
    }

    // Tambah pelanggan baru
    async addPelanggan(pelangganData) {
        return this.apiCall('/pelanggan', {
            method: 'POST',
            body: JSON.stringify(pelangganData)
        });
    }

    // ===== PAKET API =====
    
    // Ambil semua paket
    async getPaket() {
        return this.apiCall('/paket');
    }

    // ===== KEUANGAN API =====
    
    // Ambil semua tagihan
    async getTagihan() {
        return this.apiCall('/tagihan');
    }

    // Ambil summary keuangan
    async getKeuanganSummary() {
        return this.apiCall('/keuangan/summary');
    }

    // ===== PAYMENT GATEWAY API =====
    
    // Ambil konfigurasi payment gateway
    async getPaymentGatewayConfig() {
        return this.apiCall('/payment-gateway');
    }

    // Update konfigurasi payment gateway
    async updatePaymentGatewayConfig(id, configData) {
        return this.apiCall(`/payment-gateway/${id}`, {
            method: 'PUT',
            body: JSON.stringify(configData)
        });
    }

    // ===== DASHBOARD API =====
    
    // Ambil data dashboard (database + mikrotik)
    async getDashboardData() {
        return this.apiCall('/dashboard');
    }
}

// Global instance
const databaseApi = new DatabaseApiClient();

// ===== UI UPDATE FUNCTIONS =====

// Update pelanggan table
async function updatePelangganTable() {
    try {
        const response = await databaseApi.getPelanggan();
        const pelanggan = response.data;

        const tbody = document.querySelector('#pelanggan-table tbody');
        if (!tbody) return;

        tbody.innerHTML = pelanggan.map(p => `
            <tr>
                <td>${p.id}</td>
                <td>${p.nama_lengkap}</td>
                <td>${p.alamat}</td>
                <td>${p.nomor_kontak}</td>
                <td>${p.paket?.nama || 'N/A'}</td>
                <td><span class="badge badge-${p.status_langganan === 'aktif' ? 'success' : 'danger'}">${p.status_langganan}</span></td>
                <td>${formatDate(p.dibuat_pada)}</td>
                <td>
                    <button class="btn btn-sm btn-info" onclick="editPelanggan('${p.id}')"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-sm btn-warning" onclick="viewPelanggan('${p.id}')"><i class="fas fa-eye"></i></button>
                    <button class="btn btn-sm btn-danger" onclick="deletePelanggan('${p.id}')"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');

    } catch (error) {
        console.error('Failed to update pelanggan table:', error);
        showError('Gagal memperbarui data pelanggan');
    }
}

// Update paket table
async function updatePaketTable() {
    try {
        const response = await databaseApi.getPaket();
        const paket = response.data;

        const tbody = document.querySelector('#paket-table tbody');
        if (!tbody) return;

        tbody.innerHTML = paket.map(p => `
            <tr>
                <td>${p.id}</td>
                <td>${p.nama}</td>
                <td>${p.kecepatan_download} Mbps</td>
                <td>Rp ${formatNumber(p.harga)}</td>
                <td>${p.durasi_hari} Hari</td>
                <td><span class="badge badge-${p.status === 'aktif' ? 'success' : 'danger'}">${p.status}</span></td>
                <td>
                    <button class="btn btn-sm btn-info" onclick="editPaket('${p.id}')"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-sm btn-danger" onclick="deletePaket('${p.id}')"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');

    } catch (error) {
        console.error('Failed to update paket table:', error);
        showError('Gagal memperbarui data paket');
    }
}

// Update tagihan table
async function updateTagihanTable() {
    try {
        const response = await databaseApi.getTagihan();
        const tagihan = response.data;

        const tbody = document.querySelector('#tagihan-table tbody');
        if (!tbody) return;

        tbody.innerHTML = tagihan.map(t => `
            <tr>
                <td>${t.id}</td>
                <td>${t.nomor_invoice}</td>
                <td>${t.pelanggan?.nama_lengkap || 'N/A'}</td>
                <td>${t.paket?.nama || 'N/A'}</td>
                <td>Rp ${formatNumber(t.jumlah)}</td>
                <td>${t.periode_awal} - ${t.periode_akhir}</td>
                <td>${formatDate(t.jatuh_tempo)}</td>
                <td><span class="badge badge-${getStatusBadge(t.status)}">${t.status}</span></td>
                <td>
                    <button class="btn btn-sm btn-info" onclick="viewTagihan('${t.id}')"><i class="fas fa-eye"></i></button>
                    <button class="btn btn-sm btn-warning" onclick="editTagihan('${t.id}')"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-sm btn-danger" onclick="deleteTagihan('${t.id}')"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');

    } catch (error) {
        console.error('Failed to update tagihan table:', error);
        showError('Gagal memperbarui data tagihan');
    }
}

// Update keuangan summary
async function updateKeuanganSummary() {
    try {
        const response = await databaseApi.getKeuanganSummary();
        const summary = response.data;

        // Update stats cards
        updateStatsCard('total-pendapatan', 'Rp ' + formatNumber(summary.totalPendapatan));
        updateStatsCard('tagihan-belum-lunas', 'Rp ' + formatNumber(summary.tagihanBelumLunas));
        updateStatsCard('total-pelanggan', summary.totalPelanggan);
        updateStatsCard('pelanggan-aktif', summary.pelangganAktif);
        updateStatsCard('rata-rata-pendapatan', 'Rp ' + formatNumber(summary.rataRataPendapatan));
        updateStatsCard('pertumbuhan-bulanan', summary.pertumbuhanBulanan + '%');

    } catch (error) {
        console.error('Failed to update keuangan summary:', error);
        showError('Gagal memperbarui data keuangan');
    }
}

// Update payment gateway config
async function updatePaymentGatewayConfig() {
    try {
        const response = await databaseApi.getPaymentGatewayConfig();
        const configs = response.data;

        const container = document.querySelector('#payment-gateway-config');
        if (!container) return;

        container.innerHTML = configs.map(config => `
            <div class="config-section">
                <h4>${config.nama_gateway}</h4>
                <div class="form-group">
                    <label>Merchant ID:</label>
                    <input type="text" class="form-control" value="${config.merchant_id || ''}" id="merchant_${config.id}">
                </div>
                <div class="form-group">
                    <label>API Key:</label>
                    <input type="password" class="form-control" value="${config.api_key || ''}" id="api_key_${config.id}">
                </div>
                <div class="form-group">
                    <label>API Secret:</label>
                    <input type="password" class="form-control" value="${config.api_secret || ''}" id="api_secret_${config.id}">
                </div>
                <div class="form-group">
                    <label>Callback URL:</label>
                    <input type="text" class="form-control" value="${config.callback_url || ''}" id="callback_${config.id}">
                </div>
                <button class="btn btn-primary" onclick="savePaymentGatewayConfig('${config.id}')">
                    <i class="fas fa-save"></i> Simpan Konfigurasi
                </button>
            </div>
        `).join('');

    } catch (error) {
        console.error('Failed to update payment gateway config:', error);
        showError('Gagal memperbarui konfigurasi payment gateway');
    }
}

// ===== HELPER FUNCTIONS =====

// Format number to Indonesian currency
function formatNumber(num) {
    return new Intl.NumberFormat('id-ID').format(num);
}

// Format date
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('id-ID');
}

// Get status badge class
function getStatusBadge(status) {
    switch (status) {
        case 'lunas': return 'success';
        case 'belum_lunas': return 'warning';
        case 'jatuh_tempo': return 'danger';
        default: return 'secondary';
    }
}

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

// Show error message
function showError(message) {
    console.error(message);
    // TODO: Implement toast notification
}

// Show success message
function showSuccess(message) {
    console.log(message);
    // TODO: Implement toast notification
}

// ===== ACTION FUNCTIONS =====

// Save payment gateway config
async function savePaymentGatewayConfig(configId) {
    try {
        const configData = {
            merchant_id: document.getElementById(`merchant_${configId}`).value,
            api_key: document.getElementById(`api_key_${configId}`).value,
            api_secret: document.getElementById(`api_secret_${configId}`).value,
            callback_url: document.getElementById(`callback_${configId}`).value
        };

        await databaseApi.updatePaymentGatewayConfig(configId, configData);
        showSuccess('Konfigurasi berhasil disimpan');

    } catch (error) {
        console.error('Failed to save payment gateway config:', error);
        showError('Gagal menyimpan konfigurasi');
    }
}

// Add new pelanggan
async function addNewPelanggan() {
    try {
        const formData = {
            nama_lengkap: document.getElementById('nama_lengkap').value,
            nomor_kontak: document.getElementById('nomor_kontak').value,
            email: document.getElementById('email').value,
            alamat: document.getElementById('alamat').value,
            paket_id: document.getElementById('paket_id').value
        };

        await databaseApi.addPelanggan(formData);
        showSuccess('Pelanggan berhasil ditambahkan');
        updatePelangganTable();

        // Reset form
        document.getElementById('pelanggan-form').reset();

    } catch (error) {
        console.error('Failed to add pelanggan:', error);
        showError('Gagal menambahkan pelanggan');
    }
}

// ===== AUTO REFRESH =====

// Auto refresh setiap 60 detik untuk data database
function startDatabaseAutoRefresh() {
    setInterval(() => {
        const currentPage = window.location.pathname;
        
        if (currentPage === '/list-pelanggan') {
            updatePelangganTable();
        } else if (currentPage === '/profil-paket') {
            updatePaketTable();
        } else if (currentPage === '/data-tagihan') {
            updateTagihanTable();
        } else if (currentPage === '/data-keuangan') {
            updateKeuanganSummary();
        } else if (currentPage === '/payment-gateway') {
            updatePaymentGatewayConfig();
        }
    }, 60000); // 60 detik
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Start auto refresh
    startDatabaseAutoRefresh();
    
    // Initial update based on current page
    const currentPage = window.location.pathname;
    
    if (currentPage === '/list-pelanggan') {
        updatePelangganTable();
    } else if (currentPage === '/profil-paket') {
        updatePaketTable();
    } else if (currentPage === '/data-tagihan') {
        updateTagihanTable();
    } else if (currentPage === '/data-keuangan') {
        updateKeuanganSummary();
    } else if (currentPage === '/payment-gateway') {
        updatePaymentGatewayConfig();
    }
}); 