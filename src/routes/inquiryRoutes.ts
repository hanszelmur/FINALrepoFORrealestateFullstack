import { Router } from 'express';
import * as inquiryController from '../controllers/inquiryController';
import { authenticateToken, requireAgent } from '../middleware/auth';

const router: Router = Router();

router.post('/', inquiryController.createInquiry);
router.get('/', authenticateToken, inquiryController.getAllInquiries);
router.get('/:id', authenticateToken, inquiryController.getInquiryById);
router.post('/:id/assign', authenticateToken, requireAgent, inquiryController.assignInquiry);
router.post('/:id/reassign', authenticateToken, requireAgent, inquiryController.reassignInquiry);
router.put('/:id/status', authenticateToken, requireAgent, inquiryController.updateInquiryStatus);
router.get('/:id/history', authenticateToken, inquiryController.getInquiryHistory);

export default router;
