import { Router } from 'express';
import {
  getPatients,
  getPatientById,
  updatePatient,
  getPatientTimeline,
  getPatientVitals,
  getPatientPrescriptions,
  getPatientDocuments,
} from '../controllers/patient.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/', getPatients);
router.get('/:id', getPatientById);
router.put('/:id', updatePatient);
router.get('/:id/timeline', getPatientTimeline);
router.get('/:id/vitals', getPatientVitals);
router.get('/:id/prescriptions', getPatientPrescriptions);
router.get('/:id/documents', getPatientDocuments);

export default router;
