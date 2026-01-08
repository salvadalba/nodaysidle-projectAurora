import { useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useRef } from 'react';
import { useZStore } from '../store/zStore';
import { LayerStack } from './LayerStack';
import { WidgetRenderer } from '../components/WidgetRenderer';
import { Widget } from '../api/client';

interface ZCameraProps {
    fov?: number;
    baseCameraZ?: number;
    depthScale?: number;
}

/**
 * Camera controller that follows Z-navigation
 */
function ZCameraController({
    fov = 60,
    baseCameraZ = 10,
    depthScale = 2,
}: ZCameraProps) {
    const cameraRef = useRef<THREE.PerspectiveCamera>(null);
    const { currentZ, zoomLevel } = useZStore();
    const { set } = useThree();

    useEffect(() => {
        if (cameraRef.current) {
            set({ camera: cameraRef.current });
        }
    }, [set]);

    useFrame(() => {
        if (!cameraRef.current) return;

        // Camera moves along Z-axis
        const targetCameraZ = baseCameraZ - (currentZ * depthScale);

        cameraRef.current.position.z = THREE.MathUtils.lerp(
            cameraRef.current.position.z,
            targetCameraZ,
            0.1
        );

        // FOV based on zoom
        const targetFov = fov / zoomLevel;
        cameraRef.current.fov = THREE.MathUtils.lerp(
            cameraRef.current.fov,
            targetFov,
            0.1
        );
        cameraRef.current.updateProjectionMatrix();
    });

    return (
        <PerspectiveCamera
            ref={cameraRef}
            makeDefault
            fov={fov}
            near={0.1}
            far={1000}
            position={[0, 0, baseCameraZ]}
        />
    );
}

/**
 * Loading fallback for Suspense
 */
function LoadingPlane() {
    return (
        <mesh>
            <planeGeometry args={[4, 2]} />
            <meshBasicMaterial color="#1e1e3f" transparent opacity={0.8} />
            <Html center>
                <div className="text-white animate-pulse">Loading...</div>
            </Html>
        </mesh>
    );
}

interface WidgetsForLayerProps {
    widgets: Widget[];
    layerZIndex: number;
    depthScale?: number;
}

/**
 * Renders widgets positioned on a specific layer
 */
function WidgetsForLayer({ widgets, layerZIndex, depthScale = 2 }: WidgetsForLayerProps) {
    // Position widgets in a grid on the layer
    const positions: [number, number, number][] = [
        [-5, 2, 0],
        [0, 2, 0],
        [5, 2, 0],
        [-3, -1, 0],
        [3, -1, 0],
    ];

    return (
        <group position={[0, 0, -layerZIndex * depthScale + 0.1]}>
            {widgets.map((widget, index) => (
                <WidgetRenderer
                    key={widget.id}
                    widget={widget}
                    position={positions[index % positions.length]}
                    scale={0.8}
                />
            ))}
        </group>
    );
}

interface ZEngineProps {
    children?: React.ReactNode;
    className?: string;
    widgets?: Widget[];
    onReady?: () => void;
}

/**
 * Main Z-Engine canvas component
 */
export function ZEngine({ children, className = '', widgets = [], onReady }: ZEngineProps) {
    const { layers } = useZStore();

    useEffect(() => {
        onReady?.();
    }, [onReady]);

    // Group widgets by layer
    const widgetsByLayer = widgets.reduce<Record<string, Widget[]>>((acc, widget) => {
        if (!acc[widget.layer_id]) {
            acc[widget.layer_id] = [];
        }
        acc[widget.layer_id].push(widget);
        return acc;
    }, {});

    return (
        <div className={`w-full h-full ${className}`}>
            <Canvas
                dpr={[1, 2]}
                gl={{
                    antialias: true,
                    alpha: true,
                    powerPreference: 'high-performance',
                }}
                style={{ background: 'linear-gradient(180deg, #0f0f23 0%, #1a1a2e 100%)' }}
            >
                <Suspense fallback={<LoadingPlane />}>
                    {/* Camera */}
                    <ZCameraController />

                    {/* Lighting */}
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} intensity={0.8} />
                    <pointLight position={[-10, -10, 5]} intensity={0.3} color="#6366f1" />
                    <pointLight position={[0, 5, 5]} intensity={0.2} color="#8b5cf6" />

                    {/* Layer stack with depth blur */}
                    <LayerStack layers={layers} />

                    {/* Widgets on each layer */}
                    {layers.map((layer) => (
                        <WidgetsForLayer
                            key={layer.id}
                            widgets={widgetsByLayer[layer.id] || []}
                            layerZIndex={layer.zIndex}
                        />
                    ))}

                    {/* Custom children */}
                    {children}
                </Suspense>
            </Canvas>
        </div>
    );
}

export { LayerStack } from './LayerStack';
export default ZEngine;
