import React, { useEffect, useRef, useState } from 'react';

import './GridInput.css';
import useMusicStore, { type Grid, type GridNote } from '../store';

const GRID_PITCH_RANGE = 88;

interface MergedBeat {
    notes: Record<number, GridNote>; // Merged notes indexed by pitch
}

const calculateOpacity = (velocity: number) => {
    return velocity / 127; // Normalize velocity to opacity range [0, 1]
};

// Helper function to merge notes from multiple grids for a given beat index
const mergeBeats = (grids: Grid[], beatIndex: number): MergedBeat => {
    const mergedNotes: Record<number, GridNote> = {};

    grids.forEach((grid) => {
        const beat = grid.beats[beatIndex];
        if (beat) {
            Object.entries(beat.notes).forEach(([pitch, note]) => {
                const numericPitch = Number(pitch);
                // If the note doesn't exist yet, add it; otherwise, keep the existing note
                if (!mergedNotes[numericPitch]) {
                    mergedNotes[numericPitch] = note;
                }
            });
        }
    });

    return { notes: mergedNotes };
};

const MergedGrid: React.FC = () => {
    const gridRef = useRef<HTMLDivElement | null>(null);
    const grids = useMusicStore((state) => state.grids);
    const [mergedBeats, setMergedBeats] = useState<MergedBeat[]>([]);

    useEffect(() => {
        // Find the maximum number of columns (beats) across all grids
        const maxBeats = Math.max(...grids.map((grid) => grid.numColumns));

        // Merge the notes for each beat
        const merged: MergedBeat[] = [];
        for (let i = 0; i < maxBeats; i++) {
            merged.push(mergeBeats(grids, i));
        }

        setMergedBeats(merged);
    }, [grids]);

    return (
        <section className="grid-component" ref={gridRef}>
            {mergedBeats.map((beat, beatIndex) => (
                <div key={`column-${beatIndex}`} className="grid-column">
                    {Array.from({ length: GRID_PITCH_RANGE }).map((_, pitch) => {
                        const note = beat.notes[pitch]; // Access the note for the current pitch

                        return (
                            <div
                                key={`cell-${beatIndex}-${pitch}`}
                                className={`grid-cell ${note ? 'active' : ''}`}
                                style={{ opacity: note ? calculateOpacity(note.velocity) : 1 }}
                            />
                        );
                    })}
                </div>
            ))}
        </section>
    );
};

export default MergedGrid;
