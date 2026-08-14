import api from './api';
import { ApiResponse, Doctor, Appointment } from '../types';

export const doctorService = {
  getDoctors: async (params?: {
    search?: string;
    specialization?: string;
    hospitalId?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await api.get<ApiResponse<Doctor[]>>('/doctors', { params });
    return response.data;
  },

  getDoctorById: async (id: string) => {
    const response = await api.get<ApiResponse<Doctor>>(`/doctors/${id}`);
    return response.data;
  },

  getDoctorAppointments: async (id: string, date?: string) => {
    const response = await api.get<ApiResponse<Appointment[]>>(`/doctors/${id}/appointments`, {
      params: { date },
    });
    return response.data;
  },

  getAuthorizedPatientRecords: async (patientId: string) => {
    const response = await api.get<ApiResponse<any>>(`/doctors/patient-access/${patientId}`);
    return response.data;
  },
};
