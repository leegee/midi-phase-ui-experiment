import React, { useEffect, useRef } from 'react';
import './GridInput.css';
import useMusicStore from '../store';

const GRID_PITCH_RANGE = 88;

const calculateOpacity = (velocity: number) => {
    return velocity / 127;
};

const MergedGrid: React.FC = () => {
    // const gridRef = useRef<HTMLDivElement | null>(null);
    const { grids, mergedBeats, mergeGrids } = useMusicStore();
    const cellRefs = useRef<(HTMLDivElement | null)[][]>(
        Array.from({ length: GRID_PITCH_RANGE }, () => Array(mergedBeats.length).fill(null))
    );

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
            const beatToHighlight = currentBeat % mergedBeats.length;
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
    }, [mergedBeats.length]);

    useEffect(() => {
        if (grids.length > 0) {
            mergeGrids();
        }
    }, [grids, mergeGrids]);

    return (
        <section className="grid-component">
            {mergedBeats.map((beat, beatIndex) => (
                <div key={`column-${beatIndex}`} className="grid-column">
                    {Array.from({ length: GRID_PITCH_RANGE }).map((_, pitch) => {
                        const reversedPitchIndex = GRID_PITCH_RANGE - 1 - pitch;
                        const note = beat.notes[reversedPitchIndex];
                        return (
                            <div
                                key={`cell-${beatIndex}-${reversedPitchIndex}`}
                                ref={el => (cellRefs.current[reversedPitchIndex][beatIndex] = el)}
                                className={`grid-cell ${note ? 'active' : ''}`}
                                style={{
                                    opacity: note ? calculateOpacity(note.velocity) : 1,
                                    ...(note ? { backgroundColor: note.colour } : {}),
                                }}
                            />
                        );
                    })}
                </div>
            ))}
        </section>
    );
};

export default MergedGrid;
