import React, { useEffect, useState } from 'react';
import useMusicStore, { Grid, GridNote, Beat } from '../store';

interface MergedBeat {
    notes: Record<number, GridNote>; // Merged notes indexed by pitch
}

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
        <div>
            <h2>Merged Notes </h2>
            <ul>
                {
                    mergedBeats.map((beat, beatIndex) => (
                        <li key={beatIndex} >
                            <strong>Beat {beatIndex + 1}: </strong>
                            <ul>
                                {
                                    Object.entries(beat.notes).map(([pitch, note]) => (
                                        <li key={pitch} >
                                            Pitch: {pitch}, Velocity: {note.velocity}
                                        </li>
                                    ))
                                }
                            </ul>
                        </li >
                    ))}
            </ul>
        </div>
    );
};

export default MergedGrid;
