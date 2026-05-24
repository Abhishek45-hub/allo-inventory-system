import { create } from 'zustand';

interface SessionUser {
  id: string;
  email: string;
  role: 'ADMIN' | 'OPERATOR' | 'CUSTOMER';
  fullName: string;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: SessionUser | null;
  setSession: (payload: { accessToken: string; refreshToken: string; user: SessionUser }) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  user: null,
  setSession: ({ accessToken, refreshToken, user }) => set({ accessToken, refreshToken, user }),
  clear: () => set({ accessToken: null, refreshToken: null, user: null }),
}));
