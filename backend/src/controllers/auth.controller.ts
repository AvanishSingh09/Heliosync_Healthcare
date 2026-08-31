import { Request, Response } from 'express';
import { prisma } from '../config';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { successResponse, errorResponse } from '../utils/response';
import { Role } from '../types';
import { logAudit } from '../services/audit.service';

export const register = async (req: Request, res: Response) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      role = Role.PATIENT,
      // Patient specific fields
      dateOfBirth,
      gender,
      bloodGroup,
      address,
      emergencyContact,
      allergies,
      // Doctor specific fields
      hospitalId,
      specialization,
      qualification,
      registrationNumber,
      experience,
      consultationFee,
      bio,
    } = req.body;

    if (!name || !email || !password) {
      return errorResponse(res, 'Name, email, and password are required', 400);
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      return errorResponse(res, 'An account with this email already exists', 409);
    }

    const passwordHash = await hashPassword(password);

    const userRole = Object.values(Role).includes(role) ? role : Role.PATIENT;

    // Create user and associated role profile in transaction
    const result = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name,
          email: email.toLowerCase().trim(),
          phone,
          passwordHash,
          role: userRole,
        },
      });

      let patient = null;
      let doctor = null;

      if (userRole === Role.PATIENT) {
        let patientNumber = `P-${Math.floor(10000 + Math.random() * 90000)}`;
        let exists = await tx.patient.findUnique({ where: { patientNumber } });
        while (exists) {
          patientNumber = `P-${Math.floor(10000 + Math.random() * 90000)}`;
          exists = await tx.patient.findUnique({ where: { patientNumber } });
        }

        patient = await tx.patient.create({
          data: {
            userId: newUser.id,
            patientNumber,
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
            gender,
            bloodGroup,
            phone: phone || null,
            address: address || null,
            emergencyContact: emergencyContact || null,
            allergies: allergies || null,
          },
        });
      } else if (userRole === Role.DOCTOR) {
        let activeHospitalId = hospitalId;
        if (!activeHospitalId) {
          const firstHospital = await tx.hospital.findFirst();
          activeHospitalId = firstHospital?.id;
        }

        if (!activeHospitalId) {
          throw new Error('A valid hospitalId is required to register a doctor');
        }

        doctor = await tx.doctor.create({
          data: {
            userId: newUser.id,
            hospitalId: activeHospitalId,
            specialization: specialization || 'General Medicine',
            qualification: qualification || 'MBBS',
            registrationNumber: registrationNumber || `REG-${Date.now()}`,
            experience: experience ? parseInt(experience, 10) : 1,
            consultationFee: consultationFee ? parseFloat(consultationFee) : 500,
            bio: bio || '',
          },
        });
      }

      return { user: newUser, patient, doctor };
    });

    const token = generateToken({
      userId: result.user.id,
      role: result.user.role,
      patientId: result.patient?.id,
      doctorId: result.doctor?.id,
    });

    await logAudit({
      userId: result.user.id,
      action: 'USER_REGISTERED',
      resourceType: 'User',
      resourceId: result.user.id,
    });

    return successResponse(
      res,
      {
        token,
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          role: result.user.role,
          patientId: result.patient?.id,
          doctorId: result.doctor?.id,
          patientNumber: result.patient?.patientNumber,
        },
      },
      'User registered successfully',
      201
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    return errorResponse(res, error.message || 'Registration failed', 500);
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 'Email and password are required', 400);
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        patient: true,
        doctor: {
          include: { hospital: true },
        },
      },
    });

    if (!user || !user.isActive) {
      return errorResponse(res, 'Invalid email or password', 401);
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return errorResponse(res, 'Invalid email or password', 401);
    }

    const token = generateToken({
      userId: user.id,
      role: user.role,
      patientId: user.patient?.id,
      doctorId: user.doctor?.id,
    });

    // Asynchronously log audit without blocking the login response
    logAudit({
      userId: user.id,
      patientId: user.patient?.id,
      action: 'LOGIN',
      resourceType: 'User',
      resourceId: user.id,
    }).catch((err) => console.error('Audit log error:', err));

    return successResponse(
      res,
      {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          patient: user.patient,
          doctor: user.doctor,
        },
      },
      'Login successful'
    );
  } catch (error: any) {
    console.error('Login error:', error);
    return errorResponse(res, 'Login failed', 500);
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return errorResponse(res, 'Unauthenticated', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        patient: {
          include: {
            consents: {
              where: { status: 'GRANTED' },
              include: {
                doctor: {
                  include: { user: { select: { name: true } } },
                },
              },
            },
          },
        },
        doctor: {
          include: {
            hospital: true,
          },
        },
      },
    });

    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    return successResponse(res, user);
  } catch (error: any) {
    return errorResponse(res, 'Failed to fetch user profile', 500);
  }
};
