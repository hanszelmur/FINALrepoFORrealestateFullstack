# API Documentation

Complete API reference for the Real Estate Management System.

## Base URL

```
http://localhost:3000/api
```

## Authentication

Most endpoints require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "error": "Error message here"
}
```

---

## Authentication Endpoints

### POST /api/auth/login

Login with email and password.

**Request Body:**
```json
{
  "email": "admin@realestate.com",
  "password": "Admin123!@#"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "admin@realestate.com",
    "full_name": "System Administrator",
    "role": "admin",
    "phone": "+639171234567",
    "status": "active"
  }
}
```

**Errors:**
- 401: Invalid credentials
- 400: Missing email or password

### POST /api/auth/register

Register a new user (admin only).

**Authentication:** Required (Admin)

**Request Body:**
```json
{
  "email": "newagent@realestate.com",
  "password": "SecurePass123!",
  "full_name": "New Agent Name",
  "role": "agent",
  "phone": "+639171234567"
}
```

**Response (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 7,
    "email": "newagent@realestate.com",
    "full_name": "New Agent Name",
    "role": "agent"
  }
}
```

---

## Property Endpoints

### GET /api/properties

Get all properties with optional filters.

**Query Parameters:**
- `status`: available, reserved, sold, archived
- `property_type`: house, condo, townhouse, lot, commercial
- `min_price`: minimum price (number)
- `max_price`: maximum price (number)
- `location`: location search term (string)

**Example:**
```
GET /api/properties?status=available&property_type=condo&min_price=5000000
```

**Response (200):**
```json
[
  {
    "id": 2,
    "title": "2BR Condo in BGC",
    "description": "Fully furnished 2-bedroom condo unit",
    "property_type": "condo",
    "status": "available",
    "price": 8500000,
    "location": "Bonifacio Global City",
    "address": "Unit 1503, One Serendra, BGC",
    "bedrooms": 2,
    "bathrooms": 2,
    "floor_area": 95,
    "lot_area": null,
    "features": ["furnished", "pool", "gym"],
    "reservation_type": "none",
    "agent_id": 3,
    "created_at": "2024-12-08T10:30:00Z",
    "updated_at": "2024-12-08T10:30:00Z"
  }
]
```

### GET /api/properties/:id

Get a specific property by ID.

**Response (200):**
```json
{
  "id": 2,
  "title": "2BR Condo in BGC",
  "description": "Fully furnished 2-bedroom condo unit",
  "property_type": "condo",
  "status": "available",
  "price": 8500000,
  "location": "Bonifacio Global City",
  "bedrooms": 2,
  "bathrooms": 2,
  "floor_area": 95,
  "features": ["furnished", "pool", "gym"]
}
```

**Errors:**
- 404: Property not found

### POST /api/properties

Create a new property.

**Authentication:** Required (Agent or Admin)

**Request Body:**
```json
{
  "title": "Luxury 3BR House in Makati",
  "description": "Modern house with spacious living area",
  "property_type": "house",
  "price": 15000000,
  "location": "Makati City",
  "address": "123 Ayala Avenue, Makati",
  "bedrooms": 3,
  "bathrooms": 2,
  "floor_area": 180,
  "lot_area": 200,
  "features": ["garage", "garden", "security"],
  "agent_id": 2
}
```

**Response (201):**
```json
{
  "id": 11,
  "title": "Luxury 3BR House in Makati",
  "status": "available",
  ...
}
```

### PUT /api/properties/:id

Update a property.

**Authentication:** Required (Agent or Admin)

**Request Body:** (all fields optional)
```json
{
  "price": 14500000,
  "status": "reserved",
  "description": "Updated description"
}
```

**Response (200):**
```json
{
  "id": 11,
  "title": "Luxury 3BR House in Makati",
  "price": 14500000,
  ...
}
```

### DELETE /api/properties/:id

Delete a property.

**Authentication:** Required (Agent or Admin)

**Response (200):**
```json
{
  "success": true,
  "message": "Property deleted"
}
```

### GET /api/properties/:id/photos

Get all photos for a property.

**Response (200):**
```json
[
  {
    "id": 1,
    "property_id": 2,
    "photo_path": "/uploads/properties/photo-1.jpg",
    "thumbnail_path": "/uploads/properties/photo-1-thumb.jpg",
    "is_primary": true,
    "display_order": 0,
    "created_at": "2024-12-08T10:30:00Z"
  }
]
```

### POST /api/properties/:id/photos

Upload property photos.

**Authentication:** Required (Agent or Admin)

**Content-Type:** multipart/form-data

**Form Data:**
- `photos`: Array of image files (max 10, 5MB each)

**Response (200):**
```json
{
  "success": true,
  "uploaded": 3,
  "photos": [
    {
      "id": 1,
      "photo_path": "/uploads/properties/photo-1.jpg",
      "thumbnail_path": "/uploads/properties/photo-1-thumb.jpg"
    }
  ]
}
```

### DELETE /api/properties/:id/photos/:photoId

