'use client';

import axios from 'axios';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { loginApi } from '@/features/auth/auth.api';
import { useAuthStore } from '@/store/auth-store';

export const useLogin = () =>
  useMutation({
    mutationFn: loginApi,
    onSuccess: (data) => {
      useAuthStore.getState().setSession({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        user: data.user,
      });
      document.cookie = `access_token=${data.accessToken}; path=/; max-age=${60 * 15}; samesite=lax`;
      toast.success('Logged in');
    },
    onError: (error) => {
      const message =
        axios.isAxiosError<{ message?: string }>(error) && error.response?.data?.message
          ? error.response.data.message
          : 'Login failed';
      toast.error(message);
    },
  });
