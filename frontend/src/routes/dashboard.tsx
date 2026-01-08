import { useEffect, useState } from 'react';
import { ZEngine } from '../engine/ZEngine';
import { useZStore } from '../store/zStore';
import { useZNavigation } from '../hooks/useZNavigation';
import { Widget } from '../api/client';

// Depth indicator component
function DepthIndicator() {
    const { currentZ, layers, focusedLayerId } = useZStore();
    const activeLayer = layers.find(l => l.id === focusedLayerId) || layers[0];
    const maxZ = Math.max(...layers.map(l => l.zIndex), 1);

    return (
        <div className="fixed left-6 top-1/2 -translate-y-1/2 z-50">
            <div className="glass-panel px-3 py-4 flex flex-col items-center gap-2">
                {/* Depth markers */}
                <div className="relative h-48 w-1 bg-white/10 rounded-full">
                    {layers.map((layer) => (
                        <div
                            key={layer.id}
                            className={`absolute w-3 h-3 rounded-full -left-1 transition-all duration-300 ${layer.id === focusedLayerId
                                    ? 'bg-aurora-primary scale-125 shadow-lg shadow-purple-500/50'
                                    : 'bg-white/30 hover:bg-white/50'
                                }`}
                            style={{
                                top: `${(layer.zIndex / maxZ) * 100}%`,
                                transform: 'translateY(-50%)',
                            }}
                            title={layer.name}
                        />
                    ))}

                    {/* Current position indicator */}
                    <div
                        className="absolute w-6 h-0.5 bg-aurora-accent -left-2.5 transition-all duration-200 rounded-full shadow-lg shadow-purple-500/50"
                        style={{
                            top: `${(currentZ / maxZ) * 100}%`,
                        }}
                    />
                </div>

                {/* Current layer name */}
                <div className="text-xs text-white/60 text-center max-w-20 truncate mt-2">
                    {activeLayer?.name || 'Surface'}
                </div>

                {/* Depth value */}
                <div className="text-lg font-bold text-white font-mono">
                    Z:{currentZ.toFixed(1)}
                </div>
            </div>
        </div>
    );
}

// Navigation hint component
function NavigationHint() {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setVisible(false), 10000);
        return () => clearTimeout(timer);
    }, []);

    if (!visible) return null;

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
            <div className="glass-panel px-6 py-3 flex items-center gap-6 text-sm text-white/60">
                <span className="flex items-center gap-2">
                    <kbd className="px-2 py-1 bg-white/10 rounded text-xs font-mono">↑↓</kbd>
                    <span className="hidden sm:inline">Navigate</span>
                </span>
                <span className="flex items-center gap-2">
                    <kbd className="px-2 py-1 bg-white/10 rounded text-xs font-mono">+/-</kbd>
                    <span className="hidden sm:inline">Zoom</span>
                </span>
                <span className="flex items-center gap-2">
                    <kbd className="px-2 py-1 bg-white/10 rounded text-xs font-mono">Scroll</kbd>
                    <span className="hidden sm:inline">Explore</span>
                </span>
                <button
                    onClick={() => setVisible(false)}
                    className="text-white/40 hover:text-white/70 ml-2"
                >
                    ✕
                </button>
            </div>
        </div>
    );
}

// Demo layers with spatial depth
const DEMO_LAYERS = [
    { id: 'layer-0', zIndex: 0, name: 'Surface', opacity: 1.0, blurIntensity: 0 },
    { id: 'layer-1', zIndex: 1, name: 'Key Metrics', opacity: 0.95, blurIntensity: 3 },
    { id: 'layer-2', zIndex: 2, name: 'Trends', opacity: 0.9, blurIntensity: 6 },
    { id: 'layer-3', zIndex: 3, name: 'Analytics', opacity: 0.85, blurIntensity: 10 },
    { id: 'layer-4', zIndex: 4, name: 'Deep Insights', opacity: 0.8, blurIntensity: 15 },
];

