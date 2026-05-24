import axios from 'axios';
import { uiEnv } from '@/config/env';
import { setupAuthInterceptors } from '@/services/interceptors/auth-interceptor';

export const apiClient = axios.create({
  baseURL: uiEnv.NEXT_PUBLIC_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

setupAuthInterceptors(apiClient);