Delete a property photo.

**Authentication:** Required (Agent or Admin)

**Response (200):**
```json
{
  "success": true,
  "message": "Photo deleted"
}
```

---

## Inquiry Endpoints

### POST /api/inquiries

Create a new inquiry (public endpoint, no authentication required).

**Request Body:**
```json
{
  "property_id": 1,
  "client_name": "John Doe",
  "client_email": "john@example.com",
  "client_phone": "+639181234567",
  "message": "I'm interested in viewing this property"
}
```

**Response (201):**
```json
{
  "id": 16,
  "property_id": 1,
  "client_name": "John Doe",
  "client_email": "john@example.com",
  "status": "new",
  "created_at": "2024-12-08T14:30:00Z"
}
```

**Errors:**
- 409: Duplicate inquiry detected (same email/phone for this property)

### GET /api/inquiries

Get all inquiries with filters.

**Authentication:** Required

**Query Parameters:**
- `status`: new, contacted, viewing_scheduled, etc.
- `property_id`: filter by property
- `assigned_to`: filter by agent ID

**Example:**
```
GET /api/inquiries?status=new&assigned_to=2
```

**Response (200):**
```json
[
  {
    "id": 1,
    "property_id": 1,
    "client_name": "Robert Tan",
    "client_email": "robert.tan@email.com",
    "client_phone": "+639181234567",
    "message": "Interested in viewing",
    "status": "viewing_scheduled",
    "assigned_to": 2,
    "commission_amount": null,
    "commission_locked": false,
    "created_at": "2024-12-08T09:00:00Z"
  }
]
```

### GET /api/inquiries/:id

Get inquiry details.

**Authentication:** Required

**Response (200):**
```json
{
  "id": 1,
  "property_id": 1,
  "client_name": "Robert Tan",
  "client_email": "robert.tan@email.com",
  "status": "viewing_scheduled",
  "assigned_to": 2,
  "notes": "Client prefers morning viewings"
}
```

### POST /api/inquiries/:id/assign

Assign inquiry to an agent.

**Authentication:** Required (Agent or Admin)

**Request Body:**
```json
{
  "agent_id": 2
}
```

**Response (200):**
```json
{
  "success": true,
  "inquiry": {
    "id": 1,
    "assigned_to": 2,
    "status": "contacted"
  }
}
```

### POST /api/inquiries/:id/reassign

Reassign inquiry to another agent.

**Authentication:** Required (Agent or Admin)

**Request Body:**
```json
{
  "new_agent_id": 3,
  "reason": "Agent 2 is on leave"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Inquiry reassigned"
}
```

**Errors:**
- 403: Commission locked (deposit paid), cannot reassign

### PUT /api/inquiries/:id/status

Update inquiry status.

**Authentication:** Required (Agent or Admin)

**Request Body:**
```json
{
  "status": "deposit_paid",
  "notes": "Deposit received",
  "commission_amount": 425000
}
```

**Response (200):**
```json
{
  "success": true,
  "inquiry": {
    "id": 1,
    "status": "deposit_paid",
    "commission_amount": 425000,
    "commission_locked": true
  }
}
```

### GET /api/inquiries/:id/history

Get inquiry status history.

**Authentication:** Required

**Response (200):**
```json
[
  {
    "id": 1,
    "inquiry_id": 1,
    "old_status": "new",
    "new_status": "contacted",
    "changed_by": 2,
    "notes": "Initial contact made",
    "created_at": "2024-12-08T10:00:00Z"
  }
]
```

---

## Calendar Endpoints

### POST /api/calendar

Create a calendar event.

**Authentication:** Required (Agent or Admin)

**Request Body:**
```json
{
  "title": "Property Viewing",
  "description": "Show property to potential buyer",
  "event_type": "viewing",
  "start_time": "2024-12-15T10:00:00Z",
  "end_time": "2024-12-15T11:00:00Z",
  "property_id": 1,
  "inquiry_id": 5,
  "agent_id": 2
}
```

**Response (201):**
```json
{
  "id": 6,
  "title": "Property Viewing",
  "event_type": "viewing",
  "start_time": "2024-12-15T10:00:00Z",
  "status": "scheduled"
}
```

**Errors:**
- 409: Conflict detected (another event within 30 minutes)

### GET /api/calendar

Get calendar events with filters.

**Authentication:** Required

**Query Parameters:**
- `agent_id`: filter by agent
- `start_date`: filter from date (ISO 8601)
- `end_date`: filter to date (ISO 8601)
- `status`: scheduled, completed, cancelled
- `event_type`: viewing, meeting, deadline, other

**Response (200):**
```json
[
  {
    "id": 1,
    "title": "Property Viewing",
    "event_type": "viewing",
    "start_time": "2024-12-15T10:00:00Z",
    "end_time": "2024-12-15T11:00:00Z",
    "agent_id": 2,
    "property_id": 1,
    "status": "scheduled"
  }
]
```

### PUT /api/calendar/:id

