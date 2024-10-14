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
}

interface MusicState {
    bpm: number;
    setBPM: (newBPM: number) => void;

    grids: Grid[];
    setGrid: (gridIndex: number, grid: Grid) => void;
    setNumColumns: (gridIndex: number, numColumns: number) => void;
    updateNoteVelocity: (gridIndex: number, noteIndex: number, velocity: number) => void;
    addNoteToGrid: (gridIndex: number, noteIndex: number, note: GridNote) => void;

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

    updateNoteVelocity: (gridIndex: number, noteIndex: number, velocity: number) =>
        set((state) => {
            const newGrids = [...state.grids];
            const selectedGrid = newGrids[gridIndex];

            const updatedNotes = selectedGrid.notes.map((note, index) =>
                index === noteIndex ? { ...note, velocity } : note
            );

            selectedGrid.notes = updatedNotes;
            return { grids: newGrids };
        }),

    grids: [
        { notes: [], numColumns: 3, },
        { notes: [], numColumns: 4, },
    ],
    setGrid: (gridIndex: number, grid: Grid) =>
        set((state) => {
            const newGrids = [...state.grids];
            newGrids[gridIndex] = grid;
            return { grids: newGrids };
        }),

    addNoteToGrid: (gridIndex, noteIndex, note) => set((state) => {
        const updatedNotes = [...state.grids[gridIndex].notes];

        // while (updatedNotes.length <= noteIndex) {
        //     updatedNotes.push({ pitch: 0, startTime: 0, velocity: 0 }); 
        // }

        updatedNotes[noteIndex] = note;

        const updatedGrid: Grid = {
            notes: updatedNotes,
            numColumns: state.grids[gridIndex].numColumns,
        };

        const newGrids = [...state.grids];
        newGrids[gridIndex] = updatedGrid;

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

    inputChannels: [1],
    setInputChannels: (channels) => set({ inputChannels: channels }),

    outputChannel: 1,
    setOutputChannel: (channel) => set({ outputChannel: channel }),
}));

export default useMusicStore;
