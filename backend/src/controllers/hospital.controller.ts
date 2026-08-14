import { Request, Response } from 'express';
import { prisma } from '../config';
import { successResponse, errorResponse } from '../utils/response';
import { AppointmentStatus } from '../types';

export const getHospitals = async (req: Request, res: Response) => {
  try {
    const hospitals = await prisma.hospital.findMany({
      include: {
        _count: {
          select: {
            doctors: true,
            appointments: true,
          },
        },
      },
    });
    return successResponse(res, hospitals);
  } catch (error: any) {
    return errorResponse(res, 'Failed to fetch hospitals', 500);
  }
};

export const getHospitalById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const hospital = await prisma.hospital.findUnique({
      where: { id },
      include: {
        doctors: {
          include: {
            user: { select: { name: true, email: true, phone: true } },
          },
        },
      },
    });

    if (!hospital) {
      return errorResponse(res, 'Hospital not found', 404);
    }

    return successResponse(res, hospital);
  } catch (error: any) {
    return errorResponse(res, 'Failed to fetch hospital', 500);
  }
};

export const getHospitalStats = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const [
      totalDoctors,
      todayAppointments,
      waitingCount,
      completedToday,
      totalPatients,
    ] = await Promise.all([
      prisma.doctor.count({ where: { hospitalId: id } }),
      prisma.appointment.count({
        where: {
          hospitalId: id,
          appointmentDate: { gte: startOfDay, lte: endOfDay },
        },
      }),
      prisma.appointment.count({
        where: {
          hospitalId: id,
          appointmentDate: { gte: startOfDay, lte: endOfDay },
          status: { in: [AppointmentStatus.CHECKED_IN, AppointmentStatus.IN_QUEUE] },
        },
      }),
      prisma.appointment.count({
        where: {
          hospitalId: id,
          appointmentDate: { gte: startOfDay, lte: endOfDay },
          status: AppointmentStatus.COMPLETED,
        },
      }),
      prisma.patient.count(),
    ]);

    const estimatedRevenue = completedToday * 800;

    return successResponse(res, {
      activeDoctors: totalDoctors,
      todayAppointments,
      waitingPatients: waitingCount,
      completedConsultations: completedToday,
      totalRegisteredPatients: totalPatients,
      estimatedRevenue,
    });
  } catch (error: any) {
    console.error('getHospitalStats error:', error);
    return errorResponse(res, 'Failed to fetch hospital statistics', 500);
  }
};
