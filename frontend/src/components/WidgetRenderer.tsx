import { useMemo } from 'react';
import { Html } from '@react-three/drei';
import { Widget } from '../api/client';

interface WidgetRendererProps {
    widget: Widget;
    data?: {
        value: number;
        trend: number;
        constituents?: Array<{ name: string; value: number; weight: number }>;
        historical?: Array<{ timestamp: string; value: number }>;
    };
    position?: [number, number, number];
    scale?: number;
}

/**
 * Main widget renderer that delegates to specific widget types
 */
export function WidgetRenderer({ widget, data, position = [0, 0, 0], scale = 1 }: WidgetRendererProps) {
    const mockData = useMemo(() => data || {
        value: Math.random() * 1000,
        trend: (Math.random() - 0.5) * 20,
        constituents: [
            { name: 'A', value: 400, weight: 0.4 },
            { name: 'B', value: 350, weight: 0.35 },
            { name: 'C', value: 250, weight: 0.25 },
        ],
        historical: Array.from({ length: 7 }, (_, i) => ({
            timestamp: new Date(Date.now() - i * 86400000).toISOString(),
            value: Math.random() * 1000,
        })),
    }, [data]);

    return (
        <group position={position} scale={scale}>
            <Html
                transform
                distanceFactor={10}
                style={{
                    width: widget.type === 'composite' ? '300px' : '200px',
                    pointerEvents: 'auto',
                }}
            >
                {widget.type === 'metric' && (
                    <MetricWidget widget={widget} data={mockData} />
                )}
                {widget.type === 'chart' && (
                    <ChartWidget widget={widget} data={mockData} />
                )}
                {widget.type === 'composite' && (
                    <CompositeWidget widget={widget} data={mockData} />
                )}
            </Html>
        </group>
    );
}

interface MetricWidgetProps {
    widget: Widget;
    data: { value: number; trend: number };
}

/**
 * Metric widget displaying a single key value with trend
 */
function MetricWidget({ widget, data }: MetricWidgetProps) {
    const config = widget.config as { prefix?: string; suffix?: string; format?: string };
    const isPositive = data.trend >= 0;

    const formattedValue = useMemo(() => {
        const val = data.value;
        if (config.format === 'number') {
            return val.toLocaleString('en-US', { maximumFractionDigits: 0 });
        }
        return val.toFixed(1);
    }, [data.value, config.format]);

    return (
        <div className="glass-panel p-4 min-w-[180px] cursor-pointer hover:scale-105 transition-transform">
            <div className="text-white/60 text-xs font-medium uppercase tracking-wider mb-2">
                {widget.title}
            </div>
            <div className="text-2xl font-bold text-white">
                {config.prefix || ''}{formattedValue}{config.suffix || ''}
            </div>
            <div className={`flex items-center gap-1 mt-2 text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                <span>{isPositive ? '↑' : '↓'}</span>
                <span>{Math.abs(data.trend).toFixed(1)}%</span>
                <span className="text-white/40 ml-1">vs last period</span>
            </div>
        </div>
    );
}

interface ChartWidgetProps {
    widget: Widget;
    data: { historical?: Array<{ timestamp: string; value: number }> };
}

/**
 * Chart widget displaying trend visualization
 */
function ChartWidget({ widget, data }: ChartWidgetProps) {
    const config = widget.config as { chartType?: string };
    const points = data.historical || [];

    // Generate SVG path for sparkline
    const sparklinePath = useMemo(() => {
        if (points.length < 2) return '';

        const values = points.map(p => p.value);
        const min = Math.min(...values);
        const max = Math.max(...values);
        const range = max - min || 1;

        const width = 180;
        const height = 50;

        return points
            .map((point, i) => {
                const x = (i / (points.length - 1)) * width;
                const y = height - ((point.value - min) / range) * height;
                return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
            })
            .join(' ');
    }, [points]);

    return (
        <div className="glass-panel p-4 min-w-[200px] cursor-pointer hover:scale-105 transition-transform">
            <div className="text-white/60 text-xs font-medium uppercase tracking-wider mb-3">
                {widget.title}
            </div>

            {/* Sparkline chart */}
            <svg width="180" height="50" className="overflow-visible">
                <defs>
                    <linearGradient id={`gradient-${widget.id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                    </linearGradient>
                </defs>

                {/* Area fill */}
                <path
                    d={`${sparklinePath} L 180 50 L 0 50 Z`}
                    fill={`url(#gradient-${widget.id})`}
                />

                {/* Line */}
                <path
                    d={sparklinePath}
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Current value dot */}
                {points.length > 0 && (
                    <circle
                        cx="180"
                        cy={50 - ((points[0]?.value - Math.min(...points.map(p => p.value))) / (Math.max(...points.map(p => p.value)) - Math.min(...points.map(p => p.value)) || 1)) * 50}
                        r="4"
                        fill="#6366f1"
                        stroke="white"
                        strokeWidth="2"
                    />
                )}
            </svg>

            <div className="text-xs text-white/40 mt-2">
                {config.chartType || 'line'} • Last 7 days
            </div>
        </div>
    );
}

interface CompositeWidgetProps {
    widget: Widget;
    data: { value: number; constituents?: Array<{ name: string; value: number; weight: number }> };
}

/**
 * Composite widget showing breakdown of components
 */
function CompositeWidget({ widget, data }: CompositeWidgetProps) {
    const constituents = data.constituents || [];
    const total = constituents.reduce((sum, c) => sum + c.value, 0);

    return (
        <div className="glass-panel p-4 min-w-[280px] cursor-pointer hover:scale-105 transition-transform">
            <div className="text-white/60 text-xs font-medium uppercase tracking-wider mb-3">
                {widget.title}
            </div>

            {/* Total value */}
            <div className="text-xl font-bold text-white mb-4">
                ${total.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </div>

            {/* Stacked bar */}
            <div className="flex h-3 rounded-full overflow-hidden mb-3">
                {constituents.map((c, i) => (
                    <div
                        key={c.name}
                        className="h-full transition-all duration-300"
                        style={{
                            width: `${c.weight * 100}%`,
                            backgroundColor: ['#6366f1', '#8b5cf6', '#06b6d4'][i % 3],
                        }}
                    />
                ))}
            </div>

            {/* Legend */}
            <div className="space-y-1">
                {constituents.map((c, i) => (
                    <div key={c.name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                            <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: ['#6366f1', '#8b5cf6', '#06b6d4'][i % 3] }}
                            />
                            <span className="text-white/80">{c.name}</span>
                        </div>
                        <span className="text-white/60">
                            ${c.value.toLocaleString()} ({(c.weight * 100).toFixed(0)}%)
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default WidgetRenderer;
