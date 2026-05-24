import type { ReservationView } from "@/features/reservations/reservations.api";
import { create } from "zustand";

interface ReservationState {
	current: ReservationView | null;
	setCurrent: (reservation: ReservationView | null) => void;
}

export const useReservationStore = create<ReservationState>((set) => ({
	current: null,
	setCurrent: (current) => set({ current }),
}));
