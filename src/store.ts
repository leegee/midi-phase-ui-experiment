// src/store.ts
import { create } from 'zustand';

export interface GridNote {
    pitch: number;
    velocity: number;
}

export interface Beat {
    notes: Record<number, GridNote>; // Dictionary indexed by pitch
}

export interface Grid {
    beats: Beat[];     // An array of beats, each containing an object of notes indexed by pitch
    numColumns: number; // Represents the number of beats (columns)
}

interface MusicState {
    bpm: number;
    setBPM: (newBPM: number) => void;

    grids: Grid[];
    setGrid: (gridIndex: number, grid: Grid) => void;
    setNumColumns: (gridIndex: number, numColumns: number) => void;
    updateNoteVelocity: (gridIndex: number, beatIndex: number, pitch: number, velocity: number) => void;
    setOrUpdateNoteInGrid: (gridIndex: number, beatIndex: number, note: GridNote) => void;

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

    setOrUpdateNoteInGrid: (gridIndex: number, beatIndex: number, note: GridNote) =>
        set((state) => {
            const newGrids = [...state.grids];
            const selectedGrid = newGrids[gridIndex];

            console.log('setOrUpdateNoteInGrid grid', gridIndex, 'beatIndex', beatIndex, 'pitch', note.pitch, 'note', note)

            if (note.velocity === 0) {
                delete selectedGrid.beats[beatIndex].notes[note.pitch];
                console.log('setOrUpdateNoteInGrid deleted grid/beatIndex', gridIndex, '/', beatIndex, 'pitch', note.pitch);
            }
            else {
                // Ensure the beat exists
                console.log('setOrUpdateNoteInGrid added to grid ', gridIndex, 'beatIndex', beatIndex, 'pitch', note.pitch, 'note', note)
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

    inputChannels: Array.from({ length: 16 }, (_, index) => index),
    setInputChannels: (channels) => set({ inputChannels: channels }),

    outputChannel: 1,
    setOutputChannel: (channel) => set({ outputChannel: channel }),
}));

export default useMusicStore;
