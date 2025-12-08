import pool from '../config/database';
import { Inquiry, InquiryStatus, InquiryStatusHistory } from '../types';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const checkDuplicateInquiry = async (
    propertyId: number,
    clientEmail: string,
    clientPhone: string
): Promise<Inquiry | null> => {
    const [rows] = await pool.query<(Inquiry & RowDataPacket)[]>(
        `SELECT * FROM inquiries 
        WHERE property_id = ? 
        AND (client_email = ? OR client_phone = ?)
        AND status NOT IN ('cancelled', 'expired')
        ORDER BY created_at DESC
        LIMIT 1`,
        [propertyId, clientEmail, clientPhone]
    );

    return rows.length > 0 ? rows[0] : null;
};

export const createInquiry = async (data: {
    property_id: number;
    client_name: string;
    client_email: string;
    client_phone: string;
    message?: string;
}): Promise<Inquiry> => {
    // Check for duplicate
    const duplicate = await checkDuplicateInquiry(
        data.property_id,
        data.client_email,
        data.client_phone
    );

    if (duplicate) {
        throw new Error('You already have an active inquiry for this property');
    }

    const [result] = await pool.query<ResultSetHeader>(
        `INSERT INTO inquiries 
        (property_id, client_name, client_email, client_phone, message, status)
        VALUES (?, ?, ?, ?, ?, 'new')`,
        [
            data.property_id,
            data.client_name,
            data.client_email,
            data.client_phone,
            data.message
        ]
    );

    const inquiry = await getInquiryById(result.insertId);
    return inquiry!;
};

export const getInquiryById = async (id: number): Promise<Inquiry | null> => {
    const [rows] = await pool.query<(Inquiry & RowDataPacket)[]>(
        'SELECT * FROM inquiries WHERE id = ?',
        [id]
    );

    return rows.length > 0 ? rows[0] : null;
};

export const getAllInquiries = async (filters?: {
    status?: InquiryStatus;
    property_id?: number;
    assigned_to?: number;
}): Promise<Inquiry[]> => {
    let query = 'SELECT * FROM inquiries WHERE 1=1';
    const params: any[] = [];

    if (filters?.status) {
        query += ' AND status = ?';
        params.push(filters.status);
    }

    if (filters?.property_id) {
        query += ' AND property_id = ?';
        params.push(filters.property_id);
    }

    if (filters?.assigned_to) {
        query += ' AND assigned_to = ?';
        params.push(filters.assigned_to);
    }

    query += ' ORDER BY created_at DESC';

    const [rows] = await pool.query<(Inquiry & RowDataPacket)[]>(query, params);
    return rows;
};

export const assignInquiry = async (
    inquiryId: number,
    agentId: number,
    assignedBy: number
): Promise<Inquiry> => {
    const inquiry = await getInquiryById(inquiryId);
    if (!inquiry) {
        throw new Error('Inquiry not found');
    }

    await pool.query(
        'UPDATE inquiries SET assigned_to = ? WHERE id = ?',
        [agentId, inquiryId]
    );

    return getInquiryById(inquiryId) as Promise<Inquiry>;
};

export const reassignInquiry = async (
    inquiryId: number,
    newAgentId: number,
    reassignedBy: number
): Promise<Inquiry> => {
    const inquiry = await getInquiryById(inquiryId);
    if (!inquiry) {
        throw new Error('Inquiry not found');
    }

    // Block reassignment if deposit is paid and commission is locked
    if (inquiry.commission_locked) {
        throw new Error('Cannot reassign inquiry - commission is locked after deposit payment');
    }

    await pool.query(
        'UPDATE inquiries SET assigned_to = ? WHERE id = ?',
        [newAgentId, inquiryId]
    );

    return getInquiryById(inquiryId) as Promise<Inquiry>;
};

export const updateInquiryStatus = async (
    inquiryId: number,
    newStatus: InquiryStatus,
    userId: number,
    notes?: string,
    commissionAmount?: number
): Promise<Inquiry> => {
    const inquiry = await getInquiryById(inquiryId);
    if (!inquiry) {
        throw new Error('Inquiry not found');
    }

    const oldStatus = inquiry.status;

    // Lock commission when deposit is paid
    const commissionLocked = newStatus === 'deposit_paid' || inquiry.commission_locked;

    // Update inquiry
    const updates: string[] = ['status = ?'];
    const values: any[] = [newStatus];

    if (notes !== undefined) {
        updates.push('notes = ?');
        values.push(notes);
    }

    if (commissionAmount !== undefined) {
        updates.push('commission_amount = ?');
        values.push(commissionAmount);
    }

    if (commissionLocked) {
        updates.push('commission_locked = ?');
        values.push(true);
    }

    values.push(inquiryId);

    await pool.query(
        `UPDATE inquiries SET ${updates.join(', ')} WHERE id = ?`,
        values
    );

    // Add status history
    await pool.query(
        'INSERT INTO inquiry_status_history (inquiry_id, old_status, new_status, changed_by, notes) VALUES (?, ?, ?, ?, ?)',
        [inquiryId, oldStatus, newStatus, userId, notes]
    );

    // If status is 'reserved' or 'sold', update property
    if (newStatus === 'reserved' || newStatus === 'sold') {
        const reservationType = newStatus === 'sold' ? 'full_payment' : 'deposit';
        const propertyStatus = newStatus === 'sold' ? 'sold' : 'reserved';

        await pool.query(
            `UPDATE properties SET 
                status = ?,
                reservation_type = ?,
                reservation_date = NOW(),
                reserved_by_inquiry_id = ?
            WHERE id = ?`,
            [propertyStatus, reservationType, inquiryId, inquiry.property_id]
        );

        // Cancel other inquiries for this property
        await pool.query(
            `UPDATE inquiries SET status = 'cancelled'
            WHERE property_id = ? AND id != ? AND status NOT IN ('sold', 'cancelled', 'expired')`,
            [inquiry.property_id, inquiryId]
        );
    }

    return getInquiryById(inquiryId) as Promise<Inquiry>;
};

export const getInquiryHistory = async (inquiryId: number): Promise<InquiryStatusHistory[]> => {
    const [rows] = await pool.query<(InquiryStatusHistory & RowDataPacket)[]>(
        `SELECT ish.*, u.full_name as changed_by_name
        FROM inquiry_status_history ish
        JOIN users u ON ish.changed_by = u.id
        WHERE ish.inquiry_id = ?
        ORDER BY ish.created_at DESC`,
        [inquiryId]
    );

    return rows;
};

export const expireReservations = async (): Promise<number> => {
    // Find expired reservations
    const [properties] = await pool.query<RowDataPacket[]>(
        `SELECT p.id, p.reserved_by_inquiry_id 
        FROM properties p
        WHERE p.status = 'reserved' 
        AND p.reservation_expiry < NOW()
        AND p.reservation_type = 'deposit'`
    );

    let expiredCount = 0;

    for (const property of properties) {
        // Update property to available
        await pool.query(
            `UPDATE properties SET 
                status = 'available',
                reservation_type = 'none',
                reservation_date = NULL,
                reservation_expiry = NULL,
                reserved_by_inquiry_id = NULL
            WHERE id = ?`,
            [property.id]
        );

        // Update inquiry to expired
        if (property.reserved_by_inquiry_id) {
            await pool.query(
                'UPDATE inquiries SET status = ? WHERE id = ?',
                ['expired', property.reserved_by_inquiry_id]
            );
        }

        expiredCount++;
    }

    return expiredCount;
};
