import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import { verifyToken } from '../utils/jwt';

let io: Server;

export const initializeSocket = (server: HTTPServer): Server => {
    io = new Server(server, {
        cors: {
            origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
            methods: ['GET', 'POST'],
            credentials: true
        }
    });

    io.use((socket: Socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) {
                return next(new Error('Authentication required'));
            }

            const decoded = verifyToken(token);
            (socket as any).user = decoded;
            next();
        } catch (error) {
            next(new Error('Invalid token'));
        }
    });

    io.on('connection', (socket: Socket) => {
        const user = (socket as any).user;
        console.log(`User connected: ${user.email} (${user.role})`);

        // Join room based on role
        if (user.role === 'admin') {
            socket.join('admin');
        }
        socket.join(`agent_${user.id}`);

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${user.email}`);
        });
    });

    return io;
};

export const getIO = (): Server => {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
};

// Event emitters
export const emitInquiryAssigned = (agentId: number, inquiry: any): void => {
    const io = getIO();
    io.to(`agent_${agentId}`).emit('inquiry_assigned', inquiry);
    io.to('admin').emit('inquiry_assigned', inquiry);
};

export const emitPropertyStatusChanged = (property: any): void => {
    const io = getIO();
    io.emit('property_status_changed', property);
};

export const emitInquiryStatusChanged = (inquiry: any): void => {
    const io = getIO();
    if (inquiry.assigned_to) {
        io.to(`agent_${inquiry.assigned_to}`).emit('inquiry_status_changed', inquiry);
    }
    io.to('admin').emit('inquiry_status_changed', inquiry);
};

export const emitCalendarEventCreated = (agentId: number, event: any): void => {
    const io = getIO();
    io.to(`agent_${agentId}`).emit('calendar_event_created', event);
    io.to('admin').emit('calendar_event_created', event);
};
