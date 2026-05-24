import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface SessionUser {
	id: string;
	email: string;
	role: "ADMIN" | "OPERATOR" | "CUSTOMER";
	fullName: string;
}

interface AuthState {
	accessToken: string | null;
	refreshToken: string | null;
	user: SessionUser | null;
	hydrated: boolean;
	setSession: (payload: {
		accessToken: string;
		refreshToken: string;
		user: SessionUser;
	}) => void;
	setHydrated: (value: boolean) => void;
	clear: () => void;
}

export const useAuthStore = create<AuthState>()(
	persist(
		(set) => ({
			accessToken: null,
			refreshToken: null,
			user: null,
			hydrated: false,
			setSession: ({ accessToken, refreshToken, user }) =>
				set({ accessToken, refreshToken, user }),
			setHydrated: (value) => set({ hydrated: value }),
			clear: () =>
				set({ accessToken: null, refreshToken: null, user: null, hydrated: true }),
		}),
		{
			name: "allo-auth",
			storage: createJSONStorage(() => localStorage),
			partialize: (state) => ({
				accessToken: state.accessToken,
				refreshToken: state.refreshToken,
				user: state.user,
			}),
			onRehydrateStorage: () => (state) => {
				state?.setHydrated(true);
			},
		},
	),
);
