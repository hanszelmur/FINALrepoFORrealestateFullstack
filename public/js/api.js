// API Configuration
const API_BASE_URL = window.location.origin + '/api';

// Auth state
let authToken = localStorage.getItem('authToken');
let currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

// API Helper
async function apiRequest(endpoint, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Request failed');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Auth API
const authAPI = {
    login: async (email, password) => {
        const data = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        authToken = data.token;
        currentUser = data.user;
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        return data;
    },

    logout: () => {
        authToken = null;
        currentUser = null;
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
    },

    isAuthenticated: () => {
        return !!authToken;
    },

    getCurrentUser: () => {
        return currentUser;
    }
};

// Properties API
const propertiesAPI = {
    getAll: (filters = {}) => {
        const params = new URLSearchParams(filters);
        return apiRequest(`/properties?${params}`);
    },

    getById: (id) => {
        return apiRequest(`/properties/${id}`);
    },

    create: (data) => {
        return apiRequest('/properties', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    update: (id, data) => {
        return apiRequest(`/properties/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    delete: (id) => {
        return apiRequest(`/properties/${id}`, {
            method: 'DELETE'
        });
    },

    uploadPhotos: async (id, files) => {
        const formData = new FormData();
        for (let file of files) {
            formData.append('photos', file);
        }

        const headers = {};
        if (authToken) {
            headers['Authorization'] = `Bearer ${authToken}`;
        }

        const response = await fetch(`${API_BASE_URL}/properties/${id}/photos`, {
            method: 'POST',
            headers,
            body: formData
        });

        return response.json();
    }
};

// Inquiries API
const inquiriesAPI = {
    getAll: (filters = {}) => {
        const params = new URLSearchParams(filters);
        return apiRequest(`/inquiries?${params}`);
    },

    getById: (id) => {
        return apiRequest(`/inquiries/${id}`);
    },

    create: (data) => {
        return apiRequest('/inquiries', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    assign: (id, agentId) => {
        return apiRequest(`/inquiries/${id}/assign`, {
            method: 'POST',
            body: JSON.stringify({ agent_id: agentId })
        });
    },

    updateStatus: (id, status, notes, commissionAmount) => {
        return apiRequest(`/inquiries/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status, notes, commission_amount: commissionAmount })
        });
    }
};

// Calendar API
const calendarAPI = {
    getAll: (filters = {}) => {
        const params = new URLSearchParams(filters);
        return apiRequest(`/calendar?${params}`);
    },

    create: (data) => {
        return apiRequest('/calendar', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    update: (id, data) => {
        return apiRequest(`/calendar/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    delete: (id) => {
        return apiRequest(`/calendar/${id}`, {
            method: 'DELETE'
        });
    }
};

// Agents API
const agentsAPI = {
    getAll: () => {
        return apiRequest('/agents');
    },

    getStats: (agentId = null) => {
        const params = agentId ? `?agent_id=${agentId}` : '';
        return apiRequest(`/agents/stats${params}`);
    }
};

// Export report
async function exportReport(type) {
    if (!authToken) {
        alert('Please login first');
        return;
    }

    const url = `${API_BASE_URL}/reports/${type}`;
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${type}.csv`);
    
    // Add auth header by opening in new window with token
    window.open(url + `?token=${authToken}`, '_blank');
}
