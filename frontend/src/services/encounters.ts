import api from './api';
import { ApiResponse, Encounter } from '../types';

export const encounterService = {
  createEncounter: async (data: {
    appointmentId?: string;
    patientId: string;
    doctorId?: string;
    chiefComplaint: string;
    symptoms?: string;
    diagnosis: string;
    clinicalNotes?: string;
    treatmentPlan?: string;
    followUpDate?: string;
    vitals?: {
      bloodPressure?: string;
      heartRate?: string;
      temperature?: string;
      spo2?: string;
      weight?: string;
      height?: string;
    };
    prescription?: {
      notes?: string;
      items: Array<{
        medicineName: string;
        dosage: string;
        frequency: string;
        duration: string;
        instructions?: string;
        quantity?: number;
      }>;
    };
  }) => {
    const response = await api.post<ApiResponse<{ encounter: Encounter; vitals: any; prescription: any }>>(
      '/encounters',
      data
    );
    return response.data;
  },

  getEncounterById: async (id: string) => {
    const response = await api.get<ApiResponse<Encounter>>(`/encounters/${id}`);
    return response.data;
  },

  getPatientEncounters: async (patientId: string) => {
    const response = await api.get<ApiResponse<Encounter[]>>(`/encounters/patient/${patientId}`);
    return response.data;
  },
};
