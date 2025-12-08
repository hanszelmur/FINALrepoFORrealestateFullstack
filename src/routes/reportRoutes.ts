import { Router } from 'express';
import * as reportController from '../controllers/reportController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/properties', authenticateToken, requireAdmin, reportController.exportPropertiesCSV);
router.get('/inquiries', authenticateToken, requireAdmin, reportController.exportInquiriesCSV);
router.get('/agent-performance', authenticateToken, requireAdmin, reportController.exportAgentPerformanceCSV);
router.get('/sales', authenticateToken, requireAdmin, reportController.exportSalesReportCSV);

export default router;
