import { create } from 'zustand';
import { authApi, userApi, UserProfile } from '../api/client';

interface AuthState {
    user: UserProfile | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;

    // Actions
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<boolean>;
    clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,

    login: async (email, password) => {
        set({ isLoading: true, error: null });

        try {
            await authApi.login(email, password);
            const user = await userApi.getProfile();

            set({
                user,
                isAuthenticated: true,
                isLoading: false,
                error: null,
            });

            return true;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Login failed';
            set({
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: message,
            });
            return false;
        }
    },

    logout: async () => {
        try {
            await authApi.logout();
        } finally {
            localStorage.removeItem('aurora_token');
            set({
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,
            });
        }
    },

    checkAuth: async () => {
        const token = localStorage.getItem('aurora_token');

        if (!token) {
            set({
                user: null,
                isAuthenticated: false,
                isLoading: false,
            });
            return false;
        }

        try {
            set({ isLoading: true });
            const user = await userApi.getProfile();

            set({
                user,
                isAuthenticated: true,
                isLoading: false,
            });

            return true;
        } catch {
            localStorage.removeItem('aurora_token');
            set({
                user: null,
                isAuthenticated: false,
                isLoading: false,
            });
            return false;
        }
    },

    clearError: () => set({ error: null }),
}));

export default useAuthStore;
