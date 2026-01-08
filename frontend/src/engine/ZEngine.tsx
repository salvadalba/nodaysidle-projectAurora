import { useEffect, Suspense, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera, Html, OrbitControls, Stars } from '@react-three/drei';
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
 * Camera controller that follows Z-navigation with smooth transitions
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

        // Camera moves along Z-axis based on current depth
        const targetCameraZ = baseCameraZ - (currentZ * depthScale);

        // Smooth camera transition
        cameraRef.current.position.z = THREE.MathUtils.lerp(
            cameraRef.current.position.z,
            targetCameraZ,
            0.08
        );

        // FOV based on zoom level - creates a "diving in" effect
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
                <div className="text-white animate-pulse text-lg">Loading Z-Engine...</div>
            </Html>
        </mesh>
    );
}

/**
 * Ambient particles for atmosphere
 */
function AmbientParticles() {
    const particlesRef = useRef<THREE.Points>(null);

    useFrame(({ clock }) => {
        if (particlesRef.current) {
            particlesRef.current.rotation.y = clock.elapsedTime * 0.02;
            particlesRef.current.rotation.x = Math.sin(clock.elapsedTime * 0.1) * 0.05;
        }
    });

    const particles = new Float32Array(500 * 3);
    for (let i = 0; i < 500 * 3; i += 3) {
        particles[i] = (Math.random() - 0.5) * 50;
        particles[i + 1] = (Math.random() - 0.5) * 30;
        particles[i + 2] = (Math.random() - 0.5) * 40;
    }

    return (
        <points ref={particlesRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={500}
                    array={particles}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.05}
                color="#6366f1"
                transparent
                opacity={0.4}
                sizeAttenuation
            />
        </points>
    );
}

interface WidgetsForLayerProps {
    widgets: Widget[];
    layerZIndex: number;
    depthScale?: number;
}

/**
 * Renders widgets positioned on a specific layer in a smart grid
 */
function WidgetsForLayer({ widgets, layerZIndex, depthScale = 2 }: WidgetsForLayerProps) {
    // Smart positioning based on docked_position or default grid
    const getWidgetPosition = useCallback((widget: Widget, index: number): [number, number, number] => {
        if (widget.docked_position && widget.is_docked) {
            return [widget.docked_position.x, widget.docked_position.y, 0.1];
        }
        // Default grid layout
        const col = index % 3;
        const row = Math.floor(index / 3);
        return [
            (col - 1) * 5,      // -5, 0, 5
            1.5 - row * 2.5,    // 1.5, -1, -3.5
            0.1
        ];
    }, []);

    return (
        <group position={[0, 0, -layerZIndex * depthScale + 0.15]}>
            {widgets.map((widget, index) => (
                <WidgetRenderer
                    key={widget.id}
                    widget={widget}
                    position={getWidgetPosition(widget, index)}
                    scale={0.9}
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
    enableControls?: boolean;
}

/**
 * Main Z-Engine canvas component - Complete 3D spatial dashboard engine
 */
export function ZEngine({
    children,
    className = '',
    widgets = [],
    onReady,
    enableControls = true
}: ZEngineProps) {
    const { layers } = useZStore();

    useEffect(() => {
        onReady?.();
    }, [onReady]);

    // Group widgets by layer
    const widgetsByLayer = widgets.reduce<Record<string, Widget[]>>((acc, widget) => {
        const layerId = widget.docked_layer_id || widget.layer_id;
        if (!acc[layerId]) {
            acc[layerId] = [];
        }
        acc[layerId].push(widget);
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
                    toneMapping: THREE.ACESFilmicToneMapping,
                    toneMappingExposure: 1.2,
                }}
                style={{ background: 'linear-gradient(180deg, #0a0a15 0%, #0f0f23 50%, #1a1a2e 100%)' }}
            >
                <Suspense fallback={<LoadingPlane />}>
                    {/* Camera with Z-navigation */}
                    <ZCameraController />

                    {/* Lighting setup for depth perception */}
                    <ambientLight intensity={0.4} />
                    <directionalLight position={[10, 10, 10]} intensity={0.6} color="#ffffff" />
                    <pointLight position={[-10, -10, 5]} intensity={0.4} color="#6366f1" />
                    <pointLight position={[0, 5, 5]} intensity={0.3} color="#8b5cf6" />
                    <pointLight position={[10, -5, 8]} intensity={0.2} color="#a855f7" />

                    {/* Ambient atmosphere */}
                    <Stars radius={50} depth={50} count={500} factor={2} saturation={0} fade />
                    <AmbientParticles />

                    {/* Fog for depth perception */}
                    <fog attach="fog" args={['#0a0a15', 15, 40]} />

                    {/* Layer stack with depth blur */}
                    <LayerStack layers={layers} depthScale={2} />

                    {/* Widgets on each layer */}
                    {layers.map((layer) => (
                        <WidgetsForLayer
                            key={layer.id}
                            widgets={widgetsByLayer[layer.id] || []}
                            layerZIndex={layer.zIndex}
                            depthScale={2}
                        />
                    ))}

                    {/* Optional orbit controls for exploration */}
                    {enableControls && (
                        <OrbitControls
                            enablePan={false}
                            enableZoom={false}
                            enableRotate={true}
                            maxPolarAngle={Math.PI / 2 + 0.3}
                            minPolarAngle={Math.PI / 2 - 0.3}
                            maxAzimuthAngle={0.3}
                            minAzimuthAngle={-0.3}
                        />
                    )}

                    {/* Custom children */}
                    {children}
                </Suspense>
            </Canvas>
        </div>
    );
}

export { LayerStack } from './LayerStack';
export default ZEngine;
