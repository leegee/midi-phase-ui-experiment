// src/store.ts
import { create } from 'zustand';

export interface GridNote {
    pitch: number;
    velocity: number;
}

export interface Beat {
    notes: Record<number, GridNote>; // Dictionary indexed by pitch
}

export interface MergedBeat {
    notes: Record<number, GridNote>; // Merged notes indexed by pitch
}

export interface Grid {
    beats: Beat[];
    numColumns: number;
}

interface MusicState {
    bpm: number;
    setBPM: (newBPM: number) => void;

    grids: Grid[];
    setGrid: (gridIndex: number, grid: Grid) => void;
    clearGrid: (gridIndex: number) => void;
    addGrid: (insertAfterIndex: number) => void;
    removeGrid: (gridIndex: number) => void;
    setNumColumns: (gridIndex: number, numColumns: number) => void;
    updateNoteVelocity: (gridIndex: number, beatIndex: number, pitch: number, velocity: number) => void;
    setOrUpdateNoteInGrid: (gridIndex: number, beatIndex: number, note: GridNote) => void;
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
    setBPM: (newBPM: number) => set({ bpm: newBPM }),

    setNumColumns: (gridIndex, numColumns) =>
        set((state) => {
            const newGrids = [...state.grids];
            if (newGrids[gridIndex]) {
                newGrids[gridIndex].numColumns = numColumns;
            }
            return { grids: newGrids };
        }),

    updateNoteVelocity: (gridIndex: number, beatIndex: number, pitch: number, velocity: number) =>
        set((state) => {
            const newGrids = [...state.grids];
            const selectedGrid = newGrids[gridIndex];

            // Ensure the beat exists
            if (!selectedGrid.beats[beatIndex]) {
                selectedGrid.beats[beatIndex] = { notes: {} }; // Create the beat if it doesn't exist
            }

            // Update the note velocity in the dictionary
            if (selectedGrid.beats[beatIndex].notes[pitch]) {
                selectedGrid.beats[beatIndex].notes[pitch].velocity = velocity;
            }

            return { grids: newGrids };
        }),

    grids: [
        { beats: [], numColumns: 3, },
        { beats: [], numColumns: 4, },
    ],
    setGrid: (gridIndex: number, grid: Grid) =>
        set((state) => {
            const newGrids = [...state.grids];
            newGrids[gridIndex] = grid;
            return { grids: newGrids };
        }),
    clearGrid: (gridIndex: number) =>
        set((state) => {
            const newGrids = [...state.grids];
            if (newGrids[gridIndex]) {
                newGrids[gridIndex].beats = [];
            }
            return { grids: newGrids };
        }),
    addGrid: (insertAfterIndex: number) =>
        set((state) => {
            const newGrids = [...state.grids];
            newGrids.splice(insertAfterIndex + 1, 0, { beats: [], numColumns: 4 });
            return { grids: newGrids };
        }),
    removeGrid: (gridIndex: number) =>
        set((state) => {
            const newGrids = [...state.grids];
            if (gridIndex >= 0 && gridIndex < newGrids.length) {
                newGrids.splice(gridIndex, 1);
            }
            return { grids: newGrids };
        }),

    setOrUpdateNoteInGrid: (gridIndex: number, beatIndex: number, note: GridNote) =>
        set((state) => {
            const newGrids = [...state.grids];
            const selectedGrid = newGrids[gridIndex];

            if (note.velocity === 0) {
                delete selectedGrid.beats[beatIndex].notes[note.pitch];
            }
            else {
                // Ensure the beat exists
                if (!selectedGrid.beats[beatIndex]) {
                    selectedGrid.beats[beatIndex] = { notes: {} };
                }

                selectedGrid.beats[beatIndex].notes[note.pitch] = note;
            }

            return { grids: newGrids };
        }),

    resetAllCurrentBeats: () => {
        set((state) => {
            const updatedGrids = state.grids.map((grid) => ({
                ...grid,
            }));
            return { grids: updatedGrids };
        });
    },

    mergedBeats: [],
    mergeGrids: () => set((state) => {
        const { grids } = state;

        if (grids.length === 0) return { mergedBeats: [] };

        const lcmBeats = grids.reduce((acc, grid) => lcm(acc, grid.numColumns), grids[0].numColumns);

        const merged: MergedBeat[] = [];
        for (let i = 0; i < lcmBeats; i++) {
            merged.push(mergeBeats(grids, i));
        }

        return { mergedBeats: merged };
    }),

    inputChannels: Array.from({ length: 16 }, (_, index) => index),
    setInputChannels: (channels) => set({ inputChannels: channels }),

    outputChannel: 1,
    setOutputChannel: (channel) => set({ outputChannel: channel }),
}));


const gcd = (a: number, b: number): number => {
    return b === 0 ? a : gcd(b, a % b);
};

const lcm = (a: number, b: number): number => {
    return (a * b) / gcd(a, b);
};

// Function to merge notes from multiple grids for a given beat index
const mergeBeats = (grids: Grid[], beatIndex: number): MergedBeat => {
    const mergedNotes: Record<number, GridNote> = {};

    grids.forEach((grid) => {
        const extendedBeatIndex = beatIndex % grid.numColumns;
        const beat = grid.beats[extendedBeatIndex];

        if (beat) {
            Object.entries(beat.notes).forEach(([pitch, note]) => {
                const numericPitch = Number(pitch);
                if (!mergedNotes[numericPitch]) {
                    mergedNotes[numericPitch] = note;
                }
            });
        }
    });

    return { notes: mergedNotes };
};

export default useMusicStore;
