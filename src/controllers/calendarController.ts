import { Response } from 'express';
import * as calendarService from '../services/calendarService';
import { calendarEventSchema } from '../validators/schemas';
import { AuthRequest } from '../types';
import { sanitizeObject } from '../utils/sanitize';

export const createCalendarEvent = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { error, value } = calendarEventSchema.validate(req.body);
        if (error) {
            res.status(400).json({ error: error.details[0].message });
            return;
        }

        const sanitized = sanitizeObject(value);
        const event = await calendarService.createCalendarEvent(sanitized);

        res.status(201).json(event);
    } catch (error: any) {
        if (error.message.includes('conflict')) {
            res.status(409).json({ error: error.message });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
};

export const getCalendarEvents = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const filters = {
            agent_id: req.query.agent_id ? parseInt(req.query.agent_id as string) : undefined,
            start_date: req.query.start_date ? new Date(req.query.start_date as string) : undefined,
            end_date: req.query.end_date ? new Date(req.query.end_date as string) : undefined,
            status: req.query.status as string,
            event_type: req.query.event_type as string
        };

        const events = await calendarService.getCalendarEvents(filters);
        res.json(events);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getCalendarEventById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id);
        const event = await calendarService.getCalendarEventById(id);

        if (!event) {
            res.status(404).json({ error: 'Calendar event not found' });
            return;
        }

        res.json(event);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateCalendarEvent = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id);
        const sanitized = sanitizeObject(req.body);
        const event = await calendarService.updateCalendarEvent(id, sanitized);

        res.json(event);
    } catch (error: any) {
        if (error.message.includes('conflict')) {
            res.status(409).json({ error: error.message });
        } else if (error.message.includes('not found')) {
            res.status(404).json({ error: error.message });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
};

export const deleteCalendarEvent = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id);
        const deleted = await calendarService.deleteCalendarEvent(id);

        if (!deleted) {
            res.status(404).json({ error: 'Calendar event not found' });
            return;
        }

        res.json({ message: 'Calendar event deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
