// src/store.ts
import { create } from 'zustand';

// Define types
export interface GridNote {
    pitch: number;
    startTime: number;
}

export interface Phrase {
    notes: GridNote[];
    numColumns: number;
}

interface MusicState {
    bpm: number;
    setBPM: (newBPM: number) => void;
    phrases: Phrase[];
    setNumColumns: (gridIndex: number, numColumns: number) => void;
    setPhrase: (gridIndex: number, phrase: Phrase) => void; // Specify that phrase is of type Phrase
}

// Create the store
const useMusicStore = create<MusicState>((set) => ({
    bpm: 120,
    setBPM: (newBPM: number) => set({ bpm: newBPM }), // Type for newBPM
    phrases: [
        { notes: [], numColumns: 3 },
        { notes: [], numColumns: 4 },
    ],
    setNumColumns: (gridIndex, numColumns) =>
        set((state) => {
            const newPhrases = [...state.phrases];
            if (newPhrases[gridIndex]) {
                newPhrases[gridIndex].numColumns = numColumns;
            }
            return { phrases: newPhrases };
        }),
    setPhrase: (gridIndex: number, phrase: Phrase) =>
        set((state) => {
            const newPhrases = [...state.phrases];
            newPhrases[gridIndex] = phrase;
            return { phrases: newPhrases };
        }),
}));

export default useMusicStore;
