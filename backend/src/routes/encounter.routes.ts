import { Router } from 'express';
import {
  createEncounter,
  getEncounterById,
  getPatientEncounters,
} from '../controllers/encounter.controller';
import { authMiddleware } from '../middleware/auth';
import { requireRole } from '../middleware/role';
import { Role } from '../types';

const router = Router();

router.use(authMiddleware);

router.post('/', requireRole(Role.DOCTOR, Role.SUPER_ADMIN), createEncounter);
router.get('/:id', getEncounterById);
router.get('/patient/:id', getPatientEncounters);

export default router;
