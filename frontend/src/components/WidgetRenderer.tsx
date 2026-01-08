import { useRef, useState } from 'react';
import { Html, Billboard } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Widget } from '../api/client';

interface WidgetContainerProps {
    widget: Widget;
    position?: [number, number, number];
    scale?: number;
    onDragStart?: () => void;
    onDragEnd?: () => void;
}

// Mock data generators
const getMockMetricData = (widgetId: string) => {
    const seed = widgetId.charCodeAt(0) + widgetId.charCodeAt(widgetId.length - 1);
    return {
        value: Math.floor(10000 + (seed * 1234) % 90000),
        trend: ((seed % 20) - 10) / 2,
        label: ['Revenue', 'Users', 'Orders', 'Conversion'][seed % 4],
    };
};

const getMockChartData = (widgetId: string) => {
    const seed = widgetId.charCodeAt(0);
    return Array.from({ length: 12 }, (_, i) => ({
        value: 30 + Math.sin((i + seed) * 0.5) * 20 + Math.random() * 10,
        label: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
    }));
};

const getMockCompositeData = (widgetId: string) => {
    const seed = widgetId.charCodeAt(0);
    const categories = ['Sales', 'Marketing', 'Engineering', 'Support'];
    return categories.map((name, i) => ({
        name,
        value: Math.floor(20 + ((seed + i) * 17) % 80),
        color: ['#6366f1', '#8b5cf6', '#a855f7', '#c084fc'][i],
    }));
};

/**
 * Metric Widget - displays a single KPI with trend
 */
function MetricWidget({ widget }: { widget: Widget }) {
    const data = getMockMetricData(widget.id);
    const isPositive = data.trend >= 0;

    return (
        <div className="glass-panel p-4 w-48 select-none cursor-grab active:cursor-grabbing">
            <div className="text-xs text-white/60 uppercase tracking-wide mb-1">
                {widget.title || data.label}
            </div>
            <div className="text-2xl font-bold text-white mb-1">
                {data.value.toLocaleString()}
            </div>
            <div className={`text-sm flex items-center gap-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                <span>{isPositive ? '↑' : '↓'}</span>
                <span>{Math.abs(data.trend).toFixed(1)}%</span>
                <span className="text-white/40 text-xs">vs last period</span>
            </div>
        </div>
    );
}

/**
 * Chart Widget - displays a sparkline/area chart
 */
function ChartWidget({ widget }: { widget: Widget }) {
    const data = getMockChartData(widget.id);
    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value));
    const range = maxValue - minValue || 1;

    // Create SVG path
    const pathPoints = data.map((d, i) => {
        const x = (i / (data.length - 1)) * 180;
        const y = 50 - ((d.value - minValue) / range) * 40;
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');

    const areaPath = `${pathPoints} L 180 50 L 0 50 Z`;

    return (
        <div className="glass-panel p-4 w-56 select-none cursor-grab active:cursor-grabbing">
            <div className="text-xs text-white/60 uppercase tracking-wide mb-2">
                {widget.title || 'Trend'}
            </div>
            <svg viewBox="0 0 180 60" className="w-full h-16">
                <defs>
                    <linearGradient id={`gradient-${widget.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity="0.1" />
                    </linearGradient>
                </defs>
                <path d={areaPath} fill={`url(#gradient-${widget.id})`} />
                <path d={pathPoints} fill="none" stroke="#8b5cf6" strokeWidth="2" />
                {data.map((d, i) => (
                    <circle
                        key={i}
                        cx={(i / (data.length - 1)) * 180}
                        cy={50 - ((d.value - minValue) / range) * 40}
                        r="2"
                        fill="#a855f7"
                    />
                ))}
            </svg>
            <div className="flex justify-between text-xs text-white/40 mt-1">
                <span>{data[0].label}</span>
                <span>{data[data.length - 1].label}</span>
            </div>
        </div>
    );
}

/**
 * Composite Widget - displays breakdown bars
 */
function CompositeWidget({ widget }: { widget: Widget }) {
    const data = getMockCompositeData(widget.id);
    const total = data.reduce((sum, d) => sum + d.value, 0);

    return (
        <div className="glass-panel p-4 w-52 select-none cursor-grab active:cursor-grabbing">
            <div className="text-xs text-white/60 uppercase tracking-wide mb-3">
                {widget.title || 'Breakdown'}
            </div>
            <div className="space-y-2">
                {data.map((item, i) => (
                    <div key={i}>
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-white/80">{item.name}</span>
                            <span className="text-white/60">{item.value}%</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                    width: `${(item.value / 100) * 100}%`,
                                    background: `linear-gradient(90deg, ${item.color}, ${item.color}88)`,
                                }}
                            />
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-3 pt-2 border-t border-white/10 text-sm text-white/60">
                Total Score: <span className="text-white font-medium">{total}</span>
            </div>
        </div>
    );
}

/**
 * Main Widget Renderer - 3D positioned widget
 */
export function WidgetRenderer({
    widget,
    position = [0, 0, 0],
    scale = 1,
}: WidgetContainerProps) {
    const groupRef = useRef<THREE.Group>(null);
    const [hovered, setHovered] = useState(false);

    // Floating animation
    useFrame(({ clock }) => {
        if (groupRef.current) {
            const t = clock.elapsedTime;
            // Subtle float effect
            groupRef.current.position.y = position[1] + Math.sin(t * 0.5 + position[0]) * 0.05;
            // Gentle rotation on hover
            groupRef.current.rotation.y = THREE.MathUtils.lerp(
                groupRef.current.rotation.y,
                hovered ? 0.1 : 0,
                0.1
            );
        }
    });

    const renderWidget = () => {
        switch (widget.type) {
            case 'metric':
                return <MetricWidget widget={widget} />;
            case 'chart':
                return <ChartWidget widget={widget} />;
            case 'composite':
                return <CompositeWidget widget={widget} />;
            default:
                return <MetricWidget widget={widget} />;
        }
    };

    return (
        <group
            ref={groupRef}
            position={position}
            scale={scale}
        >
            <Billboard follow={false}>
                <Html
                    transform
                    occlude
                    distanceFactor={5}
                    style={{
                        transition: 'transform 0.3s, opacity 0.3s',
                        transform: `scale(${hovered ? 1.05 : 1})`,
                        opacity: hovered ? 1 : 0.95,
                    }}
                    onPointerEnter={() => setHovered(true)}
                    onPointerLeave={() => setHovered(false)}
                >
                    {renderWidget()}
                </Html>
            </Billboard>
        </group>
    );
}

export default WidgetRenderer;
