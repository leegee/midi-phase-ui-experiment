// src/store.ts
import { create } from 'zustand';

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

export interface MergedBeat {
    notes: Record<number, GridNoteMerged>; // Merged notes indexed by pitch
}

export class Grid {
    beats: Beat[];
    numColumns: number;
    colour: string;

    constructor(numColumns: number, colour: string);
    constructor(params: { beats: { notes: Record<number, GridNote> }[]; numColumns: number; colour: string });

    constructor(arg: number | { beats: { notes: Record<number, GridNote> }[]; numColumns: number; colour: string }, colour?: string) {
        if (typeof arg === 'number') {
            this.numColumns = arg;
            this.beats = Array.from({ length: arg }, () => ({ notes: {} }));
            this.colour = colour || 'blue';
        } else {
            this.numColumns = arg.numColumns;
            this.beats = arg.beats;
            this.colour = arg.colour;
        }
    }

    clear() {
        this.beats = [];
    }

    setNumColumns(numColumns: number) {
        this.numColumns = numColumns;
    }

    updateNoteVelocity(beatIndex: number, pitch: number, velocity: number) {
        if (!this.beats[beatIndex]) {
            this.beats[beatIndex] = { notes: {} }; // Create the beat if it doesn't exist
        }

        const beat = this.beats[beatIndex];

        // Update the note velocity in the dictionary
        if (beat.notes[pitch]) {
            beat.notes[pitch].velocity = velocity;
        }
    }

    setOrUpdateNote(beatIndex: number, note: GridNote) {
        if (note.velocity === 0) {
            delete this.beats[beatIndex].notes[note.pitch];
        } else {
            if (!this.beats[beatIndex]) {
                this.beats[beatIndex] = { notes: {} };
            }
            this.beats[beatIndex].notes[note.pitch] = note;
        }
    }
}

export class MergedBeat {
    notes: Record<number, GridNoteMerged>;

    constructor() {
        this.notes = {};
    }

    mergeWithGridBeat(grid: Grid, beatIndex: number) {
        const beat = grid.beats[beatIndex];
        Object.entries(beat.notes).forEach(([pitch, note]) => {
            const numericPitch = Number(pitch);
            if (!this.notes[numericPitch]) {
                this.notes[numericPitch] = { ...note, colour: grid.colour };
            }
        });
    }
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

    grids: [
        new Grid(3, colours(1, 2)),
        new Grid(4, colours(2, 2)),
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
                newGrids[gridIndex].clear();
            }
            return { grids: newGrids };
        }),
    // Insert a new grid after the specified index
    addGrid: (insertAfterIndex: number, numColumns: number = 4) =>
        set((state) => {
            const newGrids = [...state.grids];
            newGrids.splice(insertAfterIndex + 1, 0, new Grid(numColumns, 'red'));
            newGrids.forEach((grid, index) => {
                grid.colour = colours(index, newGrids.length);
            });
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

    setNumColumns: (gridIndex: number, numColumns: number) =>
        set((state) => {
            const newGrids = [...state.grids];
            if (newGrids[gridIndex]) {
                newGrids[gridIndex].setNumColumns(numColumns);
            }
            return { grids: newGrids };
        }),

    updateNoteVelocity: (gridIndex: number, beatIndex: number, pitch: number, velocity: number) =>
        set((state) => {
            const newGrids = [...state.grids];
            newGrids[gridIndex].updateNoteVelocity(beatIndex, pitch, velocity);
            return { grids: newGrids };
        }),

    setOrUpdateNoteInGrid: (gridIndex: number, beatIndex: number, note: GridNote) =>
        set((state) => {
            const newGrids = [...state.grids];
            newGrids[gridIndex].setOrUpdateNote(beatIndex, note);
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

function colours(index: number, total: number): string {
    const hue = (index / total) * 360; // Calculate hue based on index
    return `hsl(${hue}, 100%, 50%)`;
}

export default useMusicStore;
