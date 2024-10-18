// src/store.ts
import { create } from 'zustand';

import { Grid } from './classes/Grid';
import { MergedBeat } from './classes/MergedBeat';

export const SATURATION = 70;
export const LIGHTNESS = 50;

const MAX_HISTORY_ENTRIES = 30;
const INCLUDE_IN_HISTORY = ['bpm', 'grids'];

export interface GridNote {
    pitch: number;
    velocity: number;
}

export interface GridNoteMerged {
    pitch: number;
    velocity: number;
    colour: string;
}

export interface Beat {
    notes: Record<number, GridNote>; // Dictionary indexed by pitch
}

export interface MusicState {
    bpm: number;
    setBPM: (bpm: number) => void;
    defaultVelocity: number;
    setDefaultVelocity: (defaultVelocity: number) => void;

    grids: Grid[];
    setGrid: (gridIndex: number, grid: Grid) => void;
    clearGrid: (gridIndex: number) => void;
    addGrid: (insertAfterIndex: number) => void;
    removeGrid: (gridIndex: number) => void;
    setNumColumns: (gridIndex: number, numColumns: number) => void;
    updateNoteVelocity: (gridIndex: number, beatIndex: number, pitch: number, velocity: number) => void;
    setOrUpdateNoteInGrid: (gridIndex: number, beatIndex: number, note: GridNote) => void;
    deleteNoteFromGrid: (gridIndex: number, beatIndex: number, pitch: number) => void;

    mergedBeats: MergedBeat[];
    mergeGrids: () => void;

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

    undoStack: MusicState[];
    undo: () => void;
}

