// src/components/GridInput.tsx
import React, { useState, useEffect } from 'react';

import './GridInput.css';
import useMusicStore, { GridNote, Grid } from '../store'; // Ensure Grid is imported

const GRID_HEIGHT = 88;

interface GridInputProps {
    gridIndex: number;
}

const GridInput: React.FC<GridInputProps> = ({ gridIndex }) => {
    const { grids, setGrid } = useMusicStore();
    const grid: Grid | undefined = grids[gridIndex];

    // useEffect(() => {
    //     if (grid) {
    //         console.log(`Grid ${gridIndex + 1} notes:`, grid.notes);
    //     } else {
    //         console.warn(`Grid ${gridIndex + 1} is undefined.`);
    //     }
    // }, [grid, gridIndex]);

    // Local state to manage notes on the grid
    const [gridNotes, setGridNotes] = useState<boolean[][]>(
        Array(GRID_HEIGHT).fill(null).map(() => Array(grid ? grid.numColumns : 0).fill(false))
    );

    // Sync gridNotes with the grid's notes when the grid changes
    useEffect(() => {
        if (grid) {
            const newGridNotes = Array(GRID_HEIGHT).fill(null).map(() => Array(grid.numColumns).fill(false));
            grid.notes.forEach(note => {
                newGridNotes[note.pitch][note.startTime] = true;
            });
            setGridNotes(newGridNotes);
        }
    }, [grid]);

    // Function to toggle note presence on the grid
    const toggleNote = (pitch: number, beat: number) => {
        const newGridNotes = [...gridNotes];
        newGridNotes[pitch][beat] = !newGridNotes[pitch][beat];
        setGridNotes(newGridNotes);

        // Update the grid in the store if grid exists
        if (grid) {
            const newNotes: GridNote[] = newGridNotes.flatMap((row, pitchIndex) =>
                row.map((isActive, beatIndex) => (isActive ? { pitch: pitchIndex, startTime: beatIndex } : null)).filter(Boolean) as GridNote[]
            );

            const updatedGrid: Grid = {
                notes: newNotes,
                numColumns: grid.numColumns,
                currentBeat: 0,
            };

            setGrid(gridIndex, updatedGrid);
        }
    };

    const currentBeat = grid?.currentBeat ?? 0;

    return (
        <section
            className="grid-component padded-container"
            style={{ gridTemplateColumns: `repeat(${grid ? grid.numColumns : 0}, var(--cell-size))` }}
        >
            {Array.from({ length: GRID_HEIGHT }).map((_, pitch) => (
                // Directly mapping the pitches to grid cells
                Array.from({ length: grid ? grid.numColumns : 0 }).map((_, beat) => (
                    <div
                        key={`${pitch}-${beat}`}
                        onClick={() => toggleNote(pitch, beat)}
                        className={`grid-cell ${gridNotes[pitch][beat] ? 'active' : ''} ${beat === currentBeat ? 'highlight' : ''}`}
                    />
                ))
            ))}
        </section>
    );
};

export default GridInput;
