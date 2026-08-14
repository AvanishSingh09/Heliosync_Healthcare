import { Request, Response } from 'express';
import { prisma } from '../config';
import { successResponse, errorResponse } from '../utils/response';
import { Role } from '../types';
import { logAudit } from '../services/audit.service';

export const createPrescription = async (req: Request, res: Response) => {
  try {
    const currentUser = req.user!;
    const { encounterId, patientId, notes, items } = req.body;

    let doctorId = req.body.doctorId;
    if (currentUser.role === Role.DOCTOR && currentUser.doctorId) {
      doctorId = currentUser.doctorId;
    }

    if (!patientId || !doctorId || !items || !Array.isArray(items) || items.length === 0) {
      return errorResponse(res, 'Patient, doctor, and at least one prescription item are required', 400);
    }

    const prescription = await prisma.prescription.create({
      data: {
        encounterId: encounterId || null,
        patientId,
        doctorId,
        notes: notes || null,
        items: {
          create: items.map((item: any) => ({
            medicineName: item.medicineName,
            dosage: item.dosage,
            frequency: item.frequency,
            duration: item.duration,
            instructions: item.instructions || null,
            quantity: item.quantity ? parseInt(item.quantity, 10) : null,
          })),
        },
      },
      include: {
        items: true,
        doctor: {
          include: {
            user: { select: { name: true } },
            hospital: { select: { name: true } },
          },
        },
      },
    });

    await logAudit({
      userId: currentUser.id,
      patientId,
      action: 'PRESCRIPTION_CREATED',
      resourceType: 'Prescription',
      resourceId: prescription.id,
      metadata: { itemsCount: items.length },
    });

    return successResponse(res, prescription, 'Prescription created successfully', 201);
  } catch (error: any) {
    return errorResponse(res, 'Failed to create prescription', 500);
  }
};

export const getPrescriptionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const prescription = await prisma.prescription.findUnique({
      where: { id },
      include: {
        items: true,
        doctor: {
          include: {
            user: { select: { name: true, email: true } },
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

    if (!prescription) {
      return errorResponse(res, 'Prescription not found', 404);
    }

    return successResponse(res, prescription);
  } catch (error: any) {
    return errorResponse(res, 'Failed to fetch prescription', 500);
  }
};
