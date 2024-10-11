// src/store.ts
import { create } from 'zustand';

export interface GridNote {
    pitch: number;
    startTime: number;
    velocity: number;
}

export interface Grid {
    notes: GridNote[];
    numColumns: number;
    currentBeat: number;
}

interface MusicState {
    bpm: number;
    setBPM: (newBPM: number) => void;

    grids: Grid[];
    setGrid: (gridIndex: number, grid: Grid) => void; // Specify that grid is of type Grid
    setNumColumns: (gridIndex: number, numColumns: number) => void;
    updateGridBeat: (gridIndex: number) => void;

    inputChannels: number[];
    setInputChannels: (channels: number[]) => void;

    outputChannel: number;
    setOutputChannel: (channel: number) => void;
}

// Create the store
const useMusicStore = create<MusicState>((set) => ({
    bpm: 120,
    setBPM: (newBPM: number) => set({ bpm: newBPM }), // Type for newBPM

    setNumColumns: (gridIndex, numColumns) =>
        set((state) => {
            const newGrids = [...state.grids];
            if (newGrids[gridIndex]) {
                newGrids[gridIndex].numColumns = numColumns;
            }
            return { grids: newGrids };
        }),

    grids: [
        { notes: [], numColumns: 3, currentBeat: 0, },
        { notes: [], numColumns: 4, currentBeat: 0, },
    ],
    setGrid: (gridIndex: number, grid: Grid) =>
        set((state) => {
            const newGrids = [...state.grids];
            newGrids[gridIndex] = grid;
            return { grids: newGrids };
        }),
    updateGridBeat: (gridIndex) => {
        set((state) => {
            const grid = state.grids[gridIndex];

            if (!grid) return state;

            const updatedGrids = [...state.grids];
            updatedGrids[gridIndex] = {
                ...grid,
                currentBeat: (grid.currentBeat + 1) % grid.numColumns,
            };

            return { grids: updatedGrids };
        });
    },

    inputChannels: [1],
    setInputChannels: (channels) => set({ inputChannels: channels }),

    outputChannel: 1,
    setOutputChannel: (channel) => set({ outputChannel: channel }),
}));

export default useMusicStore;
