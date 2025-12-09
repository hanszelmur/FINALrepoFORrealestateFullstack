# Real Estate Management System - Full Stack Application

A complete, production-ready real estate management system built with Node.js, TypeScript, MySQL, and Socket.io.

## 🚀 Tech Stack

- **Backend**: Node.js 18+ with Express and TypeScript
- **Database**: MySQL 8.0
- **Real-time**: Socket.io for WebSocket connections
- **Authentication**: JWT with bcrypt password hashing
- **File Upload**: Multer with Sharp for image processing
- **Validation**: Joi for input validation
- **Security**: Rate limiting, JWT-based CSRF protection, SQL injection prevention
- **Frontend**: Vanilla JavaScript with modern ES6+ features

## 📋 Features

### Complete Backend System

1. **Authentication & Authorization**
   - JWT-based authentication
   - Role-based access control (Admin/Agent)
   - Secure password hashing with bcrypt
   - Token expiration and refresh

2. **Properties Management**
   - Full CRUD operations
   - Photo uploads with automatic resizing (1200x800) and thumbnails (400x300)
   - Property status workflows (available → reserved → sold)
   - Advanced filtering (status, type, price range, location)
   - Support for multiple property types (house, condo, townhouse, lot, commercial)

3. **Inquiries Management**
   - Duplicate detection (email OR phone for same property)
   - Assign/reassign to agents
   - 11-status workflow tracking
   - Commission locking when deposit paid
   - Complete status history tracking
   - Auto-cancel other inquiries when property reserved

4. **Calendar System**
   - Event CRUD with conflict detection
   - 30-minute buffer between events
   - Support for viewings, meetings, deadlines
   - Agent-specific calendars

5. **Agent Management**
   - Performance statistics
   - Property assignments
   - Commission tracking
   - Active inquiry monitoring

6. **Reports & Analytics**
   - CSV export for properties
   - CSV export for inquiries
   - Agent performance reports
   - Sales reports with commission details

7. **Business Logic**
   - Reservation expiry cron job (runs daily at midnight)
   - Automatic status updates
   - Commission locking mechanism
   - Conflict detection for calendar events

8. **Real-time Updates**
   - WebSocket connections with Socket.io
   - Real-time inquiry assignments
   - Property status change notifications
   - Calendar event notifications
   - Separate rooms for admin and agents

9. **Security Features**
   - Express rate limiting (100 requests per 15 minutes)
   - JWT-based CSRF protection (tokens in Authorization header)
   - SQL injection prevention (parameterized queries)
   - File upload validation
   - Input sanitization
   - Secure password policies

## ⚠️ IMPORTANT: Agent Creation Security

**There is NO "Add Agent" form in the admin portal UI.** This is an intentional security design.

To create new agents, use ONE of these methods:
1. **CLI Script (Recommended)**: `npm run add-agent` - Interactive prompts with validation
2. **Direct SQL Insert**: For advanced admins with database access
3. **Protected API**: For HR system integrations only (requires admin JWT + secret)

See [AGENT_CREATION_GUIDE.md](./AGENT_CREATION_GUIDE.md) for detailed instructions.

Admins can view, deactivate, reactivate, and reset passwords for existing agents through the web UI.

## 🛠️ Installation & Setup

### Prerequisites

- Node.js 18 or higher
- MySQL 8.0 or higher
- npm or yarn

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd FINALrepoFORrealestateFullstack
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=real_estate_db

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=24h

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads/properties

# CSRF Configuration
CSRF_SECRET=your_csrf_secret_key_change_this_in_production

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS Configuration
CORS_ORIGIN=http://localhost:3001
```

### Step 4: Set Up Database

Run the database schema:

```bash
mysql -u root -p < database/schema.sql
```

Seed the database with sample data:

```bash
mysql -u root -p real_estate_db < database/seed.sql
```

### Step 5: Build the Application

```bash
npm run build
```

### Step 6: Start the Server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will be available at `http://localhost:3000`

### Step 7: Create Agents (Optional)

To add new agents to the system:

```bash
npm run add-agent
```

Follow the interactive prompts to create an agent account. See [AGENT_CREATION_GUIDE.md](./AGENT_CREATION_GUIDE.md) for alternative methods.

## 📚 API Documentation

### Authentication Endpoints

#### POST `/api/auth/login`
Login with email and password.

**Request Body:**
```json
{
  "email": "admin@realestate.com",
  "password": "Admin123!@#"
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "email": "admin@realestate.com",
    "full_name": "System Administrator",
    "role": "admin"
  }
}
```

#### POST `/api/auth/register`
Register a new user (admin only).

**Request Body:**
```json
{
  "email": "newagent@realestate.com",
  "password": "SecurePass123!@#",
  "full_name": "New Agent",
  "role": "agent",
  "phone": "+639171234567"
}
```

