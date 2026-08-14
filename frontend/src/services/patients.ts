import api from './api';
import { ApiResponse, Patient, TimelineEvent, Vitals, Prescription, MedicalDocument } from '../types';

export const patientService = {
  getPatients: async (params?: { search?: string; page?: number; limit?: number }) => {
    const response = await api.get<ApiResponse<Patient[]>>('/patients', { params });
    return response.data;
  },

  getPatientById: async (id: string) => {
    const response = await api.get<ApiResponse<Patient>>(`/patients/${id}`);
    return response.data;
  },

  updatePatient: async (id: string, data: any) => {
    const response = await api.put<ApiResponse<Patient>>(`/patients/${id}`, data);
    return response.data;
  },

  getTimeline: async (id: string) => {
    const response = await api.get<ApiResponse<TimelineEvent[]>>(`/patients/${id}/timeline`);
    return response.data;
  },

  getVitals: async (id: string) => {
    const response = await api.get<ApiResponse<Vitals[]>>(`/patients/${id}/vitals`);
    return response.data;
  },

  getPrescriptions: async (id: string) => {
    const response = await api.get<ApiResponse<Prescription[]>>(`/patients/${id}/prescriptions`);
    return response.data;
  },

  getDocuments: async (id: string) => {
    const response = await api.get<ApiResponse<MedicalDocument[]>>(`/patients/${id}/documents`);
    return response.data;
  },
};
