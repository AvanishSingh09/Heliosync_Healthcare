import { Request, Response } from 'express';
import { prisma } from '../config';
import { successResponse, errorResponse } from '../utils/response';
import { logAudit } from '../services/audit.service';
import { invalidatePatientCaches } from '../config/redis';

export const recordVitals = async (req: Request, res: Response) => {
  try {
    const currentUser = req.user!;
    const {
      patientId,
      encounterId,
      bloodPressure,
      heartRate,
      temperature,
      spo2,
      respiratoryRate,
      weight,
      height,
    } = req.body;

    if (!patientId) {
      return errorResponse(res, 'patientId is required', 400);
    }

    const vitals = await prisma.vitals.create({
      data: {
        patientId,
        encounterId: encounterId || null,
        bloodPressure: bloodPressure || null,
        heartRate: heartRate ? parseInt(heartRate, 10) : null,
        temperature: temperature ? parseFloat(temperature) : null,
        spo2: spo2 ? parseInt(spo2, 10) : null,
        respiratoryRate: respiratoryRate ? parseInt(respiratoryRate, 10) : null,
        weight: weight ? parseFloat(weight) : null,
        height: height ? parseFloat(height) : null,
      },
    });

    await logAudit({
      userId: currentUser.id,
      patientId,
      action: 'VITALS_RECORDED',
      resourceType: 'Vitals',
      resourceId: vitals.id,
    });

    await invalidatePatientCaches(patientId);

    return successResponse(res, vitals, 'Vitals recorded successfully', 201);
  } catch (error: any) {
    return errorResponse(res, 'Failed to record vitals', 500);
  }
};
