import { Response } from 'express';
import { AuthRequest } from '../types';
import { processPropertyPhoto } from '../utils/imageProcessor';
import * as propertyService from '../services/propertyService';

export const uploadPropertyPhotos = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const propertyId = parseInt(req.params.id);
        
        // Check if property exists
        const property = await propertyService.getPropertyById(propertyId);
        if (!property) {
            res.status(404).json({ error: 'Property not found' });
            return;
        }

        if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
            res.status(400).json({ error: 'No files uploaded' });
            return;
        }

        const uploadedPhotos = [];

        for (let i = 0; i < req.files.length; i++) {
            const file = req.files[i];
            
            // Process image (resize and create thumbnail)
            const { photoPath, thumbnailPath } = await processPropertyPhoto(file);

            // Save to database
            const isPrimary = i === 0 && (await propertyService.getPropertyPhotos(propertyId)).length === 0;
            const photo = await propertyService.addPropertyPhoto(
                propertyId,
                photoPath,
                thumbnailPath,
                isPrimary,
                i
            );

            uploadedPhotos.push(photo);
        }

        res.status(201).json({
            message: 'Photos uploaded successfully',
            photos: uploadedPhotos
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
