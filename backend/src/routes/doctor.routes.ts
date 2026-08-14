import { Router } from 'express';
import {
  getDoctors,
  getDoctorById,
  getDoctorAppointments,
  getAuthorizedPatientRecords,
} from '../controllers/doctor.controller';
import { authMiddleware } from '../middleware/auth';
import { requireRole } from '../middleware/role';
import { Role } from '../types';

const router = Router();

router.get('/', getDoctors);
router.get('/:id', getDoctorById);
router.get('/:id/appointments', authMiddleware, getDoctorAppointments);
router.get(
  '/patient-access/:patientId',
  authMiddleware,
  requireRole(Role.DOCTOR),
  getAuthorizedPatientRecords
);

export default router;
