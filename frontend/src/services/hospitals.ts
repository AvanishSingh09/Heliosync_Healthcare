import api from './api';
import { ApiResponse, Hospital } from '../types';

export interface HospitalStats {
  activeDoctors: number;
  todayAppointments: number;
  waitingPatients: number;
  completedConsultations: number;
  totalRegisteredPatients: number;
  estimatedRevenue: number;
}

export const hospitalService = {
  getHospitals: async () => {
    const response = await api.get<ApiResponse<Hospital[]>>('/hospitals');
    return response.data;
  },

  getHospitalById: async (id: string) => {
    const response = await api.get<ApiResponse<Hospital>>(`/hospitals/${id}`);
    return response.data;
  },

  getHospitalStats: async (id: string) => {
    const response = await api.get<ApiResponse<HospitalStats>>(`/hospitals/${id}/stats`);
    return response.data;
  },
};
