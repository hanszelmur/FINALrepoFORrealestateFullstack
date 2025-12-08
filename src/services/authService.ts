import bcrypt from 'bcrypt';
import pool from '../config/database';
import { User } from '../types';
import { generateToken } from '../utils/jwt';
import { RowDataPacket } from 'mysql2';

export const login = async (
    email: string,
    password: string
): Promise<{ token: string; user: Omit<User, 'password_hash'> }> => {
    const [rows] = await pool.query<(User & RowDataPacket)[]>(
        'SELECT * FROM users WHERE email = ? AND status = ?',
        [email, 'active']
    );

    if (rows.length === 0) {
        throw new Error('Invalid credentials');
    }

    const user = rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
        throw new Error('Invalid credentials');
    }

    const token = generateToken({
        id: user.id,
        email: user.email,
        role: user.role
    });

    const { password_hash, ...userWithoutPassword } = user;

    return { token, user: userWithoutPassword };
};

export const register = async (
    email: string,
    password: string,
    full_name: string,
    role: 'admin' | 'agent' = 'agent',
    phone?: string
): Promise<{ token: string; user: Omit<User, 'password_hash'> }> => {
    // Check if user already exists
    const [existing] = await pool.query<RowDataPacket[]>(
        'SELECT id FROM users WHERE email = ?',
        [email]
    );

    if (existing.length > 0) {
        throw new Error('User with this email already exists');
    }

    const password_hash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
        'INSERT INTO users (email, password_hash, full_name, role, phone) VALUES (?, ?, ?, ?, ?)',
        [email, password_hash, full_name, role, phone]
    );

    const userId = (result as any).insertId;

    const [rows] = await pool.query<(User & RowDataPacket)[]>(
        'SELECT * FROM users WHERE id = ?',
        [userId]
    );

    const user = rows[0];
    const token = generateToken({
        id: user.id,
        email: user.email,
        role: user.role
    });

    const { password_hash: _, ...userWithoutPassword } = user;

    return { token, user: userWithoutPassword };
};
