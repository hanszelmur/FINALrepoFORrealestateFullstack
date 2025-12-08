import { Response } from 'express';
import { AuthRequest } from '../types';
import pool from '../config/database';
import { RowDataPacket } from 'mysql2';

const generateCSV = (data: any[], headers: string[]): string => {
    const rows = [headers.join(',')];
    
    data.forEach(row => {
        const values = headers.map(header => {
            const value = row[header];
            if (value === null || value === undefined) return '';
            // Escape commas and quotes
            const stringValue = String(value);
            if (stringValue.includes(',') || stringValue.includes('"')) {
                return `"${stringValue.replace(/"/g, '""')}"`;
            }
            return stringValue;
        });
        rows.push(values.join(','));
    });
    
    return rows.join('\n');
};

export const exportPropertiesCSV = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const [properties] = await pool.query<RowDataPacket[]>(
            `SELECT 
                p.id, p.title, p.property_type, p.status, p.price, 
                p.location, p.bedrooms, p.bathrooms, p.floor_area, p.lot_area,
                u.full_name as agent_name, p.created_at
            FROM properties p
            LEFT JOIN users u ON p.agent_id = u.id
            ORDER BY p.created_at DESC`
        );

        const headers = [
            'id', 'title', 'property_type', 'status', 'price', 
            'location', 'bedrooms', 'bathrooms', 'floor_area', 'lot_area',
            'agent_name', 'created_at'
        ];

        const csv = generateCSV(properties, headers);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=properties.csv');
        res.send(csv);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const exportInquiriesCSV = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const [inquiries] = await pool.query<RowDataPacket[]>(
            `SELECT 
                i.id, i.client_name, i.client_email, i.client_phone,
                i.status, i.commission_amount,
                p.title as property_title, p.location as property_location,
                u.full_name as assigned_agent, i.created_at
            FROM inquiries i
            JOIN properties p ON i.property_id = p.id
            LEFT JOIN users u ON i.assigned_to = u.id
            ORDER BY i.created_at DESC`
        );

        const headers = [
            'id', 'client_name', 'client_email', 'client_phone',
            'status', 'commission_amount',
            'property_title', 'property_location',
            'assigned_agent', 'created_at'
        ];

        const csv = generateCSV(inquiries, headers);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=inquiries.csv');
        res.send(csv);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const exportAgentPerformanceCSV = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const [stats] = await pool.query<RowDataPacket[]>(
            'SELECT * FROM agent_stats ORDER BY total_commission DESC'
        );

        const headers = [
            'agent_id', 'full_name', 'email',
            'total_properties', 'sold_inquiries', 'active_inquiries',
            'total_commission'
        ];

        const csv = generateCSV(stats, headers);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=agent-performance.csv');
        res.send(csv);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const exportSalesReportCSV = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const [sales] = await pool.query<RowDataPacket[]>(
            `SELECT 
                p.id as property_id, p.title, p.property_type, p.price,
                i.id as inquiry_id, i.client_name, i.client_email,
                i.commission_amount, i.updated_at as sold_date,
                u.full_name as agent_name
            FROM inquiries i
            JOIN properties p ON i.property_id = p.id
            JOIN users u ON i.assigned_to = u.id
            WHERE i.status = 'sold'
            ORDER BY i.updated_at DESC`
        );

        const headers = [
            'property_id', 'title', 'property_type', 'price',
            'inquiry_id', 'client_name', 'client_email',
            'commission_amount', 'sold_date', 'agent_name'
        ];

        const csv = generateCSV(sales, headers);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=sales-report.csv');
        res.send(csv);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
