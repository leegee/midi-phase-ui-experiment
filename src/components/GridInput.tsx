import React, { useEffect, useRef } from 'react';
import './GridInput.css';
import useMusicStore, { GridNote, Grid } from '../store';

const GRID_PITCH_RANGE = 88;

interface GridInputProps {
    gridIndex: number;
}

const GridInput: React.FC<GridInputProps> = ({ gridIndex }) => {
    const { grids, setGrid } = useMusicStore();
    const grid: Grid | undefined = grids[gridIndex];

    const gridNotesRef = useRef<boolean[][]>(Array(GRID_PITCH_RANGE).fill(null).map(() => Array(grid ? grid.numColumns : 0).fill(false)));
    const cellRefs = useRef<(HTMLDivElement | null)[][]>(Array.from({ length: GRID_PITCH_RANGE }, () => Array(grid ? grid.numColumns : 0).fill(null)));

    // Sync gridNotes with the grid's notes when the grid changes
    useEffect(() => {
        if (grid) {
            const newGridNotes = Array(GRID_PITCH_RANGE).fill(null).map(() => Array(grid.numColumns).fill(false));
            grid.notes.forEach(note => {
                newGridNotes[note.pitch][note.startTime] = true;
            });
            gridNotesRef.current = newGridNotes;
        }
    }, [grid]);

    // Function to toggle note presence on the grid
    const toggleNote = (pitch: number, beat: number) => {
        const newGridNotes = [...gridNotesRef.current];
        newGridNotes[pitch][beat] = !newGridNotes[pitch][beat];

        if (grid) {
            const newNotes: GridNote[] = newGridNotes.flatMap((row, pitchIndex) =>
                row.map((isActive, beatIndex) => (isActive ? { pitch: pitchIndex, startTime: beatIndex } : null)).filter(Boolean) as GridNote[]
            );

            const updatedGrid: Grid = {
                notes: newNotes,
                numColumns: grid.numColumns,
            };

            setGrid(gridIndex, updatedGrid);
        }
    };

    // Listen for the SET_CURRENT_BEAT event and update the currentBeat state
    useEffect(() => {
        const handleCurrentBeatEvent = (event: CustomEvent<{ currentBeat: number }>) => {
            const currentBeat = Number(event.detail);
            // Clear previous highlights from all columns
            cellRefs.current.forEach(row => row.forEach(cell => {
                if (cell) {
                    cell.classList.remove('highlight');
                }
            }));

            // Highlight the entire beat column across all rows
            const beatToHighlight = currentBeat % (grid?.numColumns || 1);
            cellRefs.current.forEach(row => {
                const currentCell = row[beatToHighlight];
                if (currentCell) {
                    currentCell.classList.add('highlight');
                }
            });
        };

        window.addEventListener('SET_CURRENT_BEAT', handleCurrentBeatEvent as EventListener);

        return () => {
            window.removeEventListener('SET_CURRENT_BEAT', handleCurrentBeatEvent as EventListener);
        };
    }, [grid]);

    return (
        <section
            className="grid-component padded-container"
            style={{ gridTemplateColumns: `repeat(${grid ? grid.numColumns : 0}, var(--cell-size))` }}
        >
            {Array.from({ length: GRID_PITCH_RANGE }).map((_, pitch) => (
                Array.from({ length: grid ? grid.numColumns : 0 }).map((_, beat) => (
                    <div
                        key={`${pitch}-${beat}`}
                        ref={el => (cellRefs.current[pitch][beat] = el)}
                        onClick={() => toggleNote(pitch, beat)}
                        className={`grid-cell ${gridNotesRef.current[pitch][beat] ? 'active' : ''}`}
                    />
                ))
            ))}
        </section>
    );
};

export default GridInput;
