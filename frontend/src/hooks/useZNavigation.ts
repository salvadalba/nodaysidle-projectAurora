import { useCallback, useEffect, useRef } from 'react';
import { useZStore } from '../store/zStore';

interface UseZNavigationOptions {
    scrollSensitivity?: number;
    snapToLayers?: boolean;
    animationDuration?: number;
    enableKeyboard?: boolean;
    enableWheel?: boolean;
}

const DEFAULT_OPTIONS: Required<UseZNavigationOptions> = {
    scrollSensitivity: 0.01,
    snapToLayers: true,
    animationDuration: 400,
    enableKeyboard: true,
    enableWheel: true,
};

export function useZNavigation(options: UseZNavigationOptions = {}) {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    const {
        currentZ,
        targetZ,
        layers,
        navigateToZ,
        setCurrentZ,
        setIsNavigating,
        zoomIn,
        zoomOut,
    } = useZStore();

    const animationRef = useRef<number | null>(null);
    const lastWheelTime = useRef<number>(0);

    // Animate Z position towards target
    useEffect(() => {
        const animate = () => {
            const current = useZStore.getState().currentZ;
            const target = useZStore.getState().targetZ;

            if (Math.abs(current - target) < 0.01) {
                setCurrentZ(target);
                setIsNavigating(false);
                return;
            }

            // Smooth interpolation (ease-out)
            const diff = target - current;
            const step = diff * 0.1; // Smooth factor
            setCurrentZ(current + step);

            animationRef.current = requestAnimationFrame(animate);
        };

        if (currentZ !== targetZ) {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            animationRef.current = requestAnimationFrame(animate);
        }

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [targetZ, currentZ, setCurrentZ, setIsNavigating]);

    // Handle wheel scroll
    const handleWheel = useCallback((e: WheelEvent) => {
        if (!opts.enableWheel) return;

        // Throttle wheel events
        const now = Date.now();
        if (now - lastWheelTime.current < 50) return;
        lastWheelTime.current = now;

        // Prevent default if not at bounds
        const maxZ = Math.max(...layers.map(l => l.zIndex), 0);
        const newZ = targetZ + (e.deltaY * opts.scrollSensitivity);

        if (newZ >= 0 && newZ <= maxZ) {
            e.preventDefault();
        }

        // Snap to layer or free scroll
        if (opts.snapToLayers) {
            const direction = e.deltaY > 0 ? 1 : -1;
            const currentLayerIndex = layers.findIndex(l => l.zIndex === Math.round(targetZ));
            const nextIndex = Math.max(0, Math.min(layers.length - 1, currentLayerIndex + direction));

            if (layers[nextIndex]) {
                navigateToZ(layers[nextIndex].zIndex);
            }
        } else {
            navigateToZ(Math.max(0, Math.min(maxZ, newZ)));
        }
    }, [layers, targetZ, navigateToZ, opts]);

    // Handle keyboard navigation
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (!opts.enableKeyboard) return;

        const maxZ = Math.max(...layers.map(l => l.zIndex), 0);

        switch (e.key) {
            case 'ArrowUp':
            case 'w':
                e.preventDefault();
                navigateToZ(Math.max(0, targetZ - 1));
                break;
            case 'ArrowDown':
            case 's':
                e.preventDefault();
                navigateToZ(Math.min(maxZ, targetZ + 1));
                break;
            case '+':
            case '=':
                e.preventDefault();
                zoomIn();
                break;
            case '-':
            case '_':
                e.preventDefault();
                zoomOut();
                break;
            case 'Home':
                e.preventDefault();
                navigateToZ(0);
                break;
            case 'End':
                e.preventDefault();
                navigateToZ(maxZ);
                break;
        }
    }, [layers, targetZ, navigateToZ, zoomIn, zoomOut, opts.enableKeyboard]);

    // Attach event listeners
    useEffect(() => {
        const element = document.body;

        if (opts.enableWheel) {
            element.addEventListener('wheel', handleWheel, { passive: false });
        }

        if (opts.enableKeyboard) {
            element.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            element.removeEventListener('wheel', handleWheel);
            element.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleWheel, handleKeyDown, opts.enableWheel, opts.enableKeyboard]);

    // Navigation helpers
    const goToSurface = useCallback(() => navigateToZ(0), [navigateToZ]);
    const goDeeper = useCallback(() => {
        const maxZ = Math.max(...layers.map(l => l.zIndex), 0);
        navigateToZ(Math.min(maxZ, Math.floor(targetZ) + 1));
    }, [layers, targetZ, navigateToZ]);
    const goShallower = useCallback(() => {
        navigateToZ(Math.max(0, Math.ceil(targetZ) - 1));
    }, [targetZ, navigateToZ]);

    return {
        currentZ,
        targetZ,
        goToSurface,
        goDeeper,
        goShallower,
        navigateToZ,
        zoomIn,
        zoomOut,
    };
}

export default useZNavigation;
