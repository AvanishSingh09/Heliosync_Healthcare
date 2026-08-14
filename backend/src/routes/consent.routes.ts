import { Router } from 'express';
import {
  createConsent,
  getConsents,
  getConsentById,
  grantConsent,
  rejectConsent,
  revokeConsent,
} from '../controllers/consent.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.post('/', createConsent);
router.get('/', getConsents);
router.get('/:id', getConsentById);
router.put('/:id/grant', grantConsent);
router.put('/:id/reject', rejectConsent);
router.put('/:id/revoke', revokeConsent);

export default router;
