import React, { useCallback, useEffect, useRef, useState } from 'react';
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

    const [isCtrlPressed, setIsCtrlPressed] = useState(false);
    const [draggingNote, setDraggingNote] = useState<GridNote | null>(null);

    // Function to toggle note presence on the grid
    const toggleNote = useCallback((pitch: number, beat: number, velocity: number = 100) => {
        const newNotes: GridNote[] = [...grid.notes];
        const noteIndex = newNotes.findIndex(note => note.pitch === pitch && note.startTime === beat);

        if (noteIndex > -1) {
            if (isCtrlPressed) {
                // Adjust velocity if CTRL is pressed
                newNotes[noteIndex].velocity = velocity;
            } else {
                // Remove the note if it exists
                newNotes.splice(noteIndex, 1);
            }
        } else {
            // Add a new note if it does not exist
            newNotes.push({ pitch, startTime: beat, velocity }); // Set the velocity
        }

        const updatedGrid: Grid = {
            notes: newNotes,
            numColumns: grid.numColumns,
        };

        setGrid(gridIndex, updatedGrid);
    }, [grid.notes, grid.numColumns, gridIndex, isCtrlPressed, setGrid]);

    const handleMouseDown = (pitch: number, beat: number, e: React.MouseEvent) => {
        if (e.ctrlKey) {
            setIsCtrlPressed(true);
            const note = grid.notes.find(note => note.pitch === pitch && note.startTime === beat);
            setDraggingNote(note || { pitch, startTime: beat, velocity: 100 });
        } else {
            toggleNote(pitch, beat);
        }
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (draggingNote && isCtrlPressed && gridRef.current) {
            const velocity = Math.max(0, Math.min(127, 127 - e.clientY / 4));
            toggleNote(draggingNote.pitch, draggingNote.startTime, velocity);
        }
    }, [draggingNote, isCtrlPressed, toggleNote]);

    const handleMouseUp = () => {
        setIsCtrlPressed(false);
        setDraggingNote(null);
    };

    // Set up event listeners for drag
    useEffect(() => {
        if (isCtrlPressed && draggingNote) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        } else {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isCtrlPressed, draggingNote, handleMouseMove]);

    const calculateOpacity = (velocity: number) => {
        return velocity / 127; // Normalize velocity to opacity range [0, 1]
    };

    // Highlight the current beat based on a custom event
    useEffect(() => {
        const handleCurrentBeatEvent = (event: CustomEvent) => {
            const currentBeat = Number(event.detail);

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
                    {Array.from({ length: GRID_PITCH_RANGE }).map((_, pitch) => {
                        const note = grid.notes.find(n => n.pitch === pitch && n.startTime === beat);
                        return (
                            <div
                                key={`${pitch}-${beat}`}
                                ref={el => (cellRefs.current[pitch][beat] = el)}
                                onMouseDown={(e) => handleMouseDown(pitch, beat, e)}
                                className={`grid-cell ${note ? 'active' : ''}`}
                                style={{ opacity: note ? calculateOpacity(note.velocity) : 1 }}
                            />
                        );
                    })}
                </div>
            ))}
            <div className="resizer" />
        </section>
    );
};

export default GridInput;
