import { Router } from 'express';
import { createPrescription, getPrescriptionById } from '../controllers/prescription.controller';
import { getPatientPrescriptions } from '../controllers/patient.controller';
import { authMiddleware } from '../middleware/auth';
import { requireRole } from '../middleware/role';
import { Role } from '../types';

const router = Router();

router.use(authMiddleware);

router.post('/', requireRole(Role.DOCTOR, Role.SUPER_ADMIN), createPrescription);
router.get('/:id', getPrescriptionById);
router.get('/patient/:id', getPatientPrescriptions);

export default router;
