import { Request, Response } from 'express';
import { prisma } from '../config';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response';
import { Role } from '../types';
import { logAudit } from '../services/audit.service';
import { ConsentService } from '../services/consent.service';
import { getCache, setCache, invalidatePatientCaches } from '../config/redis';

export const getPatients = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const search = (req.query.search as string)?.trim() || '';
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { patientNumber: { contains: search } },
        { phone: { contains: search } },
        { user: { name: { contains: search } } },
        { user: { email: { contains: search } } },
      ];
    }

    const [total, patients] = await Promise.all([
      prisma.patient.count({ where }),
      prisma.patient.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              name: true,
              email: true,
              phone: true,
            },
          },
          _count: {
            select: {
              encounters: true,
              prescriptions: true,
              vitals: true,
              documents: true,
              appointments: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return paginatedResponse(res, patients, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    console.error('getPatients error:', error);
    return errorResponse(res, 'Failed to fetch patients', 500);
  }
};

export const getPatientById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const currentUser = req.user!;

    if (currentUser.role === Role.PATIENT && currentUser.patientId !== id) {
      return errorResponse(res, 'Unauthorized access to another patient profile', 403);
    }

    // 1. Check Redis Cache for instant retrieval (<5ms)
    const cacheKey = `patient:profile:${id}`;
    const cached = await getCache(cacheKey);
    if (cached) {
      return successResponse(res, cached);
    }

    // 2. Fetch from Database
    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!patient) {
      return errorResponse(res, 'Patient not found', 404);
    }

    // 3. Save to Redis with 1-hour TTL
    await setCache(cacheKey, patient, 3600);

    return successResponse(res, patient);
  } catch (error: any) {
    return errorResponse(res, 'Failed to fetch patient', 500);
  }
};

export const updatePatient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const currentUser = req.user!;

    if (currentUser.role === Role.PATIENT && currentUser.patientId !== id) {
      return errorResponse(res, 'Unauthorized to modify this profile', 403);
    }

    const {
      name,
      phone,
      dateOfBirth,
      gender,
      bloodGroup,
      address,
      emergencyContact,
      emergencyContactPhone,
      allergies,
    } = req.body;

    const patient = await prisma.patient.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!patient) {
      return errorResponse(res, 'Patient not found', 404);
    }

    const updated = await prisma.$transaction(async (tx) => {
      if (name || phone) {
        await tx.user.update({
          where: { id: patient.userId },
          data: {
            ...(name && { name }),
            ...(phone && { phone }),
          },
        });
      }

      return await tx.patient.update({
        where: { id },
        data: {
          ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }),
          ...(gender && { gender }),
          ...(bloodGroup && { bloodGroup }),
          ...(phone && { phone }),
          ...(address !== undefined && { address }),
          ...(emergencyContact !== undefined && { emergencyContact }),
          ...(emergencyContactPhone !== undefined && { emergencyContactPhone }),
          ...(allergies !== undefined && { allergies }),
        },
        include: {
          user: {
            select: { name: true, email: true, phone: true },
          },
        },
      });
    });

    // Invalidate Redis Caches so fresh data is loaded
    await invalidatePatientCaches(id);

    return successResponse(res, updated, 'Patient profile updated successfully');
  } catch (error: any) {
    return errorResponse(res, 'Failed to update patient profile', 500);
  }
};

