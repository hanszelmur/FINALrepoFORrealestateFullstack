import { Router } from 'express';
import * as propertyController from '../controllers/propertyController';
import * as uploadController from '../controllers/uploadController';
import { authenticateToken, requireAgent } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router: Router = Router();

router.get('/', propertyController.getAllProperties);
router.get('/:id', propertyController.getPropertyById);
router.post('/', authenticateToken, requireAgent, propertyController.createProperty);
router.put('/:id', authenticateToken, requireAgent, propertyController.updateProperty);
router.delete('/:id', authenticateToken, requireAgent, propertyController.deleteProperty);

// Photo routes
router.get('/:id/photos', propertyController.getPropertyPhotos);
router.post('/:id/photos', authenticateToken, requireAgent, upload.array('photos', 10), uploadController.uploadPropertyPhotos);
router.delete('/:id/photos/:photoId', authenticateToken, requireAgent, propertyController.deletePropertyPhoto);

export default router;
