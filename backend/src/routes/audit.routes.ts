import { Router } from 'express';
import { getAuditLogs } from '../controllers/audit.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);
router.get('/', getAuditLogs);

export default router;
