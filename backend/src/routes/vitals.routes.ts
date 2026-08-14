import { Router } from 'express';
import { recordVitals } from '../controllers/vitals.controller';
import { getPatientVitals } from '../controllers/patient.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.post('/', recordVitals);
router.get('/patient/:id', getPatientVitals);

export default router;
