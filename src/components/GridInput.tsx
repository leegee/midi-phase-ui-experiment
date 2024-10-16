import React, { useCallback, useEffect, useRef, } from 'react';
import './GridInput.css';
import useMusicStore, { type GridNote } from '../store';
import { dispatchPlayNoteNowEvent } from '../events/dispatchPlayNoteNowEvent';

const GRID_PITCH_RANGE = 88;

interface GridInputProps {
    gridIndex: number;
}

const GridInput: React.FC<GridInputProps> = ({ gridIndex }) => {
    const { grids, updateNoteVelocity, setOrUpdateNoteInGrid } = useMusicStore();
    const grid = grids[gridIndex];
    const gridRef = useRef<HTMLDivElement | null>(null);
    const cellRefs = useRef<(HTMLDivElement | null)[][]>(
        Array.from({ length: GRID_PITCH_RANGE }, () => Array(grid ? grid.numColumns : 0).fill(null))
    );

    const toggleNote = useCallback(
        (pitch: number, beatIndex: number, velocity: number = 100) => {
            const grid = grids[gridIndex];

            const notes = grid.beats[beatIndex]?.notes || {};
            const existingNote = notes[pitch];

            if (existingNote) {
                // Remove the note if it exists
                delete notes[pitch];
                setOrUpdateNoteInGrid(gridIndex, beatIndex, { pitch, velocity: 0 });
            } else {
                // Add a new note if it doesn't exist
                const newNote: GridNote = { pitch, velocity };
                setOrUpdateNoteInGrid(gridIndex, beatIndex, newNote);
                dispatchPlayNoteNowEvent(pitch, velocity);
            }
        },
        [gridIndex, setOrUpdateNoteInGrid, grids]
    );

    const promptForVelocity = (defaultVelocity: number): number | null => {
        const input = prompt('Enter MIDI velocity (1-127):', defaultVelocity.toString());
        const parsedVelocity = parseInt(input || '', 10);

        if (!isNaN(parsedVelocity) && parsedVelocity >= 1 && parsedVelocity <= 127) {
            return parsedVelocity;
        }

        alert('Invalid velocity. Please enter a number between 1 and 127.');
        return null;
    };

    const handleMouseDown = (pitch: number, e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        const beatIndex = Number(e.currentTarget.dataset.beat);

        if (e.ctrlKey) {
            const grid = grids[gridIndex];
            const note = grid.beats[beatIndex]?.notes[pitch];

            if (note) {
                const newVelocity = promptForVelocity(note.velocity);

                if (newVelocity !== null) {
                    updateNoteVelocity(gridIndex, beatIndex, pitch, newVelocity);
                    dispatchPlayNoteNowEvent(pitch, newVelocity); // Optionally play the note with the new velocity
                }
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
                        const reversedPitchIndex = GRID_PITCH_RANGE - 1 - pitch; // Reverse the pitch index
                        const beatData = grid.beats[beat]; // Get the specific beat
                        const note = beatData ? beatData.notes[reversedPitchIndex] : undefined; // Access notes for that reversed pitch

                        return (
                            <div
                                key={`${reversedPitchIndex}-${beat}`} // Use the reversed pitch index
                                ref={el => (cellRefs.current[reversedPitchIndex][beat] = el)}
                                onMouseDown={(e) => handleMouseDown(reversedPitchIndex, e)} // Handle using the reversed index
                                className={`grid-cell ${note ? 'active' : ''}`}
                                data-beat={beat} // Store beat index in data attribute
                                style={{
                                    opacity: note ? calculateOpacity(note.velocity) : 1,
                                    ...(note ? { backgroundColor: grid.colour } : {}),
                                }}
                            />
                        );
                    })}
                </div>
            ))}
        </section>
    );
};

export default GridInput;
