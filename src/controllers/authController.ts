import { Request, Response } from 'express';
import * as authService from '../services/authService';
import { loginSchema, userRegistrationSchema } from '../validators/schemas';
import { sanitizeInput } from '../utils/sanitize';

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { error, value } = loginSchema.validate(req.body);
        if (error) {
            res.status(400).json({ error: error.details[0].message });
            return;
        }

        const { email, password } = value;
        const result = await authService.login(
            sanitizeInput(email),
            password
        );

        res.json(result);
    } catch (error: any) {
        res.status(401).json({ error: error.message });
    }
};

export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { error, value } = userRegistrationSchema.validate(req.body);
        if (error) {
            res.status(400).json({ error: error.details[0].message });
            return;
        }

        const result = await authService.register(
            sanitizeInput(value.email),
            value.password,
            sanitizeInput(value.full_name),
            value.role,
            value.phone ? sanitizeInput(value.phone) : undefined
        );

        res.status(201).json(result);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};
