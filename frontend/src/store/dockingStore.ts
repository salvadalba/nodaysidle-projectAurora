import { create } from 'zustand';
import { Widget } from '../api/client';

export interface DockPosition {
    layerId: string;
    x: number;
    y: number;
}

export interface DragState {
    isDragging: boolean;
    widgetId: string | null;
    startPosition: { x: number; y: number } | null;
    currentPosition: { x: number; y: number } | null;
}

export interface DockingStore {
    // Widgets state
    widgets: Widget[];
    setWidgets: (widgets: Widget[]) => void;

    // Drag state
    dragState: DragState;
    startDrag: (widgetId: string, x: number, y: number) => void;
    updateDrag: (x: number, y: number) => void;
    endDrag: (targetLayerId?: string) => void;
    cancelDrag: () => void;

    // Docking actions
    dockWidget: (widgetId: string, layerId: string, position: { x: number; y: number }) => void;
    undockWidget: (widgetId: string) => void;
    moveWidget: (widgetId: string, position: { x: number; y: number }) => void;

    // Helpers
    getWidgetsByLayer: (layerId: string) => Widget[];
    getWidget: (widgetId: string) => Widget | undefined;
}

export const useDockingStore = create<DockingStore>((set, get) => ({
    widgets: [],

    setWidgets: (widgets) => set({ widgets }),

    dragState: {
        isDragging: false,
        widgetId: null,
        startPosition: null,
        currentPosition: null,
    },

    startDrag: (widgetId, x, y) => set({
        dragState: {
            isDragging: true,
            widgetId,
            startPosition: { x, y },
            currentPosition: { x, y },
        }
    }),

    updateDrag: (x, y) => set((state) => ({
        dragState: {
            ...state.dragState,
            currentPosition: { x, y },
        }
    })),

    endDrag: (targetLayerId) => {
        const { dragState, widgets } = get();
        if (!dragState.isDragging || !dragState.widgetId) {
            set({ dragState: { isDragging: false, widgetId: null, startPosition: null, currentPosition: null } });
            return;
        }

        if (targetLayerId && dragState.currentPosition) {
            // Dock to new layer
            set({
                widgets: widgets.map(w =>
                    w.id === dragState.widgetId
                        ? {
                            ...w,
                            is_docked: true,
                            docked_layer_id: targetLayerId,
                            layer_id: targetLayerId,
                            docked_position: {
                                x: (dragState.currentPosition!.x - window.innerWidth / 2) / 100,
                                y: (window.innerHeight / 2 - dragState.currentPosition!.y) / 100,
                            }
                        }
                        : w
                ),
                dragState: { isDragging: false, widgetId: null, startPosition: null, currentPosition: null }
            });
        } else {
            set({ dragState: { isDragging: false, widgetId: null, startPosition: null, currentPosition: null } });
        }
    },

    cancelDrag: () => set({
        dragState: { isDragging: false, widgetId: null, startPosition: null, currentPosition: null }
    }),

    dockWidget: (widgetId, layerId, position) => set((state) => ({
        widgets: state.widgets.map(w =>
            w.id === widgetId
                ? { ...w, is_docked: true, docked_layer_id: layerId, layer_id: layerId, docked_position: position }
                : w
        )
    })),

    undockWidget: (widgetId) => set((state) => ({
        widgets: state.widgets.map(w =>
            w.id === widgetId
                ? { ...w, is_docked: false, docked_layer_id: null }
                : w
        )
    })),

    moveWidget: (widgetId, position) => set((state) => ({
        widgets: state.widgets.map(w =>
            w.id === widgetId
                ? { ...w, docked_position: position }
                : w
        )
    })),

    getWidgetsByLayer: (layerId) => {
        return get().widgets.filter(w => w.layer_id === layerId || w.docked_layer_id === layerId);
    },

    getWidget: (widgetId) => {
        return get().widgets.find(w => w.id === widgetId);
    },
}));
