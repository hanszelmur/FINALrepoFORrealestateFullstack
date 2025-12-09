import pool from '../config/database';
import { RowDataPacket } from 'mysql2';

/**
 * Generate CSV from array of objects
 */
function generateCSV(headers: string[], rows: any[][]): string {
    const csvHeaders = headers.join(',');
    const csvRows = rows.map(row => 
        row.map(cell => {
            // Escape commas and quotes in cell values
            const cellStr = String(cell ?? '');
            if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
                return `"${cellStr.replace(/"/g, '""')}"`;
            }
            return cellStr;
        }).join(',')
    );
    
    return [csvHeaders, ...csvRows].join('\n');
}

/**
 * Generate properties CSV export
 */
export async function generatePropertiesCSV(filters?: {
    status?: string;
    property_type?: string;
}): Promise<string> {
    let query = `
        SELECT 
            p.id,
            p.title,
            p.property_type,
            p.status,
            p.price,
            p.location,
            p.address,
            p.bedrooms,
            p.bathrooms,
            p.floor_area,
            p.lot_area,
            u.full_name as agent_name,
            p.created_at,
            p.updated_at
        FROM properties p
        LEFT JOIN users u ON p.agent_id = u.id
        WHERE 1=1
    `;
    
    const params: any[] = [];

    if (filters?.status) {
        query += ' AND p.status = ?';
        params.push(filters.status);
    }

    if (filters?.property_type) {
        query += ' AND p.property_type = ?';
        params.push(filters.property_type);
    }

    query += ' ORDER BY p.created_at DESC';

    const [rows] = await pool.query<RowDataPacket[]>(query, params);

    const headers = [
        'ID', 'Title', 'Type', 'Status', 'Price', 'Location', 'Address',
        'Bedrooms', 'Bathrooms', 'Floor Area (sqm)', 'Lot Area (sqm)',
        'Agent', 'Created At', 'Updated At'
    ];

    const csvRows = rows.map(row => [
        row.id,
        row.title,
        row.property_type,
        row.status,
        row.price,
        row.location,
        row.address || '',
        row.bedrooms || '',
        row.bathrooms || '',
        row.floor_area || '',
        row.lot_area || '',
        row.agent_name || '',
        new Date(row.created_at).toISOString(),
        new Date(row.updated_at).toISOString()
    ]);

    return generateCSV(headers, csvRows);
}

/**
 * Generate inquiries CSV export
 */
export async function generateInquiriesCSV(filters?: {
    status?: string;
    start_date?: Date;
    end_date?: Date;
}): Promise<string> {
    let query = `
        SELECT 
            i.id,
            p.title as property_title,
            i.client_name,
            i.client_email,
            i.client_phone,
            i.status,
            u.full_name as agent_name,
            i.commission_amount,
            i.message,
            i.created_at,
            i.updated_at
        FROM inquiries i
        LEFT JOIN properties p ON i.property_id = p.id
        LEFT JOIN users u ON i.assigned_to = u.id
        WHERE 1=1
    `;
    
    const params: any[] = [];

    if (filters?.status) {
        query += ' AND i.status = ?';
        params.push(filters.status);
    }

    if (filters?.start_date) {
        query += ' AND i.created_at >= ?';
        params.push(filters.start_date);
    }

    if (filters?.end_date) {
        query += ' AND i.created_at <= ?';
        params.push(filters.end_date);
    }

    query += ' ORDER BY i.created_at DESC';

    const [rows] = await pool.query<RowDataPacket[]>(query, params);

    const headers = [
        'ID', 'Property', 'Client Name', 'Email', 'Phone', 'Status',
        'Assigned Agent', 'Commission', 'Message', 'Created At', 'Updated At'
    ];

    const csvRows = rows.map(row => [
        row.id,
        row.property_title || '',
        row.client_name,
        row.client_email,
        row.client_phone,
        row.status,
        row.agent_name || 'Unassigned',
        row.commission_amount || '',
        row.message || '',
        new Date(row.created_at).toISOString(),
        new Date(row.updated_at).toISOString()
    ]);

    return generateCSV(headers, csvRows);
}

/**
 * Generate sales report CSV with commission details
 */
export async function generateSalesCSV(filters?: {
    start_date?: Date;
    end_date?: Date;
}): Promise<string> {
    let query = `
        SELECT 
            p.id as property_id,
            p.title as property_title,
            p.property_type,
            p.price as sale_price,
            p.location,
            i.commission_amount,
            i.client_name,
            i.client_email,
            u.full_name as agent_name,
            u.email as agent_email,
            i.updated_at as sold_date
        FROM properties p
        INNER JOIN inquiries i ON p.id = i.property_id
        LEFT JOIN users u ON i.assigned_to = u.id
        WHERE p.status = 'sold' AND i.status = 'sold'
    `;
    
    const params: any[] = [];

    if (filters?.start_date) {
        query += ' AND i.updated_at >= ?';
        params.push(filters.start_date);
    }

    if (filters?.end_date) {
        query += ' AND i.updated_at <= ?';
        params.push(filters.end_date);
    }

    query += ' ORDER BY i.updated_at DESC';

    const [rows] = await pool.query<RowDataPacket[]>(query, params);

    const headers = [
        'Property ID', 'Property Title', 'Type', 'Sale Price', 'Location',
        'Commission', 'Client Name', 'Client Email', 'Agent Name',
        'Agent Email', 'Date Sold'
    ];

    const csvRows = rows.map(row => [
        row.property_id,
        row.property_title,
        row.property_type,
        row.sale_price,
        row.location,
        row.commission_amount || 0,
        row.client_name,
        row.client_email,
        row.agent_name || '',
        row.agent_email || '',
        new Date(row.sold_date).toISOString()
    ]);

    return generateCSV(headers, csvRows);
}

/**
 * Generate agent performance CSV
 */
export async function generateAgentPerformanceCSV(): Promise<string> {
    const query = `
        SELECT 
            u.id as agent_id,
            u.full_name,
            u.email,
            u.phone,
            COUNT(DISTINCT p.id) as total_properties,
            COUNT(DISTINCT CASE WHEN i.status = 'sold' THEN i.id END) as sold_inquiries,
            COUNT(DISTINCT CASE WHEN i.status IN ('new', 'contacted', 'viewing_scheduled', 'viewing_completed', 'negotiating', 'deposit_paid') THEN i.id END) as active_inquiries,
            COALESCE(SUM(CASE WHEN i.status = 'sold' THEN i.commission_amount END), 0) as total_commission,
            ROUND(
                COUNT(DISTINCT CASE WHEN i.status = 'sold' THEN i.id END) * 100.0 / 
                NULLIF(COUNT(DISTINCT i.id), 0), 2
            ) as success_rate
        FROM users u
        LEFT JOIN properties p ON u.id = p.agent_id
        LEFT JOIN inquiries i ON u.id = i.assigned_to
        WHERE u.role = 'agent' AND u.status = 'active'
        GROUP BY u.id, u.full_name, u.email, u.phone
        ORDER BY total_commission DESC
    `;

    const [rows] = await pool.query<RowDataPacket[]>(query);

    const headers = [
        'Agent ID', 'Name', 'Email', 'Phone', 'Total Properties',
        'Sold Inquiries', 'Active Inquiries', 'Total Commission', 'Success Rate (%)'
    ];

    const csvRows = rows.map(row => [
        row.agent_id,
        row.full_name,
        row.email,
        row.phone || '',
        row.total_properties,
        row.sold_inquiries,
        row.active_inquiries,
        row.total_commission,
        row.success_rate || 0
    ]);

    return generateCSV(headers, csvRows);
}