// Create the store
const useMusicStore = create<MusicState>((set, get) => ({
    bpm: 120,
    setBPM: (bpm: number) => set((state) => {
        pushToUndoStack();
        return { ...state, bpm };
    }),

    defaultVelocity: 75,
    setDefaultVelocity: (defaultVelocity: number) => set((state) => {
        pushToUndoStack();
        return { ...state, defaultVelocity };
    }),

    selectedInput: null,
    setSelectedInput: (selectedInput) => set((state) => {
        return { ...state, selectedInput };
    }),

    selectedOutput: null,
    setSelectedOutput: (selectedOutput) => set((state) => {
        return { ...state, selectedOutput }
    }),

    inputs: [],
    setInputs: (inputs) => set((state) => {
        return { ...state, inputs };
    }),

    outputs: [],
    setOutputs: (outputs) => set((state) => {
        return { ...state, outputs };
    }),

    error: null,
    setError: (error) => set((state) => ({ ...state, error })),

    grids: [
        new Grid(3, colours(1, 2)),
        new Grid(4, colours(2, 2)),
    ],
    setGrid: (gridIndex: number, grid: Grid) =>
        set((state) => {
            pushToUndoStack();
            const newGrids = [...state.grids];
            newGrids[gridIndex] = grid;
            return { grids: newGrids };
        }),
    clearGrid: (gridIndex: number) =>
        set((state) => {
            pushToUndoStack();
            const newGrids = [...state.grids];
            if (newGrids[gridIndex]) {
                newGrids[gridIndex].clear();
            }
            return { grids: newGrids };
        }),
    // Insert a new grid after the specified index
    addGrid: (insertAfterIndex: number, numColumns: number = 4) =>
        set((state) => {
            pushToUndoStack();
            const newGrids = [...state.grids];
            newGrids.splice(insertAfterIndex + 1, 0, new Grid(numColumns, 'red'));
            newGrids.forEach((grid, index) => {
                grid.colour = colours(index, newGrids.length);
            });
            return { grids: newGrids };
        }),
    removeGrid: (gridIndex: number) =>
        set((state) => {
            pushToUndoStack();
            const newGrids = [...state.grids];
            if (gridIndex >= 0 && gridIndex < newGrids.length) {
                newGrids.splice(gridIndex, 1);
            }
            return { grids: newGrids };
        }),

    setNumColumns: (gridIndex: number, numColumns: number) =>
        set((state) => {
            pushToUndoStack();
            const newGrids = [...state.grids];
            if (newGrids[gridIndex]) {
                newGrids[gridIndex].setNumColumns(numColumns);
            }
            return { grids: newGrids };
        }),

    updateNoteVelocity: (gridIndex: number, beatIndex: number, pitch: number, velocity: number) =>
        set((state) => {
            pushToUndoStack();
            const newGrids = [...state.grids];
            newGrids[gridIndex].updateNoteVelocity(beatIndex, pitch, velocity);
            return { grids: newGrids };
        }),

    setOrUpdateNoteInGrid: (gridIndex: number, beatIndex: number, note: GridNote) =>
        set((state) => {
            pushToUndoStack();
            const newGrids = [...state.grids];
            newGrids[gridIndex].setOrUpdateNote(beatIndex, note);
            return { grids: newGrids };
        }),

    deleteNoteFromGrid: (gridIndex: number, beatIndex: number, pitch: number) =>
        set((state) => {
            pushToUndoStack();
            const newGrids = [...state.grids];
            const grid = newGrids[gridIndex];
            if (grid) {
                const notes = grid.beats[beatIndex]?.notes || {};
                if (notes[pitch]) {
                    delete notes[pitch]; // Remove the note from the notes object
                    grid.beats[beatIndex].notes = { ...notes }; // Update the notes of the specific beat
                }
            }

            return { grids: newGrids };
        }),

    mergedBeats: [],
    mergeGrids: () => set((state) => {
        const { grids } = state;

        if (grids.length === 0) return { mergedBeats: [] };

        const lcmBeats = grids.reduce((acc, grid) => lcm(acc, grid.numColumns), grids[0].numColumns);

        const merged: MergedBeat[] = [];
        for (let i = 0; i < lcmBeats; i++) {
            const mergedBeat = new MergedBeat();
            grids.forEach(grid => {
                const extendedBeatIndex = i % grid.numColumns;
                const beat = grid.beats[extendedBeatIndex];
                if (beat) {
                    mergedBeat.mergeWithGridBeat(grid, extendedBeatIndex);
                }
            });
            merged.push(mergedBeat);
        }

        return { mergedBeats: merged };
    }),

    inputChannels: Array.from({ length: 16 }, (_, index) => index),
    setInputChannels: (channels) => {
        set({ inputChannels: channels })
    },

    outputChannel: 1,
    setOutputChannel: (channel) => {
        set({ outputChannel: channel })
    },

    undoStack: [],
    undo: () => {
        const { undoStack } = get();

        if (undoStack.length === 0) {
            console.warn("No state to undo.");
            return;
        }

        // Log the current state before undoing
        const currentState = Object.fromEntries(
            Object.entries(get()).filter(([key]) => INCLUDE_IN_HISTORY.includes(key))
        );

        console.log("Current state before undo:", currentState);

        const lastState = undoStack[undoStack.length - 1];

        // Restore the last state
        set((state) => {
            const newState = {
                ...state,
                ...lastState,
                undoStack: undoStack.slice(0, undoStack.length - 1), // Remove the last state from the stack
            };

            // Log the new state after undoing
            console.log("New state after undo:", newState);

            return newState;
        });
    },

}));


function pushToUndoStack() {
    console.log('called push to state');

    const stateToStore = Object.fromEntries(
        Object.entries(useMusicStore.getState()).filter(([key]) => INCLUDE_IN_HISTORY.includes(key))
    );

    useMusicStore.setState((state) => {
        const isIdentical = state.undoStack.length > 0 &&
            JSON.stringify(state.undoStack[state.undoStack.length - 1]) === JSON.stringify(stateToStore);

        if (!isIdentical) {
            const newUndoStack = [
                ...state.undoStack.slice(-MAX_HISTORY_ENTRIES + 1),
                JSON.parse(JSON.stringify(stateToStore)),
            ];

            console.log("Updated undo stack:", newUndoStack);

            return {
                undoStack: newUndoStack,
            };
        }

        // No change
        return state;
    });
}


const gcd = (a: number, b: number): number => {
    return b === 0 ? a : gcd(b, a % b);
};

const lcm = (a: number, b: number): number => {
    return (a * b) / gcd(a, b);
};

// Calculate hue based on index
function colours(index: number, total: number): string {
    const hue = (index / total) * 360;
    return `hsl(${hue}, ${SATURATION}%, ${LIGHTNESS}%)`;
}


export default useMusicStore;
