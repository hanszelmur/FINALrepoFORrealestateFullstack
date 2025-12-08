import pool from '../config/database';
import { Property, PropertyPhoto } from '../types';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const getAllProperties = async (filters?: {
    status?: string;
    property_type?: string;
    min_price?: number;
    max_price?: number;
    location?: string;
}): Promise<Property[]> => {
    let query = 'SELECT * FROM properties WHERE 1=1';
    const params: any[] = [];

    if (filters?.status) {
        query += ' AND status = ?';
        params.push(filters.status);
    }

    if (filters?.property_type) {
        query += ' AND property_type = ?';
        params.push(filters.property_type);
    }

    if (filters?.min_price) {
        query += ' AND price >= ?';
        params.push(filters.min_price);
    }

    if (filters?.max_price) {
        query += ' AND price <= ?';
        params.push(filters.max_price);
    }

    if (filters?.location) {
        query += ' AND location LIKE ?';
        params.push(`%${filters.location}%`);
    }

    query += ' ORDER BY created_at DESC';

    const [rows] = await pool.query<(Property & RowDataPacket)[]>(query, params);
    
    // Parse features JSON
    return rows.map(row => ({
        ...row,
        features: row.features ? JSON.parse(row.features as any) : []
    }));
};

export const getPropertyById = async (id: number): Promise<Property | null> => {
    const [rows] = await pool.query<(Property & RowDataPacket)[]>(
        'SELECT * FROM properties WHERE id = ?',
        [id]
    );

    if (rows.length === 0) return null;

    const property = rows[0];
    return {
        ...property,
        features: property.features ? JSON.parse(property.features as any) : []
    };
};

export const createProperty = async (data: Partial<Property>): Promise<Property> => {
    const featuresJson = data.features ? JSON.stringify(data.features) : null;

    const [result] = await pool.query<ResultSetHeader>(
        `INSERT INTO properties 
        (title, description, property_type, status, price, location, address, 
         bedrooms, bathrooms, floor_area, lot_area, features, agent_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            data.title,
            data.description,
            data.property_type,
            data.status || 'available',
            data.price,
            data.location,
            data.address,
            data.bedrooms,
            data.bathrooms,
            data.floor_area,
            data.lot_area,
            featuresJson,
            data.agent_id
        ]
    );

    const property = await getPropertyById(result.insertId);
    return property!;
};

export const updateProperty = async (
    id: number,
    data: Partial<Property>
): Promise<Property | null> => {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.title !== undefined) {
        updates.push('title = ?');
        values.push(data.title);
    }
    if (data.description !== undefined) {
        updates.push('description = ?');
        values.push(data.description);
    }
    if (data.property_type !== undefined) {
        updates.push('property_type = ?');
        values.push(data.property_type);
    }
    if (data.status !== undefined) {
        updates.push('status = ?');
        values.push(data.status);
    }
    if (data.price !== undefined) {
        updates.push('price = ?');
        values.push(data.price);
    }
    if (data.location !== undefined) {
        updates.push('location = ?');
        values.push(data.location);
    }
    if (data.address !== undefined) {
        updates.push('address = ?');
        values.push(data.address);
    }
    if (data.bedrooms !== undefined) {
        updates.push('bedrooms = ?');
        values.push(data.bedrooms);
    }
    if (data.bathrooms !== undefined) {
        updates.push('bathrooms = ?');
        values.push(data.bathrooms);
    }
    if (data.floor_area !== undefined) {
        updates.push('floor_area = ?');
        values.push(data.floor_area);
    }
    if (data.lot_area !== undefined) {
        updates.push('lot_area = ?');
        values.push(data.lot_area);
    }
    if (data.features !== undefined) {
        updates.push('features = ?');
        values.push(JSON.stringify(data.features));
    }
    if (data.agent_id !== undefined) {
        updates.push('agent_id = ?');
        values.push(data.agent_id);
    }
    if (data.reservation_type !== undefined) {
        updates.push('reservation_type = ?');
        values.push(data.reservation_type);
    }
    if (data.reservation_date !== undefined) {
        updates.push('reservation_date = ?');
        values.push(data.reservation_date);
    }
    if (data.reservation_expiry !== undefined) {
        updates.push('reservation_expiry = ?');
        values.push(data.reservation_expiry);
    }

    if (updates.length === 0) {
        return getPropertyById(id);
    }

    values.push(id);

    await pool.query(
        `UPDATE properties SET ${updates.join(', ')} WHERE id = ?`,
        values
    );

    return getPropertyById(id);
};

export const deleteProperty = async (id: number): Promise<boolean> => {
    const [result] = await pool.query<ResultSetHeader>(
        'DELETE FROM properties WHERE id = ?',
        [id]
    );

    return result.affectedRows > 0;
};

export const getPropertyPhotos = async (propertyId: number): Promise<PropertyPhoto[]> => {
    const [rows] = await pool.query<(PropertyPhoto & RowDataPacket)[]>(
        'SELECT * FROM property_photos WHERE property_id = ? ORDER BY display_order, id',
        [propertyId]
    );

    return rows;
};

export const addPropertyPhoto = async (
    propertyId: number,
    photoPath: string,
    thumbnailPath: string,
    isPrimary: boolean = false,
    displayOrder: number = 0
): Promise<PropertyPhoto> => {
    // If this is set as primary, unset other primary photos
    if (isPrimary) {
        await pool.query(
            'UPDATE property_photos SET is_primary = FALSE WHERE property_id = ?',
            [propertyId]
        );
    }

    const [result] = await pool.query<ResultSetHeader>(
        'INSERT INTO property_photos (property_id, photo_path, thumbnail_path, is_primary, display_order) VALUES (?, ?, ?, ?, ?)',
        [propertyId, photoPath, thumbnailPath, isPrimary, displayOrder]
    );

    const [rows] = await pool.query<(PropertyPhoto & RowDataPacket)[]>(
        'SELECT * FROM property_photos WHERE id = ?',
        [result.insertId]
    );

    return rows[0];
};

export const deletePropertyPhoto = async (photoId: number): Promise<boolean> => {
    const [result] = await pool.query<ResultSetHeader>(
        'DELETE FROM property_photos WHERE id = ?',
        [photoId]
    );

    return result.affectedRows > 0;
};

export const reserveProperty = async (
    propertyId: number,
    inquiryId: number,
    reservationType: 'deposit' | 'full_payment',
    expiryDays: number = 30
): Promise<void> => {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + expiryDays);

    await pool.query(
        `UPDATE properties SET 
            status = 'reserved',
            reservation_type = ?,
            reservation_date = NOW(),
            reservation_expiry = ?,
            reserved_by_inquiry_id = ?
        WHERE id = ?`,
        [reservationType, expiryDate, inquiryId, propertyId]
    );

    // Cancel all other inquiries for this property
    await pool.query(
        `UPDATE inquiries SET status = 'cancelled'
        WHERE property_id = ? AND id != ? AND status NOT IN ('sold', 'cancelled', 'expired')`,
        [propertyId, inquiryId]
    );
};
