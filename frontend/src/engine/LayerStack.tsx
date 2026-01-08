import { useRef, useMemo } from 'react';
import { useFrame, extend } from '@react-three/fiber';
import { shaderMaterial, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useZStore, Layer } from '../store/zStore';

// Custom depth blur shader material for glassmorphism
const DepthBlurMaterial = shaderMaterial(
    {
        uBlurAmount: 0,
        uOpacity: 1,
        uTime: 0,
        uColor: new THREE.Color('#1e1e3f'),
        uGlowColor: new THREE.Color('#6366f1'),
        uActiveGlow: 0,
    },
    // Vertex shader
    `
    varying vec2 vUv;
    varying vec3 vNormal;
    void main() {
        vUv = uv;
        vNormal = normal;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
    `,
    // Fragment shader with glassmorphism
    `
    uniform float uBlurAmount;
    uniform float uOpacity;
    uniform float uTime;
    uniform vec3 uColor;
    uniform vec3 uGlowColor;
    uniform float uActiveGlow;
    varying vec2 vUv;
    varying vec3 vNormal;
    
    void main() {
        // Base gradient
        vec3 color = mix(uColor, uColor * 1.2, vUv.y);
        
        // Animated subtle shimmer
        float shimmer = sin(vUv.x * 10.0 + uTime * 0.5) * 0.02 + 0.98;
        color *= shimmer;
        
        // Glow effect for active layer
        vec3 glow = uGlowColor * uActiveGlow * 0.3;
        color += glow;
        
        // Edge glow
        float edgeFactor = 1.0 - smoothstep(0.4, 0.5, abs(vUv.x - 0.5)) * (1.0 - smoothstep(0.4, 0.5, abs(vUv.y - 0.5)));
        color += uGlowColor * edgeFactor * uActiveGlow * 0.2;
        
        // Apply blur-based noise for depth perception
        float blur = uBlurAmount * 0.01;
        float noise = fract(sin(dot(vUv, vec2(12.9898, 78.233))) * 43758.5453) * blur;
        color += noise * 0.1;
        
        gl_FragColor = vec4(color, uOpacity);
    }
    `
);

extend({ DepthBlurMaterial });

// TypeScript declarations
declare global {
    namespace JSX {
        interface IntrinsicElements {
            depthBlurMaterial: JSX.IntrinsicElements['shaderMaterial'] & {
                uBlurAmount?: number;
                uOpacity?: number;
                uTime?: number;
                uColor?: THREE.Color;
                uGlowColor?: THREE.Color;
                uActiveGlow?: number;
            };
        }
    }
}

interface LayerPlaneProps {
    layer: Layer;
    depthScale?: number;
    children?: React.ReactNode;
    isActive?: boolean;
}

/**
 * Individual layer plane with depth-based blur and parallax
 */
export function LayerPlane({ layer, depthScale = 2, children, isActive = false }: LayerPlaneProps) {
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<THREE.ShaderMaterial>(null);
    const borderRef = useRef<THREE.Mesh>(null);
    const { currentZ } = useZStore();

    // Calculate depth-based values
    const depth = layer.zIndex;
    const distanceFromCamera = Math.abs(depth - currentZ);

    // Opacity decreases with distance
    const depthOpacity = Math.max(0.2, 1 - distanceFromCamera * 0.25);
    const finalOpacity = layer.opacity * depthOpacity;

    // Blur increases with distance (Prism effect)
    const depthBlur = Math.min(layer.blurIntensity + distanceFromCamera * 8, 50);

    // Animation
    useFrame(({ clock }) => {
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value = clock.elapsedTime;
            materialRef.current.uniforms.uBlurAmount.value = depthBlur;
            materialRef.current.uniforms.uOpacity.value = finalOpacity * 0.6;
            materialRef.current.uniforms.uActiveGlow.value = isActive ? 1 : 0;
        }

        // Parallax movement
        if (meshRef.current) {
            const parallaxFactor = 0.03 * layer.zIndex;
            meshRef.current.position.y = Math.sin(clock.elapsedTime * 0.3 + layer.zIndex) * parallaxFactor;
            meshRef.current.position.x = Math.cos(clock.elapsedTime * 0.2 + layer.zIndex) * parallaxFactor * 0.5;
        }

        // Border glow animation
        if (borderRef.current) {
            const mat = borderRef.current.material as THREE.MeshBasicMaterial;
            mat.opacity = isActive
                ? 0.4 + Math.sin(clock.elapsedTime * 2) * 0.1
                : Math.max(0, 0.15 - distanceFromCamera * 0.05);
        }
    });

    const geometry = useMemo(() => new THREE.PlaneGeometry(16, 9, 32, 32), []);

    return (
        <group position={[0, 0, -depth * depthScale]}>
            {/* Background plane with glassmorphism */}
            <mesh ref={meshRef} geometry={geometry}>
                <depthBlurMaterial
                    ref={materialRef}
                    transparent
                    side={THREE.DoubleSide}
                    uBlurAmount={depthBlur}
                    uOpacity={finalOpacity * 0.6}
                    uTime={0}
                    uColor={new THREE.Color('#1a1a2e')}
                    uGlowColor={new THREE.Color('#6366f1')}
                    uActiveGlow={isActive ? 1 : 0}
                />
            </mesh>

            {/* Glowing border frame */}
            <mesh ref={borderRef} position={[0, 0, 0.01]}>
                <planeGeometry args={[16.2, 9.2]} />
                <meshBasicMaterial
                    color={isActive ? '#8b5cf6' : '#6366f1'}
                    transparent
                    opacity={isActive ? 0.4 : 0.1}
                    side={THREE.DoubleSide}
                    wireframe
                />
            </mesh>

            {/* Layer label */}
            <Html
                position={[-7.5, 4.2, 0.1]}
                transform
                occlude
                style={{
                    transition: 'all 0.3s',
                    opacity: isActive ? 1 : 0.5,
                    transform: `scale(${isActive ? 1.1 : 1})`,
                }}
            >
                <div className={`
                    px-3 py-1 rounded-full text-xs font-medium
                    ${isActive
                        ? 'bg-aurora-primary/80 text-white shadow-lg shadow-purple-500/30'
                        : 'bg-white/10 text-white/60'
                    }
                `}>
                    {layer.name}
                </div>
            </Html>

            {/* Layer content (widgets) */}
            <group position={[0, 0, 0.02]}>
                {children}
            </group>
        </group>
    );
}

interface LayerStackProps {
    layers: Layer[];
    depthScale?: number;
}

/**
 * Renders all layers in the Z-axis stack with depth effects
 */
export function LayerStack({ layers, depthScale = 2 }: LayerStackProps) {
    const { currentZ } = useZStore();

    const sortedLayers = useMemo(
        () => [...layers].sort((a, b) => a.zIndex - b.zIndex),
        [layers]
    );

    return (
        <group>
            {sortedLayers.map((layer) => {
                const isActive = Math.abs(layer.zIndex - currentZ) < 0.5;
                return (
                    <LayerPlane
                        key={layer.id}
                        layer={layer}
                        depthScale={depthScale}
                        isActive={isActive}
                    />
                );
            })}
        </group>
    );
}

export default LayerStack;
