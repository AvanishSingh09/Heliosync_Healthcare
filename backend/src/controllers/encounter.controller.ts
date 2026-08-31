import { Request, Response } from 'express';
import { prisma } from '../config';
import { successResponse, errorResponse } from '../utils/response';
import { AppointmentStatus, Role } from '../types';
import { logAudit } from '../services/audit.service';
import { invalidatePatientCaches } from '../config/redis';

export const createEncounter = async (req: Request, res: Response) => {
  try {
    const currentUser = req.user!;
    const {
      appointmentId,
      patientId,
      chiefComplaint,
      symptoms,
      diagnosis,
      clinicalNotes,
      treatmentPlan,
      followUpDate,
      vitals,
      prescription,
    } = req.body;

    let doctorId = req.body.doctorId;
    if (currentUser.role === Role.DOCTOR && currentUser.doctorId) {
      doctorId = currentUser.doctorId;
    }

    if (!patientId || !doctorId || !chiefComplaint || !diagnosis) {
      return errorResponse(res, 'Patient, doctor, chief complaint, and diagnosis are required', 400);
    }

    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
    });

    if (!doctor) {
      return errorResponse(res, 'Doctor not found', 404);
    }

    const hospitalId = doctor.hospitalId;

    const result = await prisma.$transaction(async (tx) => {
      const encounter = await tx.encounter.create({
        data: {
          appointmentId: appointmentId || null,
          patientId,
          doctorId,
          hospitalId,
          chiefComplaint,
          symptoms: symptoms || null,
          diagnosis,
          clinicalNotes: clinicalNotes || null,
          treatmentPlan: treatmentPlan || null,
          followUpDate: followUpDate ? new Date(followUpDate) : null,
        },
      });

      if (appointmentId) {
        await tx.appointment.update({
          where: { id: appointmentId },
          data: { status: AppointmentStatus.COMPLETED },
        });
      }

      let createdVitals = null;
      if (vitals && (vitals.bloodPressure || vitals.heartRate || vitals.temperature || vitals.weight)) {
        createdVitals = await tx.vitals.create({
          data: {
            encounterId: encounter.id,
            patientId,
            bloodPressure: vitals.bloodPressure || null,
            heartRate: vitals.heartRate ? parseInt(vitals.heartRate, 10) : null,
            temperature: vitals.temperature ? parseFloat(vitals.temperature) : null,
            spo2: vitals.spo2 ? parseInt(vitals.spo2, 10) : null,
            respiratoryRate: vitals.respiratoryRate ? parseInt(vitals.respiratoryRate, 10) : null,
            weight: vitals.weight ? parseFloat(vitals.weight) : null,
            height: vitals.height ? parseFloat(vitals.height) : null,
          },
        });
      }

      let createdPrescription = null;
      if (prescription && prescription.items && prescription.items.length > 0) {
        createdPrescription = await tx.prescription.create({
          data: {
            encounterId: encounter.id,
            patientId,
            doctorId,
            notes: prescription.notes || null,
            items: {
              create: prescription.items.map((item: any) => ({
                medicineName: item.medicineName,
                dosage: item.dosage || '1 tablet',
                frequency: item.frequency || 'OD',
                duration: item.duration || '5 days',
                instructions: item.instructions || '',
                quantity: item.quantity ? parseInt(item.quantity, 10) : 10,
              })),
            },
          },
          include: { items: true },
        });
      }

      return { encounter, vitals: createdVitals, prescription: createdPrescription };
    });

    await logAudit({
      userId: currentUser.id,
      patientId,
      action: 'CONSULTATION_COMPLETED',
      resourceType: 'Encounter',
      resourceId: result.encounter.id,
      metadata: {
        diagnosis,
        hasPrescription: !!result.prescription,
        hasVitals: !!result.vitals,
      },
    });

    // Invalidate Redis caches for patient so doctor and patient see updated records instantly
    await invalidatePatientCaches(patientId);

    return successResponse(res, result, 'Consultation encounter recorded successfully', 201);
  } catch (error: any) {
    console.error('createEncounter error:', error);
    return errorResponse(res, 'Failed to record encounter', 500);
  }
};

export const getEncounterById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const encounter = await prisma.encounter.findUnique({
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
        vitals: true,
        prescriptions: {
          include: { items: true },
        },
      },
    });

    if (!encounter) {
      return errorResponse(res, 'Encounter not found', 404);
    }

    return successResponse(res, encounter);
  } catch (error: any) {
    return errorResponse(res, 'Failed to fetch encounter', 500);
  }
};

export const getPatientEncounters = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const encounters = await prisma.encounter.findMany({
      where: { patientId: id },
      include: {
        doctor: {
          include: {
            user: { select: { name: true } },
            hospital: true,
          },
        },
        vitals: true,
        prescriptions: {
          include: { items: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return successResponse(res, encounters);
  } catch (error: any) {
    return errorResponse(res, 'Failed to fetch patient encounters', 500);
  }
};
