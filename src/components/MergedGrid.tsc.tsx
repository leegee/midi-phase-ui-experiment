import React, { useEffect, useRef } from 'react';
import './GridInput.css';
import useMusicStore from '../store';

const GRID_PITCH_RANGE = 88;

const calculateOpacity = (velocity: number) => {
    return velocity / 127; // Normalize velocity to opacity range [0, 1]
};

const MergedGrid: React.FC = () => {
    const gridRef = useRef<HTMLDivElement | null>(null);
    const { grids, mergedBeats, mergeGrids } = useMusicStore();

    useEffect(() => {
        if (grids.length > 0) {
            mergeGrids();
        }
    }, [grids, mergeGrids]);

    return (
        <section className="grid-component" ref={gridRef}>
            {mergedBeats.map((beat, beatIndex) => (
                <div key={`column-${beatIndex}`} className="grid-column">
                    {Array.from({ length: GRID_PITCH_RANGE }).map((_, pitch) => {
                        const reversedPitchIndex = GRID_PITCH_RANGE - 1 - pitch; // Reverse the pitch index
                        const note = beat.notes[reversedPitchIndex]; // Use reversed pitch index
                        return (
                            <div
                                key={`cell-${beatIndex}-${reversedPitchIndex}`} // Use reversed pitch index for key
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
