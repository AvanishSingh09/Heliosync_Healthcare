import { Request, Response } from 'express';
import { prisma } from '../config';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response';
import { AppointmentStatus, ConsentStatus, Role } from '../types';
import { logAudit } from '../services/audit.service';

export const getAppointments = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const skip = (page - 1) * limit;

    const { doctorId, patientId, hospitalId, status, date } = req.query;
    const currentUser = req.user!;

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

    if (hospitalId) {
      where.hospitalId = hospitalId as string;
    }

    if (status) {
      where.status = status as string;
    }

    if (date) {
      const targetDate = new Date(date as string);
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
      where.appointmentDate = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    const [total, appointments] = await Promise.all([
      prisma.appointment.count({ where }),
      prisma.appointment.findMany({
        where,
        skip,
        take: limit,
        include: {
          patient: {
            include: {
              user: { select: { name: true, email: true, phone: true } },
            },
          },
          doctor: {
            include: {
              user: { select: { name: true, email: true } },
              hospital: { select: { name: true, city: true } },
            },
          },
          hospital: {
            select: { id: true, name: true, city: true },
          },
          consents: true,
          encounters: true,
        },
        orderBy: [{ appointmentDate: 'desc' }, { appointmentTime: 'asc' }],
      }),
    ]);

    return paginatedResponse(res, appointments, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    console.error('getAppointments error:', error);
    return errorResponse(res, 'Failed to fetch appointments', 500);
  }
};

export const createAppointment = async (req: Request, res: Response) => {
  try {
    const currentUser = req.user!;
    const {
      doctorId,
      hospitalId,
      appointmentDate,
      appointmentTime,
      reason,
      consentScopes,
    } = req.body;

    let patientId = req.body.patientId;
    if (currentUser.role === Role.PATIENT) {
      patientId = currentUser.patientId;
    }

    if (!patientId || !doctorId || !hospitalId || !appointmentDate || !appointmentTime) {
      return errorResponse(res, 'Doctor, hospital, appointment date, and time are required', 400);
    }

    const targetDate = new Date(appointmentDate);

    const result = await prisma.$transaction(async (tx) => {
      const appointment = await tx.appointment.create({
        data: {
          patientId,
          doctorId,
          hospitalId,
          appointmentDate: targetDate,
          appointmentTime,
          reason: reason || 'General Consultation',
          status: AppointmentStatus.CONFIRMED,
        },
        include: {
          doctor: {
            include: {
              user: { select: { name: true } },
              hospital: { select: { name: true } },
            },
          },
          patient: {
            include: {
              user: { select: { name: true } },
            },
          },
        },
      });

      const consent = await tx.consent.create({
        data: {
          patientId,
          doctorId,
          hospitalId,
          appointmentId: appointment.id,
          purpose: `Consultation for ${reason || 'General Consultation'}`,
          status: ConsentStatus.GRANTED,
          canViewHistory: consentScopes?.canViewHistory ?? true,
          canViewVitals: consentScopes?.canViewVitals ?? true,
          canViewPrescriptions: consentScopes?.canViewPrescriptions ?? true,
          canViewReports: consentScopes?.canViewReports ?? true,
          grantedAt: new Date(),
          expiresAt: new Date(Date.now() + (consentScopes?.durationDays || 30) * 24 * 60 * 60 * 1000),
        },
      });

      return { appointment, consent };
    });

    await logAudit({
      userId: currentUser.id,
      patientId,
      action: 'APPOINTMENT_BOOKED_WITH_CONSENT',
      resourceType: 'Appointment',
      resourceId: result.appointment.id,
      metadata: {
        doctorId,
        appointmentDate,
        appointmentTime,
        consentId: result.consent.id,
      },
    });

    return successResponse(res, result, 'Appointment booked successfully with configured consent', 201);
  } catch (error: any) {
    console.error('createAppointment error:', error);
    return errorResponse(res, 'Failed to book appointment', 500);
  }
};

export const getAppointmentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: {
          include: {
            user: { select: { name: true, email: true, phone: true } },
          },
        },
        doctor: {
          include: {
            user: { select: { name: true, email: true } },
            hospital: true,
          },
        },
        hospital: true,
        consents: true,
        encounters: {
          include: {
            vitals: true,
            prescriptions: {
              include: { items: true },
            },
          },
        },
      },
    });

    if (!appointment) {
      return errorResponse(res, 'Appointment not found', 404);
    }

    return successResponse(res, appointment);
  } catch (error: any) {
    return errorResponse(res, 'Failed to fetch appointment', 500);
  }
};

export const updateAppointmentStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!Object.values(AppointmentStatus).includes(status)) {
      return errorResponse(res, 'Invalid appointment status', 400);
    }

    const appointment = await prisma.appointment.update({
      where: { id },
      data: { status },
      include: {
        patient: { include: { user: { select: { name: true } } } },
        doctor: { include: { user: { select: { name: true } } } },
      },
    });

    return successResponse(res, appointment, `Appointment marked as ${status}`);
  } catch (error: any) {
    return errorResponse(res, 'Failed to update appointment status', 500);
  }
};

export const checkInAppointment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const appointment = await prisma.appointment.update({
      where: { id },
      data: { status: AppointmentStatus.IN_QUEUE },
    });
    return successResponse(res, appointment, 'Patient checked in and placed in queue');
  } catch (error: any) {
    return errorResponse(res, 'Check-in failed', 500);
  }
};

export const startAppointment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const appointment = await prisma.appointment.update({
      where: { id },
      data: { status: AppointmentStatus.IN_CONSULTATION },
    });
    return successResponse(res, appointment, 'Consultation started');
  } catch (error: any) {
    return errorResponse(res, 'Failed to start consultation', 500);
  }
};

export const completeAppointment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const appointment = await prisma.appointment.update({
      where: { id },
      data: { status: AppointmentStatus.COMPLETED },
    });
    return successResponse(res, appointment, 'Appointment marked completed');
  } catch (error: any) {
    return errorResponse(res, 'Failed to complete appointment', 500);
  }
};

export const cancelAppointment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const appointment = await prisma.appointment.update({
      where: { id },
      data: { status: AppointmentStatus.CANCELLED },
    });
    return successResponse(res, appointment, 'Appointment cancelled');
  } catch (error: any) {
    return errorResponse(res, 'Failed to cancel appointment', 500);
  }
};
