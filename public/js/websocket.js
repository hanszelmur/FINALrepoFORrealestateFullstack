// WebSocket connection
let socket = null;

function initializeWebSocket() {
    if (!authToken) {
        console.log('No auth token, skipping WebSocket connection');
        return;
    }

    const wsIndicator = document.getElementById('wsIndicator');
    const wsText = document.getElementById('wsText');
    const wsStatus = document.getElementById('wsStatus');

    // Update status UI
    function updateStatus(status, text) {
        wsStatus.className = 'ws-status ' + status;
        wsText.textContent = text;
    }

    updateStatus('connecting', 'Connecting...');

    // Initialize Socket.io connection
    socket = io(window.location.origin, {
        auth: {
            token: authToken
        }
    });

    socket.on('connect', () => {
        console.log('WebSocket connected');
        updateStatus('connected', 'Connected');
    });

    socket.on('disconnect', () => {
        console.log('WebSocket disconnected');
        updateStatus('disconnected', 'Disconnected');
    });

    socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
        updateStatus('disconnected', 'Connection Error');
    });

    // Listen for inquiry events
    socket.on('inquiry_assigned', (inquiry) => {
        console.log('Inquiry assigned:', inquiry);
        showNotification('New Inquiry Assigned', `Inquiry #${inquiry.id} has been assigned to you`);
        
        // Refresh inquiries if on that page
        if (document.getElementById('inquiriesSection').classList.contains('active')) {
            loadInquiries();
        }
    });

    socket.on('inquiry_status_changed', (inquiry) => {
        console.log('Inquiry status changed:', inquiry);
        showNotification('Inquiry Updated', `Inquiry #${inquiry.id} status: ${inquiry.status}`);
        
        // Refresh inquiries if on that page
        if (document.getElementById('inquiriesSection').classList.contains('active')) {
            loadInquiries();
        }
    });

    // Listen for property events
    socket.on('property_status_changed', (property) => {
        console.log('Property status changed:', property);
        showNotification('Property Updated', `${property.title} is now ${property.status}`);
        
        // Refresh properties if on that page
        if (document.getElementById('propertiesSection').classList.contains('active')) {
            loadProperties();
        }
    });

    // Listen for calendar events
    socket.on('calendar_event_created', (event) => {
        console.log('Calendar event created:', event);
        showNotification('New Event', `Calendar event: ${event.title}`);
        
        // Refresh calendar if on that page
        if (document.getElementById('calendarSection').classList.contains('active')) {
            loadCalendar();
        }
    });
}

function showNotification(title, message) {
    // Simple notification (you can replace with a better notification library)
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
            body: message,
            icon: '/favicon.ico'
        });
    } else {
        // Fallback to console
        console.log(`Notification: ${title} - ${message}`);
    }
}

function disconnectWebSocket() {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
}

// Request notification permission on load
if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
}