### Properties Endpoints

#### GET `/api/properties`
Get all properties with optional filters.

**Query Parameters:**
- `status`: available, reserved, sold, archived
- `property_type`: house, condo, townhouse, lot, commercial
- `min_price`: minimum price
- `max_price`: maximum price
- `location`: location search term

#### GET `/api/properties/:id`
Get a specific property by ID with photos.

#### POST `/api/properties`
Create a new property (requires authentication).

**Request Body:**
```json
{
  "title": "Luxury Condo in BGC",
  "description": "Modern 2BR condo with city view",
  "property_type": "condo",
  "price": 8500000,
  "location": "Bonifacio Global City",
  "address": "Unit 1503, One Serendra",
  "bedrooms": 2,
  "bathrooms": 2,
  "floor_area": 95,
  "features": ["furnished", "pool", "gym"],
  "agent_id": 2
}
```

#### PUT `/api/properties/:id`
Update a property (requires authentication).

#### DELETE `/api/properties/:id`
Delete a property (requires authentication).

#### POST `/api/properties/:id/photos`
Upload property photos (requires authentication, multipart/form-data).

**Form Data:**
- `photos`: Array of image files (max 10)

#### DELETE `/api/properties/:id/photos/:photoId`
Delete a property photo (requires authentication).

### Inquiries Endpoints

#### POST `/api/inquiries`
Create a new inquiry (public endpoint).

**Request Body:**
```json
{
  "property_id": 1,
  "client_name": "John Doe",
  "client_email": "john@example.com",
  "client_phone": "+639181234567",
  "message": "I'm interested in this property"
}
```

#### GET `/api/inquiries`
Get all inquiries with filters (requires authentication).

**Query Parameters:**
- `status`: inquiry status
- `property_id`: filter by property
- `assigned_to`: filter by agent

#### GET `/api/inquiries/:id`
Get inquiry details with history (requires authentication).

#### POST `/api/inquiries/:id/assign`
Assign inquiry to an agent (requires agent/admin role).

**Request Body:**
```json
{
  "agent_id": 2
}
```

#### POST `/api/inquiries/:id/reassign`
Reassign inquiry to another agent (blocked if commission locked).

#### PUT `/api/inquiries/:id/status`
Update inquiry status (requires agent/admin role).

**Request Body:**
```json
{
  "status": "deposit_paid",
  "notes": "Deposit received",
  "commission_amount": 425000
}
```

### Calendar Endpoints

#### POST `/api/calendar`
Create a calendar event (requires agent/admin role).

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

#### GET `/api/calendar`
Get calendar events with filters (requires authentication).

**Query Parameters:**
- `agent_id`: filter by agent
- `start_date`: filter from date
- `end_date`: filter to date
- `status`: scheduled, completed, cancelled
- `event_type`: viewing, meeting, deadline, other

#### PUT `/api/calendar/:id`
Update calendar event (requires agent/admin role).

#### DELETE `/api/calendar/:id`
Delete calendar event (requires agent/admin role).

### Agents Endpoints

#### GET `/api/agents`
Get all active agents (requires authentication).

#### GET `/api/agents/:id`
Get agent details (requires authentication).

#### GET `/api/agents/stats`
Get agent performance statistics (requires authentication).

**Query Parameters:**
- `agent_id`: filter by specific agent

### Reports Endpoints (Admin Only)

#### GET `/api/reports/properties`
Export all properties to CSV.

#### GET `/api/reports/inquiries`
Export all inquiries to CSV.

#### GET `/api/reports/agent-performance`
Export agent performance statistics to CSV.

#### GET `/api/reports/sales`
Export sales report with commission details to CSV.

## 🔌 WebSocket Events

### Client → Server

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

## 📊 Database Schema

### Tables

1. **users** - Admin and agent accounts
2. **properties** - Property listings
3. **property_photos** - Property images
4. **inquiries** - Client inquiries
5. **inquiry_status_history** - Inquiry status change tracking
6. **calendar_events** - Agent calendar events

### Views

1. **agent_stats** - Aggregated agent performance metrics

## 🔐 Default Credentials

After running the seed script:

**Admin Account:**
- Email: `admin@realestate.com`
- Password: `Admin123!@#`

**Agent Accounts:**
- Email: `maria.santos@realestate.com` (and 5 others)
- Password: `Agent123!@#`

**⚠️ IMPORTANT:** Change these passwords in production!

## 📱 Frontend

The system includes a responsive web interface accessible at `http://localhost:3000` featuring:

- Login/authentication
- Property listings with filters
- Inquiry management
- Calendar view
- Agent statistics
- Real-time WebSocket notifications
- CSV report exports

## 🔄 Cron Jobs

### Reservation Expiry Job

