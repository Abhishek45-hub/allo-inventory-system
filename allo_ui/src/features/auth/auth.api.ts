import { apiClient } from '@/services/api/client';
import { endpoints } from '@/services/endpoints';
import type { ApiEnvelope } from '@/types/api';

interface LoginData {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    role: 'ADMIN' | 'OPERATOR' | 'CUSTOMER';
    fullName: string;
  };
}

export const loginApi = async (payload: { email: string; password: string }): Promise<LoginData> => {
  const response = await apiClient.post<ApiEnvelope<LoginData>>(endpoints.login, payload);
  return response.data.data;
};
