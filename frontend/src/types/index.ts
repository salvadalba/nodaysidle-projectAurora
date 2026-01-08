// User Types
export interface User {
    id: string;
    email: string;
    name: string;
    preferences: UserPreferences;
}

export interface UserPreferences {
    maxBlurIntensity: number;
    performanceMode: 'auto' | 'performance' | 'quality';
    theme: 'dark' | 'light';
    defaultDashboardId?: string;
}

// Dashboard Types
export interface Dashboard {
    id: string;
    name: string;
    description?: string;
    ownerId: string;
    layers: Layer[];
    createdAt: string;
    updatedAt: string;
}

// Layer Types
export interface Layer {
    id: string;
    dashboardId: string;
    zIndex: number;
    name: string;
    opacity: number;
    blurIntensity: number;
    widgets: Widget[];
}

// Widget Types
export type WidgetType = 'metric' | 'chart' | 'composite';

export interface Widget {
    id: string;
    layerId: string;
    type: WidgetType;
    title: string;
    config: WidgetConfig;
    isDocked: boolean;
    targetLayerId?: string;
    position: { x: number; y: number };
    zIndex: number;
    data?: WidgetData;
}

export interface WidgetConfig {
    dataSource?: string;
    refreshInterval?: number;
    chartType?: 'line' | 'bar' | 'pie';
    backgroundColor?: string;
    [key: string]: unknown;
}

export interface WidgetData {
    value: number | string;
    trend: number;
    constituents?: Constituent[];
    historical?: HistoricalDataPoint[];
}

export interface Constituent {
    name: string;
    value: number;
    weight: number;
    color?: string;
}

export interface HistoricalDataPoint {
    timestamp: string;
    value: number;
}

// API Response Types
export interface ApiResponse<T> {
    data: T;
    error?: ApiError;
}

export interface ApiError {
    code: string;
    message: string;
    details?: Record<string, unknown>;
}

// Auth Types
export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    user: User;
}

// Visual State Types
export interface CursorPosition {
    x: number;
    y: number;
    normalizedX: number;
    normalizedY: number;
}
