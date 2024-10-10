// src/components/GridInput.tsx
import React, { useState, useEffect } from 'react';
import useMusicStore, { GridNote, Phrase } from '../store'; // Ensure Phrase is imported

const GRID_HEIGHT = 10; // Number of rows for MIDI pitches (e.g., 0-127)
const GRID_WIDTH = 16;  // Number of columns for beats (e.g., 0-15)
const CELL_PT = 10;

interface GridInputProps {
    gridIndex: number;
}

const GridInput: React.FC<GridInputProps> = ({ gridIndex }) => {
    const { phrases, setPhrase } = useMusicStore();
    const phrase: Phrase | undefined = phrases[gridIndex]; // Access the phrase directly by index

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
        Array(GRID_HEIGHT).fill(null).map(() => Array(GRID_WIDTH).fill(false))
    );

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

            setPhrase(gridIndex, { notes: newNotes });
        }
    };

    return (
        <div>
            <h3>Phrase {gridIndex + 1}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${GRID_WIDTH}, ${CELL_PT}pt)` }}>
                {Array.from({ length: GRID_HEIGHT }).map((_, pitch) => (
                    // Directly mapping the pitches to grid cells
                    Array.from({ length: GRID_WIDTH }).map((_, beat) => (
                        <div
                            key={`${pitch}-${beat}`}
                            onClick={() => toggleNote(pitch, beat)}
                            style={{
                                width: `${CELL_PT}pt`,
                                height: `${CELL_PT}pt`,
                                backgroundColor: gridNotes[pitch][beat] ? 'lightblue' : 'lightgray',
                                border: '1px solid black',
                                cursor: 'pointer',
                                boxSizing: 'border-box',
                            }}
                        />
                    ))
                ))}
            </div>
        </div>
    );
};

export default GridInput;
