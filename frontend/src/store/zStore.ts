import { create } from 'zustand';

// Types
export interface Layer {
    id: string;
    zIndex: number;
    name: string;
    opacity: number;
    blurIntensity: number;
}

export interface VisualState {
    currentZ: number;
    targetZ: number;
    zoomLevel: number;
    focusedLayerId: string | null;
    isNavigating: boolean;
    transitionDuration: number;
}

export interface ZNavigationStore extends VisualState {
    // Layers
    layers: Layer[];
    setLayers: (layers: Layer[]) => void;

    // Z Navigation
    setCurrentZ: (z: number) => void;
    setTargetZ: (z: number) => void;
    navigateToLayer: (layerId: string) => void;
    navigateToZ: (z: number) => void;

    // Zoom
    setZoomLevel: (zoom: number) => void;
    zoomIn: () => void;
    zoomOut: () => void;

    // Focus
    setFocusedLayer: (layerId: string | null) => void;

    // Animation
    setIsNavigating: (isNavigating: boolean) => void;
    setTransitionDuration: (duration: number) => void;

    // Helpers
    getActiveLayer: () => Layer | undefined;
    getLayerAtZ: (z: number) => Layer | undefined;
    getLayerDepth: (layerId: string) => number;
}

// Constants
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2.0;
const DEFAULT_TRANSITION_MS = 400;

export const useZStore = create<ZNavigationStore>((set, get) => ({
    // Initial state
    currentZ: 0,
    targetZ: 0,
    zoomLevel: 1,
    focusedLayerId: null,
    isNavigating: false,
    transitionDuration: DEFAULT_TRANSITION_MS,
    layers: [],

    // Layers
    setLayers: (layers) => set({ layers }),

    // Z Navigation
    setCurrentZ: (z) => set({ currentZ: z }),
    setTargetZ: (z) => set({ targetZ: z }),

    navigateToLayer: (layerId) => {
        const { layers } = get();
        const layer = layers.find(l => l.id === layerId);
        if (layer) {
            set({
                targetZ: layer.zIndex,
                focusedLayerId: layerId,
                isNavigating: true,
            });
        }
    },

    navigateToZ: (z) => {
        const { layers } = get();
        // Clamp z to valid layer range
        const maxZ = Math.max(...layers.map(l => l.zIndex), 0);
        const clampedZ = Math.max(0, Math.min(z, maxZ));

        // Find closest layer
        let closestLayer: Layer | undefined;
        let minDistance = Infinity;

        for (const layer of layers) {
            const distance = Math.abs(layer.zIndex - clampedZ);
            if (distance < minDistance) {
                minDistance = distance;
                closestLayer = layer;
            }
        }

        set({
            targetZ: clampedZ,
            focusedLayerId: closestLayer?.id ?? null,
            isNavigating: true,
        });
    },

    // Zoom
    setZoomLevel: (zoom) => set({ zoomLevel: Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom)) }),
    zoomIn: () => {
        const { zoomLevel } = get();
        set({ zoomLevel: Math.min(MAX_ZOOM, zoomLevel + 0.1) });
    },
    zoomOut: () => {
        const { zoomLevel } = get();
        set({ zoomLevel: Math.max(MIN_ZOOM, zoomLevel - 0.1) });
    },

    // Focus
    setFocusedLayer: (layerId) => set({ focusedLayerId: layerId }),

    // Animation
    setIsNavigating: (isNavigating) => set({ isNavigating }),
    setTransitionDuration: (duration) => set({ transitionDuration: duration }),

    // Helpers
    getActiveLayer: () => {
        const { layers, currentZ } = get();
        return layers.find(l => l.zIndex === Math.round(currentZ));
    },

    getLayerAtZ: (z: number) => {
        const { layers } = get();
        // Find the layer at or before this Z
        return layers
            .filter(l => l.zIndex <= z)
            .sort((a, b) => b.zIndex - a.zIndex)[0];
    },

    getLayerDepth: (layerId: string) => {
        const { layers } = get();
        const layer = layers.find(l => l.id === layerId);
        return layer?.zIndex ?? 0;
    },
}));

export default useZStore;
