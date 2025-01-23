import React, { useCallback, useEffect, useRef } from 'react';
import throttle from 'lodash.throttle';

import './GridInput.css';
import useMusicStore, { type GridNote } from '../store';
import { dispatchPlayNoteNowEvent } from '../events/dispatchPlayNoteNowEvent';
import { Grid } from '../classes/Grid';

const GRID_PITCH_RANGE = 88;

interface GridInputProps {
    gridIndex: number;
}


const GridInput: React.FC<GridInputProps> = ({ gridIndex }) => {
    const { grids, setGrid, updateNoteVelocity, setOrUpdateNoteInGrid, deleteNoteFromGrid, defaultVelocity } = useMusicStore();
    const grid = grids[gridIndex];
    const gridRef = useRef<HTMLDivElement | null>(null);
    const cellRefs = useRef<(HTMLDivElement | null)[][]>(Array.from({ length: GRID_PITCH_RANGE }, () => Array(grid ? grid.numColumns : 0).fill(null)));

    const toggleNote = useCallback((pitch: number, beatIndex: number, velocity?: number | undefined) => {
        const grid = grids[gridIndex];

        const notes = grid.beats[beatIndex]?.notes || {};
        const existingNote = notes[pitch];

        if (existingNote) {
            if (velocity) {
                existingNote.velocity = velocity;
                updateNoteVelocity(gridIndex, beatIndex, pitch, velocity);
            } else {
                // Remove the note if it exists and CTRL is not pressed
                delete notes[pitch];
                deleteNoteFromGrid(gridIndex, beatIndex, pitch);
            }
        } else {
            // Add a new note if it does not exist
            const newNote: GridNote = { pitch, velocity: velocity || defaultVelocity };
            setOrUpdateNoteInGrid(gridIndex, beatIndex, newNote);
            dispatchPlayNoteNowEvent(pitch, velocity || defaultVelocity);
        }
    }, [defaultVelocity, gridIndex, setOrUpdateNoteInGrid, deleteNoteFromGrid, updateNoteVelocity, grids]);

    const handleMouseDown = (pitch: number, e: React.MouseEvent<HTMLDivElement>) => {
        const beatIndex = Number(e.currentTarget.dataset.beat);
        if (e.ctrlKey) {
            const velocity = Number(prompt('Enter new velocity (1-127)', defaultVelocity.toString()));
            if (velocity) {
                toggleNote(pitch, beatIndex, velocity);
            }
        } else {
            toggleNote(pitch, beatIndex);
        }
    };

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

        return () => {
            window.removeEventListener('SET_CURRENT_BEAT', handleCurrentBeatEvent as EventListener);
        };
    }, [grid]);

    const handleMouseMove = throttle((moveEvent: MouseEvent, initialX: number, initialNumColumns: number, grid: Grid) => {
        const deltaX = moveEvent.clientX - initialX;
        const newNumColumns = Math.max(1, initialNumColumns + Math.floor(deltaX / 20));

        if (newNumColumns !== initialNumColumns) {
            const updatedGrid = new Grid({
                beats: grid.beats.map((beat, index) => ({
                    ...beat,
                    notes: index < newNumColumns ? beat.notes : {},
                })),
                numColumns: newNumColumns,
                colour: grid.colour,
            });

            setGrid(gridIndex, updatedGrid);
        }
    }, 100);  // Throttle state updates to occur at most every 100ms

    const handleResizerMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        const initialX = e.clientX;
        const initialNumColumns = grid.numColumns;

        const mouseMoveHandler = (moveEvent: MouseEvent) => handleMouseMove(moveEvent, initialX, initialNumColumns, grid);

        const handleMouseUp = () => {
            window.removeEventListener('mousemove', mouseMoveHandler);
            window.removeEventListener('mouseup', handleMouseUp);
        };

        window.addEventListener('mousemove', mouseMoveHandler);
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