export const getPatientTimeline = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const currentUser = req.user!;

    if (currentUser.role === Role.PATIENT && currentUser.patientId !== id) {
      return errorResponse(res, 'Unauthorized to view another patient timeline', 403);
    }

    if (currentUser.role === Role.DOCTOR && currentUser.doctorId) {
      const activeConsent = await ConsentService.getActiveConsent(id, currentUser.doctorId);
      if (!activeConsent) {
        return errorResponse(
          res,
          'Access Denied: No active consent from this patient to view timeline',
          403
        );
      }
    }

    // 1. Check Redis Cache for instant timeline retrieval
    const cacheKey = `patient:timeline:${id}`;
    const cachedTimeline = await getCache<any[]>(cacheKey);
    if (cachedTimeline) {
      logAudit({
        userId: currentUser.id,
        patientId: id,
        action: 'PATIENT_TIMELINE_VIEWED_CACHE',
        resourceType: 'PatientTimeline',
        resourceId: id,
      }).catch(() => {});
      return successResponse(res, cachedTimeline);
    }

    // 2. Fetch all collections from MongoDB
    const [encounters, vitals, prescriptions, documents] = await Promise.all([
      prisma.encounter.findMany({
        where: { patientId: id },
        include: {
          doctor: {
            include: {
              user: { select: { name: true } },
              hospital: { select: { name: true } },
            },
          },
          vitals: true,
          prescriptions: {
            include: { items: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.vitals.findMany({
        where: { patientId: id },
        orderBy: { recordedAt: 'desc' },
      }),
      prisma.prescription.findMany({
        where: { patientId: id },
        include: {
          doctor: {
            include: { user: { select: { name: true } } },
          },
          items: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.medicalDocument.findMany({
        where: { patientId: id },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const timelineEvents: any[] = [];

    encounters.forEach((enc) => {
      timelineEvents.push({
        id: `enc-${enc.id}`,
        type: 'ENCOUNTER',
        title: `Consultation: ${enc.chiefComplaint}`,
        timestamp: enc.createdAt,
        doctor: enc.doctor.user.name,
        hospital: enc.doctor.hospital.name,
        details: {
          diagnosis: enc.diagnosis,
          symptoms: enc.symptoms,
          clinicalNotes: enc.clinicalNotes,
          treatmentPlan: enc.treatmentPlan,
          followUpDate: enc.followUpDate,
        },
      });
    });

    prescriptions.forEach((rx) => {
      timelineEvents.push({
        id: `rx-${rx.id}`,
        type: 'PRESCRIPTION',
        title: `Prescription (${rx.items.length} medicines)`,
        timestamp: rx.createdAt,
        doctor: rx.doctor.user.name,
        details: {
          notes: rx.notes,
          items: rx.items,
        },
      });
    });

    vitals.forEach((v) => {
      timelineEvents.push({
        id: `vitals-${v.id}`,
        type: 'VITALS',
        title: `Vitals Recorded: BP ${v.bloodPressure || 'N/A'}, HR ${v.heartRate ? v.heartRate + ' bpm' : 'N/A'}`,
        timestamp: v.recordedAt,
        details: {
          bloodPressure: v.bloodPressure,
          heartRate: v.heartRate,
          temperature: v.temperature,
          spo2: v.spo2,
          respiratoryRate: v.respiratoryRate,
          weight: v.weight,
          height: v.height,
        },
      });
    });

    documents.forEach((doc) => {
      timelineEvents.push({
        id: `doc-${doc.id}`,
        type: 'DOCUMENT',
        title: `Document: ${doc.fileName}`,
        timestamp: doc.createdAt,
        details: {
          documentType: doc.documentType,
          fileName: doc.fileName,
          filePath: doc.filePath,
          description: doc.description,
          uploadedBy: doc.uploadedBy,
        },
      });
    });

    timelineEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // 3. Cache Timeline in Redis with 30-min TTL
    await setCache(cacheKey, timelineEvents, 1800);

    logAudit({
      userId: currentUser.id,
      patientId: id,
      action: 'PATIENT_TIMELINE_VIEWED',
      resourceType: 'PatientTimeline',
      resourceId: id,
    }).catch(() => {});

    return successResponse(res, timelineEvents);
  } catch (error: any) {
    console.error('getPatientTimeline error:', error);
    return errorResponse(res, 'Failed to fetch patient timeline', 500);
  }
};

export const getPatientVitals = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const cacheKey = `patient:vitals:${id}`;
    const cached = await getCache(cacheKey);
    if (cached) return successResponse(res, cached);

    const vitals = await prisma.vitals.findMany({
      where: { patientId: id },
      orderBy: { recordedAt: 'desc' },
    });

    await setCache(cacheKey, vitals, 1800);
    return successResponse(res, vitals);
  } catch (error: any) {
    return errorResponse(res, 'Failed to fetch vitals', 500);
  }
};

export const getPatientPrescriptions = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const cacheKey = `patient:prescriptions:${id}`;
    const cached = await getCache(cacheKey);
    if (cached) return successResponse(res, cached);

    const prescriptions = await prisma.prescription.findMany({
      where: { patientId: id },
      include: {
        doctor: {
          include: {
            user: { select: { name: true } },
            hospital: { select: { name: true } },
          },
        },
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    await setCache(cacheKey, prescriptions, 1800);
    return successResponse(res, prescriptions);
  } catch (error: any) {
    return errorResponse(res, 'Failed to fetch prescriptions', 500);
  }
};

export const getPatientDocuments = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const cacheKey = `patient:documents:${id}`;
    const cached = await getCache(cacheKey);
    if (cached) return successResponse(res, cached);

    const docs = await prisma.medicalDocument.findMany({
      where: { patientId: id },
      orderBy: { createdAt: 'desc' },
    });

    await setCache(cacheKey, docs, 1800);
    return successResponse(res, docs);
  } catch (error: any) {
    return errorResponse(res, 'Failed to fetch documents', 500);
  }
};
