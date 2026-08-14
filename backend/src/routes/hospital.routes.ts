import { Router } from 'express';
import { getHospitals, getHospitalById, getHospitalStats } from '../controllers/hospital.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', getHospitals);
router.get('/:id', getHospitalById);
router.get('/:id/stats', authMiddleware, getHospitalStats);

export default router;
