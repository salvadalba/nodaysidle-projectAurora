import { useEffect, useState } from 'react';
import { ZEngine } from '../engine/ZEngine';
import { useZStore } from '../store/zStore';
import { useZNavigation } from '../hooks/useZNavigation';

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

// Demo mock data - no API required
const DEMO_LAYERS = [
    { id: 'layer-0', zIndex: 0, name: 'Surface', opacity: 1.0, blurIntensity: 0 },
    { id: 'layer-1', zIndex: 1, name: 'Metrics', opacity: 0.95, blurIntensity: 5 },
    { id: 'layer-2', zIndex: 2, name: 'Charts', opacity: 0.9, blurIntensity: 10 },
    { id: 'layer-3', zIndex: 3, name: 'Analytics', opacity: 0.85, blurIntensity: 15 },
];

const DEMO_WIDGETS = [
    { id: 'w1', layer_id: 'layer-1', type: 'metric' as const, title: 'Revenue', config: {}, data_source: {}, is_docked: true, docked_layer_id: 'layer-1', docked_position: { x: -3, y: 1 }, z_index: 0, dashboard_id: 'demo' },
    { id: 'w2', layer_id: 'layer-1', type: 'metric' as const, title: 'Users', config: {}, data_source: {}, is_docked: true, docked_layer_id: 'layer-1', docked_position: { x: 0, y: 1 }, z_index: 0, dashboard_id: 'demo' },
    { id: 'w3', layer_id: 'layer-2', type: 'chart' as const, title: 'Sales Trend', config: {}, data_source: {}, is_docked: true, docked_layer_id: 'layer-2', docked_position: { x: 0, y: 0 }, z_index: 0, dashboard_id: 'demo' },
    { id: 'w4', layer_id: 'layer-3', type: 'composite' as const, title: 'Performance', config: {}, data_source: {}, is_docked: true, docked_layer_id: 'layer-3', docked_position: { x: 0, y: 0 }, z_index: 0, dashboard_id: 'demo' },
];

export default function DashboardPage() {
    const { setLayers } = useZStore();
    const { goDeeper, goShallower } = useZNavigation();
    const [loading, setLoading] = useState(true);

    // Initialize with demo data
    useEffect(() => {
        setLayers(DEMO_LAYERS);
        // Simulate brief loading
        const timer = setTimeout(() => setLoading(false), 500);
        return () => clearTimeout(timer);
    }, [setLayers]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-aurora-surface">
                <div className="text-white text-lg animate-pulse">Loading Aurora...</div>
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
                    <span className="text-white/60">
                        / Spatial Dashboard Demo
                    </span>
                </div>

                <div className="flex items-center gap-4">
                    <span className="text-white/60 text-sm">
                        Z-Axis Navigation Demo
                    </span>
                </div>
            </header>

            {/* Main Z-Engine Canvas */}
            <main className="pt-16 h-screen">
                <ZEngine
                    className="w-full h-full"
                    widgets={DEMO_WIDGETS}
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
