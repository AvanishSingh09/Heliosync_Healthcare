export type Role = 'SUPER_ADMIN' | 'HOSPITAL_ADMIN' | 'RECEPTIONIST' | 'DOCTOR' | 'PATIENT';

export type AppointmentStatus =
  | 'REQUESTED'
  | 'CONFIRMED'
  | 'CHECKED_IN'
  | 'IN_QUEUE'
  | 'IN_CONSULTATION'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW';

export type DocumentType = 'LAB_REPORT' | 'IMAGING' | 'PRESCRIPTION' | 'MEDICAL_HISTORY' | 'OTHER';

export type ConsentStatus = 'PENDING' | 'GRANTED' | 'REJECTED' | 'REVOKED' | 'EXPIRED';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  patient?: Patient;
  doctor?: Doctor;
}

export interface Hospital {
  id: string;
  name: string;
  registrationNumber: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  email: string;
  logo?: string;
  _count?: {
    doctors?: number;
    appointments?: number;
  };
}

export interface Doctor {
  id: string;
  userId: string;
  hospitalId: string;
  specialization: string;
  qualification: string;
  registrationNumber: string;
  experience: number;
  consultationFee: number;
  bio?: string;
  profilePhoto?: string;
  user: {
    name: string;
    email: string;
    phone?: string;
  };
  hospital?: Hospital;
  availableSlots?: string[];
  _count?: {
    appointments?: number;
    encounters?: number;
  };
}

export interface Patient {
  id: string;
  userId: string;
  patientNumber: string;
  dateOfBirth?: string;
  gender?: string;
  bloodGroup?: string;
  phone?: string;
  address?: string;
  emergencyContact?: string;
  emergencyContactPhone?: string;
  allergies?: string;
  user: {
    name: string;
    email: string;
    phone?: string;
  };
  consents?: Consent[];
  _count?: {
    encounters?: number;
    prescriptions?: number;
    vitals?: number;
    documents?: number;
    appointments?: number;
  };
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  hospitalId: string;
  appointmentDate: string;
  appointmentTime: string;
  reason?: string;
  status: AppointmentStatus;
  createdAt: string;
  patient: Patient;
  doctor: Doctor;
  hospital?: Hospital;
  consent?: Consent;
  encounter?: Encounter;
}

export interface Encounter {
  id: string;
  appointmentId?: string;
  patientId: string;
  doctorId: string;
  hospitalId: string;
  chiefComplaint: string;
  symptoms?: string;
  diagnosis: string;
  clinicalNotes?: string;
  treatmentPlan?: string;
  followUpDate?: string;
  createdAt: string;
  doctor: Doctor;
  patient?: Patient;
  hospital?: Hospital;
  vitals?: Vitals[];
  prescriptions?: Prescription[];
}

export interface Vitals {
  id: string;
  encounterId?: string;
  patientId: string;
  bloodPressure?: string;
  heartRate?: number;
  temperature?: number;
  spo2?: number;
  respiratoryRate?: number;
  weight?: number;
  height?: number;
  recordedAt: string;
}

export interface PrescriptionItem {
  id: string;
  prescriptionId: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
  quantity?: number;
}

export interface Prescription {
  id: string;
  encounterId?: string;
  patientId: string;
  doctorId: string;
  notes?: string;
  createdAt: string;
  doctor: Doctor;
  patient?: Patient;
  items: PrescriptionItem[];
}

export interface MedicalDocument {
  id: string;
  patientId: string;
  uploadedBy: string;
  documentType: DocumentType;
  fileName: string;
  filePath: string;
  description?: string;
  createdAt: string;
}

export interface Consent {
  id: string;
  patientId: string;
  doctorId: string;
  hospitalId: string;
  appointmentId?: string;
  purpose: string;
  status: ConsentStatus;
  canViewHistory: boolean;
  canViewVitals: boolean;
  canViewPrescriptions: boolean;
  canViewReports: boolean;
  expiresAt?: string;
  grantedAt?: string;
  revokedAt?: string;
  createdAt: string;
  doctor?: Doctor;
  patient?: Patient;
  appointment?: Appointment;
}

export interface TimelineEvent {
  id: string;
  type: 'ENCOUNTER' | 'PRESCRIPTION' | 'VITALS' | 'DOCUMENT';
  title: string;
  timestamp: string;
  doctor?: string;
  hospital?: string;
  details: any;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: Pagination;
}
