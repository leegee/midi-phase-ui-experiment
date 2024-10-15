import React, { useCallback, useEffect, useRef, useState } from 'react';

import './GridInput.css';
import useMusicStore, { type GridNote, Grid } from '../store';
import { dispatchPlayNoteNowEvent } from '../events/dispatchPlayNoteNowEvent';

const GRID_PITCH_RANGE = 88;

interface GridInputProps {
    gridIndex: number;
}

const debounce = (func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout | null = null;

    return (...args: any) => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }

        timeoutId = setTimeout(() => {
            func(...args);
        }, delay);
    };
};

const GridInput: React.FC<GridInputProps> = ({ gridIndex }) => {
    const { grids, setGrid, updateNoteVelocity, setOrUpdateNoteInGrid } = useMusicStore();
    const grid = grids[gridIndex];
    const gridRef = useRef<HTMLDivElement | null>(null);
    const cellRefs = useRef<(HTMLDivElement | null)[][]>(Array.from({ length: GRID_PITCH_RANGE }, () => Array(grid ? grid.numColumns : 0).fill(null)));

    const [isCtrlPressed, setIsCtrlPressed] = useState(false);
    const [draggingNote, setDraggingNote] = useState<GridNote | null>(null);

    const toggleNote = useCallback((pitch: number, beatIndex: number, velocity: number = 100) => {
        const grid = grids[gridIndex];

        const notes = grid.beats[beatIndex]?.notes || {};
        const existingNote = notes[pitch];

        if (existingNote) {
            if (isCtrlPressed) {
                // Adjust velocity if CTRL is pressed
                existingNote.velocity = velocity;
                updateNoteVelocity(gridIndex, beatIndex, pitch, velocity);
                dispatchPlayNoteNowEvent(pitch, velocity);
            } else {
                // Remove the note if it exists and CTRL is not pressed
                delete notes[pitch];
                setOrUpdateNoteInGrid(gridIndex, beatIndex, { pitch, velocity: 0 }); // Use a default velocity if needed
            }
        } else {
            // Add a new note if it does not exist
            const newNote: GridNote = { pitch, velocity };
            setOrUpdateNoteInGrid(gridIndex, beatIndex, newNote);
            dispatchPlayNoteNowEvent(pitch, velocity);
        }
    }, [isCtrlPressed, gridIndex, setOrUpdateNoteInGrid, updateNoteVelocity, grids]);

    const debouncedToggleNoteRef = useRef(debounce(toggleNote, 25));
    // Update the ref whenever toggleNote changes
    useEffect(() => {
        debouncedToggleNoteRef.current = debounce(toggleNote, 25);
    }, [toggleNote]);

    const handleMouseDown = (pitch: number, e: React.MouseEvent<HTMLDivElement>) => {
        const beatIndex = Number(e.currentTarget.dataset.beat);
        if (e.ctrlKey) {
            setIsCtrlPressed(true);

            // Access the current grid from the store
            const grid = grids[gridIndex];

            // Check if the note exists in the specified beat
            const note = grid.beats[beatIndex]?.notes[pitch];

            // Set dragging note to the existing note or create a new one
            setDraggingNote(note || { pitch, velocity: 75 });
        } else {
            toggleNote(pitch, beatIndex); // Call toggleNote with the updated signature
        }
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (draggingNote && isCtrlPressed) {
            if (!gridRef.current?.clientWidth) return;

            // Use the dragging note's pitch and calculate the velocity based on the mouse Y position
            const velocity = Math.max(0, Math.min(127, 127 - e.clientY / 4));

            // Instead of trying to find the beatIndex here, we can keep track of it when starting the drag
            const beatIndex = Math.floor(e.clientX / (gridRef.current?.clientWidth / grid.numColumns)); // Adjust based on your layout
            // toggleNote(draggingNote.pitch, beatIndex, velocity); // Use stored pitch from dragging note
            debouncedToggleNoteRef.current(draggingNote.pitch, beatIndex, velocity); // Use debounced function
        }
    }, [draggingNote, grid.numColumns, isCtrlPressed]);


    const handleMouseUp = () => {
        setIsCtrlPressed(false);
        setDraggingNote(null);
    };

    // Set up event listeners for drag
    useEffect(() => {
        if (isCtrlPressed && draggingNote) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
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

    const handleResizerMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        const initialX = e.clientX;
        const initialNumColumns = grid.numColumns;

        const handleMouseMove = (moveEvent: MouseEvent) => {
            const deltaX = moveEvent.clientX - initialX;
            const newNumColumns = Math.max(1, initialNumColumns + Math.floor(deltaX / 20));

            // Create a new grid based on the existing one, but with the updated number of columns
            const updatedGrid = new Grid({
                beats: grid.beats.map((beat, index) => ({
                    ...beat,
                    // Ensure that we create a new beat object if the index is less than the newNumColumns
                    notes: index < newNumColumns ? beat.notes : {},
                })),
                numColumns: newNumColumns,
                colour: grid.colour,
            });

            setGrid(gridIndex, updatedGrid);
        };

        const handleMouseUp = () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };

    return (
        <section className="grid-component" ref={gridRef}>
            {Array.from({ length: grid ? grid.numColumns : 0 }).map((_, beat) => (
                <div key={`column-${beat}`} className="grid-column">
                    {Array.from({ length: GRID_PITCH_RANGE }).map((_, pitch) => {
                        const reversedPitchIndex = GRID_PITCH_RANGE - 1 - pitch; // Reverse the pitch index
                        const beatData = grid.beats[beat]; // Get the specific beat
                        const note = beatData ? beatData.notes[reversedPitchIndex] : undefined; // Access notes for that reversed pitch

                        return (
                            <div
                                key={`${reversedPitchIndex}-${beat}`} // Use the reversed pitch index
                                ref={el => (cellRefs.current[reversedPitchIndex][beat] = el)}
                                onMouseDown={(e) => handleMouseDown(reversedPitchIndex, e)} // Handle using the reversed index
                                className={`grid-cell ${note ? 'active' : ''}`}
                                data-beat={beat} // Store beat index in data attribute for now, move to column later
                                style={{
                                    opacity: note ? calculateOpacity(note.velocity) : 1,
                                    ...(note ? { backgroundColor: grid.colour } : {}),
                                }}
                            />
                        );
                    })}
                </div>
            ))}
            <div title='Click and drag to add or remove columns' className="resizer" onMouseDown={handleResizerMouseDown} />
        </section>
    );

};

export default GridInput;