Runs daily at midnight (00:00) to:
- Find expired reservations (deposit type only)
- Update property status to available
- Update inquiry status to expired
- Clear reservation details

## 🛡️ Security Features

1. **Authentication**
   - JWT tokens with configurable expiration
   - Secure password hashing (bcrypt, 10 rounds)
   - Role-based access control

2. **Input Validation**
   - Joi schemas for all inputs
   - Philippine phone number validation
   - Email validation
   - Price range validation
   - Required field checks

3. **SQL Injection Prevention**
   - All queries use parameterized statements
   - No raw SQL string concatenation

4. **Rate Limiting**
   - 100 requests per 15 minutes per IP
   - Configurable window and limits

5. **CSRF Protection**
   - CSRF tokens for state-changing operations
   - Configurable secret key

6. **File Upload Security**
   - File type validation (JPEG, JPG, PNG only)
   - File size limits (5MB default)
   - Automatic image processing and sanitization

7. **Input Sanitization**
   - Remove HTML tags
   - Remove control characters
   - Trim whitespace

## 🚀 Deployment Guide

### Prerequisites for Production

1. MySQL 8.0+ server
2. Node.js 18+ runtime
3. Reverse proxy (nginx/Apache)
4. SSL certificate
5. Process manager (PM2 recommended)

### Production Deployment Steps

1. **Clone and install:**
   ```bash
   git clone <repo>
   cd FINALrepoFORrealestateFullstack
   npm install --production
   ```

2. **Configure environment:**
   - Set `NODE_ENV=production`
   - Use strong JWT_SECRET and CSRF_SECRET
   - Configure database credentials
   - Set proper CORS_ORIGIN
   - Update file upload limits if needed

3. **Set up database:**
   ```bash
   mysql -u root -p < database/schema.sql
   mysql -u root -p real_estate_db < database/seed.sql
   ```

4. **Build application:**
   ```bash
   npm run build
   ```

5. **Start with PM2:**
   ```bash
   npm install -g pm2
   pm2 start dist/server.js --name real-estate-api
   pm2 save
   pm2 startup
   ```

6. **Configure nginx reverse proxy:**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

7. **Set up SSL with Let's Encrypt:**
   ```bash
   sudo certbot --nginx -d yourdomain.com
   ```

8. **Configure firewall:**
   ```bash
   sudo ufw allow 80
   sudo ufw allow 443
   sudo ufw enable
   ```

## 🧪 Testing

The system includes comprehensive validation and error handling. To test:

1. **Database Connection:** Check `/health` endpoint
2. **Authentication:** Try login with default credentials
3. **API Endpoints:** Use Postman or curl to test each endpoint
4. **WebSocket:** Open browser console to see real-time events
5. **File Upload:** Upload property photos through the API
6. **Cron Jobs:** Check logs at midnight for reservation expiry

## 📝 Environment Variables Reference

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 3000 |
| NODE_ENV | Environment | development |
| DB_HOST | MySQL host | localhost |
| DB_PORT | MySQL port | 3306 |
| DB_USER | MySQL user | root |
| DB_PASSWORD | MySQL password | - |
| DB_NAME | Database name | real_estate_db |
| JWT_SECRET | JWT signing key | (required) |
| JWT_EXPIRES_IN | Token expiration | 24h |
| MAX_FILE_SIZE | Max upload size (bytes) | 5242880 |
| UPLOAD_DIR | Upload directory | ./uploads/properties |
| CSRF_SECRET | CSRF token secret | (required) |
| RATE_LIMIT_WINDOW_MS | Rate limit window | 900000 |
| RATE_LIMIT_MAX_REQUESTS | Max requests per window | 100 |
| CORS_ORIGIN | CORS allowed origin | http://localhost:3001 |

## 🐛 Troubleshooting

### Database Connection Issues
- Verify MySQL is running: `sudo systemctl status mysql`
- Check credentials in `.env`
- Ensure database exists: `SHOW DATABASES;`

### Port Already in Use
- Change PORT in `.env`
- Or kill process: `lsof -ti:3000 | xargs kill`

### File Upload Fails
- Check `uploads/properties` directory exists
- Verify write permissions
- Check MAX_FILE_SIZE setting

### WebSocket Not Connecting
- Verify JWT token is valid
- Check CORS settings
- Ensure Socket.io client version matches server

## 📄 License

MIT License - See LICENSE file for details

## 📚 Additional Documentation

- **[AGENT_CREATION_GUIDE.md](./AGENT_CREATION_GUIDE.md)** - How to create new agents (CLI, SQL, API)
- **[API_DOCS.md](./API_DOCS.md)** - Complete API reference with examples
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Production deployment guide with security checklist

## 👥 Support

For issues and questions, please open an issue on the repository.

---

**Built with ❤️ using Node.js, TypeScript, MySQL, and Socket.io**