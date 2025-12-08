import jwt from 'jsonwebtoken';

interface TokenPayload {
    id: number;
    email: string;
    role: 'admin' | 'agent';
}

export const generateToken = (payload: TokenPayload): string => {
    return jwt.sign(
        payload,
        process.env.JWT_SECRET || 'secret',
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
};

export const verifyToken = (token: string): TokenPayload => {
    return jwt.verify(token, process.env.JWT_SECRET || 'secret') as TokenPayload;
};
