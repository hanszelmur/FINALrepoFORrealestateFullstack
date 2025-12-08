import { Router } from 'express';
import * as agentController from '../controllers/agentController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, agentController.getAllAgents);
router.get('/stats', authenticateToken, agentController.getAgentStats);
router.get('/:id', authenticateToken, agentController.getAgentById);

export default router;
