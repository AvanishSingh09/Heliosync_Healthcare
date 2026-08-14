import { Router } from 'express';
import {
  getAppointments,
  createAppointment,
  getAppointmentById,
  updateAppointmentStatus,
  checkInAppointment,
  startAppointment,
  completeAppointment,
  cancelAppointment,
} from '../controllers/appointment.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/', getAppointments);
router.post('/', createAppointment);
router.get('/:id', getAppointmentById);
router.put('/:id', updateAppointmentStatus);
router.post('/:id/check-in', checkInAppointment);
router.post('/:id/start', startAppointment);
router.post('/:id/complete', completeAppointment);
router.post('/:id/cancel', cancelAppointment);

export default router;
