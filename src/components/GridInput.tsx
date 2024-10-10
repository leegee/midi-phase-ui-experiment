// src/components/GridInput.tsx
import React, { useState, useEffect } from 'react';

import './GridInput.css';
import useMusicStore, { GridNote, Phrase } from '../store'; // Ensure Phrase is imported

const GRID_HEIGHT = 10; // Number of rows for MIDI pitches

interface GridInputProps {
    gridIndex: number;
}

const GridInput: React.FC<GridInputProps> = ({ gridIndex }) => {
    const { phrases, setPhrase } = useMusicStore();
    const phrase: Phrase | undefined = phrases[gridIndex];

    // Log the phrase notes for debugging, only if the phrase exists
    useEffect(() => {
        if (phrase) {
            console.log(`Phrase ${gridIndex + 1} notes:`, phrase.notes);
        } else {
            console.warn(`Phrase ${gridIndex + 1} is undefined.`);
        }
    }, [phrase, gridIndex]);

    // Local state to manage notes on the grid
    const [gridNotes, setGridNotes] = useState<boolean[][]>(
        Array(GRID_HEIGHT).fill(null).map(() => Array(phrase ? phrase.numColumns : 0).fill(false))
    );

    // Sync gridNotes with the phrase's notes when the phrase changes
    useEffect(() => {
        if (phrase) {
            const newGridNotes = Array(GRID_HEIGHT).fill(null).map(() => Array(phrase.numColumns).fill(false));
            phrase.notes.forEach(note => {
                newGridNotes[note.pitch][note.startTime] = true;
            });
            setGridNotes(newGridNotes);
        }
    }, [phrase]);

    // Function to toggle note presence on the grid
    const toggleNote = (pitch: number, beat: number) => {
        const newGridNotes = [...gridNotes];
        newGridNotes[pitch][beat] = !newGridNotes[pitch][beat];
        setGridNotes(newGridNotes);

        // Update the phrase in the store if phrase exists
        if (phrase) {
            const newNotes: GridNote[] = newGridNotes.flatMap((row, pitchIndex) =>
                row.map((isActive, beatIndex) => (isActive ? { pitch: pitchIndex, startTime: beatIndex } : null)).filter(Boolean) as GridNote[]
            );

            const updatedPhrase: Phrase = {
                notes: newNotes,
                numColumns: phrase.numColumns,
            };

            setPhrase(gridIndex, updatedPhrase);
        }
    };

    return (
        <div
            className="grid-container"
            style={{ gridTemplateColumns: `repeat(${phrase ? phrase.numColumns : 0}, var(--cell-size))` }}
        >
            {Array.from({ length: GRID_HEIGHT }).map((_, pitch) => (
                // Directly mapping the pitches to grid cells
                Array.from({ length: phrase ? phrase.numColumns : 0 }).map((_, beat) => (
                    <div
                        key={`${pitch}-${beat}`}
                        onClick={() => toggleNote(pitch, beat)}
                        className={`grid-cell ${gridNotes[pitch][beat] ? 'active' : ''}`}
                    />
                ))
            ))}
        </div>
    );
};

export default GridInput;
