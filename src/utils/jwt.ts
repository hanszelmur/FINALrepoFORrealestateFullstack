import jwt from 'jsonwebtoken';

interface TokenPayload {
    id: number;
    email: string;
    role: 'admin' | 'agent';
}

export const generateToken = (payload: TokenPayload): string => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined in environment variables');
    }
    return jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

export const verifyToken = (token: string): TokenPayload => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined in environment variables');
    }
    return jwt.verify(token, process.env.JWT_SECRET) as TokenPayload;
};
