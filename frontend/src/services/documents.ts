import api from './api';
import { ApiResponse, MedicalDocument } from '../types';

export const documentService = {
  uploadDocument: async (formData: FormData) => {
    const response = await api.post<ApiResponse<MedicalDocument>>('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getDocumentUrl: (filePath: string) => {
    if (filePath.startsWith('http')) return filePath;
    return `/${filePath}`;
  },
};
