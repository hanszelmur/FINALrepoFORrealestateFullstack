import { Router } from 'express';
import * as calendarController from '../controllers/calendarController';
import { authenticateToken, requireAgent } from '../middleware/auth';

const router = Router();

router.post('/', authenticateToken, requireAgent, calendarController.createCalendarEvent);
router.get('/', authenticateToken, calendarController.getCalendarEvents);
router.get('/:id', authenticateToken, calendarController.getCalendarEventById);
router.put('/:id', authenticateToken, requireAgent, calendarController.updateCalendarEvent);
router.delete('/:id', authenticateToken, requireAgent, calendarController.deleteCalendarEvent);

export default router;
