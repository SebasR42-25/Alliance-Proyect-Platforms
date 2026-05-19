import { create } from 'zustand';
import { saveToken, clearToken } from '../services/api';
import type { AuthUser } from '../types';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isHydrated: boolean;
  login: (user: AuthUser, token: string) => Promise<void>;
  logout: () => Promise<void>;
  setHydrated: (user: AuthUser | null, token: string | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isHydrated: false,

  login: async (user, token) => {
    await saveToken(token);
    set({ user, token, isHydrated: true });
  },

  logout: async () => {
    await clearToken();
    set({ user: null, token: null, isHydrated: true });
  },

  setHydrated: (user, token) => set({ user, token, isHydrated: true }),
}));
