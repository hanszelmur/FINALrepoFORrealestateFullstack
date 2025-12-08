import express, { Application, Request, Response } from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import path from 'path';

// Load environment variables
dotenv.config();

// Validate critical environment variables
const requiredEnvVars = ['JWT_SECRET', 'DB_HOST', 'DB_USER', 'DB_NAME'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
    console.error('✗ Missing required environment variables:', missingEnvVars.join(', '));
    console.error('Please configure these in your .env file');
    process.exit(1);
}

// Warn about insecure configurations
if (process.env.NODE_ENV === 'production') {
    if (!process.env.DB_PASSWORD) {
        console.warn('⚠ Warning: DB_PASSWORD is not set. This is insecure for production!');
    }
    if (process.env.JWT_SECRET === 'your_super_secret_jwt_key_change_this_in_production') {
        console.error('✗ Error: Default JWT_SECRET detected. Change this in production!');
        process.exit(1);
    }
}

// Import routes
import authRoutes from './routes/authRoutes';
import propertyRoutes from './routes/propertyRoutes';
import inquiryRoutes from './routes/inquiryRoutes';
import calendarRoutes from './routes/calendarRoutes';
import agentRoutes from './routes/agentRoutes';
import reportRoutes from './routes/reportRoutes';

// Import config
import { testConnection } from './config/database';
import { initializeSocket } from './config/socket';
import { startReservationExpiryJob } from './jobs/reservationExpiry';

// Initialize Express app
const app: Application = express();
const server = http.createServer(app);

// Initialize Socket.io
initializeSocket(server);

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false
});

app.use('/api/', limiter);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/reports', reportRoutes);

// Serve frontend static files (if exists)
app.use(express.static(path.join(__dirname, '../public')));

// Catch-all route for SPA
app.get('*', (req: Request, res: Response) => {
    const publicPath = path.join(__dirname, '../public/index.html');
    res.sendFile(publicPath, (err) => {
        if (err) {
            res.status(404).json({ error: 'Not found' });
        }
    });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: any) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error'
    });
});

// Start server
const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        // Test database connection
        await testConnection();

        // Start cron jobs
        startReservationExpiryJob();

        // Start server
        server.listen(PORT, () => {
            console.log('='.repeat(50));
            console.log('🏠 Real Estate Management System');
            console.log('='.repeat(50));
            console.log(`✓ Server running on port ${PORT}`);
            console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`✓ API: http://localhost:${PORT}/api`);
            console.log(`✓ Health check: http://localhost:${PORT}/health`);
            console.log('='.repeat(50));
        });
    } catch (error) {
        console.error('✗ Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

export default app;