Update calendar event.

**Authentication:** Required (Agent or Admin)

**Request Body:**
```json
{
  "start_time": "2024-12-15T14:00:00Z",
  "end_time": "2024-12-15T15:00:00Z",
  "status": "completed"
}
```

**Response (200):**
```json
{
  "id": 1,
  "title": "Property Viewing",
  "start_time": "2024-12-15T14:00:00Z",
  "status": "completed"
}
```

### DELETE /api/calendar/:id

Delete calendar event.

**Authentication:** Required (Agent or Admin)

**Response (200):**
```json
{
  "success": true,
  "message": "Event deleted"
}
```

---

## Agent Endpoints

### GET /api/agents

Get all active agents.

**Authentication:** Required

**Response (200):**
```json
[
  {
    "id": 2,
    "email": "maria.santos@realestate.com",
    "full_name": "Maria Santos",
    "phone": "+639171234568",
    "status": "active",
    "created_at": "2024-12-01T08:00:00Z"
  }
]
```

### GET /api/agents/:id

Get agent details.

**Authentication:** Required

**Response (200):**
```json
{
  "id": 2,
  "email": "maria.santos@realestate.com",
  "full_name": "Maria Santos",
  "role": "agent",
  "phone": "+639171234568",
  "status": "active"
}
```

### GET /api/agents/stats

Get agent performance statistics.

**Authentication:** Required

**Query Parameters:**
- `agent_id`: filter by specific agent (optional)

**Response (200):**
```json
[
  {
    "agent_id": 2,
    "full_name": "Maria Santos",
    "email": "maria.santos@realestate.com",
    "total_properties": 5,
    "sold_inquiries": 3,
    "active_inquiries": 7,
    "total_commission": 2500000
  }
]
```

---

## Report Endpoints

All report endpoints require Admin authentication.

### GET /api/reports/properties

Export all properties to CSV.

**Authentication:** Required (Admin)

**Query Parameters:**
- `status`: filter by status (optional)

**Response (200):**
```
Content-Type: text/csv
Content-Disposition: attachment; filename="properties-2024-12-08.csv"

ID,Title,Type,Status,Price,Location,Bedrooms,Bathrooms,Floor Area,Created At
1,Luxury 3BR House,house,available,15000000,Makati City,3,2,180,2024-12-08
```

### GET /api/reports/inquiries

Export all inquiries to CSV.

**Authentication:** Required (Admin)

**Query Parameters:**
- `status`: filter by status (optional)
- `start_date`: filter from date (optional)
- `end_date`: filter to date (optional)

**Response (200):**
```
Content-Type: text/csv

ID,Property,Client Name,Email,Phone,Status,Assigned To,Created At
1,Luxury 3BR House,Robert Tan,robert.tan@email.com,+639181234567,viewing_scheduled,Maria Santos,2024-12-08
```

### GET /api/reports/agent-performance

Export agent performance statistics to CSV.

**Authentication:** Required (Admin)

**Response (200):**
```
Content-Type: text/csv

Agent ID,Name,Email,Total Properties,Sold Inquiries,Active Inquiries,Total Commission
2,Maria Santos,maria.santos@realestate.com,5,3,7,2500000
```

### GET /api/reports/sales

Export sales report with commission details to CSV.

**Authentication:** Required (Admin)

**Query Parameters:**
- `start_date`: filter from date (optional)
- `end_date`: filter to date (optional)

**Response (200):**
```
Content-Type: text/csv

Property,Sale Price,Commission,Agent,Client,Date Sold
Penthouse in Ortigas,45000000,2250000,Pedro Gonzales,Anthony Ramirez,2024-12-01
```

---

## Health Check

### GET /health

Server health check (no authentication required).

**Response (200):**
```json
{
  "status": "ok",
  "timestamp": "2024-12-08T15:30:00Z"
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| 200  | Success |
| 201  | Created |
| 400  | Bad Request (validation error) |
| 401  | Unauthorized (missing or invalid token) |
| 403  | Forbidden (insufficient permissions) |
| 404  | Not Found |
| 409  | Conflict (duplicate, locked resource) |
| 500  | Internal Server Error |

---

## Rate Limiting

- **API endpoints:** 100 requests per 15 minutes per IP
- **Static files:** 100 requests per minute per IP

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1702051800
```

---

## WebSocket Events

Connect with JWT token:

```javascript
const socket = io('http://localhost:3000', {
  auth: {
    token: 'your_jwt_token'
  }
});
```

### Server → Client Events

- `inquiry_assigned`: Emitted when an inquiry is assigned to an agent
- `inquiry_status_changed`: Emitted when inquiry status changes
- `property_status_changed`: Emitted when property status changes
- `calendar_event_created`: Emitted when a new calendar event is created

**Event Payload Example:**
```json
{
  "type": "inquiry_assigned",
  "data": {
    "inquiry_id": 1,
    "agent_id": 2,
    "property_id": 1
  }
}
```

---

**Last Updated:** December 2025
