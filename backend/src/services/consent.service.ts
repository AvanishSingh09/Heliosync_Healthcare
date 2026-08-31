import { prisma } from '../config';
import { ConsentStatus, DocumentType } from '../types';
import { logAudit } from './audit.service';
import { getCache, setCache, delCache } from '../config/redis';

export interface ConsentScopeFlags {
  canViewHistory: boolean;
  canViewVitals: boolean;
  canViewPrescriptions: boolean;
  canViewReports: boolean;
}

export class ConsentService {
  /**
   * Find an active valid consent record between a patient and a doctor.
   */
  static async getActiveConsent(patientId: string, doctorId: string) {
    const consent = await prisma.consent.findFirst({
      where: {
        patientId,
        doctorId,
        status: ConsentStatus.GRANTED,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!consent) {
      return null;
    }

    // Check expiration
    if (consent.expiresAt && consent.expiresAt < new Date()) {
      await prisma.consent.update({
        where: { id: consent.id },
        data: { status: ConsentStatus.EXPIRED },
      });
      await delCache(`patient:authorized:${patientId}:${doctorId}`);
      return null;
    }

    return consent;
  }

  /**
   * Securely retrieve patient medical records strictly governed by active consent.
   * Utilizes Redis caching for sub-10ms subsequent access.
   */
  static async getAuthorizedPatientData(
    patientId: string,
    doctorId: string,
    requestingUserId: string
  ) {
    // 1. Check Redis Cache for instantaneous access
    const cacheKey = `patient:authorized:${patientId}:${doctorId}`;
    const cached = await getCache<any>(cacheKey);
    if (cached) {
      logAudit({
        userId: requestingUserId,
        patientId,
        action: 'PATIENT_HISTORY_VIEWED_CACHE',
        resourceType: 'PatientRecord',
        resourceId: patientId,
        metadata: { fromCache: true },
      }).catch(() => {});
      return cached;
    }

    const consent = await this.getActiveConsent(patientId, doctorId);

    // Fetch basic non-confidential patient demographics
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
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
      return { authorized: false, error: 'Patient not found' };
    }

    if (!consent) {
      return {
        authorized: false,
        error: 'Access denied: No active or valid consent found between patient and doctor.',
        patient: {
          id: patient.id,
          name: patient.user.name,
          patientNumber: patient.patientNumber,
          gender: patient.gender,
          bloodGroup: patient.bloodGroup,
          dateOfBirth: patient.dateOfBirth,
        },
        activeConsent: null,
      };
    }

    // Prepare scoped responses based on consent flags
    let encounters: any[] = [];
    let vitals: any[] = [];
    let prescriptions: any[] = [];
    let documents: any[] = [];

    if (consent.canViewHistory) {
      encounters = await prisma.encounter.findMany({
        where: { patientId },
        include: {
          doctor: {
            include: {
              user: { select: { name: true } },
            },
          },
          hospital: { select: { name: true } },
          vitals: true,
          prescriptions: {
            include: { items: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    if (consent.canViewVitals) {
      vitals = await prisma.vitals.findMany({
        where: { patientId },
        orderBy: { recordedAt: 'desc' },
      });
    }

    if (consent.canViewPrescriptions) {
      prescriptions = await prisma.prescription.findMany({
        where: { patientId },
        include: {
          doctor: {
            include: {
              user: { select: { name: true } },
            },
          },
          items: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    if (consent.canViewReports) {
      documents = await prisma.medicalDocument.findMany({
        where: { patientId },
        orderBy: { createdAt: 'desc' },
      });
    }

    // Log the audit event for accessing patient records
    logAudit({
      userId: requestingUserId,
      patientId,
      action: 'PATIENT_HISTORY_VIEWED',
      resourceType: 'PatientRecord',
      resourceId: patientId,
      metadata: {
        consentId: consent.id,
        canViewHistory: consent.canViewHistory,
        canViewVitals: consent.canViewVitals,
        canViewPrescriptions: consent.canViewPrescriptions,
        canViewReports: consent.canViewReports,
      },
    }).catch(() => {});

    const responsePayload = {
      authorized: true,
      activeConsent: {
        id: consent.id,
        purpose: consent.purpose,
        status: consent.status,
        grantedAt: consent.grantedAt,
        expiresAt: consent.expiresAt,
        permissions: {
          canViewHistory: consent.canViewHistory,
          canViewVitals: consent.canViewVitals,
          canViewPrescriptions: consent.canViewPrescriptions,
          canViewReports: consent.canViewReports,
        },
      },
      patient: {
        id: patient.id,
        name: patient.user.name,
        email: patient.user.email,
        phone: patient.phone,
        patientNumber: patient.patientNumber,
        dateOfBirth: patient.dateOfBirth,
        gender: patient.gender,
        bloodGroup: patient.bloodGroup,
        allergies: patient.allergies,
        address: patient.address,
        emergencyContact: patient.emergencyContact,
        emergencyContactPhone: patient.emergencyContactPhone,
      },
      data: {
        encounters,
        vitals,
        prescriptions,
        documents,
      },
    };

    // Cache the authorized dataset in Redis with 15-minute TTL
    await setCache(cacheKey, responsePayload, 900);

    return responsePayload;
  }

  /**
   * Create a consent request during appointment booking or standalone.
   */
  static async createConsent(data: {
    patientId: string;
    doctorId: string;
    hospitalId: string;
    appointmentId?: string;
    purpose?: string;
    status?: ConsentStatus;
    canViewHistory?: boolean;
    canViewVitals?: boolean;
    canViewPrescriptions?: boolean;
    canViewReports?: boolean;
    durationDays?: number;
  }) {
    const expiresAt = data.durationDays
      ? new Date(Date.now() + data.durationDays * 24 * 60 * 60 * 1000)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days default

    const consent = await prisma.consent.create({
      data: {
        patientId: data.patientId,
        doctorId: data.doctorId,
        hospitalId: data.hospitalId,
        appointmentId: data.appointmentId,
        purpose: data.purpose || 'Doctor Consultation & Diagnosis',
        status: data.status || ConsentStatus.GRANTED,
        canViewHistory: data.canViewHistory ?? true,
        canViewVitals: data.canViewVitals ?? true,
        canViewPrescriptions: data.canViewPrescriptions ?? true,
        canViewReports: data.canViewReports ?? true,
        grantedAt: data.status === ConsentStatus.GRANTED ? new Date() : null,
        expiresAt,
      },
    });

    await delCache(`patient:authorized:${data.patientId}:*`);

    return consent;
  }

  /**
   * Grant or update consent by patient.
   */
  static async grantConsent(
    consentId: string,
    patientId: string,
    scopes?: Partial<ConsentScopeFlags>,
    durationDays = 30
  ) {
    const consent = await prisma.consent.findUnique({
      where: { id: consentId },
    });

    if (!consent || consent.patientId !== patientId) {
      throw new Error('Consent record not found or unauthorized');
    }

    const updated = await prisma.consent.update({
      where: { id: consentId },
      data: {
        status: ConsentStatus.GRANTED,
        canViewHistory: scopes?.canViewHistory ?? consent.canViewHistory,
        canViewVitals: scopes?.canViewVitals ?? consent.canViewVitals,
        canViewPrescriptions: scopes?.canViewPrescriptions ?? consent.canViewPrescriptions,
        canViewReports: scopes?.canViewReports ?? consent.canViewReports,
        grantedAt: new Date(),
        revokedAt: null,
        expiresAt: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000),
      },
      include: {
        doctor: {
          include: { user: { select: { name: true } } },
        },
      },
    });

    await delCache(`patient:authorized:${patientId}:*`);

    return updated;
  }

  /**
   * Revoke active consent by patient.
   */
  static async revokeConsent(consentId: string, patientId: string) {
    const consent = await prisma.consent.findUnique({
      where: { id: consentId },
    });

    if (!consent || consent.patientId !== patientId) {
      throw new Error('Consent record not found or unauthorized');
    }

    const updated = await prisma.consent.update({
      where: { id: consentId },
      data: {
        status: ConsentStatus.REVOKED,
        revokedAt: new Date(),
      },
      include: {
        doctor: {
          include: { user: { select: { name: true } } },
        },
      },
    });

    await delCache(`patient:authorized:${patientId}:*`);

    return updated;
  }

  /**
   * Reject pending consent request by patient.
   */
  static async rejectConsent(consentId: string, patientId: string) {
    const consent = await prisma.consent.findUnique({
      where: { id: consentId },
    });

    if (!consent || consent.patientId !== patientId) {
      throw new Error('Consent record not found or unauthorized');
    }

    const updated = await prisma.consent.update({
      where: { id: consentId },
      data: {
        status: ConsentStatus.REJECTED,
      },
    });

    await delCache(`patient:authorized:${patientId}:*`);

    return updated;
  }
}
