import React, { useEffect, useRef, useState } from 'react';
import './GridInput.css';
import useMusicStore, { type Grid, type GridNote } from '../store';

// Function to calculate the greatest common divisor (GCD)
const gcd = (a: number, b: number): number => {
    return b === 0 ? a : gcd(b, a % b);
};

// Function to calculate the least common multiple (LCM)
const lcm = (a: number, b: number): number => {
    return (a * b) / gcd(a, b);
};

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
        // Extend grid pattern by repeating its beats based on its size
        const extendedBeatIndex = beatIndex % grid.numColumns;
        const beat = grid.beats[extendedBeatIndex];

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
    // const [mergedBeats, setMergedBeats] = useState<MergedBeat[]>([]);
    const setMergedBeats = useMusicStore((state) => state.setMergedBeats);
    const [mergedBeats, setMergedBeatsState] = useState<MergedBeat[]>([]);

    useEffect(() => {
        if (grids.length === 0) return;

        // Calculate LCM of number of columns (beats) across all grids
        const lcmBeats = grids.reduce((acc, grid) => lcm(acc, grid.numColumns), grids[0].numColumns);

        // Merge the notes for each beat across the extended LCM range
        const merged: MergedBeat[] = [];
        for (let i = 0; i < lcmBeats; i++) {
            merged.push(mergeBeats(grids, i));
        }

        setMergedBeatsState(merged);
        setMergedBeats(merged);

    }, [grids, setMergedBeats]);

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
