import api from './api';
import { ApiResponse, Consent } from '../types';

export const consentService = {
  getConsents: async (params?: { patientId?: string; doctorId?: string }) => {
    const response = await api.get<ApiResponse<Consent[]>>('/consents', { params });
    return response.data;
  },

  createConsent: async (data: {
    patientId?: string;
    doctorId: string;
    hospitalId: string;
    appointmentId?: string;
    purpose?: string;
    canViewHistory?: boolean;
    canViewVitals?: boolean;
    canViewPrescriptions?: boolean;
    canViewReports?: boolean;
    durationDays?: number;
  }) => {
    const response = await api.post<ApiResponse<Consent>>('/consents', data);
    return response.data;
  },

  grantConsent: async (
    id: string,
    scopes?: {
      canViewHistory?: boolean;
      canViewVitals?: boolean;
      canViewPrescriptions?: boolean;
      canViewReports?: boolean;
    },
    durationDays?: number
  ) => {
    const response = await api.put<ApiResponse<Consent>>(`/consents/${id}/grant`, {
      scopes,
      durationDays,
    });
    return response.data;
  },

  rejectConsent: async (id: string) => {
    const response = await api.put<ApiResponse<Consent>>(`/consents/${id}/reject`);
    return response.data;
  },

  revokeConsent: async (id: string) => {
    const response = await api.put<ApiResponse<Consent>>(`/consents/${id}/revoke`);
    return response.data;
  },
};
