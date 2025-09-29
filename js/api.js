// Base URL API
const API_URL = 'http://localhost:4003'; // Pastikan ini sesuai dengan port backend

// Fungsi untuk melakukan request ke API
async function apiRequest(endpoint, options = {}) {
    const url = `${API_URL}${endpoint}`;
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json'
        }
    };

    const config = { ...defaultOptions, ...options };

    try {
        const response = await fetch(url, config);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
}

// API untuk Donasi
const DonasiAPI = {
    getAll: () => apiRequest('/donasi'),
    getById: (id) => apiRequest(`/donasi/${id}`),
    create: (data) => apiRequest('/donasi', {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    update: (id, data) => apiRequest(`/donasi/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),
    delete: (id) => apiRequest(`/donasi/${id}`, {
        method: 'DELETE'
    }),
    getStats: () => apiRequest('/donasi/stats'),
    getTopDonors: (limit = 5) => apiRequest(`/donasi/top?limit=${limit}`),
    search: (name) => apiRequest(`/donasi/search?name=${name}`)
};

// API untuk Relawan
const RelawanAPI = {
    getAll: () => apiRequest('/relawan'),
    getById: (id) => apiRequest(`/relawan/${id}`),
    create: (data) => apiRequest('/relawan', {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    update: (id, data) => apiRequest(`/relawan/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),
    delete: (id) => apiRequest(`/relawan/${id}`, {
        method: 'DELETE'
    }),
    getByTeam: () => apiRequest('/relawan/team')
};

// API untuk Jenis Donasi
const JenisDonasiAPI = {
    getAll: () => apiRequest('/jenis_donasi')
};