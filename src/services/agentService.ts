import pool from '../config/database';
import { User, AgentStats } from '../types';
import { RowDataPacket } from 'mysql2';

export const getAllAgents = async (): Promise<User[]> => {
    const [rows] = await pool.query<(User & RowDataPacket)[]>(
        `SELECT id, email, full_name, role, phone, status, created_at, updated_at 
        FROM users 
        WHERE role = 'agent' AND status = 'active'
        ORDER BY full_name`
    );

    return rows;
};

export const getAgentById = async (id: number): Promise<User | null> => {
    const [rows] = await pool.query<(User & RowDataPacket)[]>(
        `SELECT id, email, full_name, role, phone, status, created_at, updated_at 
        FROM users 
        WHERE id = ? AND role = 'agent'`,
        [id]
    );

    return rows.length > 0 ? rows[0] : null;
};

export const getAgentStats = async (agentId?: number): Promise<AgentStats[]> => {
    let query = 'SELECT * FROM agent_stats';
    const params: any[] = [];

    if (agentId) {
        query += ' WHERE agent_id = ?';
        params.push(agentId);
    }

    query += ' ORDER BY total_commission DESC, sold_inquiries DESC';

    const [rows] = await pool.query<(AgentStats & RowDataPacket)[]>(query, params);
    return rows;
};
