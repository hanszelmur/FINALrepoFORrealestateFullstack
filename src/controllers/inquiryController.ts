import { Response } from 'express';
import * as inquiryService from '../services/inquiryService';
import { inquirySchema, inquiryUpdateSchema } from '../validators/schemas';
import { AuthRequest } from '../types';
import { sanitizeObject } from '../utils/sanitize';

export const createInquiry = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { error, value } = inquirySchema.validate(req.body);
        if (error) {
            res.status(400).json({ error: error.details[0].message });
            return;
        }

        const sanitized = sanitizeObject(value);
        const inquiry = await inquiryService.createInquiry(sanitized);

        res.status(201).json(inquiry);
    } catch (error: any) {
        if (error.message.includes('duplicate') || error.message.includes('already')) {
            res.status(409).json({ error: error.message });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
};

export const getAllInquiries = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const filters = {
            status: req.query.status as any,
            property_id: req.query.property_id ? parseInt(req.query.property_id as string) : undefined,
            assigned_to: req.query.assigned_to ? parseInt(req.query.assigned_to as string) : undefined
        };

        const inquiries = await inquiryService.getAllInquiries(filters);
        res.json(inquiries);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getInquiryById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id);
        const inquiry = await inquiryService.getInquiryById(id);

        if (!inquiry) {
            res.status(404).json({ error: 'Inquiry not found' });
            return;
        }

        // Get history
        const history = await inquiryService.getInquiryHistory(id);

        res.json({ ...inquiry, history });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const assignInquiry = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const inquiryId = parseInt(req.params.id);
        const { agent_id } = req.body;

        if (!agent_id) {
            res.status(400).json({ error: 'Agent ID is required' });
            return;
        }

        const inquiry = await inquiryService.assignInquiry(
            inquiryId,
            agent_id,
            req.user!.id
        );

        res.json(inquiry);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const reassignInquiry = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const inquiryId = parseInt(req.params.id);
        const { agent_id } = req.body;

        if (!agent_id) {
            res.status(400).json({ error: 'Agent ID is required' });
            return;
        }

        const inquiry = await inquiryService.reassignInquiry(
            inquiryId,
            agent_id,
            req.user!.id
        );

        res.json(inquiry);
    } catch (error: any) {
        if (error.message.includes('locked') || error.message.includes('Cannot reassign')) {
            res.status(403).json({ error: error.message });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
};

export const updateInquiryStatus = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const inquiryId = parseInt(req.params.id);
        const { error, value } = inquiryUpdateSchema.validate(req.body);

        if (error) {
            res.status(400).json({ error: error.details[0].message });
            return;
        }

        if (!value.status) {
            res.status(400).json({ error: 'Status is required' });
            return;
        }

        const inquiry = await inquiryService.updateInquiryStatus(
            inquiryId,
            value.status,
            req.user!.id,
            value.notes,
            value.commission_amount
        );

        res.json(inquiry);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getInquiryHistory = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const inquiryId = parseInt(req.params.id);
        const history = await inquiryService.getInquiryHistory(inquiryId);
        res.json(history);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
