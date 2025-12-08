import pool from '../config/database';
import { CalendarEvent } from '../types';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

const BUFFER_MINUTES = 30;

export const checkConflict = async (
    agentId: number,
    startTime: Date,
    endTime: Date,
    excludeEventId?: number
): Promise<boolean> => {
    // Add 30-minute buffer before and after
    const bufferStart = new Date(startTime.getTime() - BUFFER_MINUTES * 60000);
    const bufferEnd = new Date(endTime.getTime() + BUFFER_MINUTES * 60000);

    let query = `
        SELECT COUNT(*) as count
        FROM calendar_events
        WHERE agent_id = ?
        AND status = 'scheduled'
        AND (
            (start_time < ? AND end_time > ?)
            OR (start_time >= ? AND start_time < ?)
        )
    `;
    const params: any[] = [agentId, bufferEnd, bufferStart, bufferStart, bufferEnd];

    if (excludeEventId) {
        query += ' AND id != ?';
        params.push(excludeEventId);
    }

    const [rows] = await pool.query<RowDataPacket[]>(query, params);
    return rows[0].count > 0;
};

export const createCalendarEvent = async (data: {
    title: string;
    description?: string;
    event_type: 'viewing' | 'meeting' | 'deadline' | 'other';
    start_time: Date;
    end_time: Date;
    property_id?: number;
    inquiry_id?: number;
    agent_id: number;
}): Promise<CalendarEvent> => {
    // Check for conflicts
    const hasConflict = await checkConflict(
        data.agent_id,
        data.start_time,
        data.end_time
    );

    if (hasConflict) {
        throw new Error('Schedule conflict detected. Please choose a different time slot (30-minute buffer required)');
    }

    const [result] = await pool.query<ResultSetHeader>(
        `INSERT INTO calendar_events 
        (title, description, event_type, start_time, end_time, property_id, inquiry_id, agent_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            data.title,
            data.description,
            data.event_type,
            data.start_time,
            data.end_time,
            data.property_id,
            data.inquiry_id,
            data.agent_id
        ]
    );

    const event = await getCalendarEventById(result.insertId);
    return event!;
};

export const getCalendarEventById = async (id: number): Promise<CalendarEvent | null> => {
    const [rows] = await pool.query<(CalendarEvent & RowDataPacket)[]>(
        'SELECT * FROM calendar_events WHERE id = ?',
        [id]
    );

    return rows.length > 0 ? rows[0] : null;
};

export const getCalendarEvents = async (filters?: {
    agent_id?: number;
    start_date?: Date;
    end_date?: Date;
    status?: string;
    event_type?: string;
}): Promise<CalendarEvent[]> => {
    let query = 'SELECT * FROM calendar_events WHERE 1=1';
    const params: any[] = [];

    if (filters?.agent_id) {
        query += ' AND agent_id = ?';
        params.push(filters.agent_id);
    }

    if (filters?.start_date) {
        query += ' AND start_time >= ?';
        params.push(filters.start_date);
    }

    if (filters?.end_date) {
        query += ' AND end_time <= ?';
        params.push(filters.end_date);
    }

    if (filters?.status) {
        query += ' AND status = ?';
        params.push(filters.status);
    }

    if (filters?.event_type) {
        query += ' AND event_type = ?';
        params.push(filters.event_type);
    }

    query += ' ORDER BY start_time ASC';

    const [rows] = await pool.query<(CalendarEvent & RowDataPacket)[]>(query, params);
    return rows;
};

export const updateCalendarEvent = async (
    id: number,
    data: Partial<CalendarEvent>
): Promise<CalendarEvent> => {
    const event = await getCalendarEventById(id);
    if (!event) {
        throw new Error('Calendar event not found');
    }

    // If updating time, check for conflicts
    if (data.start_time || data.end_time) {
        const startTime = data.start_time || event.start_time;
        const endTime = data.end_time || event.end_time;

        const hasConflict = await checkConflict(
            event.agent_id,
            startTime,
            endTime,
            id
        );

        if (hasConflict) {
            throw new Error('Schedule conflict detected. Please choose a different time slot');
        }
    }

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
    if (data.event_type !== undefined) {
        updates.push('event_type = ?');
        values.push(data.event_type);
    }
    if (data.start_time !== undefined) {
        updates.push('start_time = ?');
        values.push(data.start_time);
    }
    if (data.end_time !== undefined) {
        updates.push('end_time = ?');
        values.push(data.end_time);
    }
    if (data.status !== undefined) {
        updates.push('status = ?');
        values.push(data.status);
    }

    if (updates.length === 0) {
        return event;
    }

    values.push(id);

    await pool.query(
        `UPDATE calendar_events SET ${updates.join(', ')} WHERE id = ?`,
        values
    );

    const updatedEvent = await getCalendarEventById(id);
    return updatedEvent!;
};

export const deleteCalendarEvent = async (id: number): Promise<boolean> => {
    const [result] = await pool.query<ResultSetHeader>(
        'DELETE FROM calendar_events WHERE id = ?',
        [id]
    );

    return result.affectedRows > 0;
};
