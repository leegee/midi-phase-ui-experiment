// src/store.ts
import { create } from 'zustand';

// Define types
export interface GridNote {
    pitch: number;
    startTime: number;
}

export interface Phrase {
    notes: GridNote[];
}

interface MusicState {
    bpm: number;
    setBPM: (newBPM: number) => void;
    phrases: Phrase[];
    setPhrase: (index: number, phrase: Phrase) => void;
}

// Create the store
const useMusicStore = create<MusicState>((set) => ({
    bpm: 120,
    setBPM: (newBPM) => set({ bpm: newBPM }),
    phrases: [{ notes: [] }], // Initialize with one empty phrase
    setPhrase: (index, phrase) =>
        set((state) => {
            const newPhrases = [...state.phrases];
            newPhrases[index] = phrase;
            return { phrases: newPhrases };
        }),
}));

export default useMusicStore;
