import api from './api';
import { ApiResponse, User } from '../types';

export interface LoginResponseData {
  token: string;
  user: User;
}

export const authService = {
  login: async (credentials: { email: string; password: string }) => {
    const response = await api.post<ApiResponse<LoginResponseData>>('/auth/login', credentials);
    return response.data;
  },

  register: async (data: any) => {
    const response = await api.post<ApiResponse<LoginResponseData>>('/auth/register', data);
    return response.data;
  },

  getMe: async () => {
    const response = await api.get<ApiResponse<User>>('/auth/me');
    return response.data;
  },
};
