import api from './api';
import { ApiResponse, Appointment } from '../types';

export const appointmentService = {
  getAppointments: async (params?: {
    doctorId?: string;
    patientId?: string;
    hospitalId?: string;
    status?: string;
    date?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await api.get<ApiResponse<Appointment[]>>('/appointments', { params });
    return response.data;
  },

  getAppointmentById: async (id: string) => {
    const response = await api.get<ApiResponse<Appointment>>(`/appointments/${id}`);
    return response.data;
  },

  createAppointment: async (data: {
    doctorId: string;
    hospitalId: string;
    appointmentDate: string;
    appointmentTime: string;
    reason?: string;
    consentScopes?: {
      canViewHistory: boolean;
      canViewVitals: boolean;
      canViewPrescriptions: boolean;
      canViewReports: boolean;
      durationDays?: number;
    };
  }) => {
    const response = await api.post<ApiResponse<{ appointment: Appointment; consent: any }>>(
      '/appointments',
      data
    );
    return response.data;
  },

  checkIn: async (id: string) => {
    const response = await api.post<ApiResponse<Appointment>>(`/appointments/${id}/check-in`);
    return response.data;
  },

  startConsultation: async (id: string) => {
    const response = await api.post<ApiResponse<Appointment>>(`/appointments/${id}/start`);
    return response.data;
  },

  completeAppointment: async (id: string) => {
    const response = await api.post<ApiResponse<Appointment>>(`/appointments/${id}/complete`);
    return response.data;
  },

  cancelAppointment: async (id: string) => {
    const response = await api.post<ApiResponse<Appointment>>(`/appointments/${id}/cancel`);
    return response.data;
  },
};
