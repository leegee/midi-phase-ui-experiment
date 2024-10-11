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
    resetAllCurrentBeats: () => void;

    inputChannels: number[];
    setInputChannels: (channels: number[]) => void;

    outputChannel: number;
    setOutputChannel: (channel: number) => void;

    selectedInput: WebMidi.MIDIInput | null;
    setSelectedInput: (input: WebMidi.MIDIInput | null) => void;
    selectedOutput: WebMidi.MIDIOutput | null;
    setSelectedOutput: (output: WebMidi.MIDIOutput | null) => void;
    inputs: WebMidi.MIDIInput[];
    setInputs: (inputs: WebMidi.MIDIInput[]) => void;
    outputs: WebMidi.MIDIOutput[];
    setOutputs: (outputs: WebMidi.MIDIOutput[]) => void;
    error: string | null;
    setError: (error: string | null) => void;
}

// Create the store
const useMusicStore = create<MusicState>((set) => ({
    selectedInput: null,
    setSelectedInput: (input) => set({ selectedInput: input }),
    selectedOutput: null,
    setSelectedOutput: (output) => set({ selectedOutput: output }),
    inputs: [],
    setInputs: (inputs) => set({ inputs }),
    outputs: [],
    setOutputs: (outputs) => set({ outputs }),
    error: null,
    setError: (error) => set({ error }),

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
    resetAllCurrentBeats: () => {
        set((state) => {
            const updatedGrids = state.grids.map((grid) => ({
                ...grid,
                currentBeat: 0,
            }));
            return { grids: updatedGrids };
        });
    },

    inputChannels: [1],
    setInputChannels: (channels) => set({ inputChannels: channels }),

    outputChannel: 1,
    setOutputChannel: (channel) => set({ outputChannel: channel }),
}));

export default useMusicStore;
