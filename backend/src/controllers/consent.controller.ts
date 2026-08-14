import { Request, Response } from 'express';
import { prisma } from '../config';
import { successResponse, errorResponse } from '../utils/response';
import { ConsentService } from '../services/consent.service';
import { logAudit } from '../services/audit.service';
import { Role } from '../types';

export const createConsent = async (req: Request, res: Response) => {
  try {
    const currentUser = req.user!;
    const {
      patientId,
      doctorId,
      hospitalId,
      appointmentId,
      purpose,
      canViewHistory,
      canViewVitals,
      canViewPrescriptions,
      canViewReports,
      durationDays,
    } = req.body;

    let targetPatientId = patientId;
    if (currentUser.role === Role.PATIENT) {
      targetPatientId = currentUser.patientId;
    }

    if (!targetPatientId || !doctorId || !hospitalId) {
      return errorResponse(res, 'patientId, doctorId, and hospitalId are required', 400);
    }

    const consent = await ConsentService.createConsent({
      patientId: targetPatientId,
      doctorId,
      hospitalId,
      appointmentId,
      purpose,
      canViewHistory,
      canViewVitals,
      canViewPrescriptions,
      canViewReports,
      durationDays,
    });

    await logAudit({
      userId: currentUser.id,
      patientId: targetPatientId,
      action: 'CONSENT_REQUESTED',
      resourceType: 'Consent',
      resourceId: consent.id,
    });

    return successResponse(res, consent, 'Consent created successfully', 201);
  } catch (error: any) {
    return errorResponse(res, 'Failed to create consent', 500);
  }
};

export const getConsents = async (req: Request, res: Response) => {
  try {
    const currentUser = req.user!;
    const { patientId, doctorId } = req.query;

    const where: any = {};

    if (currentUser.role === Role.PATIENT && currentUser.patientId) {
      where.patientId = currentUser.patientId;
    } else if (patientId) {
      where.patientId = patientId as string;
    }

    if (currentUser.role === Role.DOCTOR && currentUser.doctorId) {
      where.doctorId = currentUser.doctorId;
    } else if (doctorId) {
      where.doctorId = doctorId as string;
    }

    const consents = await prisma.consent.findMany({
      where,
      include: {
        doctor: {
          include: {
            user: { select: { name: true, email: true } },
            hospital: { select: { name: true, city: true } },
          },
        },
        patient: {
          include: {
            user: { select: { name: true, email: true, phone: true } },
          },
        },
        appointment: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(res, consents);
  } catch (error: any) {
    return errorResponse(res, 'Failed to fetch consents', 500);
  }
};

export const getConsentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const consent = await prisma.consent.findUnique({
      where: { id },
      include: {
        doctor: {
          include: {
            user: { select: { name: true } },
            hospital: true,
          },
        },
        patient: {
          include: {
            user: { select: { name: true } },
          },
        },
      },
    });

    if (!consent) {
      return errorResponse(res, 'Consent record not found', 404);
    }

    return successResponse(res, consent);
  } catch (error: any) {
    return errorResponse(res, 'Failed to fetch consent', 500);
  }
};

export const grantConsent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const currentUser = req.user!;

    if (currentUser.role !== Role.PATIENT || !currentUser.patientId) {
      return errorResponse(res, 'Only the patient can grant consent', 403);
    }

    const { scopes, durationDays } = req.body;
    const updated = await ConsentService.grantConsent(id, currentUser.patientId, scopes, durationDays);

    await logAudit({
      userId: currentUser.id,
      patientId: currentUser.patientId,
      action: 'CONSENT_GRANTED',
      resourceType: 'Consent',
      resourceId: updated.id,
      metadata: scopes,
    });

    return successResponse(res, updated, 'Consent granted successfully');
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to grant consent', 400);
  }
};

export const rejectConsent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const currentUser = req.user!;

    if (currentUser.role !== Role.PATIENT || !currentUser.patientId) {
      return errorResponse(res, 'Only the patient can reject consent', 403);
    }

    const updated = await ConsentService.rejectConsent(id, currentUser.patientId);

    await logAudit({
      userId: currentUser.id,
      patientId: currentUser.patientId,
      action: 'CONSENT_REJECTED',
      resourceType: 'Consent',
      resourceId: updated.id,
    });

    return successResponse(res, updated, 'Consent request rejected');
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to reject consent', 400);
  }
};

export const revokeConsent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const currentUser = req.user!;

    if (currentUser.role !== Role.PATIENT || !currentUser.patientId) {
      return errorResponse(res, 'Only the patient can revoke consent', 403);
    }

    const updated = await ConsentService.revokeConsent(id, currentUser.patientId);

    await logAudit({
      userId: currentUser.id,
      patientId: currentUser.patientId,
      action: 'CONSENT_REVOKED',
      resourceType: 'Consent',
      resourceId: updated.id,
    });

    return successResponse(res, updated, 'Medical record access consent has been revoked');
  } catch (error: any) {
    return errorResponse(res, error.message || 'Failed to revoke consent', 400);
  }
};
