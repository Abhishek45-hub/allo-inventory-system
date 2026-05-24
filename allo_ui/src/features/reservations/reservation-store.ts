import { create } from 'zustand';
import type { ReservationView } from '@/features/reservations/reservations.api';

interface ReservationState {
  current: ReservationView | null;
  setCurrent: (reservation: ReservationView | null) => void;
}

export const useReservationStore = create<ReservationState>((set) => ({
  current: null,
  setCurrent: (current) => set({ current }),
}));
