import React, { useEffect, useRef } from 'react';
import './GridInput.css';
import useMusicStore, { GridNote, Grid } from '../store';

const GRID_PITCH_RANGE = 88;

interface GridInputProps {
    gridIndex: number;
}

const GridInput: React.FC<GridInputProps> = ({ gridIndex }) => {
    const { grids, setGrid } = useMusicStore();
    const grid = grids[gridIndex];
    const gridRef = useRef<HTMLDivElement | null>(null);
    const cellRefs = useRef<(HTMLDivElement | null)[][]>(Array.from({ length: GRID_PITCH_RANGE }, () => Array(grid ? grid.numColumns : 0).fill(null)));

    // Function to toggle note presence on the grid
    // Function to toggle note presence on the grid
    const toggleNote = (pitch: number, beat: number) => {
        const newNotes: GridNote[] = [...grid.notes];
        const noteIndex = newNotes.findIndex(note => note.pitch === pitch && note.startTime === beat);

        if (noteIndex > -1) {
            // Remove the note if it exists
            newNotes.splice(noteIndex, 1);
        } else {
            // Add a new note if it does not exist
            newNotes.push({ pitch, startTime: beat, velocity: 100 }); // Set a default velocity value
        }

        const updatedGrid: Grid = {
            notes: newNotes,
            numColumns: grid.numColumns,
        };

        setGrid(gridIndex, updatedGrid);
    };

    // Handle resizing the grid
    const handleResize = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!gridRef.current) return;

        const newWidth = e.clientX - gridRef.current.getBoundingClientRect().left;
        const cellSize = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--midi-grid-cell-size'));
        const newNumColumns = Math.floor(newWidth / cellSize);

        if (newNumColumns > 0) {
            const updatedGrid: Grid = {
                ...grid,
                numColumns: newNumColumns,
                notes: grid.notes.slice(0, newNumColumns) // adjust notes if needed
            };
            setGrid(gridIndex, updatedGrid);
        }
    };

    // Handle mouse down event for resizing
    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault(); // Prevent text selection

        const onMouseMove = (event: MouseEvent) => {
            handleResize(event as unknown as React.MouseEvent<HTMLDivElement>);
        };

        const onMouseUp = () => {
            // Cleanup event listeners
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };

        // Add event listeners for mouse move and mouse up
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    };

    // Highlight the current beat based on a custom event
    useEffect(() => {
        const handleCurrentBeatEvent = (event: CustomEvent) => {
            const currentBeat = Number(event.detail);
            console.log(currentBeat);

            // Clear previous highlights
            cellRefs.current.forEach(row => row.forEach(cell => {
                if (cell) {
                    cell.classList.remove('highlight');
                }
            }));

            // Highlight the current beat
            const beatToHighlight = currentBeat % (grid?.numColumns || 1);
            cellRefs.current.forEach(row => {
                const currentCell = row[beatToHighlight];
                if (currentCell) {
                    currentCell.classList.add('highlight');
                }
            });
        };

        window.addEventListener('SET_CURRENT_BEAT', handleCurrentBeatEvent as EventListener);

        // Cleanup event listener on unmount
        return () => {
            window.removeEventListener('SET_CURRENT_BEAT', handleCurrentBeatEvent as EventListener);
        };
    }, [grid]);

    return (
        <section className="grid-component" ref={gridRef}>
            {Array.from({ length: grid ? grid.numColumns : 0 }).map((_, beat) => (
                <div key={`column-${beat}`} className="grid-column">
                    {Array.from({ length: GRID_PITCH_RANGE }).map((_, pitch) => (
                        <div
                            key={`${pitch}-${beat}`}
                            ref={el => (cellRefs.current[pitch][beat] = el)}
                            onClick={() => toggleNote(pitch, beat)}
                            className={`grid-cell ${grid.notes.some(note => note.pitch === pitch && note.startTime === beat) ? 'active' : ''}`}
                        />
                    ))}
                </div>
            ))}
            <div className="resizer" onMouseDown={handleMouseDown} />
        </section>
    );
};

export default GridInput;
