import { useRef, useMemo } from 'react';
import { useFrame, extend } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { useZStore, Layer } from '../store/zStore';

// Custom depth blur shader material
const DepthBlurMaterial = shaderMaterial(
    {
        uTexture: null,
        uBlurAmount: 0,
        uOpacity: 1,
        uTime: 0,
    },
    // Vertex shader
    `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
    // Fragment shader with blur effect
    `
    uniform sampler2D uTexture;
    uniform float uBlurAmount;
    uniform float uOpacity;
    uniform float uTime;
    varying vec2 vUv;
    
    void main() {
      vec4 color = vec4(0.0);
      
      // Simple box blur for glassmorphism effect
      float blur = uBlurAmount * 0.01;
      
      if (blur > 0.0) {
        // 9-tap blur
        color += texture2D(uTexture, vUv + vec2(-blur, -blur)) * 0.0625;
        color += texture2D(uTexture, vUv + vec2(0.0, -blur)) * 0.125;
        color += texture2D(uTexture, vUv + vec2(blur, -blur)) * 0.0625;
        color += texture2D(uTexture, vUv + vec2(-blur, 0.0)) * 0.125;
        color += texture2D(uTexture, vUv) * 0.25;
        color += texture2D(uTexture, vUv + vec2(blur, 0.0)) * 0.125;
        color += texture2D(uTexture, vUv + vec2(-blur, blur)) * 0.0625;
        color += texture2D(uTexture, vUv + vec2(0.0, blur)) * 0.125;
        color += texture2D(uTexture, vUv + vec2(blur, blur)) * 0.0625;
      } else {
        color = texture2D(uTexture, vUv);
      }
      
      // Apply opacity
      color.a *= uOpacity;
      
      // Add subtle glow based on time
      float glow = sin(uTime * 0.5) * 0.02 + 0.98;
      color.rgb *= glow;
      
      gl_FragColor = color;
    }
  `
);

// Extend Three.js with our custom material
extend({ DepthBlurMaterial });

// TypeScript declarations
declare global {
    namespace JSX {
        interface IntrinsicElements {
            depthBlurMaterial: JSX.IntrinsicElements['shaderMaterial'] & {
                uTexture?: THREE.Texture | null;
                uBlurAmount?: number;
                uOpacity?: number;
                uTime?: number;
            };
        }
    }
}

interface LayerPlaneProps {
    layer: Layer;
    depthScale?: number;
    children?: React.ReactNode;
}

/**
 * Individual layer plane with depth-based blur
 */
export function LayerPlane({ layer, depthScale = 2, children }: LayerPlaneProps) {
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<THREE.ShaderMaterial>(null);
    const { currentZ } = useZStore();

    // Calculate depth-based values
    const depth = layer.zIndex;
    const distanceFromCamera = Math.abs(depth - currentZ);

    // Opacity decreases with distance
    const depthOpacity = Math.max(0.15, 1 - distanceFromCamera * 0.3);
    const finalOpacity = layer.opacity * depthOpacity;

    // Blur increases with distance (Prism effect)
    const depthBlur = Math.min(layer.blurIntensity + distanceFromCamera * 5, 50);

    // Animation
    useFrame(({ clock }) => {
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value = clock.elapsedTime;
            materialRef.current.uniforms.uBlurAmount.value = depthBlur;
            materialRef.current.uniforms.uOpacity.value = finalOpacity;
        }

        // Subtle parallax movement
        if (meshRef.current) {
            const parallaxFactor = 0.02 * layer.zIndex;
            meshRef.current.position.y = Math.sin(clock.elapsedTime * 0.5) * parallaxFactor;
        }
    });

    // Create glassmorphic background
    const geometry = useMemo(() => new THREE.PlaneGeometry(16, 9, 1, 1), []);

    return (
        <group position={[0, 0, -depth * depthScale]}>
            {/* Background plane with blur effect */}
            <mesh ref={meshRef} geometry={geometry}>
                <meshStandardMaterial
                    color="#1e1e3f"
                    transparent
                    opacity={finalOpacity * 0.4}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Layer border glow */}
            <mesh position={[0, 0, 0.001]}>
                <planeGeometry args={[16.1, 9.1]} />
                <meshBasicMaterial
                    color="#6366f1"
                    transparent
                    opacity={distanceFromCamera < 0.5 ? 0.3 - distanceFromCamera * 0.5 : 0}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Layer content */}
            <group position={[0, 0, 0.01]}>
                {children}
            </group>
        </group>
    );
}

interface LayerStackProps {
    layers: Layer[];
    depthScale?: number;
    renderWidget?: (widget: unknown, layerId: string) => React.ReactNode;
}

/**
 * Renders all layers in the Z-axis stack
 */
export function LayerStack({ layers, depthScale = 2 }: LayerStackProps) {
    const sortedLayers = useMemo(
        () => [...layers].sort((a, b) => a.zIndex - b.zIndex),
        [layers]
    );

    return (
        <group>
            {sortedLayers.map((layer) => (
                <LayerPlane key={layer.id} layer={layer} depthScale={depthScale}>
                    {/* Layer label */}
                    <LayerLabel layer={layer} />
                </LayerPlane>
            ))}
        </group>
    );
}

interface LayerLabelProps {
    layer: Layer;
}

/**
 * 3D label for layer identification
 */
function LayerLabel({ layer }: LayerLabelProps) {
    const { currentZ } = useZStore();
    const isActive = Math.abs(layer.zIndex - currentZ) < 0.5;

    return (
        <group position={[-7, 4, 0]}>
            <mesh>
                <planeGeometry args={[2.5, 0.5]} />
                <meshBasicMaterial
                    color={isActive ? '#6366f1' : '#2d2d5a'}
                    transparent
                    opacity={isActive ? 0.9 : 0.5}
                />
            </mesh>
        </group>
    );
}

export default LayerStack;
