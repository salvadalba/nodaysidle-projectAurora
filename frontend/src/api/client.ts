import axios, { AxiosInstance, AxiosError } from 'axios';

// Types
export interface ApiError {
    code: string;
    message: string;
    details?: Record<string, unknown>;
}

export interface ApiResponse<T> {
    data?: T;
    error?: ApiError;
    requestId?: string;
}

// Create axios instance
const api: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('aurora_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - handle errors
api.interceptors.response.use(
    (response) => response,
    (error: AxiosError<{ error: ApiError }>) => {
        // Handle 401 - redirect to login
        if (error.response?.status === 401) {
            localStorage.removeItem('aurora_token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// =============================================================================
// Auth API
// =============================================================================

export interface LoginResponse {
    token: string;
    user: {
        id: string;
        email: string;
        name: string | null;
    };
}

export const authApi = {
    login: async (email: string, password: string): Promise<LoginResponse> => {
        const { data } = await api.post<LoginResponse>('/auth/login', { email, password });
        localStorage.setItem('aurora_token', data.token);
        return data;
    },

    logout: async (): Promise<void> => {
        await api.post('/auth/logout');
        localStorage.removeItem('aurora_token');
    },
};

// =============================================================================
// User API
// =============================================================================

export interface UserProfile {
    id: string;
    email: string;
    name: string | null;
    preferences: {
        maxBlurIntensity: number;
        performanceMode: 'auto' | 'performance' | 'quality';
        theme: 'dark' | 'light';
        defaultDashboardId: string | null;
    };
    createdAt: string;
}

export const userApi = {
    getProfile: async (): Promise<UserProfile> => {
        const { data } = await api.get<UserProfile>('/users/me');
        return data;
    },

    updatePreferences: async (prefs: Partial<UserProfile['preferences']>): Promise<UserProfile['preferences']> => {
        const { data } = await api.patch<{ preferences: UserProfile['preferences'] }>('/users/me/preferences', prefs);
        return data.preferences;
    },
};

// =============================================================================
// Dashboard API
// =============================================================================

export interface Layer {
    id: string;
    dashboard_id: string;
    z_index: number;
    name: string;
    opacity: number;
    blur_intensity: number;
}

export interface Widget {
    id: string;
    layer_id: string;
    dashboard_id: string;
    type: 'metric' | 'chart' | 'composite';
    title: string;
    config: Record<string, unknown>;
    data_source: Record<string, unknown>;
    is_docked: boolean;
    docked_layer_id: string | null;
    docked_position: { x: number; y: number };
    z_index: number;
}

export interface Dashboard {
    id: string;
    user_id: string;
    name: string;
    description: string | null;
    layers: (Layer & { widgets: Widget[] })[];
}

export const dashboardApi = {
    list: async (): Promise<{ dashboards: Dashboard[] }> => {
        const { data } = await api.get<{ dashboards: Dashboard[] }>('/dashboards');
        return data;
    },

    get: async (id: string, includeWidgets = true): Promise<Dashboard> => {
        const { data } = await api.get<Dashboard>(`/dashboards/${id}`, {
            params: { includeWidgets },
        });
        return data;
    },

    create: async (name: string, description?: string): Promise<Dashboard> => {
        const { data } = await api.post<Dashboard>('/dashboards', { name, description });
        return data;
    },

    createLayer: async (dashboardId: string, layer: { name: string; opacity?: number; blurIntensity?: number }): Promise<Layer> => {
        const { data } = await api.post<Layer>(`/dashboards/${dashboardId}/layers`, layer);
        return data;
    },
};

// =============================================================================
// Widget API
// =============================================================================

export interface WidgetData {
    id: string;
    widget_id: string;
    timestamp: string;
    value: number;
    trend: number;
    constituents: Array<{ name: string; value: number; weight: number }>;
    historical: Array<{ timestamp: string; value: number }>;
}

export const widgetApi = {
    create: async (widget: {
        layerId: string;
        type: 'metric' | 'chart' | 'composite';
        title: string;
        config?: Record<string, unknown>;
        dataSource?: Record<string, unknown>;
    }): Promise<Widget> => {
        const { data } = await api.post<Widget>('/widgets', widget);
        return data;
    },

    update: async (id: string, updates: Partial<Widget>): Promise<Widget> => {
        const { data } = await api.patch<Widget>(`/widgets/${id}`, updates);
        return data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/widgets/${id}`);
    },

    getData: async (id: string, timeRange: '7d' | '30d' | '90d' = '7d'): Promise<WidgetData> => {
        const { data } = await api.get<WidgetData>(`/widgets/${id}/data`, {
            params: { timeRange },
        });
        return data;
    },

    updateDocking: async (id: string, docking: {
        isDocked: boolean;
        targetLayerId?: string;
        position?: { x: number; y: number };
    }): Promise<Widget> => {
        const { data } = await api.patch<Widget>(`/widgets/${id}/docking`, docking);
        return data;
    },
};

export default api;
