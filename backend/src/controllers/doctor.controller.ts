import { Request, Response } from 'express';
import { prisma } from '../config';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response';
import { ConsentService } from '../services/consent.service';
import { Role } from '../types';

export const getDoctors = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const search = (req.query.search as string)?.trim() || '';
    const specialization = (req.query.specialization as string)?.trim() || '';
    const hospitalId = (req.query.hospitalId as string)?.trim() || '';
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { user: { name: { contains: search } } },
        { specialization: { contains: search } },
        { qualification: { contains: search } },
      ];
    }

    if (specialization) {
      where.specialization = { contains: specialization };
    }

    if (hospitalId) {
      where.hospitalId = hospitalId;
    }

    const [total, doctors] = await Promise.all([
      prisma.doctor.count({ where }),
      prisma.doctor.findMany({
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
          hospital: {
            select: {
              id: true,
              name: true,
              city: true,
              address: true,
            },
          },
          _count: {
            select: {
              appointments: true,
              encounters: true,
            },
          },
        },
        orderBy: { experience: 'desc' },
      }),
    ]);

    return paginatedResponse(res, doctors, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    console.error('getDoctors error:', error);
    return errorResponse(res, 'Failed to fetch doctors', 500);
  }
};

export const getDoctorById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const doctor = await prisma.doctor.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
        hospital: true,
      },
    });

    if (!doctor) {
      return errorResponse(res, 'Doctor not found', 404);
    }

    const availableSlots = [
      '09:00 AM',
      '09:30 AM',
      '10:00 AM',
      '10:30 AM',
      '11:00 AM',
      '11:30 AM',
      '02:00 PM',
      '02:30 PM',
      '03:00 PM',
      '03:30 PM',
      '04:00 PM',
    ];

    return successResponse(res, {
      ...doctor,
      availableSlots,
    });
  } catch (error: any) {
    return errorResponse(res, 'Failed to fetch doctor details', 500);
  }
};

export const getDoctorAppointments = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const date = req.query.date as string;

    const where: any = { doctorId: id };

    if (date) {
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
      where.appointmentDate = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        patient: {
          include: {
            user: { select: { name: true, email: true, phone: true } },
          },
        },
        consents: true,
        encounters: true,
      },
      orderBy: { appointmentTime: 'asc' },
    });

    return successResponse(res, appointments);
  } catch (error: any) {
    return errorResponse(res, 'Failed to fetch doctor appointments', 500);
  }
};

export const getAuthorizedPatientRecords = async (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;
    const currentUser = req.user!;

    if (currentUser.role !== Role.DOCTOR || !currentUser.doctorId) {
      return errorResponse(res, 'Access denied. Only doctors can query patient records via this endpoint.', 403);
    }

    const result = await ConsentService.getAuthorizedPatientData(
      patientId,
      currentUser.doctorId,
      currentUser.id
    );

    if (!result.authorized) {
      return errorResponse(res, result.error || 'Access denied by consent policy', 403, {
        patient: result.patient,
        activeConsent: result.activeConsent,
      });
    }

    return successResponse(res, result, 'Patient records retrieved under active consent policy');
  } catch (error: any) {
    console.error('getAuthorizedPatientRecords error:', error);
    return errorResponse(res, 'Failed to verify consent and fetch records', 500);
  }
};
