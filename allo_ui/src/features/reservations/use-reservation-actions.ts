'use client';

import { useMutation } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import toast from 'react-hot-toast';
import {
  confirmReservationApi,
  releaseReservationApi,
  reserveApi,
} from '@/features/reservations/reservations.api';

export const useReserve = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reserveApi,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error: AxiosError) => {
      if (error.response?.status === 409) {
        toast.error('Stock just sold out (409).');
        return;
      }
      toast.error('Failed to reserve inventory.');
    },
  });
};

export const useConfirmReservation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: confirmReservationApi,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error: AxiosError) => {
      if (error.response?.status === 410) {
        toast.error('Reservation expired (410).');
        return;
      }
      toast.error('Failed to confirm reservation.');
    },
  });
};

export const useReleaseReservation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: releaseReservationApi,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: () => {
      toast.error('Failed to release reservation.');
    },
  });
};
