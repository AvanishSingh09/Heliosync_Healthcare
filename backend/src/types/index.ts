export const Role = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  HOSPITAL_ADMIN: 'HOSPITAL_ADMIN',
  RECEPTIONIST: 'RECEPTIONIST',
  DOCTOR: 'DOCTOR',
  PATIENT: 'PATIENT',
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export const AppointmentStatus = {
  REQUESTED: 'REQUESTED',
  CONFIRMED: 'CONFIRMED',
  CHECKED_IN: 'CHECKED_IN',
  IN_QUEUE: 'IN_QUEUE',
  IN_CONSULTATION: 'IN_CONSULTATION',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  NO_SHOW: 'NO_SHOW',
} as const;

export type AppointmentStatus = (typeof AppointmentStatus)[keyof typeof AppointmentStatus];

export const DocumentType = {
  LAB_REPORT: 'LAB_REPORT',
  IMAGING: 'IMAGING',
  PRESCRIPTION: 'PRESCRIPTION',
  MEDICAL_HISTORY: 'MEDICAL_HISTORY',
  OTHER: 'OTHER',
} as const;

export type DocumentType = (typeof DocumentType)[keyof typeof DocumentType];

export const ConsentStatus = {
  PENDING: 'PENDING',
  GRANTED: 'GRANTED',
  REJECTED: 'REJECTED',
  REVOKED: 'REVOKED',
  EXPIRED: 'EXPIRED',
} as const;

export type ConsentStatus = (typeof ConsentStatus)[keyof typeof ConsentStatus];