// Demo widgets distributed across layers  
const DEMO_WIDGETS: Widget[] = [
    // Surface layer - overview
    { id: 'w-overview-1', layer_id: 'layer-0', type: 'metric', title: 'Total Revenue', config: {}, data_source: {}, is_docked: true, docked_layer_id: 'layer-0', docked_position: { x: -4, y: 1 }, z_index: 0, dashboard_id: 'demo' },
    { id: 'w-overview-2', layer_id: 'layer-0', type: 'metric', title: 'Active Users', config: {}, data_source: {}, is_docked: true, docked_layer_id: 'layer-0', docked_position: { x: 0, y: 1 }, z_index: 0, dashboard_id: 'demo' },
    { id: 'w-overview-3', layer_id: 'layer-0', type: 'metric', title: 'Conversion', config: {}, data_source: {}, is_docked: true, docked_layer_id: 'layer-0', docked_position: { x: 4, y: 1 }, z_index: 0, dashboard_id: 'demo' },

    // Key Metrics layer
    { id: 'w-metric-1', layer_id: 'layer-1', type: 'metric', title: 'MRR', config: {}, data_source: {}, is_docked: true, docked_layer_id: 'layer-1', docked_position: { x: -4, y: 1 }, z_index: 0, dashboard_id: 'demo' },
    { id: 'w-metric-2', layer_id: 'layer-1', type: 'metric', title: 'Churn Rate', config: {}, data_source: {}, is_docked: true, docked_layer_id: 'layer-1', docked_position: { x: 0, y: 1 }, z_index: 0, dashboard_id: 'demo' },
    { id: 'w-chart-1', layer_id: 'layer-1', type: 'chart', title: 'Revenue Trend', config: {}, data_source: {}, is_docked: true, docked_layer_id: 'layer-1', docked_position: { x: 4, y: 1 }, z_index: 0, dashboard_id: 'demo' },

    // Trends layer
    { id: 'w-trend-1', layer_id: 'layer-2', type: 'chart', title: 'User Growth', config: {}, data_source: {}, is_docked: true, docked_layer_id: 'layer-2', docked_position: { x: -3, y: 1 }, z_index: 0, dashboard_id: 'demo' },
    { id: 'w-trend-2', layer_id: 'layer-2', type: 'chart', title: 'Engagement', config: {}, data_source: {}, is_docked: true, docked_layer_id: 'layer-2', docked_position: { x: 3, y: 1 }, z_index: 0, dashboard_id: 'demo' },

    // Analytics layer
    { id: 'w-analytics-1', layer_id: 'layer-3', type: 'composite', title: 'Traffic Sources', config: {}, data_source: {}, is_docked: true, docked_layer_id: 'layer-3', docked_position: { x: -3, y: 0.5 }, z_index: 0, dashboard_id: 'demo' },
    { id: 'w-analytics-2', layer_id: 'layer-3', type: 'composite', title: 'User Segments', config: {}, data_source: {}, is_docked: true, docked_layer_id: 'layer-3', docked_position: { x: 3, y: 0.5 }, z_index: 0, dashboard_id: 'demo' },

    // Deep Insights layer
    { id: 'w-deep-1', layer_id: 'layer-4', type: 'composite', title: 'Performance', config: {}, data_source: {}, is_docked: true, docked_layer_id: 'layer-4', docked_position: { x: 0, y: 0.5 }, z_index: 0, dashboard_id: 'demo' },
];

export default function DashboardPage() {
    const { setLayers, layers, currentZ } = useZStore();
    const { goDeeper, goShallower } = useZNavigation();
    const [loading, setLoading] = useState(true);

    // Initialize with demo data
    useEffect(() => {
        setLayers(DEMO_LAYERS);
        const timer = setTimeout(() => setLoading(false), 800);
        return () => clearTimeout(timer);
    }, [setLayers]);

    // Get current layer name
    const currentLayer = layers.find(l => Math.abs(l.zIndex - currentZ) < 0.5) || layers[0];

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-aurora-surface gap-4">
                <div className="text-white text-2xl font-light animate-pulse">🌌</div>
                <div className="text-white/60 text-sm">Initializing Z-Engine...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-aurora-surface overflow-hidden">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 h-16 px-6 flex items-center justify-between glass-panel rounded-none border-t-0 border-x-0">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="text-2xl">🌌</span>
                        <span>Aurora</span>
                    </h1>
                    <span className="text-white/40">|</span>
                    <span className="text-white/70 text-sm">
                        {currentLayer?.name || 'Spatial Dashboard'}
                    </span>
                </div>

                <div className="flex items-center gap-4">
                    <span className="text-white/40 text-xs hidden sm:block">
                        {layers.length} layers • {DEMO_WIDGETS.length} widgets
                    </span>
                    <div className="px-3 py-1 bg-aurora-primary/20 rounded-full text-xs text-aurora-primary">
                        Demo Mode
                    </div>
                </div>
            </header>

            {/* Main Z-Engine Canvas */}
            <main className="pt-16 h-screen">
                <ZEngine
                    className="w-full h-full"
                    widgets={DEMO_WIDGETS}
                    enableControls={true}
                />
            </main>

            {/* Depth Indicator */}
            <DepthIndicator />

            {/* Navigation Hint */}
            <NavigationHint />

            {/* Layer Navigation Buttons */}
            <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-2">
                <button
                    onClick={goShallower}
                    disabled={currentZ <= 0}
                    className="glass-panel w-12 h-12 flex items-center justify-center text-white hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed group"
                    title="Go shallower (up)"
                >
                    <span className="group-hover:scale-110 transition-transform">↑</span>
                </button>
                <div className="glass-panel px-2 py-1 text-center text-xs text-white/60">
                    {Math.round(currentZ)}/{layers.length - 1}
                </div>
                <button
                    onClick={goDeeper}
                    disabled={currentZ >= layers.length - 1}
                    className="glass-panel w-12 h-12 flex items-center justify-center text-white hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed group"
                    title="Go deeper (down)"
                >
                    <span className="group-hover:scale-110 transition-transform">↓</span>
                </button>
            </div>
        </div>
    );
}
