// App state
let currentPage = 'properties';
let currentSection = 'properties';

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is authenticated
    if (authAPI.isAuthenticated()) {
        showDashboard();
    } else {
        showLogin();
    }

    // Setup event listeners
    setupEventListeners();
});

function setupEventListeners() {
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = e.target.dataset.page;
            navigateTo(page);
        });
    });

    // Filters
    const statusFilter = document.getElementById('statusFilter');
    const typeFilter = document.getElementById('typeFilter');
    const locationFilter = document.getElementById('locationFilter');

    if (statusFilter) statusFilter.addEventListener('change', loadProperties);
    if (typeFilter) typeFilter.addEventListener('change', loadProperties);
    if (locationFilter) {
        let timeout;
        locationFilter.addEventListener('input', () => {
            clearTimeout(timeout);
            timeout = setTimeout(loadProperties, 500);
        });
    }
}

async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const errorDiv = document.getElementById('loginError');

    errorDiv.textContent = '';

    try {
        await authAPI.login(email, password);
        showDashboard();
    } catch (error) {
        errorDiv.textContent = error.message || 'Login failed';
    }
}

function handleLogout() {
    authAPI.logout();
    disconnectWebSocket();
    showLogin();
}

function showLogin() {
    document.getElementById('loginPage').classList.add('active');
    document.getElementById('dashboardPage').classList.remove('active');
}

function showDashboard() {
    document.getElementById('loginPage').classList.remove('active');
    document.getElementById('dashboardPage').classList.add('active');

    const user = authAPI.getCurrentUser();
    document.getElementById('userName').textContent = user.full_name;

    // Initialize WebSocket
    initializeWebSocket();

    // Load initial data
    loadProperties();
}

function navigateTo(section) {
    // Update navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === section) {
            link.classList.add('active');
        }
    });

    // Update sections
    document.querySelectorAll('.section').forEach(sec => {
        sec.classList.remove('active');
    });
    document.getElementById(`${section}Section`).classList.add('active');

    currentSection = section;

    // Load section data
    switch(section) {
        case 'properties':
            loadProperties();
            break;
        case 'inquiries':
            loadInquiries();
            break;
        case 'calendar':
            loadCalendar();
            break;
        case 'agents':
            loadAgents();
            break;
    }
}

// Load Properties
async function loadProperties() {
    const grid = document.getElementById('propertiesGrid');
    const loading = document.getElementById('propertiesLoading');

    loading.classList.add('active');
    grid.innerHTML = '';

    try {
        const filters = {
            status: document.getElementById('statusFilter')?.value || '',
            property_type: document.getElementById('typeFilter')?.value || '',
            location: document.getElementById('locationFilter')?.value || ''
        };

        // Remove empty filters
        Object.keys(filters).forEach(key => {
            if (!filters[key]) delete filters[key];
        });

        const properties = await propertiesAPI.getAll(filters);

        properties.forEach(property => {
            const card = createPropertyCard(property);
            grid.appendChild(card);
        });

        if (properties.length === 0) {
            grid.innerHTML = '<p style="text-align: center; color: #999;">No properties found</p>';
        }
    } catch (error) {
        grid.innerHTML = `<p style="text-align: center; color: #e74c3c;">Error loading properties: ${error.message}</p>`;
    } finally {
        loading.classList.remove('active');
    }
}

function createPropertyCard(property) {
    const card = document.createElement('div');
    card.className = 'card';

    const statusClass = `badge-${property.status}`;
    const price = new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP'
    }).format(property.price);

    card.innerHTML = `
        <div class="card-body">
            <h3 class="card-title">${property.title}</h3>
            <span class="badge ${statusClass}">${property.status}</span>
            <p class="card-text">📍 ${property.location}</p>
            <p class="card-text">🏠 ${property.property_type}</p>
            ${property.bedrooms ? `<p class="card-text">🛏️ ${property.bedrooms} bed | 🚿 ${property.bathrooms} bath</p>` : ''}
            <div class="card-price">${price}</div>
        </div>
    `;

    return card;
}

// Load Inquiries
async function loadInquiries() {
    const container = document.getElementById('inquiriesTable');
    const loading = document.getElementById('inquiriesLoading');

    loading.classList.add('active');
    container.innerHTML = '';

    try {
        const inquiries = await inquiriesAPI.getAll();

        const table = document.createElement('table');
        table.innerHTML = `
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Client</th>
                    <th>Property ID</th>
                    <th>Status</th>
                    <th>Contact</th>
                    <th>Created</th>
                </tr>
            </thead>
            <tbody>
                ${inquiries.map(inq => `
                    <tr>
                        <td>#${inq.id}</td>
                        <td>${inq.client_name}</td>
                        <td>${inq.property_id}</td>
                        <td><span class="badge">${inq.status}</span></td>
                        <td>${inq.client_phone}</td>
                        <td>${new Date(inq.created_at).toLocaleDateString()}</td>
                    </tr>
                `).join('')}
            </tbody>
        `;

        container.appendChild(table);

        if (inquiries.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #999;">No inquiries found</p>';
        }
    } catch (error) {
        container.innerHTML = `<p style="text-align: center; color: #e74c3c;">Error loading inquiries: ${error.message}</p>`;
    } finally {
        loading.classList.remove('active');
    }
}

// Load Calendar
async function loadCalendar() {
    const container = document.getElementById('calendarView');
    const loading = document.getElementById('calendarLoading');

    loading.classList.add('active');
    container.innerHTML = '';

    try {
        const events = await calendarAPI.getAll();

        const table = document.createElement('table');
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Title</th>
                    <th>Type</th>
                    <th>Start Time</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${events.map(event => `
                    <tr>
                        <td>${event.title}</td>
                        <td>${event.event_type}</td>
                        <td>${new Date(event.start_time).toLocaleString()}</td>
                        <td><span class="badge">${event.status}</span></td>
                    </tr>
                `).join('')}
            </tbody>
        `;

        container.appendChild(table);

        if (events.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #999;">No events found</p>';
        }
    } catch (error) {
        container.innerHTML = `<p style="text-align: center; color: #e74c3c;">Error loading calendar: ${error.message}</p>`;
    } finally {
        loading.classList.remove('active');
    }
}

// Load Agents
async function loadAgents() {
    const container = document.getElementById('agentsStats');
    const loading = document.getElementById('agentsLoading');

    loading.classList.add('active');
    container.innerHTML = '';

    try {
        const stats = await agentsAPI.getStats();

        const table = document.createElement('table');
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Agent</th>
                    <th>Email</th>
                    <th>Properties</th>
                    <th>Active Inquiries</th>
                    <th>Sold</th>
                    <th>Total Commission</th>
                </tr>
            </thead>
            <tbody>
                ${stats.map(agent => `
                    <tr>
                        <td>${agent.full_name}</td>
                        <td>${agent.email}</td>
                        <td>${agent.total_properties}</td>
                        <td>${agent.active_inquiries}</td>
                        <td>${agent.sold_inquiries}</td>
                        <td>₱${new Intl.NumberFormat('en-PH').format(agent.total_commission)}</td>
                    </tr>
                `).join('')}
            </tbody>
        `;

        container.appendChild(table);

        if (stats.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #999;">No agent stats found</p>';
        }
    } catch (error) {
        container.innerHTML = `<p style="text-align: center; color: #e74c3c;">Error loading agents: ${error.message}</p>`;
    } finally {
        loading.classList.remove('active');
    }
}
