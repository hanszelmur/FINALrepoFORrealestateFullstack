import { Response } from 'express';
import * as propertyService from '../services/propertyService';
import { propertySchema } from '../validators/schemas';
import { AuthRequest } from '../types';
import { sanitizeObject } from '../utils/sanitize';

export const getAllProperties = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const filters = {
            status: req.query.status as string,
            property_type: req.query.property_type as string,
            min_price: req.query.min_price ? parseFloat(req.query.min_price as string) : undefined,
            max_price: req.query.max_price ? parseFloat(req.query.max_price as string) : undefined,
            location: req.query.location as string
        };

        const properties = await propertyService.getAllProperties(filters);
        res.json(properties);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getPropertyById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id);
        const property = await propertyService.getPropertyById(id);

        if (!property) {
            res.status(404).json({ error: 'Property not found' });
            return;
        }

        // Get photos
        const photos = await propertyService.getPropertyPhotos(id);
        
        res.json({ ...property, photos });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createProperty = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { error, value } = propertySchema.validate(req.body);
        if (error) {
            res.status(400).json({ error: error.details[0].message });
            return;
        }

        const sanitized = sanitizeObject(value);
        const property = await propertyService.createProperty(sanitized);

        res.status(201).json(property);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateProperty = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id);
        const { error, value } = propertySchema.validate(req.body, { allowUnknown: true });
        
        if (error) {
            res.status(400).json({ error: error.details[0].message });
            return;
        }

        const sanitized = sanitizeObject(value);
        const property = await propertyService.updateProperty(id, sanitized);

        if (!property) {
            res.status(404).json({ error: 'Property not found' });
            return;
        }

        res.json(property);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteProperty = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id);
        const deleted = await propertyService.deleteProperty(id);

        if (!deleted) {
            res.status(404).json({ error: 'Property not found' });
            return;
        }

        res.json({ message: 'Property deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getPropertyPhotos = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const propertyId = parseInt(req.params.id);
        const photos = await propertyService.getPropertyPhotos(propertyId);
        res.json(photos);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deletePropertyPhoto = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const photoId = parseInt(req.params.photoId);
        const deleted = await propertyService.deletePropertyPhoto(photoId);

        if (!deleted) {
            res.status(404).json({ error: 'Photo not found' });
            return;
        }

        res.json({ message: 'Photo deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
