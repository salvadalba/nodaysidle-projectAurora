import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ZEngine } from '../engine/ZEngine';
import { useZStore } from '../store/zStore';
import { useZNavigation } from '../hooks/useZNavigation';
import { useAuthStore } from '../store/authStore';
import { dashboardApi, Dashboard } from '../api/client';

// Depth indicator component
function DepthIndicator() {
    const { currentZ, layers, focusedLayerId } = useZStore();
    const activeLayer = layers.find(l => l.id === focusedLayerId) || layers[0];

    return (
        <div className="fixed left-6 top-1/2 -translate-y-1/2 z-50">
            <div className="glass-panel px-3 py-4 flex flex-col items-center gap-2">
                {/* Depth markers */}
                <div className="relative h-48 w-1 bg-white/10 rounded-full">
                    {layers.map((layer) => (
                        <div
                            key={layer.id}
                            className={`absolute w-3 h-3 rounded-full -left-1 transition-all duration-300 ${layer.id === focusedLayerId
                                ? 'bg-aurora-primary scale-125'
                                : 'bg-white/30 hover:bg-white/50'
                                }`}
                            style={{
                                top: `${(layer.zIndex / Math.max(...layers.map(l => l.zIndex), 1)) * 100}%`,
                                transform: 'translateY(-50%)',
                            }}
                        />
                    ))}

                    {/* Current position indicator */}
                    <div
                        className="absolute w-5 h-0.5 bg-aurora-accent -left-2 transition-all duration-200"
                        style={{
                            top: `${(currentZ / Math.max(...layers.map(l => l.zIndex), 1)) * 100}%`,
                        }}
                    />
                </div>

                {/* Current layer name */}
                <div className="text-xs text-white/60 text-center max-w-16 truncate">
                    {activeLayer?.name || 'Surface'}
                </div>

                {/* Depth value */}
                <div className="text-lg font-bold text-white">
                    Z:{Math.round(currentZ)}
                </div>
            </div>
        </div>
    );
}

// Navigation hint component
function NavigationHint() {
    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
            <div className="glass-panel px-6 py-3 flex items-center gap-4 text-sm text-white/60">
                <span className="flex items-center gap-2">
                    <kbd className="px-2 py-1 bg-white/10 rounded text-xs">↑↓</kbd>
                    Navigate depth
                </span>
                <span className="flex items-center gap-2">
                    <kbd className="px-2 py-1 bg-white/10 rounded text-xs">+/-</kbd>
                    Zoom
                </span>
                <span className="flex items-center gap-2">
                    <kbd className="px-2 py-1 bg-white/10 rounded text-xs">Scroll</kbd>
                    Navigate
                </span>
            </div>
        </div>
    );
}

export default function DashboardPage() {
    const navigate = useNavigate();
    const { user, isAuthenticated, isLoading: authLoading, logout } = useAuthStore();
    const { setLayers } = useZStore();
    const { goDeeper, goShallower } = useZNavigation();

    const [dashboard, setDashboard] = useState<Dashboard | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Check auth on mount
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, authLoading, navigate]);

    // Load dashboard data
    useEffect(() => {
        async function loadDashboard() {
            try {
                setLoading(true);
                // Try to get user's default dashboard or list and pick first
                const { dashboards } = await dashboardApi.list();

                if (dashboards.length > 0) {
                    const fullDashboard = await dashboardApi.get(dashboards[0].id, true);
                    setDashboard(fullDashboard);

                    // Set layers in Z store
                    const storeLayers = fullDashboard.layers.map(l => ({
                        id: l.id,
                        zIndex: l.z_index,
                        name: l.name,
                        opacity: parseFloat(String(l.opacity)),
                        blurIntensity: l.blur_intensity,
                    }));
                    setLayers(storeLayers);
                }
            } catch (err) {
                console.error('Failed to load dashboard:', err);
                setError('Failed to load dashboard');
            } finally {
                setLoading(false);
            }
        }

        if (isAuthenticated) {
            loadDashboard();
        }
    }, [isAuthenticated, setLayers]);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-aurora-surface">
                <div className="text-white text-lg animate-pulse">Loading Aurora...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-aurora-surface gap-4">
                <div className="text-red-400">{error}</div>
                <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-aurora-primary/20 hover:bg-aurora-primary/40 rounded-lg text-white transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-aurora-surface overflow-hidden">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 h-16 px-6 flex items-center justify-between glass-panel rounded-none border-t-0 border-x-0">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-bold text-white">
                        🌌 Aurora
                    </h1>
                    {dashboard && (
                        <span className="text-white/60">
                            / {dashboard.name}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    <span className="text-white/60 text-sm">
                        {user?.email}
                    </span>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                        Sign Out
                    </button>
                </div>
            </header>

            {/* Main Z-Engine Canvas */}
            <main className="pt-16 h-screen">
                <ZEngine
                    className="w-full h-full"
                    widgets={dashboard?.layers.flatMap(l => l.widgets) || []}
                />
            </main>

            {/* Depth Indicator */}
            <DepthIndicator />

            {/* Navigation Hint */}
            <NavigationHint />

            {/* Layer Navigation Buttons (Mobile-friendly) */}
            <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-2">
                <button
                    onClick={goShallower}
                    className="glass-panel w-12 h-12 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                    title="Go shallower (up)"
                >
                    ↑
                </button>
                <button
                    onClick={goDeeper}
                    className="glass-panel w-12 h-12 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                    title="Go deeper (down)"
                >
                    ↓
                </button>
            </div>
        </div>
    );
}
